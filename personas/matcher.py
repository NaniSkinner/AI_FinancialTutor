"""
Match Strength Calculator Module

This module calculates match strength (strong/moderate/weak) for each persona
based on how well the user's signals meet the persona criteria.
"""

from typing import Dict, Any
from .utils import safe_get


class MatchStrengthCalculator:
    """
    Calculates match strength for persona assignments.
    
    Each persona has specific rules for determining if a match is:
    - Strong: User strongly exhibits persona characteristics
    - Moderate: User meets persona criteria reasonably well
    - Weak: User barely meets minimum criteria
    """
    
    def calculate_strength(self, persona: str, signals: Dict[str, Any]) -> str:
        """
        Calculate match strength for a persona.
        
        Args:
            persona: Persona name
            signals: User's financial signals
            
        Returns:
            'strong', 'moderate', or 'weak'
        """
        calculators = {
            'high_utilization': self._high_utilization_strength,
            'variable_income_budgeter': self._variable_income_strength,
            'student': self._student_strength,
            'subscription_heavy': self._subscription_heavy_strength,
            'savings_builder': self._savings_builder_strength,
        }
        
        calculator = calculators.get(persona)
        if calculator:
            return calculator(signals)
        
        return 'weak'
    
    def _high_utilization_strength(self, signals: Dict[str, Any]) -> str:
        """
        Calculate High Utilization match strength.
        
        Strong: utilization ≥70% OR any overdue accounts
        Moderate: utilization 50-69% with interest charges
        Weak: just meets minimum criteria
        """
        credit = signals.get('credit', {})
        
        utilization = safe_get(credit, 'aggregate_utilization_pct', 0)
        any_overdue = safe_get(credit, 'any_overdue', False)
        any_interest = safe_get(credit, 'any_interest_charges', False)
        
        # Strong: Very high utilization or overdue
        if utilization >= 70 or any_overdue:
            return 'strong'
        
        # Moderate: High utilization with interest
        if utilization >= 50 and any_interest:
            return 'moderate'
        
        # Weak: Just meets minimum
        return 'weak'
    
    def _variable_income_strength(self, signals: Dict[str, Any]) -> str:
        """
        Calculate Variable Income match strength.
        
        Strong: buffer <0.5 months AND variability >30%
        Moderate: buffer <1.0 months AND variability >20%
        Weak: just meets minimum criteria
        """
        income = signals.get('income', {})
        
        buffer = safe_get(income, 'cash_flow_buffer_months', 999)
        variability = safe_get(income, 'income_variability_pct', 0)
        
        # Strong: Very low buffer and high variability
        if buffer < 0.5 and variability > 30:
            return 'strong'
        
        # Moderate: Low buffer and moderate variability
        if buffer < 1.0 and variability > 20:
            return 'moderate'
        
        # Weak: Just meets minimum
        return 'weak'
    
    def _student_strength(self, signals: Dict[str, Any]) -> str:
        """
        Calculate Student match strength.
        
        Strong: has student loan AND ≥3 supporting criteria
        Moderate: 1 major + 2 supporting criteria
        Weak: just meets minimum
        """
        metadata = signals.get('user_metadata', {})
        income = signals.get('income', {})
        subscriptions = signals.get('subscriptions', {})
        credit = signals.get('credit', {})
        
        has_loan = safe_get(metadata, 'student_loan_account_present', False)
        
        # Count supporting criteria
        supporting_count = 0
        
        annual_income = safe_get(metadata, 'annual_income', 999999)
        if annual_income < 30000:
            supporting_count += 1
        
        payment_freq = safe_get(income, 'payment_frequency', '')
        if payment_freq == 'irregular':
            supporting_count += 1
        
        coffee_spend = safe_get(subscriptions, 'coffee_food_delivery_monthly', 0)
        if coffee_spend >= 75:
            supporting_count += 1
        
        num_cards = safe_get(credit, 'num_credit_cards', 999)
        if num_cards <= 2:
            supporting_count += 1
        
        has_rent = safe_get(metadata, 'has_rent_transactions', False)
        has_mortgage = safe_get(metadata, 'has_mortgage', False)
        if has_rent and not has_mortgage:
            supporting_count += 1
        
        # Strong: Has loan + many supporting criteria
        if has_loan and supporting_count >= 3:
            return 'strong'
        
        # Moderate: Multiple supporting criteria
        if supporting_count >= 2:
            return 'moderate'
        
        # Weak: Just meets minimum
        return 'weak'
    
    def _subscription_heavy_strength(self, signals: Dict[str, Any]) -> str:
        """
        Calculate Subscription-Heavy match strength.
        
        Strong: ≥5 subscriptions AND share ≥15%
        Moderate: ≥3 subscriptions AND share ≥10%
        Weak: just meets minimum criteria
        """
        subscriptions = signals.get('subscriptions', {})
        
        count = safe_get(subscriptions, 'recurring_merchant_count', 0)
        share = safe_get(subscriptions, 'subscription_share_pct', 0)
        
        # Strong: Many subscriptions with high share
        if count >= 5 and share >= 15:
            return 'strong'
        
        # Moderate: Moderate subscriptions and share
        if count >= 3 and share >= 10:
            return 'moderate'
        
        # Weak: Just meets minimum
        return 'weak'
    
    def _savings_builder_strength(self, signals: Dict[str, Any]) -> str:
        """
        Calculate Savings Builder match strength.
        
        Strong: growth ≥5% AND inflow ≥$400
        Moderate: growth ≥2% OR inflow ≥$200
        Weak: just meets minimum
        """
        savings = signals.get('savings', {})
        
        growth = safe_get(savings, 'savings_growth_rate_pct', 0)
        inflow = safe_get(savings, 'net_savings_inflow', 0)
        
        # Strong: High growth and high inflow
        if growth >= 5 and inflow >= 400:
            return 'strong'
        
        # Moderate: Good growth or good inflow
        if growth >= 2 or inflow >= 200:
            return 'moderate'
        
        # Weak: Just meets minimum
        return 'weak'

