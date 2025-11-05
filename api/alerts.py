"""
Alert Generation Module for Operator Dashboard

Generates real-time alerts based on system state:
- High rejection rate
- Long queue
- Guardrail failures
- Flagged items requiring review

These alerts help operators identify system issues proactively.
"""

from fastapi import APIRouter
from typing import List, Dict, Any
import sqlite3
from datetime import datetime

from database import get_db

router = APIRouter()


@router.get("/alerts", response_model=List[Dict[str, Any]])
def get_alerts():
    """
    Generate alerts based on current system state
    
    Alerts are generated dynamically based on:
    - Rejection rates (if > 20% and > 10 total reviews today)
    - Queue length (if > 50 pending)
    - Guardrail failures (if > 5 today)
    - Flagged items (if any unresolved)
    
    Returns:
        List[Dict]: Array of alert objects with id, type, severity, message, etc.
    """
    alerts = []
    
    with get_db() as db:
        cursor = db.cursor()
        
        # ========================================================================
        # Alert 1: High Rejection Rate
        # ========================================================================
        # Check if operators are rejecting an unusually high percentage of recs
        
        cursor.execute("""
            SELECT COUNT(*) FROM operator_audit_log
            WHERE action = 'reject'
              AND DATE(timestamp) = DATE('now')
        """)
        rejected_today = cursor.fetchone()[0]
        
        cursor.execute("""
            SELECT COUNT(*) FROM operator_audit_log
            WHERE action IN ('approve', 'reject')
              AND DATE(timestamp) = DATE('now')
        """)
        total_today = cursor.fetchone()[0]
        
        if total_today > 10 and rejected_today / total_today > 0.2:
            rejection_rate_pct = int(rejected_today / total_today * 100)
            alerts.append({
                'id': 'alert_high_rejection',
                'type': 'high_rejection_rate',
                'severity': 'medium',
                'message': f'High rejection rate today: {rejected_today}/{total_today} ({rejection_rate_pct}%)',
                'count': rejected_today,
                'createdAt': datetime.now().isoformat()
            })
        
        # ========================================================================
        # Alert 2: Long Queue
        # ========================================================================
        # Check if review queue is backing up
        
        cursor.execute("SELECT COUNT(*) FROM recommendations WHERE status = 'pending'")
        pending_count = cursor.fetchone()[0]
        
        if pending_count > 50:
            alerts.append({
                'id': 'alert_long_queue',
                'type': 'long_queue',
                'severity': 'high',
                'message': f'Review queue is backing up: {pending_count} pending recommendations',
                'count': pending_count,
                'actionUrl': '/?filter=pending',
                'createdAt': datetime.now().isoformat()
            })
        
        # ========================================================================
        # Alert 3: Guardrail Failures
        # ========================================================================
        # Check for recommendations that failed guardrail checks
        
        cursor.execute("""
            SELECT COUNT(*) FROM recommendations
            WHERE guardrails_passed = 0
              AND DATE(created_at) = DATE('now')
        """)
        guardrail_failures = cursor.fetchone()[0]
        
        if guardrail_failures > 5:
            alerts.append({
                'id': 'alert_guardrail_failures',
                'type': 'guardrail_failures',
                'severity': 'high',
                'message': f'Multiple guardrail failures detected today: {guardrail_failures} recommendations failed checks',
                'count': guardrail_failures,
                'createdAt': datetime.now().isoformat()
            })
        
        # ========================================================================
        # Alert 4: Flagged Items
        # ========================================================================
        # Check for items that need senior review
        
        cursor.execute("SELECT COUNT(*) FROM recommendation_flags WHERE resolved = 0")
        flagged_count = cursor.fetchone()[0]
        
        if flagged_count > 0:
            alerts.append({
                'id': 'alert_flagged_items',
                'type': 'flagged_item',
                'severity': 'medium',
                'message': f'{flagged_count} flagged items require senior review',
                'count': flagged_count,
                'actionUrl': '/?filter=flagged',
                'createdAt': datetime.now().isoformat()
            })
    
        # ========================================================================
        # Alert 5: LLM Errors (optional, for future enhancement)
        # ========================================================================
        # Could track LLM API failures, rate limits, etc.
        # Placeholder for now
    
    return alerts

