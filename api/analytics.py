"""
Analytics API
==============

Provides analytics and insights for operator performance, recommendation trends,
and system health.

Endpoints:
- GET /analytics - Comprehensive analytics dashboard data
- GET /analytics/operators/{operator_id} - Individual operator analytics
"""

from fastapi import APIRouter, Depends, Query
from datetime import datetime, timedelta
import sqlite3
from typing import Optional

from database import get_db
from auth import verify_token

router = APIRouter()

# Helper to convert sqlite row to dict
def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

@router.get(
    "/analytics",
    summary="Get comprehensive analytics dashboard data",
    description="Returns analytics data including operator performance, recommendation trends, and system health metrics."
)
async def get_analytics(
    start_date: Optional[str] = Query(None, description="Start date (ISO format)"),
    end_date: Optional[str] = Query(None, description="End date (ISO format)"),
    operator: dict = Depends(verify_token),
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Returns comprehensive analytics including:
    - Total actions count
    - Approval rate
    - Actions by type breakdown
    - Actions timeline (daily)
    - Operator activity leaderboard
    - Approval rate by persona
    - Current queue size
    """
    
    # Default to last 30 days
    if not start_date:
        start_date = (datetime.now() - timedelta(days=30)).isoformat()
    if not end_date:
        end_date = datetime.now().isoformat()
    
    cursor = db.cursor()
    cursor.row_factory = dict_factory
    
    # ========================================================================
    # Total Actions
    # ========================================================================
    cursor.execute("""
        SELECT COUNT(*) as total
        FROM operator_audit_log
        WHERE timestamp BETWEEN ? AND ?
    """, (start_date, end_date))
    total_actions = cursor.fetchone()["total"]
    
    # ========================================================================
    # Actions by Type
    # ========================================================================
    cursor.execute("""
        SELECT action, COUNT(*) as count
        FROM operator_audit_log
        WHERE timestamp BETWEEN ? AND ?
        GROUP BY action
        ORDER BY count DESC
    """, (start_date, end_date))
    actions_by_type = cursor.fetchall()
    
    # ========================================================================
    # Approval Rate
    # ========================================================================
    cursor.execute("""
        SELECT
            SUM(CASE WHEN action = 'approve' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as approval_rate
        FROM operator_audit_log
        WHERE action IN ('approve', 'reject')
          AND timestamp BETWEEN ? AND ?
    """, (start_date, end_date))
    approval_rate_result = cursor.fetchone()
    approval_rate = approval_rate_result["approval_rate"] if approval_rate_result and approval_rate_result["approval_rate"] is not None else 0
    
    # ========================================================================
    # Actions Timeline (Daily)
    # ========================================================================
    cursor.execute("""
        SELECT
            DATE(timestamp) as date,
            action,
            COUNT(*) as count
        FROM operator_audit_log
        WHERE timestamp BETWEEN ? AND ?
        GROUP BY DATE(timestamp), action
        ORDER BY date ASC
    """, (start_date, end_date))
    actions_timeline = cursor.fetchall()
    
    # ========================================================================
    # Operator Activity Leaderboard
    # ========================================================================
    cursor.execute("""
        SELECT
            operator_id,
            COUNT(*) as total_actions,
            SUM(CASE WHEN action = 'approve' THEN 1 ELSE 0 END) as approvals,
            SUM(CASE WHEN action = 'reject' THEN 1 ELSE 0 END) as rejections,
            SUM(CASE WHEN action = 'modify' THEN 1 ELSE 0 END) as modifications,
            SUM(CASE WHEN action = 'flag' THEN 1 ELSE 0 END) as flags
        FROM operator_audit_log
        WHERE timestamp BETWEEN ? AND ?
        GROUP BY operator_id
        ORDER BY total_actions DESC
        LIMIT 10
    """, (start_date, end_date))
    operator_activity = cursor.fetchall()
    
    # ========================================================================
    # Approval Rate by Persona
    # ========================================================================
    cursor.execute("""
        SELECT
            r.persona_primary,
            COUNT(*) as total,
            SUM(CASE WHEN r.status = 'approved' THEN 1 ELSE 0 END) as approved,
            SUM(CASE WHEN r.status = 'rejected' THEN 1 ELSE 0 END) as rejected
        FROM recommendations r
        WHERE r.generated_at BETWEEN ? AND ?
          AND r.status IN ('approved', 'rejected')
        GROUP BY r.persona_primary
        ORDER BY total DESC
    """, (start_date, end_date))
    approval_by_persona = cursor.fetchall()
    
    # Calculate approval rate percentage for each persona
    for persona in approval_by_persona:
        if persona["total"] > 0:
            persona["approval_rate"] = round((persona["approved"] / persona["total"]) * 100, 2)
        else:
            persona["approval_rate"] = 0
    
    # ========================================================================
    # Current Queue Size
    # ========================================================================
    cursor.execute("SELECT COUNT(*) as count FROM recommendations WHERE status = 'pending'")
    queue_size = cursor.fetchone()["count"]
    
    # ========================================================================
    # Average Processing Time (in minutes)
    # ========================================================================
    cursor.execute("""
        SELECT
            AVG(
                (julianday(status_changed_at) - julianday(generated_at)) * 24 * 60
            ) as avg_processing_minutes
        FROM recommendations
        WHERE status IN ('approved', 'rejected', 'modified')
          AND status_changed_at IS NOT NULL
          AND generated_at BETWEEN ? AND ?
    """, (start_date, end_date))
    avg_processing_result = cursor.fetchone()
    avg_processing_time = avg_processing_result["avg_processing_minutes"] if avg_processing_result and avg_processing_result["avg_processing_minutes"] is not None else 0
    
    # ========================================================================
    # Flag Rate
    # ========================================================================
    cursor.execute("""
        SELECT
            SUM(CASE WHEN action = 'flag' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as flag_rate
        FROM operator_audit_log
        WHERE timestamp BETWEEN ? AND ?
    """, (start_date, end_date))
    flag_rate_result = cursor.fetchone()
    flag_rate = flag_rate_result["flag_rate"] if flag_rate_result and flag_rate_result["flag_rate"] is not None else 0
    
    # ========================================================================
    # Recommendations Generated
    # ========================================================================
    cursor.execute("""
        SELECT COUNT(*) as count
        FROM recommendations
        WHERE generated_at BETWEEN ? AND ?
    """, (start_date, end_date))
    recommendations_generated = cursor.fetchone()["count"]
    
    return {
        "date_range": {
            "start": start_date,
            "end": end_date
        },
        "summary": {
            "total_actions": total_actions,
            "approval_rate": round(approval_rate, 2),
            "flag_rate": round(flag_rate, 2),
            "queue_size": queue_size,
            "avg_processing_time_minutes": round(avg_processing_time, 2),
            "recommendations_generated": recommendations_generated
        },
        "actions_by_type": actions_by_type,
        "actions_timeline": actions_timeline,
        "operator_activity": operator_activity,
        "approval_by_persona": approval_by_persona
    }

@router.get(
    "/analytics/operators/{operator_id}",
    summary="Get analytics for a specific operator",
    description="Returns detailed performance metrics for an individual operator."
)
async def get_operator_analytics(
    operator_id: str,
    start_date: Optional[str] = Query(None, description="Start date (ISO format)"),
    end_date: Optional[str] = Query(None, description="End date (ISO format)"),
    current_operator: dict = Depends(verify_token),
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Returns individual operator analytics including:
    - Total actions
    - Action breakdown
    - Approval rate
    - Average processing time
    - Daily activity
    """
    
    # Default to last 30 days
    if not start_date:
        start_date = (datetime.now() - timedelta(days=30)).isoformat()
    if not end_date:
        end_date = datetime.now().isoformat()
    
    cursor = db.cursor()
    cursor.row_factory = dict_factory
    
    # Total actions
    cursor.execute("""
        SELECT
            COUNT(*) as total_actions,
            SUM(CASE WHEN action = 'approve' THEN 1 ELSE 0 END) as approvals,
            SUM(CASE WHEN action = 'reject' THEN 1 ELSE 0 END) as rejections,
            SUM(CASE WHEN action = 'modify' THEN 1 ELSE 0 END) as modifications,
            SUM(CASE WHEN action = 'flag' THEN 1 ELSE 0 END) as flags
        FROM operator_audit_log
        WHERE operator_id = ?
          AND timestamp BETWEEN ? AND ?
    """, (operator_id, start_date, end_date))
    summary = cursor.fetchone()
    
    # Daily activity
    cursor.execute("""
        SELECT
            DATE(timestamp) as date,
            COUNT(*) as actions
        FROM operator_audit_log
        WHERE operator_id = ?
          AND timestamp BETWEEN ? AND ?
        GROUP BY DATE(timestamp)
        ORDER BY date ASC
    """, (operator_id, start_date, end_date))
    daily_activity = cursor.fetchall()
    
    # Approval rate
    approval_rate = 0
    if summary["approvals"] or summary["rejections"]:
        total_decisions = summary["approvals"] + summary["rejections"]
        approval_rate = (summary["approvals"] / total_decisions) * 100 if total_decisions > 0 else 0
    
    return {
        "operator_id": operator_id,
        "date_range": {
            "start": start_date,
            "end": end_date
        },
        "summary": {
            **summary,
            "approval_rate": round(approval_rate, 2)
        },
        "daily_activity": daily_activity
    }

