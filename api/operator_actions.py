"""
Operator Actions - Core business logic for the Operator Dashboard.

This module implements all operator actions:
- Approve recommendations
- Reject recommendations  
- Modify recommendations
- Flag for review
- Bulk approve
- Get operator statistics

Each action includes:
1. Database updates
2. Audit logging
3. Transaction management
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import json
import sqlite3


class OperatorActions:
    """
    Core business logic for operator actions on recommendations.
    
    All methods automatically log actions to the audit table and handle
    transaction management through the provided database connection.
    """
    
    def __init__(self, db_connection: sqlite3.Connection):
        """
        Initialize with a database connection.
        
        Args:
            db_connection: Active SQLite connection (managed by context manager)
        """
        self.db = db_connection
    
    # ========================================================================
    # APPROVE RECOMMENDATION
    # ========================================================================
    
    def approve_recommendation(
        self, 
        operator_id: str, 
        recommendation_id: str,
        notes: str = ""
    ) -> Dict[str, Any]:
        """
        Approve a recommendation for delivery to user.
        
        Process:
        1. Verify recommendation exists and is approvable
        2. Update recommendation status to 'approved'
        3. Record approval metadata (operator, timestamp, notes)
        4. Log action to audit trail
        5. Queue for delivery (placeholder)
        
        Args:
            operator_id: ID of operator performing action
            recommendation_id: ID of recommendation to approve
            notes: Optional notes about the approval
            
        Returns:
            Dict with status, recommendation_id, and approval details
            
        Raises:
            ValueError: If recommendation doesn't exist or isn't approvable
        """
        cursor = self.db.cursor()
        
        # Verify recommendation exists and is approvable
        cursor.execute("""
            SELECT status, guardrails_passed 
            FROM recommendations 
            WHERE recommendation_id = ?
        """, (recommendation_id,))
        
        row = cursor.fetchone()
        if not row:
            raise ValueError(f"Recommendation {recommendation_id} not found")
        
        status = row['status']
        guardrails_passed = row['guardrails_passed']
        
        if status not in ['pending', 'flagged']:
            raise ValueError(f"Cannot approve recommendation with status: {status}")
        
        if not guardrails_passed:
            raise ValueError("Cannot approve recommendation that failed guardrails")
        
        # Update recommendation with undo support
        now = datetime.now().isoformat()
        undo_expires = (datetime.now() + timedelta(minutes=5)).isoformat()
        
        cursor.execute("""
            UPDATE recommendations
            SET status = 'approved',
                previous_status = ?,
                approved_by = ?,
                approved_at = ?,
                operator_notes = ?,
                status_changed_at = ?,
                undo_window_expires_at = ?,
                updated_at = ?
            WHERE recommendation_id = ?
        """, (status, operator_id, now, notes, now, undo_expires, now, recommendation_id))
        
        # Log action
        self._log_operator_action(
            operator_id=operator_id,
            action='approve',
            recommendation_id=recommendation_id,
            metadata={'notes': notes}
        )
        
        # NOTE: Don't queue for delivery immediately - keep as 'approved' during undo window
        # The delivery system should queue items where:
        # - status = 'approved' AND undo_window_expires_at < now
        # This allows the 5-minute undo window to function properly
        # self._queue_for_delivery(recommendation_id)  # Disabled to support undo
        
        return {
            'status': 'approved',
            'recommendation_id': recommendation_id,
            'approved_by': operator_id,
            'approved_at': now,
            'notes': notes
        }
    
    # ========================================================================
    # REJECT RECOMMENDATION
    # ========================================================================
    
    def reject_recommendation(
        self, 
        operator_id: str, 
        recommendation_id: str,
        reason: str
    ) -> Dict[str, Any]:
        """
        Reject a recommendation (will not be sent to user).
        
        Process:
        1. Verify recommendation exists
        2. Update status to 'rejected'
        3. Record rejection reason and operator
        4. Log action to audit trail
        
        Args:
            operator_id: ID of operator performing action
            recommendation_id: ID of recommendation to reject
            reason: Reason for rejection (required)
            
        Returns:
            Dict with status, recommendation_id, and rejection details
            
        Raises:
            ValueError: If recommendation doesn't exist or reason is empty
        """
        if not reason or len(reason) < 10:
            raise ValueError("Rejection reason must be at least 10 characters")
        
        cursor = self.db.cursor()
        
        # Verify recommendation exists and get current status
        cursor.execute("""
            SELECT status
            FROM recommendations 
            WHERE recommendation_id = ?
        """, (recommendation_id,))
        
        row = cursor.fetchone()
        if not row:
            raise ValueError(f"Recommendation {recommendation_id} not found")
        
        status = row['status']
        
        # Update recommendation with undo support
        now = datetime.now().isoformat()
        undo_expires = (datetime.now() + timedelta(minutes=5)).isoformat()
        
        cursor.execute("""
            UPDATE recommendations
            SET status = 'rejected',
                previous_status = ?,
                rejected_by = ?,
                rejected_at = ?,
                operator_notes = ?,
                status_changed_at = ?,
                undo_window_expires_at = ?,
                updated_at = ?
            WHERE recommendation_id = ?
        """, (status, operator_id, now, reason, now, undo_expires, now, recommendation_id))
        
        # Log action
        self._log_operator_action(
            operator_id=operator_id,
            action='reject',
            recommendation_id=recommendation_id,
            metadata={'reason': reason}
        )
        
        return {
            'status': 'rejected',
            'recommendation_id': recommendation_id,
            'rejected_by': operator_id,
            'rejected_at': now,
            'reason': reason
        }
    
    # ========================================================================
    # MODIFY RECOMMENDATION
    # ========================================================================
    
    def modify_recommendation(
        self, 
        operator_id: str, 
        recommendation_id: str,
        modifications: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Modify recommendation fields before approval.
        
        Allowed fields: rationale, priority, title
        
        Process:
        1. Verify recommendation exists and is modifiable
        2. Validate field names
        3. Update allowed fields
        4. Record modification metadata
        5. Log action to audit trail
        
        Args:
            operator_id: ID of operator performing action
            recommendation_id: ID of recommendation to modify
            modifications: Dict of field names and new values
            
        Returns:
            Dict with status, recommendation_id, and applied modifications
            
        Raises:
            ValueError: If recommendation doesn't exist or invalid fields
        """
        cursor = self.db.cursor()
        
        # Verify recommendation exists
        cursor.execute("""
            SELECT status 
            FROM recommendations 
            WHERE recommendation_id = ?
        """, (recommendation_id,))
        
        row = cursor.fetchone()
        if not row:
            raise ValueError(f"Recommendation {recommendation_id} not found")
        
        if row['status'] not in ['pending', 'flagged']:
            raise ValueError(f"Cannot modify recommendation with status: {row['status']}")
        
        # Allowed fields for modification
        allowed_fields = ['rationale', 'priority', 'title']
        
        # Filter to only allowed fields
        valid_modifications = {
            k: v for k, v in modifications.items() 
            if k in allowed_fields and v is not None
        }
        
        if not valid_modifications:
            raise ValueError("No valid fields to modify")
        
        # Build dynamic UPDATE query
        now = datetime.now().isoformat()
        set_clauses = [f"{field} = ?" for field in valid_modifications.keys()]
        set_clauses.extend(['modified_by = ?', 'modified_at = ?', 'updated_at = ?'])
        
        values = list(valid_modifications.values())
        values.extend([operator_id, now, now, recommendation_id])
        
        query = f"""
            UPDATE recommendations
            SET {', '.join(set_clauses)}
            WHERE recommendation_id = ?
        """
        
        cursor.execute(query, values)
        
        # Log action
        self._log_operator_action(
            operator_id=operator_id,
            action='modify',
            recommendation_id=recommendation_id,
            metadata={'modifications': valid_modifications}
        )
        
        return {
            'status': 'modified',
            'recommendation_id': recommendation_id,
            'modified_by': operator_id,
            'modified_at': now,
            'modifications': valid_modifications
        }
    
    # ========================================================================
    # FLAG FOR REVIEW
    # ========================================================================
    
    def flag_for_review(
        self, 
        operator_id: str, 
        recommendation_id: str,
        flag_reason: str
    ) -> Dict[str, Any]:
        """
        Flag recommendation for additional review.
        
        Use cases:
        - Unclear content appropriateness
        - Complex persona assignment
        - Requires senior operator review
        - Potential policy violation
        
        Process:
        1. Verify recommendation exists
        2. Create flag record
        3. Update recommendation status to 'flagged'
        4. Log action to audit trail
        
        Args:
            operator_id: ID of operator performing action
            recommendation_id: ID of recommendation to flag
            flag_reason: Reason for flagging (required)
            
        Returns:
            Dict with status, recommendation_id, and flag_id
            
        Raises:
            ValueError: If recommendation doesn't exist or reason is empty
        """
        if not flag_reason or len(flag_reason) < 10:
            raise ValueError("Flag reason must be at least 10 characters")
        
        cursor = self.db.cursor()
        
        # Verify recommendation exists and get current status
        cursor.execute("""
            SELECT status
            FROM recommendations 
            WHERE recommendation_id = ?
        """, (recommendation_id,))
        
        row = cursor.fetchone()
        if not row:
            raise ValueError(f"Recommendation {recommendation_id} not found")
        
        status = row['status']
        
        # Generate flag ID
        now = datetime.now().isoformat()
        undo_expires = (datetime.now() + timedelta(minutes=5)).isoformat()
        timestamp = int(datetime.now().timestamp())
        flag_id = f"flag_{recommendation_id}_{timestamp}"
        
        # Insert flag record
        cursor.execute("""
            INSERT INTO recommendation_flags
            (flag_id, recommendation_id, flagged_by, flag_reason, flagged_at)
            VALUES (?, ?, ?, ?, ?)
        """, (flag_id, recommendation_id, operator_id, flag_reason, now))
        
        # Update recommendation status with undo support
        cursor.execute("""
            UPDATE recommendations
            SET status = 'flagged',
                previous_status = ?,
                status_changed_at = ?,
                undo_window_expires_at = ?,
                updated_at = ?
            WHERE recommendation_id = ?
        """, (status, now, undo_expires, now, recommendation_id))
        
        # Log action
        self._log_operator_action(
            operator_id=operator_id,
            action='flag',
            recommendation_id=recommendation_id,
            metadata={'flag_reason': flag_reason, 'flag_id': flag_id}
        )
        
        return {
            'status': 'flagged',
            'recommendation_id': recommendation_id,
            'flag_id': flag_id,
            'flagged_by': operator_id,
            'flagged_at': now,
            'reason': flag_reason
        }
    
    # ========================================================================
    # UNDO ACTION
    # ========================================================================
    
    def undo_action(
        self, 
        operator_id: str, 
        recommendation_id: str
    ) -> Dict[str, Any]:
        """
        Undo the last action on a recommendation within 5-minute window.
        
        Allows operators to reverse accidental actions:
        - Approve → Previous status
        - Reject → Previous status
        - Flag → Previous status
        
        Limitations:
        - Cannot undo if recommendation already delivered
        - Cannot undo after 5-minute window expires
        - Only reverses status change, not modifications
        
        Process:
        1. Verify recommendation exists
        2. Check undo window hasn't expired
        3. Check recommendation not already delivered
        4. Restore previous status
        5. Clear undo metadata
        6. Log undo action
        
        Args:
            operator_id: ID of operator performing undo
            recommendation_id: ID of recommendation to undo
            
        Returns:
            Dict with status, recommendation_id, and restored status
            
        Raises:
            ValueError: If undo window expired, already delivered, or invalid state
        """
        cursor = self.db.cursor()
        
        # Get current state
        cursor.execute("""
            SELECT status, previous_status, undo_window_expires_at
            FROM recommendations
            WHERE recommendation_id = ?
        """, (recommendation_id,))
        
        row = cursor.fetchone()
        if not row:
            raise ValueError(f"Recommendation {recommendation_id} not found")
        
        current_status = row['status']
        previous_status = row['previous_status']
        expires_at = row['undo_window_expires_at']
        
        # Check if undo window expired
        if not expires_at:
            raise ValueError("No undo available for this recommendation")
        
        if datetime.fromisoformat(expires_at) < datetime.now():
            raise ValueError("Undo window expired (5 minutes have passed)")
        
        # Check if already delivered
        if current_status in ['delivered', 'queued_for_delivery']:
            raise ValueError("Cannot undo - recommendation already delivered or queued for delivery")
        
        if not previous_status:
            raise ValueError("No previous status to restore")
        
        # Restore previous status
        now = datetime.now().isoformat()
        cursor.execute("""
            UPDATE recommendations
            SET status = ?,
                previous_status = NULL,
                status_changed_at = NULL,
                undo_window_expires_at = NULL,
                updated_at = ?
            WHERE recommendation_id = ?
        """, (previous_status, now, recommendation_id))
        
        # Log undo action
        self._log_operator_action(
            operator_id=operator_id,
            action='undo',
            recommendation_id=recommendation_id,
            metadata={
                'reverted_from': current_status,
                'restored_to': previous_status
            }
        )
        
        return {
            'status': 'undone',
            'recommendation_id': recommendation_id,
            'restored_status': previous_status,
            'reverted_from': current_status,
            'undone_by': operator_id,
            'undone_at': now
        }
    
    # ========================================================================
    # BULK APPROVE
    # ========================================================================
    
    def bulk_approve(
        self, 
        operator_id: str, 
        recommendation_ids: List[str],
        notes: str = ""
    ) -> Dict[str, Any]:
        """
        Approve multiple recommendations at once.
        
        Safety features:
        - Verifies each recommendation individually
        - Only approves if status='pending' and guardrails_passed=True
        - Continues on individual failures
        - Returns detailed success/failure breakdown
        
        Process:
        1. Loop through each recommendation ID
        2. Verify approvability
        3. Attempt approval
        4. Track successes and failures
        5. Return comprehensive results
        
        Args:
            operator_id: ID of operator performing action
            recommendation_ids: List of recommendation IDs to approve
            notes: Optional notes applied to all approvals
            
        Returns:
            Dict with total, approved count, failed count, and details
        """
        approved = []
        failed = []
        
        for rec_id in recommendation_ids:
            try:
                # Check if recommendation can be approved
                if not self._can_approve(rec_id):
                    failed.append({
                        'recommendation_id': rec_id,
                        'reason': 'Not in approvable state (must be pending with guardrails passed)'
                    })
                    continue
                
                # Approve the recommendation
                result = self.approve_recommendation(operator_id, rec_id, notes)
                approved.append(rec_id)
                
            except Exception as e:
                failed.append({
                    'recommendation_id': rec_id,
                    'reason': str(e)
                })
        
        # Log bulk action
        self._log_operator_action(
            operator_id=operator_id,
            action='bulk_approve',
            recommendation_id='bulk_operation',
            metadata={
                'total': len(recommendation_ids),
                'approved': len(approved),
                'failed': len(failed),
                'notes': notes
            }
        )
        
        return {
            'total': len(recommendation_ids),
            'approved': len(approved),
            'failed': len(failed),
            'approved_ids': approved,
            'failed_items': failed
        }
    
    # ========================================================================
    # OPERATOR STATISTICS
    # ========================================================================
    
    def get_operator_stats(self, operator_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Get operator dashboard statistics.
        
        Metrics:
        - Pending recommendations count
        - Approved today count
        - Rejected today count
        - Flagged items count
        - Average review time (placeholder)
        
        Args:
            operator_id: Optional operator ID for filtered stats
            
        Returns:
            Dict with all statistics
        """
        cursor = self.db.cursor()
        
        # Pending recommendations
        cursor.execute("""
            SELECT COUNT(*) as count
            FROM recommendations 
            WHERE status = 'pending'
        """)
        pending = cursor.fetchone()['count']
        
        # Approved today (from audit log)
        cursor.execute("""
            SELECT COUNT(*) as count
            FROM operator_audit_log
            WHERE action = 'approve'
              AND DATE(timestamp) = DATE('now')
        """)
        approved_today = cursor.fetchone()['count']
        
        # Rejected today (from audit log)
        cursor.execute("""
            SELECT COUNT(*) as count
            FROM operator_audit_log
            WHERE action = 'reject'
              AND DATE(timestamp) = DATE('now')
        """)
        rejected_today = cursor.fetchone()['count']
        
        # Flagged items (unresolved)
        cursor.execute("""
            SELECT COUNT(*) as count
            FROM recommendation_flags
            WHERE resolved = 0
        """)
        flagged = cursor.fetchone()['count']
        
        # Average review time (placeholder - would need timing data)
        avg_review_time = 0.0
        
        return {
            'pending': pending,
            'approved_today': approved_today,
            'rejected_today': rejected_today,
            'flagged': flagged,
            'avg_review_time_seconds': avg_review_time
        }
    
    # ========================================================================
    # HELPER METHODS
    # ========================================================================
    
    def _can_approve(self, recommendation_id: str) -> bool:
        """
        Check if recommendation can be approved.
        
        Requirements:
        - Must exist
        - Status must be 'pending' or 'flagged'
        - Must have passed all guardrails
        
        Args:
            recommendation_id: ID to check
            
        Returns:
            bool: True if approvable, False otherwise
        """
        cursor = self.db.cursor()
        
        cursor.execute("""
            SELECT status, guardrails_passed
            FROM recommendations
            WHERE recommendation_id = ?
        """, (recommendation_id,))
        
        row = cursor.fetchone()
        
        if not row:
            return False
        
        status = row['status']
        guardrails = row['guardrails_passed']
        
        # Must be pending or flagged, and must pass guardrails
        return status in ['pending', 'flagged'] and bool(guardrails)
    
    def _log_operator_action(
        self, 
        operator_id: str, 
        action: str,
        recommendation_id: str, 
        metadata: Dict[str, Any]
    ) -> None:
        """
        Log operator action to audit table.
        
        All operator actions are logged for:
        - Compliance and audit trails
        - Performance tracking
        - Error investigation
        - Quality assurance
        
        Args:
            operator_id: ID of operator
            action: Type of action (approve, reject, modify, flag)
            recommendation_id: Affected recommendation ID
            metadata: Additional context as dictionary
        """
        timestamp = int(datetime.now().timestamp())
        audit_id = f"audit_{operator_id}_{timestamp}"
        now = datetime.now().isoformat()
        
        cursor = self.db.cursor()
        cursor.execute("""
            INSERT INTO operator_audit_log
            (audit_id, operator_id, action, recommendation_id, metadata, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            audit_id,
            operator_id,
            action,
            recommendation_id,
            json.dumps(metadata),
            now
        ))
    
    def _queue_for_delivery(self, recommendation_id: str) -> None:
        """
        Queue approved recommendation for delivery to user.
        
        This is a placeholder for future notification system integration.
        In production, this would:
        - Trigger email notification
        - Add to user's dashboard feed
        - Send push notification
        - Update delivery queue
        
        Args:
            recommendation_id: ID to queue
        """
        cursor = self.db.cursor()
        now = datetime.now().isoformat()
        
        # Update status to indicate queued
        cursor.execute("""
            UPDATE recommendations
            SET status = 'queued_for_delivery',
                updated_at = ?
            WHERE recommendation_id = ?
        """, (now, recommendation_id))
        
        # TODO: Integrate with notification/delivery system
        # - Email service
        # - Push notification service
        # - User dashboard feed

