# SpendSense - Behavioral Signals Detection Implementation Tasks

**Feature ID**: SS-F002  
**Status**: Ready for Implementation  
**Start Date**: November 3, 2025  
**Dependencies**: Data Foundation (SS-F001) must be complete

---

## Project Overview

Building the behavioral signal detection system that transforms raw transaction data into actionable insights. The system identifies 4 key behavior categories: subscription patterns, savings behaviors, credit utilization, and income stability.

**Key Deliverables**:

- Subscription/recurring merchant detection engine
- Savings account analysis (growth, emergency fund)
- Credit utilization calculator (per-card and aggregate)
- Income stability analyzer (frequency, variability)
- Signal storage with time windows (30d, 180d)
- Signal retrieval API

**Success Criteria**: ≥90% of users have ≥3 detected behaviors, <2s latency per user

---

## Phase 1: Project Setup & Infrastructure

### Task 1.1: Initialize Project Structure

- [ ] Create `/features` module directory
  - [ ] `/features/__init__.py`
  - [ ] `/features/base.py` - base feature detector class
  - [ ] `/features/subscriptions.py` - subscription detection
  - [ ] `/features/savings.py` - savings analysis
  - [ ] `/features/credit.py` - credit utilization
  - [ ] `/features/income.py` - income stability
  - [ ] `/features/pipeline.py` - orchestration
  - [ ] `/features/utils.py` - helper functions
- [ ] Create `/tests/features` test directory
  - [ ] `/tests/features/__init__.py`
  - [ ] `/tests/features/test_subscriptions.py`
  - [ ] `/tests/features/test_savings.py`
  - [ ] `/tests/features/test_credit.py`
  - [ ] `/tests/features/test_income.py`
  - [ ] `/tests/features/test_pipeline.py`
  - [ ] `/tests/features/test_integration.py`
  - [ ] `/tests/features/test_performance.py`

### Task 1.2: Verify Dependencies

- [ ] Confirm Data Foundation (SS-F001) is complete
  - [ ] Verify `users` table populated
  - [ ] Verify `accounts` table populated
  - [ ] Verify `transactions` table populated (6 months data)
  - [ ] Verify `liabilities` table populated
  - [ ] Check all foreign key relationships valid
  - [ ] Verify indexes exist on key columns
- [ ] Confirm all required Python packages installed
  - [ ] pandas
  - [ ] numpy
  - [ ] sqlite3 or sqlalchemy
  - [ ] pytest

### Task 1.3: Create Signal Storage Schema

- [ ] Create `user_signals` table
  - [ ] Add signal_id as PRIMARY KEY
  - [ ] Add user_id with FOREIGN KEY to users
  - [ ] Add window_type ('30d' or '180d')
  - [ ] Add signal_category (subscriptions/savings/credit/income)
  - [ ] Add signal_data as JSON
  - [ ] Add detected_at timestamp
  - [ ] Create INDEX on user_id
  - [ ] Create INDEX on signal_category
  - [ ] Create INDEX on window_type
- [ ] Create `signal_metadata` table
  - [ ] Add metadata_id as PRIMARY KEY
  - [ ] Add signal_id with FOREIGN KEY
  - [ ] Add calculation_time_ms
  - [ ] Add data_quality_score
  - [ ] Add missing_fields as JSON
  - [ ] Add error_messages as JSON

### Task 1.4: Implement Base Feature Detector Class

- [ ] Create `BaseFeatureDetector` in `/features/base.py`
  - [ ] Add `__init__(db_connection)` method
  - [ ] Add abstract method `detect()` for subclasses
  - [ ] Add `_empty_result()` abstract method
  - [ ] Add logging setup
  - [ ] Add error handling utilities
  - [ ] Add data validation utilities

---

## Phase 2: Subscription Detection Implementation

### Task 2.1: Create SubscriptionDetector Class

- [ ] Create `SubscriptionDetector` class in `/features/subscriptions.py`
  - [ ] Inherit from BaseFeatureDetector
  - [ ] Add `__init__(db_connection)` method
  - [ ] Add class docstring explaining detection criteria

### Task 2.2: Implement Core Detection Logic

- [ ] Implement `detect_recurring_merchants(user_id, window_days=90)` method
  - [ ] Get user transactions for window period
  - [ ] Group transactions by merchant_name
  - [ ] Filter for merchants with ≥3 occurrences
  - [ ] Return empty result if no transactions

### Task 2.3: Implement Amount Consistency Check

- [ ] Add amount variance calculation
  - [ ] Calculate average amount per merchant
  - [ ] Calculate standard deviation
  - [ ] Compute variance percentage: (std / mean) \* 100
  - [ ] Filter out merchants with >10% variance
  - [ ] Handle division by zero cases

### Task 2.4: Implement Frequency Detection

- [ ] Add frequency pattern recognition
  - [ ] Sort transaction dates chronologically
  - [ ] Calculate gaps between consecutive charges (.diff())
  - [ ] Calculate median gap in days
  - [ ] Classify frequency:
    - [ ] Monthly: 25-35 days
    - [ ] Weekly: 6-8 days
  - [ ] Skip merchants without clear pattern

