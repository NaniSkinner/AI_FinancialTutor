"""
Tests for Persona Transition Detection and Tracking.

Tests cover:
- Transition detection
- Celebration messages
- Positive vs negative transitions
- Transition history
"""

import pytest
from datetime import datetime, timedelta
from personas.assignment import PersonaAssigner
from personas.transitions import PersonaTransitionTracker
from tests.personas.conftest import insert_test_user


class TestTransitionDetection:
    """Test basic transition detection."""
    
    def test_detect_transition_basic(self, test_db, high_util_signals, savings_builder_signals):
        """Test basic transition detection from one persona to another."""
        assigner = PersonaAssigner(test_db)
        tracker = PersonaTransitionTracker(test_db)
        
        # Step 1: Assign High Utilization
        insert_test_user(test_db, 'user_test', high_util_signals)
        assignment1 = assigner.assign_personas('user_test', '30d')
        assigner.store_assignment(assignment1)
        
        # Wait a bit (simulated)
        import time
        time.sleep(0.1)
        
        # Step 2: Update to Savings Builder (improved finances)
        # First clear old signals
        cursor = test_db.cursor()
        cursor.execute("DELETE FROM user_signals WHERE user_id = ?", ('user_test',))
        
        # Insert new signals
        import json
        for signal_type in ['credit', 'income', 'subscriptions', 'savings']:
            if signal_type in savings_builder_signals:
                cursor.execute("""
                    INSERT INTO user_signals (user_id, window_type, signal_type, signal_json)
                    VALUES (?, ?, ?, ?)
                """, (
                    'user_test',
                    '30d',
                    signal_type,
                    json.dumps(savings_builder_signals[signal_type])
                ))
        test_db.commit()
        
        assignment2 = assigner.assign_personas('user_test', '30d')
        assigner.store_assignment(assignment2)
        
        # Step 3: Detect transition
        transition = tracker.detect_transition('user_test', '30d')
        
        # Assertions
        assert transition['transition_detected'] == True
        assert transition['from_persona'] == 'high_utilization'
        assert transition['to_persona'] == 'savings_builder'
        assert 'days_in_previous_persona' in transition
    
    def test_no_transition_same_persona(self, test_db, savings_builder_signals):
        """Test that no transition is detected when persona doesn't change."""
        assigner = PersonaAssigner(test_db)
        tracker = PersonaTransitionTracker(test_db)
        
        # Assign same persona twice
        insert_test_user(test_db, 'user_test', savings_builder_signals)
        
        assignment1 = assigner.assign_personas('user_test', '30d')
        assigner.store_assignment(assignment1)
        
        import time
        time.sleep(0.1)
        
        assignment2 = assigner.assign_personas('user_test', '30d')
        assigner.store_assignment(assignment2)
        
        # Detect transition
        transition = tracker.detect_transition('user_test', '30d')
        
        # Should not detect transition
        assert transition['transition_detected'] == False
        assert 'current_persona' in transition
    
    def test_insufficient_history(self, test_db, savings_builder_signals):
        """Test handling of insufficient transition history."""
        tracker = PersonaTransitionTracker(test_db)
        
        # Try to detect transition without any assignments
        transition = tracker.detect_transition('user_no_history', '30d')
        
        assert transition['transition_detected'] == False
        assert 'note' in transition


