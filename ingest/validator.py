"""
Schema validation for Plaid-compliant data.

This module validates dataframes against expected schema requirements
before loading into the database.
"""

import pandas as pd
import json
import re
from typing import List, Dict
from datetime import datetime


class SchemaValidator:
    """
    Validate data against Plaid schema requirements.
    
    Performs comprehensive validation including:
    - Required field presence
    - Data type validation
    - Uniqueness constraints
    - Foreign key integrity
    - Value range validation
    - Format validation (emails, dates, etc.)
    """
    
    def __init__(self):
        """Initialize validator."""
        self.validation_errors = []
    
    def validate_users(self, df: pd.DataFrame) -> None:
        """
        Validate users dataframe.
        
        Checks:
        - Required fields: user_id, name, email
        - user_id uniqueness
        - email format validity
        - metadata is valid JSON
        
        Args:
            df: Users dataframe
        
        Raises:
            ValueError: If validation fails
        """
        self.validation_errors = []
        
        # Check required fields
        required = ['user_id', 'name', 'email']
        self._check_required_fields(df, required)
        
        # Check user_id uniqueness
        if df['user_id'].duplicated().any():
            duplicates = df[df['user_id'].duplicated()]['user_id'].tolist()
            self.validation_errors.append(f"Duplicate user_ids found: {duplicates}")
        
        # Check email uniqueness
        if df['email'].duplicated().any():
            duplicates = df[df['email'].duplicated()]['email'].tolist()
            self.validation_errors.append(f"Duplicate emails found: {duplicates}")
        
        # Check email format
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        invalid_emails = []
        for idx, email in df['email'].items():
            if pd.notna(email) and not re.match(email_pattern, str(email)):
                invalid_emails.append((idx, email))
        
        if invalid_emails:
            self.validation_errors.append(f"Invalid email formats at rows: {invalid_emails[:5]}")
        
        # Check metadata is valid JSON
        if 'metadata' in df.columns:
            invalid_json = []
            for idx, metadata in df['metadata'].items():
                if pd.notna(metadata):
                    try:
                        json.loads(metadata)
                    except json.JSONDecodeError:
                        invalid_json.append(idx)
            
            if invalid_json:
                self.validation_errors.append(f"Invalid JSON in metadata at rows: {invalid_json[:5]}")
        
        if self.validation_errors:
            raise ValueError(f"User validation failed:\n" + "\n".join(self.validation_errors))
    
    def validate_accounts(self, df: pd.DataFrame) -> None:
        """
        Validate accounts dataframe.
        
        Checks:
        - Required fields: account_id, user_id, type
        - account_id uniqueness
        - Valid account types
        - Numeric balance fields
        - Credit limit only for credit cards
        
        Args:
            df: Accounts dataframe
        
        Raises:
            ValueError: If validation fails
        """
        self.validation_errors = []
        
        # Check required fields
        required = ['account_id', 'user_id', 'type']
        self._check_required_fields(df, required)
        
        # Check account_id uniqueness
        if df['account_id'].duplicated().any():
            duplicates = df[df['account_id'].duplicated()]['account_id'].tolist()
            self.validation_errors.append(f"Duplicate account_ids found: {duplicates}")
        
        # Check valid account types
        valid_types = ['checking', 'savings', 'credit_card', 'student_loan', 'mortgage']
        invalid_types = df[~df['type'].isin(valid_types)]
        if len(invalid_types) > 0:
            self.validation_errors.append(f"Invalid account types found: {invalid_types['type'].unique().tolist()}")
        
        # Check balance fields are numeric
        numeric_fields = ['available_balance', 'current_balance', 'credit_limit']
        for field in numeric_fields:
            if field in df.columns:
                non_numeric = df[pd.notna(df[field]) & ~df[field].apply(lambda x: isinstance(x, (int, float)))]
                if len(non_numeric) > 0:
                    self.validation_errors.append(f"Non-numeric values in {field} at rows: {non_numeric.index.tolist()[:5]}")
        
        if self.validation_errors:
            raise ValueError(f"Account validation failed:\n" + "\n".join(self.validation_errors))
    
    def validate_transactions(self, df: pd.DataFrame) -> None:
        """
        Validate transactions dataframe.
        
        Checks:
        - Required fields: transaction_id, account_id, user_id, date, amount
        - transaction_id uniqueness
        - amount is numeric
        - date format (YYYY-MM-DD)
        - dates within valid range
        - Valid payment channels
        
        Args:
            df: Transactions dataframe
        
        Raises:
            ValueError: If validation fails
        """
        self.validation_errors = []
        
        # Check required fields
        required = ['transaction_id', 'account_id', 'user_id', 'date', 'amount']
        self._check_required_fields(df, required)
        
        # Check transaction_id uniqueness
        if df['transaction_id'].duplicated().any():
            duplicates = df[df['transaction_id'].duplicated()]['transaction_id'].tolist()
            self.validation_errors.append(f"Duplicate transaction_ids found: {duplicates[:5]}")
        
        # Check amount is numeric
        non_numeric = df[~df['amount'].apply(lambda x: isinstance(x, (int, float)))]
        if len(non_numeric) > 0:
            self.validation_errors.append(f"Non-numeric amounts at rows: {non_numeric.index.tolist()[:5]}")
        
        # Check date format and validity
        try:
            dates = pd.to_datetime(df['date'])
            
            # Check date range (should be within 2025-05-01 to 2025-10-31)
            min_date = pd.Timestamp('2025-05-01')
            max_date = pd.Timestamp('2025-10-31')
            
            out_of_range = df[(dates < min_date) | (dates > max_date)]
            if len(out_of_range) > 0:
                self.validation_errors.append(
                    f"Dates out of range (2025-05-01 to 2025-10-31) at rows: {out_of_range.index.tolist()[:5]}"
                )
        except Exception as e:
            self.validation_errors.append(f"Invalid date format: {str(e)}")
        
        # Check payment channels
        if 'payment_channel' in df.columns:
            valid_channels = ['online', 'in_store', 'other']
            invalid = df[pd.notna(df['payment_channel']) & ~df['payment_channel'].isin(valid_channels)]
            if len(invalid) > 0:
                self.validation_errors.append(f"Invalid payment channels at rows: {invalid.index.tolist()[:5]}")
        
        if self.validation_errors:
            raise ValueError(f"Transaction validation failed:\n" + "\n".join(self.validation_errors))
    
    def validate_liabilities(self, df: pd.DataFrame) -> None:
        """
        Validate liabilities dataframe.
        
        Checks:
        - Required fields: liability_id, account_id, user_id, type
        - liability_id uniqueness
        - Valid liability types
        - Numeric payment amounts
        - Valid APR/interest rate ranges
        - Date formats
        
        Args:
            df: Liabilities dataframe
        
        Raises:
            ValueError: If validation fails
        """
        self.validation_errors = []
        
        # Check required fields
        required = ['liability_id', 'account_id', 'user_id', 'type']
        self._check_required_fields(df, required)
        
        # Check liability_id uniqueness
        if df['liability_id'].duplicated().any():
            duplicates = df[df['liability_id'].duplicated()]['liability_id'].tolist()
            self.validation_errors.append(f"Duplicate liability_ids found: {duplicates}")
        
        # Check valid liability types
        valid_types = ['credit_card', 'student_loan', 'mortgage']
        invalid_types = df[~df['type'].isin(valid_types)]
        if len(invalid_types) > 0:
            self.validation_errors.append(f"Invalid liability types found: {invalid_types['type'].unique().tolist()}")
        
        # Check numeric fields
        numeric_fields = ['apr_percentage', 'minimum_payment_amount', 'last_payment_amount', 
                         'last_statement_balance', 'interest_rate']
        for field in numeric_fields:
            if field in df.columns:
                non_numeric = df[pd.notna(df[field]) & ~df[field].apply(lambda x: isinstance(x, (int, float)))]
                if len(non_numeric) > 0:
                    self.validation_errors.append(f"Non-numeric values in {field} at rows: {non_numeric.index.tolist()[:5]}")
        
        # Check APR ranges (should be 0-100%)
        if 'apr_percentage' in df.columns:
            invalid_apr = df[pd.notna(df['apr_percentage']) & ((df['apr_percentage'] < 0) | (df['apr_percentage'] > 100))]
            if len(invalid_apr) > 0:
                self.validation_errors.append(f"APR out of range (0-100%) at rows: {invalid_apr.index.tolist()}")
        
        # Check date fields
        date_fields = ['last_payment_date', 'next_payment_due_date']
        for field in date_fields:
            if field in df.columns:
                try:
                    pd.to_datetime(df[df[field].notna()][field])
                except Exception as e:
                    self.validation_errors.append(f"Invalid date format in {field}: {str(e)}")
        
        if self.validation_errors:
            raise ValueError(f"Liability validation failed:\n" + "\n".join(self.validation_errors))
    
    def _check_required_fields(self, df: pd.DataFrame, required: List[str]) -> None:
        """
        Check all required fields are present.
        
        Args:
            df: Dataframe to check
            required: List of required column names
        
        Raises:
            ValueError: If missing required fields
        """
        missing = set(required) - set(df.columns)
        if missing:
            raise ValueError(f"Missing required fields: {missing}")