### Task 2.5: Build Merchant Data Structure

- [ ] Create merchant detail objects
  - [ ] Store merchant name
  - [ ] Store average charge amount
  - [ ] Store frequency classification
  - [ ] Store last_charge_date (ISO format)
  - [ ] Store charges_in_window count
  - [ ] Round amounts to 2 decimal places

### Task 2.6: Calculate Aggregate Metrics

- [ ] Implement `_calculate_monthly_spend()` helper
  - [ ] Sum monthly subscriptions directly
  - [ ] Convert weekly to monthly: amount \* 4.33
  - [ ] Return total monthly equivalent
- [ ] Calculate subscription_share_pct
  - [ ] Get total spending in window
  - [ ] Divide monthly_recurring_spend by total
  - [ ] Multiply by 100 for percentage
  - [ ] Handle zero total spend case

### Task 2.7: Implement Helper Methods

- [ ] Implement `_get_user_transactions(user_id, window_days)`
  - [ ] Calculate cutoff_date from window_days
  - [ ] Query transactions table with user_id and date filter
  - [ ] Select necessary fields: transaction_id, date, amount, merchant_name, category_primary
  - [ ] Order by date DESC
  - [ ] Return pandas DataFrame
- [ ] Implement `_empty_result()`
  - [ ] Return dict with recurring_merchant_count: 0
  - [ ] Set monthly_recurring_spend: 0.0
  - [ ] Set subscription_share_pct: 0.0
  - [ ] Set merchants: []

### Task 2.8: Test Subscription Detection

- [ ] Create test data with known subscriptions
  - [ ] Monthly subscription (Netflix, 3 charges, ~30 days apart)
  - [ ] Weekly subscription (3+ charges, ~7 days apart)
  - [ ] Non-recurring merchant (random dates)
  - [ ] High variance merchant (different amounts)
- [ ] Test monthly subscription detection
- [ ] Test weekly subscription detection
- [ ] Test filtering of non-recurring merchants
- [ ] Test variance threshold (>10% excluded)
- [ ] Test monthly spend calculation
- [ ] Test empty result for users with no subscriptions

---

## Phase 3: Savings Analysis Implementation

### Task 3.1: Create SavingsAnalyzer Class

- [ ] Create `SavingsAnalyzer` class in `/features/savings.py`
  - [ ] Inherit from BaseFeatureDetector
  - [ ] Add `__init__(db_connection)` method
  - [ ] Add class docstring

### Task 3.2: Implement Main Analysis Method

- [ ] Implement `calculate_savings_signals(user_id, window_days=180)`
  - [ ] Get savings accounts for user
  - [ ] Return empty result if no savings accounts
  - [ ] Extract account_ids list
  - [ ] Get transactions for savings accounts
  - [ ] Calculate all metrics
  - [ ] Return structured result

### Task 3.3: Calculate Net Savings Inflow

- [ ] Filter deposits (amount > 0)
  - [ ] Sum all deposit amounts
- [ ] Filter withdrawals (amount < 0)
  - [ ] Sum absolute values of withdrawal amounts
- [ ] Calculate net_inflow = deposits - withdrawals
- [ ] Convert to monthly: net_inflow / (window_days / 30)
- [ ] Round to 2 decimal places

### Task 3.4: Calculate Growth Rate

- [ ] Implement `_get_balance_at_date()` helper
  - [ ] Calculate balance at start of window
  - [ ] Use transaction history reconstruction
  - [ ] Handle missing historical data gracefully
- [ ] Get current_balance from accounts
  - [ ] Sum current_balance across all savings accounts
- [ ] Calculate growth_rate
  - [ ] Formula: ((current - start) / start) \* 100
  - [ ] Handle start_balance = 0 case
  - [ ] Round to 2 decimal places

### Task 3.5: Calculate Emergency Fund Coverage

- [ ] Implement `_calculate_monthly_expenses()` helper
  - [ ] Query checking account debits (amount < 0)
  - [ ] Group by month using strftime('%Y-%m', date)
  - [ ] Sum absolute values per month
  - [ ] Calculate average across last 6 months
  - [ ] Handle users with no expenses
- [ ] Calculate emergency_fund_months
  - [ ] Formula: current_balance / monthly_expenses
  - [ ] Handle zero expenses case
  - [ ] Round to 2 decimal places

### Task 3.6: Find Largest Transactions

- [ ] Find largest deposit
  - [ ] Filter amount > 0
  - [ ] Get max() value
  - [ ] Handle empty DataFrame
- [ ] Find largest withdrawal
  - [ ] Filter amount < 0
  - [ ] Get abs(min()) value
  - [ ] Handle empty DataFrame
- [ ] Round both to 2 decimal places

### Task 3.7: Implement Helper Methods

- [ ] Implement `_get_savings_accounts(user_id)`
  - [ ] Query accounts table
  - [ ] Filter: user_id = ? AND type IN ('savings', 'money_market', 'hsa')
  - [ ] Select: account_id, type, current_balance
  - [ ] Return list of dictionaries