class TestPositiveTransitions:
    """Test positive transition celebrations."""
    
    def test_high_util_to_savings_builder(self, test_db, high_util_signals, savings_builder_signals):
        """Test celebration for High Util → Savings Builder transition."""
        assigner = PersonaAssigner(test_db)
        tracker = PersonaTransitionTracker(test_db)
        
        # Setup transition
        insert_test_user(test_db, 'user_test', high_util_signals)
        assignment1 = assigner.assign_personas('user_test', '30d')
        assigner.store_assignment(assignment1)
        
        import time
        time.sleep(0.1)
        
        # Update to savings builder
        cursor = test_db.cursor()
        cursor.execute("DELETE FROM user_signals WHERE user_id = ?", ('user_test',))
        
        import json
        for signal_type in ['credit', 'income', 'subscriptions', 'savings']:
            if signal_type in savings_builder_signals:
                cursor.execute("""
                    INSERT INTO user_signals (user_id, window_type, signal_type, signal_json)
                    VALUES (?, ?, ?, ?)
                """, ('user_test', '30d', signal_type, json.dumps(savings_builder_signals[signal_type])))
        test_db.commit()
        
        assignment2 = assigner.assign_personas('user_test', '30d')
        assigner.store_assignment(assignment2)
        
        # Detect transition
        transition = tracker.detect_transition('user_test', '30d')
        
        # Should have celebration
        assert transition['is_positive_transition'] == True
        assert 'celebration_message' in transition
        assert 'Congratulations' in transition['celebration_message']
        assert transition['milestone_achieved'] == 'credit_to_savings'
        assert transition['achievement_title'] == 'Financial Health Turnaround'
    
    def test_student_to_savings_builder(self, test_db, student_signals, savings_builder_signals):
        """Test celebration for Student → Savings Builder transition."""
        assigner = PersonaAssigner(test_db)
        tracker = PersonaTransitionTracker(test_db)
        
        # Setup transition
        insert_test_user(test_db, 'user_test', student_signals)
        assignment1 = assigner.assign_personas('user_test', '30d')
        assigner.store_assignment(assignment1)
        
        import time
        time.sleep(0.1)
        
        # Update signals AND metadata (student graduated!)
        cursor = test_db.cursor()
        cursor.execute("DELETE FROM user_signals WHERE user_id = ?", ('user_test',))
        
        # Update user metadata to reflect graduation
        metadata = savings_builder_signals['user_metadata']
        cursor.execute("""
            UPDATE users SET
                age_bracket = ?,
                annual_income = ?,
                student_loan_account_present = ?,
                has_mortgage = ?
            WHERE user_id = ?
        """, (
            metadata['age_bracket'],
            metadata['annual_income'],
            metadata['student_loan_account_present'],
            metadata['has_mortgage'],
            'user_test'
        ))
        
        import json
        for signal_type in ['credit', 'income', 'subscriptions', 'savings']:
            if signal_type in savings_builder_signals:
                cursor.execute("""
                    INSERT INTO user_signals (user_id, window_type, signal_type, signal_json)
                    VALUES (?, ?, ?, ?)
                """, ('user_test', '30d', signal_type, json.dumps(savings_builder_signals[signal_type])))
        test_db.commit()
        
        assignment2 = assigner.assign_personas('user_test', '30d')
        assigner.store_assignment(assignment2)
        
        # Detect transition
        transition = tracker.detect_transition('user_test', '30d')
        
        # Should have celebration
        assert transition['is_positive_transition'] == True
        assert '🎓' in transition['celebration_message']
        assert transition['milestone_achieved'] == 'student_graduate'


class TestNegativeTransitions:
    """Test negative/neutral transitions."""
    
    def test_savings_builder_to_high_util_no_celebration(self, test_db, savings_builder_signals, high_util_signals):
        """Test that negative transitions don't generate celebrations."""
        assigner = PersonaAssigner(test_db)
        tracker = PersonaTransitionTracker(test_db)
        
        # Setup negative transition (good → bad)
        insert_test_user(test_db, 'user_test', savings_builder_signals)
        assignment1 = assigner.assign_personas('user_test', '30d')
        assigner.store_assignment(assignment1)
        
        import time
        time.sleep(0.1)
        
        # Update to high utilization
        cursor = test_db.cursor()
        cursor.execute("DELETE FROM user_signals WHERE user_id = ?", ('user_test',))
        
        import json
        for signal_type in ['credit', 'income', 'subscriptions', 'savings']:
            if signal_type in high_util_signals:
                cursor.execute("""
                    INSERT INTO user_signals (user_id, window_type, signal_type, signal_json)
                    VALUES (?, ?, ?, ?)
                """, ('user_test', '30d', signal_type, json.dumps(high_util_signals[signal_type])))
        test_db.commit()
        
        assignment2 = assigner.assign_personas('user_test', '30d')
        assigner.store_assignment(assignment2)
        
        # Detect transition
        transition = tracker.detect_transition('user_test', '30d')
        
        # Should detect transition but NO celebration
        assert transition['transition_detected'] == True
        assert transition['is_positive_transition'] == False
        assert 'celebration_message' not in transition or transition.get('celebration_message') is None


