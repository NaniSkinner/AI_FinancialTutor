"""
Configuration constants for synthetic data generation.

This module contains all configuration parameters for generating realistic
financial data that follows Plaid's schema conventions.
"""

from datetime import datetime

# ============================================================================
# GENERATION PARAMETERS
# ============================================================================

NUM_USERS_DEFAULT = 100
SEED_DEFAULT = 42
DATE_RANGE_START = "2025-05-01"
DATE_RANGE_END = "2025-10-31"

# ============================================================================
# INCOME DISTRIBUTION (Based on US Census data)
# ============================================================================

INCOME_BRACKETS = {
    'low': {
        'range': (20000, 35000),
        'weight': 0.20,  # 20% of users
        'description': 'Low income'
    },
    'mid': {
        'range': (35000, 75000),
        'weight': 0.40,  # 40% of users
        'description': 'Middle income'
    },
    'upper_mid': {
        'range': (75000, 150000),
        'weight': 0.30,  # 30% of users
        'description': 'Upper middle income'
    },
    'high': {
        'range': (150000, 250000),
        'weight': 0.10,  # 10% of users
        'description': 'High income'
    }
}

# ============================================================================
# AGE DISTRIBUTION
# ============================================================================

AGE_BRACKETS = {
    '18-25': {
        'range': (18, 25),
        'weight': 0.20,
        'description': 'Young adults'
    },
    '26-35': {
        'range': (26, 35),
        'weight': 0.30,
        'description': 'Young professionals'
    },
    '36-50': {
        'range': (36, 50),
        'weight': 0.35,
        'description': 'Mid-career'
    },
    '51-65': {
        'range': (51, 65),
        'weight': 0.15,
        'description': 'Pre-retirement'
    }
}

# ============================================================================
# GEOGRAPHIC DISTRIBUTION
# ============================================================================

GEOGRAPHIC_REGIONS = {
    'urban': 0.50,
    'suburban': 0.30,
    'rural': 0.20
}

# ============================================================================
# TRANSACTION CATEGORIES (Plaid-compliant taxonomy)
# ============================================================================

TRANSACTION_CATEGORIES = {
    'FOOD_AND_DRINK': {
        'RESTAURANTS': 'Restaurants and dining',
        'COFFEE_SHOPS': 'Coffee shops and cafes',
        'GROCERIES': 'Grocery stores',
        'BARS': 'Bars and nightlife',
        'FAST_FOOD': 'Fast food'
    },
    'TRANSPORTATION': {
        'GAS': 'Gas stations',
        'PARKING': 'Parking fees',
        'PUBLIC_TRANSIT': 'Public transportation',
        'TAXI': 'Taxi and rideshare',
        'AUTO_INSURANCE': 'Auto insurance'
    },
    'SHOPPING': {
        'CLOTHING': 'Clothing stores',
        'ELECTRONICS': 'Electronics',
        'GENERAL': 'General merchandise',
        'ONLINE': 'Online shopping',
        'BOOKSTORES': 'Books and media'
    },
    'ENTERTAINMENT': {
        'MOVIES': 'Movie theaters',
        'CONCERTS': 'Concerts and events',
        'SUBSCRIPTION': 'Subscriptions',
        'GYM': 'Gym and fitness',
        'STREAMING': 'Streaming services'
    },
    'RENT_AND_UTILITIES': {
        'RENT': 'Rent payment',
        'MORTGAGE': 'Mortgage payment',
        'ELECTRIC': 'Electric utility',
        'WATER': 'Water utility',
        'INTERNET': 'Internet service',
        'PHONE': 'Phone service'
    },
    'HEALTHCARE': {
        'DOCTOR': 'Doctor visits',
        'PHARMACY': 'Pharmacy',
        'INSURANCE': 'Health insurance',
        'DENTAL': 'Dental care'
    },
    'INCOME': {
        'PAYROLL': 'Payroll deposit',
        'INTEREST': 'Interest earned',
        'REFUND': 'Tax refund',
        'BONUS': 'Bonus payment'
    },
    'TRANSFER': {
        'INTERNAL': 'Internal transfer',
        'WIRE': 'Wire transfer',
        'CHECK': 'Check deposit'
    }
}

# ============================================================================
# MERCHANT POOLS
# ============================================================================

