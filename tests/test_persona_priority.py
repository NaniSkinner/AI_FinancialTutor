"""
Persona Priority Ordering Tests (Phase 2.6)

Tests that persona priority is correctly enforced:
1. High Utilization (highest priority)
2. Variable Income Budgeter
3. Student
4. Subscription-Heavy
5. Savings Builder (lowest priority)
6. General (fallback)
"""

import pytest
from personas.assignment import PersonaAssigner
from tests.personas.conftest import insert_test_user


class TestPersonaPriorityOrdering:
    """Test that personas are prioritized correctly when multiple match."""
    
    def test_high_util_beats_variable_income(self, test_db):
        """Test High Utilization > Variable Income Budgeter."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 55.0,  # Matches High Util
                'any_card_high_util': True,
                'any_interest_charges': True,
                'any_overdue': False,
                'num_credit_cards': 1
            },
            'income': {
                'median_pay_gap_days': 65,  # Matches Variable Income
                'cash_flow_buffer_months': 0.4,
                'income_variability_pct': 35.0,
                'payment_frequency': 'irregular',
                'income_type': 'freelance'
            },
            'subscriptions': {'recurring_merchant_count': 2, 'monthly_recurring_spend': 30.0},
            'savings': {'savings_growth_rate_pct': 1.0, 'net_savings_inflow': 100.0},
            'user_metadata': {'age_bracket': '26-35', 'annual_income': 40000}
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        # High Utilization should be primary (priority 1)
        assert result['primary_persona'] == 'high_utilization'
        # Variable Income should be in matches
        assert 'variable_income_budgeter' in result['all_matches']
    
    def test_high_util_beats_subscription_heavy(self, test_db):
        """Test High Utilization > Subscription-Heavy."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 60.0,  # Matches High Util
                'any_card_high_util': True,
                'any_interest_charges': True,
                'any_overdue': False,
                'num_credit_cards': 2
            },
            'income': {
                'median_pay_gap_days': 14,
                'cash_flow_buffer_months': 2.0,
                'income_variability_pct': 5.0,
                'payment_frequency': 'regular',
                'income_type': 'salary'
            },
            'subscriptions': {
                'recurring_merchant_count': 5,  # Matches Subscription-Heavy
                'monthly_recurring_spend': 127.50,
                'subscription_share_pct': 12.0,
                'merchants': ['Netflix', 'Spotify', 'HBO', 'Prime', 'Adobe']
            },
            'savings': {'savings_growth_rate_pct': 1.0, 'net_savings_inflow': 100.0},
            'user_metadata': {'age_bracket': '26-35', 'annual_income': 70000}
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        assert result['primary_persona'] == 'high_utilization'
        assert 'subscription_heavy' in result['all_matches']
    
    def test_high_util_beats_student(self, test_db):
        """Test High Utilization > Student."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 65.0,  # Matches High Util
                'any_card_high_util': True,
                'any_interest_charges': True,
                'any_overdue': False,
                'num_credit_cards': 1
            },
            'income': {
                'median_pay_gap_days': 30,
                'cash_flow_buffer_months': 0.5,
                'income_variability_pct': 20.0,
                'payment_frequency': 'irregular',
                'income_type': 'part_time'
            },
            'subscriptions': {
                'recurring_merchant_count': 2,
                'monthly_recurring_spend': 30.0,
                'coffee_food_delivery_monthly': 85.0
            },
            'savings': {'savings_growth_rate_pct': 0.5, 'net_savings_inflow': 50.0},
            'user_metadata': {
                'age_bracket': '18-25',  # Matches Student
                'annual_income': 20000,
                'student_loan_account_present': True,
                'has_rent_transactions': True,
                'has_mortgage': False,
                'transaction_count_monthly': 35,
                'essentials_pct': 45.0
            }
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        assert result['primary_persona'] == 'high_utilization'
        assert 'student' in result['all_matches']
    
    def test_high_util_beats_savings_builder(self, test_db):
        """Test High Utilization > Savings Builder (unusual case)."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 28.0,  # Just under 30% for savings
                'any_card_high_util': False,
                'any_interest_charges': True,  # But has interest - matches High Util
                'any_overdue': False,
                'num_credit_cards': 2
            },
            'income': {
                'median_pay_gap_days': 14,
                'cash_flow_buffer_months': 3.0,
                'income_variability_pct': 3.0,
                'payment_frequency': 'regular',
                'income_type': 'salary'
            },
            'subscriptions': {
                'recurring_merchant_count': 2,
                'monthly_recurring_spend': 30.0
            },
            'savings': {
                'savings_growth_rate_pct': 5.0,  # Matches Savings Builder
                'net_savings_inflow': 400.0,
                'total_savings_balance': 15000.0,
                'emergency_fund_months': 4.0
            },
            'user_metadata': {'age_bracket': '36-45', 'annual_income': 85000}
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        # High Util should win due to interest charges
        assert result['primary_persona'] == 'high_utilization'
        # Savings Builder should still be in matches
        assert 'savings_builder' in result['all_matches']
    
    def test_variable_income_beats_student(self, test_db):
        """Test Variable Income Budgeter > Student."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 20.0,
                'any_card_high_util': False,
                'any_interest_charges': False,
                'any_overdue': False,
                'num_credit_cards': 1
            },
            'income': {
                'median_pay_gap_days': 65,  # Matches Variable Income
                'cash_flow_buffer_months': 0.4,
                'income_variability_pct': 35.0,
                'payment_frequency': 'irregular',
                'income_type': 'part_time'
            },
            'subscriptions': {
                'recurring_merchant_count': 2,
                'monthly_recurring_spend': 30.0,
                'coffee_food_delivery_monthly': 80.0
            },
            'savings': {'savings_growth_rate_pct': 0.5, 'net_savings_inflow': 50.0},
            'user_metadata': {
                'age_bracket': '18-25',  # Matches Student
                'annual_income': 22000,
                'student_loan_account_present': False,
                'has_rent_transactions': True,
                'has_mortgage': False,
                'transaction_count_monthly': 40,
                'essentials_pct': 48.0
            }
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        assert result['primary_persona'] == 'variable_income_budgeter'
        assert 'student' in result['all_matches']
    
    def test_variable_income_beats_subscription_heavy(self, test_db):
        """Test Variable Income Budgeter > Subscription-Heavy."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 20.0,
                'any_card_high_util': False,
                'any_interest_charges': False,
                'any_overdue': False,
                'num_credit_cards': 1
            },
            'income': {
                'median_pay_gap_days': 65,  # Matches Variable Income
                'cash_flow_buffer_months': 0.4,
                'income_variability_pct': 35.0,
                'payment_frequency': 'irregular',
                'income_type': 'freelance'
            },
            'subscriptions': {
                'recurring_merchant_count': 5,  # Matches Subscription-Heavy
                'monthly_recurring_spend': 120.0,
                'subscription_share_pct': 12.0,
                'merchants': ['Netflix', 'Spotify', 'HBO', 'Prime', 'Adobe']
            },
            'savings': {'savings_growth_rate_pct': 1.0, 'net_savings_inflow': 100.0},
            'user_metadata': {'age_bracket': '26-35', 'annual_income': 45000}
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        assert result['primary_persona'] == 'variable_income_budgeter'
        assert 'subscription_heavy' in result['all_matches']
    
    def test_variable_income_beats_savings_builder(self, test_db):
        """Test Variable Income Budgeter > Savings Builder."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 20.0,  # <30% for savings
                'any_card_high_util': False,
                'any_interest_charges': False,
                'any_overdue': False,
                'num_credit_cards': 2
            },
            'income': {
                'median_pay_gap_days': 65,  # Matches Variable Income
                'cash_flow_buffer_months': 0.4,
                'income_variability_pct': 35.0,
                'payment_frequency': 'irregular',
                'income_type': 'freelance'
            },
            'subscriptions': {
                'recurring_merchant_count': 2,
                'monthly_recurring_spend': 30.0
            },
            'savings': {
                'savings_growth_rate_pct': 5.0,  # Matches Savings Builder
                'net_savings_inflow': 400.0,
                'total_savings_balance': 10000.0,
                'emergency_fund_months': 3.0
            },
            'user_metadata': {'age_bracket': '26-35', 'annual_income': 55000}
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        assert result['primary_persona'] == 'variable_income_budgeter'
        assert 'savings_builder' in result['all_matches']
    
    def test_student_beats_subscription_heavy(self, test_db):
        """Test Student > Subscription-Heavy."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 20.0,
                'any_card_high_util': False,
                'any_interest_charges': False,
                'any_overdue': False,
                'num_credit_cards': 1
            },
            'income': {
                'median_pay_gap_days': 14,
                'cash_flow_buffer_months': 1.0,
                'income_variability_pct': 10.0,
                'payment_frequency': 'irregular',
                'income_type': 'part_time'
            },
            'subscriptions': {
                'recurring_merchant_count': 5,  # Matches Subscription-Heavy
                'monthly_recurring_spend': 110.0,
                'subscription_share_pct': 12.0,
                'coffee_food_delivery_monthly': 95.0,
                'merchants': ['Netflix', 'Spotify', 'HBO', 'Prime', 'Adobe']
            },
            'savings': {'savings_growth_rate_pct': 0.5, 'net_savings_inflow': 50.0},
            'user_metadata': {
                'age_bracket': '18-25',  # Matches Student
                'annual_income': 25000,
                'student_loan_account_present': True,
                'has_rent_transactions': True,
                'has_mortgage': False,
                'transaction_count_monthly': 40,
                'essentials_pct': 45.0
            }
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        assert result['primary_persona'] == 'student'
        assert 'subscription_heavy' in result['all_matches']
    
    def test_student_beats_savings_builder(self, test_db):
        """Test Student > Savings Builder (unusual but possible)."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 15.0,  # <30% for savings
                'any_card_high_util': False,
                'any_interest_charges': False,
                'any_overdue': False,
                'num_credit_cards': 1
            },
            'income': {
                'median_pay_gap_days': 14,
                'cash_flow_buffer_months': 1.5,
                'income_variability_pct': 8.0,
                'payment_frequency': 'regular',
                'income_type': 'part_time'
            },
            'subscriptions': {
                'recurring_merchant_count': 2,
                'monthly_recurring_spend': 30.0,
                'coffee_food_delivery_monthly': 80.0
            },
            'savings': {
                'savings_growth_rate_pct': 3.0,  # Matches Savings Builder
                'net_savings_inflow': 200.0,
                'total_savings_balance': 5000.0,
                'emergency_fund_months': 2.0
            },
            'user_metadata': {
                'age_bracket': '18-25',  # Matches Student
                'annual_income': 28000,
                'student_loan_account_present': True,
                'has_rent_transactions': True,
                'has_mortgage': False,
                'transaction_count_monthly': 40,
                'essentials_pct': 48.0
            }
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        assert result['primary_persona'] == 'student'
        assert 'savings_builder' in result['all_matches']
    
    def test_subscription_heavy_beats_savings_builder(self, test_db):
        """Test Subscription-Heavy > Savings Builder."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 20.0,  # <30% for savings
                'any_card_high_util': False,
                'any_interest_charges': False,
                'any_overdue': False,
                'num_credit_cards': 2
            },
            'income': {
                'median_pay_gap_days': 14,
                'cash_flow_buffer_months': 2.5,
                'income_variability_pct': 5.0,
                'payment_frequency': 'regular',
                'income_type': 'salary'
            },
            'subscriptions': {
                'recurring_merchant_count': 6,  # Matches Subscription-Heavy
                'monthly_recurring_spend': 155.0,
                'subscription_share_pct': 14.0,
                'merchants': ['Netflix', 'Spotify', 'HBO', 'Prime', 'Gym', 'NYT']
            },
            'savings': {
                'savings_growth_rate_pct': 3.0,  # Matches Savings Builder
                'net_savings_inflow': 250.0,
                'total_savings_balance': 8000.0,
                'emergency_fund_months': 2.5
            },
            'user_metadata': {'age_bracket': '26-35', 'annual_income': 70000}
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        assert result['primary_persona'] == 'subscription_heavy'
        assert 'savings_builder' in result['all_matches']
    
    def test_multiple_persona_matches_all_tracked(self, test_db):
        """Test that all matching personas are tracked in all_matches."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 55.0,  # Matches High Util (priority 1)
                'any_card_high_util': True,
                'any_interest_charges': True,
                'any_overdue': False,
                'num_credit_cards': 1
            },
            'income': {
                'median_pay_gap_days': 65,  # Matches Variable Income (priority 2)
                'cash_flow_buffer_months': 0.4,
                'income_variability_pct': 35.0,
                'payment_frequency': 'irregular',
                'income_type': 'freelance'
            },
            'subscriptions': {
                'recurring_merchant_count': 5,  # Matches Subscription-Heavy (priority 4)
                'monthly_recurring_spend': 120.0,
                'subscription_share_pct': 12.0,
                'merchants': ['Netflix', 'Spotify', 'HBO', 'Prime', 'Adobe']
            },
            'savings': {'savings_growth_rate_pct': 1.0, 'net_savings_inflow': 100.0},
            'user_metadata': {'age_bracket': '26-35', 'annual_income': 45000}
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        # Primary should be highest priority (High Util)
        assert result['primary_persona'] == 'high_utilization'
        
        # Should have multiple matches
        assert len(result['all_matches']) >= 2
        assert 'high_utilization' in result['all_matches']
        assert 'variable_income_budgeter' in result['all_matches']
        assert 'subscription_heavy' in result['all_matches']
        
        # Secondary personas limited to 2
        assert len(result['secondary_personas']) <= 2
        assert 'variable_income_budgeter' in result['secondary_personas']


class TestGeneralPersonaFallback:
    """Test General persona assignment when no specific match (Phase 2.7)."""
    
    def test_general_persona_no_criteria_met(self, test_db):
        """Test general persona when no specific criteria met."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 15.0,  # Low, doesn't match High Util
                'any_card_high_util': False,
                'any_interest_charges': False,
                'any_overdue': False,
                'num_credit_cards': 1
            },
            'income': {
                'median_pay_gap_days': 14,  # Regular, doesn't match Variable Income
                'cash_flow_buffer_months': 1.5,
                'income_variability_pct': 8.0,
                'payment_frequency': 'regular',
                'income_type': 'salary'
            },
            'subscriptions': {
                'recurring_merchant_count': 2,  # Low, doesn't match Subscription-Heavy
                'monthly_recurring_spend': 30.0,
                'subscription_share_pct': 4.0
            },
            'savings': {
                'savings_growth_rate_pct': 1.0,  # Low, doesn't match Savings Builder
                'net_savings_inflow': 100.0,
                'total_savings_balance': 3000.0,
                'emergency_fund_months': 1.5
            },
            'user_metadata': {
                'age_bracket': '26-35',  # Not 18-25, doesn't match Student
                'annual_income': 50000,
                'student_loan_account_present': False,
                'has_rent_transactions': True,
                'has_mortgage': False,
                'transaction_count_monthly': 75,
                'essentials_pct': 60.0
            }
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        assert result['primary_persona'] == 'general'
        assert result['primary_match_strength'] == 'default'
        assert result['secondary_personas'] == []
        assert 'note' in result['criteria_met']
    
    def test_general_persona_explainability(self, test_db):
        """Test that general persona has explainability (criteria_met)."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 25.0,
                'any_card_high_util': False,
                'any_interest_charges': False,
                'any_overdue': False,
                'num_credit_cards': 1
            },
            'income': {
                'median_pay_gap_days': 14,
                'cash_flow_buffer_months': 2.0,
                'income_variability_pct': 5.0,
                'payment_frequency': 'regular',
                'income_type': 'salary'
            },
            'subscriptions': {
                'recurring_merchant_count': 2,
                'monthly_recurring_spend': 25.0,
                'subscription_share_pct': 3.0
            },
            'savings': {
                'savings_growth_rate_pct': 1.5,
                'net_savings_inflow': 150.0,
                'total_savings_balance': 4000.0,
                'emergency_fund_months': 1.8
            },
            'user_metadata': {
                'age_bracket': '36-45',
                'annual_income': 60000
            }
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        assert result['primary_persona'] == 'general'
        assert 'criteria_met' in result
        assert len(result['criteria_met']) > 0


class TestNonePersona:
    """Test 'none' persona for missing/invalid data (Phase 2.7)."""
    
    def test_none_persona_missing_signals(self, test_db):
        """Test 'none' persona when signals are missing."""
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
    
    def test_none_persona_invalid_data(self, test_db):
        """Test handling of invalid signal data."""
        signals = {
            # Only partial signals
            'subscriptions': {
                'recurring_merchant_count': 2,
                'monthly_recurring_spend': 30.0
            }
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        # Should fallback to none or general
        assert result['primary_persona'] in ['none', 'general']


class TestMatchStrength:
    """Test match strength calculation (Phase 2.8)."""
    
    def test_strong_match_strength(self, test_db):
        """Test that strong matches are identified correctly."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 75.0,  # Very high - strong match
                'any_card_high_util': True,
                'any_interest_charges': True,
                'any_overdue': True,
                'num_credit_cards': 2
            },
            'income': {'median_pay_gap_days': 14, 'cash_flow_buffer_months': 1.5},
            'subscriptions': {'recurring_merchant_count': 2, 'monthly_recurring_spend': 30.0},
            'savings': {'savings_growth_rate_pct': 0.5, 'net_savings_inflow': 50.0},
            'user_metadata': {'age_bracket': '26-35', 'annual_income': 45000}
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        assert result['primary_match_strength'] == 'strong'
    
    def test_moderate_match_strength(self, test_db):
        """Test that moderate matches are identified correctly."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 55.0,  # Moderate utilization
                'any_card_high_util': True,
                'any_interest_charges': True,
                'any_overdue': False,  # No overdue
                'num_credit_cards': 1
            },
            'income': {'median_pay_gap_days': 14, 'cash_flow_buffer_months': 1.5},
            'subscriptions': {'recurring_merchant_count': 2, 'monthly_recurring_spend': 30.0},
            'savings': {'savings_growth_rate_pct': 1.0, 'net_savings_inflow': 100.0},
            'user_metadata': {'age_bracket': '26-35', 'annual_income': 50000}
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        assert result['primary_match_strength'] == 'moderate'
    
    def test_weak_match_strength(self, test_db):
        """Test that weak matches are identified correctly."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 30.0,  # Low util
                'any_card_high_util': False,
                'any_interest_charges': True,  # Only interest charges - weak
                'any_overdue': False,
                'num_credit_cards': 1
            },
            'income': {'median_pay_gap_days': 14, 'cash_flow_buffer_months': 2.0},
            'subscriptions': {'recurring_merchant_count': 2, 'monthly_recurring_spend': 30.0},
            'savings': {'savings_growth_rate_pct': 1.0, 'net_savings_inflow': 100.0},
            'user_metadata': {'age_bracket': '26-35', 'annual_income': 50000}
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        assert result['primary_match_strength'] == 'weak'
    
    def test_default_match_strength(self, test_db):
        """Test that general persona has 'default' strength."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 20.0,
                'any_card_high_util': False,
                'any_interest_charges': False,
                'any_overdue': False,
                'num_credit_cards': 1
            },
            'income': {
                'median_pay_gap_days': 14,
                'cash_flow_buffer_months': 1.8,
                'income_variability_pct': 6.0,
                'payment_frequency': 'regular',
                'income_type': 'salary'
            },
            'subscriptions': {
                'recurring_merchant_count': 2,
                'monthly_recurring_spend': 28.0,
                'subscription_share_pct': 3.5
            },
            'savings': {
                'savings_growth_rate_pct': 1.2,
                'net_savings_inflow': 120.0,
                'total_savings_balance': 3500.0,
                'emergency_fund_months': 1.6
            },
            'user_metadata': {'age_bracket': '36-45', 'annual_income': 55000}
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        assert result['primary_persona'] == 'general'
        assert result['primary_match_strength'] == 'default'

