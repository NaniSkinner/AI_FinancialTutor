"""
Test fixtures for Persona System tests.

Provides:
- In-memory test database
- Mock signal data for each persona
- Test users with various signal patterns
"""

import pytest
import sqlite3
from typing import Dict, Any
import json


@pytest.fixture
def test_db():
    """Create in-memory test database with schema."""
    conn = sqlite3.connect(':memory:')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute("""
        CREATE TABLE users (
            user_id TEXT PRIMARY KEY,
            age_bracket TEXT,
            annual_income REAL,
            student_loan_account_present BOOLEAN DEFAULT 0,
            has_rent_transactions BOOLEAN DEFAULT 0,
            has_mortgage BOOLEAN DEFAULT 0,
            transaction_count_monthly INTEGER DEFAULT 0,
            essentials_pct REAL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create user_signals table
    cursor.execute("""
        CREATE TABLE user_signals (
            signal_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            window_type TEXT NOT NULL,
            signal_type TEXT NOT NULL,
            signal_json TEXT NOT NULL,
            detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create user_personas table
    cursor.execute("""
        CREATE TABLE user_personas (
            assignment_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            window_type TEXT NOT NULL,
            primary_persona TEXT NOT NULL,
            primary_match_strength TEXT NOT NULL,
            secondary_personas TEXT,
            criteria_met TEXT,
            all_matches TEXT,
            assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create persona_transitions table
    cursor.execute("""
        CREATE TABLE persona_transitions (
            transition_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            from_persona TEXT NOT NULL,
            to_persona TEXT NOT NULL,
            transition_date TEXT NOT NULL,
            days_in_previous_persona INTEGER,
            celebration_shown BOOLEAN DEFAULT 0,
            milestone_achieved TEXT,
            achievement_title TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    conn.commit()
    
    yield conn
    
    conn.close()


# ============================================================================
# Signal Fixtures
# ============================================================================

@pytest.fixture
def high_util_signals():
    """Signals for a High Utilization persona match."""
    return {
        'credit': {
            'aggregate_utilization_pct': 68.0,
            'any_card_high_util': True,
            'any_interest_charges': True,
            'any_overdue': True,
            'num_credit_cards': 2,
            'cards': [
                {'utilization_pct': 68.0, 'minimum_payment_only': False},
                {'utilization_pct': 26.0, 'minimum_payment_only': False},
            ]
        },
        'income': {
            'median_pay_gap_days': 14,
            'cash_flow_buffer_months': 1.5,
            'income_variability_pct': 5.0,
            'payment_frequency': 'regular',
            'income_type': 'salary'
        },
        'subscriptions': {
            'recurring_merchant_count': 2,
            'monthly_recurring_spend': 35.0,
            'subscription_share_pct': 4.5,
            'merchants': ['Netflix', 'Spotify']
        },
        'savings': {
            'savings_growth_rate_pct': 0.5,
            'net_savings_inflow': 50.0,
            'total_savings_balance': 1200.0,
            'emergency_fund_months': 0.5
        },
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


@pytest.fixture
def variable_income_signals():
    """Signals for a Variable Income Budgeter persona match."""
    return {
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
            'median_pay_gap_days': 60,
            'cash_flow_buffer_months': 0.32,
            'income_variability_pct': 35.0,
            'payment_frequency': 'irregular',
            'income_type': 'freelance'
        },
        'subscriptions': {
            'recurring_merchant_count': 3,
            'monthly_recurring_spend': 45.0,
            'subscription_share_pct': 6.0,
            'merchants': ['Netflix', 'Spotify', 'Adobe']
        },
        'savings': {
            'savings_growth_rate_pct': 1.0,
            'net_savings_inflow': 150.0,
            'total_savings_balance': 800.0,
            'emergency_fund_months': 0.32
        },
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


@pytest.fixture
def student_signals():
    """Signals for a Student persona match."""
    return {
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
            'subscription_share_pct': 8.0,
            'coffee_food_delivery_monthly': 95.0,
            'merchants': ['Netflix', 'Spotify']
        },
        'savings': {
            'savings_growth_rate_pct': 0.5,
            'net_savings_inflow': 50.0,
            'total_savings_balance': 500.0,
            'emergency_fund_months': 0.2
        },
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


@pytest.fixture
def subscription_heavy_signals():
    """Signals for a Subscription-Heavy persona match."""
    return {
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
        'savings': {
            'savings_growth_rate_pct': 1.5,
            'net_savings_inflow': 250.0,
            'total_savings_balance': 5000.0,
            'emergency_fund_months': 1.5
        },
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


@pytest.fixture
def savings_builder_signals():
    """Signals for a Savings Builder persona match."""
    return {
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
        'subscriptions': {
            'recurring_merchant_count': 2,
            'monthly_recurring_spend': 30.0,
            'subscription_share_pct': 3.5,
            'merchants': ['Netflix', 'Spotify']
        },
        'savings': {
            'savings_growth_rate_pct': 3.2,
            'net_savings_inflow': 350.0,
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


@pytest.fixture
def general_signals():
    """Signals that don't match any specific persona."""
    return {
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
            'median_pay_gap_days': 14,
            'cash_flow_buffer_months': 1.5,
            'income_variability_pct': 8.0,
            'payment_frequency': 'regular',
            'income_type': 'salary'
        },
        'subscriptions': {
            'recurring_merchant_count': 2,
            'monthly_recurring_spend': 30.0,
            'subscription_share_pct': 4.0,
            'merchants': ['Netflix', 'Spotify']
        },
        'savings': {
            'savings_growth_rate_pct': 1.0,
            'net_savings_inflow': 150.0,
            'total_savings_balance': 3000.0,
            'emergency_fund_months': 1.5
        },
        'user_metadata': {
            'age_bracket': '26-35',
            'annual_income': 50000,
            'student_loan_account_present': False,
            'has_rent_transactions': True,
            'has_mortgage': False,
            'transaction_count_monthly': 75,
            'essentials_pct': 60.0
        }
    }


# ============================================================================
# Helper Functions
# ============================================================================

def insert_test_user(conn: sqlite3.Connection, user_id: str, signals: Dict[str, Any]):
    """Insert a test user with signals into the database."""
    cursor = conn.cursor()
    
    metadata = signals.get('user_metadata', {})
    
    # Insert user
    cursor.execute("""
        INSERT INTO users (
            user_id, age_bracket, annual_income, student_loan_account_present,
            has_rent_transactions, has_mortgage, transaction_count_monthly, essentials_pct
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        user_id,
        metadata.get('age_bracket', '26-35'),
        metadata.get('annual_income', 50000),
        metadata.get('student_loan_account_present', False),
        metadata.get('has_rent_transactions', False),
        metadata.get('has_mortgage', False),
        metadata.get('transaction_count_monthly', 50),
        metadata.get('essentials_pct', 50.0)
    ))
    
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

