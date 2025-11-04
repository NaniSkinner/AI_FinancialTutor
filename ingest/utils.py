"""
Utility functions for data generation and processing.

This module provides helper functions used across the ingest module.
"""

import uuid
import random
from datetime import datetime, timedelta
from typing import Dict, Any


def generate_uuid(prefix: str = "") -> str:
    """
    Generate a unique identifier with optional prefix.
    
    Args:
        prefix: Optional prefix (e.g., 'acc_', 'txn_', 'liab_')
    
    Returns:
        UUID string with prefix
    """
    return f"{prefix}{uuid.uuid4().hex[:12]}"


def generate_mask() -> str:
    """
    Generate a 4-digit account mask (last 4 digits).
    
    Returns:
        4-digit string
    """
    return f"{random.randint(0, 9999):04d}"


def add_variance(amount: float, variance_pct: float = 0.10) -> float:
    """
    Add random variance to an amount.
    
    Args:
        amount: Base amount
        variance_pct: Percentage variance (default 10%)
    
    Returns:
        Amount with variance applied
    """
    variance = random.uniform(-variance_pct, variance_pct)
    return amount * (1 + variance)


def get_random_date_in_range(start_date: datetime, end_date: datetime) -> datetime:
    """
    Get a random date between start and end dates.
    
    Args:
        start_date: Start date
        end_date: End date
    
    Returns:
        Random datetime within range
    """
    delta = end_date - start_date
    random_days = random.randint(0, delta.days)
    return start_date + timedelta(days=random_days)


def is_weekend(date: datetime) -> bool:
    """
    Check if a date falls on a weekend.
    
    Args:
        date: Date to check
    
    Returns:
        True if Saturday or Sunday
    """
    return date.weekday() >= 5


def get_month_name(date: datetime) -> str:
    """
    Get the month name from a date.
    
    Args:
        date: Date to extract month from
    
    Returns:
        Month name (e.g., 'May', 'October')
    """
    return date.strftime('%B')


def format_currency(amount: float) -> str:
    """
    Format an amount as currency string.
    
    Args:
        amount: Numeric amount
    
    Returns:
        Formatted currency string (e.g., '$1,234.56')
    """
    return f"${amount:,.2f}"


def calculate_age_from_birthdate(birthdate: datetime) -> int:
    """
    Calculate age from birthdate.
    
    Args:
        birthdate: Date of birth
    
    Returns:
        Age in years
    """
    today = datetime.now()
    return today.year - birthdate.year - ((today.month, today.day) < (birthdate.month, birthdate.day))


def weighted_choice(choices: Dict[str, float]) -> str:
    """
    Make a weighted random choice from a dictionary.
    
    Args:
        choices: Dictionary with keys and weights (e.g., {'urban': 0.5, 'rural': 0.5})
    
    Returns:
        Selected key
    """
    keys = list(choices.keys())
    weights = list(choices.values())
    return random.choices(keys, weights=weights)[0]