- [ ] Implement `_get_savings_transactions(user_id, account_ids, window_days)`
  - [ ] Calculate cutoff_date
  - [ ] Build query with IN clause for account_ids
  - [ ] Filter by date >= cutoff_date
  - [ ] Return DataFrame
- [ ] Implement `_empty_result()`
  - [ ] Return dict with all metrics set to 0.0
  - [ ] Set num_savings_accounts: 0

### Task 3.8: Test Savings Analysis

- [ ] Test with user having savings account
  - [ ] Verify net_savings_inflow calculation
  - [ ] Verify growth_rate calculation
- [ ] Test emergency fund calculation
  - [ ] User with $6000 savings, $2000/month expenses = 3 months
- [ ] Test largest deposit/withdrawal detection
- [ ] Test empty result for users without savings
- [ ] Test multiple savings accounts aggregation

---

## Phase 4: Credit Utilization Implementation

### Task 4.1: Create CreditAnalyzer Class

- [ ] Create `CreditAnalyzer` class in `/features/credit.py`
  - [ ] Inherit from BaseFeatureDetector
  - [ ] Add `__init__(db_connection)` method
  - [ ] Add class docstring

### Task 4.2: Implement Main Analysis Method

- [ ] Implement `calculate_credit_signals(user_id)`
  - [ ] Get credit card accounts for user
  - [ ] Return empty result if no credit cards
  - [ ] Initialize tracking variables
  - [ ] Process each card
  - [ ] Calculate aggregate metrics
  - [ ] Return structured result

### Task 4.3: Calculate Per-Card Utilization

- [ ] For each credit card:
  - [ ] Get balance and credit_limit from account
  - [ ] Calculate utilization: (balance / limit) \* 100
  - [ ] Handle limit = 0 case (set utilization to 0)
  - [ ] Get liability details
  - [ ] Calculate interest charges
  - [ ] Build card data object
  - [ ] Add to cards list

### Task 4.4: Detect Minimum Payment Behavior

- [ ] Get liability details for card
  - [ ] Check if last_payment_amount exists
  - [ ] Compare to minimum_payment_amount \* 1.1
  - [ ] Set minimum_payment_only flag
  - [ ] Handle null last_payment_amount

### Task 4.5: Calculate Interest Charges

- [ ] Implement `_calculate_interest_charges(account_id, days=30)`
  - [ ] Calculate cutoff_date (30 days ago)
  - [ ] Query transactions for account
  - [ ] Filter category_detailed = 'INTEREST_CHARGED'
  - [ ] Sum absolute amounts
  - [ ] Handle empty results
  - [ ] Return 0 if no interest charges

### Task 4.6: Set Risk Flags

- [ ] Track any_card_high_util (≥50%)
  - [ ] Check each card's utilization
  - [ ] Set flag if any ≥ 50%
- [ ] Track any_card_very_high_util (≥80%)
  - [ ] Check each card's utilization
  - [ ] Set flag if any ≥ 80%
- [ ] Track any_interest_charges
  - [ ] Check if interest > 0 for any card
- [ ] Track any_overdue
  - [ ] Check is_overdue flag from liabilities

### Task 4.7: Calculate Aggregate Metrics

- [ ] Sum total_balance across all cards
- [ ] Sum total_limit across all cards
- [ ] Calculate aggregate_utilization_pct
  - [ ] Formula: (total_balance / total_limit) \* 100
  - [ ] Handle total_limit = 0 case
- [ ] Calculate total_credit_available
  - [ ] Formula: total_limit - total_balance
- [ ] Round all values to 2 decimal places

### Task 4.8: Implement Helper Methods

- [ ] Implement `_get_credit_cards(user_id)`
  - [ ] Query accounts table
  - [ ] Filter: user_id = ? AND type = 'credit_card'
  - [ ] Select: account_id, mask, subtype, current_balance, credit_limit
  - [ ] Return list of dictionaries
- [ ] Implement `_get_liability_details(account_id)`
  - [ ] Query liabilities table
  - [ ] Filter: account_id = ? AND type = 'credit_card'
  - [ ] Order by created_at DESC, LIMIT 1
  - [ ] Return dict or None
- [ ] Implement `_empty_result()`
  - [ ] Return dict with empty cards list
  - [ ] Set all numeric fields to 0.0
  - [ ] Set all boolean flags to False
  - [ ] Set num_credit_cards: 0

### Task 4.9: Test Credit Utilization

- [ ] Test single card utilization
  - [ ] Card with $3400 balance, $5000 limit = 68%
  - [ ] Verify high_util flag set
- [ ] Test multiple cards aggregate
  - [ ] 3 cards: verify correct aggregate utilization
  - [ ] Verify available credit calculation
- [ ] Test minimum payment detection
- [ ] Test interest charges calculation
- [ ] Test overdue flag
- [ ] Test empty result for users without credit cards

---

## Phase 5: Income Stability Implementation

### Task 5.1: Create IncomeAnalyzer Class

