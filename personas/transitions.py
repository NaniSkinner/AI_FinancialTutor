"""
Persona Transition Tracker Module

This module detects and tracks transitions between personas over time,
and generates celebration messages for positive financial progress.
"""

from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime, timedelta
import sqlite3
import json

from .utils import parse_signal_json, parse_iso_timestamp, format_iso_timestamp, generate_id


# ============================================================================
# Positive Transitions Map
# ============================================================================

POSITIVE_TRANSITIONS: Dict[Tuple[str, str], Dict[str, str]] = {
    ('high_utilization', 'savings_builder'): {
        'message': '🎉 Congratulations! You\'ve improved your credit health and started building savings!',
        'milestone': 'credit_to_savings',
        'achievement': 'Financial Health Turnaround',
    },
    ('high_utilization', 'subscription_heavy'): {
        'message': '📈 Great progress! Your credit utilization has improved significantly!',
        'milestone': 'credit_improved',
        'achievement': 'Credit Health Recovery',
    },
    ('high_utilization', 'general'): {
        'message': '✨ Excellent work! Your credit health has improved!',
        'milestone': 'credit_normalized',
        'achievement': 'Credit Health Restored',
    },
    ('variable_income_budgeter', 'savings_builder'): {
        'message': '🎉 Amazing! Your income has stabilized and you\'re building savings!',
        'milestone': 'stability_achieved',
        'achievement': 'Income Stability & Savings',
    },
    ('variable_income_budgeter', 'general'): {
        'message': '📊 Your cash flow situation has improved!',
        'milestone': 'cash_flow_improved',
        'achievement': 'Cash Flow Stability',
    },
    ('student', 'savings_builder'): {
        'message': '🎓 You\'re making smart money moves! Keep building those savings!',
        'milestone': 'student_graduate',
        'achievement': 'Student Financial Success',
    },
    ('student', 'general'): {
        'message': '🎓 Your financial habits are maturing!',
        'milestone': 'student_progress',
        'achievement': 'Financial Maturity',
    },
    ('subscription_heavy', 'savings_builder'): {
        'message': '💰 Excellent! You\'ve optimized your spending and started saving!',
        'milestone': 'spending_optimized',
        'achievement': 'Spending Optimization Success',
    },
    ('subscription_heavy', 'general'): {
        'message': '✂️ Great job managing your subscriptions!',
        'milestone': 'subscriptions_managed',
        'achievement': 'Subscription Discipline',
    },
}


