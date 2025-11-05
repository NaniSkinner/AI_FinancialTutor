#!/usr/bin/env python3
"""
Signal Generation Script

Generates realistic financial signals for all users in the database.
This creates varied signal patterns across different personas for testing.
"""

import sqlite3
import json
import random
from datetime import datetime
from typing import Dict, Any, List


def generate_signal_id() -> str:
    """Generate a unique signal ID."""
    return f"signal_{datetime.now().strftime('%Y%m%d%H%M%S%f')}"


def generate_high_utilization_signals() -> Dict[str, Any]:
    """Generate signals for High Utilization persona."""
    utilization = random.uniform(50, 85)
    
    return {
        'credit': {
            'aggregate_utilization_pct': utilization,
            'any_card_high_util': True,
            'any_interest_charges': random.choice([True, False]),
            'any_overdue': random.choice([True, False]),
            'num_credit_cards': random.randint(1, 3),
            'cards': [
                {
                    'utilization_pct': utilization,
                    'minimum_payment_only': random.choice([True, False])
                }
            ]
        },
        'income': {
            'median_pay_gap_days': random.randint(14, 30),
            'cash_flow_buffer_months': random.uniform(0.2, 2.0),
            'income_variability_pct': random.uniform(5, 20),
            'payment_frequency': random.choice(['regular', 'irregular']),
            'income_type': random.choice(['salary', 'hourly'])
        },
        'subscriptions': {
            'recurring_merchant_count': random.randint(2, 5),
            'monthly_recurring_spend': random.uniform(40, 100),
            'subscription_share_pct': random.uniform(5, 12),
            'coffee_food_delivery_monthly': random.uniform(30, 100),
            'merchants': ['Netflix', 'Spotify', 'Hulu']
        },
        'savings': {
            'savings_growth_rate_pct': random.uniform(-2, 2),
            'net_savings_inflow': random.uniform(-50, 100),
            'total_savings_balance': random.uniform(500, 3000),
            'emergency_fund_months': random.uniform(0.1, 1.0)
        }
    }


def generate_variable_income_signals() -> Dict[str, Any]:
    """Generate signals for Variable Income Budgeter persona."""
    return {
        'credit': {
            'aggregate_utilization_pct': random.uniform(20, 45),
            'any_card_high_util': False,
            'any_interest_charges': random.choice([True, False]),
            'any_overdue': False,
            'num_credit_cards': random.randint(1, 2),
            'cards': [
                {'utilization_pct': random.uniform(20, 45), 'minimum_payment_only': False}
            ]
        },
        'income': {
            'median_pay_gap_days': random.randint(50, 90),
            'cash_flow_buffer_months': random.uniform(0.2, 0.9),
            'income_variability_pct': random.uniform(25, 50),
            'payment_frequency': 'irregular',
            'income_type': random.choice(['freelance', 'gig', 'mixed'])
        },
        'subscriptions': {
            'recurring_merchant_count': random.randint(1, 4),
            'monthly_recurring_spend': random.uniform(30, 80),
            'subscription_share_pct': random.uniform(4, 10),
            'coffee_food_delivery_monthly': random.uniform(20, 70),
            'merchants': ['Netflix', 'Spotify']
        },
        'savings': {
            'savings_growth_rate_pct': random.uniform(0, 2),
            'net_savings_inflow': random.uniform(50, 150),
            'total_savings_balance': random.uniform(100, 1000),
            'emergency_fund_months': random.uniform(0.1, 0.8)
        }
    }


def generate_student_signals() -> Dict[str, Any]:
    """Generate signals for Student persona."""
    return {
        'credit': {
            'aggregate_utilization_pct': random.uniform(15, 40),
            'any_card_high_util': False,
            'any_interest_charges': False,
            'any_overdue': False,
            'num_credit_cards': random.randint(0, 2),
            'cards': [{'utilization_pct': random.uniform(15, 40), 'minimum_payment_only': False}] if random.random() > 0.3 else []
        },
        'income': {
            'median_pay_gap_days': random.randint(30, 60),
            'cash_flow_buffer_months': random.uniform(0.3, 1.2),
            'income_variability_pct': random.uniform(15, 35),
            'payment_frequency': 'irregular',
            'income_type': random.choice(['part-time', 'gig', 'irregular'])
        },
        'subscriptions': {
            'recurring_merchant_count': random.randint(3, 6),
            'monthly_recurring_spend': random.uniform(40, 90),
            'subscription_share_pct': random.uniform(8, 15),
            'coffee_food_delivery_monthly': random.uniform(75, 150),
            'merchants': ['Netflix', 'Spotify', 'Starbucks', 'Uber Eats', 'DoorDash']
        },
        'savings': {
            'savings_growth_rate_pct': random.uniform(-1, 1),
            'net_savings_inflow': random.uniform(-20, 50),
            'total_savings_balance': random.uniform(0, 500),
            'emergency_fund_months': random.uniform(0, 0.5)
        }
    }


