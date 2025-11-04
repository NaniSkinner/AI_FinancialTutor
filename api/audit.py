"""
Audit Router - API endpoints for audit log queries and compliance.

Endpoints:
- GET /audit-logs - Query audit logs with filters
- GET /audit-logs/{audit_id} - Get specific audit log entry
- GET /flags - Get flagged recommendations
- GET /flags/{flag_id} - Get specific flag details
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
import sqlite3
import json
from datetime import datetime, timedelta

from database import get_db
import schemas


# ========================================================================
# Router Setup
# ========================================================================

router = APIRouter()


# ========================================================================
# GET AUDIT LOGS
# ========================================================================

@router.get("/audit-logs")
def get_audit_logs(
    operator_id: Optional[str] = Query(None, description="Filter by operator"),
    action: Optional[str] = Query(None, description="Filter by action type"),
    start_date: Optional[str] = Query(None, description="Start date (ISO format)"),
    end_date: Optional[str] = Query(None, description="End date (ISO format)"),
    recommendation_id: Optional[str] = Query(None, description="Filter by recommendation"),
    limit: int = Query(100, le=1000, description="Maximum results"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Query audit logs with various filters.
    
    Use for:
    - Compliance reporting
    - Operator performance review
    - Error investigation
    - Quality assurance
    
    Query parameters:
    - operator_id: Filter by specific operator
    - action: Filter by action type (approve/reject/modify/flag/bulk_approve)
    - start_date: Filter from this date (ISO format)
    - end_date: Filter to this date (ISO format)
    - recommendation_id: Filter by recommendation
    - limit: Maximum results (default: 100, max: 1000)
    - offset: Pagination offset (default: 0)
    
    Returns:
        List of audit log entries with metadata
    """
    cursor = db.cursor()
    
    # Build query with filters
    query = "SELECT * FROM operator_audit_log WHERE 1=1"
    params = []
    
    if operator_id:
        query += " AND operator_id = ?"
        params.append(operator_id)
    
    if action:
        query += " AND action = ?"
        params.append(action)
    
    if recommendation_id:
        query += " AND recommendation_id = ?"
        params.append(recommendation_id)
    
    if start_date:
        query += " AND timestamp >= ?"
        params.append(start_date)
    
    if end_date:
        query += " AND timestamp <= ?"
        params.append(end_date)
    
    # Order by timestamp (newest first) and add pagination
    query += " ORDER BY timestamp DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    
    # Format results
    logs = []
    for row in rows:
        log = dict(row)
        
        # Parse metadata JSON
        try:
            metadata = json.loads(log.get('metadata', '{}'))
            log['metadata'] = metadata
        except json.JSONDecodeError:
            log['metadata'] = {}
        
        logs.append(log)
    
    # Get total count for pagination info
    count_query = "SELECT COUNT(*) as count FROM operator_audit_log WHERE 1=1"
    count_params = []
    
    if operator_id:
        count_query += " AND operator_id = ?"
        count_params.append(operator_id)
    if action:
        count_query += " AND action = ?"
        count_params.append(action)
    if recommendation_id:
        count_query += " AND recommendation_id = ?"
        count_params.append(recommendation_id)
    if start_date:
        count_query += " AND timestamp >= ?"
        count_params.append(start_date)
    if end_date:
        count_query += " AND timestamp <= ?"
        count_params.append(end_date)
    
    cursor.execute(count_query, count_params)
    total_count = cursor.fetchone()['count']
    
    return {
        'count': len(logs),
        'total': total_count,
        'limit': limit,
        'offset': offset,
        'logs': logs
    }


# ========================================================================
# GET SINGLE AUDIT LOG
# ========================================================================