class TestTransitionHistory:
    """Test transition history tracking."""
    
    def test_get_transition_history(self, test_db):
        """Test retrieving transition history for a user."""
        tracker = PersonaTransitionTracker(test_db)
        
        # Manually insert some transitions
        cursor = test_db.cursor()
        transitions = [
            ('trans_1', 'user_test', 'high_utilization', 'general', '2025-10-01T10:00:00', 30, False, None, None),
            ('trans_2', 'user_test', 'general', 'savings_builder', '2025-11-01T10:00:00', 31, True, 'progress', 'Progress'),
            ('trans_3', 'user_test', 'savings_builder', 'savings_builder', '2025-11-15T10:00:00', 14, False, None, None),
        ]
        
        for t in transitions:
            cursor.execute("""
                INSERT INTO persona_transitions (
                    transition_id, user_id, from_persona, to_persona, transition_date,
                    days_in_previous_persona, celebration_shown, milestone_achieved, achievement_title
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, t)
        
        test_db.commit()
        
        # Get history
        history = tracker.get_transition_history('user_test', limit=10)
        
        # Should have 3 transitions, most recent first
        assert len(history) == 3
        assert history[0]['transition_id'] == 'trans_3'
        assert history[1]['transition_id'] == 'trans_2'
        assert history[2]['transition_id'] == 'trans_1'
    
    def test_transition_history_limit(self, test_db):
        """Test that transition history respects limit parameter."""
        tracker = PersonaTransitionTracker(test_db)
        
        # Insert 5 transitions
        cursor = test_db.cursor()
        for i in range(5):
            cursor.execute("""
                INSERT INTO persona_transitions (
                    transition_id, user_id, from_persona, to_persona, transition_date,
                    days_in_previous_persona, celebration_shown
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (f'trans_{i}', 'user_test', 'general', 'general', f'2025-11-0{i+1}T10:00:00', 1, False))
        
        test_db.commit()
        
        # Get only 3 most recent
        history = tracker.get_transition_history('user_test', limit=3)
        
        assert len(history) == 3


class TestTransitionStorage:
    """Test transition storage functionality."""
    
    def test_transition_stored_in_database(self, test_db, high_util_signals, savings_builder_signals):
        """Test that detected transitions are stored in database."""
        assigner = PersonaAssigner(test_db)
        tracker = PersonaTransitionTracker(test_db)
        
        # Setup and detect transition
        insert_test_user(test_db, 'user_test', high_util_signals)
        assignment1 = assigner.assign_personas('user_test', '30d')
        assigner.store_assignment(assignment1)
        
        import time
        time.sleep(0.1)
        
        cursor = test_db.cursor()
        cursor.execute("DELETE FROM user_signals WHERE user_id = ?", ('user_test',))
        
        import json
        for signal_type in ['credit', 'income', 'subscriptions', 'savings']:
            if signal_type in savings_builder_signals:
                cursor.execute("""
                    INSERT INTO user_signals (user_id, window_type, signal_type, signal_json)
                    VALUES (?, ?, ?, ?)
                """, ('user_test', '30d', signal_type, json.dumps(savings_builder_signals[signal_type])))
        test_db.commit()
        
        assignment2 = assigner.assign_personas('user_test', '30d')
        assigner.store_assignment(assignment2)
        
        transition = tracker.detect_transition('user_test', '30d')
        
        # Query database to verify storage
        cursor.execute("""
            SELECT * FROM persona_transitions WHERE user_id = ?
        """, ('user_test',))
        
        row = cursor.fetchone()
        assert row is not None
        assert row['from_persona'] == 'high_utilization'
        assert row['to_persona'] == 'savings_builder'
        assert row['celebration_shown'] == 1  # Positive transition

