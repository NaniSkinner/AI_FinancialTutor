"""
Tags Management API
===================

Manages tags for recommendations, allowing operators to categorize
and organize recommendations for better tracking and analysis.

Endpoints:
- GET /tags/available - List all predefined tags
- GET /recommendations/{id}/tags - List tags for a recommendation
- POST /recommendations/{id}/tags - Add tag to a recommendation
- DELETE /tags/{tag_id} - Remove a tag
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
import sqlite3
from datetime import datetime
from typing import List, Optional
import uuid

from database import get_db
from auth import verify_token

router = APIRouter()

# Predefined tag categories
PREDEFINED_TAGS = [
    "needs_review",
    "edge_case",
    "training_example",
    "policy_question",
    "tone_concern",
    "eligibility_question",
    "llm_error",
    "great_example",
]

# Tag display names for better UX
TAG_DISPLAY_NAMES = {
    "needs_review": "Needs Review",
    "edge_case": "Edge Case",
    "training_example": "Training Example",
    "policy_question": "Policy Question",
    "tone_concern": "Tone Concern",
    "eligibility_question": "Eligibility Question",
    "llm_error": "LLM Error",
    "great_example": "Great Example",
}

# Pydantic models
class TagCreate(BaseModel):
    tag_name: str = Field(..., description="Tag name from predefined list")

class TagResponse(BaseModel):
    tag_id: str
    recommendation_id: str
    tag_name: str
    tagged_by: str
    tagged_at: str

    class Config:
        orm_mode = True

class AvailableTagsResponse(BaseModel):
    tags: List[str]
    display_names: dict

# Helper to convert sqlite row to dict
def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

# ========================================================================
# API Endpoints
# ========================================================================

@router.get(
    "/tags/available",
    response_model=AvailableTagsResponse,
    summary="Get all available predefined tags",
    description="Returns the list of predefined tag categories that can be applied to recommendations."
)
async def get_available_tags():
    """
    Returns all predefined tags with their display names.
    These are the only tags that can be applied to recommendations.
    """
    return {
        "tags": PREDEFINED_TAGS,
        "display_names": TAG_DISPLAY_NAMES
    }

@router.get(
    "/recommendations/{recommendation_id}/tags",
    response_model=List[TagResponse],
    summary="Get all tags for a recommendation",
    description="Returns all tags currently applied to a specific recommendation, ordered by creation date (newest first)."
)
async def get_tags_for_recommendation(
    recommendation_id: str,
    operator: dict = Depends(verify_token),
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Retrieves all tags associated with a recommendation.
    Requires authentication but no specific permissions.
    """
    cursor = db.cursor()
    cursor.row_factory = dict_factory
    
    try:
        cursor.execute("""
            SELECT tag_id, recommendation_id, tag_name, tagged_by, tagged_at
            FROM recommendation_tags
            WHERE recommendation_id = ?
            ORDER BY tagged_at DESC
        """, (recommendation_id,))
        
        tags = cursor.fetchall()
        return tags
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve tags: {str(e)}"
        )

