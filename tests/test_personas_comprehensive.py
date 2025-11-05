"""
Comprehensive Unit Tests for Persona Assignment

This test suite covers all persona assignment scenarios from PRD3-5:
- All 5 persona assignments with edge cases
- Threshold boundary testing
- Priority ordering
- Match strength calculation
- Secondary persona assignment
- Missing/invalid data handling
"""

import pytest
import sqlite3
from personas.assignment import PersonaAssigner
from tests.personas.conftest import insert_test_user


# ============================================================================
# High Utilization Persona Tests (Phase 2.1)
# ============================================================================

class TestHighUtilizationPersona:
    """Comprehensive tests for High Utilization persona."""
    
    def test_strong_match_high_utilization(self, test_db):
        """Test strong match with util ≥70%."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 72.0,
                'any_card_high_util': True,
                'any_interest_charges': True,
                'any_overdue': True,
                'num_credit_cards': 2,
                'cards': [
                    {'utilization_pct': 72.0, 'minimum_payment_only': False},
                    {'utilization_pct': 45.0, 'minimum_payment_only': False},
                ]
            },
            'income': {'median_pay_gap_days': 14, 'cash_flow_buffer_months': 1.5},
            'subscriptions': {'recurring_merchant_count': 2, 'monthly_recurring_spend': 30.0},
            'savings': {'savings_growth_rate_pct': 0.5, 'net_savings_inflow': 50.0},
            'user_metadata': {
                'age_bracket': '26-35',
                'annual_income': 45000,
                'student_loan_account_present': False,
                'has_rent_transactions': True,
                'has_mortgage': False,
                'transaction_count_monthly': 80,
                'essentials_pct': 65.0
            }
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        assert result['primary_persona'] == 'high_utilization'
        assert result['primary_match_strength'] == 'strong'
        assert result['criteria_met']['any_card_utilization_gte_50'] == True
        assert result['criteria_met']['aggregate_utilization_pct'] == 72.0
    
    def test_strong_match_overdue_payments(self, test_db):
        """Test strong match with overdue payments alone."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 35.0,
                'any_card_high_util': False,
                'any_interest_charges': True,
                'any_overdue': True,  # This triggers strong match
                'num_credit_cards': 1,
                'cards': [
                    {'utilization_pct': 35.0, 'minimum_payment_only': True},
                ]
            },
            'income': {'median_pay_gap_days': 14, 'cash_flow_buffer_months': 1.0},
            'subscriptions': {'recurring_merchant_count': 1, 'monthly_recurring_spend': 15.0},
            'savings': {'savings_growth_rate_pct': 0.0, 'net_savings_inflow': 0.0},
            'user_metadata': {'age_bracket': '26-35', 'annual_income': 50000}
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        assert result['primary_persona'] == 'high_utilization'
        assert result['criteria_met']['any_overdue'] == True
    
    def test_moderate_match_util_50_69_with_interest(self, test_db):
        """Test moderate match with util 50-69% and interest charges."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 55.0,
                'any_card_high_util': True,
                'any_interest_charges': True,
                'any_overdue': False,
                'num_credit_cards': 1,
                'cards': [
                    {'utilization_pct': 55.0, 'minimum_payment_only': False},
                ]
            },
            'income': {'median_pay_gap_days': 14, 'cash_flow_buffer_months': 1.5},
            'subscriptions': {'recurring_merchant_count': 2, 'monthly_recurring_spend': 30.0},
            'savings': {'savings_growth_rate_pct': 1.0, 'net_savings_inflow': 100.0},
            'user_metadata': {'age_bracket': '26-35', 'annual_income': 50000}
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        assert result['primary_persona'] == 'high_utilization'
        assert result['primary_match_strength'] == 'moderate'
    
    def test_weak_match_interest_charges_only(self, test_db):
        """Test weak match on interest charges alone (no high util, no overdue)."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 25.0,
                'any_card_high_util': False,
                'any_interest_charges': True,  # This alone should still match
                'any_overdue': False,
                'num_credit_cards': 1,
                'cards': [
                    {'utilization_pct': 25.0, 'minimum_payment_only': False},
                ]
            },
            'income': {'median_pay_gap_days': 14, 'cash_flow_buffer_months': 2.0},
            'subscriptions': {'recurring_merchant_count': 2, 'monthly_recurring_spend': 30.0},
            'savings': {'savings_growth_rate_pct': 1.0, 'net_savings_inflow': 100.0},
            'user_metadata': {'age_bracket': '26-35', 'annual_income': 50000}
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        assert result['primary_persona'] == 'high_utilization'
        assert result['primary_match_strength'] == 'weak'
        assert result['criteria_met']['any_interest_charges'] == True
    
    def test_threshold_exactly_50_percent(self, test_db):
        """Test exactly 50% utilization (boundary test)."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 50.0,
                'any_card_high_util': True,
                'any_interest_charges': False,
                'any_overdue': False,
                'num_credit_cards': 1,
                'cards': [
                    {'utilization_pct': 50.0, 'minimum_payment_only': False},
                ]
            },
            'income': {'median_pay_gap_days': 14, 'cash_flow_buffer_months': 1.5},
            'subscriptions': {'recurring_merchant_count': 2, 'monthly_recurring_spend': 30.0},
            'savings': {'savings_growth_rate_pct': 1.0, 'net_savings_inflow': 100.0},
            'user_metadata': {'age_bracket': '26-35', 'annual_income': 50000}
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        assert result['primary_persona'] == 'high_utilization'
        assert result['criteria_met']['any_card_utilization_gte_50'] == True
    
    def test_threshold_exactly_70_percent(self, test_db):
        """Test exactly 70% utilization (strong match boundary)."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 70.0,
                'any_card_high_util': True,
                'any_interest_charges': True,
                'any_overdue': False,
                'num_credit_cards': 1,
                'cards': [
                    {'utilization_pct': 70.0, 'minimum_payment_only': False},
                ]
            },
            'income': {'median_pay_gap_days': 14, 'cash_flow_buffer_months': 1.5},
            'subscriptions': {'recurring_merchant_count': 2, 'monthly_recurring_spend': 30.0},
            'savings': {'savings_growth_rate_pct': 1.0, 'net_savings_inflow': 100.0},
            'user_metadata': {'age_bracket': '26-35', 'annual_income': 50000}
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        assert result['primary_persona'] == 'high_utilization'
        assert result['primary_match_strength'] == 'strong'
    
    def test_missing_credit_data(self, test_db):
        """Test handling of missing credit data."""
        signals = {
            'income': {'median_pay_gap_days': 14, 'cash_flow_buffer_months': 1.5},
            'subscriptions': {'recurring_merchant_count': 2, 'monthly_recurring_spend': 30.0},
            'savings': {'savings_growth_rate_pct': 1.0, 'net_savings_inflow': 100.0},
            'user_metadata': {'age_bracket': '26-35', 'annual_income': 50000}
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        # Should not match high_utilization without credit data
        assert result['primary_persona'] != 'high_utilization'


# ============================================================================
# Variable Income Budgeter Tests (Phase 2.2)
# ============================================================================

class TestVariableIncomeBudgeterPersona:
    """Comprehensive tests for Variable Income Budgeter persona."""
    
    def test_strong_match_all_criteria(self, test_db):
        """Test strong match with buffer <0.5 AND variability >30%."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 25.0,
                'any_card_high_util': False,
                'any_interest_charges': False,
                'any_overdue': False,
                'num_credit_cards': 1
            },
            'income': {
                'median_pay_gap_days': 65,  # ≥60 days
                'cash_flow_buffer_months': 0.4,  # <0.5 months
                'income_variability_pct': 35.0,  # >30%
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
        
        assert result['primary_persona'] == 'variable_income_budgeter'
        assert result['primary_match_strength'] == 'strong'
        assert result['criteria_met']['median_pay_gap_days'] == 65
        assert result['criteria_met']['cash_flow_buffer_months'] == 0.4
        assert result['criteria_met']['income_variability_pct'] == 35.0
    
    def test_moderate_match_two_out_of_three(self, test_db):
        """Test moderate match with 2 out of 3 criteria."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 20.0,
                'any_card_high_util': False,
                'any_interest_charges': False,
                'any_overdue': False,
                'num_credit_cards': 1
            },
            'income': {
                'median_pay_gap_days': 65,  # ✓ ≥60 days
                'cash_flow_buffer_months': 1.0,  # ✗ Not <0.5
                'income_variability_pct': 35.0,  # ✓ >30%
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
        
        assert result['primary_persona'] == 'variable_income_budgeter'
        assert result['primary_match_strength'] == 'moderate'
    
    def test_buffer_alone_no_match(self, test_db):
        """Test that buffer alone doesn't match (need AND logic)."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 20.0,
                'any_card_high_util': False,
                'any_interest_charges': False,
                'any_overdue': False,
                'num_credit_cards': 1
            },
            'income': {
                'median_pay_gap_days': 14,  # Regular pay
                'cash_flow_buffer_months': 0.3,  # Low buffer
                'income_variability_pct': 5.0,  # Low variability
                'payment_frequency': 'regular',
                'income_type': 'salary'
            },
            'subscriptions': {'recurring_merchant_count': 2, 'monthly_recurring_spend': 30.0},
            'savings': {'savings_growth_rate_pct': 1.0, 'net_savings_inflow': 100.0},
            'user_metadata': {'age_bracket': '26-35', 'annual_income': 50000}
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        # Should not match variable_income with only one criterion
        assert result['primary_persona'] != 'variable_income_budgeter'
    
    def test_pay_gap_alone_no_match(self, test_db):
        """Test that pay gap alone doesn't match."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 20.0,
                'any_card_high_util': False,
                'any_interest_charges': False,
                'any_overdue': False,
                'num_credit_cards': 1
            },
            'income': {
                'median_pay_gap_days': 65,  # Long gap
                'cash_flow_buffer_months': 2.0,  # Good buffer
                'income_variability_pct': 10.0,  # Low variability
                'payment_frequency': 'irregular',
                'income_type': 'freelance'
            },
            'subscriptions': {'recurring_merchant_count': 2, 'monthly_recurring_spend': 30.0},
            'savings': {'savings_growth_rate_pct': 1.0, 'net_savings_inflow': 100.0},
            'user_metadata': {'age_bracket': '26-35', 'annual_income': 50000}
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        # Should not match with only one criterion
        assert result['primary_persona'] != 'variable_income_budgeter'
    
    def test_threshold_exactly_60_days(self, test_db):
        """Test exactly 60 day pay gap (boundary test)."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 20.0,
                'any_card_high_util': False,
                'any_interest_charges': False,
                'any_overdue': False,
                'num_credit_cards': 1
            },
            'income': {
                'median_pay_gap_days': 60,  # Exactly at threshold
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
        
        assert result['primary_persona'] == 'variable_income_budgeter'
    
    def test_threshold_exactly_half_month_buffer(self, test_db):
        """Test exactly 0.5 month buffer (boundary test)."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 20.0,
                'any_card_high_util': False,
                'any_interest_charges': False,
                'any_overdue': False,
                'num_credit_cards': 1
            },
            'income': {
                'median_pay_gap_days': 65,
                'cash_flow_buffer_months': 0.5,  # Exactly at threshold
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
        
        # 0.5 is NOT <0.5, so should need other criteria for strong match
        assert result['primary_persona'] == 'variable_income_budgeter'
        # Match strength should be moderate (2/3 criteria)
        assert result['primary_match_strength'] in ['moderate', 'weak']


# ============================================================================
# Student Persona Tests (Phase 2.3)
# ============================================================================

class TestStudentPersona:
    """Comprehensive tests for Student persona."""
    
    def test_strong_match_loan_plus_3_supporting(self, test_db):
        """Test strong match with student loan + 3 supporting criteria."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 15.0,
                'any_card_high_util': False,
                'any_interest_charges': False,
                'any_overdue': False,
                'num_credit_cards': 1  # Supporting #1: Limited credit history
            },
            'income': {
                'median_pay_gap_days': 30,
                'cash_flow_buffer_months': 0.5,
                'income_variability_pct': 25.0,
                'payment_frequency': 'irregular',  # Supporting #2: Irregular income
                'income_type': 'part_time'
            },
            'subscriptions': {
                'recurring_merchant_count': 2,
                'monthly_recurring_spend': 30.0,
                'subscription_share_pct': 8.0,
                'coffee_food_delivery_monthly': 95.0  # Supporting #3: High coffee/delivery spend
            },
            'savings': {
                'savings_growth_rate_pct': 0.5,
                'net_savings_inflow': 50.0,
                'total_savings_balance': 500.0,
                'emergency_fund_months': 0.2
            },
            'user_metadata': {
                'age_bracket': '18-25',  # Supporting #4: Age 18-25
                'annual_income': 18000,  # Supporting #5: Low income <$30k
                'student_loan_account_present': True,  # MAJOR: Student loan
                'has_rent_transactions': True,  # Supporting #6: Has rent
                'has_mortgage': False,
                'transaction_count_monthly': 35,  # Supporting #7: Low transaction count
                'essentials_pct': 45.0  # Supporting #8: Essentials <50%
            }
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        assert result['primary_persona'] == 'student'
        assert result['primary_match_strength'] == 'strong'
        assert result['criteria_met']['has_student_loan'] == True
    
    def test_moderate_match_age_plus_2_supporting(self, test_db):
        """Test moderate match with age 18-25 + 2 supporting (no loan)."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 20.0,
                'any_card_high_util': False,
                'any_interest_charges': False,
                'any_overdue': False,
                'num_credit_cards': 1  # Supporting #1
            },
            'income': {
                'median_pay_gap_days': 14,
                'cash_flow_buffer_months': 1.0,
                'income_variability_pct': 10.0,
                'payment_frequency': 'regular',
                'income_type': 'part_time'
            },
            'subscriptions': {
                'recurring_merchant_count': 2,
                'monthly_recurring_spend': 30.0,
                'subscription_share_pct': 5.0,
                'coffee_food_delivery_monthly': 85.0  # Supporting #2
            },
            'savings': {
                'savings_growth_rate_pct': 1.0,
                'net_savings_inflow': 100.0
            },
            'user_metadata': {
                'age_bracket': '18-25',  # MAJOR: Age
                'annual_income': 25000,  # Supporting #3
                'student_loan_account_present': False,
                'has_rent_transactions': True,
                'has_mortgage': False,
                'transaction_count_monthly': 45,
                'essentials_pct': 60.0
            }
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        assert result['primary_persona'] == 'student'
        assert result['primary_match_strength'] in ['moderate', 'weak']
    
    def test_supporting_only_no_match(self, test_db):
        """Test that supporting criteria alone don't match (need major)."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 20.0,
                'any_card_high_util': False,
                'any_interest_charges': False,
                'any_overdue': False,
                'num_credit_cards': 1  # Supporting
            },
            'income': {
                'median_pay_gap_days': 30,
                'cash_flow_buffer_months': 0.5,
                'income_variability_pct': 25.0,
                'payment_frequency': 'irregular',  # Supporting
                'income_type': 'part_time'
            },
            'subscriptions': {
                'recurring_merchant_count': 2,
                'monthly_recurring_spend': 30.0,
                'coffee_food_delivery_monthly': 80.0  # Supporting
            },
            'savings': {
                'savings_growth_rate_pct': 1.0,
                'net_savings_inflow': 100.0
            },
            'user_metadata': {
                'age_bracket': '26-35',  # NOT 18-25
                'annual_income': 28000,  # Supporting
                'student_loan_account_present': False,  # NO loan
                'has_rent_transactions': True,  # Supporting
                'has_mortgage': False,
                'transaction_count_monthly': 40,  # Supporting
                'essentials_pct': 48.0  # Supporting
            }
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        # Should not match without major criterion
        assert result['primary_persona'] != 'student'


# ============================================================================
# Subscription-Heavy Persona Tests (Phase 2.4)
# ============================================================================

class TestSubscriptionHeavyPersona:
    """Comprehensive tests for Subscription-Heavy persona."""
    
    def test_strong_match_5_plus_subs_15_percent_share(self, test_db):
        """Test strong match with ≥5 subs AND share ≥15%."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 20.0,
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
                'recurring_merchant_count': 6,
                'monthly_recurring_spend': 165.0,
                'subscription_share_pct': 16.5,  # ≥15%
                'merchants': ['Netflix', 'Spotify', 'HBO Max', 'Amazon Prime', 'Planet Fitness', 'NYT Digital']
            },
            'savings': {
                'savings_growth_rate_pct': 1.5,
                'net_savings_inflow': 250.0
            },
            'user_metadata': {
                'age_bracket': '26-35',
                'annual_income': 70000
            }
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        assert result['primary_persona'] == 'subscription_heavy'
        assert result['primary_match_strength'] == 'strong'
        assert result['criteria_met']['recurring_merchant_count'] == 6
        assert result['criteria_met']['subscription_share_pct'] == 16.5
    
    def test_moderate_match_3_to_4_subs_10_percent_share(self, test_db):
        """Test moderate match with 3-4 subs AND share 10-14%."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 20.0,
                'any_card_high_util': False,
                'any_interest_charges': False,
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
                'recurring_merchant_count': 4,
                'monthly_recurring_spend': 110.0,
                'subscription_share_pct': 12.0,  # 10-14%
                'merchants': ['Netflix', 'Spotify', 'HBO Max', 'Amazon Prime']
            },
            'savings': {
                'savings_growth_rate_pct': 1.5,
                'net_savings_inflow': 250.0
            },
            'user_metadata': {
                'age_bracket': '26-35',
                'annual_income': 70000
            }
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        assert result['primary_persona'] == 'subscription_heavy'
        assert result['primary_match_strength'] == 'moderate'
    
    def test_match_by_spend_threshold_50(self, test_db):
        """Test match by spend ≥$50 even with low share."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 20.0,
                'any_card_high_util': False,
                'any_interest_charges': False,
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
                'recurring_merchant_count': 2,
                'monthly_recurring_spend': 55.0,  # ≥$50
                'subscription_share_pct': 4.0,  # Low share
                'merchants': ['Netflix', 'Gym']
            },
            'savings': {
                'savings_growth_rate_pct': 1.5,
                'net_savings_inflow': 250.0
            },
            'user_metadata': {
                'age_bracket': '26-35',
                'annual_income': 70000
            }
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        assert result['primary_persona'] == 'subscription_heavy'
    
    def test_threshold_exactly_3_subscriptions(self, test_db):
        """Test exactly 3 subscriptions (boundary test)."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 20.0,
                'any_card_high_util': False,
                'any_interest_charges': False,
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
                'recurring_merchant_count': 3,  # Exactly 3
                'monthly_recurring_spend': 90.0,
                'subscription_share_pct': 10.0,  # Exactly 10%
                'merchants': ['Netflix', 'Spotify', 'Gym']
            },
            'savings': {
                'savings_growth_rate_pct': 1.5,
                'net_savings_inflow': 250.0
            },
            'user_metadata': {
                'age_bracket': '26-35',
                'annual_income': 70000
            }
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        assert result['primary_persona'] == 'subscription_heavy'
    
    def test_threshold_exactly_50_dollars(self, test_db):
        """Test exactly $50 spend (boundary test)."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 20.0,
                'any_card_high_util': False,
                'any_interest_charges': False,
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
                'recurring_merchant_count': 2,
                'monthly_recurring_spend': 50.0,  # Exactly $50
                'subscription_share_pct': 5.0,
                'merchants': ['Netflix', 'Spotify']
            },
            'savings': {
                'savings_growth_rate_pct': 1.5,
                'net_savings_inflow': 250.0
            },
            'user_metadata': {
                'age_bracket': '26-35',
                'annual_income': 70000
            }
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        assert result['primary_persona'] == 'subscription_heavy'


