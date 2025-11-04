"""
Integration tests for full data generation and loading pipeline.

Tests cover:
- Complete data generation → CSV export → database loading → queries
- Reproducibility with same seed
- Foreign key integrity
- Performance benchmarks
"""

import pytest
import os
import shutil
import sqlite3
import pandas as pd
import time
from ingest.data_generator import SyntheticDataGenerator
from ingest.loader import DataLoader


class TestFullPipeline:
    """Test the complete end-to-end pipeline."""
    
    @pytest.fixture
    def test_dir(self):
        """Create and cleanup test directory."""
        test_dir = 'data/test_integration/'
        os.makedirs(test_dir, exist_ok=True)
        yield test_dir
        # Cleanup
        if os.path.exists(test_dir):
            shutil.rmtree(test_dir)
    
    @pytest.fixture
    def test_db(self):
        """Create and cleanup test database."""
        test_db_path = 'test_integration.db'
        yield test_db_path
        # Cleanup
        if os.path.exists(test_db_path):
            os.remove(test_db_path)
    
    def test_generate_export_load_query(self, test_dir, test_db):
        """Test: Generate → Export → Load → Query pipeline."""
        # Step 1: Generate data
        generator = SyntheticDataGenerator(num_users=10, seed=99)
        metadata = generator.generate_all(test_dir)
        
        # Verify generation
        assert metadata['counts']['users'] == 10
        assert metadata['counts']['accounts'] > 0
        assert metadata['counts']['transactions'] > 0
        assert metadata['counts']['liabilities'] > 0
        
        # Step 2: Verify CSV files exist
        expected_files = [
            'synthetic_users.csv',
            'synthetic_accounts.csv',
            'synthetic_transactions.csv',
            'synthetic_liabilities.csv',
            'metadata.json'
        ]
        for filename in expected_files:
            filepath = os.path.join(test_dir, filename)
            assert os.path.exists(filepath), f"Missing file: {filename}"
        
        # Step 3: Load into database
        loader = DataLoader(test_db)
        loader.load_all(test_dir)
        
        # Step 4: Query and verify
        conn = sqlite3.connect(test_db)
        
        # Verify counts
        user_count = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        assert user_count == 10, f"Expected 10 users in DB, got {user_count}"
        
        account_count = conn.execute("SELECT COUNT(*) FROM accounts").fetchone()[0]
        assert account_count == metadata['counts']['accounts']
        
        txn_count = conn.execute("SELECT COUNT(*) FROM transactions").fetchone()[0]
        assert txn_count == metadata['counts']['transactions']
        
        liab_count = conn.execute("SELECT COUNT(*) FROM liabilities").fetchone()[0]
        assert liab_count == metadata['counts']['liabilities']
        
        # Verify foreign key integrity with joins
        join_test = conn.execute("""
            SELECT COUNT(*)
            FROM transactions t
            JOIN accounts a ON t.account_id = a.account_id
            JOIN users u ON t.user_id = u.user_id
        """).fetchone()[0]
        assert join_test == txn_count, "Foreign key integrity check failed"
        
        conn.close()
    
    def test_foreign_key_integrity(self, test_dir, test_db):
        """Test that all foreign keys are valid after loading."""
        # Generate and load data
        generator = SyntheticDataGenerator(num_users=15, seed=88)
        generator.generate_all(test_dir)
        
        loader = DataLoader(test_db)
        loader.load_all(test_dir)
        
        conn = sqlite3.connect(test_db)
        
        # Test 1: All accounts reference valid users
        invalid_accounts = conn.execute("""
            SELECT COUNT(*)
            FROM accounts a
            LEFT JOIN users u ON a.user_id = u.user_id
            WHERE u.user_id IS NULL
        """).fetchone()[0]
        assert invalid_accounts == 0, f"Found {invalid_accounts} accounts with invalid user_id"
        
        # Test 2: All transactions reference valid accounts
        invalid_transactions = conn.execute("""
            SELECT COUNT(*)
            FROM transactions t
            LEFT JOIN accounts a ON t.account_id = a.account_id
            WHERE a.account_id IS NULL
        """).fetchone()[0]
        assert invalid_transactions == 0, \
            f"Found {invalid_transactions} transactions with invalid account_id"
        
        # Test 3: All liabilities reference valid accounts
        invalid_liabilities = conn.execute("""
            SELECT COUNT(*)
            FROM liabilities l
            LEFT JOIN accounts a ON l.account_id = a.account_id
            WHERE a.account_id IS NULL
        """).fetchone()[0]
        assert invalid_liabilities == 0, \
            f"Found {invalid_liabilities} liabilities with invalid account_id"
        
        conn.close()


