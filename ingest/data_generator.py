"""
Synthetic financial data generator.

This module generates realistic user profiles, accounts, transactions, and liabilities
following Plaid's schema conventions.

TODO: Implement full SyntheticDataGenerator class (Phase 2-5)
"""

import pandas as pd
import numpy as np
import random
from faker import Faker
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import json
import uuid

from .config import *
from .utils import *


class SyntheticDataGenerator:
    """
    Main class for generating synthetic financial data.
    
    Generates realistic user profiles, bank accounts, transactions, and liabilities
    with proper statistical distributions and behavioral patterns.
    """
    
    def __init__(self, num_users: int = NUM_USERS_DEFAULT, seed: int = SEED_DEFAULT):
        """
        Initialize generator with reproducible seed.
        
        Args:
            num_users: Number of users to generate (50-100)
            seed: Random seed for reproducibility
        """
        self.num_users = num_users
        self.seed = seed
        
        # Initialize random generators with seed
        self.fake = Faker()
        Faker.seed(seed)
        random.seed(seed)
        np.random.seed(seed)
        
        # Data storage
        self.users_df = None
        self.accounts_df = None
        self.transactions_df = None
        self.liabilities_df = None
        
        print(f"✓ SyntheticDataGenerator initialized (users={num_users}, seed={seed})")
    
    def generate_all(self, output_dir: str = CSV_OUTPUT_DIR) -> Dict:
        """
        Generate complete dataset and export to CSV.
        
        Orchestrates the full data generation pipeline:
        1. Generate users with demographics
        2. Generate accounts for each user
        3. Generate 6 months of transactions
        4. Generate liabilities for credit accounts
        5. Export everything to CSV
        6. Create and return metadata
        
        Args:
            output_dir: Directory to save CSV files (default: 'data/')
        
        Returns:
            Dictionary with metadata about generated data
        """
        import time
        
        print("\n" + "="*60)
        print("STARTING SYNTHETIC DATA GENERATION")
        print("="*60 + "\n")
        
        start_time = time.time()
        
        # Step 1: Generate users
        print("Step 1/5: Generating users...")
        self.users_df = self.generate_users()
        self._print_user_stats()
        
        # Step 2: Generate accounts
        print("\nStep 2/5: Generating accounts...")
        self.accounts_df = self.generate_accounts(self.users_df)
        self._print_account_stats()
        
        # Step 3: Generate transactions
        print("\nStep 3/5: Generating transactions...")
        self.transactions_df = self.generate_transactions(self.accounts_df)
        self._print_transaction_stats()
        
        # Step 4: Generate liabilities
        print("\nStep 4/5: Generating liabilities...")
        self.liabilities_df = self.generate_liabilities(self.accounts_df)
        self._print_liability_stats()
        
        # Step 5: Export to CSV
        print("\nStep 5/5: Exporting data...")
        self.export_csv(output_dir)
        
        # Step 6: Create metadata
        metadata = self._create_metadata(output_dir)
        
        # Calculate elapsed time
        elapsed_time = time.time() - start_time
        
        print("\n" + "="*60)
        print("DATA GENERATION COMPLETE")
        print("="*60)
        print(f"\n✓ Generated {len(self.users_df)} users")
        print(f"✓ Generated {len(self.accounts_df)} accounts")
        print(f"✓ Generated {len(self.transactions_df)} transactions")
        print(f"✓ Generated {len(self.liabilities_df)} liabilities")
        print(f"\n⏱ Generation time: {elapsed_time:.2f} seconds")
        print(f"📁 Output directory: {output_dir}")
        print("\n" + "="*60 + "\n")
        
        return metadata
    
    def generate_users(self) -> pd.DataFrame:
        """
        Generate user profiles with demographics.
        
        Creates realistic user profiles with proper age, income, and geographic
        distributions following US Census data patterns.
        
        Returns:
            DataFrame with user data (user_id, name, email, created_at, metadata)
        """
        print(f"Generating {self.num_users} users...")
        
        users = []
        
        for i in range(self.num_users):
            # Sample age from distribution
            age = self._sample_age()
            
            # Calculate income based on age
            income = self._sample_income(age)
            
            # Sample geographic region
            region = weighted_choice(GEOGRAPHIC_REGIONS)
            
            # Infer life stage from age and income
            life_stage = self._infer_life_stage(age, income)
            
            # Create user record
            user = {
                'user_id': f'user_{i:03d}',
                'name': self.fake.name(),
                'email': f'user{i:03d}@example.com',
                'created_at': datetime.now().isoformat(),
                'metadata': json.dumps({
                    'age': age,
                    'age_bracket': self._get_age_bracket(age),
                    'income': income,
                    'income_bracket': self._get_income_bracket(income),
                    'region': region,
                    'life_stage': life_stage
                })
            }
            
            users.append(user)
        
        self.users_df = pd.DataFrame(users)
        
        print(f"✓ Generated {len(self.users_df)} users")
        self._print_user_stats()
        
        return self.users_df
    
    def _sample_age(self) -> int:
        """
        Sample age from realistic distribution.
        
        Returns:
            Age in years (18-65)
        """
        # Get age brackets and weights
        brackets = []
        weights = []
        
        for bracket_name, bracket_info in AGE_BRACKETS.items():
            brackets.append(bracket_info['range'])
            weights.append(bracket_info['weight'])
        
        # Choose a bracket
        chosen_bracket = random.choices(brackets, weights=weights)[0]
        
        # Sample uniformly within bracket
        return random.randint(chosen_bracket[0], chosen_bracket[1])
    
    def _sample_income(self, age: int) -> int:
        """
        Sample income based on age and realistic distributions.
        
        Args:
            age: User's age
        
        Returns:
            Annual income in dollars
        """
        # Younger users tend toward lower income
        if age < 25:
            # Students and early career
            bracket_weights = {'low': 0.50, 'mid': 0.40, 'upper_mid': 0.08, 'high': 0.02}
        elif age < 35:
            # Young professionals
            bracket_weights = {'low': 0.15, 'mid': 0.50, 'upper_mid': 0.30, 'high': 0.05}
        elif age < 50:
            # Peak earning years
            bracket_weights = {'low': 0.10, 'mid': 0.35, 'upper_mid': 0.40, 'high': 0.15}
        else:
            # Late career
            bracket_weights = {'low': 0.15, 'mid': 0.30, 'upper_mid': 0.35, 'high': 0.20}
        
        # Choose income bracket
        bracket_name = weighted_choice(bracket_weights)
        bracket_range = INCOME_BRACKETS[bracket_name]['range']
        
        # Sample uniformly within bracket
        return random.randint(bracket_range[0], bracket_range[1])
    
    def _get_age_bracket(self, age: int) -> str:
        """
        Categorize age into bracket.
        
        Args:
            age: User's age
        
        Returns:
            Age bracket name (e.g., '26-35')
        """
        for bracket_name, bracket_info in AGE_BRACKETS.items():
            min_age, max_age = bracket_info['range']
            if min_age <= age <= max_age:
                return bracket_name
        
        return 'unknown'
    
    def _get_income_bracket(self, income: int) -> str:
        """
        Categorize income into bracket.
        
        Args:
            income: Annual income
        
        Returns:
            Income bracket name (e.g., 'mid', 'high')
        """
        for bracket_name, bracket_info in INCOME_BRACKETS.items():
            min_income, max_income = bracket_info['range']
            if min_income <= income <= max_income:
                return bracket_name
        
        return 'unknown'
    
    def _infer_life_stage(self, age: int, income: int) -> str:
        """
        Infer life stage from age and income.
        
        Args:
            age: User's age
            income: Annual income
        
        Returns:
            Life stage description
        """
        if age < 25:
            if income < 30000:
                return 'student'
            else:
                return 'early_career'
        elif age < 35:
            if income < 50000:
                return 'young_professional_struggling'
            else:
                return 'young_professional'
        elif age < 50:
            if income < 60000:
                return 'mid_career_moderate'
            elif income < 100000:
                return 'mid_career_stable'
            else:
                return 'mid_career_high_earner'
        else:
            if income < 60000:
                return 'pre_retirement_moderate'
            else:
                return 'pre_retirement_comfortable'
    
    def _print_user_stats(self) -> None:
        """Print statistics about generated users."""
        if self.users_df is None:
            return
        
        print("\nUser Demographics Summary:")
        print("-" * 50)
        
        # Parse metadata
        metadata_list = self.users_df['metadata'].apply(json.loads).tolist()
        
        # Age distribution
        age_brackets = [m['age_bracket'] for m in metadata_list]
        print("\nAge Distribution:")
        for bracket in AGE_BRACKETS.keys():
            count = age_brackets.count(bracket)
            pct = (count / len(age_brackets)) * 100
            print(f"  {bracket}: {count} users ({pct:.1f}%)")
        
        # Income distribution
        income_brackets = [m['income_bracket'] for m in metadata_list]
        print("\nIncome Distribution:")
        for bracket in INCOME_BRACKETS.keys():
            count = income_brackets.count(bracket)
            pct = (count / len(income_brackets)) * 100
            print(f"  {bracket}: {count} users ({pct:.1f}%)")
        
        # Region distribution
        regions = [m['region'] for m in metadata_list]
        print("\nGeographic Distribution:")
        for region in GEOGRAPHIC_REGIONS.keys():
            count = regions.count(region)
            pct = (count / len(regions)) * 100
            print(f"  {region}: {count} users ({pct:.1f}%)")
        
        print("-" * 50)
    
    def generate_accounts(self, users_df: pd.DataFrame) -> pd.DataFrame:
        """
        Generate bank accounts for users.
        
        Creates realistic bank accounts following these rules:
        - Every user gets 1 checking account
        - 70% of users get a savings account
        - 0-3 credit cards based on income
        - 25% of users get student loans (higher for age 18-35)
        
        Args:
            users_df: DataFrame with user data
        
        Returns:
            DataFrame with account data
        """
        print(f"\nGenerating accounts for {len(users_df)} users...")
        
        accounts = []
        
        for _, user in users_df.iterrows():
            user_id = user['user_id']
            metadata = json.loads(user['metadata'])
            income = metadata['income']
            age = metadata['age']
            
            # Every user has checking account
            accounts.append(self._create_checking_account(user_id, income))
            
            # 70% have savings accounts
            if random.random() < ACCOUNT_DISTRIBUTION['savings']:
                accounts.append(self._create_savings_account(user_id, income))
            
            # Credit cards (0-3 based on income)
            num_cards = self._sample_credit_card_count(income)
            for _ in range(num_cards):
                accounts.append(self._create_credit_card(user_id, income))
            
            # Student loans (25% overall, higher for young users)
            if age <= 35:
                student_loan_prob = ACCOUNT_DISTRIBUTION['student_loan_young']
            else:
                student_loan_prob = ACCOUNT_DISTRIBUTION['student_loan_other']
            
            if random.random() < student_loan_prob:
                accounts.append(self._create_student_loan(user_id, income))
        
        self.accounts_df = pd.DataFrame(accounts)
        
        print(f"✓ Generated {len(self.accounts_df)} accounts")
        self._print_account_stats()
        
        return self.accounts_df
    
    def _create_checking_account(self, user_id: str, income: int) -> dict:
        """
        Create a checking account.
        
        Args:
            user_id: User ID
            income: Annual income
        
        Returns:
            Account dictionary
        """
        monthly_income = income / 12
        
        # Balance: 1-3 months of income
        balance = round(monthly_income * random.uniform(1.0, 3.0), 2)
        
        # Pick a bank
        bank = random.choice(MERCHANTS['banks'])
        
        account = {
            'account_id': f'acc_{uuid.uuid4().hex[:12]}',
            'user_id': user_id,
            'type': 'checking',
            'subtype': 'checking',
            'name': f'{bank} Checking',
            'official_name': f'{bank} Bank N.A.',
            'mask': self._generate_account_mask(),
            'available_balance': balance,
            'current_balance': balance,
            'credit_limit': None,
            'iso_currency_code': 'USD',
            'holder_category': 'personal',
            'created_at': datetime.now().isoformat()
        }
        
        return account
    
    def _create_savings_account(self, user_id: str, income: int) -> dict:
        """
        Create a savings account.
        
        Args:
            user_id: User ID
            income: Annual income
        
        Returns:
            Account dictionary
        """
        monthly_income = income / 12
        
        # Balance: 1-6 months of expenses (emergency fund)
        # Assume expenses are ~70% of income
        monthly_expenses = monthly_income * 0.7
        balance = round(monthly_expenses * random.uniform(1.0, 6.0), 2)
        
        # Pick a bank
        bank = random.choice(MERCHANTS['banks'])
        
        account = {
            'account_id': f'acc_{uuid.uuid4().hex[:12]}',
            'user_id': user_id,
            'type': 'savings',
            'subtype': 'savings',
            'name': f'{bank} Savings',
            'official_name': f'{bank} Bank N.A.',
            'mask': self._generate_account_mask(),
            'available_balance': balance,
            'current_balance': balance,
            'credit_limit': None,
            'iso_currency_code': 'USD',
            'holder_category': 'personal',
            'created_at': datetime.now().isoformat()
        }
        
        return account
    
    def _create_credit_card(self, user_id: str, income: int) -> dict:
        """
        Create a credit card account.
        
        Args:
            user_id: User ID
            income: Annual income
        
        Returns:
            Account dictionary
        """
        # Credit limit: roughly 20-40% of annual income
        credit_limit = round(income * random.uniform(0.20, 0.40), 2)
        
        # Current balance: 10-70% utilization
        utilization = random.uniform(
            FINANCIAL_RATIOS['credit_utilization'][0],
            FINANCIAL_RATIOS['credit_utilization'][1]
        )
        current_balance = round(credit_limit * utilization, 2)
        
        # Available balance
        available_balance = round(credit_limit - current_balance, 2)
        
        # Pick a bank
        bank = random.choice(MERCHANTS['banks'])
        
        # Card subtype
        subtype = random.choice(['rewards', 'cash_back', 'travel', 'standard'])
        
        account = {
            'account_id': f'acc_{uuid.uuid4().hex[:12]}',
            'user_id': user_id,
            'type': 'credit_card',
            'subtype': subtype,
            'name': f'{bank} {subtype.replace("_", " ").title()} Card',
            'official_name': f'{bank} Bank N.A.',
            'mask': self._generate_account_mask(),
            'available_balance': available_balance,
            'current_balance': current_balance,
            'credit_limit': credit_limit,
            'iso_currency_code': 'USD',
            'holder_category': 'personal',
            'created_at': datetime.now().isoformat()
        }
        
        return account
    
    def _create_student_loan(self, user_id: str, income: int) -> dict:
        """
        Create a student loan account.
        
        Args:
            user_id: User ID
            income: Annual income
        
        Returns:
            Account dictionary
        """
        # Balance: $15K-$60K (realistic student loan debt)
        balance = round(random.uniform(15000, 60000), 2)
        
        account = {
            'account_id': f'acc_{uuid.uuid4().hex[:12]}',
            'user_id': user_id,
            'type': 'student_loan',
            'subtype': 'student',
            'name': 'Federal Student Loan',
            'official_name': 'U.S. Department of Education',
            'mask': self._generate_account_mask(),
            'available_balance': None,
            'current_balance': balance,
            'credit_limit': None,
            'iso_currency_code': 'USD',
            'holder_category': 'personal',
            'created_at': datetime.now().isoformat()
        }
        
        return account
    
    def _sample_credit_card_count(self, income: int) -> int:
        """
        Sample number of credit cards based on income.
        
        Higher income users tend to have more credit cards.
        
        Args:
            income: Annual income
        
        Returns:
            Number of credit cards (0-3)
        """
        if income < 35000:
            # Low income: 0-1 cards
            weights = [0.60, 0.30, 0.10, 0.00]  # [0, 1, 2, 3]
        elif income < 75000:
            # Mid income: 1-2 cards
            weights = [0.20, 0.40, 0.30, 0.10]
        elif income < 150000:
            # Upper-mid income: 1-3 cards
            weights = [0.10, 0.30, 0.40, 0.20]
        else:
            # High income: 2-3 cards
            weights = [0.05, 0.20, 0.40, 0.35]
        
        return random.choices([0, 1, 2, 3], weights=weights)[0]
    
    def _generate_account_mask(self) -> str:
        """
        Generate last 4 digits of account number.
        
        Returns:
            4-digit string
        """
        return f'{random.randint(0, 9999):04d}'
    
    def _print_account_stats(self) -> None:
        """Print statistics about generated accounts."""
        if self.accounts_df is None:
            return
        
        print("\nAccount Summary:")
        print("-" * 50)
        
        # Count by type
        account_types = self.accounts_df['type'].value_counts()
        total_accounts = len(self.accounts_df)
        num_users = len(self.accounts_df['user_id'].unique())
        
        print(f"Total accounts: {total_accounts}")
        print(f"Accounts per user (avg): {total_accounts / num_users:.2f}")
        print("\nAccount Types:")
        for acc_type, count in account_types.items():
            pct = (count / num_users) * 100
            print(f"  {acc_type}: {count} ({pct:.1f}% of users)")
        
        # Credit card analysis
        credit_cards = self.accounts_df[self.accounts_df['type'] == 'credit_card']
        if len(credit_cards) > 0:
            avg_limit = credit_cards['credit_limit'].mean()
            avg_balance = credit_cards['current_balance'].mean()
            avg_utilization = (avg_balance / avg_limit) * 100
            print(f"\nCredit Card Stats:")
            print(f"  Avg credit limit: ${avg_limit:,.2f}")
            print(f"  Avg balance: ${avg_balance:,.2f}")
            print(f"  Avg utilization: {avg_utilization:.1f}%")
        
        # Savings analysis
        savings = self.accounts_df[self.accounts_df['type'] == 'savings']
        if len(savings) > 0:
            avg_savings = savings['current_balance'].mean()
            print(f"\nSavings Stats:")
            print(f"  Avg savings balance: ${avg_savings:,.2f}")
        
        print("-" * 50)
    
    def generate_transactions(self, accounts_df: pd.DataFrame) -> pd.DataFrame:
        """
        Generate 6 months of transactions for all accounts.
        
        Creates realistic transaction patterns including:
        - Payroll deposits (biweekly or monthly)
        - Regular expenses (rent, utilities, subscriptions)
        - Random spending (groceries, restaurants, coffee)
        - Credit card transactions and payments
        - Savings transfers
        
        Args:
            accounts_df: DataFrame with account data
        
        Returns:
            DataFrame with transaction data
        """
        print(f"\nGenerating transactions for {len(accounts_df)} accounts...")
        
        all_transactions = []
        
        # Date range
        start_date = datetime.strptime(DATE_RANGE_START, "%Y-%m-%d")
        end_date = datetime.strptime(DATE_RANGE_END, "%Y-%m-%d")
        
        # Generate transactions for each account
        for idx, account in accounts_df.iterrows():
            account_id = account['account_id']
            account_type = account['type']
            user_id = account['user_id']
            
            # Route to appropriate generator based on account type
            if account_type == 'checking':
                txns = self._generate_checking_transactions(
                    account_id, user_id, start_date, end_date
                )
            elif account_type == 'savings':
                txns = self._generate_savings_transactions(
                    account_id, user_id, start_date, end_date
                )
            elif account_type == 'credit_card':
                txns = self._generate_credit_transactions(
                    account_id, user_id, start_date, end_date
                )
            else:
                # Student loans and other accounts have minimal transactions
                txns = []
            
            all_transactions.extend(txns)
            
            if (idx + 1) % 10 == 0:
                print(f"  Progress: {idx + 1}/{len(accounts_df)} accounts")
        
        self.transactions_df = pd.DataFrame(all_transactions)
        
        # Sort by date
        self.transactions_df = self.transactions_df.sort_values('date').reset_index(drop=True)
        
        print(f"✓ Generated {len(self.transactions_df)} transactions")
        self._print_transaction_stats()
        
        return self.transactions_df
    
    def _get_user_metadata(self, user_id: str) -> dict:
        """
        Get user metadata for transaction calibration.
        
        Args:
            user_id: User ID
        
        Returns:
            Dictionary with age, income, etc.
        """
        if self.users_df is None:
            raise ValueError("Users must be generated first")
        
        user_row = self.users_df[self.users_df['user_id'] == user_id]
        if len(user_row) == 0:
            raise ValueError(f"User {user_id} not found")
        
        metadata = json.loads(user_row.iloc[0]['metadata'])
        return metadata
    
    def _generate_checking_transactions(self, account_id: str, user_id: str, 
                                       start_date: datetime, end_date: datetime) -> List[dict]:
        """
        Generate realistic checking account transactions.
        
        Includes:
        - Payroll deposits (biweekly or monthly)
        - Rent/mortgage payments
        - Utilities
        - Subscriptions
        - Groceries, restaurants, coffee
        
        Args:
            account_id: Account ID
            user_id: User ID
            start_date: Start date
            end_date: End date
        
        Returns:
            List of transaction dictionaries
        """
        transactions = []
        
        # Get user metadata
        user_metadata = self._get_user_metadata(user_id)
        monthly_income = user_metadata['income'] / 12
        
        # 1. Generate payroll deposits
        payroll_frequency = random.choice(['biweekly', 'monthly'])
        
        if payroll_frequency == 'biweekly':
            pay_amount = monthly_income / 2
            pay_interval = 14
        else:
            pay_amount = monthly_income
            pay_interval = 30
        
        # First payroll deposit (random day in first week)
        deposit_date = start_date + timedelta(days=random.randint(1, 7))
        
        while deposit_date <= end_date:
            # Add small variance (±2%)
            amount = round(pay_amount * random.uniform(0.98, 1.02), 2)
            
            transactions.append({
                'transaction_id': f'txn_{uuid.uuid4().hex[:12]}',
                'account_id': account_id,
                'user_id': user_id,
                'date': deposit_date.strftime('%Y-%m-%d'),
                'amount': amount,
                'merchant_name': 'Employer Direct Deposit',
                'merchant_entity_id': f'employer_{user_id}',
                'payment_channel': 'other',
                'category_primary': 'INCOME',
                'category_detailed': 'PAYROLL',
                'pending': False,
                'location_city': None,
                'location_region': None,
                'location_postal_code': None,
                'created_at': datetime.now().isoformat()
            })
            
            deposit_date += timedelta(days=pay_interval)
        
        # 2. Generate regular expenses
        transactions.extend(self._generate_regular_expenses(
            account_id, user_id, start_date, end_date, monthly_income
        ))
        
        # 3. Generate random spending
        transactions.extend(self._generate_random_spending(
            account_id, user_id, start_date, end_date, monthly_income, user_metadata
        ))
        
        return transactions
    
    def _generate_regular_expenses(self, account_id: str, user_id: str,
                                   start_date: datetime, end_date: datetime,
                                   monthly_income: float) -> List[dict]:
        """
        Generate recurring monthly expenses.
        
        Args:
            account_id: Account ID
            user_id: User ID
            start_date: Start date
            end_date: End date
            monthly_income: Monthly income
        
        Returns:
            List of transaction dictionaries
        """
        transactions = []
        
        # Rent/Mortgage (25-35% of monthly income, paid on 1st ±2 days)
        rent_amount = monthly_income * random.uniform(
            FINANCIAL_RATIOS['rent_to_income'][0],
            FINANCIAL_RATIOS['rent_to_income'][1]
        )
        
        current_date = start_date + timedelta(days=random.randint(0, 2))
        
        while current_date <= end_date:
            transactions.append({
                'transaction_id': f'txn_{uuid.uuid4().hex[:12]}',
                'account_id': account_id,
                'user_id': user_id,
                'date': current_date.strftime('%Y-%m-%d'),
                'amount': -round(rent_amount * random.uniform(0.99, 1.01), 2),
                'merchant_name': 'Property Management Co',
                'merchant_entity_id': 'merch_rent_001',
                'payment_channel': 'other',
                'category_primary': 'RENT_AND_UTILITIES',
                'category_detailed': 'RENT',
                'pending': False,
                'location_city': None,
                'location_region': None,
                'location_postal_code': None,
                'created_at': datetime.now().isoformat()
            })
            current_date += timedelta(days=30)
        
        # Utilities (paid on 15th ±2 days)
        utility_amount = random.uniform(80, 150)
        current_date = start_date + timedelta(days=random.randint(13, 17))
        
        while current_date <= end_date:
            transactions.append({
                'transaction_id': f'txn_{uuid.uuid4().hex[:12]}',
                'account_id': account_id,
                'user_id': user_id,
                'date': current_date.strftime('%Y-%m-%d'),
                'amount': -round(utility_amount * random.uniform(0.9, 1.1), 2),
                'merchant_name': random.choice(MERCHANTS['utilities']),
                'merchant_entity_id': 'merch_utility_001',
                'payment_channel': 'other',
                'category_primary': 'RENT_AND_UTILITIES',
                'category_detailed': 'ELECTRIC',
                'pending': False,
                'location_city': None,
                'location_region': None,
                'location_postal_code': None,
                'created_at': datetime.now().isoformat()
            })
            current_date += timedelta(days=30)
        
        # Subscriptions (40% of users have 1-3 subscriptions)
        if random.random() < 0.4:
            num_subscriptions = random.randint(1, 3)
            selected_subs = random.sample(MERCHANTS['subscription'], num_subscriptions)
            
            for merchant, amount in selected_subs:
                # Random day between 1-28
                current_date = start_date + timedelta(days=random.randint(1, 28))
                
                while current_date <= end_date:
                    transactions.append({
                        'transaction_id': f'txn_{uuid.uuid4().hex[:12]}',
                        'account_id': account_id,
                        'user_id': user_id,
                        'date': current_date.strftime('%Y-%m-%d'),
                        'amount': -round(amount, 2),
                        'merchant_name': merchant,
                        'merchant_entity_id': f'merch_{merchant.lower().replace(" ", "_")}',
                        'payment_channel': 'online',
                        'category_primary': 'ENTERTAINMENT',
                        'category_detailed': 'SUBSCRIPTION',
                        'pending': False,
                        'location_city': None,
                        'location_region': None,
                        'location_postal_code': None,
                        'created_at': datetime.now().isoformat()
                    })
                    current_date += timedelta(days=30)
        
        return transactions
    
    def _generate_random_spending(self, account_id: str, user_id: str,
                                  start_date: datetime, end_date: datetime,
                                  monthly_income: float, user_metadata: dict) -> List[dict]:
        """
        Generate random daily spending patterns.
        
        Args:
            account_id: Account ID
            user_id: User ID
            start_date: Start date
            end_date: End date
            monthly_income: Monthly income
            user_metadata: User demographics
        
        Returns:
            List of transaction dictionaries
        """
        transactions = []
        current_date = start_date
        
        while current_date <= end_date:
            # Groceries (40% chance per day, higher on weekends)
            grocery_prob = 0.5 if current_date.weekday() >= 5 else 0.4
            
            if random.random() < grocery_prob:
                transactions.append({
                    'transaction_id': f'txn_{uuid.uuid4().hex[:12]}',
                    'account_id': account_id,
                    'user_id': user_id,
                    'date': current_date.strftime('%Y-%m-%d'),
                    'amount': -round(random.uniform(30, 150), 2),
                    'merchant_name': random.choice(MERCHANTS['grocery']),
                    'merchant_entity_id': 'merch_grocery_001',
                    'payment_channel': 'in_store',
                    'category_primary': 'FOOD_AND_DRINK',
                    'category_detailed': 'GROCERIES',
                    'pending': False,
                    'location_city': 'Austin',
                    'location_region': 'TX',
                    'location_postal_code': '78701',
                    'created_at': datetime.now().isoformat()
                })
            
            # Restaurants (50% chance per day, higher on weekends)
            restaurant_prob = 0.65 if current_date.weekday() >= 5 else 0.5
            
            if random.random() < restaurant_prob:
                transactions.append({
                    'transaction_id': f'txn_{uuid.uuid4().hex[:12]}',
                    'account_id': account_id,
                    'user_id': user_id,
                    'date': current_date.strftime('%Y-%m-%d'),
                    'amount': -round(random.uniform(12, 60), 2),
                    'merchant_name': random.choice(MERCHANTS['restaurant']),
                    'merchant_entity_id': 'merch_restaurant_001',
                    'payment_channel': random.choice(['in_store', 'online']),
                    'category_primary': 'FOOD_AND_DRINK',
                    'category_detailed': 'RESTAURANTS',
                    'pending': False,
                    'location_city': 'Austin',
                    'location_region': 'TX',
                    'location_postal_code': '78701',
                    'created_at': datetime.now().isoformat()
                })
            
            # Coffee shops (students and high-income professionals)
            age = user_metadata['age']
            if age <= 25 or monthly_income > 6000:
                coffee_prob = 0.6 if current_date.weekday() < 5 else 0.3
                
                if random.random() < coffee_prob:
                    transactions.append({
                        'transaction_id': f'txn_{uuid.uuid4().hex[:12]}',
                        'account_id': account_id,
                        'user_id': user_id,
                        'date': current_date.strftime('%Y-%m-%d'),
                        'amount': -round(random.uniform(4, 8), 2),
                        'merchant_name': random.choice(MERCHANTS['coffee']),
                        'merchant_entity_id': 'merch_coffee_001',
                        'payment_channel': 'in_store',
                        'category_primary': 'FOOD_AND_DRINK',
                        'category_detailed': 'COFFEE_SHOPS',
                        'pending': False,
                        'location_city': 'Austin',
                        'location_region': 'TX',
                        'location_postal_code': '78701',
                        'created_at': datetime.now().isoformat()
                    })
            
            # Gas (for most users, 1-2 times per week)
            if random.random() < 0.2:
                transactions.append({
                    'transaction_id': f'txn_{uuid.uuid4().hex[:12]}',
                    'account_id': account_id,
                    'user_id': user_id,
                    'date': current_date.strftime('%Y-%m-%d'),
                    'amount': -round(random.uniform(35, 60), 2),
                    'merchant_name': random.choice(MERCHANTS['gas']),
                    'merchant_entity_id': 'merch_gas_001',
                    'payment_channel': 'in_store',
                    'category_primary': 'TRANSPORTATION',
                    'category_detailed': 'GAS',
                    'pending': False,
                    'location_city': 'Austin',
                    'location_region': 'TX',
                    'location_postal_code': '78701',
                    'created_at': datetime.now().isoformat()
                })
            
            current_date += timedelta(days=1)
        
        return transactions
    
    def _generate_credit_transactions(self, account_id: str, user_id: str,
                                      start_date: datetime, end_date: datetime) -> List[dict]:
        """
        Generate credit card transactions.
        
        Includes:
        - Online shopping
        - Dining and entertainment
        - Shopping (clothing, electronics)
        - Monthly payment from checking
        
        Args:
            account_id: Account ID
            user_id: User ID
            start_date: Start date
            end_date: End date
        
        Returns:
            List of transaction dictionaries
        """
        transactions = []
        current_date = start_date
        
        while current_date <= end_date:
            # Shopping (20% chance per day, higher frequency than checking)
            if random.random() < 0.2:
                amount = random.uniform(25, 200)
                merchant = random.choice(['Amazon', 'Target', 'Best Buy', 'Macys', 'Nordstrom'])
                
                transactions.append({
                    'transaction_id': f'txn_{uuid.uuid4().hex[:12]}',
                    'account_id': account_id,
                    'user_id': user_id,
                    'date': current_date.strftime('%Y-%m-%d'),
                    'amount': -round(amount, 2),
                    'merchant_name': merchant,
                    'merchant_entity_id': f'merch_{merchant.lower()}',
                    'payment_channel': 'online',
                    'category_primary': 'SHOPPING',
                    'category_detailed': 'GENERAL',
                    'pending': False,
                    'location_city': None,
                    'location_region': None,
                    'location_postal_code': None,
                    'created_at': datetime.now().isoformat()
                })
            
            # Dining (30% chance per day)
            if random.random() < 0.3:
                transactions.append({
                    'transaction_id': f'txn_{uuid.uuid4().hex[:12]}',
                    'account_id': account_id,
                    'user_id': user_id,
                    'date': current_date.strftime('%Y-%m-%d'),
                    'amount': -round(random.uniform(15, 75), 2),
                    'merchant_name': random.choice(MERCHANTS['restaurant']),
                    'merchant_entity_id': 'merch_restaurant_cc',
                    'payment_channel': random.choice(['in_store', 'online']),
                    'category_primary': 'FOOD_AND_DRINK',
                    'category_detailed': 'RESTAURANTS',
                    'pending': False,
                    'location_city': 'Austin',
                    'location_region': 'TX',
                    'location_postal_code': '78701',
                    'created_at': datetime.now().isoformat()
                })
            
            # Entertainment (10% chance per day)
            if random.random() < 0.1:
                entertainment_merchants = [
                    ('AMC Theaters', 'MOVIES', 15, 30),
                    ('Spotify', 'STREAMING', 10, 11),
                    ('Steam', 'GENERAL', 5, 60)
                ]
                merchant, category, min_amt, max_amt = random.choice(entertainment_merchants)
                
                transactions.append({
                    'transaction_id': f'txn_{uuid.uuid4().hex[:12]}',
                    'account_id': account_id,
                    'user_id': user_id,
                    'date': current_date.strftime('%Y-%m-%d'),
                    'amount': -round(random.uniform(min_amt, max_amt), 2),
                    'merchant_name': merchant,
                    'merchant_entity_id': f'merch_{merchant.lower().replace(" ", "_")}',
                    'payment_channel': 'online',
                    'category_primary': 'ENTERTAINMENT',
                    'category_detailed': category,
                    'pending': False,
                    'location_city': None,
                    'location_region': None,
                    'location_postal_code': None,
                    'created_at': datetime.now().isoformat()
                })
            
            current_date += timedelta(days=1)
        
        # Add monthly payment (transfer from checking)
        # Payment on 25th of each month
        payment_date = start_date + timedelta(days=25 - start_date.day if start_date.day < 25 else 55 - start_date.day)
        
        while payment_date <= end_date:
            # Payment amount: random between minimum payment and 50% of balance
            payment_amount = random.uniform(50, 300)
            
            transactions.append({
                'transaction_id': f'txn_{uuid.uuid4().hex[:12]}',
                'account_id': account_id,
                'user_id': user_id,
                'date': payment_date.strftime('%Y-%m-%d'),
                'amount': round(payment_amount, 2),  # Positive = credit/payment
                'merchant_name': 'Credit Card Payment',
                'merchant_entity_id': 'payment_from_checking',
                'payment_channel': 'other',
                'category_primary': 'TRANSFER',
                'category_detailed': 'INTERNAL',
                'pending': False,
                'location_city': None,
                'location_region': None,
                'location_postal_code': None,
                'created_at': datetime.now().isoformat()
            })
            
            payment_date += timedelta(days=30)
        
        return transactions
    
    def _generate_savings_transactions(self, account_id: str, user_id: str,
                                       start_date: datetime, end_date: datetime) -> List[dict]:
        """
        Generate savings account transactions.
        
        Includes:
        - Monthly transfers from checking
        - Occasional withdrawals
        - Quarterly interest
        
        Args:
            account_id: Account ID
            user_id: User ID
            start_date: Start date
            end_date: End date
        
        Returns:
            List of transaction dictionaries
        """
        transactions = []
        
        # Monthly savings transfers (5-20% of income)
        user_metadata = self._get_user_metadata(user_id)
        monthly_income = user_metadata['income'] / 12
        savings_rate = random.uniform(
            FINANCIAL_RATIOS['savings_rate'][0],
            FINANCIAL_RATIOS['savings_rate'][1]
        )
        monthly_savings = monthly_income * savings_rate
        
        # Transfer on 5th of each month (after payday)
        transfer_date = start_date + timedelta(days=5 - start_date.day if start_date.day < 5 else 35 - start_date.day)
        
        while transfer_date <= end_date:
            transactions.append({
                'transaction_id': f'txn_{uuid.uuid4().hex[:12]}',
                'account_id': account_id,
                'user_id': user_id,
                'date': transfer_date.strftime('%Y-%m-%d'),
                'amount': round(monthly_savings * random.uniform(0.8, 1.2), 2),
                'merchant_name': 'Transfer from Checking',
                'merchant_entity_id': 'transfer_checking',
                'payment_channel': 'other',
                'category_primary': 'TRANSFER',
                'category_detailed': 'INTERNAL',
                'pending': False,
                'location_city': None,
                'location_region': None,
                'location_postal_code': None,
                'created_at': datetime.now().isoformat()
            })
            
            transfer_date += timedelta(days=30)
        
        # Occasional withdrawals (10% chance per month)
        current_date = start_date
        while current_date <= end_date:
            if random.random() < 0.1:
                transactions.append({
                    'transaction_id': f'txn_{uuid.uuid4().hex[:12]}',
                    'account_id': account_id,
                    'user_id': user_id,
                    'date': current_date.strftime('%Y-%m-%d'),
                    'amount': -round(random.uniform(100, 500), 2),
                    'merchant_name': 'Withdrawal to Checking',
                    'merchant_entity_id': 'withdrawal_checking',
                    'payment_channel': 'other',
                    'category_primary': 'TRANSFER',
                    'category_detailed': 'INTERNAL',
                    'pending': False,
                    'location_city': None,
                    'location_region': None,
                    'location_postal_code': None,
                    'created_at': datetime.now().isoformat()
                })
            
            current_date += timedelta(days=30)
        
        # Quarterly interest (0.5% APY / 4)
        interest_date = start_date + timedelta(days=90)
        while interest_date <= end_date:
            # Estimate balance for interest calculation
            estimated_balance = monthly_savings * 3  # Rough estimate
            interest = estimated_balance * 0.0005 / 4  # 0.05% APY quarterly
            
            transactions.append({
                'transaction_id': f'txn_{uuid.uuid4().hex[:12]}',
                'account_id': account_id,
                'user_id': user_id,
                'date': interest_date.strftime('%Y-%m-%d'),
                'amount': round(interest, 2),
                'merchant_name': 'Interest Earned',
                'merchant_entity_id': 'bank_interest',
                'payment_channel': 'other',
                'category_primary': 'INCOME',
                'category_detailed': 'INTEREST',
                'pending': False,
                'location_city': None,
                'location_region': None,
                'location_postal_code': None,
                'created_at': datetime.now().isoformat()
            })
            
            interest_date += timedelta(days=90)
        
        return transactions
    
    def _print_transaction_stats(self) -> None:
        """Print statistics about generated transactions."""
        if self.transactions_df is None:
            return
        
        print("\nTransaction Summary:")
        print("-" * 50)
        
        total_txns = len(self.transactions_df)
        num_users = self.transactions_df['user_id'].nunique()
        
        print(f"Total transactions: {total_txns:,}")
        print(f"Transactions per user (avg): {total_txns / num_users:.1f}")
        
        # Date range
        min_date = self.transactions_df['date'].min()
        max_date = self.transactions_df['date'].max()
        print(f"Date range: {min_date} to {max_date}")
        
        # Category breakdown
        print("\nTop Categories:")
        category_counts = self.transactions_df['category_primary'].value_counts().head(5)
        for category, count in category_counts.items():
            pct = (count / total_txns) * 100
            print(f"  {category}: {count:,} ({pct:.1f}%)")
        
        # Income vs expenses
        income_txns = self.transactions_df[self.transactions_df['amount'] > 0]
        expense_txns = self.transactions_df[self.transactions_df['amount'] < 0]
        
        total_income = income_txns['amount'].sum()
        total_expenses = abs(expense_txns['amount'].sum())
        
        print(f"\nFinancial Summary:")
        print(f"  Total income: ${total_income:,.2f}")
        print(f"  Total expenses: ${total_expenses:,.2f}")
        print(f"  Net: ${total_income - total_expenses:,.2f}")
        
        print("-" * 50)
    
    def generate_liabilities(self, accounts_df: pd.DataFrame) -> pd.DataFrame:
        """
        Generate liability records for credit accounts.
        
        Creates liability records for:
        - Credit cards: APR, minimum payments, payment dates, overdue status
        - Student loans: interest rates, payment schedules, dates
        
        Args:
            accounts_df: DataFrame with account data
        
        Returns:
            DataFrame with liability data
        """
        print(f"\nGenerating liabilities for credit accounts...")
        
        liabilities = []
        
        # Filter for accounts that have liabilities
        credit_accounts = accounts_df[
            accounts_df['type'].isin(['credit_card', 'student_loan'])
        ]
        
        for _, account in credit_accounts.iterrows():
            account_id = account['account_id']
            account_type = account['type']
            user_id = account['user_id']
            current_balance = account['current_balance']
            
            if account_type == 'credit_card':
                liability = self._create_credit_card_liability(
                    account_id, user_id, current_balance
                )
            elif account_type == 'student_loan':
                liability = self._create_student_loan_liability(
                    account_id, user_id, current_balance
                )
            else:
                continue
            
            liabilities.append(liability)
        
        self.liabilities_df = pd.DataFrame(liabilities)
        
        print(f"✓ Generated {len(self.liabilities_df)} liability records")
        self._print_liability_stats()
        
        return self.liabilities_df
    
    def _create_credit_card_liability(self, account_id: str, user_id: str, 
                                     current_balance: float) -> dict:
        """
        Create credit card liability record.
        
        Args:
            account_id: Account ID
            user_id: User ID
            current_balance: Current card balance
        
        Returns:
            Liability dictionary
        """
        # APR: 15.99% - 24.99% (realistic credit card rates)
        apr_percentage = round(random.uniform(15.99, 24.99), 2)
        
        # Minimum payment: 2% of balance or $25, whichever is greater
        minimum_payment = max(
            round(current_balance * 0.02, 2),
            25.00
        )
        
        # Last payment: between minimum payment and 50% of balance
        last_payment_amount = round(
            random.uniform(minimum_payment, current_balance * 0.5), 2
        )
        
        # Last payment date: 5-25 days ago
        last_payment_date = datetime.now() - timedelta(days=random.randint(5, 25))
        
        # Next payment due: 5-25 days from now
        next_payment_due_date = datetime.now() + timedelta(days=random.randint(5, 25))
        
        # Last statement balance (approximately current balance)
        last_statement_balance = round(current_balance * random.uniform(0.95, 1.05), 2)
        
        # 5% chance of being overdue
        is_overdue = random.random() < 0.05
        
        liability = {
            'liability_id': f'liab_{uuid.uuid4().hex[:12]}',
            'account_id': account_id,
            'user_id': user_id,
            'type': 'credit_card',
            'apr_percentage': apr_percentage,
            'apr_type': 'purchase_apr',
            'minimum_payment_amount': minimum_payment,
            'last_payment_amount': last_payment_amount,
            'last_payment_date': last_payment_date.strftime('%Y-%m-%d'),
            'next_payment_due_date': next_payment_due_date.strftime('%Y-%m-%d'),
            'last_statement_balance': last_statement_balance,
            'is_overdue': is_overdue,
            'interest_rate': None,  # Use apr_percentage for credit cards
            'created_at': datetime.now().isoformat()
        }
        
        return liability
    
    def _create_student_loan_liability(self, account_id: str, user_id: str,
                                      current_balance: float) -> dict:
        """
        Create student loan liability record.
        
        Args:
            account_id: Account ID
            user_id: User ID
            current_balance: Current loan balance
        
        Returns:
            Liability dictionary
        """
        # Interest rate: 4.5% - 7.5% (federal student loan range)
        interest_rate = round(random.uniform(4.5, 7.5), 2)
        
        # Minimum payment: $150-$400 (standard for student loans)
        minimum_payment = round(random.uniform(150, 400), 2)
        
        # Last payment: typically equals minimum payment
        last_payment_amount = round(
            minimum_payment * random.uniform(0.95, 1.05), 2
        )
        
        # Last payment date: 1-28 days ago (monthly payment)
        last_payment_date = datetime.now() - timedelta(days=random.randint(1, 28))
        
        # Next payment due: 1-28 days from now
        next_payment_due_date = datetime.now() + timedelta(days=random.randint(1, 28))
        
        # Last statement balance (approximately current balance)
        last_statement_balance = round(current_balance * random.uniform(0.98, 1.02), 2)
        
        # Students typically pay on time (0.5% chance of overdue)
        is_overdue = random.random() < 0.005
        
        liability = {
            'liability_id': f'liab_{uuid.uuid4().hex[:12]}',
            'account_id': account_id,
            'user_id': user_id,
            'type': 'student_loan',
            'apr_percentage': None,  # Student loans use interest_rate instead
            'apr_type': None,
            'minimum_payment_amount': minimum_payment,
            'last_payment_amount': last_payment_amount,
            'last_payment_date': last_payment_date.strftime('%Y-%m-%d'),
            'next_payment_due_date': next_payment_due_date.strftime('%Y-%m-%d'),
            'last_statement_balance': last_statement_balance,
            'is_overdue': is_overdue,
            'interest_rate': interest_rate,
            'created_at': datetime.now().isoformat()
        }
        
        return liability
    
    def _print_liability_stats(self) -> None:
        """Print statistics about generated liabilities."""
        if self.liabilities_df is None:
            return
        
        print("\nLiability Summary:")
        print("-" * 50)
        
        total_liabs = len(self.liabilities_df)
        print(f"Total liabilities: {total_liabs}")
        
        # Count by type
        liability_types = self.liabilities_df['type'].value_counts()
        print("\nLiability Types:")
        for liab_type, count in liability_types.items():
            print(f"  {liab_type}: {count}")
        
        # Credit card stats
        credit_cards = self.liabilities_df[self.liabilities_df['type'] == 'credit_card']
        if len(credit_cards) > 0:
            avg_apr = credit_cards['apr_percentage'].mean()
            avg_min_payment = credit_cards['minimum_payment_amount'].mean()
            overdue_count = credit_cards['is_overdue'].sum()
            overdue_pct = (overdue_count / len(credit_cards)) * 100
            
            print(f"\nCredit Card Stats:")
            print(f"  Average APR: {avg_apr:.2f}%")
            print(f"  Average min payment: ${avg_min_payment:.2f}")
            print(f"  Overdue accounts: {overdue_count} ({overdue_pct:.1f}%)")
        
        # Student loan stats
        student_loans = self.liabilities_df[self.liabilities_df['type'] == 'student_loan']
        if len(student_loans) > 0:
            avg_rate = student_loans['interest_rate'].mean()
            avg_payment = student_loans['minimum_payment_amount'].mean()
            overdue_count = student_loans['is_overdue'].sum()
            
            print(f"\nStudent Loan Stats:")
            print(f"  Average interest rate: {avg_rate:.2f}%")
            print(f"  Average payment: ${avg_payment:.2f}")
            print(f"  Overdue accounts: {overdue_count}")
        
        print("-" * 50)
    
    def export_csv(self, output_dir: str = CSV_OUTPUT_DIR) -> None:
        """
        Export all data to CSV files.
        
        Saves users, accounts, transactions, and liabilities to separate CSV files
        with proper formatting and metadata.
        
        Args:
            output_dir: Directory to save files (default: 'data/')
        """
        import os
        
        print(f"\nExporting data to {output_dir}...")
        
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)
        
        # Export each DataFrame to CSV
        if self.users_df is not None:
            users_path = os.path.join(output_dir, 'synthetic_users.csv')
            self.users_df.to_csv(users_path, index=False)
            print(f"✓ Exported {len(self.users_df)} users to {users_path}")
        else:
            print("⚠ No users data to export")
        
        if self.accounts_df is not None:
            accounts_path = os.path.join(output_dir, 'synthetic_accounts.csv')
            self.accounts_df.to_csv(accounts_path, index=False)
            print(f"✓ Exported {len(self.accounts_df)} accounts to {accounts_path}")
        else:
            print("⚠ No accounts data to export")
        
        if self.transactions_df is not None:
            transactions_path = os.path.join(output_dir, 'synthetic_transactions.csv')
            self.transactions_df.to_csv(transactions_path, index=False)
            print(f"✓ Exported {len(self.transactions_df)} transactions to {transactions_path}")
        else:
            print("⚠ No transactions data to export")
        
        if self.liabilities_df is not None:
            liabilities_path = os.path.join(output_dir, 'synthetic_liabilities.csv')
            self.liabilities_df.to_csv(liabilities_path, index=False)
            print(f"✓ Exported {len(self.liabilities_df)} liabilities to {liabilities_path}")
        else:
            print("⚠ No liabilities data to export")
        
        print(f"✓ All data exported successfully to {output_dir}")
    
    def _create_metadata(self, output_dir: str = CSV_OUTPUT_DIR) -> Dict:
        """
        Create metadata dictionary about the generated dataset.
        
        Records information about the generation process including counts,
        date ranges, seed, and generation timestamp.
        
        Args:
            output_dir: Directory to save metadata.json
        
        Returns:
            Dictionary with metadata
        """
        import os
        
        # Calculate statistics
        metadata = {
            'generation_info': {
                'seed': self.seed,
                'num_users': self.num_users,
                'generated_at': datetime.now().isoformat(),
                'date_range': {
                    'start': DATE_RANGE_START,
                    'end': DATE_RANGE_END
                }
            },
            'counts': {
                'users': len(self.users_df) if self.users_df is not None else 0,
                'accounts': len(self.accounts_df) if self.accounts_df is not None else 0,
                'transactions': len(self.transactions_df) if self.transactions_df is not None else 0,
                'liabilities': len(self.liabilities_df) if self.liabilities_df is not None else 0
            },
            'files': {
                'users': 'synthetic_users.csv',
                'accounts': 'synthetic_accounts.csv',
                'transactions': 'synthetic_transactions.csv',
                'liabilities': 'synthetic_liabilities.csv'
            }
        }
        
        # Add account type breakdown
        if self.accounts_df is not None:
            account_types = self.accounts_df['type'].value_counts().to_dict()
            metadata['account_types'] = account_types
        
        # Add transaction statistics
        if self.transactions_df is not None:
            metadata['transaction_stats'] = {
                'total_amount': float(self.transactions_df['amount'].sum()),
                'avg_transaction': float(self.transactions_df['amount'].mean()),
                'date_range': {
                    'min': str(self.transactions_df['date'].min()),
                    'max': str(self.transactions_df['date'].max())
                }
            }
        
        # Save metadata to JSON file
        metadata_path = os.path.join(output_dir, 'metadata.json')
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"✓ Saved metadata to {metadata_path}")
        
        return metadata

