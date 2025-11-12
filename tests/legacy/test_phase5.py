"""
Test script for Phase 5: Liability Generation

Tests the liability generation functionality including:
- Credit card liability records (APR, minimum payments, dates)
- Student loan liability records (interest rates, payment schedules)
- Overdue status tracking
"""

import sys
sys.path.insert(0, '.')

from ingest.data_generator import SyntheticDataGenerator
import json

def test_liability_generation():
    """Test liability generation for 10 users."""
    
    print("="*70)
    print("PHASE 5 TEST: LIABILITY GENERATION")
    print("="*70)
    
    # Generate test data
    generator = SyntheticDataGenerator(num_users=10, seed=42)
    
    # Generate users, accounts, transactions, and liabilities
    users_df = generator.generate_users()
    accounts_df = generator.generate_accounts(users_df)
    transactions_df = generator.generate_transactions(accounts_df)
    liabilities_df = generator.generate_liabilities(accounts_df)
    
    print("\n" + "="*70)
    print("VALIDATION CHECKS")
    print("="*70 + "\n")
    
    # Test 1: All credit cards have liability records
    print("Test 1: All credit cards have liability records")
    credit_cards = accounts_df[accounts_df['type'] == 'credit_card']
    cc_liabilities = liabilities_df[liabilities_df['type'] == 'credit_card']
    
    if len(credit_cards) == len(cc_liabilities):
        print(f"  ✓ PASS: All {len(credit_cards)} credit cards have liabilities")
    else:
        print(f"  ✗ FAIL: {len(credit_cards)} cards but {len(cc_liabilities)} liabilities")
    
    # Test 2: All student loans have liability records
    print("\nTest 2: All student loans have liability records")
    student_loans = accounts_df[accounts_df['type'] == 'student_loan']
    loan_liabilities = liabilities_df[liabilities_df['type'] == 'student_loan']
    
    if len(student_loans) == len(loan_liabilities):
        print(f"  ✓ PASS: All {len(student_loans)} student loans have liabilities")
    else:
        print(f"  ✗ FAIL: {len(student_loans)} loans but {len(loan_liabilities)} liabilities")
    
    # Test 3: Credit card APR ranges
    print("\nTest 3: Credit card APR ranges (15.99% - 24.99%)")
    
    if len(cc_liabilities) > 0:
        min_apr = cc_liabilities['apr_percentage'].min()
        max_apr = cc_liabilities['apr_percentage'].max()
        avg_apr = cc_liabilities['apr_percentage'].mean()
        
        if 15.99 <= min_apr and max_apr <= 24.99:
            print(f"  ✓ PASS: APR range {min_apr:.2f}% - {max_apr:.2f}% (avg: {avg_apr:.2f}%)")
        else:
            print(f"  ✗ FAIL: APR outside expected range: {min_apr:.2f}% - {max_apr:.2f}%")
    else:
        print(f"  ℹ INFO: No credit cards in dataset")
    
    # Test 4: Student loan interest rates
    print("\nTest 4: Student loan interest rates (4.5% - 7.5%)")
    
    if len(loan_liabilities) > 0:
        min_rate = loan_liabilities['interest_rate'].min()
        max_rate = loan_liabilities['interest_rate'].max()
        avg_rate = loan_liabilities['interest_rate'].mean()
        
        if 4.5 <= min_rate and max_rate <= 7.5:
            print(f"  ✓ PASS: Rate range {min_rate:.2f}% - {max_rate:.2f}% (avg: {avg_rate:.2f}%)")
        else:
            print(f"  ✗ FAIL: Rate outside expected range: {min_rate:.2f}% - {max_rate:.2f}%")
    else:
        print(f"  ℹ INFO: No student loans in dataset")
    
    # Test 5: Liability ID uniqueness
    print("\nTest 5: Liability ID uniqueness")
    if liabilities_df['liability_id'].is_unique:
        print(f"  ✓ PASS: All {len(liabilities_df)} liability_ids are unique")
    else:
        duplicates = liabilities_df['liability_id'].duplicated().sum()
        print(f"  ✗ FAIL: {duplicates} duplicate liability_ids found")
    
    # Test 6: Foreign key validation
    print("\nTest 6: Foreign key validation")
    
    # Check account_ids
    valid_account_ids = set(accounts_df['account_id'])
    liab_account_ids = set(liabilities_df['account_id'])
    
    if liab_account_ids.issubset(valid_account_ids):
        print(f"  ✓ PASS: All liability account_ids are valid")
    else:
        invalid = liab_account_ids - valid_account_ids
        print(f"  ✗ FAIL: Invalid account_ids found: {invalid}")
    
    # Check user_ids
    valid_user_ids = set(users_df['user_id'])
    liab_user_ids = set(liabilities_df['user_id'])
    
    if liab_user_ids.issubset(valid_user_ids):
        print(f"  ✓ PASS: All liability user_ids are valid")
    else:
        invalid = liab_user_ids - valid_user_ids
        print(f"  ✗ FAIL: Invalid user_ids found: {invalid}")
    
    # Test 7: Minimum payment amounts
    print("\nTest 7: Minimum payment amounts")
    
    if len(cc_liabilities) > 0:
        # Credit cards: should be at least $25
        min_cc_payment = cc_liabilities['minimum_payment_amount'].min()
        avg_cc_payment = cc_liabilities['minimum_payment_amount'].mean()
        
        if min_cc_payment >= 25.0:
            print(f"  ✓ PASS: Credit card min payments >= $25 (min: ${min_cc_payment:.2f}, avg: ${avg_cc_payment:.2f})")
        else:
            print(f"  ✗ FAIL: Credit card min payment below $25: ${min_cc_payment:.2f}")
    
    if len(loan_liabilities) > 0:
        # Student loans: should be $150-$400
        min_loan_payment = loan_liabilities['minimum_payment_amount'].min()
        max_loan_payment = loan_liabilities['minimum_payment_amount'].max()
        avg_loan_payment = loan_liabilities['minimum_payment_amount'].mean()
        
        if 150 <= min_loan_payment and max_loan_payment <= 400:
            print(f"  ✓ PASS: Student loan payments $150-$400 (min: ${min_loan_payment:.2f}, max: ${max_loan_payment:.2f})")
        else:
            print(f"  ⚠ WARNING: Student loan payment outside range: ${min_loan_payment:.2f} - ${max_loan_payment:.2f}")
    
    # Test 8: Overdue status
    print("\nTest 8: Overdue status distribution")
    
    if len(cc_liabilities) > 0:
        cc_overdue = cc_liabilities['is_overdue'].sum()
        cc_overdue_pct = (cc_overdue / len(cc_liabilities)) * 100
        print(f"  Credit cards overdue: {cc_overdue}/{len(cc_liabilities)} ({cc_overdue_pct:.1f}%)")
        
        if cc_overdue_pct <= 10:
            print(f"  ✓ PASS: Overdue rate within expected range (~5%)")
        else:
            print(f"  ⚠ WARNING: Higher than expected overdue rate")
    
    if len(loan_liabilities) > 0:
        loan_overdue = loan_liabilities['is_overdue'].sum()
        loan_overdue_pct = (loan_overdue / len(loan_liabilities)) * 100
        print(f"  Student loans overdue: {loan_overdue}/{len(loan_liabilities)} ({loan_overdue_pct:.1f}%)")
        
        if loan_overdue_pct <= 5:
            print(f"  ✓ PASS: Overdue rate within expected range (~0.5%)")
        else:
            print(f"  ⚠ WARNING: Higher than expected overdue rate")
    
    # Test 9: Required fields present
    print("\nTest 9: Required fields completeness")
    
    required_fields = [
        'liability_id', 'account_id', 'user_id', 'type',
        'minimum_payment_amount', 'last_payment_amount',
        'last_payment_date', 'next_payment_due_date',
        'last_statement_balance', 'is_overdue'
    ]
    
    missing = []
    for field in required_fields:
        if field not in liabilities_df.columns:
            missing.append(field)
        elif liabilities_df[field].isna().any():
            null_count = liabilities_df[field].isna().sum()
            print(f"  ⚠ WARNING: {null_count} null values in '{field}'")
    
    if not missing:
        print(f"  ✓ PASS: All required fields present")
    else:
        print(f"  ✗ FAIL: Missing required fields: {missing}")
    
    # Test 10: Date fields valid
    print("\nTest 10: Date field validation")
    
    try:
        from datetime import datetime
        
        # Check last_payment_date is in the past
        last_dates = liabilities_df['last_payment_date'].apply(
            lambda x: datetime.strptime(x, '%Y-%m-%d')
        )
        
        now = datetime.now()
        if (last_dates < now).all():
            print(f"  ✓ PASS: All last_payment_dates are in the past")
        else:
            future_count = (last_dates >= now).sum()
            print(f"  ⚠ WARNING: {future_count} last_payment_dates in the future")
        
        # Check next_payment_due_date is in the future
        next_dates = liabilities_df['next_payment_due_date'].apply(
            lambda x: datetime.strptime(x, '%Y-%m-%d')
        )
        
        if (next_dates > now).all():
            print(f"  ✓ PASS: All next_payment_due_dates are in the future")
        else:
            past_count = (next_dates <= now).sum()
            print(f"  ⚠ WARNING: {past_count} next_payment_due_dates in the past")
    
    except Exception as e:
        print(f"  ✗ FAIL: Error parsing dates: {e}")
    
    # Test 11: Last payment amount reasonable
    print("\nTest 11: Last payment amount validation")
    
    # Last payment should be between min payment and statement balance
    valid_payments = 0
    invalid_payments = 0
    
    for _, liab in liabilities_df.iterrows():
        min_payment = liab['minimum_payment_amount']
        last_payment = liab['last_payment_amount']
        statement_balance = liab['last_statement_balance']
        
        if min_payment <= last_payment <= statement_balance:
            valid_payments += 1
        else:
            invalid_payments += 1
    
    valid_pct = (valid_payments / len(liabilities_df)) * 100
    
    if valid_pct >= 90:
        print(f"  ✓ PASS: {valid_payments}/{len(liabilities_df)} payments in valid range ({valid_pct:.1f}%)")
    else:
        print(f"  ⚠ WARNING: Only {valid_pct:.1f}% of payments in valid range")
    
    # Test 12: Sample liability details
    print("\nTest 12: Sample liability details")
    
    if len(liabilities_df) > 0:
        print(f"\n  Sample liabilities:")
        
        # Show 3 credit card examples
        if len(cc_liabilities) > 0:
            print(f"\n  Credit Cards:")
            for _, liab in cc_liabilities.head(3).iterrows():
                print(f"    {liab['liability_id']}")
                print(f"      APR: {liab['apr_percentage']:.2f}%")
                print(f"      Statement balance: ${liab['last_statement_balance']:,.2f}")
                print(f"      Min payment: ${liab['minimum_payment_amount']:.2f}")
                print(f"      Last payment: ${liab['last_payment_amount']:.2f}")
                print(f"      Due date: {liab['next_payment_due_date']}")
                print(f"      Overdue: {liab['is_overdue']}")
        
        # Show student loan examples
        if len(loan_liabilities) > 0:
            print(f"\n  Student Loans:")
            for _, liab in loan_liabilities.head(2).iterrows():
                print(f"    {liab['liability_id']}")
                print(f"      Interest rate: {liab['interest_rate']:.2f}%")
                print(f"      Balance: ${liab['last_statement_balance']:,.2f}")
                print(f"      Min payment: ${liab['minimum_payment_amount']:.2f}")
                print(f"      Last payment: ${liab['last_payment_amount']:.2f}")
                print(f"      Due date: {liab['next_payment_due_date']}")
                print(f"      Overdue: {liab['is_overdue']}")
    
    # Summary
    print("\n" + "="*70)
    print("TEST SUMMARY")
    print("="*70)
    print(f"Total users: {len(users_df)}")
    print(f"Total accounts: {len(accounts_df)}")
    print(f"Total liabilities: {len(liabilities_df)}")
    print(f"\nLiability breakdown:")
    print(f"  Credit cards: {len(cc_liabilities)}")
    print(f"  Student loans: {len(loan_liabilities)}")
    
    if len(cc_liabilities) > 0:
        print(f"\nCredit Card Summary:")
        print(f"  Average APR: {cc_liabilities['apr_percentage'].mean():.2f}%")
        print(f"  Average min payment: ${cc_liabilities['minimum_payment_amount'].mean():.2f}")
        print(f"  Overdue: {cc_liabilities['is_overdue'].sum()} ({(cc_liabilities['is_overdue'].sum() / len(cc_liabilities)) * 100:.1f}%)")
    
    if len(loan_liabilities) > 0:
        print(f"\nStudent Loan Summary:")
        print(f"  Average interest rate: {loan_liabilities['interest_rate'].mean():.2f}%")
        print(f"  Average payment: ${loan_liabilities['minimum_payment_amount'].mean():.2f}")
        print(f"  Overdue: {loan_liabilities['is_overdue'].sum()}")
    
    print("="*70)

if __name__ == '__main__':
    test_liability_generation()