- [ ] Create `IncomeAnalyzer` class in `/features/income.py`
  - [ ] Inherit from BaseFeatureDetector
  - [ ] Add `__init__(db_connection)` method
  - [ ] Add class docstring

### Task 5.2: Implement Main Analysis Method

- [ ] Implement `calculate_income_signals(user_id, window_days=180)`
  - [ ] Get deposit transactions from checking accounts
  - [ ] Return empty result if <2 deposits
  - [ ] Sort deposits by date
  - [ ] Calculate payment gaps
  - [ ] Classify payment frequency
  - [ ] Calculate income variability
  - [ ] Classify income type
  - [ ] Calculate cash flow buffer
  - [ ] Build recent deposits list
  - [ ] Return structured result

### Task 5.3: Detect Payment Frequency

- [ ] Calculate gaps between deposits
  - [ ] Convert date column to datetime
  - [ ] Use .diff() to calculate days between deposits
  - [ ] Drop NaN values from first row
  - [ ] Calculate median gap
- [ ] Classify frequency:
  - [ ] Biweekly: 12-16 days
  - [ ] Weekly: 6-8 days
  - [ ] Monthly: 25-35 days
  - [ ] Irregular: anything else

### Task 5.4: Calculate Income Variability

- [ ] Get deposit amounts
- [ ] Calculate standard deviation
- [ ] Calculate mean
- [ ] Calculate Coefficient of Variation (CV)
  - [ ] Formula: (std / mean) \* 100
  - [ ] Handle mean = 0 case
- [ ] Round to 2 decimal places

### Task 5.5: Classify Income Type

- [ ] Use variability and frequency to classify:
  - [ ] Payroll: variability < 10% AND frequency != 'irregular'
  - [ ] Freelance: variability ≥ 20%
  - [ ] Mixed: everything else
  - [ ] Unknown: insufficient data

### Task 5.6: Calculate Cash Flow Buffer

- [ ] Implement `_get_checking_balance(user_id)`
  - [ ] Query accounts table
  - [ ] Filter: user_id = ? AND type = 'checking'
  - [ ] Sum current_balance
  - [ ] Return total or 0
- [ ] Get monthly_expenses using existing helper
- [ ] Calculate buffer_months
  - [ ] Formula: checking_balance / monthly_expenses
  - [ ] Handle zero expenses case
  - [ ] Round to 2 decimal places

### Task 5.7: Build Recent Deposits List

- [ ] Get last 5 deposits using .tail(5)
- [ ] Convert to list of dictionaries
- [ ] For each deposit:
  - [ ] Extract date (convert to ISO format)
  - [ ] Extract amount (round to 2 decimals)
  - [ ] Extract days_since_last (convert to int, handle NaN)
- [ ] Return list

### Task 5.8: Implement Helper Methods

- [ ] Implement `_get_deposits(user_id, window_days)`
  - [ ] Calculate cutoff_date
  - [ ] Query transactions table
  - [ ] Filter: user_id, amount > 0, amount ≥ 100 (filter small transfers)
  - [ ] Filter: date ≥ cutoff_date
  - [ ] Filter: account_id IN checking accounts
  - [ ] Order by date ASC
  - [ ] Return DataFrame
- [ ] Implement `_calculate_monthly_expenses()` (reuse or adapt from savings)
- [ ] Implement `_empty_result()`
  - [ ] Return dict with income_type: 'unknown'
  - [ ] Set payment_frequency: 'unknown'
  - [ ] Set all numeric fields to 0.0
  - [ ] Set recent_deposits: []

### Task 5.9: Test Income Stability

- [ ] Test biweekly income detection
  - [ ] Create deposits 14 days apart
  - [ ] Verify frequency classification
  - [ ] Verify low variability → 'payroll' type
- [ ] Test monthly income detection
  - [ ] Create deposits 30 days apart
- [ ] Test irregular income detection
  - [ ] Create deposits with random gaps
  - [ ] Verify 'irregular' frequency
  - [ ] Verify high variability → 'freelance' type
- [ ] Test cash flow buffer calculation
- [ ] Test recent deposits list generation
- [ ] Test empty result for users with <2 deposits

---

## Phase 6: Feature Pipeline Orchestration

### Task 6.1: Create FeaturePipeline Class

- [ ] Create `FeaturePipeline` class in `/features/pipeline.py`
  - [ ] Add `__init__(db_path)` method
  - [ ] Initialize database connection
  - [ ] Initialize all 4 feature detectors
    - [ ] SubscriptionDetector
    - [ ] SavingsAnalyzer
    - [ ] CreditAnalyzer
    - [ ] IncomeAnalyzer

### Task 6.2: Implement Main Pipeline Runner

- [ ] Implement `run(user_id, window_type='30d', categories=None)` method
  - [ ] Parse categories parameter (default to ['all'])
  - [ ] Convert window_type to window_days (30 or 180)
  - [ ] Start timer for performance tracking
  - [ ] Initialize signals dict
  - [ ] Initialize warnings list
  - [ ] Execute each detector with error handling
  - [ ] Calculate total calculation time
  - [ ] Store signals in database
  - [ ] Return structured result