class PersonaTransitionTracker:
    """
    Tracks persona transitions over time and generates celebration messages.
    
    Detects when users transition from one persona to another and identifies
    positive transitions that deserve celebration.
    """
    
    def __init__(self, db_connection: sqlite3.Connection):
        """
        Initialize the PersonaTransitionTracker.
        
        Args:
            db_connection: SQLite database connection
        """
        self.db = db_connection
        self.db.row_factory = sqlite3.Row
    
    def detect_transition(
        self,
        user_id: str,
        window_type: str = '30d'
    ) -> Dict[str, Any]:
        """
        Detect persona transition for a user.
        
        Compares the user's current persona assignment with their previous one
        to detect transitions. Generates celebration messages for positive transitions.
        
        Args:
            user_id: User identifier
            window_type: Time window ('30d' or '180d')
            
        Returns:
            Dict containing:
                - transition_detected: bool
                - from_persona: str (if transition detected)
                - to_persona: str (if transition detected)
                - transition_date: str (ISO timestamp)
                - days_in_previous_persona: int
                - is_positive_transition: bool
                - celebration_message: str (if positive)
                - milestone_achieved: str (if positive)
                - achievement_title: str (if positive)
        """
        # Get current and previous personas
        current = self._get_latest_persona(user_id, window_type)
        previous = self._get_previous_persona(user_id, window_type)
        
        # Handle cases where we don't have enough data
        if not current or not previous:
            return {
                'transition_detected': False,
                'note': 'Insufficient persona history for transition detection'
            }
        
        current_persona = current['primary_persona']
        previous_persona = previous['primary_persona']
        
        # Check if personas are different
        if current_persona == previous_persona:
            return {
                'transition_detected': False,
                'current_persona': current_persona
            }
        
        # Calculate days in previous persona
        days_between = self._calculate_days_between(
            previous['assigned_at'],
            current['assigned_at']
        )
        
        # Build base transition result
        transition = {
            'transition_detected': True,
            'from_persona': previous_persona,
            'to_persona': current_persona,
            'transition_date': current['assigned_at'],
            'days_in_previous_persona': days_between,
            'user_id': user_id,
            'window_type': window_type,
        }
        
        # Check for celebration
        celebration = self._create_celebration(previous_persona, current_persona)
        if celebration:
            # Add celebration fields with correct keys
            transition['celebration_message'] = celebration.get('message')
            transition['milestone_achieved'] = celebration.get('milestone')
            transition['achievement_title'] = celebration.get('achievement')
            transition['is_positive_transition'] = True
        else:
            transition['is_positive_transition'] = False
        
        # Store transition
        self._store_transition(user_id, transition)
        
        return transition
    
    def _get_latest_persona(
        self,
        user_id: str,
        window_type: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get the most recent persona assignment for a user.
        
        Args:
            user_id: User identifier
            window_type: Time window
            
        Returns:
            Dict with persona assignment or None
        """
        cursor = self.db.cursor()
        
        cursor.execute("""
            SELECT 
                assignment_id,
                user_id,
                window_type,
                primary_persona,
                primary_match_strength,
                secondary_personas,
                criteria_met,
                all_matches,
                assigned_at
            FROM user_personas
            WHERE user_id = ? AND window_type = ?
            ORDER BY assigned_at DESC
            LIMIT 1
        """, (user_id, window_type))
        
        row = cursor.fetchone()
        if not row:
            return None
        
        return {
            'assignment_id': row['assignment_id'],
            'user_id': row['user_id'],
            'window_type': row['window_type'],
            'primary_persona': row['primary_persona'],
            'primary_match_strength': row['primary_match_strength'],
            'secondary_personas': json.loads(row['secondary_personas']) if row['secondary_personas'] else [],
            'criteria_met': json.loads(row['criteria_met']) if row['criteria_met'] else {},
            'all_matches': json.loads(row['all_matches']) if row['all_matches'] else [],
            'assigned_at': row['assigned_at'],
        }
    
    def _get_previous_persona(
        self,
        user_id: str,
        window_type: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get the second most recent persona assignment for a user.
        
        Args:
            user_id: User identifier
            window_type: Time window
            
        Returns:
            Dict with persona assignment or None
        """
        cursor = self.db.cursor()
        
        cursor.execute("""
            SELECT 
                assignment_id,
                user_id,
                window_type,
                primary_persona,
                primary_match_strength,
                secondary_personas,
                criteria_met,
                all_matches,
                assigned_at
            FROM user_personas
            WHERE user_id = ? AND window_type = ?
            ORDER BY assigned_at DESC
            LIMIT 1 OFFSET 1
        """, (user_id, window_type))
        
        row = cursor.fetchone()
        if not row:
            return None
        
        return {
            'assignment_id': row['assignment_id'],
            'user_id': row['user_id'],
            'window_type': row['window_type'],
            'primary_persona': row['primary_persona'],
            'primary_match_strength': row['primary_match_strength'],
            'secondary_personas': json.loads(row['secondary_personas']) if row['secondary_personas'] else [],
            'criteria_met': json.loads(row['criteria_met']) if row['criteria_met'] else {},
            'all_matches': json.loads(row['all_matches']) if row['all_matches'] else [],
            'assigned_at': row['assigned_at'],
        }
    
    def _calculate_days_between(self, start_date: str, end_date: str) -> int:
        """
        Calculate days between two ISO timestamp strings.
        
        Args:
            start_date: ISO timestamp string
            end_date: ISO timestamp string
            
        Returns:
            Number of days between dates
        """
        start_dt = parse_iso_timestamp(start_date)
        end_dt = parse_iso_timestamp(end_date)
        
        delta = end_dt - start_dt
        return delta.days
    
    def _create_celebration(
        self,
        from_persona: str,
        to_persona: str
    ) -> Optional[Dict[str, str]]:
        """
        Create celebration message for a positive transition.
        
        Args:
            from_persona: Previous persona
            to_persona: New persona
            
        Returns:
            Dict with celebration details or None if not a positive transition
        """
        transition_key = (from_persona, to_persona)
        
        if transition_key in POSITIVE_TRANSITIONS:
            return POSITIVE_TRANSITIONS[transition_key].copy()
        
        return None
    
    def _store_transition(self, user_id: str, transition: Dict[str, Any]) -> str:
        """
        Store a persona transition in the database.
        
        Args:
            user_id: User identifier
            transition: Transition dict from detect_transition()
            
        Returns:
            transition_id: Unique identifier for the stored transition
        """
        transition_id = generate_id('transition_')
        
        cursor = self.db.cursor()
        cursor.execute("""
            INSERT INTO persona_transitions (
                transition_id,
                user_id,
                from_persona,
                to_persona,
                transition_date,
                days_in_previous_persona,
                celebration_shown,
                milestone_achieved,
                achievement_title,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            transition_id,
            user_id,
            transition['from_persona'],
            transition['to_persona'],
            transition['transition_date'],
            transition['days_in_previous_persona'],
            transition.get('is_positive_transition', False),
            transition.get('milestone_achieved', None),
            transition.get('achievement_title', None),
            format_iso_timestamp()
        ))
        
        self.db.commit()
        return transition_id
    
    def get_transition_history(
        self,
        user_id: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get transition history for a user.
        
        Args:
            user_id: User identifier
            limit: Maximum number of transitions to return
            
        Returns:
            List of transition dicts ordered by most recent first
        """
        cursor = self.db.cursor()
        
        cursor.execute("""
            SELECT 
                transition_id,
                user_id,
                from_persona,
                to_persona,
                transition_date,
                days_in_previous_persona,
                celebration_shown,
                milestone_achieved,
                achievement_title,
                created_at
            FROM persona_transitions
            WHERE user_id = ?
            ORDER BY transition_date DESC
            LIMIT ?
        """, (user_id, limit))
        
        transitions = []
        for row in cursor.fetchall():
            transitions.append({
                'transition_id': row['transition_id'],
                'user_id': row['user_id'],
                'from_persona': row['from_persona'],
                'to_persona': row['to_persona'],
                'transition_date': row['transition_date'],
                'days_in_previous_persona': row['days_in_previous_persona'],
                'celebration_shown': bool(row['celebration_shown']),
                'milestone_achieved': row['milestone_achieved'],
                'achievement_title': row['achievement_title'],
                'created_at': row['created_at'],
            })
        
        return transitions