def generate_subscription_heavy_signals() -> Dict[str, Any]:
    """Generate signals for Subscription-Heavy persona."""
    sub_count = random.randint(5, 10)
    return {
        'credit': {
            'aggregate_utilization_pct': random.uniform(10, 35),
            'any_card_high_util': False,
            'any_interest_charges': False,
            'any_overdue': False,
            'num_credit_cards': random.randint(1, 3),
            'cards': [{'utilization_pct': random.uniform(10, 35), 'minimum_payment_only': False}]
        },
        'income': {
            'median_pay_gap_days': random.randint(14, 30),
            'cash_flow_buffer_months': random.uniform(1.0, 3.0),
            'income_variability_pct': random.uniform(5, 15),
            'payment_frequency': 'regular',
            'income_type': 'salary'
        },
        'subscriptions': {
            'recurring_merchant_count': sub_count,
            'monthly_recurring_spend': random.uniform(100, 250),
            'subscription_share_pct': random.uniform(12, 25),
            'coffee_food_delivery_monthly': random.uniform(40, 100),
            'merchants': ['Netflix', 'Spotify', 'Hulu', 'HBO', 'Disney+', 'Adobe', 'NYT', 'Medium'][:sub_count]
        },
        'savings': {
            'savings_growth_rate_pct': random.uniform(1, 3),
            'net_savings_inflow': random.uniform(100, 300),
            'total_savings_balance': random.uniform(2000, 8000),
            'emergency_fund_months': random.uniform(1.5, 4.0)
        }
    }


def generate_savings_builder_signals() -> Dict[str, Any]:
    """Generate signals for Savings Builder persona."""
    return {
        'credit': {
            'aggregate_utilization_pct': random.uniform(5, 28),
            'any_card_high_util': False,
            'any_interest_charges': False,
            'any_overdue': False,
            'num_credit_cards': random.randint(1, 3),
            'cards': [{'utilization_pct': random.uniform(5, 28), 'minimum_payment_only': False}]
        },
        'income': {
            'median_pay_gap_days': random.randint(14, 30),
            'cash_flow_buffer_months': random.uniform(2.0, 6.0),
            'income_variability_pct': random.uniform(3, 12),
            'payment_frequency': 'regular',
            'income_type': 'salary'
        },
        'subscriptions': {
            'recurring_merchant_count': random.randint(2, 5),
            'monthly_recurring_spend': random.uniform(30, 80),
            'subscription_share_pct': random.uniform(4, 10),
            'coffee_food_delivery_monthly': random.uniform(20, 60),
            'merchants': ['Netflix', 'Spotify', 'Prime']
        },
        'savings': {
            'savings_growth_rate_pct': random.uniform(3, 8),
            'net_savings_inflow': random.uniform(250, 600),
            'total_savings_balance': random.uniform(5000, 25000),
            'emergency_fund_months': random.uniform(3, 8)
        }
    }


def generate_general_signals() -> Dict[str, Any]:
    """Generate signals for General persona (no specific match)."""
    return {
        'credit': {
            'aggregate_utilization_pct': random.uniform(15, 35),
            'any_card_high_util': False,
            'any_interest_charges': False,
            'any_overdue': False,
            'num_credit_cards': random.randint(1, 2),
            'cards': [{'utilization_pct': random.uniform(15, 35), 'minimum_payment_only': False}]
        },
        'income': {
            'median_pay_gap_days': random.randint(14, 30),
            'cash_flow_buffer_months': random.uniform(1.2, 2.5),
            'income_variability_pct': random.uniform(5, 15),
            'payment_frequency': 'regular',
            'income_type': 'salary'
        },
        'subscriptions': {
            'recurring_merchant_count': random.randint(1, 2),
            'monthly_recurring_spend': random.uniform(20, 45),
            'subscription_share_pct': random.uniform(3, 8),
            'coffee_food_delivery_monthly': random.uniform(15, 50),
            'merchants': ['Netflix', 'Spotify']
        },
        'savings': {
            'savings_growth_rate_pct': random.uniform(0.5, 1.8),
            'net_savings_inflow': random.uniform(80, 180),
            'total_savings_balance': random.uniform(1500, 5000),
            'emergency_fund_months': random.uniform(1.0, 2.5)
        }
    }