### Task 6.3: Implement Error Handling for Each Detector

- [ ] For subscriptions detector:
  - [ ] Wrap in try-except block
  - [ ] Catch and log exceptions
  - [ ] Add warning to warnings list
  - [ ] Set signals['subscriptions'] = None on failure
- [ ] For savings analyzer:
  - [ ] Same error handling pattern
- [ ] For credit analyzer:
  - [ ] Same error handling pattern
- [ ] For income analyzer:
  - [ ] Same error handling pattern

### Task 6.4: Implement Signal Storage

- [ ] Implement `_store_signals()` method
  - [ ] Iterate through signals dict
  - [ ] Skip None signals
  - [ ] Generate signal*id: `{user_id}*{category}_{window}_{timestamp}`
  - [ ] Insert into user_signals table
    - [ ] Convert signal_data to JSON string
    - [ ] Use CURRENT_TIMESTAMP for detected_at
  - [ ] Insert into signal_metadata table
    - [ ] Store calculation_time_ms
    - [ ] Store warnings as JSON
  - [ ] Commit transaction

### Task 6.5: Implement Data Quality Calculation

- [ ] Implement `_calculate_data_quality()` method
  - [ ] Count total signals expected
  - [ ] Count valid signals (not None)
  - [ ] Calculate score: valid / total
  - [ ] Return 0.0 if no signals
  - [ ] Return float between 0-1

### Task 6.6: Implement Batch Processing

- [ ] Implement `batch_run(user_ids, window_type='30d')` method
  - [ ] Initialize results list
  - [ ] Iterate through user_ids
  - [ ] For each user:
    - [ ] Try to run pipeline
    - [ ] Record success status
    - [ ] Catch and record failures
  - [ ] Calculate summary statistics
  - [ ] Return batch results dict

### Task 6.7: Add Logging

- [ ] Import logging module
- [ ] Set up logger with appropriate level
- [ ] Add log statements:
  - [ ] Starting signal detection for user
  - [ ] Each detector starting/completing
  - [ ] Any warnings or errors
  - [ ] Final completion time
  - [ ] Batch processing progress

### Task 6.8: Test Pipeline Orchestration

- [ ] Test single user, single category
  - [ ] Verify correct detector called
  - [ ] Verify result structure
- [ ] Test single user, all categories
  - [ ] Verify all 4 detectors run
  - [ ] Verify timing recorded
- [ ] Test error handling
  - [ ] Simulate detector failure
  - [ ] Verify warning captured
  - [ ] Verify other detectors still run
- [ ] Test signal storage
  - [ ] Verify signals written to database
  - [ ] Verify metadata recorded
- [ ] Test batch processing
  - [ ] Run on 10 users
  - [ ] Verify summary statistics

---

## Phase 7: API Development (Optional)

### Task 7.1: Create API Endpoints Module

- [ ] Create `/api` directory
  - [ ] `/api/__init__.py`
  - [ ] `/api/signals.py` - signal endpoints
  - [ ] `/api/models.py` - request/response models
- [ ] Choose framework (Flask or FastAPI)
- [ ] Install framework dependencies

### Task 7.2: Implement Generate Signals Endpoint

- [ ] Create POST `/api/signals/generate`
  - [ ] Define request model (user_id, window_type, categories)
  - [ ] Validate input parameters
  - [ ] Call pipeline.run()
  - [ ] Format response
  - [ ] Handle errors (400, 404, 500)

### Task 7.3: Implement Get Signals Endpoint

- [ ] Create GET `/api/signals/{user_id}`
  - [ ] Parse query parameters (window_type, category)
  - [ ] Query user_signals table
  - [ ] Parse JSON signal_data
  - [ ] Format response
  - [ ] Handle user not found (404)

### Task 7.4: Implement Batch Generate Endpoint

- [ ] Create POST `/api/signals/batch`
  - [ ] Define request model (user_ids list, window_type)
  - [ ] Validate user_ids list
  - [ ] Generate job_id
  - [ ] Start async processing (or return 202)
  - [ ] Call pipeline.batch_run()
  - [ ] Return job status
- [ ] Create GET `/api/signals/batch/{job_id}`
  - [ ] Query job status
  - [ ] Return completion status
  - [ ] Return results summary

### Task 7.5: Add API Documentation

- [ ] Generate OpenAPI/Swagger docs
- [ ] Document request/response schemas
- [ ] Add example requests and responses
- [ ] Document error codes

### Task 7.6: Test API Endpoints

- [ ] Test generate endpoint with valid input
- [ ] Test generate endpoint with invalid input
- [ ] Test get endpoint with existing user
- [ ] Test get endpoint with non-existent user
- [ ] Test batch endpoint with multiple users

---

## Phase 8: Testing & Quality Assurance

### Task 8.1: Write Unit Tests for Subscriptions

