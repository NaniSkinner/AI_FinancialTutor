"""
Root conftest for all tests.

This imports fixtures from subdirectories so they're available to all tests.
"""

import pytest
import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# Import fixtures from personas subdirectory
from tests.personas.conftest import (
    test_db,
    high_util_signals,
    variable_income_signals,
    student_signals,
    subscription_heavy_signals,
    savings_builder_signals,
    general_signals,
    insert_test_user
)

# Re-export fixtures for use in all tests
__all__ = [
    'test_db',
    'high_util_signals',
    'variable_income_signals',
    'student_signals',
    'subscription_heavy_signals',
    'savings_builder_signals',
    'general_signals',
    'insert_test_user'
]

