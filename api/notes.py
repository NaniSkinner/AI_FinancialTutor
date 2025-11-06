"""
Operator Notes API - Persistent, Editable Notes System
=======================================================

Provides endpoints for operators to add, edit, view, and delete notes
on recommendations for collaboration and documentation.

Features:
- Multiple notes per recommendation
- Edit and delete capabilities
- Operator attribution
- Timestamp tracking

Endpoints:
- GET /recommendations/{id}/notes - List notes for a recommendation
- POST /recommendations/{id}/notes - Add a new note
- PATCH /notes/{note_id} - Update an existing note
- DELETE /notes/{note_id} - Delete a note
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
from datetime import datetime
from database import get_db
from auth import verify_token


router = APIRouter()


# ============================================================================
# Request/Response Models
# ============================================================================

class NoteCreate(BaseModel):
    """Request model for creating a note"""
    note_text: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "note_text": "This recommendation needs senior review before approval."
            }
        }


class NoteUpdate(BaseModel):
    """Request model for updating a note"""
    note_text: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "note_text": "Updated: Verified with compliance team, looks good to approve."
            }
        }


class NoteResponse(BaseModel):
    """Response model for a note"""
    note_id: str
    recommendation_id: str
    operator_id: str
    note_text: str
    created_at: str
    updated_at: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "note_id": "note_rec_001_1699200000",
                "recommendation_id": "rec_001",
                "operator_id": "op_001",
                "note_text": "This recommendation looks good but check tone.",
                "created_at": "2025-11-05T15:30:00Z",
                "updated_at": None
            }
        }


# ============================================================================
# API Endpoints
# ============================================================================

@router.get(
    "/recommendations/{recommendation_id}/notes",
    response_model=List[NoteResponse],
    summary="Get notes for a recommendation",
    description="Retrieve all notes associated with a specific recommendation, sorted by creation date (newest first)"
)
def get_notes(
    recommendation_id: str,
    operator = Depends(verify_token),
    db = Depends(get_db)
):
    """
    Get all notes for a recommendation.
    
    Args:
        recommendation_id: The recommendation ID
        operator: Current operator (from JWT)
        db: Database connection
        
    Returns:
        List of notes sorted by creation date (newest first)
    """
    cursor = db.cursor()
    
    # Verify recommendation exists
    cursor.execute(
        "SELECT recommendation_id FROM recommendations WHERE recommendation_id = ?",
        (recommendation_id,)
    )
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Recommendation not found")
    
    # Get all notes for this recommendation
    cursor.execute("""
        SELECT 
            note_id,
            recommendation_id,
            operator_id,
            note_text,
            created_at,
            updated_at
        FROM recommendation_notes
        WHERE recommendation_id = ?
        ORDER BY created_at DESC
    """, (recommendation_id,))
    
    notes = cursor.fetchall()
    
    # Convert to dict format
    return [
        {
            "note_id": note['note_id'],
            "recommendation_id": note['recommendation_id'],
            "operator_id": note['operator_id'],
            "note_text": note['note_text'],
            "created_at": note['created_at'],
            "updated_at": note['updated_at']
        }
        for note in notes
    ]


@router.post(
    "/recommendations/{recommendation_id}/notes",
    response_model=NoteResponse,
    summary="Add a new note",
    description="Create a new note for a recommendation. Notes are visible to all operators."
)
def create_note(
    recommendation_id: str,
    note_data: NoteCreate,
    operator = Depends(verify_token),
    db = Depends(get_db)
):
    """
    Add a new note to a recommendation.
    
    Args:
        recommendation_id: The recommendation ID
        note_data: Note content
        operator: Current operator (from JWT)
        db: Database connection
        
    Returns:
        The created note
    """
    cursor = db.cursor()
    
    # Verify recommendation exists
    cursor.execute(
        "SELECT recommendation_id FROM recommendations WHERE recommendation_id = ?",
        (recommendation_id,)
    )
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Recommendation not found")
    
    # Validate note text
    if not note_data.note_text.strip():
        raise HTTPException(status_code=400, detail="Note text cannot be empty")
    
    if len(note_data.note_text) > 5000:
        raise HTTPException(status_code=400, detail="Note text too long (max 5000 characters)")
    
    # Generate note ID
    timestamp = int(datetime.now().timestamp())
    note_id = f"note_{recommendation_id}_{timestamp}"
    operator_id = operator["operator_id"]
    now = datetime.now().isoformat()
    
    # Insert note
    cursor.execute("""
        INSERT INTO recommendation_notes
        (note_id, recommendation_id, operator_id, note_text, created_at)
        VALUES (?, ?, ?, ?, ?)
    """, (note_id, recommendation_id, operator_id, note_data.note_text, now))
    
    db.commit()
    
    return {
        "note_id": note_id,
        "recommendation_id": recommendation_id,
        "operator_id": operator_id,
        "note_text": note_data.note_text,
        "created_at": now,
        "updated_at": None
    }


@router.patch(
    "/notes/{note_id}",
    response_model=NoteResponse,
    summary="Update a note",
    description="Edit an existing note. Only the operator who created the note can edit it."
)
def update_note(
    note_id: str,
    note_data: NoteUpdate,
    operator = Depends(verify_token),
    db = Depends(get_db)
):
    """
    Update an existing note.
    
    Args:
        note_id: The note ID
        note_data: Updated note content
        operator: Current operator (from JWT)
        db: Database connection
        
    Returns:
        The updated note
    """
    cursor = db.cursor()
    
    # Get existing note
    cursor.execute("""
        SELECT note_id, recommendation_id, operator_id, note_text, created_at
        FROM recommendation_notes
        WHERE note_id = ?
    """, (note_id,))
    
    note = cursor.fetchone()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    # Check permission - only note creator or admin can edit
    operator_id = operator["operator_id"]
    operator_role = operator.get("role", "junior")
    
    if note['operator_id'] != operator_id and operator_role != "admin":
        raise HTTPException(
            status_code=403,
            detail="You can only edit your own notes (or be an admin)"
        )
    
    # Validate note text
    if not note_data.note_text.strip():
        raise HTTPException(status_code=400, detail="Note text cannot be empty")
    
    if len(note_data.note_text) > 5000:
        raise HTTPException(status_code=400, detail="Note text too long (max 5000 characters)")
    
    # Update note
    now = datetime.now().isoformat()
    cursor.execute("""
        UPDATE recommendation_notes
        SET note_text = ?, updated_at = ?
        WHERE note_id = ?
    """, (note_data.note_text, now, note_id))
    
    db.commit()
    
    return {
        "note_id": note['note_id'],
        "recommendation_id": note['recommendation_id'],
        "operator_id": note['operator_id'],
        "note_text": note_data.note_text,
        "created_at": note['created_at'],
        "updated_at": now
    }


@router.delete(
    "/notes/{note_id}",
    summary="Delete a note",
    description="Delete a note. Only the operator who created the note or an admin can delete it."
)
def delete_note(
    note_id: str,
    operator = Depends(verify_token),
    db = Depends(get_db)
):
    """
    Delete a note.
    
    Args:
        note_id: The note ID
        operator: Current operator (from JWT)
        db: Database connection
        
    Returns:
        Success confirmation
    """
    cursor = db.cursor()
    
    # Get existing note
    cursor.execute("""
        SELECT operator_id FROM recommendation_notes WHERE note_id = ?
    """, (note_id,))
    
    note = cursor.fetchone()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    # Check permission - only note creator or admin can delete
    operator_id = operator["operator_id"]
    operator_role = operator.get("role", "junior")
    
    if note['operator_id'] != operator_id and operator_role != "admin":
        raise HTTPException(
            status_code=403,
            detail="You can only delete your own notes (or be an admin)"
        )
    
    # Delete note
    cursor.execute("DELETE FROM recommendation_notes WHERE note_id = ?", (note_id,))
    db.commit()
    
    return {
        "deleted": True,
        "note_id": note_id
    }


# ============================================================================
# Additional Endpoints
# ============================================================================

@router.get(
    "/notes/operator/{operator_id}",
    response_model=List[NoteResponse],
    summary="Get notes by operator",
    description="Retrieve all notes created by a specific operator"
)
def get_notes_by_operator(
    operator_id: str,
    limit: int = 50,
    operator = Depends(verify_token),
    db = Depends(get_db)
):
    """
    Get all notes created by a specific operator.
    
    Args:
        operator_id: The operator ID
        limit: Maximum number of notes to return (default: 50)
        operator: Current operator (from JWT)
        db: Database connection
        
    Returns:
        List of notes by this operator
    """
    cursor = db.cursor()
    
    cursor.execute("""
        SELECT 
            note_id,
            recommendation_id,
            operator_id,
            note_text,
            created_at,
            updated_at
        FROM recommendation_notes
        WHERE operator_id = ?
        ORDER BY created_at DESC
        LIMIT ?
    """, (operator_id, limit))
    
    notes = cursor.fetchall()
    
    return [
        {
            "note_id": note['note_id'],
            "recommendation_id": note['recommendation_id'],
            "operator_id": note['operator_id'],
            "note_text": note['note_text'],
            "created_at": note['created_at'],
            "updated_at": note['updated_at']
        }
        for note in notes
    ]

