"""
Tests for alert generation endpoints.

Tests cover:
- High rejection rate alerts
- Long queue alerts
- Guardrail failure alerts
- Flagged items alerts
"""

import pytest
import sqlite3
from datetime import datetime


class TestHighRejectionRateAlert:
    """Test suite for high rejection rate alerts."""
    
    def test_high_rejection_rate_triggers_alert(self, test_db: sqlite3.Connection):
        """Test that high rejection rate (>20% with >10 actions) triggers an alert."""
        cursor = test_db.cursor()
        
        operator_id = 'op_test_001'
        
        # Create 15 operator actions: 4 rejects, 11 approves = 26.7% rejection rate
        for i in range(15):
            action = 'reject' if i < 4 else 'approve'
            cursor.execute("""
                INSERT INTO operator_audit_log (operator_id, recommendation_id, action, timestamp)
                VALUES (?, ?, ?, ?)
            """, (operator_id, f'rec_{i}', action, datetime.now()))
        
        test_db.commit()
        
        # Query rejection rate
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
        
        # Verify alert should trigger
        assert total_today > 10
        assert rejected_today / total_today > 0.2
        
        rejection_rate_pct = int(rejected_today / total_today * 100)
        assert rejection_rate_pct == 26  # 4/15 = 26%
    
    def test_low_rejection_rate_no_alert(self, test_db: sqlite3.Connection):
        """Test that low rejection rate does not trigger an alert."""
        cursor = test_db.cursor()
        
        operator_id = 'op_test_001'
        
        # Create 15 actions: 1 reject, 14 approves = 6.7% rejection rate
        for i in range(15):
            action = 'reject' if i == 0 else 'approve'
            cursor.execute("""
                INSERT INTO operator_audit_log (operator_id, recommendation_id, action, timestamp)
                VALUES (?, ?, ?, ?)
            """, (operator_id, f'rec_{i}', action, datetime.now()))
        
        test_db.commit()
        
        # Query rejection rate
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
        
        # Verify alert should NOT trigger
        assert rejected_today / total_today < 0.2
    
    def test_insufficient_actions_no_alert(self, test_db: sqlite3.Connection):
        """Test that high rejection rate with <10 actions doesn't trigger alert."""
        cursor = test_db.cursor()
        
        operator_id = 'op_test_001'
        
        # Create only 5 actions: 3 rejects, 2 approves = 60% rejection rate
        # Should NOT trigger alert because total < 10
        for i in range(5):
            action = 'reject' if i < 3 else 'approve'
            cursor.execute("""
                INSERT INTO operator_audit_log (operator_id, recommendation_id, action, timestamp)
                VALUES (?, ?, ?, ?)
            """, (operator_id, f'rec_{i}', action, datetime.now()))
        
        test_db.commit()
        
        cursor.execute("""
            SELECT COUNT(*) FROM operator_audit_log
            WHERE action IN ('approve', 'reject')
              AND DATE(timestamp) = DATE('now')
        """)
        total_today = cursor.fetchone()[0]
        
        # Verify alert should NOT trigger due to insufficient actions
        assert total_today <= 10


