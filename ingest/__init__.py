"""
SpendSense Data Ingestion Module

This module provides synthetic financial data generation, validation, and loading
capabilities for the SpendSense AI Financial Tutor platform.

Modules:
    - data_generator: Main synthetic data generation class
    - loader: CSV/JSON data loader with validation
    - validator: Schema validation for Plaid-compliant data
    - config: Configuration constants and parameters
    - utils: Helper functions and utilities
"""

__version__ = "1.0.0"
__author__ = "SpendSense Team"

from .config import *

__all__ = [
    "SyntheticDataGenerator",
    "DataLoader",
    "SchemaValidator",
]

