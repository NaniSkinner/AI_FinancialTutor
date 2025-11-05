"""
Manual Validation Script for Persona Assignment System

This script validates that all 5 personas can be assigned correctly with
test signal patterns. Run this to verify the persona system is working.

Usage:
    python validate_personas.py [database_path]
    
Example:
    python validate_personas.py spendsense.db
"""

import sqlite3
import sys
import json
from datetime import datetime

# Add personas module to path
sys.path.insert(0, '.')

try:
    from personas.assignment import PersonaAssigner
    from personas.transitions import PersonaTransitionTracker
    PERSONAS_AVAILABLE = True
except ImportError as e:
    print(f"❌ Error: Could not import persona modules: {e}")
    print("Make sure you're running this from the project root.")
    sys.exit(1)


# ============================================================================
# Test Signal Patterns
# ============================================================================

TEST_CASES = {
    'high_utilization': {
        'description': 'High credit utilization with overdue payments',
        'signals': {
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
    },
    
    'variable_income_budgeter': {
        'description': 'Irregular income with low cash buffer',
        'signals': {
            'credit': {
                'aggregate_utilization_pct': 25.0,
                'any_card_high_util': False,
                'any_interest_charges': False,
                'any_overdue': False,
                'num_credit_cards': 1,
                'cards': [
                    {'utilization_pct': 25.0, 'minimum_payment_only': False},
                ]
            },
            'income': {
                'median_pay_gap_days': 65,
                'cash_flow_buffer_months': 0.4,
                'income_variability_pct': 35.0,
                'payment_frequency': 'irregular',
                'income_type': 'freelance'
            },
            'subscriptions': {'recurring_merchant_count': 3, 'monthly_recurring_spend': 45.0},
            'savings': {'savings_growth_rate_pct': 1.0, 'net_savings_inflow': 150.0},
            'user_metadata': {
                'age_bracket': '26-35',
                'annual_income': 38000,
                'student_loan_account_present': False,
                'has_rent_transactions': True,
                'has_mortgage': False,
                'transaction_count_monthly': 65,
                'essentials_pct': 70.0
            }
        }
    },
    
    'student': {
        'description': 'Student with loan and low income',
        'signals': {
            'credit': {
                'aggregate_utilization_pct': 15.0,
                'any_card_high_util': False,
                'any_interest_charges': False,
                'any_overdue': False,
                'num_credit_cards': 1,
                'cards': [
                    {'utilization_pct': 15.0, 'minimum_payment_only': False},
                ]
            },
            'income': {
                'median_pay_gap_days': 30,
                'cash_flow_buffer_months': 0.5,
                'income_variability_pct': 25.0,
                'payment_frequency': 'irregular',
                'income_type': 'part_time'
            },
            'subscriptions': {
                'recurring_merchant_count': 2,
                'monthly_recurring_spend': 30.0,
                'coffee_food_delivery_monthly': 95.0
            },
            'savings': {'savings_growth_rate_pct': 0.5, 'net_savings_inflow': 50.0},
            'user_metadata': {
                'age_bracket': '18-25',
                'annual_income': 18000,
                'student_loan_account_present': True,
                'has_rent_transactions': True,
                'has_mortgage': False,
                'transaction_count_monthly': 35,
                'essentials_pct': 45.0
            }
        }
    },
    
    'subscription_heavy': {
        'description': 'Many active subscriptions',
        'signals': {
            'credit': {
                'aggregate_utilization_pct': 20.0,
                'any_card_high_util': False,
                'any_interest_charges': False,
                'any_overdue': False,
                'num_credit_cards': 2,
                'cards': [
                    {'utilization_pct': 20.0, 'minimum_payment_only': False},
                    {'utilization_pct': 10.0, 'minimum_payment_only': False},
                ]
            },
            'income': {
                'median_pay_gap_days': 14,
                'cash_flow_buffer_months': 2.5,
                'income_variability_pct': 5.0,
                'payment_frequency': 'regular',
                'income_type': 'salary'
            },
            'subscriptions': {
                'recurring_merchant_count': 7,
                'monthly_recurring_spend': 152.94,
                'subscription_share_pct': 14.2,
                'merchants': ['Netflix', 'Spotify', 'HBO Max', 'Amazon Prime', 'Planet Fitness', 'NYT Digital', 'Adobe']
            },
            'savings': {'savings_growth_rate_pct': 1.5, 'net_savings_inflow': 250.0},
            'user_metadata': {
                'age_bracket': '26-35',
                'annual_income': 70000,
                'student_loan_account_present': False,
                'has_rent_transactions': True,
                'has_mortgage': False,
                'transaction_count_monthly': 120,
                'essentials_pct': 55.0
            }
        }
    },
    
    'savings_builder': {
        'description': 'Positive savings growth with low credit utilization',
        'signals': {
            'credit': {
                'aggregate_utilization_pct': 13.0,
                'any_card_high_util': False,
                'any_interest_charges': False,
                'any_overdue': False,
                'num_credit_cards': 2,
                'cards': [
                    {'utilization_pct': 10.0, 'minimum_payment_only': False},
                    {'utilization_pct': 15.0, 'minimum_payment_only': False},
                ]
            },
            'income': {
                'median_pay_gap_days': 14,
                'cash_flow_buffer_months': 3.5,
                'income_variability_pct': 3.0,
                'payment_frequency': 'regular',
                'income_type': 'salary'
            },
            'subscriptions': {'recurring_merchant_count': 2, 'monthly_recurring_spend': 30.0},
            'savings': {
                'savings_growth_rate_pct': 5.2,
                'net_savings_inflow': 450.0,
                'total_savings_balance': 12000.0,
                'emergency_fund_months': 4.0
            },
            'user_metadata': {
                'age_bracket': '36-45',
                'annual_income': 85000,
                'student_loan_account_present': False,
                'has_rent_transactions': False,
                'has_mortgage': True,
                'transaction_count_monthly': 95,
                'essentials_pct': 50.0
            }
        }
    }
}


# ============================================================================
# Validation Functions
# ============================================================================

def insert_test_signals(conn, user_id, signals):
    """Insert test signals into database for validation."""
    cursor = conn.cursor()
    
    # Check if user exists, if not create
    cursor.execute("SELECT user_id FROM users WHERE user_id = ?", (user_id,))
    if not cursor.fetchone():
        metadata = signals.get('user_metadata', {})
        cursor.execute("""
            INSERT INTO users (
                user_id, name, email, age_bracket, annual_income, student_loan_account_present,
                has_rent_transactions, has_mortgage, transaction_count_monthly, essentials_pct
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            f'Test User {user_id}',
            f'{user_id}@test.com',
            metadata.get('age_bracket', '26-35'),
            metadata.get('annual_income', 50000),
            metadata.get('student_loan_account_present', False),
            metadata.get('has_rent_transactions', False),
            metadata.get('has_mortgage', False),
            metadata.get('transaction_count_monthly', 50),
            metadata.get('essentials_pct', 50.0)
        ))
    
    # Clear existing signals
    cursor.execute("DELETE FROM user_signals WHERE user_id = ?", (user_id,))
    
    # Insert signals
    for signal_type in ['credit', 'income', 'subscriptions', 'savings']:
        if signal_type in signals:
            cursor.execute("""
                INSERT INTO user_signals (user_id, window_type, signal_type, signal_json)
                VALUES (?, ?, ?, ?)
            """, (
                user_id,
                '30d',
                signal_type,
                json.dumps(signals[signal_type])
            ))
    
    conn.commit()


def validate_all_personas(db_path):
    """
    Validate all persona assignments.
    
    Returns:
        tuple: (passed_count, failed_count, results)
    """
    print(f"\n{'='*80}")
    print("SpendSense Persona Validation")
    print(f"{'='*80}\n")
    print(f"Database: {db_path}")
    print(f"Test Cases: {len(TEST_CASES)}")
    print(f"\n{'='*80}\n")
    
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    assigner = PersonaAssigner(conn)
    
    passed = 0
    failed = 0
    results = []
    
    for expected_persona, test_case in TEST_CASES.items():
        user_id = f'validate_{expected_persona}'
        description = test_case['description']
        signals = test_case['signals']
        
        print(f"Testing: {expected_persona}")
        print(f"  Description: {description}")
        
        try:
            # Insert test signals
            insert_test_signals(conn, user_id, signals)
            
            # Assign persona
            result = assigner.assign_personas(user_id, '30d')
            
            # Check if matches expected
            actual_persona = result['primary_persona']
            match_strength = result['primary_match_strength']
            
            if actual_persona == expected_persona:
                print(f"  ✅ PASS - Assigned: {actual_persona} (strength: {match_strength})")
                passed += 1
                results.append({
                    'persona': expected_persona,
                    'status': 'PASS',
                    'actual': actual_persona,
                    'strength': match_strength,
                    'criteria_met': result.get('criteria_met', {})
                })
            else:
                print(f"  ❌ FAIL - Expected: {expected_persona}, Got: {actual_persona}")
                failed += 1
                results.append({
                    'persona': expected_persona,
                    'status': 'FAIL',
                    'expected': expected_persona,
                    'actual': actual_persona,
                    'strength': match_strength,
                    'criteria_met': result.get('criteria_met', {})
                })
            
        except Exception as e:
            print(f"  ❌ ERROR - {str(e)}")
            failed += 1
            results.append({
                'persona': expected_persona,
                'status': 'ERROR',
                'error': str(e)
            })
        
        print()
    
    conn.close()
    
    # Print summary
    print(f"{'='*80}")
    print("SUMMARY")
    print(f"{'='*80}")
    print(f"Total Tests: {len(TEST_CASES)}")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"Success Rate: {(passed / len(TEST_CASES) * 100):.1f}%")
    print(f"{'='*80}\n")
    
    return passed, failed, results


def validate_persona_distribution(db_path):
    """
    Analyze persona distribution across all users in the database.
    
    Returns:
        dict: Distribution statistics
    """
    print(f"\n{'='*80}")
    print("Persona Distribution Analysis")
    print(f"{'='*80}\n")
    
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Count assignments by persona
    cursor.execute("""
        SELECT 
            primary_persona,
            COUNT(*) as count,
            ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM user_personas WHERE window_type = '30d'), 2) as percentage
        FROM user_personas
        WHERE window_type = '30d'
        GROUP BY primary_persona
        ORDER BY count DESC
    """)
    
    distribution = {}
    total_users = 0
    
    print("Persona Distribution (30d window):")
    print(f"{'Persona':<30} {'Count':<10} {'Percentage':<10}")
    print('-' * 50)
    
    for row in cursor.fetchall():
        persona = row['primary_persona']
        count = row['count']
        percentage = row['percentage']
        distribution[persona] = {'count': count, 'percentage': percentage}
        total_users += count
        print(f"{persona:<30} {count:<10} {percentage:<10}%")
    
    print('-' * 50)
    print(f"{'TOTAL':<30} {total_users:<10} {100.0:<10}%")
    
    conn.close()
    
    print(f"\n{'='*80}\n")
    
    return distribution


def validate_transitions(db_path):
    """
    Analyze transition patterns.
    
    Returns:
        dict: Transition statistics
    """
    print(f"\n{'='*80}")
    print("Transition Pattern Analysis")
    print(f"{'='*80}\n")
    
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Count transitions
    cursor.execute("""
        SELECT 
            from_persona || ' → ' || to_persona as transition,
            COUNT(*) as count,
            SUM(CASE WHEN celebration_shown = 1 THEN 1 ELSE 0 END) as positive_count
        FROM persona_transitions
        GROUP BY from_persona, to_persona
        ORDER BY count DESC
        LIMIT 10
    """)
    
    print("Top 10 Transition Patterns:")
    print(f"{'Transition':<40} {'Count':<10} {'Positive':<10}")
    print('-' * 60)
    
    patterns = {}
    for row in cursor.fetchall():
        transition = row['transition']
        count = row['count']
        positive_count = row['positive_count']
        patterns[transition] = {'count': count, 'positive': positive_count}
        print(f"{transition:<40} {count:<10} {positive_count:<10}")
    
    print()
    
    # Calculate positive transition rate
    cursor.execute("""
        SELECT 
            COUNT(*) as total_transitions,
            SUM(CASE WHEN celebration_shown = 1 THEN 1 ELSE 0 END) as positive_transitions
        FROM persona_transitions
    """)
    
    row = cursor.fetchone()
    total = row['total_transitions']
    positive = row['positive_transitions']
    
    if total > 0:
        rate = (positive / total) * 100
        print(f"Positive Transition Rate: {rate:.1f}% ({positive}/{total})")
    else:
        print("No transitions found in database.")
    
    conn.close()
    
    print(f"\n{'='*80}\n")
    
    return patterns


# ============================================================================
# Main
# ============================================================================

def main():
    """Main validation script."""
    # Get database path from command line or use default
    if len(sys.argv) > 1:
        db_path = sys.argv[1]
    else:
        db_path = 'spendsense.db'
    
    # Check if database exists
    try:
        conn = sqlite3.connect(db_path)
        conn.close()
    except Exception as e:
        print(f"❌ Error: Could not connect to database '{db_path}': {e}")
        sys.exit(1)
    
    # Run validations
    passed, failed, results = validate_all_personas(db_path)
    
    # Optional: Analyze distribution if database has data
    try:
        validate_persona_distribution(db_path)
        validate_transitions(db_path)
    except Exception as e:
        print(f"Note: Could not analyze distribution/transitions: {e}")
    
    # Exit with appropriate code
    if failed == 0:
        print("✅ All persona validations passed!")
        sys.exit(0)
    else:
        print(f"❌ {failed} persona validation(s) failed.")
        sys.exit(1)


if __name__ == '__main__':
    main()