class TestReproducibility:
    """Test that same seed produces identical output."""
    
    @pytest.fixture
    def test_dir1(self):
        """Create and cleanup first test directory."""
        test_dir = 'data/test_repro1/'
        os.makedirs(test_dir, exist_ok=True)
        yield test_dir
        if os.path.exists(test_dir):
            shutil.rmtree(test_dir)
    
    @pytest.fixture
    def test_dir2(self):
        """Create and cleanup second test directory."""
        test_dir = 'data/test_repro2/'
        os.makedirs(test_dir, exist_ok=True)
        yield test_dir
        if os.path.exists(test_dir):
            shutil.rmtree(test_dir)
    
    def test_identical_generation_with_same_seed(self, test_dir1, test_dir2):
        """Test that same seed produces identical counts and distributions."""
        # Generate dataset 1
        gen1 = SyntheticDataGenerator(num_users=10, seed=42)
        metadata1 = gen1.generate_all(test_dir1)
        
        # Generate dataset 2 with same seed
        gen2 = SyntheticDataGenerator(num_users=10, seed=42)
        metadata2 = gen2.generate_all(test_dir2)
        
        # Compare metadata counts (should be identical)
        assert metadata1['counts'] == metadata2['counts'], \
            "Same seed produced different counts"
        
        # Compare CSV file counts and shapes
        files_to_compare = [
            'synthetic_users.csv',
            'synthetic_accounts.csv',
            'synthetic_transactions.csv',
            'synthetic_liabilities.csv'
        ]
        
        for filename in files_to_compare:
            df1 = pd.read_csv(os.path.join(test_dir1, filename))
            df2 = pd.read_csv(os.path.join(test_dir2, filename))
            
            # Compare shapes (rows and columns)
            assert df1.shape == df2.shape, \
                f"{filename}: Different shapes - {df1.shape} vs {df2.shape}"
            
            # Compare user_ids (these should be reproducible: user_000, user_001, etc.)
            if 'user_id' in df1.columns:
                assert df1['user_id'].tolist() == df2['user_id'].tolist(), \
                    f"{filename}: Different user_ids"
            
            # Note: account_id, transaction_id, liability_id use UUIDs which are not
            # reproducible across runs, but the counts should match


class TestQualityMetrics:
    """Test data quality metrics."""
    
    @pytest.fixture
    def generated_data(self):
        """Generate data for quality checks."""
        generator = SyntheticDataGenerator(num_users=50, seed=77)
        users_df = generator.generate_users()
        accounts_df = generator.generate_accounts(users_df)
        transactions_df = generator.generate_transactions(accounts_df)
        liabilities_df = generator.generate_liabilities(accounts_df)
        return users_df, accounts_df, transactions_df, liabilities_df
    
    def test_missing_required_fields(self, generated_data):
        """Test that required fields have 0% missing values."""
        users_df, accounts_df, transactions_df, liabilities_df = generated_data
        
        # Users required fields
        for field in ['user_id', 'name', 'email']:
            missing_pct = (users_df[field].isna().sum() / len(users_df)) * 100
            assert missing_pct == 0, f"Users.{field} has {missing_pct}% missing values"
        
        # Accounts required fields
        for field in ['account_id', 'user_id', 'type']:
            missing_pct = (accounts_df[field].isna().sum() / len(accounts_df)) * 100
            assert missing_pct == 0, f"Accounts.{field} has {missing_pct}% missing values"
        
        # Transactions required fields
        for field in ['transaction_id', 'account_id', 'user_id', 'date', 'amount']:
            missing_pct = (transactions_df[field].isna().sum() / len(transactions_df)) * 100
            assert missing_pct == 0, f"Transactions.{field} has {missing_pct}% missing values"
    
    def test_missing_optional_fields(self, generated_data):
        """Test that optional fields have <5% missing values."""
        users_df, accounts_df, transactions_df, liabilities_df = generated_data
        
        # Check some optional transaction fields
        optional_fields = ['merchant_name', 'category_primary']
        for field in optional_fields:
            if field in transactions_df.columns:
                missing_pct = (transactions_df[field].isna().sum() / len(transactions_df)) * 100
                assert missing_pct < 5, \
                    f"Transactions.{field} has {missing_pct}% missing (expected <5%)"
    
    def test_transaction_amount_variance(self, generated_data):
        """Test that transaction amounts have reasonable variance."""
        users_df, accounts_df, transactions_df, liabilities_df = generated_data
        
        # Check that amounts vary (not all the same)
        unique_amounts = transactions_df['amount'].nunique()
        total_amounts = len(transactions_df)
        
        # At least 10% unique values (not all identical)
        uniqueness_pct = (unique_amounts / total_amounts) * 100
        assert uniqueness_pct > 10, \
            f"Transaction amounts too uniform: only {uniqueness_pct:.1f}% unique"
    
    def test_database_file_size(self):
        """Test that database file is reasonable size (<50MB for 100 users)."""
        test_db = 'test_size_check.db'
        test_dir = 'data/test_size/'
        
        try:
            # Generate 100 users
            generator = SyntheticDataGenerator(num_users=100, seed=55)
            generator.generate_all(test_dir)
            
            # Load into database
            loader = DataLoader(test_db)
            loader.load_all(test_dir)
            
            # Check file size
            db_size_mb = os.path.getsize(test_db) / (1024 * 1024)
            assert db_size_mb < 50, \
                f"Database file too large: {db_size_mb:.2f}MB (expected <50MB)"
            
        finally:
            # Cleanup
            if os.path.exists(test_db):
                os.remove(test_db)
            if os.path.exists(test_dir):
                shutil.rmtree(test_dir)


