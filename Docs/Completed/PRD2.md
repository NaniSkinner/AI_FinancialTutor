# Behavioral Signals Detection - Feature PRD

**Version:** 1.0  
**Date:** November 3, 2025  
**Feature Owner:** Bryce Harris  
**Project:** SpendSense - Explainable AI for Financial Education  
**Dependencies:** Data Foundation (PRD #1)

---

## Executive Summary

The Behavioral Signals Detection system analyzes transaction data to identify four key financial behavior categories: subscription patterns, savings behaviors, credit utilization, and income stability. These signals power the persona assignment system and recommendation engine by providing quantitative insights into user financial habits.

### Core Value Proposition

Transform raw transaction data into actionable behavioral insights that are:

- **Quantitative**: Specific numbers (not subjective assessments)
- **Explainable**: Clear calculation logic for auditability
- **Time-windowed**: 30-day and 180-day rolling windows
- **Privacy-preserving**: Analyzed on synthetic data, extensible to real data

---

## Table of Contents

1. [Feature Overview](#1-feature-overview)
2. [Success Criteria](#2-success-criteria)
3. [Technical Requirements](#3-technical-requirements)
4. [Signal Categories](#4-signal-categories)
5. [Data Schema](#5-data-schema)
6. [API Specification](#6-api-specification)
7. [Implementation Guide](#7-implementation-guide)
8. [Testing Requirements](#8-testing-requirements)
9. [Performance Requirements](#9-performance-requirements)
10. [Dependencies & Integration](#10-dependencies--integration)

---

## 1. Feature Overview

### 1.1 Problem Statement

Raw financial transaction data (accounts, transactions, liabilities) needs to be transformed into meaningful behavioral signals that can:

- Identify spending patterns (recurring subscriptions)
- Measure financial health (savings growth, credit utilization)
- Assess income stability (payment frequency, variability)
- Enable persona classification and personalized recommendations

### 1.2 User Stories

**As a data scientist**, I want to run signal detection on user transaction data so that I can identify behavioral patterns for persona assignment.

**As an operator**, I want to view detected signals for a user so that I can understand why they received specific recommendations.

**As a developer**, I want signal calculations to be deterministic and testable so that I can validate accuracy.

### 1.3 Scope

**In Scope:**

- ✅ Subscription/recurring merchant detection
- ✅ Savings account analysis (inflows, growth rate, emergency fund)
- ✅ Credit utilization calculation (per-card and aggregate)
- ✅ Income stability analysis (frequency, variability, buffer)
- ✅ Signal storage with time windows (30d, 180d)
- ✅ Signal retrieval API

**Out of Scope:**

- ❌ Real-time signal updates (batch processing only)
- ❌ Predictive modeling (future behavior forecasting)
- ❌ External data sources (credit scores from bureaus)
- ❌ Machine learning-based anomaly detection

---

## 2. Success Criteria

| Metric           | Target                                            | Measurement                               |
| ---------------- | ------------------------------------------------- | ----------------------------------------- |
| **Coverage**     | ≥90% of users have ≥3 detected behaviors          | Count users with 3+ signals / total users |
| **Accuracy**     | 100% of calculations match test cases             | Unit test pass rate                       |
| **Performance**  | Signal detection completes in <2 seconds per user | 95th percentile latency                   |
| **Data Quality** | 0% null/invalid signal values                     | Data validation pass rate                 |

### 2.1 Acceptance Criteria

**Must Have:**

- [ ] All 4 signal categories implemented (subscriptions, savings, credit, income)
- [ ] Signals calculated for both 30d and 180d windows
- [ ] Signal output stored in structured JSON format
- [ ] ≥90% of synthetic users have 3+ detected behaviors
- [ ] All calculations have unit tests with 100% pass rate

**Should Have:**

- [ ] Signal detection completes in <2 seconds per user
- [ ] Graceful handling of missing data (empty accounts, no transactions)
- [ ] Detailed logging of calculation steps for debugging

**Nice to Have:**

- [ ] Signal trend visualization (how signals change over time)
- [ ] Batch processing for multiple users
- [ ] Signal comparison across users (anonymized)

---

## 3. Technical Requirements

### 3.1 Technology Stack

- **Language**: Python 3.10+
- **Libraries**:
  - `pandas` (data manipulation)
  - `numpy` (numerical calculations)
  - `datetime` (date handling)
  - `sqlite3` or `sqlalchemy` (database)
- **Database**: SQLite (dev), PostgreSQL-compatible (production)

### 3.2 Module Structure

```
/features
├── __init__.py
├── base.py                 # Base feature detector class
├── subscriptions.py        # Subscription detection
├── savings.py              # Savings analysis
├── credit.py               # Credit utilization
├── income.py               # Income stability
└── pipeline.py             # Orchestration
```

### 3.3 Core Principles

1. **Deterministic**: Same input → same output (no randomness)
2. **Defensive**: Handle missing data gracefully
3. **Explainable**: Each signal has clear calculation logic
4. **Testable**: Pure functions where possible

---

## 4. Signal Categories

### 4.1 Subscription Detection

#### 4.1.1 Definition

Identify merchants with recurring charges (monthly or weekly) and calculate total subscription spend.

#### 4.1.2 Detection Criteria

A merchant is considered "recurring" if:

- Appears **≥3 times** in the analysis window (default 90 days)
- Amounts are within **10% variance** (allows for price changes)
- Frequency is consistent:
  - **Monthly**: 25-35 days between charges
  - **Weekly**: 6-8 days between charges

#### 4.1.3 Output Schema

```python
{
    'recurring_merchant_count': int,          # Number of recurring merchants
    'monthly_recurring_spend': float,         # Total $/month on subscriptions
    'subscription_share_pct': float,          # % of total spend on subscriptions
    'merchants': [
        {
            'name': str,                      # Merchant name
            'amount': float,                  # Typical charge amount
            'frequency': str,                 # 'monthly' or 'weekly'
            'last_charge_date': str,          # ISO date
            'charges_in_window': int          # Number of charges detected
        },
        ...
    ]
}
```

#### 4.1.4 Implementation

```python
# /features/subscriptions.py

import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List

class SubscriptionDetector:
    def __init__(self, db_connection):
        self.db = db_connection

    def detect_recurring_merchants(self, user_id: str, window_days: int = 90) -> Dict:
        """
        Identify recurring merchants with monthly/weekly cadence

        Args:
            user_id: User identifier
            window_days: Analysis window (default 90 days)

        Returns:
            Dictionary with recurring merchant data
        """
        # Get transactions for user in window
        transactions = self._get_user_transactions(user_id, window_days)

        if transactions.empty:
            return self._empty_result()

        # Group by merchant, filter for ≥3 occurrences
        merchant_groups = transactions.groupby('merchant_name')
        recurring_merchants = []

        for merchant, group in merchant_groups:
            if len(group) < 3:
                continue

            # Check amount consistency (within 10%)
            amounts = group['amount'].abs()  # Use absolute values
            avg_amount = amounts.mean()
            variance_pct = (amounts.std() / avg_amount) * 100 if avg_amount > 0 else 100

            if variance_pct > 10:
                continue

            # Check frequency consistency
            dates = pd.to_datetime(group['date']).sort_values()
            gaps = dates.diff().dt.days.dropna()

            if len(gaps) == 0:
                continue

            median_gap = gaps.median()

            # Classify frequency
            if 25 <= median_gap <= 35:
                frequency = 'monthly'
            elif 6 <= median_gap <= 8:
                frequency = 'weekly'
            else:
                continue  # Not a clear pattern

            recurring_merchants.append({
                'name': merchant,
                'amount': avg_amount,
                'frequency': frequency,
                'last_charge_date': dates.max().isoformat(),
                'charges_in_window': len(group)
            })

        # Calculate totals
        monthly_spend = self._calculate_monthly_spend(recurring_merchants)
        total_spend = transactions['amount'].abs().sum()
        subscription_share = (monthly_spend / total_spend * 100) if total_spend > 0 else 0

        return {
            'recurring_merchant_count': len(recurring_merchants),
            'monthly_recurring_spend': round(monthly_spend, 2),
            'subscription_share_pct': round(subscription_share, 2),
            'merchants': recurring_merchants
        }

    def _calculate_monthly_spend(self, recurring_merchants: List[Dict]) -> float:
        """Convert all recurring charges to monthly equivalent"""
        monthly_total = 0

        for merchant in recurring_merchants:
            if merchant['frequency'] == 'monthly':
                monthly_total += merchant['amount']
            elif merchant['frequency'] == 'weekly':
                monthly_total += merchant['amount'] * 4.33  # Avg weeks per month

        return monthly_total

    def _get_user_transactions(self, user_id: str, window_days: int) -> pd.DataFrame:
        """Fetch user transactions from database"""
        cutoff_date = datetime.now() - timedelta(days=window_days)

        query = """
            SELECT transaction_id, date, amount, merchant_name, category_primary
            FROM transactions
            WHERE user_id = ? AND date >= ?
            ORDER BY date DESC
        """

        return pd.read_sql_query(query, self.db, params=(user_id, cutoff_date.date()))

    def _empty_result(self) -> Dict:
        """Return empty result structure"""
        return {
            'recurring_merchant_count': 0,
            'monthly_recurring_spend': 0.0,
            'subscription_share_pct': 0.0,
            'merchants': []
        }
```

---

### 4.2 Savings Analysis

#### 4.2.1 Definition

Analyze savings account behaviors including net inflows, growth rate, and emergency fund coverage.

#### 4.2.2 Detection Criteria

- Identify savings-like accounts: `type IN ('savings', 'money_market', 'hsa')`
- Calculate net inflow: Sum of (deposits - withdrawals) over window
- Calculate growth rate: ((current_balance - start_balance) / start_balance) \* 100
- Calculate emergency fund: current_balance / monthly_expenses

#### 4.2.3 Output Schema

```python
{
    'net_savings_inflow': float,              # Average $/month deposited (net)
    'savings_growth_rate_pct': float,         # % growth over window
    'emergency_fund_months': float,           # Months of expenses covered
    'total_savings_balance': float,           # Current balance across all savings accounts
    'num_savings_accounts': int,              # Number of savings accounts
    'largest_deposit': float,                 # Largest single deposit in window
    'largest_withdrawal': float               # Largest single withdrawal in window
}
```

#### 4.2.4 Implementation

```python
# /features/savings.py

import pandas as pd
from datetime import datetime, timedelta
from typing import Dict

class SavingsAnalyzer:
    def __init__(self, db_connection):
        self.db = db_connection

    def calculate_savings_signals(self, user_id: str, window_days: int = 180) -> Dict:
        """
        Analyze savings behavior

        Args:
            user_id: User identifier
            window_days: Analysis window (default 180 days)

        Returns:
            Dictionary with savings signals
        """
        # Get savings accounts
        savings_accounts = self._get_savings_accounts(user_id)

        if not savings_accounts:
            return self._empty_result()

        account_ids = [acc['account_id'] for acc in savings_accounts]

        # Get transactions for savings accounts
        transactions = self._get_savings_transactions(user_id, account_ids, window_days)

        # Calculate net inflow (deposits - withdrawals)
        deposits = transactions[transactions['amount'] > 0]['amount'].sum()
        withdrawals = abs(transactions[transactions['amount'] < 0]['amount'].sum())
        net_inflow = deposits - withdrawals
        monthly_inflow = net_inflow / (window_days / 30)

        # Calculate growth rate
        start_balance = self._get_balance_at_date(account_ids, window_days)
        current_balance = sum(acc['current_balance'] for acc in savings_accounts)

        growth_rate = 0
        if start_balance > 0:
            growth_rate = ((current_balance - start_balance) / start_balance) * 100

        # Calculate emergency fund coverage
        monthly_expenses = self._calculate_monthly_expenses(user_id)
        emergency_fund_months = 0
        if monthly_expenses > 0:
            emergency_fund_months = current_balance / monthly_expenses

        # Find largest deposits/withdrawals
        largest_deposit = transactions[transactions['amount'] > 0]['amount'].max() if not transactions.empty else 0
        largest_withdrawal = abs(transactions[transactions['amount'] < 0]['amount'].min()) if not transactions.empty else 0

        return {
            'net_savings_inflow': round(monthly_inflow, 2),
            'savings_growth_rate_pct': round(growth_rate, 2),
            'emergency_fund_months': round(emergency_fund_months, 2),
            'total_savings_balance': round(current_balance, 2),
            'num_savings_accounts': len(savings_accounts),
            'largest_deposit': round(largest_deposit, 2),
            'largest_withdrawal': round(largest_withdrawal, 2)
        }

    def _get_savings_accounts(self, user_id: str) -> List[Dict]:
        """Fetch savings accounts for user"""
        query = """
            SELECT account_id, type, current_balance
            FROM accounts
            WHERE user_id = ? AND type IN ('savings', 'money_market', 'hsa')
        """

        df = pd.read_sql_query(query, self.db, params=(user_id,))
        return df.to_dict('records')

    def _get_savings_transactions(self, user_id: str, account_ids: List[str],
                                  window_days: int) -> pd.DataFrame:
        """Fetch transactions for savings accounts"""
        cutoff_date = datetime.now() - timedelta(days=window_days)

        placeholders = ','.join(['?'] * len(account_ids))
        query = f"""
            SELECT transaction_id, date, amount
            FROM transactions
            WHERE user_id = ? AND account_id IN ({placeholders}) AND date >= ?
            ORDER BY date DESC
        """

        params = (user_id, *account_ids, cutoff_date.date())
        return pd.read_sql_query(query, self.db, params=params)

    def _get_balance_at_date(self, account_ids: List[str], days_ago: int) -> float:
        """Calculate balance at start of window"""
        # This would require transaction history reconstruction
        # For simplicity, estimate from current balance and net flow
        # In production, would need account balance snapshots
        return 0  # Placeholder - implement based on data availability

    def _calculate_monthly_expenses(self, user_id: str) -> float:
        """Estimate monthly expenses from checking account debits"""
        query = """
            SELECT AVG(monthly_total) as avg_expenses
            FROM (
                SELECT strftime('%Y-%m', date) as month,
                       SUM(ABS(amount)) as monthly_total
                FROM transactions
                WHERE user_id = ?
                  AND amount < 0
                  AND account_id IN (
                      SELECT account_id FROM accounts
                      WHERE user_id = ? AND type = 'checking'
                  )
                  AND date >= date('now', '-6 months')
                GROUP BY month
            )
        """

        result = pd.read_sql_query(query, self.db, params=(user_id, user_id))
        return result['avg_expenses'].iloc[0] if not result.empty else 0

    def _empty_result(self) -> Dict:
        """Return empty result structure"""
        return {
            'net_savings_inflow': 0.0,
            'savings_growth_rate_pct': 0.0,
            'emergency_fund_months': 0.0,
            'total_savings_balance': 0.0,
            'num_savings_accounts': 0,
            'largest_deposit': 0.0,
            'largest_withdrawal': 0.0
        }
```

---

### 4.3 Credit Utilization

#### 4.3.1 Definition

Calculate credit card utilization (balance / limit) per card and in aggregate, plus identify risk indicators.

#### 4.3.2 Detection Criteria

- Utilization = (current_balance / credit_limit) \* 100
- Risk flags:
  - High utilization: ≥50%
  - Very high utilization: ≥80%
  - Interest charges present
  - Minimum payment only (last_payment < minimum_payment \* 1.1)
  - Overdue status

#### 4.3.3 Output Schema

```python
{
    'cards': [
        {
            'account_id': str,
            'mask': str,                      # Last 4 digits
            'type': str,                      # 'Visa', 'Mastercard', etc.
            'balance': float,
            'limit': float,
            'utilization_pct': float,
            'minimum_payment': float,
            'last_payment_amount': float,
            'minimum_payment_only': bool,     # True if only paying minimum
            'interest_charges': float,        # Interest in last 30 days
            'apr_percentage': float,
            'is_overdue': bool
        },
        ...
    ],
    'aggregate_utilization_pct': float,       # Total balance / total limit
    'total_credit_available': float,
    'total_credit_used': float,
    'any_card_high_util': bool,               # Any card ≥50%
    'any_card_very_high_util': bool,          # Any card ≥80%
    'any_interest_charges': bool,
    'any_overdue': bool,
    'num_credit_cards': int
}
```

#### 4.3.4 Implementation

```python
# /features/credit.py

import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List

class CreditAnalyzer:
    def __init__(self, db_connection):
        self.db = db_connection

    def calculate_credit_signals(self, user_id: str) -> Dict:
        """
        Analyze credit card behavior

        Args:
            user_id: User identifier

        Returns:
            Dictionary with credit signals
        """
        # Get credit card accounts
        credit_cards = self._get_credit_cards(user_id)

        if not credit_cards:
            return self._empty_result()

        cards_data = []
        total_balance = 0
        total_limit = 0
        any_high_util = False
        any_very_high_util = False
        any_interest = False
        any_overdue = False

        for card in credit_cards:
            # Calculate utilization
            balance = card['current_balance']
            limit = card['credit_limit']
            utilization = (balance / limit * 100) if limit > 0 else 0

            # Get liability details
            liability = self._get_liability_details(card['account_id'])

            # Check for minimum payment only behavior
            min_payment_only = False
            if liability and liability['last_payment_amount']:
                min_payment_only = (
                    liability['last_payment_amount'] <
                    liability['minimum_payment_amount'] * 1.1
                )

            # Calculate interest charges in last 30 days
            interest = self._calculate_interest_charges(card['account_id'], 30)

            # Flags
            if utilization >= 50:
                any_high_util = True
            if utilization >= 80:
                any_very_high_util = True
            if interest > 0:
                any_interest = True
            if liability and liability['is_overdue']:
                any_overdue = True

            cards_data.append({
                'account_id': card['account_id'],
                'mask': card['mask'],
                'type': card['subtype'] or 'Credit Card',
                'balance': round(balance, 2),
                'limit': round(limit, 2),
                'utilization_pct': round(utilization, 2),
                'minimum_payment': round(liability['minimum_payment_amount'], 2) if liability else 0,
                'last_payment_amount': round(liability['last_payment_amount'], 2) if liability and liability['last_payment_amount'] else 0,
                'minimum_payment_only': min_payment_only,
                'interest_charges': round(interest, 2),
                'apr_percentage': round(liability['apr_percentage'], 2) if liability and liability['apr_percentage'] else 0,
                'is_overdue': liability['is_overdue'] if liability else False
            })

            total_balance += balance
            total_limit += limit

        # Aggregate utilization
        aggregate_util = (total_balance / total_limit * 100) if total_limit > 0 else 0

        return {
            'cards': cards_data,
            'aggregate_utilization_pct': round(aggregate_util, 2),
            'total_credit_available': round(total_limit - total_balance, 2),
            'total_credit_used': round(total_balance, 2),
            'any_card_high_util': any_high_util,
            'any_card_very_high_util': any_very_high_util,
            'any_interest_charges': any_interest,
            'any_overdue': any_overdue,
            'num_credit_cards': len(cards_data)
        }

    def _get_credit_cards(self, user_id: str) -> List[Dict]:
        """Fetch credit card accounts"""
        query = """
            SELECT account_id, mask, subtype, current_balance, credit_limit
            FROM accounts
            WHERE user_id = ? AND type = 'credit_card'
        """

        df = pd.read_sql_query(query, self.db, params=(user_id,))
        return df.to_dict('records')

    def _get_liability_details(self, account_id: str) -> Dict:
        """Fetch liability details for credit card"""
        query = """
            SELECT minimum_payment_amount, last_payment_amount,
                   last_payment_date, is_overdue, apr_percentage
            FROM liabilities
            WHERE account_id = ? AND type = 'credit_card'
            ORDER BY created_at DESC
            LIMIT 1
        """

        df = pd.read_sql_query(query, self.db, params=(account_id,))
        return df.to_dict('records')[0] if not df.empty else None

    def _calculate_interest_charges(self, account_id: str, days: int) -> float:
        """Calculate total interest charges in last N days"""
        cutoff_date = datetime.now() - timedelta(days=days)

        query = """
            SELECT SUM(ABS(amount)) as total_interest
            FROM transactions
            WHERE account_id = ?
              AND date >= ?
              AND category_detailed = 'INTEREST_CHARGED'
        """

        result = pd.read_sql_query(query, self.db,
                                   params=(account_id, cutoff_date.date()))
        return result['total_interest'].iloc[0] if not result.empty and result['total_interest'].iloc[0] else 0

    def _empty_result(self) -> Dict:
        """Return empty result structure"""
        return {
            'cards': [],
            'aggregate_utilization_pct': 0.0,
            'total_credit_available': 0.0,
            'total_credit_used': 0.0,
            'any_card_high_util': False,
            'any_card_very_high_util': False,
            'any_interest_charges': False,
            'any_overdue': False,
            'num_credit_cards': 0
        }
```

---

### 4.4 Income Stability

#### 4.4.1 Definition

Analyze income patterns including frequency, variability, and cash flow buffer.

#### 4.4.2 Detection Criteria

- Identify payroll deposits: ACH transfers with consistent amounts
- Calculate payment frequency from gaps between deposits
- Measure variability: Coefficient of Variation (std / mean) \* 100
- Calculate buffer: checking_balance / monthly_expenses

#### 4.4.3 Output Schema

```python
{
    'income_type': str,                       # 'payroll', 'freelance', 'mixed', 'unknown'
    'payment_frequency': str,                 # 'biweekly', 'monthly', 'weekly', 'irregular'
    'median_pay_gap_days': int,               # Median days between deposits
    'income_variability_pct': float,          # Coefficient of variation
    'cash_flow_buffer_months': float,         # Checking balance / monthly expenses
    'median_deposit_amount': float,
    'num_deposits_in_window': int,
    'recent_deposits': [
        {
            'date': str,
            'amount': float,
            'days_since_last': int
        },
        ...
    ]
}
```

#### 4.4.4 Implementation

```python
# /features/income.py

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List

class IncomeAnalyzer:
    def __init__(self, db_connection):
        self.db = db_connection

    def calculate_income_signals(self, user_id: str, window_days: int = 180) -> Dict:
        """
        Analyze income patterns

        Args:
            user_id: User identifier
            window_days: Analysis window (default 180 days)

        Returns:
            Dictionary with income signals
        """
        # Get checking account deposits (assumed to be income)
        deposits = self._get_deposits(user_id, window_days)

        if deposits.empty or len(deposits) < 2:
            return self._empty_result()

        # Sort by date
        deposits = deposits.sort_values('date')

        # Calculate gaps between deposits
        deposits['date'] = pd.to_datetime(deposits['date'])
        deposits['days_since_last'] = deposits['date'].diff().dt.days

        pay_gaps = deposits['days_since_last'].dropna()
        median_gap = pay_gaps.median()

        # Classify payment frequency
        if 12 <= median_gap <= 16:
            frequency = 'biweekly'
        elif 6 <= median_gap <= 8:
            frequency = 'weekly'
        elif 25 <= median_gap <= 35:
            frequency = 'monthly'
        else:
            frequency = 'irregular'

        # Calculate income variability (CV)
        amounts = deposits['amount']
        variability = (amounts.std() / amounts.mean() * 100) if amounts.mean() > 0 else 0

        # Classify income type
        if variability < 10 and frequency != 'irregular':
            income_type = 'payroll'
        elif variability >= 20:
            income_type = 'freelance'
        else:
            income_type = 'mixed'

        # Calculate cash flow buffer
        checking_balance = self._get_checking_balance(user_id)
        monthly_expenses = self._calculate_monthly_expenses(user_id)
        buffer_months = checking_balance / monthly_expenses if monthly_expenses > 0 else 0

        # Recent deposits
        recent = deposits.tail(5).to_dict('records')
        recent_deposits = [
            {
                'date': r['date'].isoformat(),
                'amount': round(r['amount'], 2),
                'days_since_last': int(r['days_since_last']) if not pd.isna(r['days_since_last']) else None
            }
            for r in recent
        ]

        return {
            'income_type': income_type,
            'payment_frequency': frequency,
            'median_pay_gap_days': int(median_gap),
            'income_variability_pct': round(variability, 2),
            'cash_flow_buffer_months': round(buffer_months, 2),
            'median_deposit_amount': round(amounts.median(), 2),
            'num_deposits_in_window': len(deposits),
            'recent_deposits': recent_deposits
        }

    def _get_deposits(self, user_id: str, window_days: int) -> pd.DataFrame:
        """Fetch deposit transactions from checking accounts"""
        cutoff_date = datetime.now() - timedelta(days=window_days)

        query = """
            SELECT transaction_id, date, amount
            FROM transactions
            WHERE user_id = ?
              AND amount > 0
              AND amount >= 100  -- Filter out small transfers
              AND date >= ?
              AND account_id IN (
                  SELECT account_id FROM accounts
                  WHERE user_id = ? AND type = 'checking'
              )
            ORDER BY date ASC
        """

        params = (user_id, cutoff_date.date(), user_id)
        return pd.read_sql_query(query, self.db, params=params)

    def _get_checking_balance(self, user_id: str) -> float:
        """Get current checking account balance"""
        query = """
            SELECT SUM(current_balance) as total_balance
            FROM accounts
            WHERE user_id = ? AND type = 'checking'
        """

        result = pd.read_sql_query(query, self.db, params=(user_id,))
        return result['total_balance'].iloc[0] if not result.empty else 0

    def _calculate_monthly_expenses(self, user_id: str) -> float:
        """Estimate monthly expenses from checking debits"""
        query = """
            SELECT AVG(monthly_total) as avg_expenses
            FROM (
                SELECT strftime('%Y-%m', date) as month,
                       SUM(ABS(amount)) as monthly_total
                FROM transactions
                WHERE user_id = ?
                  AND amount < 0
                  AND account_id IN (
                      SELECT account_id FROM accounts
                      WHERE user_id = ? AND type = 'checking'
                  )
                  AND date >= date('now', '-6 months')
                GROUP BY month
            )
        """

        result = pd.read_sql_query(query, self.db, params=(user_id, user_id))
        return result['avg_expenses'].iloc[0] if not result.empty and not pd.isna(result['avg_expenses'].iloc[0]) else 0

    def _empty_result(self) -> Dict:
        """Return empty result structure"""
        return {
            'income_type': 'unknown',
            'payment_frequency': 'unknown',
            'median_pay_gap_days': 0,
            'income_variability_pct': 0.0,
            'cash_flow_buffer_months': 0.0,
            'median_deposit_amount': 0.0,
            'num_deposits_in_window': 0,
            'recent_deposits': []
        }
```

---

## 5. Data Schema

### 5.1 Signal Storage Table

```sql
CREATE TABLE user_signals (
    signal_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    window_type TEXT NOT NULL,           -- '30d' or '180d'
    signal_category TEXT NOT NULL,       -- 'subscriptions', 'savings', 'credit', 'income'
    signal_data JSON NOT NULL,           -- Full signal output
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Indexes for performance
CREATE INDEX idx_user_signals_user_id ON user_signals(user_id);
CREATE INDEX idx_user_signals_category ON user_signals(signal_category);
CREATE INDEX idx_user_signals_window ON user_signals(window_type);
```

### 5.2 Signal Metadata Table

```sql
CREATE TABLE signal_metadata (
    metadata_id TEXT PRIMARY KEY,
    signal_id TEXT NOT NULL,
    calculation_time_ms INTEGER,         -- How long calculation took
    data_quality_score REAL,             -- 0-1 score (1 = perfect data)
    missing_fields JSON,                 -- List of missing data points
    error_messages JSON,                 -- Any warnings/errors
    FOREIGN KEY (signal_id) REFERENCES user_signals(signal_id)
);
```

---

## 6. API Specification

### 6.1 Generate Signals Endpoint

```python
POST /api/signals/generate

Request Body:
{
    "user_id": "user_123",
    "window_type": "30d",              # or "180d"
    "categories": ["all"]              # or ["subscriptions", "savings", "credit", "income"]
}

Response (200 OK):
{
    "user_id": "user_123",
    "window_type": "30d",
    "generated_at": "2025-11-03T10:30:00Z",
    "signals": {
        "subscriptions": { ... },
        "savings": { ... },
        "credit": { ... },
        "income": { ... }
    },
    "metadata": {
        "total_calculation_time_ms": 1847,
        "data_quality_score": 0.95,
        "warnings": []
    }
}

Response (400 Bad Request):
{
    "error": "Invalid window_type. Must be '30d' or '180d'",
    "code": "INVALID_PARAMETER"
}

Response (404 Not Found):
{
    "error": "User not found",
    "code": "USER_NOT_FOUND"
}
```

### 6.2 Get Signals Endpoint

```python
GET /api/signals/{user_id}?window_type=30d&category=all

Response (200 OK):
{
    "user_id": "user_123",
    "window_type": "30d",
    "retrieved_at": "2025-11-03T10:30:00Z",
    "signals": {
        "subscriptions": { ... },
        "savings": { ... },
        "credit": { ... },
        "income": { ... }
    },
    "last_calculated_at": "2025-11-03T10:00:00Z"
}
```

### 6.3 Batch Generate Endpoint

```python
POST /api/signals/batch

Request Body:
{
    "user_ids": ["user_123", "user_456", "user_789"],
    "window_type": "30d"
}

Response (202 Accepted):
{
    "job_id": "job_abc123",
    "status": "processing",
    "total_users": 3,
    "estimated_completion_seconds": 15
}

# Check status
GET /api/signals/batch/job_abc123

Response (200 OK):
{
    "job_id": "job_abc123",
    "status": "completed",
    "completed_users": 3,
    "failed_users": 0,
    "results": [
        {"user_id": "user_123", "status": "success"},
        {"user_id": "user_456", "status": "success"},
        {"user_id": "user_789", "status": "success"}
    ]
}
```

---

## 7. Implementation Guide

### 7.1 Feature Pipeline Orchestrator

```python
# /features/pipeline.py

from typing import Dict, List
import time
import json
import sqlite3
from datetime import datetime

class FeaturePipeline:
    def __init__(self, db_path: str = 'spendsense.db'):
        self.db = sqlite3.connect(db_path)
        self.subscription_detector = SubscriptionDetector(self.db)
        self.savings_analyzer = SavingsAnalyzer(self.db)
        self.credit_analyzer = CreditAnalyzer(self.db)
        self.income_analyzer = IncomeAnalyzer(self.db)

    def run(self, user_id: str, window_type: str = '30d',
            categories: List[str] = None) -> Dict:
        """
        Run feature pipeline for user

        Args:
            user_id: User identifier
            window_type: '30d' or '180d'
            categories: List of categories or ['all']

        Returns:
            Dictionary with all signals
        """
        if categories is None or 'all' in categories:
            categories = ['subscriptions', 'savings', 'credit', 'income']

        window_days = 30 if window_type == '30d' else 180

        start_time = time.time()
        signals = {}
        warnings = []

        # Run each detector
        if 'subscriptions' in categories:
            try:
                signals['subscriptions'] = self.subscription_detector.detect_recurring_merchants(
                    user_id, window_days
                )
            except Exception as e:
                warnings.append(f"Subscription detection failed: {str(e)}")
                signals['subscriptions'] = None

        if 'savings' in categories:
            try:
                signals['savings'] = self.savings_analyzer.calculate_savings_signals(
                    user_id, window_days
                )
            except Exception as e:
                warnings.append(f"Savings analysis failed: {str(e)}")
                signals['savings'] = None

        if 'credit' in categories:
            try:
                signals['credit'] = self.credit_analyzer.calculate_credit_signals(user_id)
            except Exception as e:
                warnings.append(f"Credit analysis failed: {str(e)}")
                signals['credit'] = None

        if 'income' in categories:
            try:
                signals['income'] = self.income_analyzer.calculate_income_signals(
                    user_id, window_days
                )
            except Exception as e:
                warnings.append(f"Income analysis failed: {str(e)}")
                signals['income'] = None

        calculation_time = (time.time() - start_time) * 1000  # Convert to ms

        # Store signals in database
        self._store_signals(user_id, window_type, signals, calculation_time, warnings)

        return {
            'user_id': user_id,
            'window_type': window_type,
            'generated_at': datetime.now().isoformat(),
            'signals': signals,
            'metadata': {
                'total_calculation_time_ms': int(calculation_time),
                'warnings': warnings,
                'data_quality_score': self._calculate_data_quality(signals)
            }
        }

    def _store_signals(self, user_id: str, window_type: str,
                       signals: Dict, calc_time: float, warnings: List[str]):
        """Store signals in database"""
        for category, signal_data in signals.items():
            if signal_data is None:
                continue

            signal_id = f"{user_id}_{category}_{window_type}_{int(time.time())}"

            # Store signal
            self.db.execute("""
                INSERT INTO user_signals (signal_id, user_id, window_type,
                                         signal_category, signal_data, detected_at)
                VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            """, (signal_id, user_id, window_type, category, json.dumps(signal_data)))

            # Store metadata
            self.db.execute("""
                INSERT INTO signal_metadata (metadata_id, signal_id,
                                            calculation_time_ms, error_messages)
                VALUES (?, ?, ?, ?)
            """, (f"meta_{signal_id}", signal_id, int(calc_time), json.dumps(warnings)))

        self.db.commit()

    def _calculate_data_quality(self, signals: Dict) -> float:
        """Calculate data quality score (0-1)"""
        total_signals = len(signals)
        valid_signals = sum(1 for s in signals.values() if s is not None)

        if total_signals == 0:
            return 0.0

        return valid_signals / total_signals

    def batch_run(self, user_ids: List[str], window_type: str = '30d') -> Dict:
        """Run pipeline for multiple users"""
        results = []

        for user_id in user_ids:
            try:
                result = self.run(user_id, window_type)
                results.append({
                    'user_id': user_id,
                    'status': 'success',
                    'signals': result['signals']
                })
            except Exception as e:
                results.append({
                    'user_id': user_id,
                    'status': 'failed',
                    'error': str(e)
                })

        return {
            'total_users': len(user_ids),
            'completed_users': sum(1 for r in results if r['status'] == 'success'),
            'failed_users': sum(1 for r in results if r['status'] == 'failed'),
            'results': results
        }
```

### 7.2 Usage Example

```python
# Example usage
from features.pipeline import FeaturePipeline

# Initialize pipeline
pipeline = FeaturePipeline('spendsense.db')

# Run for single user
result = pipeline.run('user_123', window_type='30d')

print(f"Signals generated in {result['metadata']['total_calculation_time_ms']}ms")
print(f"Data quality: {result['metadata']['data_quality_score']}")

# Access specific signals
subscriptions = result['signals']['subscriptions']
print(f"Found {subscriptions['recurring_merchant_count']} recurring merchants")

# Batch processing
user_ids = ['user_123', 'user_456', 'user_789']
batch_result = pipeline.batch_run(user_ids, window_type='30d')
print(f"Processed {batch_result['completed_users']} / {batch_result['total_users']} users")
```

---

## 8. Testing Requirements

### 8.1 Unit Tests

```python
# /tests/test_features.py

import pytest
import pandas as pd
from features.subscriptions import SubscriptionDetector
from features.savings import SavingsAnalyzer
from features.credit import CreditAnalyzer
from features.income import IncomeAnalyzer

class TestSubscriptionDetector:
    def test_detect_monthly_subscription(self, db_connection):
        """Test detection of monthly recurring subscription"""
        detector = SubscriptionDetector(db_connection)

        # Create test data: Netflix 3 times, ~30 days apart
        result = detector.detect_recurring_merchants('test_user_1', window_days=90)

        assert result['recurring_merchant_count'] == 1
        assert result['merchants'][0]['name'] == 'Netflix'
        assert result['merchants'][0]['frequency'] == 'monthly'
        assert result['monthly_recurring_spend'] == pytest.approx(15.99, rel=0.01)

    def test_no_subscriptions(self, db_connection):
        """Test user with no recurring merchants"""
        detector = SubscriptionDetector(db_connection)

        result = detector.detect_recurring_merchants('test_user_no_subs', window_days=90)

        assert result['recurring_merchant_count'] == 0
        assert result['monthly_recurring_spend'] == 0.0

    def test_weekly_subscription(self, db_connection):
        """Test detection of weekly recurring subscription"""
        detector = SubscriptionDetector(db_connection)

        result = detector.detect_recurring_merchants('test_user_weekly', window_days=90)

        weekly_sub = next(m for m in result['merchants'] if m['frequency'] == 'weekly')
        assert weekly_sub is not None
        # Monthly spend should be weekly amount * 4.33
        assert result['monthly_recurring_spend'] == pytest.approx(weekly_sub['amount'] * 4.33, rel=0.01)

class TestCreditAnalyzer:
    def test_calculate_utilization(self, db_connection):
        """Test credit utilization calculation"""
        analyzer = CreditAnalyzer(db_connection)

        result = analyzer.calculate_credit_signals('test_user_high_util')

        # User has one card: $3400 / $5000 = 68%
        assert result['aggregate_utilization_pct'] == pytest.approx(68.0, rel=0.1)
        assert result['any_card_high_util'] is True

    def test_multiple_cards(self, db_connection):
        """Test aggregate utilization with multiple cards"""
        analyzer = CreditAnalyzer(db_connection)

        result = analyzer.calculate_credit_signals('test_user_multi_cards')

        # Total: $5000 / $15000 = 33.3%
        assert result['num_credit_cards'] == 3
        assert result['aggregate_utilization_pct'] == pytest.approx(33.3, rel=0.1)

class TestSavingsAnalyzer:
    def test_savings_growth(self, db_connection):
        """Test savings growth rate calculation"""
        analyzer = SavingsAnalyzer(db_connection)

        result = analyzer.calculate_savings_signals('test_user_saver', window_days=180)

        assert result['savings_growth_rate_pct'] > 0
        assert result['net_savings_inflow'] > 0

    def test_emergency_fund_calculation(self, db_connection):
        """Test emergency fund months calculation"""
        analyzer = SavingsAnalyzer(db_connection)

        result = analyzer.calculate_savings_signals('test_user_ef', window_days=180)

        # User has $6000 savings, $2000/month expenses = 3 months
        assert result['emergency_fund_months'] == pytest.approx(3.0, rel=0.1)

class TestIncomeAnalyzer:
    def test_biweekly_income(self, db_connection):
        """Test biweekly income detection"""
        analyzer = IncomeAnalyzer(db_connection)

        result = analyzer.calculate_income_signals('test_user_biweekly', window_days=180)

        assert result['payment_frequency'] == 'biweekly'
        assert 12 <= result['median_pay_gap_days'] <= 16
        assert result['income_type'] == 'payroll'

    def test_irregular_income(self, db_connection):
        """Test irregular income detection"""
        analyzer = IncomeAnalyzer(db_connection)

        result = analyzer.calculate_income_signals('test_user_freelance', window_days=180)

        assert result['payment_frequency'] == 'irregular'
        assert result['income_variability_pct'] > 20  # High variability
        assert result['income_type'] == 'freelance'

# Fixtures
@pytest.fixture
def db_connection():
    """Create test database with sample data"""
    import sqlite3

    conn = sqlite3.connect(':memory:')

    # Create tables
    conn.execute("""
        CREATE TABLE accounts (
            account_id TEXT PRIMARY KEY,
            user_id TEXT,
            type TEXT,
            current_balance REAL,
            credit_limit REAL,
            mask TEXT,
            subtype TEXT
        )
    """)

    conn.execute("""
        CREATE TABLE transactions (
            transaction_id TEXT PRIMARY KEY,
            user_id TEXT,
            account_id TEXT,
            date TEXT,
            amount REAL,
            merchant_name TEXT,
            category_detailed TEXT
        )
    """)

    conn.execute("""
        CREATE TABLE liabilities (
            liability_id TEXT PRIMARY KEY,
            account_id TEXT,
            type TEXT,
            minimum_payment_amount REAL,
            last_payment_amount REAL,
            is_overdue INTEGER,
            apr_percentage REAL
        )
    """)

    # Insert test data
    _populate_test_data(conn)

    yield conn

    conn.close()

def _populate_test_data(conn):
    """Populate test database with sample data"""
    # Add test users, accounts, transactions, liabilities
    # (Implementation details omitted for brevity)
    pass
```

### 8.2 Integration Tests

```python
# /tests/test_integration.py

def test_full_pipeline(db_connection):
    """Test complete signal detection pipeline"""
    from features.pipeline import FeaturePipeline

    pipeline = FeaturePipeline(db_connection)

    result = pipeline.run('test_user_complete', window_type='30d')

    # All signals should be present
    assert 'subscriptions' in result['signals']
    assert 'savings' in result['signals']
    assert 'credit' in result['signals']
    assert 'income' in result['signals']

    # All should be non-null
    assert all(s is not None for s in result['signals'].values())

    # Data quality should be high
    assert result['metadata']['data_quality_score'] >= 0.9

    # Should complete quickly
    assert result['metadata']['total_calculation_time_ms'] < 2000

def test_signal_storage_and_retrieval(db_connection):
    """Test signals are correctly stored and retrieved"""
    from features.pipeline import FeaturePipeline

    pipeline = FeaturePipeline(db_connection)

    # Generate signals
    result = pipeline.run('test_user_storage', window_type='30d')

    # Verify stored in database
    cursor = db_connection.execute("""
        SELECT COUNT(*) as count
        FROM user_signals
        WHERE user_id = ? AND window_type = ?
    """, ('test_user_storage', '30d'))

    count = cursor.fetchone()[0]
    assert count == 4  # 4 signal categories
```

---

## 9. Performance Requirements

### 9.1 Latency Targets

| Operation                        | Target     | Measurement     |
| -------------------------------- | ---------- | --------------- |
| **Single user, single category** | <500ms     | 95th percentile |
| **Single user, all categories**  | <2s        | 95th percentile |
| **Batch (100 users)**            | <5 minutes | Total runtime   |

### 9.2 Optimization Strategies

1. **Database Indexes**: Ensure indexes on `user_id`, `account_id`, `date`
2. **Query Optimization**: Use efficient SQL queries with proper joins
3. **Caching**: Cache intermediate results (e.g., monthly expenses)
4. **Batch Processing**: Use vectorized operations with pandas
5. **Connection Pooling**: Reuse database connections

### 9.3 Performance Testing

```python
# /tests/test_performance.py

import time
import pytest

def test_signal_detection_latency():
    """Test signal detection completes within target latency"""
    from features.pipeline import FeaturePipeline

    pipeline = FeaturePipeline()

    # Test 50 users
    user_ids = [f'user_{i:03d}' for i in range(50)]

    latencies = []
    for user_id in user_ids:
        start = time.time()
        pipeline.run(user_id, window_type='30d')
        end = time.time()
        latencies.append(end - start)

    # 95th percentile should be under 2 seconds
    p95 = sorted(latencies)[int(len(latencies) * 0.95)]
    assert p95 < 2.0, f"95th percentile latency {p95:.2f}s exceeds 2s target"
```

---

## 10. Dependencies & Integration

### 10.1 Upstream Dependencies

**Data Foundation (PRD #1)**

- Requires: Populated `accounts`, `transactions`, `liabilities` tables
- Schema: Must match Plaid specification
- Data quality: Transactions must have valid dates, amounts, merchant names

### 10.2 Downstream Consumers

**Persona System (PRD #3)**

- Uses: All signal outputs for persona assignment
- Format: JSON signal data from `user_signals` table

**Recommendation Engine (PRD #4)**

- Uses: Signals for content matching and rationale generation
- Format: Direct API calls to signal retrieval endpoint

**Operator Dashboard (PRD #6)**

- Uses: Signals for user exploration and debugging
- Format: UI displays signal values and trends

### 10.3 Integration Points

```python
# Example: Persona System Integration
from features.pipeline import FeaturePipeline

def assign_persona(user_id: str):
    # Get signals
    pipeline = FeaturePipeline()
    signals = pipeline.run(user_id, window_type='30d')

    # Use signals for persona assignment
    if signals['signals']['credit']['aggregate_utilization_pct'] >= 50:
        return 'high_utilization'
    # ... more logic
```

---

## Appendix A: Signal Calculation Examples

### Example 1: Subscription Detection

**Input Data:**

```
Transactions:
- Netflix, $15.99, 2025-08-01
- Netflix, $15.99, 2025-09-01
- Netflix, $15.99, 2025-10-01
- Spotify, $10.99, 2025-08-05
- Spotify, $10.99, 2025-09-05
- Spotify, $10.99, 2025-10-05
```

**Calculation:**

1. Group by merchant: Netflix (3), Spotify (3)
2. Calculate gaps: Both ~30 days → monthly
3. Check variance: Netflix all $15.99 (0% variance) ✓
4. Monthly spend: $15.99 + $10.99 = $26.98

**Output:**

```json
{
  "recurring_merchant_count": 2,
  "monthly_recurring_spend": 26.98,
  "subscription_share_pct": 12.3,
  "merchants": [
    { "name": "Netflix", "amount": 15.99, "frequency": "monthly" },
    { "name": "Spotify", "amount": 10.99, "frequency": "monthly" }
  ]
}
```

### Example 2: Credit Utilization

**Input Data:**

```
Card 1: Balance $3,400, Limit $5,000
Card 2: Balance $1,200, Limit $10,000
```

**Calculation:**

1. Card 1 utilization: $3,400 / $5,000 = 68%
2. Card 2 utilization: $1,200 / $10,000 = 12%
3. Aggregate: ($3,400 + $1,200) / ($5,000 + $10,000) = $4,600 / $15,000 = 30.7%

**Output:**

```json
{
    "cards": [
        {"account_id": "acc_1", "utilization_pct": 68.0, ...},
        {"account_id": "acc_2", "utilization_pct": 12.0, ...}
    ],
    "aggregate_utilization_pct": 30.7,
    "any_card_high_util": true
}
```

---

## Appendix B: Error Handling

### Common Errors and Handling

| Error Condition                 | Handling Strategy                           |
| ------------------------------- | ------------------------------------------- |
| **No transactions found**       | Return empty signal structure with 0 values |
| **Missing account data**        | Skip that account, log warning              |
| **Invalid date format**         | Skip transaction, log warning               |
| **Negative credit limit**       | Set utilization to 0, log error             |
| **Division by zero**            | Return 0 for calculated percentages         |
| **Database connection failure** | Raise exception, retry once                 |

### Example Error Handling

```python
def calculate_signals_with_error_handling(self, user_id: str) -> Dict:
    """Calculate signals with comprehensive error handling"""
    try:
        signals = self.run(user_id)
        return signals
    except sqlite3.OperationalError as e:
        # Database error - retry once
        time.sleep(1)
        signals = self.run(user_id)
        return signals
    except ValueError as e:
        # Data validation error
        return {
            'error': str(e),
            'signals': None,
            'data_quality_score': 0.0
        }
    except Exception as e:
        # Unexpected error
        logging.error(f"Signal detection failed for {user_id}: {str(e)}")
        raise
```

---

## Appendix C: Validation Checklist

### Pre-Deployment Validation

- [ ] All 4 signal categories implemented and tested
- [ ] Unit tests passing (100% pass rate)
- [ ] Integration tests passing
- [ ] Performance tests meeting targets (<2s latency)
- [ ] Database schema created with proper indexes
- [ ] API endpoints tested with Postman/curl
- [ ] Error handling validated with edge cases
- [ ] Documentation complete and accurate
- [ ] Code reviewed by peer
- [ ] Demo prepared showing all signal types

### Post-Deployment Validation

- [ ] Run pipeline on all 100 synthetic users
- [ ] Verify ≥90% have 3+ detected behaviors
- [ ] Check signal data quality scores (target >0.9)
- [ ] Review any warnings/errors in logs
- [ ] Validate stored signals in database
- [ ] Test retrieval API with sample queries

---

**End of Behavioral Signals PRD**