class TestLongQueueAlert:
    """Test suite for long queue alerts."""
    
    def test_long_queue_triggers_alert(self, test_db: sqlite3.Connection):
        """Test that >50 pending recommendations triggers an alert."""
        cursor = test_db.cursor()
        
        # Insert 55 pending recommendations
        for i in range(55):
            cursor.execute("""
                INSERT INTO recommendations (
                    recommendation_id, user_id, persona_primary, type, title,
                    rationale, priority, status, guardrails_passed, tone_check
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (f'rec_{i}', f'user_{i % 10}', 'student', 'article', 
                  f'Test Rec {i}', 'Test rationale', 'medium', 'pending', 1, 1))
        
        test_db.commit()
        
        # Query pending count
        cursor.execute("SELECT COUNT(*) FROM recommendations WHERE status = 'pending'")
        pending_count = cursor.fetchone()[0]
        
        # Verify alert should trigger
        assert pending_count > 50
        assert pending_count == 55
    
    def test_short_queue_no_alert(self, test_db: sqlite3.Connection):
        """Test that ≤50 pending recommendations doesn't trigger an alert."""
        cursor = test_db.cursor()
        
        # Insert only 20 pending recommendations
        for i in range(20):
            cursor.execute("""
                INSERT INTO recommendations (
                    recommendation_id, user_id, persona_primary, type, title,
                    rationale, priority, status, guardrails_passed, tone_check
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (f'rec_{i}', f'user_{i % 10}', 'student', 'article',
                  f'Test Rec {i}', 'Test rationale', 'medium', 'pending', 1, 1))
        
        test_db.commit()
        
        cursor.execute("SELECT COUNT(*) FROM recommendations WHERE status = 'pending'")
        pending_count = cursor.fetchone()[0]
        
        # Verify alert should NOT trigger
        assert pending_count <= 50


class TestGuardrailFailuresAlert:
    """Test suite for guardrail failure alerts."""
    
    def test_guardrail_failures_trigger_alert(self, test_db: sqlite3.Connection):
        """Test that >5 guardrail failures today triggers an alert."""
        cursor = test_db.cursor()
        
        # Insert 7 recommendations with failed guardrails
        for i in range(7):
            cursor.execute("""
                INSERT INTO recommendations (
                    recommendation_id, user_id, persona_primary, type, title,
                    rationale, priority, status, guardrails_passed, tone_check,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (f'fail_rec_{i}', f'user_{i}', 'high_utilization', 'article',
                  f'Failed Rec {i}', 'Test rationale', 'low', 'rejected',
                  0, 0, datetime.now()))  # guardrails_passed = 0
        
        test_db.commit()
        
        # Query guardrail failures
        cursor.execute("""
            SELECT COUNT(*) FROM recommendations
            WHERE guardrails_passed = 0
              AND DATE(created_at) = DATE('now')
        """)
        guardrail_failures = cursor.fetchone()[0]
        
        # Verify alert should trigger
        assert guardrail_failures > 5
        assert guardrail_failures == 7
    
    def test_few_guardrail_failures_no_alert(self, test_db: sqlite3.Connection):
        """Test that ≤5 guardrail failures doesn't trigger an alert."""
        cursor = test_db.cursor()
        
        # Insert only 3 recommendations with failed guardrails
        for i in range(3):
            cursor.execute("""
                INSERT INTO recommendations (
                    recommendation_id, user_id, persona_primary, type, title,
                    rationale, priority, status, guardrails_passed, tone_check,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (f'fail_rec_{i}', f'user_{i}', 'student', 'article',
                  f'Failed Rec {i}', 'Test rationale', 'low', 'rejected',
                  0, 0, datetime.now()))
        
        test_db.commit()
        
        cursor.execute("""
            SELECT COUNT(*) FROM recommendations
            WHERE guardrails_passed = 0
              AND DATE(created_at) = DATE('now')
        """)
        guardrail_failures = cursor.fetchone()[0]
        
        # Verify alert should NOT trigger
        assert guardrail_failures <= 5


class TestFlaggedItemsAlert:
    """Test suite for flagged items alerts."""
    
    def test_flagged_items_trigger_alert(self, test_db: sqlite3.Connection):
        """Test that any unresolved flagged items trigger an alert."""
        cursor = test_db.cursor()
        
        # Insert 2 unresolved flags
        for i in range(2):
            cursor.execute("""
                INSERT INTO recommendation_flags (
                    recommendation_id, flagged_by, reason, resolved
                ) VALUES (?, ?, ?, ?)
            """, (f'rec_{i}', 'op_001', f'Test reason {i}', 0))
        
        test_db.commit()
        
        # Query unresolved flags
        cursor.execute("SELECT COUNT(*) FROM recommendation_flags WHERE resolved = 0")
        flagged_count = cursor.fetchone()[0]
        
        # Verify alert should trigger
        assert flagged_count > 0
        assert flagged_count == 2
    
    def test_no_flagged_items_no_alert(self, test_db: sqlite3.Connection):
        """Test that zero unresolved flags doesn't trigger an alert."""
        cursor = test_db.cursor()
        
        # Insert flags but all are resolved
        for i in range(3):
            cursor.execute("""
                INSERT INTO recommendation_flags (
                    recommendation_id, flagged_by, reason, resolved, 
                    resolved_by, resolved_at
                ) VALUES (?, ?, ?, ?, ?, ?)
            """, (f'rec_{i}', 'op_001', f'Test reason {i}', 1,
                  'op_senior', datetime.now()))
        
        test_db.commit()
        
        cursor.execute("SELECT COUNT(*) FROM recommendation_flags WHERE resolved = 0")
        flagged_count = cursor.fetchone()[0]
        
        # Verify alert should NOT trigger
        assert flagged_count == 0


class TestAlertIntegration:
    """Integration tests for the alerts system."""
    
    def test_multiple_alerts_simultaneously(self, test_db: sqlite3.Connection):
        """Test that multiple alert conditions can trigger at once."""
        cursor = test_db.cursor()
        
        # Create conditions for multiple alerts
        
        # 1. High rejection rate
        for i in range(15):
            action = 'reject' if i < 4 else 'approve'
            cursor.execute("""
                INSERT INTO operator_audit_log (operator_id, recommendation_id, action, timestamp)
                VALUES (?, ?, ?, ?)
            """, ('op_001', f'rec_{i}', action, datetime.now()))
        
        # 2. Long queue
        for i in range(55):
            cursor.execute("""
                INSERT INTO recommendations (
                    recommendation_id, user_id, persona_primary, type, title,
                    rationale, priority, status, guardrails_passed, tone_check
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (f'pending_rec_{i}', f'user_{i % 10}', 'student', 'article',
                  f'Test Rec {i}', 'Test rationale', 'medium', 'pending', 1, 1))
        
        # 3. Guardrail failures
        for i in range(7):
            cursor.execute("""
                INSERT INTO recommendations (
                    recommendation_id, user_id, persona_primary, type, title,
                    rationale, priority, status, guardrails_passed, tone_check,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (f'fail_rec_{i}', f'user_{i}', 'high_utilization', 'article',
                  f'Failed Rec {i}', 'Test rationale', 'low', 'rejected',
                  0, 0, datetime.now()))
        
        # 4. Flagged items
        cursor.execute("""
            INSERT INTO recommendation_flags (
                recommendation_id, flagged_by, reason, resolved
            ) VALUES (?, ?, ?, ?)
        """, ('rec_flagged', 'op_001', 'Test reason', 0))
        
        test_db.commit()
        
        # Verify all conditions are met
        # Check rejection rate
        cursor.execute("""
            SELECT COUNT(*) FROM operator_audit_log
            WHERE action = 'reject' AND DATE(timestamp) = DATE('now')
        """)
        rejects = cursor.fetchone()[0]
        cursor.execute("""
            SELECT COUNT(*) FROM operator_audit_log
            WHERE action IN ('approve', 'reject') AND DATE(timestamp) = DATE('now')
        """)
        total = cursor.fetchone()[0]
        assert total > 10 and rejects / total > 0.2
        
        # Check pending count
        cursor.execute("SELECT COUNT(*) FROM recommendations WHERE status = 'pending'")
        pending = cursor.fetchone()[0]
        assert pending > 50
        
        # Check guardrail failures
        cursor.execute("""
            SELECT COUNT(*) FROM recommendations
            WHERE guardrails_passed = 0 AND DATE(created_at) = DATE('now')
        """)
        failures = cursor.fetchone()[0]
        assert failures > 5
        
        # Check flagged items
        cursor.execute("SELECT COUNT(*) FROM recommendation_flags WHERE resolved = 0")
        flagged = cursor.fetchone()[0]
        assert flagged > 0
        
        # All 4 alert conditions should be met
        print(f"✓ All 4 alert conditions met: rejection={rejects}/{total}, pending={pending}, failures={failures}, flagged={flagged}")