- [ ] Create `/tests/features/test_subscriptions.py`
- [ ] Test monthly subscription detection
  - [ ] Setup: 3 charges, ~30 days apart, same amount
  - [ ] Assert: recurring_merchant_count = 1
  - [ ] Assert: frequency = 'monthly'
  - [ ] Assert: monthly_recurring_spend correct
- [ ] Test weekly subscription detection
  - [ ] Setup: 4+ charges, ~7 days apart
  - [ ] Assert: frequency = 'weekly'
  - [ ] Assert: monthly spend = amount \* 4.33
- [ ] Test variance threshold filtering
  - [ ] Setup: 3 charges with >10% variance
  - [ ] Assert: merchant not detected as recurring
- [ ] Test no subscriptions case
  - [ ] Setup: User with random transactions
  - [ ] Assert: recurring_merchant_count = 0
- [ ] Test empty transactions
  - [ ] Setup: User with no transactions
  - [ ] Assert: empty result returned

### Task 8.2: Write Unit Tests for Savings

- [ ] Create `/tests/features/test_savings.py`
- [ ] Test net savings inflow calculation
  - [ ] Setup: Known deposits and withdrawals
  - [ ] Assert: correct monthly inflow
- [ ] Test growth rate calculation
  - [ ] Setup: Known start and current balance
  - [ ] Assert: correct percentage growth
- [ ] Test emergency fund calculation
  - [ ] Setup: $6000 balance, $2000/month expenses
  - [ ] Assert: emergency_fund_months = 3.0
- [ ] Test largest deposit/withdrawal detection
  - [ ] Setup: Transactions with known max values
  - [ ] Assert: correct values returned
- [ ] Test no savings accounts case
  - [ ] Setup: User without savings accounts
  - [ ] Assert: empty result returned

### Task 8.3: Write Unit Tests for Credit

- [ ] Create `/tests/features/test_credit.py`
- [ ] Test single card utilization
  - [ ] Setup: $3400 balance, $5000 limit
  - [ ] Assert: utilization_pct = 68.0
  - [ ] Assert: any_card_high_util = True
- [ ] Test multiple cards aggregate
  - [ ] Setup: 3 cards with known balances/limits
  - [ ] Assert: correct aggregate_utilization_pct
  - [ ] Assert: correct total_credit_available
- [ ] Test minimum payment detection
  - [ ] Setup: Payment = minimum \* 0.95
  - [ ] Assert: minimum_payment_only = True
- [ ] Test interest charges calculation
  - [ ] Setup: Transactions with INTEREST_CHARGED category
  - [ ] Assert: correct total interest
- [ ] Test no credit cards case
  - [ ] Setup: User without credit cards
  - [ ] Assert: empty result returned

### Task 8.4: Write Unit Tests for Income

- [ ] Create `/tests/features/test_income.py`
- [ ] Test biweekly income detection
  - [ ] Setup: Deposits every 14 days
  - [ ] Assert: payment_frequency = 'biweekly'
  - [ ] Assert: median_pay_gap_days = 14
  - [ ] Assert: income_type = 'payroll' (low variability)
- [ ] Test monthly income detection
  - [ ] Setup: Deposits every 30 days
  - [ ] Assert: payment_frequency = 'monthly'
- [ ] Test irregular income detection
  - [ ] Setup: Deposits with random gaps
  - [ ] Assert: payment_frequency = 'irregular'
  - [ ] Assert: income_type = 'freelance' (high variability)
- [ ] Test variability calculation
  - [ ] Setup: Known deposit amounts
  - [ ] Assert: correct CV percentage
- [ ] Test cash flow buffer calculation
  - [ ] Setup: Known balance and expenses
  - [ ] Assert: correct months calculation
- [ ] Test insufficient data case
  - [ ] Setup: <2 deposits
  - [ ] Assert: empty result returned

### Task 8.5: Write Integration Tests

- [ ] Create `/tests/features/test_integration.py`
- [ ] Test complete pipeline for single user
  - [ ] Generate all signals
  - [ ] Assert all 4 categories present
  - [ ] Assert all signals non-null
  - [ ] Assert data_quality_score ≥ 0.9
  - [ ] Assert calculation_time < 2000ms
- [ ] Test signal storage and retrieval
  - [ ] Generate signals
  - [ ] Query database
  - [ ] Assert signals stored correctly
  - [ ] Assert metadata recorded
- [ ] Test batch processing
  - [ ] Run on 10 users
  - [ ] Assert all complete successfully
  - [ ] Assert summary statistics correct
- [ ] Test with real synthetic data from Phase 1
  - [ ] Run on all 100 generated users
  - [ ] Calculate coverage: users with 3+ signals
  - [ ] Assert coverage ≥ 90%

### Task 8.6: Write Performance Tests

- [ ] Create `/tests/features/test_performance.py`
- [ ] Test single user latency
  - [ ] Time pipeline.run() for 50 users
  - [ ] Calculate 95th percentile
  - [ ] Assert p95 < 2.0 seconds
- [ ] Test batch processing throughput
  - [ ] Time batch_run() for 100 users
  - [ ] Assert total time < 5 minutes
