"""
Persona Assignment Module

This module implements the PersonaAssigner class which assigns users to
behavioral personas based on their financial signals.

Assignment follows a priority order:
1. High Utilization (financial risk)
2. Variable Income Budgeter (stability risk)
3. Student (life stage specific)
4. Subscription-Heavy (behavioral optimization)
5. Savings Builder (positive reinforcement)
"""

from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import sqlite3
import json

from .definitions import PERSONA_PRIORITY, PERSONA_NAMES
from .matcher import MatchStrengthCalculator
from .utils import parse_signal_json, safe_get, format_iso_timestamp, generate_id


class PersonaAssigner:
    """
    Assigns behavioral personas to users based on financial signals.
    
    The assigner evaluates signals against quantitative criteria for each
    persona in priority order, calculates match strength, and returns
    a structured assignment with explainability.
    """
    
    def __init__(self, db_connection: sqlite3.Connection):
        """
        Initialize the PersonaAssigner.
        
        Args:
            db_connection: SQLite database connection
        """
        self.db = db_connection
        self.db.row_factory = sqlite3.Row
        self.matcher = MatchStrengthCalculator()
    
    def assign_personas(
        self,
        user_id: str,
        window_type: str = '30d'
    ) -> Dict[str, Any]:
        """
        Assign personas to a user based on their signals.
        
        Args:
            user_id: User identifier
            window_type: Time window for signals ('30d' or '180d')
            
        Returns:
            Dict containing:
                - user_id: str
                - primary_persona: str
                - primary_match_strength: str
                - secondary_personas: List[str]
                - criteria_met: Dict
                - all_matches: List[str]
                - assigned_at: str (ISO timestamp)
        """
        # Load signals for user
        signals = self._load_signals(user_id, window_type)
        
        # Handle no signals case
        if not signals or not signals.get('credit') and not signals.get('income'):
            return self._no_persona_result(user_id)
        
        # Check all personas in priority order
        matches = []
        
        for persona in PERSONA_PRIORITY:
            if self._check_persona(persona, signals):
                strength = self.matcher.calculate_strength(persona, signals)
                criteria = self._get_persona_criteria(persona, signals)
                
                matches.append({
                    'persona': persona,
                    'strength': strength,
                    'criteria': criteria
                })
        
        # Handle no matches - assign general persona
        if not matches:
            return self._general_persona_result(user_id, signals)
        
        # Extract primary and secondary personas
        primary = matches[0]
        secondary_personas = [m['persona'] for m in matches[1:3]]  # Max 2 secondary
        all_matches = [m['persona'] for m in matches]
        
        # Build result
        result = {
            'user_id': user_id,
            'window_type': window_type,
            'primary_persona': primary['persona'],
            'primary_match_strength': primary['strength'],
            'secondary_personas': secondary_personas,
            'criteria_met': primary['criteria'],
            'all_matches': all_matches,
            'assigned_at': format_iso_timestamp()
        }
        
        return result
    
    # ========================================================================
    # Signal Loading
    # ========================================================================
    
    def _load_signals(
        self,
        user_id: str,
        window_type: str
    ) -> Dict[str, Any]:
        """
        Load all signals for a user from the database.
        
        Args:
            user_id: User identifier
            window_type: Time window ('30d' or '180d')
            
        Returns:
            Dict with signal categories (credit, income, subscriptions, savings, user_metadata)
        """
        cursor = self.db.cursor()
        
        # Query user_signals table
        cursor.execute("""
            SELECT signal_type, signal_json
            FROM user_signals
            WHERE user_id = ? AND window_type = ?
        """, (user_id, window_type))
        
        signal_rows = cursor.fetchall()
        
        # Build signals dict
        signals = {}
        for row in signal_rows:
            signal_type = row['signal_type']
            signal_json = row['signal_json']
            signals[signal_type] = parse_signal_json(signal_json)
        
        # Load user metadata
        cursor.execute("""
            SELECT 
                age_bracket,
                annual_income,
                student_loan_account_present,
                has_rent_transactions,
                has_mortgage,
                transaction_count_monthly,
                essentials_pct
            FROM users
            WHERE user_id = ?
        """, (user_id,))
        
        user_row = cursor.fetchone()
        if user_row:
            signals['user_metadata'] = dict(user_row)
        else:
            signals['user_metadata'] = {}
        
        return signals
    
    # ========================================================================
    # Persona Checking Methods
    # ========================================================================
    
    def _check_persona(self, persona: str, signals: Dict[str, Any]) -> bool:
        """Route to appropriate persona check method."""
        check_methods = {
            'high_utilization': self._check_high_utilization,
            'variable_income_budgeter': self._check_variable_income,
            'student': self._check_student,
            'subscription_heavy': self._check_subscription_heavy,
            'savings_builder': self._check_savings_builder,
        }
        
        check_method = check_methods.get(persona)
        if check_method:
            return check_method(signals)
        return False
    
    def _check_high_utilization(self, signals: Dict[str, Any]) -> bool:
        """
        Check if user matches High Utilization persona.
        
        Criteria (ANY of):
        - any_card_utilization_gte_50
        - any_interest_charges
        - minimum_payment_only
        - any_overdue
        """
        credit = signals.get('credit', {})
        
        # Check any card ≥50% utilization
        if safe_get(credit, 'any_card_high_util', False):
            return True
        
        # Check interest charges
        if safe_get(credit, 'any_interest_charges', False):
            return True
        
        # Check overdue accounts
        if safe_get(credit, 'any_overdue', False):
            return True
        
        # Check minimum payment only on any card
        cards = safe_get(credit, 'cards', [])
        for card in cards:
            if safe_get(card, 'minimum_payment_only', False):
                return True
        
        return False
    
    def _check_variable_income(self, signals: Dict[str, Any]) -> bool:
        """
        Check if user matches Variable Income Budgeter persona.
        
        Criteria (ALL of):
        - median_pay_gap_days > 45
        - cash_flow_buffer_months < 1.0
        """
        income = signals.get('income', {})
        
        median_pay_gap = safe_get(income, 'median_pay_gap_days', 0)
        cash_buffer = safe_get(income, 'cash_flow_buffer_months', 999)
        
        return median_pay_gap > 45 and cash_buffer < 1.0
    
    def _check_student(self, signals: Dict[str, Any]) -> bool:
        """
        Check if user matches Student persona.
        
        Criteria:
        - Major (need 1): has_student_loan OR age_18_25 OR low_trans_high_essentials
        - Supporting (need 2): income_lt_30k, irregular_income, high_coffee,
                               limited_credit, rent_no_mortgage
        """
        metadata = signals.get('user_metadata', {})
        income = signals.get('income', {})
        subscriptions = signals.get('subscriptions', {})
        credit = signals.get('credit', {})
        
        # Check major criteria (need at least 1)
        has_student_loan = safe_get(metadata, 'student_loan_account_present', False)
        age_bracket = safe_get(metadata, 'age_bracket', '')
        age_18_25 = age_bracket == '18-25'
        
        trans_count = safe_get(metadata, 'transaction_count_monthly', 999)
        essentials_pct = safe_get(metadata, 'essentials_pct', 0)
        low_trans_high_essentials = trans_count < 50 and essentials_pct > 40
        
        major_match = has_student_loan or age_18_25 or low_trans_high_essentials
        
        if not major_match:
            return False
        
        # Count supporting criteria (need at least 2)
        supporting_count = 0
        
        # income_lt_30k
        annual_income = safe_get(metadata, 'annual_income', 999999)
        if annual_income < 30000:
            supporting_count += 1
        
        # irregular_income
        payment_freq = safe_get(income, 'payment_frequency', '')
        if payment_freq == 'irregular':
            supporting_count += 1
        
        # high_coffee_food_delivery
        coffee_spend = safe_get(subscriptions, 'coffee_food_delivery_monthly', 0)
        if coffee_spend >= 75:
            supporting_count += 1
        
        # limited_credit_history
        num_cards = safe_get(credit, 'num_credit_cards', 999)
        if num_cards <= 2:
            supporting_count += 1
        
        # rent_no_mortgage
        has_rent = safe_get(metadata, 'has_rent_transactions', False)
        has_mortgage = safe_get(metadata, 'has_mortgage', False)
        if has_rent and not has_mortgage:
            supporting_count += 1
        
        return supporting_count >= 2
    
    def _check_subscription_heavy(self, signals: Dict[str, Any]) -> bool:
        """
        Check if user matches Subscription-Heavy persona.
        
        Criteria (ALL of):
        - recurring_merchants_gte_3
        - subscription_threshold_met (monthly ≥$50 OR share ≥10%)
        """
        subscriptions = signals.get('subscriptions', {})
        
        merchant_count = safe_get(subscriptions, 'recurring_merchant_count', 0)
        monthly_spend = safe_get(subscriptions, 'monthly_recurring_spend', 0)
        share_pct = safe_get(subscriptions, 'subscription_share_pct', 0)
        
        has_enough_subscriptions = merchant_count >= 3
        meets_threshold = monthly_spend >= 50.0 or share_pct >= 10.0
        
        return has_enough_subscriptions and meets_threshold
    
    def _check_savings_builder(self, signals: Dict[str, Any]) -> bool:
        """
        Check if user matches Savings Builder persona.
        
        Criteria (ALL of):
        - savings_growth_or_inflow (growth ≥2% OR inflow ≥$200)
        - all_cards_utilization_lt_30
        """
        savings = signals.get('savings', {})
        credit = signals.get('credit', {})
        
        growth_rate = safe_get(savings, 'savings_growth_rate_pct', 0)
        inflow = safe_get(savings, 'net_savings_inflow', 0)
        utilization = safe_get(credit, 'aggregate_utilization_pct', 999)
        
        has_savings_growth = growth_rate >= 2.0 or inflow >= 200.0
        healthy_credit = utilization < 30.0
        
        return has_savings_growth and healthy_credit
    
    # ========================================================================
    # Criteria Extraction
    # ========================================================================
    
    def _get_persona_criteria(
        self,
        persona: str,
        signals: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Get the specific criteria that matched for a persona."""
        extractors = {
            'high_utilization': self._get_high_utilization_criteria,
            'variable_income_budgeter': self._get_variable_income_criteria,
            'student': self._get_student_criteria,
            'subscription_heavy': self._get_subscription_criteria,
            'savings_builder': self._get_savings_criteria,
        }
        
        extractor = extractors.get(persona)
        if extractor:
            return extractor(signals)
        return {}
    
    def _get_high_utilization_criteria(self, signals: Dict[str, Any]) -> Dict[str, Any]:
        """Extract High Utilization criteria."""
        credit = signals.get('credit', {})
        cards = safe_get(credit, 'cards', [])
        
        highest_util = 0
        if cards:
            highest_util = max(safe_get(card, 'utilization_pct', 0) for card in cards)
        
        return {
            'any_card_utilization_gte_50': safe_get(credit, 'any_card_high_util', False),
            'aggregate_utilization_pct': safe_get(credit, 'aggregate_utilization_pct', 0),
            'any_interest_charges': safe_get(credit, 'any_interest_charges', False),
            'any_overdue': safe_get(credit, 'any_overdue', False),
            'highest_card_utilization': highest_util,
        }
    
    def _get_variable_income_criteria(self, signals: Dict[str, Any]) -> Dict[str, Any]:
        """Extract Variable Income criteria."""
        income = signals.get('income', {})
        
        return {
            'median_pay_gap_days': safe_get(income, 'median_pay_gap_days', 0),
            'cash_flow_buffer_months': safe_get(income, 'cash_flow_buffer_months', 0),
            'income_variability_pct': safe_get(income, 'income_variability_pct', 0),
            'payment_frequency': safe_get(income, 'payment_frequency', ''),
            'income_type': safe_get(income, 'income_type', ''),
        }
    
    def _get_student_criteria(self, signals: Dict[str, Any]) -> Dict[str, Any]:
        """Extract Student criteria."""
        metadata = signals.get('user_metadata', {})
        subscriptions = signals.get('subscriptions', {})
        credit = signals.get('credit', {})
        
        return {
            'has_student_loan': safe_get(metadata, 'student_loan_account_present', False),
            'age_bracket': safe_get(metadata, 'age_bracket', ''),
            'annual_income': safe_get(metadata, 'annual_income', 0),
            'coffee_food_delivery_monthly': safe_get(subscriptions, 'coffee_food_delivery_monthly', 0),
            'num_credit_cards': safe_get(credit, 'num_credit_cards', 0),
            'transaction_count_monthly': safe_get(metadata, 'transaction_count_monthly', 0),
            'essentials_pct': safe_get(metadata, 'essentials_pct', 0),
        }
    
    def _get_subscription_criteria(self, signals: Dict[str, Any]) -> Dict[str, Any]:
        """Extract Subscription-Heavy criteria."""
        subscriptions = signals.get('subscriptions', {})
        
        return {
            'recurring_merchant_count': safe_get(subscriptions, 'recurring_merchant_count', 0),
            'monthly_recurring_spend': safe_get(subscriptions, 'monthly_recurring_spend', 0),
            'subscription_share_pct': safe_get(subscriptions, 'subscription_share_pct', 0),
            'merchants': safe_get(subscriptions, 'merchants', []),
        }
    
    def _get_savings_criteria(self, signals: Dict[str, Any]) -> Dict[str, Any]:
        """Extract Savings Builder criteria."""
        savings = signals.get('savings', {})
        credit = signals.get('credit', {})
        
        return {
            'savings_growth_rate_pct': safe_get(savings, 'savings_growth_rate_pct', 0),
            'net_savings_inflow': safe_get(savings, 'net_savings_inflow', 0),
            'aggregate_utilization_pct': safe_get(credit, 'aggregate_utilization_pct', 0),
            'emergency_fund_months': safe_get(savings, 'emergency_fund_months', 0),
            'total_savings_balance': safe_get(savings, 'total_savings_balance', 0),
        }
    
    # ========================================================================
    # Helper Methods
    # ========================================================================
    
    def _no_persona_result(self, user_id: str) -> Dict[str, Any]:
        """Return result when no signals available."""
        return {
            'user_id': user_id,
            'primary_persona': 'none',
            'primary_match_strength': 'none',
            'secondary_personas': [],
            'criteria_met': {},
            'all_matches': [],
            'assigned_at': format_iso_timestamp(),
            'error': 'No signals available for user'
        }
    
    def _general_persona_result(
        self,
        user_id: str,
        signals: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Return result for general persona (no specific match)."""
        return {
            'user_id': user_id,
            'primary_persona': 'general',
            'primary_match_strength': 'default',
            'secondary_personas': [],
            'criteria_met': {
                'note': 'User does not match specific persona criteria'
            },
            'all_matches': ['general'],
            'assigned_at': format_iso_timestamp()
        }
    
    # ========================================================================
    # Storage
    # ========================================================================
    
    def store_assignment(self, assignment: Dict[str, Any]) -> str:
        """
        Store a persona assignment in the database.
        
        Args:
            assignment: Assignment dict from assign_personas()
            
        Returns:
            assignment_id: Unique identifier for the stored assignment
        """
        assignment_id = generate_id('persona_')
        
        cursor = self.db.cursor()
        cursor.execute("""
            INSERT INTO user_personas (
                assignment_id,
                user_id,
                window_type,
                primary_persona,
                primary_match_strength,
                secondary_personas,
                criteria_met,
                all_matches,
                assigned_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            assignment_id,
            assignment['user_id'],
            assignment.get('window_type', '30d'),
            assignment['primary_persona'],
            assignment['primary_match_strength'],
            json.dumps(assignment['secondary_personas']),
            json.dumps(assignment['criteria_met']),
            json.dumps(assignment['all_matches']),
            assignment['assigned_at']
        ))
        
        self.db.commit()
        return assignment_id

