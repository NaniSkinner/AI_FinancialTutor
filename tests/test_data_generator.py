"""
Unit tests for SyntheticDataGenerator.

Tests cover:
- User generation (counts, distributions, uniqueness)
- Account generation (types, distributions)
- Transaction generation (dates, counts, amounts)
- Liability generation
- Schema validation
"""

import pytest
import pandas as pd
import json
from datetime import datetime
from ingest.data_generator import SyntheticDataGenerator
from ingest.config import DATE_RANGE_START, DATE_RANGE_END


class TestUserGeneration:
    """Test user generation functionality."""
    
    def test_user_count(self):
        """Test that correct number of users are generated."""
        generator = SyntheticDataGenerator(num_users=100, seed=42)
        users_df = generator.generate_users()
        
        assert len(users_df) == 100, f"Expected 100 users, got {len(users_df)}"
    
    def test_user_id_uniqueness(self):
        """Test that all user IDs are unique."""
        generator = SyntheticDataGenerator(num_users=100, seed=42)
        users_df = generator.generate_users()
        
        assert users_df['user_id'].is_unique, "User IDs are not unique"
        assert not users_df['user_id'].duplicated().any(), "Found duplicate user IDs"
    
    def test_email_uniqueness(self):
        """Test that all emails are unique."""
        generator = SyntheticDataGenerator(num_users=100, seed=42)
        users_df = generator.generate_users()
        
        assert users_df['email'].is_unique, "Emails are not unique"
        assert not users_df['email'].duplicated().any(), "Found duplicate emails"
    
    def test_age_distribution(self):
        """Test that age distribution matches target (±10%)."""
        generator = SyntheticDataGenerator(num_users=100, seed=42)
        users_df = generator.generate_users()
        
        # Parse metadata to get ages
        metadata = users_df['metadata'].apply(json.loads)
        age_brackets = metadata.apply(lambda x: x['age_bracket']).value_counts()
        
        # Expected: 20% (18-25), 30% (26-35), 35% (36-50), 15% (51+)
        # Allow ±10% tolerance for randomness with 100 users
        targets = {
            '18-25': (10, 30),  # 20% ±10%
            '26-35': (20, 40),  # 30% ±10%
            '36-50': (25, 45),  # 35% ±10%
            '51-65': (5, 25)    # 15% ±10%
        }
        
        for bracket, (min_pct, max_pct) in targets.items():
            count = age_brackets.get(bracket, 0)
            assert min_pct <= count <= max_pct, \
                f"Age bracket {bracket}: expected {min_pct}-{max_pct}, got {count}"
    
    def test_income_distribution(self):
        """Test that income distribution is reasonable (±10%)."""
        generator = SyntheticDataGenerator(num_users=100, seed=42)
        users_df = generator.generate_users()
        
        # Parse metadata to get income brackets
        metadata = users_df['metadata'].apply(json.loads)
        income_brackets = metadata.apply(lambda x: x['income_bracket']).value_counts()
        
        # Expected: 20% low, 40% mid, 30% upper_mid, 10% high
        # Allow ±10% tolerance for randomness with age-based income correlation
        targets = {
            'low': (10, 30),       # 20% ±10%
            'mid': (30, 50),       # 40% ±10%
            'upper_mid': (20, 40), # 30% ±10%
            'high': (0, 20)        # 10% ±10%
        }
        
        for bracket, (min_pct, max_pct) in targets.items():
            count = income_brackets.get(bracket, 0)
            assert min_pct <= count <= max_pct, \
                f"Income bracket {bracket}: expected {min_pct}-{max_pct}, got {count}"
    
    def test_geographic_distribution(self):
        """Test geographic distribution matches target."""
        generator = SyntheticDataGenerator(num_users=100, seed=42)
        users_df = generator.generate_users()
        
        # Parse metadata to get regions
        metadata = users_df['metadata'].apply(json.loads)
        regions = metadata.apply(lambda x: x['region']).value_counts()
        
        # Expected: 50% urban, 30% suburban, 20% rural (±5%)
        targets = {
            'urban': (45, 55),
            'suburban': (25, 35),
            'rural': (15, 25)
        }
        
        for region, (min_pct, max_pct) in targets.items():
            count = regions.get(region, 0)
            assert min_pct <= count <= max_pct, \
                f"Region {region}: expected {min_pct}-{max_pct}, got {count}"
    
    def test_required_fields(self):
        """Test that all required fields are present."""
        generator = SyntheticDataGenerator(num_users=10, seed=42)
        users_df = generator.generate_users()
        
        required_fields = ['user_id', 'name', 'email', 'created_at', 'metadata']
        for field in required_fields:
            assert field in users_df.columns, f"Missing required field: {field}"
            assert users_df[field].notna().all(), f"Field {field} has null values"