- [ ] Test database query performance
  - [ ] Profile slow queries
  - [ ] Ensure indexes being used
  - [ ] Assert key queries < 100ms

### Task 8.7: Create Test Fixtures

- [ ] Create pytest fixtures for test database
  - [ ] In-memory SQLite database
  - [ ] Create all required tables
  - [ ] Populate with test data
- [ ] Create fixtures for test users
  - [ ] User with subscriptions
  - [ ] User with savings
  - [ ] User with credit cards
  - [ ] User with biweekly income
  - [ ] User with irregular income
  - [ ] User with no data
- [ ] Create helper functions
  - [ ] `create_test_transaction()`
  - [ ] `create_test_account()`
  - [ ] `create_test_liability()`

### Task 8.8: Run Full Test Suite

- [ ] Run all unit tests
  - [ ] Assert 100% pass rate
  - [ ] Check code coverage (target >80%)
- [ ] Run all integration tests
  - [ ] Assert 100% pass rate
- [ ] Run performance tests
  - [ ] Assert all targets met
- [ ] Fix any failing tests
- [ ] Document any edge cases found

---

## Phase 9: Validation & Deployment Prep

### Task 9.1: Run Pipeline on Synthetic Data

- [ ] Load database from Phase 1 (100 users)
- [ ] Run batch_run() on all 100 users
  - [ ] Capture start time
  - [ ] Run pipeline
  - [ ] Capture end time
- [ ] Verify no errors
  - [ ] Check warnings list
  - [ ] Review any failures
  - [ ] Fix issues if found

### Task 9.2: Validate Coverage Metrics

- [ ] Query user_signals table
- [ ] For each user, count detected signals
- [ ] Calculate: users with ≥3 signals / total users
- [ ] Assert coverage ≥ 90%
- [ ] Document users with <3 signals
  - [ ] Investigate why
  - [ ] Determine if expected (sparse data)

### Task 9.3: Validate Signal Quality

- [ ] Review sample signals for each category
  - [ ] Subscriptions: check merchant lists make sense
  - [ ] Savings: check growth rates reasonable
  - [ ] Credit: check utilization percentages
  - [ ] Income: check frequency classifications
- [ ] Check for anomalies
  - [ ] Negative values where unexpected
  - [ ] Percentages >100%
  - [ ] Division by zero errors
- [ ] Validate data quality scores
  - [ ] Average data_quality_score across all users
  - [ ] Target: >0.9

### Task 9.4: Performance Validation

- [ ] Measure actual latencies
  - [ ] Single user: calculate average and p95
  - [ ] Batch 100 users: measure total time
- [ ] Verify targets met:
  - [ ] <2s per user (95th percentile)
  - [ ] <5 minutes for 100 users batch
- [ ] If targets not met:
  - [ ] Profile code for bottlenecks
  - [ ] Optimize slow queries
  - [ ] Add/verify database indexes
  - [ ] Consider caching strategies

### Task 9.5: Create Example Outputs

- [ ] Generate signals for 3 representative users:
  - [ ] "Subscription-heavy" user
  - [ ] "High savings" user
  - [ ] "High credit utilization" user
- [ ] Export signal JSON to files
- [ ] Add to documentation as examples
- [ ] Create visualization of signals (optional)

### Task 9.6: Documentation

- [ ] Write comprehensive README for `/features`
  - [ ] Overview of signal detection system
  - [ ] How to run pipeline
  - [ ] Signal category descriptions
  - [ ] API usage examples
- [ ] Document each detector class
  - [ ] Add detailed docstrings
  - [ ] Explain detection criteria
  - [ ] Document edge cases
- [ ] Create troubleshooting guide
  - [ ] Common errors and solutions
  - [ ] How to debug failed detections
  - [ ] Performance tuning tips

### Task 9.7: Code Quality

- [ ] Run linter (pylint or flake8)
  - [ ] Fix all errors
  - [ ] Address warnings
- [ ] Format code consistently
  - [ ] Use black or autopep8
  - [ ] Ensure consistent style
- [ ] Add type hints
  - [ ] All function signatures
  - [ ] Complex variable types
- [ ] Code review
  - [ ] Have peer review implementation
  - [ ] Address feedback

---

## Phase 10: Integration with Downstream Features

### Task 10.1: Prepare for Persona System Integration

- [ ] Document signal output schema for Persona System
- [ ] Create example integration code
  ```python
  # Example for Persona System
  signals = pipeline.run(user_id, window_type='30d')
  if signals['signals']['credit']['aggregate_utilization_pct'] >= 50:
      persona = 'high_utilization'
  ```
- [ ] Test signal retrieval performance for batch persona assignment

### Task 10.2: Prepare for Recommendation Engine Integration

- [ ] Document signal retrieval API
- [ ] Create signal explanation helpers
  - [ ] Helper to format signal for display
  - [ ] Helper to generate rationale text
- [ ] Test signal access patterns for recommendation matching

### Task 10.3: Prepare for Operator Dashboard Integration

- [ ] Design signal visualization format
- [ ] Create signal summary endpoint
  - [ ] Aggregate stats across all users
  - [ ] Distribution histograms
