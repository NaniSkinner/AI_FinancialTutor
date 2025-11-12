"""
Test script for Phase 3: Account Generation

Tests the account generation functionality including:
- Account distribution (checking, savings, credit cards, loans)
- Balance calculations
- Account metadata
"""

import sys
sys.path.insert(0, '.')

from ingest.data_generator import SyntheticDataGenerator
import json

def test_account_generation():
    """Test account generation for 10 users."""
    
    print("="*70)
    print("PHASE 3 TEST: ACCOUNT GENERATION")
    print("="*70)
    
    # Generate test data
    generator = SyntheticDataGenerator(num_users=10, seed=42)
    
    # Generate users first
    users_df = generator.generate_users()
    
    # Generate accounts
    accounts_df = generator.generate_accounts(users_df)
    
    print("\n" + "="*70)
    print("VALIDATION CHECKS")
    print("="*70 + "\n")
    
    # Test 1: Every user has at least 1 checking account
    print("Test 1: Every user has checking account")
    checking_accounts = accounts_df[accounts_df['type'] == 'checking']
    users_with_checking = checking_accounts['user_id'].unique()
    all_users = users_df['user_id'].unique()
    
    if len(users_with_checking) == len(all_users):
        print(f"  ✓ PASS: All {len(all_users)} users have checking accounts")
    else:
        print(f"  ✗ FAIL: {len(users_with_checking)}/{len(all_users)} users have checking")
    
    # Test 2: Savings account distribution (~70%)
    print("\nTest 2: Savings account distribution")
    savings_accounts = accounts_df[accounts_df['type'] == 'savings']
    savings_pct = (len(savings_accounts) / len(all_users)) * 100
    
    if 60 <= savings_pct <= 80:
        print(f"  ✓ PASS: {savings_pct:.1f}% of users have savings (target: 70%)")
    else:
        print(f"  ⚠ WARNING: {savings_pct:.1f}% of users have savings (target: 70%)")
    
    # Test 3: Credit card distribution
    print("\nTest 3: Credit card distribution by income")
    credit_cards = accounts_df[accounts_df['type'] == 'credit_card']
    
    for _, user in users_df.iterrows():
        user_id = user['user_id']
        metadata = json.loads(user['metadata'])
        income = metadata['income']
        
        user_cards = credit_cards[credit_cards['user_id'] == user_id]
        num_cards = len(user_cards)
        
        print(f"  User {user_id}: income=${income:,} → {num_cards} cards")
    
    print(f"\n  Total credit cards: {len(credit_cards)}")
    print(f"  Avg cards per user: {len(credit_cards) / len(all_users):.2f}")
    
    # Test 4: Student loan distribution (~25%, higher for young users)
    print("\nTest 4: Student loan distribution")
    student_loans = accounts_df[accounts_df['type'] == 'student_loan']
    
    young_users = []
    older_users = []
    
    for _, user in users_df.iterrows():
        metadata = json.loads(user['metadata'])
        age = metadata['age']
        user_id = user['user_id']
        
        has_loan = user_id in student_loans['user_id'].values
        
        if age <= 35:
            young_users.append(has_loan)
        else:
            older_users.append(has_loan)
    
    young_loan_pct = (sum(young_users) / len(young_users) * 100) if young_users else 0
    older_loan_pct = (sum(older_users) / len(older_users) * 100) if older_users else 0
    
    print(f"  Young users (≤35): {sum(young_users)}/{len(young_users)} have loans ({young_loan_pct:.1f}%)")
    print(f"  Older users (>35): {sum(older_users)}/{len(older_users)} have loans ({older_loan_pct:.1f}%)")
    print(f"  Total: {len(student_loans)}/{len(all_users)} users have student loans")
    
    # Test 5: All foreign keys valid
    print("\nTest 5: Foreign key validation")
    valid_user_ids = set(users_df['user_id'])
    account_user_ids = set(accounts_df['user_id'])
    
    if account_user_ids.issubset(valid_user_ids):
        print(f"  ✓ PASS: All account user_ids are valid")
    else:
        invalid = account_user_ids - valid_user_ids
        print(f"  ✗ FAIL: Invalid user_ids found: {invalid}")
    
    # Test 6: Account ID uniqueness
    print("\nTest 6: Account ID uniqueness")
    if accounts_df['account_id'].is_unique:
        print(f"  ✓ PASS: All {len(accounts_df)} account_ids are unique")
    else:
        print(f"  ✗ FAIL: Duplicate account_ids found")
    
    # Test 7: Balance and credit limit validation
    print("\nTest 7: Balance and credit limit validation")
    
    # Checking/Savings should have positive balances
    checking_savings = accounts_df[accounts_df['type'].isin(['checking', 'savings'])]
    all_positive = (checking_savings['current_balance'] > 0).all()
    
    if all_positive:
        print(f"  ✓ PASS: All checking/savings have positive balances")
    else:
        print(f"  ✗ FAIL: Some checking/savings have non-positive balances")
    
    # Credit cards should have valid utilization
    if len(credit_cards) > 0:
        for _, card in credit_cards.iterrows():
            utilization = card['current_balance'] / card['credit_limit']
            if utilization < 0 or utilization > 1:
                print(f"  ✗ FAIL: Invalid utilization for {card['account_id']}: {utilization:.2%}")
                break
        else:
            print(f"  ✓ PASS: All credit cards have valid utilization (0-100%)")
    
    # Test 8: Account metadata completeness
    print("\nTest 8: Account metadata completeness")
    required_fields = ['account_id', 'user_id', 'type', 'name', 'mask', 
                       'current_balance', 'iso_currency_code']
    
    missing = []
    for field in required_fields:
        if field not in accounts_df.columns:
            missing.append(field)
        elif accounts_df[field].isna().any():
            null_count = accounts_df[field].isna().sum()
            print(f"  ⚠ WARNING: {null_count} null values in '{field}'")
    
    if not missing:
        print(f"  ✓ PASS: All required fields present")
    else:
        print(f"  ✗ FAIL: Missing required fields: {missing}")
    
    # Test 9: Realistic balance ranges
    print("\nTest 9: Realistic balance ranges")
    
    # Checking accounts
    checking_min = checking_accounts['current_balance'].min()
    checking_max = checking_accounts['current_balance'].max()
    checking_avg = checking_accounts['current_balance'].mean()
    
    print(f"  Checking balances: ${checking_min:,.2f} - ${checking_max:,.2f} (avg: ${checking_avg:,.2f})")
    
    # Savings accounts
    if len(savings_accounts) > 0:
        savings_min = savings_accounts['current_balance'].min()
        savings_max = savings_accounts['current_balance'].max()
        savings_avg = savings_accounts['current_balance'].mean()
        
        print(f"  Savings balances: ${savings_min:,.2f} - ${savings_max:,.2f} (avg: ${savings_avg:,.2f})")
    
    # Credit cards
    if len(credit_cards) > 0:
        cc_limit_min = credit_cards['credit_limit'].min()
        cc_limit_max = credit_cards['credit_limit'].max()
        cc_limit_avg = credit_cards['credit_limit'].mean()
        
        print(f"  Credit limits: ${cc_limit_min:,.2f} - ${cc_limit_max:,.2f} (avg: ${cc_limit_avg:,.2f})")
    
    # Student loans
    if len(student_loans) > 0:
        loan_min = student_loans['current_balance'].min()
        loan_max = student_loans['current_balance'].max()
        loan_avg = student_loans['current_balance'].mean()
        
        print(f"  Student loans: ${loan_min:,.2f} - ${loan_max:,.2f} (avg: ${loan_avg:,.2f})")
    
    # Summary
    print("\n" + "="*70)
    print("TEST SUMMARY")
    print("="*70)
    print(f"Total users: {len(users_df)}")
    print(f"Total accounts: {len(accounts_df)}")
    print(f"Accounts per user (avg): {len(accounts_df) / len(users_df):.2f}")
    print(f"\nAccount breakdown:")
    print(f"  Checking: {len(checking_accounts)}")
    print(f"  Savings: {len(savings_accounts)}")
    print(f"  Credit cards: {len(credit_cards)}")
    print(f"  Student loans: {len(student_loans)}")
    print("="*70)

if __name__ == '__main__':
    test_account_generation()