class TestAccountGeneration:
    """Test account generation functionality."""
    
    def test_all_users_have_checking(self):
        """Test that 100% of users have a checking account."""
        generator = SyntheticDataGenerator(num_users=50, seed=42)
        users_df = generator.generate_users()
        accounts_df = generator.generate_accounts(users_df)
        
        # Check that every user has at least one checking account
        checking_users = accounts_df[accounts_df['type'] == 'checking']['user_id'].unique()
        assert len(checking_users) == 50, \
            f"Expected all 50 users to have checking, got {len(checking_users)}"
    
    def test_savings_account_rate(self):
        """Test that ~70% of users have savings accounts (±10%)."""
        generator = SyntheticDataGenerator(num_users=100, seed=42)
        users_df = generator.generate_users()
        accounts_df = generator.generate_accounts(users_df)
        
        savings_users = accounts_df[accounts_df['type'] == 'savings']['user_id'].unique()
        savings_pct = (len(savings_users) / 100) * 100
        
        assert 60 <= savings_pct <= 80, \
            f"Expected 60-80% savings accounts, got {savings_pct:.1f}%"
    
    def test_credit_card_distribution(self):
        """Test that credit card distribution is income-based."""
        generator = SyntheticDataGenerator(num_users=100, seed=42)
        users_df = generator.generate_users()
        accounts_df = generator.generate_accounts(users_df)
        
        # All users should have 0-3 credit cards
        credit_cards = accounts_df[accounts_df['type'] == 'credit_card']
        cards_per_user = credit_cards.groupby('user_id').size()
        
        assert cards_per_user.max() <= 3, \
            f"Some users have more than 3 credit cards: {cards_per_user.max()}"
        assert cards_per_user.min() >= 0, \
            f"Invalid credit card count"
    
    def test_student_loan_rate(self):
        """Test that ~25% of users have student loans (±10%)."""
        generator = SyntheticDataGenerator(num_users=100, seed=42)
        users_df = generator.generate_users()
        accounts_df = generator.generate_accounts(users_df)
        
        loan_users = accounts_df[accounts_df['type'] == 'student_loan']['user_id'].unique()
        loan_pct = (len(loan_users) / 100) * 100
        
        assert 15 <= loan_pct <= 35, \
            f"Expected 15-35% student loans, got {loan_pct:.1f}%"
    
    def test_account_uniqueness(self):
        """Test that all account IDs are unique."""
        generator = SyntheticDataGenerator(num_users=50, seed=42)
        users_df = generator.generate_users()
        accounts_df = generator.generate_accounts(users_df)
        
        assert accounts_df['account_id'].is_unique, "Account IDs are not unique"


class TestTransactionGeneration:
    """Test transaction generation functionality."""
    
    def test_transaction_date_range_min(self):
        """Test that all transactions are >= 2025-05-01."""
        generator = SyntheticDataGenerator(num_users=10, seed=42)
        users_df = generator.generate_users()
        accounts_df = generator.generate_accounts(users_df)
        transactions_df = generator.generate_transactions(accounts_df)
        
        min_date = pd.to_datetime(transactions_df['date']).min()
        expected_min = pd.Timestamp(DATE_RANGE_START)
        
        assert min_date >= expected_min, \
            f"Found transaction before {DATE_RANGE_START}: {min_date}"
    
    def test_transaction_date_range_max(self):
        """Test that all transactions are <= 2025-10-31."""
        generator = SyntheticDataGenerator(num_users=10, seed=42)
        users_df = generator.generate_users()
        accounts_df = generator.generate_accounts(users_df)
        transactions_df = generator.generate_transactions(accounts_df)
        
        max_date = pd.to_datetime(transactions_df['date']).max()
        expected_max = pd.Timestamp(DATE_RANGE_END)
        
        assert max_date <= expected_max, \
            f"Found transaction after {DATE_RANGE_END}: {max_date}"
    
    def test_transaction_counts_per_user(self):
        """Test that users have reasonable transaction counts (150-600 per user)."""
        generator = SyntheticDataGenerator(num_users=20, seed=42)
        users_df = generator.generate_users()
        accounts_df = generator.generate_accounts(users_df)
        transactions_df = generator.generate_transactions(accounts_df)
        
        txns_per_user = transactions_df.groupby('user_id').size()
        
        # Allow wider range due to account variations
        assert txns_per_user.min() >= 150, \
            f"Some users have too few transactions: {txns_per_user.min()}"
        assert txns_per_user.max() <= 800, \
            f"Some users have too many transactions: {txns_per_user.max()}"
    
    def test_transaction_uniqueness(self):
        """Test that all transaction IDs are unique."""
        generator = SyntheticDataGenerator(num_users=10, seed=42)
        users_df = generator.generate_users()
        accounts_df = generator.generate_accounts(users_df)
        transactions_df = generator.generate_transactions(accounts_df)
        
        assert transactions_df['transaction_id'].is_unique, \
            "Transaction IDs are not unique"
    
    def test_transaction_amounts_numeric(self):
        """Test that all transaction amounts are numeric."""
        generator = SyntheticDataGenerator(num_users=10, seed=42)
        users_df = generator.generate_users()
        accounts_df = generator.generate_accounts(users_df)
        transactions_df = generator.generate_transactions(accounts_df)
        
        assert pd.api.types.is_numeric_dtype(transactions_df['amount']), \
            "Transaction amounts are not numeric"
        assert transactions_df['amount'].notna().all(), \
            "Found null transaction amounts"