# ============================================================================
# Savings Builder Persona Tests (Phase 2.5)
# ============================================================================

class TestSavingsBuilderPersona:
    """Comprehensive tests for Savings Builder persona."""
    
    def test_strong_match_growth_5_inflow_400(self, test_db):
        """Test strong match with growth ≥5% AND inflow ≥$400."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 13.0,  # <30%
                'any_card_high_util': False,
                'any_interest_charges': False,
                'any_overdue': False,
                'num_credit_cards': 2
            },
            'income': {
                'median_pay_gap_days': 14,
                'cash_flow_buffer_months': 3.5,
                'income_variability_pct': 3.0,
                'payment_frequency': 'regular',
                'income_type': 'salary'
            },
            'subscriptions': {
                'recurring_merchant_count': 2,
                'monthly_recurring_spend': 30.0,
                'subscription_share_pct': 3.5
            },
            'savings': {
                'savings_growth_rate_pct': 5.2,  # ≥5%
                'net_savings_inflow': 450.0,  # ≥$400
                'total_savings_balance': 12000.0,
                'emergency_fund_months': 4.0
            },
            'user_metadata': {
                'age_bracket': '36-45',
                'annual_income': 85000
            }
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        assert result['primary_persona'] == 'savings_builder'
        assert result['primary_match_strength'] == 'strong'
        assert result['criteria_met']['savings_growth_rate_pct'] == 5.2
        assert result['criteria_met']['net_savings_inflow'] == 450.0
        assert result['criteria_met']['aggregate_utilization_pct'] < 30.0
    
    def test_moderate_match_growth_3_inflow_200(self, test_db):
        """Test moderate match with growth ≥3% AND inflow ≥$200."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 20.0,  # <30%
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
                'recurring_merchant_count': 2,
                'monthly_recurring_spend': 30.0,
                'subscription_share_pct': 4.0
            },
            'savings': {
                'savings_growth_rate_pct': 3.5,  # ≥3% but <5%
                'net_savings_inflow': 250.0,  # ≥$200 but <$400
                'total_savings_balance': 8000.0,
                'emergency_fund_months': 2.5
            },
            'user_metadata': {
                'age_bracket': '26-35',
                'annual_income': 65000
            }
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        assert result['primary_persona'] == 'savings_builder'
        assert result['primary_match_strength'] == 'moderate'
    
    def test_requires_low_utilization_under_30(self, test_db):
        """Test that credit utilization must be <30%."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 45.0,  # ≥30% - TOO HIGH
                'any_card_high_util': False,
                'any_interest_charges': False,
                'any_overdue': False,
                'num_credit_cards': 2
            },
            'income': {
                'median_pay_gap_days': 14,
                'cash_flow_buffer_months': 3.0,
                'income_variability_pct': 5.0,
                'payment_frequency': 'regular',
                'income_type': 'salary'
            },
            'subscriptions': {
                'recurring_merchant_count': 2,
                'monthly_recurring_spend': 30.0,
                'subscription_share_pct': 4.0
            },
            'savings': {
                'savings_growth_rate_pct': 5.0,  # Good growth
                'net_savings_inflow': 400.0,  # Good inflow
                'total_savings_balance': 10000.0,
                'emergency_fund_months': 3.0
            },
            'user_metadata': {
                'age_bracket': '26-35',
                'annual_income': 70000
            }
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        # Should NOT match savings_builder due to high utilization
        assert result['primary_persona'] != 'savings_builder'
    
    def test_emergency_fund_bonus(self, test_db):
        """Test bonus consideration for ≥3 months emergency fund."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 15.0,
                'any_card_high_util': False,
                'any_interest_charges': False,
                'any_overdue': False,
                'num_credit_cards': 2
            },
            'income': {
                'median_pay_gap_days': 14,
                'cash_flow_buffer_months': 3.5,
                'income_variability_pct': 3.0,
                'payment_frequency': 'regular',
                'income_type': 'salary'
            },
            'subscriptions': {
                'recurring_merchant_count': 2,
                'monthly_recurring_spend': 30.0,
                'subscription_share_pct': 3.0
            },
            'savings': {
                'savings_growth_rate_pct': 3.0,
                'net_savings_inflow': 200.0,
                'total_savings_balance': 15000.0,
                'emergency_fund_months': 5.0  # ≥3 months - bonus!
            },
            'user_metadata': {
                'age_bracket': '36-45',
                'annual_income': 75000
            }
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        assert result['primary_persona'] == 'savings_builder'
        assert result['criteria_met']['emergency_fund_months'] == 5.0
    
    def test_threshold_exactly_3_percent_growth(self, test_db):
        """Test exactly 3% growth (boundary test)."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 20.0,
                'any_card_high_util': False,
                'any_interest_charges': False,
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
                'recurring_merchant_count': 2,
                'monthly_recurring_spend': 30.0,
                'subscription_share_pct': 4.0
            },
            'savings': {
                'savings_growth_rate_pct': 3.0,  # Exactly 3%
                'net_savings_inflow': 200.0,  # Exactly $200
                'total_savings_balance': 8000.0,
                'emergency_fund_months': 2.0
            },
            'user_metadata': {
                'age_bracket': '26-35',
                'annual_income': 65000
            }
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        assert result['primary_persona'] == 'savings_builder'
    
    def test_threshold_exactly_30_percent_utilization(self, test_db):
        """Test exactly 30% utilization (boundary test)."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 30.0,  # Exactly 30%
                'any_card_high_util': False,
                'any_interest_charges': False,
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
                'recurring_merchant_count': 2,
                'monthly_recurring_spend': 30.0,
                'subscription_share_pct': 4.0
            },
            'savings': {
                'savings_growth_rate_pct': 5.0,
                'net_savings_inflow': 400.0,
                'total_savings_balance': 10000.0,
                'emergency_fund_months': 3.0
            },
            'user_metadata': {
                'age_bracket': '26-35',
                'annual_income': 70000
            }
        }
        
        insert_test_user(test_db, 'user_test', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        # 30% is NOT <30%, so should not match savings_builder
        assert result['primary_persona'] != 'savings_builder'

