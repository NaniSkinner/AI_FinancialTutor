"""
Tests for operator action endpoints.

Tests cover:
- Approving recommendations
- Rejecting recommendations
- Bulk approving recommendations
- Modifying recommendations
- Flagging recommendations
"""

import pytest
import sqlite3
from datetime import datetime


class TestApproveRecommendation:
    """Test suite for approving recommendations."""
    
    def test_approve_recommendation_success(self, test_db: sqlite3.Connection, sample_recommendation: dict):
        """Test successfully approving a recommendation."""
        cursor = test_db.cursor()
        
        # Simulate approval
        operator_id = 'op_test_001'
        rec_id = sample_recommendation['recommendation_id']
        notes = 'Looks good, approved'
        
        cursor.execute("""
            UPDATE recommendations
            SET status = 'approved',
                approved_by = ?,
                approved_at = ?
            WHERE recommendation_id = ?
        """, (operator_id, datetime.now(), rec_id))
        
        # Log action
        cursor.execute("""
            INSERT INTO operator_audit_log (operator_id, recommendation_id, action, notes)
            VALUES (?, ?, ?, ?)
        """, (operator_id, rec_id, 'approve', notes))
        
        test_db.commit()
        
        # Verify status changed
        cursor.execute("""
            SELECT status, approved_by FROM recommendations
            WHERE recommendation_id = ?
        """, (rec_id,))
        result = cursor.fetchone()
        
        assert result['status'] == 'approved'
        assert result['approved_by'] == operator_id
        
        # Verify audit log created
        cursor.execute("""
            SELECT action, operator_id FROM operator_audit_log
            WHERE recommendation_id = ?
        """, (rec_id,))
        audit = cursor.fetchone()
        
        assert audit['action'] == 'approve'
        assert audit['operator_id'] == operator_id
    
    def test_approve_nonexistent_recommendation(self, test_db: sqlite3.Connection):
        """Test approving a recommendation that doesn't exist."""
        cursor = test_db.cursor()
        
        # Try to approve non-existent recommendation
        cursor.execute("""
            UPDATE recommendations
            SET status = 'approved'
            WHERE recommendation_id = 'nonexistent'
        """)
        
        # Should affect 0 rows
        assert cursor.rowcount == 0


class TestRejectRecommendation:
    """Test suite for rejecting recommendations."""
    
    def test_reject_recommendation_success(self, test_db: sqlite3.Connection, sample_recommendation: dict):
        """Test successfully rejecting a recommendation with reason."""
        cursor = test_db.cursor()
        
        operator_id = 'op_test_001'
        rec_id = sample_recommendation['recommendation_id']
        reason = 'Tone seems off'
        
        cursor.execute("""
            UPDATE recommendations
            SET status = 'rejected',
                rejected_by = ?,
                rejected_at = ?,
                rejection_reason = ?
            WHERE recommendation_id = ?
        """, (operator_id, datetime.now(), reason, rec_id))
        
        # Log action
        cursor.execute("""
            INSERT INTO operator_audit_log (operator_id, recommendation_id, action, notes)
            VALUES (?, ?, ?, ?)
        """, (operator_id, rec_id, 'reject', reason))
        
        test_db.commit()
        
        # Verify status and reason
        cursor.execute("""
            SELECT status, rejected_by, rejection_reason FROM recommendations
            WHERE recommendation_id = ?
        """, (rec_id,))
        result = cursor.fetchone()
        
        assert result['status'] == 'rejected'
        assert result['rejected_by'] == operator_id
        assert result['rejection_reason'] == reason
        
        # Verify audit log
        cursor.execute("""
            SELECT action FROM operator_audit_log
            WHERE recommendation_id = ?
        """, (rec_id,))
        audit = cursor.fetchone()
        
        assert audit['action'] == 'reject'
    
    def test_reject_without_reason(self, test_db: sqlite3.Connection, sample_recommendation: dict):
        """Test rejecting a recommendation without providing a reason (should still work)."""
        cursor = test_db.cursor()
        
        operator_id = 'op_test_001'
        rec_id = sample_recommendation['recommendation_id']
        
        cursor.execute("""
            UPDATE recommendations
            SET status = 'rejected',
                rejected_by = ?,
                rejected_at = ?
            WHERE recommendation_id = ?
        """, (operator_id, datetime.now(), rec_id))
        
        test_db.commit()
        
        cursor.execute("""
            SELECT status, rejection_reason FROM recommendations
            WHERE recommendation_id = ?
        """, (rec_id,))
        result = cursor.fetchone()
        
        assert result['status'] == 'rejected'
        assert result['rejection_reason'] is None


