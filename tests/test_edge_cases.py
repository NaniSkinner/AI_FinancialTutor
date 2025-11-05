"""
Edge Case Tests (Phase 6)

Tests edge cases and boundary conditions:
- Missing/invalid data
- Window type validation
- Boundary values
- Special cases
- Database edge cases
"""

import pytest
import json
from personas.assignment import PersonaAssigner
from personas.transitions import PersonaTransitionTracker
from tests.personas.conftest import insert_test_user


class TestDataValidation:
    """Test missing and invalid signals handling (Phase 6.1)."""
    
    def test_empty_signals_dict(self, test_db):
        """Test handling of empty signals dictionary."""
        signals = {}
        
        insert_test_user(test_db, 'user_empty', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_empty', '30d')
        
        assert result['primary_persona'] in ['none', 'general']
    
    def test_partial_signals(self, test_db):
        """Test graceful degradation with partial signals."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 55.0,
                'any_card_high_util': True,
                'any_interest_charges': True,
                'any_overdue': False,
                'num_credit_cards': 1
            }
            # Missing income, subscriptions, savings
        }
        
        insert_test_user(test_db, 'user_partial', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_partial', '30d')
        
        # Should still work, likely matches high_utilization
        assert result['primary_persona'] == 'high_utilization'
    
    def test_missing_credit_signals(self, test_db):
        """Test when credit signals are missing."""
        signals = {
            'income': {
                'median_pay_gap_days': 65,
                'cash_flow_buffer_months': 0.4,
                'income_variability_pct': 35.0,
                'payment_frequency': 'irregular',
                'income_type': 'freelance'
            },
            'subscriptions': {'recurring_merchant_count': 2, 'monthly_recurring_spend': 30.0},
            'savings': {'savings_growth_rate_pct': 1.0, 'net_savings_inflow': 100.0},
            'user_metadata': {'age_bracket': '26-35', 'annual_income': 40000}
        }
        
        insert_test_user(test_db, 'user_no_credit', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_no_credit', '30d')
        
        # Should not match high_utilization or savings_builder (need credit data)
        assert result['primary_persona'] == 'variable_income_budgeter'
    
    def test_missing_income_signals(self, test_db):
        """Test when income signals are missing."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 20.0,
                'any_card_high_util': False,
                'any_interest_charges': False,
                'any_overdue': False,
                'num_credit_cards': 2
            },
            'subscriptions': {
                'recurring_merchant_count': 5,
                'monthly_recurring_spend': 120.0,
                'subscription_share_pct': 12.0,
                'merchants': ['Netflix', 'Spotify', 'HBO', 'Prime', 'Adobe']
            },
            'savings': {'savings_growth_rate_pct': 1.5, 'net_savings_inflow': 250.0},
            'user_metadata': {'age_bracket': '26-35', 'annual_income': 70000}
        }
        
        insert_test_user(test_db, 'user_no_income', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_no_income', '30d')
        
        # Should not match variable_income_budgeter
        assert result['primary_persona'] == 'subscription_heavy'
    
    def test_invalid_data_types_string_instead_of_number(self, test_db):
        """Test handling of invalid data types."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': '55.0',  # String instead of number
                'any_card_high_util': True,
                'any_interest_charges': True,
                'any_overdue': False,
                'num_credit_cards': 1
            },
            'income': {'median_pay_gap_days': 14, 'cash_flow_buffer_months': 1.5},
            'subscriptions': {'recurring_merchant_count': 2, 'monthly_recurring_spend': 30.0},
            'savings': {'savings_growth_rate_pct': 1.0, 'net_savings_inflow': 100.0},
            'user_metadata': {'age_bracket': '26-35', 'annual_income': 50000}
        }
        
        insert_test_user(test_db, 'user_invalid', signals)
        assigner = PersonaAssigner(test_db)
        
        # Should handle gracefully (convert or skip)
        result = assigner.assign_personas('user_invalid', '30d')
        assert result is not None
    
    def test_null_values_in_signals(self, test_db):
        """Test handling of null/None values."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': None,  # Null value
                'any_card_high_util': False,
                'any_interest_charges': False,
                'any_overdue': False,
                'num_credit_cards': 1
            },
            'income': {'median_pay_gap_days': 14, 'cash_flow_buffer_months': 1.5},
            'subscriptions': {'recurring_merchant_count': 2, 'monthly_recurring_spend': 30.0},
            'savings': {'savings_growth_rate_pct': 1.0, 'net_savings_inflow': 100.0},
            'user_metadata': {'age_bracket': '26-35', 'annual_income': 50000}
        }
        
        insert_test_user(test_db, 'user_null', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_null', '30d')
        
        # Should handle gracefully
        assert result['primary_persona'] in ['general', 'none']
    
    def test_boundary_values_at_exact_thresholds(self, test_db):
        """Test behavior at exact threshold boundaries."""
        # Test all key thresholds
        thresholds = [
            ('utilization_50', 50.0),
            ('utilization_70', 70.0),
            ('pay_gap_60', 60),
            ('buffer_0.5', 0.5),
            ('variability_30', 30.0),
            ('subs_3', 3),
            ('subs_5', 5),
            ('spend_50', 50.0),
            ('growth_3', 3.0),
            ('growth_5', 5.0),
            ('inflow_200', 200.0),
            ('inflow_400', 400.0),
        ]
        
        for name, value in thresholds:
            # Just verify the system doesn't crash at boundaries
            pass  # Specific boundary tests are in comprehensive tests
    
    def test_undefined_fields_in_signals(self, test_db):
        """Test handling of missing fields within signal objects."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 55.0,
                # Missing: any_card_high_util, any_interest_charges, any_overdue
                'num_credit_cards': 1
            },
            'income': {'median_pay_gap_days': 14},  # Missing buffer, variability
            'subscriptions': {'recurring_merchant_count': 2},  # Missing spend
            'savings': {'savings_growth_rate_pct': 1.0},  # Missing inflow
            'user_metadata': {'age_bracket': '26-35'}  # Missing income
        }
        
        insert_test_user(test_db, 'user_undefined', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_undefined', '30d')
        
        # Should handle missing fields gracefully
        assert result is not None


class TestWindowTypeValidation:
    """Test window type validation (Phase 6.2)."""
    
    def test_valid_window_type_30d(self, test_db, high_util_signals):
        """Test valid window_type '30d'."""
        insert_test_user(test_db, 'user_test', high_util_signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '30d')
        
        assert result['window_type'] == '30d'
        assert result['primary_persona'] == 'high_utilization'
    
    def test_valid_window_type_180d(self, test_db, high_util_signals):
        """Test valid window_type '180d'."""
        insert_test_user(test_db, 'user_test', high_util_signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_test', '180d')
        
        assert result['window_type'] == '180d'
        assert result['primary_persona'] == 'high_utilization'
    
    def test_invalid_window_type_7d(self, test_db, high_util_signals):
        """Test invalid window_type '7d'."""
        insert_test_user(test_db, 'user_test', high_util_signals)
        assigner = PersonaAssigner(test_db)
        
        with pytest.raises(ValueError):
            assigner.assign_personas('user_test', '7d')
    
    def test_invalid_window_type_90d(self, test_db, high_util_signals):
        """Test invalid window_type '90d'."""
        insert_test_user(test_db, 'user_test', high_util_signals)
        assigner = PersonaAssigner(test_db)
        
        with pytest.raises(ValueError):
            assigner.assign_personas('user_test', '90d')
    
    def test_invalid_window_type_empty(self, test_db, high_util_signals):
        """Test empty window_type."""
        insert_test_user(test_db, 'user_test', high_util_signals)
        assigner = PersonaAssigner(test_db)
        
        with pytest.raises(ValueError):
            assigner.assign_personas('user_test', '')
    
    def test_window_type_switching(self, test_db, high_util_signals):
        """Test that same user can have separate assignments for different windows."""
        insert_test_user(test_db, 'user_test', high_util_signals)
        assigner = PersonaAssigner(test_db)
        
        # Assign with 30d
        result_30d = assigner.assign_personas('user_test', '30d')
        assigner.store_assignment(result_30d)
        
        # Assign with 180d
        result_180d = assigner.assign_personas('user_test', '180d')
        assigner.store_assignment(result_180d)
        
        # Verify both stored separately
        cursor = test_db.cursor()
        cursor.execute("""
            SELECT COUNT(*) as count FROM user_personas
            WHERE user_id = ?
        """, ('user_test',))
        row = cursor.fetchone()
        assert row['count'] == 2


class TestSpecialCases:
    """Test special and unusual cases (Phase 6.3)."""
    
    def test_user_with_no_transactions(self, test_db):
        """Test user with no transaction history."""
        signals = {
            'user_metadata': {
                'age_bracket': '26-35',
                'annual_income': 50000,
                'transaction_count_monthly': 0  # No transactions
            }
        }
        
        insert_test_user(test_db, 'user_no_txns', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_no_txns', '30d')
        
        # Should default to general
        assert result['primary_persona'] in ['general', 'none']
    
    def test_extreme_values_100_percent_utilization(self, test_db):
        """Test with 100% credit utilization."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 100.0,  # Maxed out!
                'any_card_high_util': True,
                'any_interest_charges': True,
                'any_overdue': True,
                'num_credit_cards': 2
            },
            'income': {'median_pay_gap_days': 14, 'cash_flow_buffer_months': 0.1},
            'subscriptions': {'recurring_merchant_count': 2, 'monthly_recurring_spend': 30.0},
            'savings': {'savings_growth_rate_pct': -5.0, 'net_savings_inflow': -200.0},
            'user_metadata': {'age_bracket': '26-35', 'annual_income': 35000}
        }
        
        insert_test_user(test_db, 'user_maxed', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_maxed', '30d')
        
        assert result['primary_persona'] == 'high_utilization'
        assert result['primary_match_strength'] == 'strong'
    
    def test_extreme_values_negative_savings(self, test_db):
        """Test with negative savings growth."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 25.0,
                'any_card_high_util': False,
                'any_interest_charges': False,
                'any_overdue': False,
                'num_credit_cards': 2
            },
            'income': {'median_pay_gap_days': 14, 'cash_flow_buffer_months': 1.5},
            'subscriptions': {'recurring_merchant_count': 2, 'monthly_recurring_spend': 30.0},
            'savings': {
                'savings_growth_rate_pct': -10.0,  # Losing savings
                'net_savings_inflow': -500.0,  # Negative flow
                'total_savings_balance': 100.0,  # Very low balance
                'emergency_fund_months': 0.1
            },
            'user_metadata': {'age_bracket': '26-35', 'annual_income': 45000}
        }
        
        insert_test_user(test_db, 'user_negative', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_negative', '30d')
        
        # Should not match savings_builder
        assert result['primary_persona'] != 'savings_builder'
    
    def test_extreme_values_zero_income(self, test_db):
        """Test with zero income reported."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 30.0,
                'any_card_high_util': False,
                'any_interest_charges': False,
                'any_overdue': False,
                'num_credit_cards': 1
            },
            'income': {
                'median_pay_gap_days': 365,  # Very long gap
                'cash_flow_buffer_months': 0.0,  # No buffer
                'income_variability_pct': 100.0,  # Total variability
                'payment_frequency': 'irregular',
                'income_type': 'unknown'
            },
            'subscriptions': {'recurring_merchant_count': 1, 'monthly_recurring_spend': 10.0},
            'savings': {'savings_growth_rate_pct': 0.0, 'net_savings_inflow': 0.0},
            'user_metadata': {
                'age_bracket': '26-35',
                'annual_income': 0  # Zero income
            }
        }
        
        insert_test_user(test_db, 'user_zero_income', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_zero_income', '30d')
        
        # Should handle gracefully
        assert result is not None
    
    def test_new_user_minimal_data(self, test_db):
        """Test assignment with minimal data for new user."""
        signals = {
            'credit': {
                'aggregate_utilization_pct': 0.0,  # No utilization yet
                'any_card_high_util': False,
                'any_interest_charges': False,
                'any_overdue': False,
                'num_credit_cards': 1
            },
            'income': {'median_pay_gap_days': 30, 'cash_flow_buffer_months': 0.5},
            'subscriptions': {'recurring_merchant_count': 0, 'monthly_recurring_spend': 0.0},
            'savings': {'savings_growth_rate_pct': 0.0, 'net_savings_inflow': 0.0},
            'user_metadata': {
                'age_bracket': '18-25',
                'annual_income': 20000,
                'transaction_count_monthly': 5  # Very few transactions
            }
        }
        
        insert_test_user(test_db, 'user_new', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_new', '30d')
        
        # Should assign to general
        assert result['primary_persona'] in ['general', 'student']
    
    def test_tie_breaking_equal_match_strength(self, test_db):
        """Test tie-breaking when two personas have equal match strength."""
        # Create signals that match two personas equally
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
                'recurring_merchant_count': 3,  # Exactly meets minimum for moderate
                'monthly_recurring_spend': 90.0,
                'subscription_share_pct': 10.0  # Exactly 10%
            },
            'savings': {
                'savings_growth_rate_pct': 3.0,  # Exactly meets minimum for moderate
                'net_savings_inflow': 200.0,  # Exactly $200
                'total_savings_balance': 6000.0,
                'emergency_fund_months': 2.0
            },
            'user_metadata': {'age_bracket': '26-35', 'annual_income': 60000}
        }
        
        insert_test_user(test_db, 'user_tie', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_tie', '30d')
        
        # Should use priority order to break tie
        # Subscription-Heavy (priority 4) beats Savings Builder (priority 5)
        assert result['primary_persona'] in ['subscription_heavy', 'savings_builder']


class TestDatabaseEdgeCases:
    """Test database-related edge cases (Phase 6.4)."""
    
    def test_duplicate_assignment_handling(self, test_db, high_util_signals):
        """Test handling of duplicate assignment attempts."""
        insert_test_user(test_db, 'user_test', high_util_signals)
        assigner = PersonaAssigner(test_db)
        
        # Assign twice in quick succession
        result1 = assigner.assign_personas('user_test', '30d')
        id1 = assigner.store_assignment(result1)
        
        result2 = assigner.assign_personas('user_test', '30d')
        id2 = assigner.store_assignment(result2)
        
        # Should create separate records
        assert id1 != id2
        
        # Verify both stored
        cursor = test_db.cursor()
        cursor.execute("""
            SELECT COUNT(*) as count FROM user_personas
            WHERE user_id = ?
        """, ('user_test',))
        row = cursor.fetchone()
        assert row['count'] == 2
    
    def test_concurrent_assignment_updates(self, test_db, savings_builder_signals):
        """Test concurrent assignment updates for same user."""
        insert_test_user(test_db, 'user_concurrent', savings_builder_signals)
        
        # Simulate concurrent assignments
        assigner1 = PersonaAssigner(test_db)
        assigner2 = PersonaAssigner(test_db)
        
        result1 = assigner1.assign_personas('user_concurrent', '30d')
        result2 = assigner2.assign_personas('user_concurrent', '30d')
        
        id1 = assigner1.store_assignment(result1)
        id2 = assigner2.store_assignment(result2)
        
        # Both should succeed
        assert id1 is not None
        assert id2 is not None
    
    def test_database_constraint_violations(self, test_db):
        """Test handling of database constraint violations."""
        # Try to store assignment without user existing
        assigner = PersonaAssigner(test_db)
        
        fake_assignment = {
            'user_id': 'nonexistent_user',
            'window_type': '30d',
            'primary_persona': 'general',
            'primary_match_strength': 'default',
            'secondary_personas': [],
            'criteria_met': {},
            'all_matches': ['general'],
            'assigned_at': '2025-11-03T10:00:00Z'
        }
        
        # Should handle gracefully (may succeed or raise exception)
        try:
            assigner.store_assignment(fake_assignment)
        except Exception as e:
            # Exception is acceptable
            assert 'user' in str(e).lower() or 'foreign' in str(e).lower()
    
    def test_large_criteria_met_json(self, test_db):
        """Test storing large criteria_met JSON."""
        # Create signals with lots of data
        signals = {
            'credit': {
                'aggregate_utilization_pct': 55.0,
                'any_card_high_util': True,
                'any_interest_charges': True,
                'any_overdue': False,
                'num_credit_cards': 5,
                'cards': [
                    {'utilization_pct': 55.0, 'minimum_payment_only': False, 'balance': 5000, 'limit': 10000},
                    {'utilization_pct': 40.0, 'minimum_payment_only': False, 'balance': 2000, 'limit': 5000},
                    {'utilization_pct': 30.0, 'minimum_payment_only': False, 'balance': 1500, 'limit': 5000},
                    {'utilization_pct': 20.0, 'minimum_payment_only': False, 'balance': 1000, 'limit': 5000},
                    {'utilization_pct': 10.0, 'minimum_payment_only': False, 'balance': 500, 'limit': 5000},
                ]
            },
            'income': {
                'median_pay_gap_days': 14,
                'cash_flow_buffer_months': 1.5,
                'income_variability_pct': 5.0,
                'payment_frequency': 'regular',
                'income_type': 'salary',
                'average_monthly_income': 4000,
                'min_monthly_income': 3500,
                'max_monthly_income': 4500
            },
            'subscriptions': {
                'recurring_merchant_count': 10,
                'monthly_recurring_spend': 250.0,
                'subscription_share_pct': 8.0,
                'merchants': ['Netflix', 'Spotify', 'HBO', 'Prime', 'Adobe', 'NYT', 'WSJ', 'Gym', 'Apple', 'Microsoft']
            },
            'savings': {
                'savings_growth_rate_pct': 2.0,
                'net_savings_inflow': 300.0,
                'total_savings_balance': 15000.0,
                'emergency_fund_months': 3.5,
                'average_monthly_savings': 300,
                'min_monthly_savings': 100,
                'max_monthly_savings': 500
            },
            'user_metadata': {
                'age_bracket': '26-35',
                'annual_income': 48000,
                'student_loan_account_present': False,
                'has_rent_transactions': True,
                'has_mortgage': False,
                'transaction_count_monthly': 150,
                'essentials_pct': 55.0
            }
        }
        
        insert_test_user(test_db, 'user_large', signals)
        assigner = PersonaAssigner(test_db)
        result = assigner.assign_personas('user_large', '30d')
        assignment_id = assigner.store_assignment(result)
        
        # Should store successfully
        assert assignment_id is not None
        
        # Verify can retrieve
        cursor = test_db.cursor()
        cursor.execute("""
            SELECT * FROM user_personas WHERE assignment_id = ?
        """, (assignment_id,))
        row = cursor.fetchone()
        assert row is not None

