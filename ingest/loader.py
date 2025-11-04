"""
CSV/JSON data loader with validation.

This module loads generated CSV files into the SQLite database with
proper validation and error handling.
"""

import sqlite3
import pandas as pd
import os
from typing import Optional

from .validator import SchemaValidator


class DataLoader:
    """
    Load CSV files into SQLite database with validation.
    
    Features:
    - Automatic validation before loading
    - Batch loading for large datasets
    - Transaction support for atomic operations
    - Comprehensive error handling and logging
    - Foreign key enforcement
    """
    
    def __init__(self, db_path: str = 'spendsense.db'):
        """
        Initialize loader with database path.
        
        Args:
            db_path: Path to SQLite database
        """
        self.db_path = db_path
        self.conn = None
        self.validator = SchemaValidator()
        self.load_stats = {}
    
    def connect(self) -> sqlite3.Connection:
        """
        Create database connection with foreign key support.
        
        Returns:
            SQLite connection object
        """
        self.conn = sqlite3.connect(self.db_path)
        # Enable foreign key constraints
        self.conn.execute("PRAGMA foreign_keys = ON")
        return self.conn
    
    def load_all(self, data_dir: str = 'data/') -> None:
        """
        Load all CSV files in correct order.
        
        Loads data in dependency order:
        1. Users (no dependencies)
        2. Accounts (depends on users)
        3. Transactions (depends on accounts)
        4. Liabilities (depends on accounts)
        
        Uses transactions for atomic loading - if any step fails,
        all changes are rolled back.
        
        Args:
            data_dir: Directory containing CSV files
        
        Raises:
            FileNotFoundError: If CSV files not found
            ValueError: If validation fails
            sqlite3.Error: If database operation fails
        """
        print("\n" + "="*60)
        print("LOADING DATA INTO DATABASE")
        print("="*60 + "\n")
        
        try:
            # Connect to database
            self.connect()
            
            # Start transaction
            self.conn.execute("BEGIN TRANSACTION")
            
            # Load in dependency order
            print("Step 1/4: Loading users...")
            users_path = os.path.join(data_dir, 'synthetic_users.csv')
            self.load_users(users_path)
            
            print("\nStep 2/4: Loading accounts...")
            accounts_path = os.path.join(data_dir, 'synthetic_accounts.csv')
            self.load_accounts(accounts_path)
            
            print("\nStep 3/4: Loading transactions...")
            transactions_path = os.path.join(data_dir, 'synthetic_transactions.csv')
            self.load_transactions(transactions_path)
            
            print("\nStep 4/4: Loading liabilities...")
            liabilities_path = os.path.join(data_dir, 'synthetic_liabilities.csv')
            self.load_liabilities(liabilities_path)
            
            # Commit transaction
            self.conn.commit()
            
            # Print summary
            print("\n" + "="*60)
            print("DATA LOADING COMPLETE")
            print("="*60)
            print(f"\n✓ Users loaded: {self.load_stats.get('users', 0)}")
            print(f"✓ Accounts loaded: {self.load_stats.get('accounts', 0)}")
            print(f"✓ Transactions loaded: {self.load_stats.get('transactions', 0)}")
            print(f"✓ Liabilities loaded: {self.load_stats.get('liabilities', 0)}")
            print(f"\n📁 Database: {self.db_path}")
            print("="*60 + "\n")
            
        except Exception as e:
            # Rollback on error
            if self.conn:
                self.conn.rollback()
                print(f"\n❌ ERROR: Data loading failed! Rolling back changes...")
                print(f"Error: {str(e)}\n")
            raise
        
        finally:
            # Close connection
            if self.conn:
                self.conn.close()
    
    def load_users(self, csv_path: str) -> None:
        """
        Load users from CSV with validation.
        
        Args:
            csv_path: Path to users CSV file
        
        Raises:
            FileNotFoundError: If CSV file not found
            ValueError: If validation fails
        """
        # Read CSV
        if not os.path.exists(csv_path):
            raise FileNotFoundError(f"Users CSV not found: {csv_path}")
        
        df = pd.read_csv(csv_path)
        
        # Validate
        print(f"  Validating {len(df)} users...")
        self.validator.validate_users(df)
        print(f"  ✓ Validation passed")
        
        # Load to database
        print(f"  Loading into database...")
        df.to_sql('users', self.conn, if_exists='append', index=False)
        
        self.load_stats['users'] = len(df)
        print(f"  ✓ Loaded {len(df)} users")
    
    def load_accounts(self, csv_path: str) -> None:
        """
        Load accounts from CSV with validation.
        
        Args:
            csv_path: Path to accounts CSV file
        
        Raises:
            FileNotFoundError: If CSV file not found
            ValueError: If validation fails
        """
        # Read CSV
        if not os.path.exists(csv_path):
            raise FileNotFoundError(f"Accounts CSV not found: {csv_path}")
        
        df = pd.read_csv(csv_path)
        
        # Validate
        print(f"  Validating {len(df)} accounts...")
        self.validator.validate_accounts(df)
        print(f"  ✓ Validation passed")
        
        # Verify foreign keys (users exist)
        print(f"  Checking foreign key constraints...")
        user_ids = pd.read_sql("SELECT user_id FROM users", self.conn)['user_id'].tolist()
        missing_users = df[~df['user_id'].isin(user_ids)]
        if len(missing_users) > 0:
            raise ValueError(f"Foreign key violation: {len(missing_users)} accounts reference non-existent users")
        print(f"  ✓ Foreign keys valid")
        
        # Load to database
        print(f"  Loading into database...")
        df.to_sql('accounts', self.conn, if_exists='append', index=False)
        
        self.load_stats['accounts'] = len(df)
        print(f"  ✓ Loaded {len(df)} accounts")
    
    def load_transactions(self, csv_path: str, chunk_size: int = 1000) -> None:
        """
        Load transactions from CSV in batches for performance.
        
        Loads in chunks to handle large transaction datasets efficiently
        without consuming too much memory.
        
        Args:
            csv_path: Path to transactions CSV file
            chunk_size: Number of rows to load at once (default: 1000)
        
        Raises:
            FileNotFoundError: If CSV file not found
            ValueError: If validation fails
        """
        # Read CSV
        if not os.path.exists(csv_path):
            raise FileNotFoundError(f"Transactions CSV not found: {csv_path}")
        
        df = pd.read_csv(csv_path)
        
        # Validate
        print(f"  Validating {len(df)} transactions...")
        self.validator.validate_transactions(df)
        print(f"  ✓ Validation passed")
        
        # Verify foreign keys (accounts exist)
        print(f"  Checking foreign key constraints...")
        account_ids = pd.read_sql("SELECT account_id FROM accounts", self.conn)['account_id'].tolist()
        missing_accounts = df[~df['account_id'].isin(account_ids)]
        if len(missing_accounts) > 0:
            raise ValueError(f"Foreign key violation: {len(missing_accounts)} transactions reference non-existent accounts")
        print(f"  ✓ Foreign keys valid")
        
        # Load in chunks
        print(f"  Loading into database (chunk_size={chunk_size})...")
        total_rows = len(df)
        for i in range(0, total_rows, chunk_size):
            chunk = df.iloc[i:i+chunk_size]
            chunk.to_sql('transactions', self.conn, if_exists='append', index=False)
            
            # Progress indicator
            progress = min(i + chunk_size, total_rows)
            if progress % 5000 == 0 or progress == total_rows:
                print(f"    Progress: {progress}/{total_rows} transactions")
        
        self.load_stats['transactions'] = len(df)
        print(f"  ✓ Loaded {len(df)} transactions")
    
    def load_liabilities(self, csv_path: str) -> None:
        """
        Load liabilities from CSV with validation.
        
        Args:
            csv_path: Path to liabilities CSV file
        
        Raises:
            FileNotFoundError: If CSV file not found
            ValueError: If validation fails
        """
        # Read CSV
        if not os.path.exists(csv_path):
            raise FileNotFoundError(f"Liabilities CSV not found: {csv_path}")
        
        df = pd.read_csv(csv_path)
        
        # Validate
        print(f"  Validating {len(df)} liabilities...")
        self.validator.validate_liabilities(df)
        print(f"  ✓ Validation passed")
        
        # Verify foreign keys (accounts exist)
        print(f"  Checking foreign key constraints...")
        account_ids = pd.read_sql("SELECT account_id FROM accounts", self.conn)['account_id'].tolist()
        missing_accounts = df[~df['account_id'].isin(account_ids)]
        if len(missing_accounts) > 0:
            raise ValueError(f"Foreign key violation: {len(missing_accounts)} liabilities reference non-existent accounts")
        print(f"  ✓ Foreign keys valid")
        
        # Load to database
        print(f"  Loading into database...")
        df.to_sql('liabilities', self.conn, if_exists='append', index=False)
        
        self.load_stats['liabilities'] = len(df)
        print(f"  ✓ Loaded {len(df)} liabilities")