MERCHANTS = {
    'coffee': [
        'Starbucks',
        'Local Coffee Co',
        'Dunkin',
        'Peets Coffee',
        'Blue Bottle'
    ],
    'grocery': [
        'Whole Foods',
        'Trader Joes',
        'Kroger',
        'Safeway',
        'HEB',
        'Walmart',
        'Target'
    ],
    'restaurant': [
        'Chipotle',
        'Panera Bread',
        'Local Diner',
        'Pizza Place',
        'Thai Kitchen',
        'Olive Garden',
        'Red Lobster',
        'Five Guys'
    ],
    'fast_food': [
        'McDonalds',
        'Taco Bell',
        'Subway',
        'KFC',
        'Wendys'
    ],
    'gas': [
        'Shell',
        'Chevron',
        'Exxon',
        '76 Station',
        'BP'
    ],
    'pharmacy': [
        'CVS',
        'Walgreens',
        'Rite Aid'
    ],
    'utilities': [
        'Electric Company',
        'Water Department',
        'Internet Provider',
        'Phone Company'
    ],
    'subscription': [
        ('Netflix', 15.99),
        ('Spotify', 10.99),
        ('Amazon Prime', 14.99),
        ('Apple iCloud', 9.99),
        ('Disney+', 7.99),
        ('HBO Max', 15.99),
        ('Gym Membership', 45.00),
        ('NYT Subscription', 17.00),
        ('Dropbox', 11.99)
    ],
    'banks': [
        'Chase',
        'Bank of America',
        'Wells Fargo',
        'Citibank',
        'US Bank',
        'Capital One',
        'Discover',
        'American Express'
    ]
}

# ============================================================================
# ACCOUNT TYPE DISTRIBUTION
# ============================================================================

ACCOUNT_DISTRIBUTION = {
    'checking': 1.0,  # 100% of users have checking
    'savings': 0.7,   # 70% of users have savings
    'credit_card_min': 0,
    'credit_card_max': 3,
    'student_loan_young': 0.35,  # 35% of users age 18-35
    'student_loan_other': 0.15   # 15% of others
}

# ============================================================================
# FINANCIAL RATIOS (Based on financial planning guidelines)
# ============================================================================

FINANCIAL_RATIOS = {
    'rent_to_income': (0.25, 0.35),  # Rent should be 25-35% of monthly income
    'savings_rate': (0.05, 0.20),     # Save 5-20% of income
    'credit_utilization': (0.10, 0.70),  # Credit card utilization 10-70%
    'emergency_fund_months': (1, 6)   # 1-6 months of expenses in savings
}

# ============================================================================
# TRANSACTION FREQUENCIES
# ============================================================================

TRANSACTION_FREQUENCY = {
    'payroll_biweekly': 14,
    'payroll_monthly': 30,
    'rent_monthly': 30,
    'utilities_monthly': 30,
    'subscription_monthly': 30,
    'groceries_per_week': 2.5,
    'restaurants_per_week': 3.5,
    'coffee_per_week_student': 5,
    'coffee_per_week_professional': 3
}

# ============================================================================
# LIFE EVENTS (10% of users experience)
# ============================================================================

LIFE_EVENTS = [
    {
        'name': 'medical_emergency',
        'probability': 0.03,
        'amount_range': (500, 3000),
        'category': 'HEALTHCARE',
        'description': 'Unexpected medical expense'
    },
    {
        'name': 'job_change',
        'probability': 0.04,
        'gap_days': (14, 28),
        'income_change': (-0.10, 0.15),
        'description': 'Job transition with gap'
    },
    {
        'name': 'large_purchase',
        'probability': 0.03,
        'amount_range': (2000, 8000),
        'category': 'SHOPPING',
        'description': 'Large purchase (appliance, car down payment)'
    }
]

# ============================================================================
# DATABASE CONFIGURATION
# ============================================================================

DB_PATH_DEFAULT = 'spendsense.db'
CSV_OUTPUT_DIR = 'data/'

# ============================================================================
# VALIDATION RULES
# ============================================================================

VALIDATION_RULES = {
    'max_missing_required_fields': 0.0,   # 0% missing required fields
    'max_missing_optional_fields': 0.05,  # <5% missing optional fields
    'amount_variance_tolerance': 0.10,     # ±10% variance on amounts
    'date_range_strict': True
}