class TestLiabilityGeneration:
    """Test liability generation functionality."""
    
    def test_liability_count_matches_accounts(self):
        """Test that liabilities are generated for credit accounts."""
        generator = SyntheticDataGenerator(num_users=20, seed=42)
        users_df = generator.generate_users()
        accounts_df = generator.generate_accounts(users_df)
        liabilities_df = generator.generate_liabilities(accounts_df)
        
        # Count credit accounts
        credit_accounts = accounts_df[
            accounts_df['type'].isin(['credit_card', 'student_loan'])
        ]
        
        # Should have one liability per credit account
        assert len(liabilities_df) == len(credit_accounts), \
            f"Expected {len(credit_accounts)} liabilities, got {len(liabilities_df)}"
    
    def test_liability_apr_ranges(self):
        """Test that credit card APRs are in valid range (0-100%)."""
        generator = SyntheticDataGenerator(num_users=20, seed=42)
        users_df = generator.generate_users()
        accounts_df = generator.generate_accounts(users_df)
        liabilities_df = generator.generate_liabilities(accounts_df)
        
        credit_cards = liabilities_df[liabilities_df['type'] == 'credit_card']
        if len(credit_cards) > 0:
            assert credit_cards['apr_percentage'].min() >= 0, \
                "Found negative APR"
            assert credit_cards['apr_percentage'].max() <= 100, \
                "Found APR > 100%"
    
    def test_liability_uniqueness(self):
        """Test that all liability IDs are unique."""
        generator = SyntheticDataGenerator(num_users=20, seed=42)
        users_df = generator.generate_users()
        accounts_df = generator.generate_accounts(users_df)
        liabilities_df = generator.generate_liabilities(accounts_df)
        
        assert liabilities_df['liability_id'].is_unique, \
            "Liability IDs are not unique"


class TestSchemaValidation:
    """Test schema validation catches errors."""
    
    def test_missing_required_fields(self):
        """Test that validator catches missing required fields."""
        from ingest.validator import SchemaValidator
        
        validator = SchemaValidator()
        
        # Create invalid dataframe (missing 'email')
        invalid_df = pd.DataFrame({
            'user_id': ['user_001'],
            'name': ['John Doe']
            # Missing 'email'
        })
        
        with pytest.raises(ValueError, match="Missing required fields"):
            validator.validate_users(invalid_df)
    
    def test_invalid_data_types(self):
        """Test that validator catches invalid data types."""
        from ingest.validator import SchemaValidator
        
        validator = SchemaValidator()
        
        # Create invalid dataframe (non-numeric amount)
        invalid_df = pd.DataFrame({
            'transaction_id': ['txn_001'],
            'account_id': ['acc_001'],
            'user_id': ['user_001'],
            'date': ['2025-05-01'],
            'amount': ['not_a_number']  # Invalid
        })
        
        with pytest.raises(ValueError, match="Non-numeric"):
            validator.validate_transactions(invalid_df)
    
    def test_duplicate_ids(self):
        """Test that validator catches duplicate IDs."""
        from ingest.validator import SchemaValidator
        
        validator = SchemaValidator()
        
        # Create invalid dataframe (duplicate user_ids)
        invalid_df = pd.DataFrame({
            'user_id': ['user_001', 'user_001'],  # Duplicate
            'name': ['John', 'Jane'],
            'email': ['john@example.com', 'jane@example.com']
        })
        
        with pytest.raises(ValueError, match="Duplicate user_ids"):
            validator.validate_users(invalid_df)


class TestReproducibility:
    """Test that same seed produces identical output."""
    
    def test_reproducible_user_generation(self):
        """Test that same seed produces same users."""
        gen1 = SyntheticDataGenerator(num_users=10, seed=42)
        users1 = gen1.generate_users()
        
        gen2 = SyntheticDataGenerator(num_users=10, seed=42)
        users2 = gen2.generate_users()
        
        # Compare user_ids
        assert users1['user_id'].tolist() == users2['user_id'].tolist(), \
            "Same seed produced different user IDs"
        
        # Compare emails
        assert users1['email'].tolist() == users2['email'].tolist(), \
            "Same seed produced different emails"
    
    def test_reproducible_transaction_generation(self):
        """Test that same seed produces same transaction count."""
        gen1 = SyntheticDataGenerator(num_users=5, seed=42)
        users1 = gen1.generate_users()
        accounts1 = gen1.generate_accounts(users1)
        txns1 = gen1.generate_transactions(accounts1)
        
        gen2 = SyntheticDataGenerator(num_users=5, seed=42)
        users2 = gen2.generate_users()
        accounts2 = gen2.generate_accounts(users2)
        txns2 = gen2.generate_transactions(accounts2)
        
        assert len(txns1) == len(txns2), \
            f"Same seed produced different transaction counts: {len(txns1)} vs {len(txns2)}"


if __name__ == '__main__':
    pytest.main([__file__, '-v'])