- [ ] Document dashboard data needs

### Task 10.4: Create Integration Examples

- [ ] Write example code for common use cases
  - [ ] Get all signals for user
  - [ ] Filter signals by category
  - [ ] Compare signals across time windows
  - [ ] Batch signal retrieval
- [ ] Add to documentation

---

## Acceptance Criteria Checklist

### Must Have

- [ ] **All 4 signal categories implemented**
  - [ ] Subscriptions: recurring merchant detection
  - [ ] Savings: growth rate, emergency fund, net inflow
  - [ ] Credit: utilization per-card and aggregate
  - [ ] Income: frequency, variability, buffer
- [ ] **Signals calculated for both 30d and 180d windows**
  - [ ] window_type parameter works correctly
  - [ ] Different results for different windows
- [ ] **Signal output stored in structured JSON format**
  - [ ] user_signals table populated
  - [ ] signal_metadata table populated
  - [ ] JSON schema valid
- [ ] **≥90% of synthetic users have 3+ detected behaviors**
  - [ ] Run on all 100 users
  - [ ] Calculate coverage metric
  - [ ] Document results
- [ ] **All calculations have unit tests with 100% pass rate**
  - [ ] Subscriptions: 5+ tests
  - [ ] Savings: 5+ tests
  - [ ] Credit: 5+ tests
  - [ ] Income: 5+ tests
  - [ ] All passing

### Should Have

- [ ] **Signal detection completes in <2 seconds per user**
  - [ ] Measure 95th percentile latency
  - [ ] Optimize if needed
- [ ] **Graceful handling of missing data**
  - [ ] Empty transactions → empty result
  - [ ] No accounts → empty result
  - [ ] Missing liability → skip, continue
  - [ ] No errors/crashes
- [ ] **Detailed logging of calculation steps**
  - [ ] Log each detector start/end
  - [ ] Log warnings
  - [ ] Log calculation times

### Nice to Have

- [ ] **Signal trend visualization**
  - [ ] Charts showing signals over time
- [ ] **Batch processing for multiple users**
  - [ ] batch_run() implemented
  - [ ] Progress tracking
- [ ] **Signal comparison across users**
  - [ ] Anonymized comparisons
  - [ ] Distribution statistics

---

## Success Metrics

Track these metrics throughout implementation:

### Coverage

- [ ] **Target**: ≥90% of users have 3+ signals
- [ ] **Current**: \_\_\_% (fill in after validation)

### Accuracy

- [ ] **Target**: 100% of unit tests passing
- [ ] **Current**: \_\_\_% (fill in after test run)

### Performance

- [ ] **Target**: <2s per user (95th percentile)
- [ ] **Current**: \_\_\_s (fill in after performance test)

### Data Quality

- [ ] **Target**: 0% null/invalid signal values
- [ ] **Current**: \_\_\_% (fill in after validation)

---

## Troubleshooting Guide

### Issue: Low signal coverage (<90%)

**Diagnosis:**

- Check if synthetic data has enough transactions
- Verify date ranges overlap with window periods
- Check if accounts have required data

**Solution:**

- Review data generation in Phase 1
- Adjust detection thresholds if too strict
- Document users with intentionally sparse data

### Issue: Slow performance (>2s per user)

**Diagnosis:**

- Profile code to find bottlenecks
- Check if database indexes exist
- Look for N+1 query patterns

**Solution:**

- Add/verify indexes on user_id, account_id, date
- Batch database queries
- Cache expensive calculations
- Use pandas vectorized operations

### Issue: Failed unit tests

**Diagnosis:**

- Review test data setup
- Check for floating point comparison issues
- Verify test assumptions match implementation

**Solution:**

- Use pytest.approx() for float comparisons
- Add detailed assertion messages
- Print intermediate values for debugging

### Issue: Empty signals for some users

**Diagnosis:**

- Check if user has required account types
- Verify transactions exist in time window
- Check if data meets detection criteria

**Solution:**

- This may be expected for some users
- Document criteria not met
- Return proper empty result structures

---

## Resources

- [Pandas Documentation](https://pandas.pydata.org/docs/)
- [NumPy Documentation](https://numpy.org/doc/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Pytest Documentation](https://docs.pytest.org/)
- PRD #1: Data Foundation (for data schema reference)
- PRD #3: Persona System (for downstream integration)

---

## Notes & Decisions

### Decision Log

- **Date**: [Date] - **Decision**: [Decision made] - **Rationale**: [Why]

### Known Limitations

- Historical balance reconstruction limited by available transaction data
- Window size limited to 30d and 180d (configurable in future)
- Credit interest calculation requires specific transaction category

### Future Enhancements

- Real-time signal updates (currently batch only)
- Machine learning-based anomaly detection
- Predictive signal forecasting
- Additional signal categories (investment, debt payoff, etc.)

---

**Last Updated**: November 3, 2025  
**Progress**: 0% Complete (0/150+ tasks)
**Estimated Completion**: 7-10 days with focused development
