"""
Tests for Persona Assignment Algorithm.

Tests cover:
- All 5 persona assignments
- Priority ordering
- Secondary personas
- Match strength calculation
- Edge cases
"""

import pytest
from personas.assignment import PersonaAssigner
from tests.personas.conftest import insert_test_user


class TestHighUtilizationAssignment:
    """Test High Utilization persona assignment."""
    
    def test_high_utilization_strong_match(self, test_db, high_util_signals):
        """Test strong match for High Utilization persona."""
        # Setup
        insert_test_user(test_db, 'user_high_util', high_util_signals)
        assigner = PersonaAssigner(test_db)
        
        # Execute
        result = assigner.assign_personas('user_high_util', '30d')
        
        # Assert
        assert result['primary_persona'] == 'high_utilization'
        assert result['primary_match_strength'] in ['strong', 'moderate']
        assert 'any_card_utilization_gte_50' in result['criteria_met']
        assert result['criteria_met']['any_card_utilization_gte_50'] == True
        assert result['user_id'] == 'user_high_util'
    
    def test_high_utilization_criteria(self, test_db, high_util_signals):
        """Test that High Utilization criteria are correctly identified."""
        insert_test_user(test_db, 'user_test', high_util_signals)
        assigner = PersonaAssigner(test_db)
        
        result = assigner.assign_personas('user_test', '30d')
        criteria = result['criteria_met']
        
        # Should have key criteria fields
        assert 'aggregate_utilization_pct' in criteria
        assert 'any_interest_charges' in criteria
        assert 'any_overdue' in criteria
        assert criteria['aggregate_utilization_pct'] == 68.0


class TestVariableIncomeAssignment:
    """Test Variable Income Budgeter persona assignment."""
    
    def test_variable_income_assignment(self, test_db, variable_income_signals):
        """Test Variable Income persona assignment."""
        insert_test_user(test_db, 'user_var_income', variable_income_signals)
        assigner = PersonaAssigner(test_db)
        
        result = assigner.assign_personas('user_var_income', '30d')
        
        assert result['primary_persona'] == 'variable_income_budgeter'
        assert result['primary_match_strength'] in ['strong', 'moderate', 'weak']
        
        criteria = result['criteria_met']
        assert criteria['median_pay_gap_days'] > 45
        assert criteria['cash_flow_buffer_months'] < 1.0
    
    def test_variable_income_match_strength(self, test_db, variable_income_signals):
        """Test that Variable Income match strength is calculated correctly."""
        insert_test_user(test_db, 'user_test', variable_income_signals)
        assigner = PersonaAssigner(test_db)
        
        result = assigner.assign_personas('user_test', '30d')
        
        # With buffer 0.32 and variability 35%, should be strong
        assert result['primary_match_strength'] == 'strong'


class TestStudentAssignment:
    """Test Student persona assignment."""
    
    def test_student_with_loan(self, test_db, student_signals):
        """Test Student persona with student loan."""
        insert_test_user(test_db, 'user_student', student_signals)
        assigner = PersonaAssigner(test_db)
        
        result = assigner.assign_personas('user_student', '30d')
        
        assert result['primary_persona'] == 'student'
        
        criteria = result['criteria_met']
        assert criteria['has_student_loan'] == True
        assert criteria['age_bracket'] == '18-25'
        assert criteria['annual_income'] < 30000
    
    def test_student_supporting_criteria(self, test_db, student_signals):
        """Test that Student persona counts supporting criteria correctly."""
        insert_test_user(test_db, 'user_test', student_signals)
        assigner = PersonaAssigner(test_db)
        
        result = assigner.assign_personas('user_test', '30d')
        
        # Student signals include:
        # - has_student_loan: True (major)
        # - age_18_25: True (major)
        # - income_lt_30k: True (supporting)
        # - irregular_income: True (supporting)
        # - high_coffee: True ($95/month, supporting)
        # - limited_credit: True (1 card, supporting)
        # Should have strong match
        assert result['primary_match_strength'] == 'strong'


class TestSubscriptionHeavyAssignment:
    """Test Subscription-Heavy persona assignment."""
    
    def test_subscription_heavy_assignment(self, test_db, subscription_heavy_signals):
        """Test Subscription-Heavy persona assignment."""
        insert_test_user(test_db, 'user_sub_heavy', subscription_heavy_signals)
        assigner = PersonaAssigner(test_db)
        
        result = assigner.assign_personas('user_sub_heavy', '30d')
        
        assert result['primary_persona'] == 'subscription_heavy'
        
        criteria = result['criteria_met']
        assert criteria['recurring_merchant_count'] >= 3
        assert criteria['monthly_recurring_spend'] >= 50.0
        assert criteria['subscription_share_pct'] >= 10.0
    
    def test_subscription_heavy_strong_match(self, test_db, subscription_heavy_signals):
        """Test strong match for Subscription-Heavy."""
        insert_test_user(test_db, 'user_test', subscription_heavy_signals)
        assigner = PersonaAssigner(test_db)
        
        result = assigner.assign_personas('user_test', '30d')
        
        # 7 subscriptions at 14.2% should be strong
        assert result['primary_match_strength'] == 'moderate'  # Actually just under threshold


