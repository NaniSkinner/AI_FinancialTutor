"""
Test script for Phase 4: Transaction Generation

Tests the transaction generation functionality including:
- Payroll deposits
- Regular expenses (rent, utilities, subscriptions)
- Random spending (groceries, restaurants, coffee)
- Credit card transactions
- Savings transactions
"""

import sys
sys.path.insert(0, '.')

from ingest.data_generator import SyntheticDataGenerator
from ingest.config import DATE_RANGE_START, DATE_RANGE_END
from datetime import datetime
import json

def test_transaction_generation():
    """Test transaction generation for 5 users."""
    
    print("="*70)
    print("PHASE 4 TEST: TRANSACTION GENERATION")
    print("="*70)
    
    # Generate test data
    generator = SyntheticDataGenerator(num_users=5, seed=42)
    
    # Generate users and accounts first
    users_df = generator.generate_users()
    accounts_df = generator.generate_accounts(users_df)
    
    # Generate transactions
    transactions_df = generator.generate_transactions(accounts_df)
    
    print("\n" + "="*70)
    print("VALIDATION CHECKS")
    print("="*70 + "\n")
    
    # Test 1: Transaction date range
    print("Test 1: Transaction date range")
    start_date = datetime.strptime(DATE_RANGE_START, "%Y-%m-%d").date()
    end_date = datetime.strptime(DATE_RANGE_END, "%Y-%m-%d").date()
    
    transactions_df['date_obj'] = transactions_df['date'].apply(
        lambda x: datetime.strptime(x, "%Y-%m-%d").date()
    )
    
    min_date = transactions_df['date_obj'].min()
    max_date = transactions_df['date_obj'].max()
    
    if min_date >= start_date and max_date <= end_date:
        print(f"  ✓ PASS: All transactions within range ({min_date} to {max_date})")
    else:
        print(f"  ✗ FAIL: Transactions outside range ({min_date} to {max_date})")
    
    # Test 2: Transaction count per user
    print("\nTest 2: Transaction count per user (target: 150-200)")
    
    for user_id in users_df['user_id']:
        user_txns = transactions_df[transactions_df['user_id'] == user_id]
        count = len(user_txns)
        
        if 100 <= count <= 250:
            status = "✓"
        else:
            status = "⚠"
        
        print(f"  {status} User {user_id}: {count} transactions")
    
    avg_txns = len(transactions_df) / len(users_df)
    print(f"\n  Average: {avg_txns:.1f} transactions per user")
    
    # Test 3: Payroll deposits present
    print("\nTest 3: Payroll deposits")
    payroll_txns = transactions_df[
        (transactions_df['category_primary'] == 'INCOME') &
        (transactions_df['category_detailed'] == 'PAYROLL')
    ]
    
    print(f"  Total payroll deposits: {len(payroll_txns)}")
    
    for user_id in users_df['user_id']:
        user_payroll = payroll_txns[payroll_txns['user_id'] == user_id]
        print(f"    User {user_id}: {len(user_payroll)} paychecks")
    
    # Expected: 6 months = ~12-13 biweekly or 6 monthly
    if len(payroll_txns) >= 30:  # 5 users * 6 months
        print(f"  ✓ PASS: Adequate payroll deposits")
    else:
        print(f"  ⚠ WARNING: Fewer payroll deposits than expected")
    
    # Test 4: Recurring transactions (subscriptions)
    print("\nTest 4: Recurring subscriptions")
    subscription_txns = transactions_df[
        transactions_df['category_detailed'] == 'SUBSCRIPTION'
    ]
    
    if len(subscription_txns) > 0:
        print(f"  Total subscription transactions: {len(subscription_txns)}")
        
        # Check for recurring patterns (same merchant, monthly)
        for merchant in subscription_txns['merchant_name'].unique():
            merchant_txns = subscription_txns[subscription_txns['merchant_name'] == merchant]
            print(f"    {merchant}: {len(merchant_txns)} transactions")
        
        print(f"  ✓ PASS: Subscriptions detected")
    else:
        print(f"  ⚠ INFO: No subscriptions (40% chance per user)")
    
    # Test 5: Transaction ID uniqueness
    print("\nTest 5: Transaction ID uniqueness")
    if transactions_df['transaction_id'].is_unique:
        print(f"  ✓ PASS: All {len(transactions_df)} transaction_ids are unique")
    else:
        duplicates = transactions_df['transaction_id'].duplicated().sum()
        print(f"  ✗ FAIL: {duplicates} duplicate transaction_ids found")
    
    # Test 6: Foreign key validation
    print("\nTest 6: Foreign key validation")
    valid_account_ids = set(accounts_df['account_id'])
    txn_account_ids = set(transactions_df['account_id'])
    
    if txn_account_ids.issubset(valid_account_ids):
        print(f"  ✓ PASS: All transaction account_ids are valid")
    else:
        invalid = txn_account_ids - valid_account_ids
        print(f"  ✗ FAIL: Invalid account_ids found: {invalid}")
    
    # Test 7: Amount sign convention (negative = debit, positive = credit)
    print("\nTest 7: Amount sign convention")
    
    # Check payroll is positive
    payroll_amounts = payroll_txns['amount']
    if (payroll_amounts > 0).all():
        print(f"  ✓ PASS: All payroll deposits are positive")
    else:
        print(f"  ✗ FAIL: Some payroll deposits are negative")
    
    # Check expenses are negative
    expense_categories = ['FOOD_AND_DRINK', 'SHOPPING', 'RENT_AND_UTILITIES', 'TRANSPORTATION']
    expense_txns = transactions_df[transactions_df['category_primary'].isin(expense_categories)]
    
    if (expense_txns['amount'] < 0).all():
        print(f"  ✓ PASS: All expenses are negative")
    else:
        positive_expenses = (expense_txns['amount'] > 0).sum()
        print(f"  ⚠ WARNING: {positive_expenses} expenses are positive")
    
    # Test 8: Category distribution
    print("\nTest 8: Category distribution")
    
    top_categories = transactions_df['category_primary'].value_counts().head(10)
    print("\n  Top 10 categories:")
    for category, count in top_categories.items():
        pct = (count / len(transactions_df)) * 100
        print(f"    {category}: {count} ({pct:.1f}%)")
    
    # Test 9: Checking account transactions
    print("\nTest 9: Checking account transaction types")
    
    checking_accounts = accounts_df[accounts_df['type'] == 'checking']
    if len(checking_accounts) > 0:
        first_checking = checking_accounts.iloc[0]['account_id']
        checking_txns = transactions_df[transactions_df['account_id'] == first_checking]
        
        print(f"  Sample checking account: {first_checking}")
        print(f"  Total transactions: {len(checking_txns)}")
        
        categories = checking_txns['category_detailed'].value_counts()
        print(f"  Transaction types:")
        for cat, count in categories.head(5).items():
            print(f"    - {cat}: {count}")
    
    # Test 10: Credit card transactions
    print("\nTest 10: Credit card transactions")
    
    credit_cards = accounts_df[accounts_df['type'] == 'credit_card']
    if len(credit_cards) > 0:
        total_cc_txns = 0
        
        for _, card in credit_cards.iterrows():
            card_txns = transactions_df[transactions_df['account_id'] == card['account_id']]
            total_cc_txns += len(card_txns)
        
        print(f"  Total credit card transactions: {total_cc_txns}")
        print(f"  Avg per card: {total_cc_txns / len(credit_cards):.1f}")
        
        # Check for credit card payments
        payments = transactions_df[
            (transactions_df['account_id'].isin(credit_cards['account_id'])) &
            (transactions_df['amount'] > 0)
        ]
        print(f"  Credit card payments: {len(payments)}")
        
        if len(payments) > 0:
            print(f"  ✓ PASS: Credit card payments detected")
        else:
            print(f"  ⚠ WARNING: No credit card payments found")
    else:
        print(f"  ℹ INFO: No credit cards in test dataset")
    
    # Test 11: Savings account transactions
    print("\nTest 11: Savings account transactions")
    
    savings_accounts = accounts_df[accounts_df['type'] == 'savings']
    if len(savings_accounts) > 0:
        total_savings_txns = 0
        
        for _, savings in savings_accounts.iterrows():
            savings_txns = transactions_df[transactions_df['account_id'] == savings['account_id']]
            total_savings_txns += len(savings_txns)
        
        print(f"  Total savings transactions: {total_savings_txns}")
        print(f"  Avg per account: {total_savings_txns / len(savings_accounts):.1f}")
        
        # Check for transfers
        transfers = transactions_df[
            (transactions_df['account_id'].isin(savings_accounts['account_id'])) &
            (transactions_df['category_primary'] == 'TRANSFER')
        ]
        print(f"  Savings transfers: {len(transfers)}")
        
        if total_savings_txns > 0:
            print(f"  ✓ PASS: Savings transactions generated")
    else:
        print(f"  ℹ INFO: No savings accounts in test dataset")
    
    # Test 12: Realistic spending amounts
    print("\nTest 12: Realistic spending amounts")
    
    # Groceries
    groceries = transactions_df[transactions_df['category_detailed'] == 'GROCERIES']
    if len(groceries) > 0:
        avg_grocery = abs(groceries['amount'].mean())
        print(f"  Average grocery transaction: ${avg_grocery:.2f} (expected: $30-$150)")
    
    # Restaurants
    restaurants = transactions_df[transactions_df['category_detailed'] == 'RESTAURANTS']
    if len(restaurants) > 0:
        avg_restaurant = abs(restaurants['amount'].mean())
        print(f"  Average restaurant transaction: ${avg_restaurant:.2f} (expected: $12-$60)")
    
    # Coffee
    coffee = transactions_df[transactions_df['category_detailed'] == 'COFFEE_SHOPS']
    if len(coffee) > 0:
        avg_coffee = abs(coffee['amount'].mean())
        print(f"  Average coffee transaction: ${avg_coffee:.2f} (expected: $4-$8)")
    
    # Summary
    print("\n" + "="*70)
    print("TEST SUMMARY")
    print("="*70)
    print(f"Total users: {len(users_df)}")
    print(f"Total accounts: {len(accounts_df)}")
    print(f"Total transactions: {len(transactions_df):,}")
    print(f"Transactions per user: {len(transactions_df) / len(users_df):.1f}")
    print(f"\nDate range: {min_date} to {max_date}")
    print(f"Duration: {(max_date - min_date).days} days")
    print(f"\nTransaction breakdown:")
    print(f"  Income transactions: {len(transactions_df[transactions_df['amount'] > 0])}")
    print(f"  Expense transactions: {len(transactions_df[transactions_df['amount'] < 0])}")
    print(f"\nFinancial summary:")
    total_income = transactions_df[transactions_df['amount'] > 0]['amount'].sum()
    total_expenses = abs(transactions_df[transactions_df['amount'] < 0]['amount'].sum())
    print(f"  Total income: ${total_income:,.2f}")
    print(f"  Total expenses: ${total_expenses:,.2f}")
    print(f"  Net: ${total_income - total_expenses:,.2f}")
    print("="*70)

if __name__ == '__main__':
    test_transaction_generation()