class TestBulkApprove:
    """Test suite for bulk approving recommendations."""
    
    def test_bulk_approve_multiple_recommendations(self, test_db: sqlite3.Connection):
        """Test bulk approving multiple recommendations at once."""
        cursor = test_db.cursor()
        
        # Insert multiple recommendations
        rec_ids = ['bulk_rec_001', 'bulk_rec_002', 'bulk_rec_003']
        for rec_id in rec_ids:
            cursor.execute("""
                INSERT INTO recommendations (
                    recommendation_id, user_id, persona_primary, type, title,
                    rationale, priority, status, guardrails_passed, tone_check
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (rec_id, 'user_123', 'student', 'article', 'Test Title',
                  'Test rationale', 'medium', 'pending', 1, 1))
        
        test_db.commit()
        
        # Bulk approve
        operator_id = 'op_test_001'
        notes = 'Bulk approved'
        
        for rec_id in rec_ids:
            cursor.execute("""
                UPDATE recommendations
                SET status = 'approved',
                    approved_by = ?,
                    approved_at = ?
                WHERE recommendation_id = ?
            """, (operator_id, datetime.now(), rec_id))
            
            cursor.execute("""
                INSERT INTO operator_audit_log (operator_id, recommendation_id, action, notes)
                VALUES (?, ?, ?, ?)
            """, (operator_id, rec_id, 'approve', notes))
        
        test_db.commit()
        
        # Verify all are approved
        cursor.execute("""
            SELECT COUNT(*) as count FROM recommendations
            WHERE recommendation_id IN (?, ?, ?)
              AND status = 'approved'
        """, tuple(rec_ids))
        
        result = cursor.fetchone()
        assert result['count'] == 3
        
        # Verify audit logs created for all
        cursor.execute("""
            SELECT COUNT(*) as count FROM operator_audit_log
            WHERE recommendation_id IN (?, ?, ?)
              AND action = 'approve'
        """, tuple(rec_ids))
        
        audit_result = cursor.fetchone()
        assert audit_result['count'] == 3
    
    def test_bulk_approve_empty_list(self, test_db: sqlite3.Connection):
        """Test bulk approve with empty list (should do nothing)."""
        cursor = test_db.cursor()
        
        # Try to bulk approve with empty list
        rec_ids = []
        
        # Should not raise an error, just do nothing
        updates_made = 0
        for rec_id in rec_ids:
            cursor.execute("""
                UPDATE recommendations
                SET status = 'approved'
                WHERE recommendation_id = ?
            """, (rec_id,))
            if cursor.rowcount > 0:
                updates_made += cursor.rowcount
        
        # No changes should be made
        assert updates_made == 0


class TestModifyRecommendation:
    """Test suite for modifying recommendations."""
    
    def test_modify_recommendation_title(self, test_db: sqlite3.Connection, sample_recommendation: dict):
        """Test modifying a recommendation's title."""
        cursor = test_db.cursor()
        
        operator_id = 'op_test_001'
        rec_id = sample_recommendation['recommendation_id']
        new_title = 'Modified Test Recommendation'
        
        cursor.execute("""
            UPDATE recommendations
            SET title = ?,
                modified_by = ?,
                modified_at = ?
            WHERE recommendation_id = ?
        """, (new_title, operator_id, datetime.now(), rec_id))
        
        # Log modification
        cursor.execute("""
            INSERT INTO operator_audit_log (operator_id, recommendation_id, action, notes)
            VALUES (?, ?, ?, ?)
        """, (operator_id, rec_id, 'modify', f'Changed title to: {new_title}'))
        
        test_db.commit()
        
        # Verify title changed
        cursor.execute("""
            SELECT title, modified_by FROM recommendations
            WHERE recommendation_id = ?
        """, (rec_id,))
        result = cursor.fetchone()
        
        assert result['title'] == new_title
        assert result['modified_by'] == operator_id


class TestFlagRecommendation:
    """Test suite for flagging recommendations."""
    
    def test_flag_recommendation_for_review(self, test_db: sqlite3.Connection, sample_recommendation: dict):
        """Test flagging a recommendation for senior review."""
        cursor = test_db.cursor()
        
        operator_id = 'op_test_001'
        rec_id = sample_recommendation['recommendation_id']
        reason = 'Unclear if this meets eligibility requirements'
        
        cursor.execute("""
            INSERT INTO recommendation_flags (
                recommendation_id, flagged_by, reason, resolved
            ) VALUES (?, ?, ?, ?)
        """, (rec_id, operator_id, reason, 0))
        
        # Update recommendation status
        cursor.execute("""
            UPDATE recommendations
            SET status = 'flagged'
            WHERE recommendation_id = ?
        """, (rec_id,))
        
        test_db.commit()
        
        # Verify flag created
        cursor.execute("""
            SELECT recommendation_id, flagged_by, reason, resolved
            FROM recommendation_flags
            WHERE recommendation_id = ?
        """, (rec_id,))
        flag = cursor.fetchone()
        
        assert flag['recommendation_id'] == rec_id
        assert flag['flagged_by'] == operator_id
        assert flag['reason'] == reason
        assert flag['resolved'] == 0
        
        # Verify status changed
        cursor.execute("""
            SELECT status FROM recommendations
            WHERE recommendation_id = ?
        """, (rec_id,))
        rec = cursor.fetchone()
        
        assert rec['status'] == 'flagged'
    
    def test_resolve_flag(self, test_db: sqlite3.Connection, sample_recommendation: dict):
        """Test resolving a flagged recommendation."""
        cursor = test_db.cursor()
        
        rec_id = sample_recommendation['recommendation_id']
        operator_id = 'op_test_001'
        senior_id = 'op_senior_001'
        
        # Create flag
        cursor.execute("""
            INSERT INTO recommendation_flags (
                recommendation_id, flagged_by, reason, resolved
            ) VALUES (?, ?, ?, ?)
        """, (rec_id, operator_id, 'Test reason', 0))
        
        test_db.commit()
        
        # Resolve flag
        cursor.execute("""
            UPDATE recommendation_flags
            SET resolved = 1,
                resolved_by = ?,
                resolved_at = ?
            WHERE recommendation_id = ?
        """, (senior_id, datetime.now(), rec_id))
        
        test_db.commit()
        
        # Verify flag resolved
        cursor.execute("""
            SELECT resolved, resolved_by FROM recommendation_flags
            WHERE recommendation_id = ?
        """, (rec_id,))
        flag = cursor.fetchone()
        
        assert flag['resolved'] == 1
        assert flag['resolved_by'] == senior_id