@router.get("/audit-logs/{audit_id}")
def get_audit_log(
    audit_id: str,
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Get a specific audit log entry by ID.
    
    Path parameters:
    - audit_id: Audit log ID
    
    Returns:
        Complete audit log entry with metadata
    """
    cursor = db.cursor()
    
    cursor.execute("""
        SELECT * FROM operator_audit_log
        WHERE audit_id = ?
    """, (audit_id,))
    
    row = cursor.fetchone()
    
    if not row:
        raise HTTPException(
            status_code=404,
            detail=f"Audit log {audit_id} not found"
        )
    
    log = dict(row)
    
    # Parse metadata JSON
    try:
        log['metadata'] = json.loads(log.get('metadata', '{}'))
    except json.JSONDecodeError:
        log['metadata'] = {}
    
    return log


# ========================================================================
# GET OPERATOR ACTIVITY SUMMARY
# ========================================================================

@router.get("/audit-logs/operator/{operator_id}/summary")
def get_operator_activity_summary(
    operator_id: str,
    days: int = Query(30, le=365, description="Number of days to analyze"),
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Get activity summary for a specific operator.
    
    Provides:
    - Total actions by type
    - Actions per day
    - Most recent activity
    - Average actions per day
    
    Path parameters:
    - operator_id: Operator to analyze
    
    Query parameters:
    - days: Number of days to include (default: 30, max: 365)
    
    Returns:
        Operator activity summary
    """
    cursor = db.cursor()
    
    # Calculate start date
    start_date = (datetime.now() - timedelta(days=days)).isoformat()
    
    # Get action counts by type
    cursor.execute("""
        SELECT action, COUNT(*) as count
        FROM operator_audit_log
        WHERE operator_id = ?
          AND timestamp >= ?
        GROUP BY action
    """, (operator_id, start_date))
    
    action_counts = {row['action']: row['count'] for row in cursor.fetchall()}
    
    # Get total actions
    total_actions = sum(action_counts.values())
    
    # Get actions per day
    cursor.execute("""
        SELECT DATE(timestamp) as date, COUNT(*) as count
        FROM operator_audit_log
        WHERE operator_id = ?
          AND timestamp >= ?
        GROUP BY DATE(timestamp)
        ORDER BY date DESC
    """, (operator_id, start_date))
    
    actions_per_day = [
        {'date': row['date'], 'count': row['count']}
        for row in cursor.fetchall()
    ]
    
    # Get most recent action
    cursor.execute("""
        SELECT action, timestamp
        FROM operator_audit_log
        WHERE operator_id = ?
        ORDER BY timestamp DESC
        LIMIT 1
    """, (operator_id,))
    
    recent = cursor.fetchone()
    most_recent = dict(recent) if recent else None
    
    # Calculate average actions per day
    active_days = len(actions_per_day)
    avg_per_day = total_actions / days if days > 0 else 0
    
    return {
        'operator_id': operator_id,
        'period_days': days,
        'total_actions': total_actions,
        'actions_by_type': action_counts,
        'active_days': active_days,
        'avg_actions_per_day': round(avg_per_day, 2),
        'most_recent_action': most_recent,
        'daily_activity': actions_per_day
    }


# ========================================================================
# GET FLAGS
# ========================================================================

@router.get("/flags")
def get_flags(
    resolved: Optional[bool] = Query(None, description="Filter by resolved status"),
    flagged_by: Optional[str] = Query(None, description="Filter by operator who flagged"),
    limit: int = Query(50, le=500, description="Maximum results"),
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Get flagged recommendations.
    
    Query parameters:
    - resolved: Filter by resolved status (true/false/null for all)
    - flagged_by: Filter by operator who flagged
    - limit: Maximum results (default: 50, max: 500)
    
    Returns:
        List of flags with details
    """
    cursor = db.cursor()
    
    # Build query
    query = "SELECT * FROM recommendation_flags WHERE 1=1"
    params = []
    
    if resolved is not None:
        query += " AND resolved = ?"
        params.append(1 if resolved else 0)
    
    if flagged_by:
        query += " AND flagged_by = ?"
        params.append(flagged_by)
    
    query += " ORDER BY flagged_at DESC LIMIT ?"
    params.append(limit)
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    
    flags = [dict(row) for row in rows]
    
    # Convert boolean field
    for flag in flags:
        flag['resolved'] = bool(flag['resolved'])
    
    return {
        'count': len(flags),
        'flags': flags
    }


# ========================================================================
# GET SINGLE FLAG
# ========================================================================

@router.get("/flags/{flag_id}")
def get_flag(
    flag_id: str,
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Get details for a specific flag.
    
    Path parameters:
    - flag_id: Flag ID
    
    Returns:
        Flag details including related recommendation
    """
    cursor = db.cursor()
    
    # Get flag
    cursor.execute("""
        SELECT * FROM recommendation_flags
        WHERE flag_id = ?
    """, (flag_id,))
    
    flag_row = cursor.fetchone()
    
    if not flag_row:
        raise HTTPException(
            status_code=404,
            detail=f"Flag {flag_id} not found"
        )
    
    flag = dict(flag_row)
    flag['resolved'] = bool(flag['resolved'])
    
    # Get related recommendation
    cursor.execute("""
        SELECT recommendation_id, user_id, title, status, persona_primary
        FROM recommendations
        WHERE recommendation_id = ?
    """, (flag['recommendation_id'],))
    
    rec_row = cursor.fetchone()
    recommendation = dict(rec_row) if rec_row else None
    
    return {
        'flag': flag,
        'recommendation': recommendation
    }


# ========================================================================
# RESOLVE FLAG
# ========================================================================

@router.post("/flags/{flag_id}/resolve")
def resolve_flag(
    flag_id: str,
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Mark a flag as resolved.
    
    Path parameters:
    - flag_id: Flag ID to resolve
    
    Returns:
        Updated flag details
    """
    cursor = db.cursor()
    
    # Verify flag exists
    cursor.execute("""
        SELECT flag_id, resolved
        FROM recommendation_flags
        WHERE flag_id = ?
    """, (flag_id,))
    
    row = cursor.fetchone()
    
    if not row:
        raise HTTPException(
            status_code=404,
            detail=f"Flag {flag_id} not found"
        )
    
    if row['resolved']:
        raise HTTPException(
            status_code=400,
            detail=f"Flag {flag_id} is already resolved"
        )
    
    # Mark as resolved
    now = datetime.now().isoformat()
    operator_id = "op_001"  # TODO: Get from auth
    
    cursor.execute("""
        UPDATE recommendation_flags
        SET resolved = 1,
            resolved_by = ?,
            resolved_at = ?
        WHERE flag_id = ?
    """, (operator_id, now, flag_id))
    
    db.commit()
    
    return {
        'status': 'resolved',
        'flag_id': flag_id,
        'resolved_by': operator_id,
        'resolved_at': now
    }


# ========================================================================
# GET AUDIT STATISTICS
# ========================================================================

@router.get("/audit-logs/stats/overview")
def get_audit_statistics(
    days: int = Query(7, le=365, description="Number of days to analyze"),
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Get overall audit statistics and trends.
    
    Provides:
    - Total actions by type
    - Actions per operator
    - Busiest days
    - Action trends
    
    Query parameters:
    - days: Number of days to include (default: 7, max: 365)
    
    Returns:
        Comprehensive audit statistics
    """
    cursor = db.cursor()
    
    start_date = (datetime.now() - timedelta(days=days)).isoformat()
    
    # Total actions by type
    cursor.execute("""
        SELECT action, COUNT(*) as count
        FROM operator_audit_log
        WHERE timestamp >= ?
        GROUP BY action
        ORDER BY count DESC
    """, (start_date,))
    
    actions_by_type = {row['action']: row['count'] for row in cursor.fetchall()}
    
    # Actions per operator
    cursor.execute("""
        SELECT operator_id, COUNT(*) as count
        FROM operator_audit_log
        WHERE timestamp >= ?
        GROUP BY operator_id
        ORDER BY count DESC
    """, (start_date,))
    
    actions_by_operator = [
        {'operator_id': row['operator_id'], 'count': row['count']}
        for row in cursor.fetchall()
    ]
    
    # Busiest days
    cursor.execute("""
        SELECT DATE(timestamp) as date, COUNT(*) as count
        FROM operator_audit_log
        WHERE timestamp >= ?
        GROUP BY DATE(timestamp)
        ORDER BY count DESC
        LIMIT 10
    """, (start_date,))
    
    busiest_days = [
        {'date': row['date'], 'count': row['count']}
        for row in cursor.fetchall()
    ]
    
    # Total actions
    total_actions = sum(actions_by_type.values())
    
    return {
        'period_days': days,
        'total_actions': total_actions,
        'actions_by_type': actions_by_type,
        'actions_by_operator': actions_by_operator,
        'busiest_days': busiest_days,
        'avg_actions_per_day': round(total_actions / days, 2) if days > 0 else 0
    }