def update_user_metadata(cursor: sqlite3.Cursor, user_id: str, persona_type: str):
    """Update user metadata fields to match persona."""
    if persona_type == 'student':
        cursor.execute("""
            UPDATE users
            SET age_bracket = ?,
                annual_income = ?,
                student_loan_account_present = ?,
                has_rent_transactions = ?,
                has_mortgage = ?,
                transaction_count_monthly = ?,
                essentials_pct = ?
            WHERE user_id = ?
        """, ('18-25', random.uniform(15000, 28000), True, True, False,
              random.randint(30, 60), random.uniform(50, 75), user_id))
    elif persona_type == 'high_utilization':
        cursor.execute("""
            UPDATE users
            SET age_bracket = ?,
                annual_income = ?,
                student_loan_account_present = ?,
                has_rent_transactions = ?,
                has_mortgage = ?,
                transaction_count_monthly = ?,
                essentials_pct = ?
            WHERE user_id = ?
        """, (random.choice(['26-35', '36-45', '46-55']), random.uniform(30000, 65000),
              False, random.choice([True, False]), random.choice([True, False]),
              random.randint(50, 120), random.uniform(60, 85), user_id))
    else:
        cursor.execute("""
            UPDATE users
            SET age_bracket = ?,
                annual_income = ?,
                student_loan_account_present = ?,
                has_rent_transactions = ?,
                has_mortgage = ?,
                transaction_count_monthly = ?,
                essentials_pct = ?
            WHERE user_id = ?
        """, (random.choice(['26-35', '36-45', '46-55', '56+']),
              random.uniform(35000, 85000), False,
              random.choice([True, False]), random.choice([True, False]),
              random.randint(60, 150), random.uniform(50, 75), user_id))


def generate_signals_for_users(db_path: str = 'spendsense.db'):
    """Generate signals for all users in the database."""
    print("=" * 70)
    print("SIGNAL GENERATION")
    print("=" * 70)
    print()
    
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Get all users
    cursor.execute("SELECT user_id FROM users")
    users = [row['user_id'] for row in cursor.fetchall()]
    
    print(f"Found {len(users)} users")
    print()
    
    # Persona distribution (realistic mix)
    persona_generators = {
        'high_utilization': (generate_high_utilization_signals, 20),  # 20%
        'variable_income_budgeter': (generate_variable_income_signals, 15),  # 15%
        'student': (generate_student_signals, 15),  # 15%
        'subscription_heavy': (generate_subscription_heavy_signals, 15),  # 15%
        'savings_builder': (generate_savings_builder_signals, 15),  # 15%
        'general': (generate_general_signals, 20),  # 20%
    }
    
    # Assign personas to users
    persona_assignments = []
    for persona, (generator, percentage) in persona_generators.items():
        count = int(len(users) * percentage / 100)
        persona_assignments.extend([persona] * count)
    
    # Fill remaining with general
    while len(persona_assignments) < len(users):
        persona_assignments.append('general')
    
    random.shuffle(persona_assignments)
    
    # Generate signals for each user
    print("Generating signals...")
    for i, (user_id, persona_type) in enumerate(zip(users, persona_assignments), 1):
        # Generate signals for both 30d and 180d windows
        for window_type in ['30d', '180d']:
            # Get appropriate generator
            generator, _ = persona_generators[persona_type]
            signals = generator()
            
            # Store each signal type
            for signal_type, signal_data in signals.items():
                signal_id = f"sig_{user_id}_{window_type}_{signal_type}"
                
                cursor.execute("""
                    INSERT INTO user_signals (
                        signal_id, user_id, window_type, signal_type, signal_json, detected_at
                    ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                """, (signal_id, user_id, window_type, signal_type, json.dumps(signal_data)))
        
        # Update user metadata
        update_user_metadata(cursor, user_id, persona_type)
        
        if i % 10 == 0:
            print(f"  Generated signals for {i}/{len(users)} users...")
    
    conn.commit()
    print(f"✓ Generated signals for {len(users)} users")
    print()
    
    # Show distribution
    print("Persona distribution:")
    cursor.execute("""
        SELECT 
            COUNT(DISTINCT user_id) as total_users,
            COUNT(DISTINCT CASE WHEN age_bracket = '18-25' THEN user_id END) as student_age,
            COUNT(DISTINCT CASE WHEN student_loan_account_present = 1 THEN user_id END) as has_loans,
            AVG(annual_income) as avg_income
        FROM users
    """)
    stats = cursor.fetchone()
    print(f"  Total users: {stats['total_users']}")
    print(f"  Student age (18-25): {stats['student_age']}")
    print(f"  Has student loans: {stats['has_loans']}")
    print(f"  Average income: ${stats['avg_income']:,.2f}")
    print()
    
    # Show signal counts
    cursor.execute("SELECT signal_type, COUNT(*) as count FROM user_signals GROUP BY signal_type")
    print("Signal counts by type:")
    for row in cursor.fetchall():
        print(f"  {row['signal_type']:20} {row['count']:5} entries")
    print()
    
    conn.close()
    
    print("=" * 70)
    print("✓ SIGNAL GENERATION COMPLETE")
    print("=" * 70)


if __name__ == '__main__':
    generate_signals_for_users()

