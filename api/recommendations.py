"""
Recommendations Router - API endpoints for recommendation management.

Endpoints:
- GET /recommendations - List recommendations with filters
- POST /recommendations/{id}/approve - Approve recommendation
- POST /recommendations/{id}/reject - Reject recommendation
- PATCH /recommendations/{id} - Modify recommendation
- POST /recommendations/{id}/flag - Flag for review
- POST /recommendations/bulk-approve - Bulk approve
- GET /recommendations/{id}/trace - Get decision trace
- GET /stats - Operator statistics
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
import sqlite3
import json

from database import get_db
from operator_actions import OperatorActions
from auth import verify_token, require_permission
import schemas


# ========================================================================
# Router Setup
# ========================================================================

router = APIRouter()


# ========================================================================
# Helper Functions
# ========================================================================

def get_current_operator_id() -> str:
    """
    DEPRECATED: Use verify_token dependency instead.
    
    This function is kept for backward compatibility but should not be used.
    Use the verify_token dependency in endpoint signatures.
    
    Returns:
        str: Placeholder operator ID
    """
    # Deprecated - use verify_token dependency
    return "op_001"


def format_recommendation_for_response(row: sqlite3.Row) -> dict:
    """
    Format database row as recommendation dict for API response.
    
    Args:
        row: SQLite row from recommendations table
        
    Returns:
        dict: Formatted recommendation
    """
    rec = dict(row)
    
    # Rename recommendation_id to id for frontend
    rec['id'] = rec.pop('recommendation_id', rec.get('id'))
    
    # Ensure all required fields exist with defaults
    rec.setdefault('type', 'article')
    rec.setdefault('status', 'pending')
    rec.setdefault('priority', 'medium')
    rec.setdefault('persona_primary', 'general')
    
    # Convert boolean fields (SQLite stores as 0/1)
    rec['tone_check'] = bool(rec.get('tone_check', 1))
    rec['advice_check'] = bool(rec.get('advice_check', 1))
    rec['eligibility_check'] = bool(rec.get('eligibility_check', 1))
    rec['guardrails_passed'] = bool(rec.get('guardrails_passed', 1))
    
    return rec


# ========================================================================
# GET RECOMMENDATIONS
# ========================================================================

@router.get("/recommendations", response_model=List[schemas.Recommendation])
def get_recommendations(
    status: Optional[str] = Query("pending", description="Filter by status (pending/approved/rejected/flagged/all)"),
    persona: Optional[str] = Query("all", description="Filter by persona"),
    priority: Optional[str] = Query("all", description="Filter by priority (high/medium/low/all)"),
    limit: int = Query(100, le=500, description="Maximum number of results"),
    operator: dict = Depends(verify_token),
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Get filtered list of recommendations.
    
    Query parameters:
    - status: Filter by status (default: pending)
    - persona: Filter by primary persona (default: all)
    - priority: Filter by priority (default: all)
    - limit: Maximum results (default: 100, max: 500)
    
    Returns:
        List of recommendations matching filters
    """
    cursor = db.cursor()
    
    # Build query with filters
    query = "SELECT * FROM recommendations WHERE 1=1"
    params = []
    
    if status and status != "all":
        query += " AND status = ?"
        params.append(status)
    
    if persona and persona != "all":
        query += " AND persona_primary = ?"
        params.append(persona)
    
    if priority and priority != "all":
        query += " AND priority = ?"
        params.append(priority)
    
    # Order by priority and creation date
    query += " ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END, created_at DESC"
    query += f" LIMIT {limit}"
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    
    # Format recommendations
    recommendations = []
    for row in rows:
        rec = format_recommendation_for_response(row)
        try:
            recommendations.append(schemas.Recommendation(**rec))
        except Exception as e:
            print(f"Warning: Could not validate recommendation {rec.get('id')}: {e}")
            continue
    
    return recommendations


# ========================================================================
# APPROVE RECOMMENDATION
# ========================================================================