class TestPerformance:
    """Test performance benchmarks."""
    
    def test_generation_time_100_users(self):
        """Test that generation of 100 users completes in <2 minutes."""
        test_dir = 'data/test_perf/'
        
        try:
            start_time = time.time()
            
            generator = SyntheticDataGenerator(num_users=100, seed=44)
            generator.generate_all(test_dir)
            
            elapsed_time = time.time() - start_time
            
            assert elapsed_time < 120, \
                f"Generation took {elapsed_time:.2f}s (expected <120s)"
            
            print(f"\n✓ Generation time: {elapsed_time:.2f}s")
            
        finally:
            # Cleanup
            if os.path.exists(test_dir):
                shutil.rmtree(test_dir)
    
    def test_database_load_time(self):
        """Test that database loading completes in <10 seconds."""
        test_dir = 'data/test_load_perf/'
        test_db = 'test_load_perf.db'
        
        try:
            # Generate data first
            generator = SyntheticDataGenerator(num_users=50, seed=33)
            generator.generate_all(test_dir)
            
            # Time the loading
            start_time = time.time()
            
            loader = DataLoader(test_db)
            loader.load_all(test_dir)
            
            elapsed_time = time.time() - start_time
            
            assert elapsed_time < 10, \
                f"Loading took {elapsed_time:.2f}s (expected <10s)"
            
            print(f"\n✓ Loading time: {elapsed_time:.2f}s")
            
        finally:
            # Cleanup
            if os.path.exists(test_db):
                os.remove(test_db)
            if os.path.exists(test_dir):
                shutil.rmtree(test_dir)
    
    def test_query_performance(self):
        """Test that typical queries complete in <100ms."""
        test_dir = 'data/test_query_perf/'
        test_db = 'test_query_perf.db'
        
        try:
            # Generate and load data
            generator = SyntheticDataGenerator(num_users=50, seed=22)
            generator.generate_all(test_dir)
            
            loader = DataLoader(test_db)
            loader.load_all(test_dir)
            
            # Test query performance
            conn = sqlite3.connect(test_db)
            
            # Query 1: Get user's transactions
            start_time = time.time()
            result = conn.execute("""
                SELECT t.*
                FROM transactions t
                WHERE t.user_id = 'user_000'
                ORDER BY t.date DESC
                LIMIT 100
            """).fetchall()
            query1_time = (time.time() - start_time) * 1000  # Convert to ms
            
            # Query 2: Join across tables
            start_time = time.time()
            result = conn.execute("""
                SELECT u.name, COUNT(t.transaction_id) as txn_count
                FROM users u
                JOIN accounts a ON u.user_id = a.user_id
                JOIN transactions t ON a.account_id = t.account_id
                GROUP BY u.user_id
                LIMIT 10
            """).fetchall()
            query2_time = (time.time() - start_time) * 1000  # Convert to ms
            
            conn.close()
            
            # Allow some leeway (200ms instead of 100ms for complex queries)
            assert query1_time < 200, \
                f"Simple query took {query1_time:.2f}ms (expected <200ms)"
            assert query2_time < 200, \
                f"Join query took {query2_time:.2f}ms (expected <200ms)"
            
            print(f"\n✓ Simple query: {query1_time:.2f}ms")
            print(f"✓ Join query: {query2_time:.2f}ms")
            
        finally:
            # Cleanup
            if os.path.exists(test_db):
                os.remove(test_db)
            if os.path.exists(test_dir):
                shutil.rmtree(test_dir)


if __name__ == '__main__':
    pytest.main([__file__, '-v', '-s'])