@router.post(
    "/recommendations/{recommendation_id}/tags",
    response_model=TagResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a tag to a recommendation",
    description="Adds a tag from the predefined list to a recommendation. Prevents duplicate tags."
)
async def add_tag_to_recommendation(
    recommendation_id: str,
    tag_data: TagCreate,
    operator: dict = Depends(verify_token),
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Adds a tag to a recommendation.
    
    Validation:
    - Tag must be from predefined list
    - Tag cannot already exist on this recommendation
    - Recommendation must exist
    """
    tag_name = tag_data.tag_name
    operator_id = operator["operator_id"]
    
    # Validate tag name
    if tag_name not in PREDEFINED_TAGS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid tag. Must be one of: {', '.join(PREDEFINED_TAGS)}"
        )
    
    cursor = db.cursor()
    cursor.row_factory = dict_factory
    
    try:
        # Verify recommendation exists
        cursor.execute(
            "SELECT recommendation_id FROM recommendations WHERE recommendation_id = ?",
            (recommendation_id,)
        )
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Recommendation not found"
            )
        
        # Check if tag already exists
        cursor.execute("""
            SELECT tag_id FROM recommendation_tags
            WHERE recommendation_id = ? AND tag_name = ?
        """, (recommendation_id, tag_name))
        
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tag '{tag_name}' already exists on this recommendation"
            )
        
        # Create tag
        tag_id = str(uuid.uuid4())
        now = datetime.now().isoformat()
        
        cursor.execute("""
            INSERT INTO recommendation_tags
            (tag_id, recommendation_id, tag_name, tagged_by, tagged_at)
            VALUES (?, ?, ?, ?, ?)
        """, (tag_id, recommendation_id, tag_name, operator_id, now))
        
        db.commit()
        
        return TagResponse(
            tag_id=tag_id,
            recommendation_id=recommendation_id,
            tag_name=tag_name,
            tagged_by=operator_id,
            tagged_at=now
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add tag: {str(e)}"
        )

@router.delete(
    "/tags/{tag_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove a tag",
    description="Removes a tag from a recommendation. Any operator can remove any tag."
)
async def delete_tag(
    tag_id: str,
    operator: dict = Depends(verify_token),
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Removes a tag from a recommendation.
    Any authenticated operator can remove any tag.
    """
    cursor = db.cursor()
    
    try:
        # Check if tag exists
        cursor.execute("SELECT tag_id FROM recommendation_tags WHERE tag_id = ?", (tag_id,))
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tag not found"
            )
        
        # Delete tag
        cursor.execute("DELETE FROM recommendation_tags WHERE tag_id = ?", (tag_id,))
        db.commit()
        
        return {"message": "Tag deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete tag: {str(e)}"
        )

@router.get(
    "/tags/by-operator/{operator_id}",
    response_model=List[TagResponse],
    summary="Get all tags created by a specific operator",
    description="Returns all tags created by a given operator, ordered by creation date (newest first)."
)
async def get_tags_by_operator(
    operator_id: str,
    current_operator: dict = Depends(verify_token),
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Retrieves all tags created by a specific operator.
    Useful for tracking operator tagging activity.
    """
    cursor = db.cursor()
    cursor.row_factory = dict_factory
    
    try:
        cursor.execute("""
            SELECT tag_id, recommendation_id, tag_name, tagged_by, tagged_at
            FROM recommendation_tags
            WHERE tagged_by = ?
            ORDER BY tagged_at DESC
        """, (operator_id,))
        
        tags = cursor.fetchall()
        return tags
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve tags: {str(e)}"
        )

@router.get(
    "/tags/statistics",
    summary="Get tag usage statistics",
    description="Returns statistics about tag usage across all recommendations."
)
async def get_tag_statistics(
    operator: dict = Depends(verify_token),
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Returns statistics about tag usage.
    Useful for understanding which tags are most commonly used.
    """
    cursor = db.cursor()
    cursor.row_factory = dict_factory
    
    try:
        # Count tags by name
        cursor.execute("""
            SELECT tag_name, COUNT(*) as count
            FROM recommendation_tags
            GROUP BY tag_name
            ORDER BY count DESC
        """)
        tag_counts = cursor.fetchall()
        
        # Total tags
        cursor.execute("SELECT COUNT(*) as total FROM recommendation_tags")
        total_tags = cursor.fetchone()["total"]
        
        # Recommendations with tags
        cursor.execute("""
            SELECT COUNT(DISTINCT recommendation_id) as count
            FROM recommendation_tags
        """)
        tagged_recommendations = cursor.fetchone()["count"]
        
        return {
            "total_tags": total_tags,
            "tagged_recommendations": tagged_recommendations,
            "tag_counts": tag_counts,
            "available_tags": PREDEFINED_TAGS
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve statistics: {str(e)}"
        )