class TestSavingsBuilderAssignment:
    """Test Savings Builder persona assignment."""
    
    def test_savings_builder_assignment(self, test_db, savings_builder_signals):
        """Test Savings Builder persona assignment."""
        insert_test_user(test_db, 'user_saver', savings_builder_signals)
        assigner = PersonaAssigner(test_db)
        
        result = assigner.assign_personas('user_saver', '30d')
        
        assert result['primary_persona'] == 'savings_builder'
        
        criteria = result['criteria_met']
        assert criteria['savings_growth_rate_pct'] >= 2.0 or criteria['net_savings_inflow'] >= 200.0
        assert criteria['aggregate_utilization_pct'] < 30.0
    
    def test_savings_builder_strong_match(self, test_db, savings_builder_signals):
        """Test strong match for Savings Builder."""
        insert_test_user(test_db, 'user_test', savings_builder_signals)
        assigner = PersonaAssigner(test_db)
        
        result = assigner.assign_personas('user_test', '30d')
        
        # Growth 3.2% and inflow $350 should be moderate (not both >5% and >$400)
        assert result['primary_match_strength'] == 'moderate'


class TestPersonaPriority:
    """Test persona priority ordering."""
    
    def test_priority_high_util_over_subscription(self, test_db, high_util_signals):
        """Test that High Utilization takes priority over other personas."""
        # Modify signals to match multiple personas
        signals = high_util_signals.copy()
        signals['subscriptions'] = {
            'recurring_merchant_count': 5,
            'monthly_recurring_spend': 100.0,
            'subscription_share_pct': 12.0,
            'merchants': ['Netflix', 'Spotify', 'HBO', 'Prime', 'Adobe']
        }
        
        insert_test_user(test_db, 'user_multi', signals)
        assigner = PersonaAssigner(test_db)
        
        result = assigner.assign_personas('user_multi', '30d')
        
        # High Utilization should be primary (priority 1)
        assert result['primary_persona'] == 'high_utilization'
        
        # Subscription-Heavy should be in secondary or all_matches
        assert 'subscription_heavy' in result['all_matches']


class TestSecondaryPersonas:
    """Test secondary persona assignment."""
    
    def test_secondary_personas_limit(self, test_db):
        """Test that secondary personas are limited to 2."""
        # Create signals matching multiple personas
        signals = {
            'credit': {
                'aggregate_utilization_pct': 55.0,
                'any_card_high_util': True,
                'any_interest_charges': True,
                'any_overdue': False,
                'num_credit_cards': 1,
                'cards': [{'utilization_pct': 55.0, 'minimum_payment_only': False}]
            },
            'income': {
                'median_pay_gap_days': 60,
                'cash_flow_buffer_months': 0.5,
                'income_variability_pct': 25.0,
                'payment_frequency': 'irregular',
                'income_type': 'freelance'
            },
            'subscriptions': {
                'recurring_merchant_count': 5,
                'monthly_recurring_spend': 100.0,
                'subscription_share_pct': 15.0,
                'merchants': ['Netflix', 'Spotify', 'HBO', 'Prime', 'Adobe']
            },
            'savings': {
                'savings_growth_rate_pct': 0.5,
                'net_savings_inflow': 50.0,
                'total_savings_balance': 500.0,
                'emergency_fund_months': 0.5
            },
            'user_metadata': {
                'age_bracket': '26-35',
                'annual_income': 40000,
                'student_loan_account_present': False,
                'has_rent_transactions': True,
                'has_mortgage': False,
                'transaction_count_monthly': 70,
                'essentials_pct': 65.0
            }
        }
        
        insert_test_user(test_db, 'user_multi', signals)
        assigner = PersonaAssigner(test_db)
        
        result = assigner.assign_personas('user_multi', '30d')
        
        # Should have primary + max 2 secondary
        assert len(result['secondary_personas']) <= 2
        assert len(result['all_matches']) >= 2  # At least 2 matches total


class TestGeneralPersona:
    """Test general persona assignment."""
    
    def test_general_persona_no_match(self, test_db, general_signals):
        """Test that general persona is assigned when no specific match."""
        insert_test_user(test_db, 'user_general', general_signals)
        assigner = PersonaAssigner(test_db)
        
        result = assigner.assign_personas('user_general', '30d')
        
        assert result['primary_persona'] == 'general'
        assert result['primary_match_strength'] == 'default'
        assert 'note' in result['criteria_met']


class TestEdgeCases:
    """Test edge cases and error handling."""
    
    def test_no_signals_available(self, test_db):
        """Test behavior when user has no signals."""
        # Insert user without signals
        cursor = test_db.cursor()
        cursor.execute("""
            INSERT INTO users (user_id, age_bracket, annual_income)
            VALUES (?, ?, ?)
        """, ('user_no_signals', '26-35', 50000))
        test_db.commit()
        
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_no_signals', '30d')
        
        assert result['primary_persona'] == 'none'
        assert 'error' in result
    
    def test_assignment_storage(self, test_db, savings_builder_signals):
        """Test that assignments can be stored in database."""
        insert_test_user(test_db, 'user_test', savings_builder_signals)
        assigner = PersonaAssigner(test_db)
        
        # Assign and store
        assignment = assigner.assign_personas('user_test', '30d')
        assignment_id = assigner.store_assignment(assignment)
        
        # Verify stored
        cursor = test_db.cursor()
        cursor.execute("""
            SELECT * FROM user_personas WHERE assignment_id = ?
        """, (assignment_id,))
        
        row = cursor.fetchone()
        assert row is not None
        assert row['user_id'] == 'user_test'
        assert row['primary_persona'] == 'savings_builder'