@router.post("/recommendations/{recommendation_id}/approve")
def approve_recommendation(
    recommendation_id: str,
    request: schemas.ApproveRequest,
    operator: dict = Depends(verify_token),
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Approve a recommendation for delivery to user.
    
    Requirements:
    - Recommendation must exist
    - Status must be 'pending' or 'flagged'
    - Must have passed all guardrails
    - Operator must have 'approve' permission
    
    Body:
    - notes: Optional operator notes
    
    Returns:
        Approval confirmation with details
    """
    operator_id = operator["operator_id"]
    
    try:
        actions = OperatorActions(db)
        result = actions.approve_recommendation(
            operator_id=operator_id,
            recommendation_id=recommendation_id,
            notes=request.notes
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error approving recommendation: {str(e)}")


# ========================================================================
# REJECT RECOMMENDATION
# ========================================================================

@router.post("/recommendations/{recommendation_id}/reject")
def reject_recommendation(
    recommendation_id: str,
    request: schemas.RejectRequest,
    operator: dict = Depends(verify_token),
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Reject a recommendation (will not be sent to user).
    
    Requirements:
    - Recommendation must exist
    - Reason must be provided (min 10 characters)
    - Operator must have 'reject' permission
    
    Body:
    - reason: Reason for rejection (required)
    
    Returns:
        Rejection confirmation with details
    """
    operator_id = operator["operator_id"]
    
    try:
        actions = OperatorActions(db)
        result = actions.reject_recommendation(
            operator_id=operator_id,
            recommendation_id=recommendation_id,
            reason=request.reason
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error rejecting recommendation: {str(e)}")


# ========================================================================
# MODIFY RECOMMENDATION
# ========================================================================

@router.patch("/recommendations/{recommendation_id}")
def modify_recommendation(
    recommendation_id: str,
    request: schemas.ModifyRequest,
    operator: dict = Depends(require_permission("modify")),
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Modify recommendation fields before approval.
    
    Requires 'modify' permission (senior or admin role).
    
    Allowed modifications:
    - rationale: Update the personalized rationale
    - priority: Change priority (high/medium/low)
    - title: Update the title
    
    Requirements:
    - Recommendation must exist
    - Status must be 'pending' or 'flagged'
    - At least one field must be provided
    
    Returns:
        Modification confirmation with applied changes
    """
    operator_id = operator["operator_id"]
    
    # Extract only provided fields
    modifications = request.dict(exclude_unset=True)
    
    if not modifications:
        raise HTTPException(status_code=400, detail="No modifications provided")
    
    try:
        actions = OperatorActions(db)
        result = actions.modify_recommendation(
            operator_id=operator_id,
            recommendation_id=recommendation_id,
            modifications=modifications
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error modifying recommendation: {str(e)}")


# ========================================================================
# FLAG RECOMMENDATION
# ========================================================================

@router.post("/recommendations/{recommendation_id}/flag")
def flag_recommendation(
    recommendation_id: str,
    request: schemas.FlagRequest,
    operator: dict = Depends(require_permission("flag")),
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Flag recommendation for additional review.
    
    Requires 'flag' permission (senior or admin role).
    
    Use cases:
    - Unclear content appropriateness
    - Complex persona assignment
    - Requires senior operator review
    - Potential policy violation
    
    Requirements:
    - Recommendation must exist
    - Reason must be provided (min 10 characters)
    
    Body:
    - reason: Reason for flagging (required)
    
    Returns:
        Flag confirmation with flag_id
    """
    operator_id = operator["operator_id"]
    
    try:
        actions = OperatorActions(db)
        result = actions.flag_for_review(
            operator_id=operator_id,
            recommendation_id=recommendation_id,
            flag_reason=request.reason
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error flagging recommendation: {str(e)}")


# ========================================================================
# UNDO ACTION
# ========================================================================

@router.post("/recommendations/{recommendation_id}/undo")
def undo_recommendation(
    recommendation_id: str,
    operator: dict = Depends(verify_token),
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Undo the last action on a recommendation within 5-minute window.
    
    Allows operators to reverse accidental actions:
    - Approve → Restored to previous status
    - Reject → Restored to previous status
    - Flag → Restored to previous status
    
    Requirements:
    - Must be within 5 minutes of action
    - Recommendation must not be delivered
    - Only reverses status change (not modifications)
    
    Returns:
        Undo confirmation with restored status
    """
    operator_id = operator["operator_id"]
    
    try:
        actions = OperatorActions(db)
        result = actions.undo_action(
            operator_id=operator_id,
            recommendation_id=recommendation_id
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error undoing action: {str(e)}")


# ========================================================================
# BULK APPROVE
# ========================================================================

@router.post("/recommendations/bulk-approve", response_model=schemas.BulkApproveResponse)
def bulk_approve_recommendations(
    request: schemas.BulkApproveRequest,
    operator: dict = Depends(require_permission("bulk_approve")),
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Approve multiple recommendations at once.
    
    Requires 'bulk_approve' permission (senior or admin role).
    
    Safety features:
    - Validates each recommendation individually
    - Only approves if status='pending' and guardrails passed
    - Continues on individual failures
    - Returns detailed success/failure breakdown
    
    Requirements:
    - At least 1 recommendation ID (max 50 per request)
    - Each recommendation must be approvable
    
    Body:
    - recommendation_ids: List of IDs to approve
    - notes: Optional notes applied to all
    
    Returns:
        Summary with total, approved count, failed count, and details
    """
    operator_id = operator["operator_id"]
    
    if len(request.recommendation_ids) > 50:
        raise HTTPException(
            status_code=400, 
            detail="Cannot bulk approve more than 50 recommendations at once"
        )
    
    try:
        actions = OperatorActions(db)
        result = actions.bulk_approve(
            operator_id=operator_id,
            recommendation_ids=request.recommendation_ids,
            notes=request.notes
        )
        return schemas.BulkApproveResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in bulk approve: {str(e)}")


# ========================================================================
# GET OPERATOR STATS
# ========================================================================

@router.get("/stats", response_model=schemas.OperatorStats)
def get_operator_stats(
    operator_id: Optional[str] = Query(None, description="Filter stats by operator"),
    current_operator: dict = Depends(verify_token),
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Get operator dashboard statistics.
    
    Metrics:
    - pending: Number of pending recommendations
    - approved_today: Approved today count
    - rejected_today: Rejected today count
    - flagged: Currently flagged items count
    - avg_review_time_seconds: Average review time
    
    Query parameters:
    - operator_id: Optional filter for specific operator
    
    Returns:
        Statistics dictionary
    """
    try:
        actions = OperatorActions(db)
        stats = actions.get_operator_stats(operator_id)
        return schemas.OperatorStats(**stats)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")


# ========================================================================
# GET DECISION TRACE
# ========================================================================

@router.get("/recommendations/{recommendation_id}/trace")
def get_decision_trace(
    recommendation_id: str,
    operator: dict = Depends(verify_token),
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Get decision trace for a recommendation.
    
    The decision trace shows the AI decision-making process:
    - Behavioral signals detected
    - Persona assignment reasoning
    - Content matching process
    - Relevance scores
    - LLM configuration and usage
    - Timestamps for each pipeline step
    
    Requirements:
    - Recommendation must exist
    - Decision trace must exist
    
    Returns:
        Complete decision trace with all pipeline data
    """
    cursor = db.cursor()
    
    # Query decision trace
    cursor.execute("""
        SELECT * FROM decision_traces
        WHERE recommendation_id = ?
    """, (recommendation_id,))
    
    row = cursor.fetchone()
    
    if not row:
        raise HTTPException(
            status_code=404, 
            detail=f"Decision trace not found for recommendation {recommendation_id}"
        )
    
    # Convert to dict
    trace = dict(row)
    
    # Parse JSON fields
    try:
        trace['signals'] = json.loads(trace.pop('signals_json', '{}'))
        trace['persona_assignment'] = json.loads(trace.pop('persona_assignment_json', '{}'))
        trace['content_matches'] = json.loads(trace.pop('content_matches_json', '[]'))
        trace['relevance_scores'] = json.loads(trace.pop('relevance_scores_json', '{}'))
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error parsing decision trace JSON: {str(e)}"
        )
    
    return trace


# ========================================================================
# GET SINGLE RECOMMENDATION
# ========================================================================

@router.get("/recommendations/{recommendation_id}", response_model=schemas.Recommendation)
def get_recommendation(
    recommendation_id: str,
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Get a single recommendation by ID.
    
    Returns:
        Complete recommendation details
    """
    cursor = db.cursor()
    
    cursor.execute("""
        SELECT * FROM recommendations
        WHERE recommendation_id = ?
    """, (recommendation_id,))
    
    row = cursor.fetchone()
    
    if not row:
        raise HTTPException(
            status_code=404,
            detail=f"Recommendation {recommendation_id} not found"
        )
    
    rec = format_recommendation_for_response(row)
    return schemas.Recommendation(**rec)

