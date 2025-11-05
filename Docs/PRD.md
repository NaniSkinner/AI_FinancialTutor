# SpendSense Product Requirements Document

## From Plaid to Personalized Learning - Explainable AI for Financial Education

**Version:** 1.0  
**Date:** November 3, 2025  
**Project Type:** Individual/Small Team - Platinum Project  
**Contact:** Bryce Harris - bharris@peak6.com

---

## Executive Summary

### Vision Statement

SpendSense is a prototype for an **Ethically-Grounded, Explainable AI System for Financial Education** that transforms transaction data into actionable learning opportunities without crossing into regulated financial advice. Unlike commercial platforms like Origin (SEC-regulated CFP-level advisor) and traditional PFM apps, SpendSense focuses exclusively on **education over advice** with transparent explainability, ethical guardrails, and human oversight.

### Core Innovation

The project's unique value proposition lies in three pillars:

1. **Explainability**: Every recommendation includes plain-language rationales citing specific data points
2. **Ethical Guardrails**: Consent management, tone enforcement, eligibility filtering built into the core architecture
3. **Auditability**: Operator oversight with decision traces for every recommendation

### Differentiation from Origin Financial

| Dimension           | Origin                                          | SpendSense                                 |
| ------------------- | ----------------------------------------------- | ------------------------------------------ |
| **Purpose**         | SEC-regulated financial advice                  | Educational content only                   |
| **Guidance Type**   | "You should do X" (prescriptive)                | "Here's how X works" (informative)         |
| **Regulatory**      | CFP-level, fiduciary duty                       | No financial advice, disclaimers           |
| **Price**           | $99/year subscription                           | Prototype/institutional tool               |
| **AI Architecture** | Multi-agent LLM ensemble, 138 compliance checks | Hybrid templates + LLM, operator oversight |
| **Target User**     | Consumers seeking advice                        | Users seeking financial literacy           |

### Example: Advice vs. Education

❌ **Advice (Not SpendSense)**: "You should transfer your balance to this card with 0% APR"  
✅ **Education (SpendSense)**: "Your Visa ending in 4523 is at 68% utilization ($3,400 of $5,000). High utilization can impact credit scores. If made at home, your 14 matcha lattes this month ($98) could save $73."

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Data Architecture](#2-data-architecture)
3. [Behavioral Signal Detection](#3-behavioral-signal-detection)
4. [Persona System](#4-persona-system)
5. [AI Integration Strategy](#5-ai-integration-strategy)
6. [Recommendation Engine](#6-recommendation-engine)
7. [Guardrails & Compliance](#7-guardrails--compliance)
8. [Operator View](#8-operator-view)
9. [User Experience](#9-user-experience)
10. [Technical Architecture](#10-technical-architecture)
11. [Evaluation & Metrics](#11-evaluation--metrics)
12. [Implementation Roadmap](#12-implementation-roadmap)
13. [Risk Mitigation](#13-risk-mitigation)

---

## 1. Project Overview

### 1.1 Deliverables

- ✅ Synthetic Plaid-style data generator (50-100 users)
- ✅ Feature pipeline detecting subscriptions, savings, credit, income patterns
- ✅ Persona assignment system (5 personas)
- ✅ Recommendation engine with plain-language rationales
- ✅ Consent and eligibility guardrails
- ✅ Operator view for oversight
- ✅ Evaluation harness with metrics

### 1.2 Target Users

#### Primary User Persona: "Financial Learner"

- **Demographics**: Mixed age groups (18-55), diverse income levels ($20K-$200K)
- **Financial Literacy**: Basic knowledge, seeking to improve
- **Motivation**: Want to understand their money habits and learn financial concepts
- **Behavior**: Downloaded app to gain financial insights, open to learning
- **Pain Points**: Confused by jargon, overwhelmed by generic advice, want personalized explanations

#### Secondary User: "Compliance Operator"

- **Role**: Oversees AI recommendations for quality and compliance
- **Goals**: Ensure no harmful advice, maintain brand tone, catch edge cases
- **Tools Needed**: Dashboard to review signals, approve/override recommendations, trace decisions

### 1.3 Core Principles

1. **Transparency over sophistication**: Clear logic > black box AI
2. **User control over automation**: Explicit consent, easy revocation
3. **Education over sales**: Learning-first, not product-pushing
4. **Fairness built in from day one**: Bias testing, inclusive personas

---

## 2. Data Architecture

### 2.1 Synthetic Data Generation Strategy

#### 2.1.1 Data Sources (Kaggle Datasets)

**Primary Datasets:**

1. **Credit Card Transactions Dataset**
   - Source: Kaggle `credit-card-transactions` (anonymized real-world patterns)
   - Use: Transaction amounts, merchant categories, spending patterns
2. **PaySim Mobile Money Simulator**

   - Source: Kaggle `paysim1` (synthetic mobile transactions)
   - Use: Transfer patterns, cash flow behaviors, fraud examples (for contrast)

3. **Financial Inclusion Dataset**
   - Source: Kaggle `financial-inclusion` (demographic variations)
   - Use: Income levels, account types, demographics

**Extension Strategy:**

- Merge datasets to create composite users
- Calibrate distributions using academic research (JP Morgan synthetic data papers)
- Add realistic noise and seasonal patterns

#### 2.1.2 Synthetic User Profiles (50-100 Users)

**Income Distribution:**

- 20% Low income: $20K-$35K (students, part-time, entry-level)
- 40% Middle income: $35K-$75K (median US household)
- 30% Upper-middle: $75K-$150K (professionals, dual income)
- 10% High income: $150K-$250K (senior roles)

**Demographics (for fairness testing):**

- Age ranges: 18-25 (20%), 26-35 (30%), 36-50 (35%), 51+ (15%)
- Geographic variance: Urban (50%), Suburban (30%), Rural (20%)
- Life stages: Students (15%), Young professionals (25%), Families (35%), Pre-retirement (25%)

**Financial Situations:**

- Credit scores: 300-850 spectrum (normal distribution, mean ~680)
- Account types: Checking (100%), Savings (70%), Credit cards (80%), Student loans (30%), Mortgages (25%)
- Behaviors: High utilization (25%), Variable income (20%), Subscription-heavy (30%), Savings builders (15%), Students (10%)

#### 2.1.3 Realistic Pattern Modeling

**Seasonal Patterns:**

- Holiday spending spikes (November-December)
- Tax refunds (February-April)
- Back-to-school (August-September)

**Life Events:**

- Job changes (income jumps/drops)
- Medical emergencies (large unexpected expenses)
- Moving (rent deposits, utility setup)

**Geographic Variance:**

- NYC: Higher rent ($2K-$4K), more delivery services
- Rural: Lower cost of living, more car expenses
- Suburban: Mortgage payments, family expenses

### 2.2 Plaid-Style Data Schema

#### 2.2.1 Accounts Table

```sql
CREATE TABLE accounts (
    account_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL, -- checking, savings, credit_card, student_loan, mortgage
    subtype TEXT,
    name TEXT,
    official_name TEXT,
    mask TEXT, -- last 4 digits
    available_balance DECIMAL(12,2),
    current_balance DECIMAL(12,2),
    credit_limit DECIMAL(12,2),
    iso_currency_code TEXT DEFAULT 'USD',
    holder_category TEXT DEFAULT 'personal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2.2.2 Transactions Table

```sql
CREATE TABLE transactions (
    transaction_id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL, -- negative = debit, positive = credit
    merchant_name TEXT,
    merchant_entity_id TEXT,
    payment_channel TEXT, -- online, in_store, other
    category_primary TEXT, -- FOOD_AND_DRINK, TRANSPORTATION, etc.
    category_detailed TEXT, -- RESTAURANTS, COFFEE_SHOPS, etc.
    pending BOOLEAN DEFAULT FALSE,
    location_city TEXT,
    location_region TEXT,
    location_postal_code TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id)
);
```

#### 2.2.3 Liabilities Table

```sql
CREATE TABLE liabilities (
    liability_id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL, -- credit_card, student_loan, mortgage
    apr_percentage DECIMAL(5,2),
    apr_type TEXT, -- purchase_apr, balance_transfer_apr, etc.
    minimum_payment_amount DECIMAL(10,2),
    last_payment_amount DECIMAL(10,2),
    last_payment_date DATE,
    next_payment_due_date DATE,
    last_statement_balance DECIMAL(10,2),
    is_overdue BOOLEAN DEFAULT FALSE,
    interest_rate DECIMAL(5,2), -- for mortgages/loans
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id)
);
```

#### 2.2.4 Data Generation Script Structure

```python
# /ingest/data_generator.py

import pandas as pd
from faker import Faker
from datetime import datetime, timedelta
import random

class SyntheticDataGenerator:
    def __init__(self, num_users=100, seed=42):
        random.seed(seed)
        self.fake = Faker()
        Faker.seed(seed)
        self.num_users = num_users

    def generate_users(self):
        """Create diverse user profiles"""
        pass

    def generate_accounts(self, user_id, income_level):
        """Generate accounts based on income and life stage"""
        pass

    def generate_transactions(self, account_id, account_type, months=6):
        """Generate realistic transaction patterns"""
        pass

    def generate_liabilities(self, account_id):
        """Generate credit card/loan details"""
        pass

    def export_to_csv(self, output_dir):
        """Export to CSV for ingestion"""
        pass
```

### 2.3 Data Ingestion Module

#### 2.3.1 CSV/JSON Loader

```python
# /ingest/loader.py

class DataLoader:
    def __init__(self, db_path='spendsense.db'):
        self.db = sqlite3.connect(db_path)

    def load_accounts(self, csv_path):
        """Load accounts from CSV"""
        df = pd.read_csv(csv_path)
        df.to_sql('accounts', self.db, if_exists='append', index=False)

    def load_transactions(self, csv_path):
        """Load transactions with validation"""
        df = pd.read_csv(csv_path)
        # Validate schema
        self._validate_transactions(df)
        df.to_sql('transactions', self.db, if_exists='append', index=False)

    def _validate_transactions(self, df):
        """Ensure required fields present"""
        required = ['transaction_id', 'account_id', 'date', 'amount']
        missing = set(required) - set(df.columns)
        if missing:
            raise ValueError(f"Missing required fields: {missing}")
```

---

## 3. Behavioral Signal Detection

### 3.1 Time Windows

- **Short-term**: 30-day rolling window (recent behavior)
- **Long-term**: 180-day rolling window (trends and patterns)

### 3.2 Signal Categories

#### 3.2.1 Subscription Detection

```python
# /features/subscriptions.py

class SubscriptionDetector:
    def detect_recurring_merchants(self, user_id, window_days=90):
        """
        Identify recurring merchants with monthly/weekly cadence

        Criteria:
        - Same merchant appears ≥3 times in 90 days
        - Amounts within 10% variance (allows for price changes)
        - Frequency: 25-35 days (monthly) or 6-8 days (weekly)

        Returns:
        - List of recurring merchants
        - Total monthly recurring spend
        - Subscription share of total spend (%)
        """
        pass

    def calculate_subscription_signals(self, user_id, window_days=30):
        """
        Returns:
        {
            'recurring_merchant_count': 5,
            'monthly_recurring_spend': 127.50,
            'subscription_share_pct': 12.3,
            'merchants': [
                {'name': 'Netflix', 'amount': 15.99, 'frequency': 'monthly'},
                {'name': 'Spotify', 'amount': 10.99, 'frequency': 'monthly'},
                ...
            ]
        }
        """
        pass
```

#### 3.2.2 Savings Analysis

```python
# /features/savings.py

class SavingsAnalyzer:
    def calculate_savings_signals(self, user_id, window_days=180):
        """
        Analyze savings behavior

        Signals:
        - Net inflow to savings-like accounts (savings, money market, HSA)
        - Growth rate (%)
        - Emergency fund coverage (months)

        Returns:
        {
            'net_savings_inflow': 450.00,  # per month average
            'savings_growth_rate_pct': 3.2,
            'emergency_fund_months': 2.1,
            'total_savings_balance': 5250.00
        }
        """
        # Get savings account transactions
        savings_accounts = self._get_savings_accounts(user_id)

        # Calculate net inflow (deposits - withdrawals)
        net_inflow = self._calculate_net_inflow(savings_accounts, window_days)

        # Calculate growth rate
        start_balance = self._get_balance_at_date(savings_accounts, window_days)
        current_balance = self._get_current_balance(savings_accounts)
        growth_rate = ((current_balance - start_balance) / start_balance) * 100

        # Calculate emergency fund coverage
        monthly_expenses = self._calculate_monthly_expenses(user_id)
        emergency_fund_months = current_balance / monthly_expenses if monthly_expenses > 0 else 0

        return {
            'net_savings_inflow': net_inflow / (window_days / 30),
            'savings_growth_rate_pct': growth_rate,
            'emergency_fund_months': emergency_fund_months,
            'total_savings_balance': current_balance
        }
```

#### 3.2.3 Credit Utilization

```python
# /features/credit.py

class CreditAnalyzer:
    def calculate_credit_signals(self, user_id):
        """
        Analyze credit card behavior

        Signals:
        - Utilization per card and aggregate
        - Flags for high utilization (≥30%, ≥50%, ≥80%)
        - Minimum-payment-only detection
        - Interest charges presence
        - Overdue status

        Returns:
        {
            'cards': [
                {
                    'account_id': 'acc_123',
                    'mask': '4523',
                    'type': 'Visa',
                    'balance': 3400,
                    'limit': 5000,
                    'utilization_pct': 68,
                    'minimum_payment_only': True,
                    'interest_charges': 87.50,
                    'is_overdue': False
                },
                ...
            ],
            'aggregate_utilization_pct': 45,
            'any_card_high_util': True,  # ≥50%
            'any_interest_charges': True,
            'any_overdue': False
        }
        """
        pass
```

#### 3.2.4 Income Stability

```python
# /features/income.py

class IncomeAnalyzer:
    def calculate_income_signals(self, user_id, window_days=180):
        """
        Analyze income patterns

        Signals:
        - Payroll ACH detection
        - Payment frequency (biweekly, monthly, irregular)
        - Income variability (coefficient of variation)
        - Cash-flow buffer (months)

        Returns:
        {
            'income_type': 'payroll',  # payroll, freelance, mixed
            'payment_frequency': 'biweekly',
            'median_pay_gap_days': 14,
            'income_variability_pct': 5.2,
            'cash_flow_buffer_months': 0.8,
            'recent_deposits': [...]
        }
        """
        # Detect payroll ACH (regular deposits, similar amounts)
        deposits = self._get_deposits(user_id, window_days)

        # Calculate gaps between deposits
        pay_gaps = self._calculate_pay_gaps(deposits)
        median_gap = np.median(pay_gaps)

        # Classify frequency
        if 12 <= median_gap <= 16:
            frequency = 'biweekly'
        elif 25 <= median_gap <= 35:
            frequency = 'monthly'
        else:
            frequency = 'irregular'

        # Calculate variability (CV = std / mean)
        amounts = [d['amount'] for d in deposits]
        variability = (np.std(amounts) / np.mean(amounts)) * 100

        # Cash flow buffer
        checking_balance = self._get_checking_balance(user_id)
        monthly_expenses = self._calculate_monthly_expenses(user_id)
        buffer_months = checking_balance / monthly_expenses if monthly_expenses > 0 else 0

        return {
            'income_type': self._classify_income_type(deposits),
            'payment_frequency': frequency,
            'median_pay_gap_days': median_gap,
            'income_variability_pct': variability,
            'cash_flow_buffer_months': buffer_months
        }
```

### 3.3 Signal Storage Schema

```sql
CREATE TABLE user_signals (
    signal_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    window_type TEXT NOT NULL, -- '30d' or '180d'
    signal_category TEXT NOT NULL, -- 'subscriptions', 'savings', 'credit', 'income'
    signal_data JSON NOT NULL, -- Full signal output
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

---

## 4. Persona System

### 4.1 Persona Definitions

#### Persona 1: High Utilization

**Criteria (ANY of the following):**

- Any card utilization ≥50%
- Interest charges > $0
- Minimum-payment-only behavior detected
- Any card is_overdue = TRUE

**Primary Focus:**

- Reduce utilization and interest charges
- Payment planning strategies
- Autopay education
- Debt paydown methods (avalanche vs. snowball)

**Educational Topics:**

- "Understanding Credit Utilization and Credit Scores"
- "How Interest Compounds on Credit Cards"
- "Payment Strategies: More Than the Minimum"
- "Setting Up Autopay to Avoid Late Fees"

#### Persona 2: Variable Income Budgeter

**Criteria (ALL of the following):**

- Median pay gap >45 days
- Cash-flow buffer <1 month

**Primary Focus:**

- Percent-based budgets (not fixed dollar amounts)
- Emergency fund basics
- Income smoothing strategies
- Multiple income stream management

**Educational Topics:**

- "Budgeting with Irregular Income"
- "Building an Emergency Fund on Variable Income"
- "The 50/30/20 Rule Adapted for Freelancers"
- "Cash Flow Forecasting for Gig Workers"

#### Persona 3: Subscription-Heavy

**Criteria (ALL of the following):**

- Recurring merchants ≥3
- AND (monthly recurring spend ≥$50 in 30d OR subscription spend share ≥10%)

**Primary Focus:**

- Subscription audit
- Cancellation/negotiation tips
- Bill alerts and tracking
- Value assessment of recurring services

**Educational Topics:**

- "The True Cost of Subscriptions"
- "How to Audit Your Recurring Expenses"
- "Negotiating Lower Rates on Services"
- "Subscription Management Tools and Strategies"

#### Persona 4: Savings Builder

**Criteria (ALL of the following):**

- Savings growth rate ≥2% over window OR net savings inflow ≥$200/month
- AND all card utilizations <30%

**Primary Focus:**

- Goal setting and tracking
- Automation strategies
- APY optimization (HYSA, CDs)
- Investment readiness education

**Educational Topics:**

- "Setting SMART Financial Goals"
- "Automate Your Savings: Set It and Forget It"
- "High-Yield Savings Accounts Explained"
- "When Are You Ready to Start Investing?"

#### Persona 5: Student (NEW)

**Criteria (ANY of the following major + supporting):**

**Major Criteria (need 1):**

- Student loan account present
- Age 18-25 (in synthetic data metadata)
- Low transaction volume (<50 transactions/month) + high percentage on food/essentials (>40%)

**Supporting Criteria (strengthen match):**

- Income <$30K annually OR irregular income (internships, part-time)
- High coffee shop / food delivery spend (≥$75/month)
- Rent payments detected but no mortgage
- Limited credit history (only 1-2 credit accounts)

**Primary Focus:**

- Student budget basics (ramen-to-retirement planning)
- Student loan literacy (interest, repayment options)
- Building credit as a student
- Avoiding common student money mistakes
- Coffee/food delivery optimization

**Educational Topics:**

- "Student Budgeting 101: Making Your Money Last"
- "Understanding Your Student Loans"
- "Building Credit in College"
- "The $5 Coffee Habit: A Real Cost Analysis"
- "Part-Time Income Management for Students"

**Rationale:**
Students face unique financial challenges - limited income, student loans, building credit from scratch, and high susceptibility to lifestyle spending (delivery apps, coffee shops). This persona addresses a life stage with critical financial education needs.

### 4.2 Persona Assignment Logic

#### 4.2.1 Assignment Algorithm

```python
# /personas/assignment.py

class PersonaAssigner:
    def assign_personas(self, user_id, window_type='30d'):
        """
        Assign persona(s) to user based on signals

        Priority Order (if multiple match):
        1. High Utilization (financial risk)
        2. Variable Income Budgeter (stability risk)
        3. Student (life stage specific)
        4. Subscription-Heavy (behavioral improvement)
        5. Savings Builder (positive reinforcement)

        Returns:
        {
            'primary_persona': 'high_utilization',
            'secondary_personas': ['subscription_heavy'],
            'criteria_met': {
                'high_utilization': {
                    'utilization_over_50': True,
                    'interest_charges': 87.50,
                    'match_strength': 'strong'
                }
            },
            'assigned_at': '2025-11-03T10:30:00Z'
        }
        """
        signals = self._load_signals(user_id, window_type)

        matches = []

        # Check each persona
        if self._check_high_utilization(signals):
            matches.append(('high_utilization', self._get_match_strength(signals, 'high_utilization')))

        if self._check_variable_income(signals):
            matches.append(('variable_income_budgeter', self._get_match_strength(signals, 'variable_income')))

        if self._check_student(signals):
            matches.append(('student', self._get_match_strength(signals, 'student')))

        if self._check_subscription_heavy(signals):
            matches.append(('subscription_heavy', self._get_match_strength(signals, 'subscription')))

        if self._check_savings_builder(signals):
            matches.append(('savings_builder', self._get_match_strength(signals, 'savings')))

        # Sort by priority
        priority = ['high_utilization', 'variable_income_budgeter', 'student', 'subscription_heavy', 'savings_builder']
        sorted_matches = sorted(matches, key=lambda x: priority.index(x[0]))

        return {
            'primary_persona': sorted_matches[0][0] if sorted_matches else 'none',
            'secondary_personas': [m[0] for m in sorted_matches[1:3]],  # Up to 2 secondary
            'criteria_met': self._get_criteria_details(signals, sorted_matches),
            'assigned_at': datetime.now().isoformat()
        }

    def _check_student(self, signals):
        """Check if student persona criteria met"""
        # Major criteria
        has_student_loan = signals.get('student_loan_account_present', False)
        age_18_25 = signals.get('user_metadata', {}).get('age_bracket') == '18-25'

        # Supporting criteria
        low_transactions = signals.get('transaction_count_monthly', 0) < 50
        high_essentials = signals.get('essentials_pct', 0) > 40
        low_income = signals.get('annual_income', 0) < 30000
        high_coffee = signals.get('coffee_food_delivery_monthly', 0) >= 75

        # Need at least 1 major + 2 supporting
        major_match = has_student_loan or age_18_25
        supporting_count = sum([low_transactions and high_essentials, low_income, high_coffee])

        return major_match and supporting_count >= 2
```

#### 4.2.2 Persona Storage Schema

```sql
CREATE TABLE user_personas (
    assignment_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    window_type TEXT NOT NULL, -- '30d' or '180d'
    primary_persona TEXT NOT NULL,
    secondary_personas JSON, -- Array of secondary personas
    criteria_met JSON NOT NULL, -- Detailed criteria breakdown
    match_strength TEXT, -- 'strong', 'moderate', 'weak'
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

### 4.3 Persona Transition Handling

#### 4.3.1 Transition Detection

```python
# /personas/transitions.py

class PersonaTransitionTracker:
    def detect_transition(self, user_id):
        """
        Detect if user has transitioned between personas

        Returns:
        {
            'transition_detected': True,
            'from_persona': 'high_utilization',
            'to_persona': 'savings_builder',
            'transition_date': '2025-11-03',
            'celebration_message': True,
            'milestone_achieved': 'credit_health_improved'
        }
        """
        # Get last 2 persona assignments
        current = self._get_latest_persona(user_id, '30d')
        previous = self._get_previous_persona(user_id, '30d')

        if current['primary_persona'] != previous['primary_persona']:
            return self._create_celebration(previous, current)

        return {'transition_detected': False}

    def _create_celebration(self, from_persona, to_persona):
        """Generate celebration message for positive transitions"""
        positive_transitions = {
            ('high_utilization', 'savings_builder'): {
                'message': "🎉 Congratulations! You've improved your credit health and started building savings!",
                'milestone': 'credit_to_savings'
            },
            ('variable_income_budgeter', 'savings_builder'): {
                'message': "🎉 Great progress! Your income has stabilized and you're building savings!",
                'milestone': 'stability_achieved'
            },
            ('student', 'savings_builder'): {
                'message': "🎉 You're making smart money moves! Keep building those savings!",
                'milestone': 'student_graduate'
            }
        }

        key = (from_persona['primary_persona'], to_persona['primary_persona'])
        if key in positive_transitions:
            return {
                'transition_detected': True,
                'from_persona': from_persona['primary_persona'],
                'to_persona': to_persona['primary_persona'],
                'celebration_message': positive_transitions[key]['message'],
                'milestone_achieved': positive_transitions[key]['milestone'],
                'transition_date': datetime.now().date().isoformat()
            }

        return {'transition_detected': True, 'celebration_message': None}
```

---

## 5. AI Integration Strategy

### 5.1 Hybrid Architecture: Static + LLM

#### 5.1.1 Content Library Structure

```
/content
├── /library                  (Static, pre-built content)
│   ├── /articles            (Markdown educational content)
│   │   ├── credit_utilization_101.md
│   │   ├── variable_income_budgeting.md
│   │   ├── subscription_audit_guide.md
│   │   ├── student_budget_basics.md
│   │   └── ...
│   ├── /calculators         (React components)
│   │   ├── EmergencyFundCalculator.jsx
│   │   ├── DebtPayoffCalculator.jsx
│   │   └── ...
│   ├── /infographics        (PNG/SVG assets)
│   │   ├── credit_score_factors.png
│   │   ├── budget_50_30_20.svg
│   │   └── ...
│   └── /videos              (YouTube links or hosted)
│       ├── understanding_apr.json
│       └── ...
│
├── /templates               (LLM prompt templates)
│   ├── rationale_templates.json
│   ├── celebration_templates.json
│   └── explanation_templates.json
│
└── content_catalog.json     (Metadata index)
```

#### 5.1.2 Content Catalog Schema

```json
{
  "articles": [
    {
      "id": "credit_util_101",
      "title": "Understanding Credit Utilization",
      "file": "articles/credit_utilization_101.md",
      "personas": ["high_utilization"],
      "difficulty": "beginner",
      "read_time_minutes": 3,
      "tags": ["credit", "credit_score", "utilization"],
      "triggers": [
        { "signal": "utilization_over_30", "priority": "medium" },
        { "signal": "utilization_over_50", "priority": "high" }
      ]
    },
    {
      "id": "student_budget",
      "title": "Student Budgeting 101: Making Your Money Last",
      "file": "articles/student_budget_basics.md",
      "personas": ["student"],
      "difficulty": "beginner",
      "read_time_minutes": 5,
      "tags": ["budgeting", "student", "essentials"],
      "triggers": [
        { "signal": "student_persona_assigned", "priority": "high" },
        { "signal": "high_food_delivery_spend", "priority": "medium" }
      ]
    }
  ],
  "calculators": [
    {
      "id": "emergency_fund_calc",
      "title": "Emergency Fund Calculator",
      "component": "calculators/EmergencyFundCalculator.jsx",
      "personas": ["variable_income_budgeter", "savings_builder", "student"],
      "difficulty": "intermediate",
      "tags": ["savings", "emergency_fund", "planning"]
    }
  ]
}
```

### 5.2 LLM Integration Points

#### 5.2.1 Rationale Generation (Primary LLM Use)

```python
# /recommend/llm_rationale.py

import openai

class RationaleGenerator:
    def __init__(self, model="gpt-4"):
        self.model = model
        self.client = openai.OpenAI()

    def generate_rationale(self, user_data, content_item, persona):
        """
        Generate personalized "because" statement

        Input:
        - user_data: {card_type, last4, utilization, balance, limit, ...}
        - content_item: {title, description, ...}
        - persona: 'high_utilization'

        Output:
        "We noticed your Visa ending in 4523 is at 68% utilization
        ($3,400 of $5,000 limit). Bringing this below 30% could improve
        your credit score and reduce interest charges of $87/month."
        """

        # Load template
        template = self._load_template(persona, 'rationale')

        # Fill with user data
        filled = template.format(**user_data)

        # Polish with LLM
        system_prompt = """You are a financial educator. Your job is to explain
        financial concepts in a friendly, encouraging way WITHOUT giving advice.

        RULES:
        - Educational tone, not prescriptive
        - No shaming language (avoid "overspending", "wasteful")
        - Use "could" not "should"
        - Cite specific numbers
        - Maximum 3 sentences
        - Include "because" explanation

        Example:
        BAD: "You're overspending on subscriptions. You should cancel some."
        GOOD: "Your 5 subscriptions total $127/month (12% of spending). Many people
        find value in reviewing subscriptions every few months to ensure they're
        still being used."
        """

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Polish this rationale for clarity and tone:\n{filled}"}
            ],
            temperature=0.7,
            max_tokens=150
        )

        return response.choices[0].message.content

    def _load_template(self, persona, template_type):
        """Load appropriate template"""
        templates = {
            'high_utilization': {
                'rationale': "Your {card_type} ending in {last4} is at {utilization}% utilization (${balance} of ${limit} limit)."
            },
            'student': {
                'rationale': "Your coffee and food delivery spending totals ${coffee_spend} this month."
            }
        }
        return templates.get(persona, {}).get(template_type, "")
```

#### 5.2.2 Content Matching (Semantic Search)

```python
# /recommend/content_matcher.py

from sentence_transformers import SentenceTransformer
import numpy as np

class ContentMatcher:
    def __init__(self, catalog_path='content/content_catalog.json'):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.catalog = self._load_catalog(catalog_path)
        self.content_embeddings = self._embed_catalog()

    def find_best_content(self, user_signals, persona, top_k=3):
        """
        Use semantic similarity to match user behavior to content

        Input:
        - user_signals: Detected behavioral signals
        - persona: Primary persona
        - top_k: Number of content items to return

        Output:
        [
            {'id': 'credit_util_101', 'title': '...', 'relevance_score': 0.92},
            ...
        ]
        """
        # Create query from signals
        query = self._signals_to_text(user_signals, persona)

        # Embed query
        query_embedding = self.model.encode(query)

        # Calculate cosine similarity
        similarities = np.dot(self.content_embeddings, query_embedding)

        # Get top-k
        top_indices = np.argsort(similarities)[-top_k:][::-1]

        # Filter by persona
        persona_filtered = [
            idx for idx in top_indices
            if persona in self.catalog[idx]['personas']
        ]

        return [
            {
                **self.catalog[persona_filtered[i]],
                'relevance_score': similarities[persona_filtered[i]]
            }
            for i in range(min(top_k, len(persona_filtered)))
        ]

    def _signals_to_text(self, signals, persona):
        """Convert signals to natural language query"""
        texts = {
            'high_utilization': f"Credit card utilization {signals['credit']['aggregate_utilization_pct']}%, interest charges ${signals['credit']['any_interest_charges']}",
            'student': f"Student with low income, high food delivery spending ${signals['subscriptions'].get('coffee_food_delivery', 0)}"
        }
        return texts.get(persona, "")
```

#### 5.2.3 Chat Q&A Interface

```python
# /ui/chat_handler.py

class ChatHandler:
    def __init__(self):
        self.client = openai.OpenAI()
        self.conversation_history = {}

    def handle_question(self, user_id, question):
        """
        Handle follow-up questions about recommendations

        Input: "Why does high utilization hurt my credit score?"

        Output: Educational answer grounded in their data
        """
        # Get user context
        user_data = self._load_user_data(user_id)
        recent_recommendations = self._get_recent_recommendations(user_id)

        # Build context
        context = f"""User Data:
        - Primary Persona: {user_data['persona']}
        - Credit Utilization: {user_data['utilization']}%
        - Recent Recommendations: {recent_recommendations}

        User Question: {question}
        """

        system_prompt = """You are a financial education assistant. Answer questions
        based on the user's actual financial data. Provide educational explanations
        WITHOUT giving advice.

        RULES:
        - Cite their specific numbers
        - Explain concepts clearly (no jargon)
        - Educational, not prescriptive
        - Maximum 4 sentences
        - Include disclaimer: "This is educational information, not financial advice."
        """

        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": context}
            ],
            temperature=0.7
        )

        return response.choices[0].message.content
```

### 5.3 LLM Guardrails

#### 5.3.1 Tone Enforcement

```python
# /guardrails/tone_checker.py

class ToneChecker:
    def __init__(self):
        self.blocklist = [
            'overspending', 'wasteful', 'irresponsible', 'bad habit',
            'foolish', 'stupid', 'dumb', 'careless', 'reckless'
        ]

    def check_tone(self, text):
        """
        Validate text meets tone requirements

        Returns:
        {
            'passes': True/False,
            'violations': [...],
            'severity': 'none'/'warning'/'critical'
        }
        """
        violations = []

        # Check blocklist
        for word in self.blocklist:
            if word.lower() in text.lower():
                violations.append(f"Blocklisted word: '{word}'")

        # Check for shaming patterns (LLM-based)
        if self._llm_tone_check(text):
            violations.append("Shaming language detected by LLM")

        return {
            'passes': len(violations) == 0,
            'violations': violations,
            'severity': 'critical' if violations else 'none'
        }

    def _llm_tone_check(self, text):
        """Use LLM to detect subtle shaming"""
        prompt = f"""Does this text contain any shaming, judgmental, or
        negative language toward financial behavior? Answer only YES or NO.

        Text: {text}
        """

        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )

        return "YES" in response.choices[0].message.content
```

#### 5.3.2 Financial Advice Detection

```python
# /guardrails/advice_detector.py

class AdviceDetector:
    def __init__(self):
        self.advice_patterns = [
            r"you should",
            r"I recommend",
            r"you must",
            r"transfer.*to.*card",
            r"invest in",
            r"buy.*stock",
            r"sell.*position"
        ]

    def detect_advice(self, text):
        """
        Detect if text crosses into financial advice

        Returns:
        {
            'is_advice': True/False,
            'triggers': [...],
            'recommendation': 'Rephrase as educational'
        }
        """
        import re

        triggers = []
        for pattern in self.advice_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                triggers.append(pattern)

        return {
            'is_advice': len(triggers) > 0,
            'triggers': triggers,
            'recommendation': 'Rephrase as educational' if triggers else 'OK'
        }
```

---

## 6. Recommendation Engine

### 6.1 Recommendation Generation Pipeline

```python
# /recommend/engine.py

class RecommendationEngine:
    def __init__(self):
        self.content_matcher = ContentMatcher()
        self.rationale_generator = RationaleGenerator()
        self.eligibility_checker = EligibilityChecker()
        self.tone_checker = ToneChecker()
        self.advice_detector = AdviceDetector()

    def generate_recommendations(self, user_id, window_type='30d'):
        """
        Generate 3-5 education items + 1-3 partner offers

        Output:
        {
            'user_id': 'user_123',
            'window_type': '30d',
            'generated_at': '2025-11-03T10:30:00Z',
            'persona': {
                'primary': 'high_utilization',
                'secondary': ['subscription_heavy']
            },
            'educational_content': [
                {
                    'id': 'rec_001',
                    'type': 'article',
                    'title': 'Understanding Credit Utilization',
                    'rationale': 'Your Visa ending in 4523...',
                    'content_url': '/content/articles/credit_util_101.md',
                    'read_time_minutes': 3,
                    'priority': 'high'
                },
                ...
            ],
            'partner_offers': [
                {
                    'id': 'offer_001',
                    'type': 'balance_transfer_card',
                    'title': '0% APR Balance Transfer',
                    'provider': 'Sample Bank',
                    'rationale': 'Based on your current utilization...',
                    'eligibility_met': True,
                    'disclaimer': 'Educational information only...'
                },
                ...
            ],
            'status': 'pending_operator_approval'
        }
        """

        # Load persona and signals
        persona = self._load_persona(user_id, window_type)
        signals = self._load_signals(user_id, window_type)

        # Match educational content
        content = self.content_matcher.find_best_content(
            signals,
            persona['primary_persona'],
            top_k=5
        )

        # Generate rationales for each content item
        recommendations = []
        for item in content:
            rationale = self.rationale_generator.generate_rationale(
                signals,
                item,
                persona['primary_persona']
            )

            # Guardrail checks
            tone_check = self.tone_checker.check_tone(rationale)
            advice_check = self.advice_detector.detect_advice(rationale)

            if tone_check['passes'] and not advice_check['is_advice']:
                recommendations.append({
                    'id': f"rec_{uuid.uuid4().hex[:8]}",
                    'type': item['type'],
                    'title': item['title'],
                    'rationale': rationale,
                    'content_url': item['file'],
                    'read_time_minutes': item.get('read_time_minutes'),
                    'priority': self._calculate_priority(signals, item)
                })

        # Generate partner offers (if applicable)
        offers = self._generate_partner_offers(user_id, persona, signals)

        return {
            'user_id': user_id,
            'window_type': window_type,
            'generated_at': datetime.now().isoformat(),
            'persona': persona,
            'educational_content': recommendations[:5],
            'partner_offers': offers[:3],
            'status': 'pending_operator_approval'
        }
```

### 6.2 Partner Offers (Simulated)

```python
# /recommend/partner_offers.py

class PartnerOfferGenerator:
    def __init__(self):
        self.offer_catalog = self._load_offer_catalog()

    def generate_offers(self, user_id, persona, signals):
        """
        Generate eligible partner offers (simulated)

        Offers:
        - Balance transfer cards (high utilization)
        - HYSA accounts (savings builders)
        - Budgeting apps (variable income, student)
        - Subscription management tools (subscription-heavy)
        """

        offers = []

        if persona['primary_persona'] == 'high_utilization':
            # Balance transfer card offer
            if self._check_eligibility_balance_transfer(signals):
                offers.append({
                    'id': 'offer_bt_001',
                    'type': 'balance_transfer_card',
                    'title': '0% APR Balance Transfer Card for 18 Months',
                    'provider': 'Sample Financial',
                    'rationale': f"Based on your ${signals['credit']['cards'][0]['balance']} balance at {signals['credit']['cards'][0]['apr_percentage']}% APR, a balance transfer could save you ${self._calculate_savings(signals)} in interest over 18 months.",
                    'eligibility_met': True,
                    'requirements': ['Credit score >680', 'No recent bankruptcies'],
                    'disclaimer': 'This is educational information about product types, not a recommendation to apply. Terms vary by issuer.',
                    'learn_more_url': '/education/balance-transfers'
                })

        if persona['primary_persona'] in ['savings_builder', 'student']:
            # HYSA offer
            offers.append({
                'id': 'offer_hysa_001',
                'type': 'high_yield_savings',
                'title': 'High-Yield Savings Account (4.5% APY)',
                'provider': 'Sample Bank',
                'rationale': f"Your savings balance of ${signals['savings']['total_savings_balance']} could earn ${signals['savings']['total_savings_balance'] * 0.045} annually in a HYSA, compared to ${signals['savings']['total_savings_balance'] * 0.005} at typical rates.",
                'eligibility_met': True,
                'requirements': ['Valid ID', 'Minimum $1 opening deposit'],
                'disclaimer': 'APY is illustrative. Actual rates vary by institution.',
                'learn_more_url': '/education/savings-accounts'
            })

        if persona['primary_persona'] == 'subscription_heavy':
            # Subscription management tool
            offers.append({
                'id': 'offer_sub_001',
                'type': 'tool',
                'title': 'Subscription Management Tool',
                'provider': 'SubTracker',
                'rationale': f"Your {len(signals['subscriptions']['merchants'])} recurring subscriptions totaling ${signals['subscriptions']['monthly_recurring_spend']}/month could be managed and optimized with tracking tools.",
                'eligibility_met': True,
                'requirements': ['None'],
                'disclaimer': 'This is educational information about available tools, not an endorsement.',
                'learn_more_url': '/education/subscription-management'
            })

        return offers

    def _check_eligibility_balance_transfer(self, signals):
        """Check if user is eligible for balance transfer offers"""
        # Simulated eligibility check
        # In real system, would check: credit score, income, existing accounts, etc.

        utilization = signals['credit']['aggregate_utilization_pct']
        has_interest = signals['credit']['any_interest_charges']
        not_overdue = not signals['credit']['any_overdue']

        return utilization >= 30 and has_interest and not_overdue
```

### 6.3 Recommendation Storage Schema

```sql
CREATE TABLE recommendations (
    recommendation_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    window_type TEXT NOT NULL,
    persona_primary TEXT NOT NULL,
    type TEXT NOT NULL, -- 'educational_content' or 'partner_offer'
    content_id TEXT NOT NULL,
    title TEXT NOT NULL,
    rationale TEXT NOT NULL,
    priority TEXT, -- 'high', 'medium', 'low'
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'sent', 'viewed', 'completed'
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by TEXT, -- operator_id
    approved_at TIMESTAMP,
    sent_at TIMESTAMP,
    viewed_at TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

---

## 7. Guardrails & Compliance

### 7.1 Consent Management

#### 7.1.1 Consent Schema

```sql
CREATE TABLE user_consent (
    consent_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    consent_type TEXT NOT NULL, -- 'data_analysis', 'recommendations', 'partner_offers'
    granted BOOLEAN DEFAULT FALSE,
    granted_at TIMESTAMP,
    revoked_at TIMESTAMP,
    ip_address TEXT,
    user_agent TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

#### 7.1.2 Consent Flow

```python
# /guardrails/consent.py

class ConsentManager:
    def request_consent(self, user_id, consent_type='all'):
        """
        Request user consent for data processing

        Consent Types:
        - data_analysis: Allow behavioral signal detection
        - recommendations: Receive educational recommendations
        - partner_offers: See partner product information
        """

        consent_text = {
            'data_analysis': """
            We'd like to analyze your transaction data to identify spending
            patterns, savings behaviors, and financial trends. This helps us
            provide personalized educational content.

            You can revoke this consent at any time in Settings.
            """,
            'recommendations': """
            Based on your financial patterns, we'll send you educational content
            to help you understand your money better. This is NOT financial advice.

            You can opt out at any time.
            """,
            'partner_offers': """
            We may show you information about financial products that match your
            situation. These are educational, not endorsements or recommendations.

            You can disable partner information at any time.
            """
        }

        return consent_text

    def record_consent(self, user_id, consent_type, granted, metadata):
        """Store consent decision"""
        pass

    def check_consent(self, user_id, action):
        """Verify user has consented before taking action"""
        required_consents = {
            'generate_signals': ['data_analysis'],
            'generate_recommendations': ['data_analysis', 'recommendations'],
            'show_partner_offers': ['data_analysis', 'recommendations', 'partner_offers']
        }

        user_consents = self._get_user_consents(user_id)
        required = required_consents.get(action, [])

        return all(consent in user_consents for consent in required)

    def revoke_consent(self, user_id, consent_type):
        """Allow user to revoke consent"""
        # Mark consent as revoked
        # Trigger deletion of related data if required
        pass
```

### 7.2 Eligibility Filtering

```python
# /guardrails/eligibility.py

class EligibilityChecker:
    def check_product_eligibility(self, user_id, product_type):
        """
        Verify user meets basic eligibility for product types

        Rules:
        - Don't show savings accounts if user already has one
        - Don't show credit cards if recent bankruptcy
        - Don't show balance transfer if no existing credit card debt
        - Don't show investment products if emergency fund <3 months
        """

        user_accounts = self._get_user_accounts(user_id)
        user_signals = self._get_user_signals(user_id)

        if product_type == 'high_yield_savings':
            # Don't recommend if already has savings account
            has_savings = any(acc['type'] == 'savings' for acc in user_accounts)
            return not has_savings

        if product_type == 'balance_transfer_card':
            # Only show if has credit card debt with interest
            has_cc_debt = user_signals['credit']['any_interest_charges']
            not_overdue = not user_signals['credit']['any_overdue']
            return has_cc_debt and not_overdue

        if product_type == 'investment_account':
            # Only show if emergency fund ≥3 months
            emergency_fund = user_signals['savings']['emergency_fund_months']
            return emergency_fund >= 3

        return True

    def filter_ineligible_recommendations(self, user_id, recommendations):
        """Remove recommendations user isn't eligible for"""
        eligible = []

        for rec in recommendations:
            if rec['type'] == 'partner_offer':
                product_type = rec.get('product_type')
                if self.check_product_eligibility(user_id, product_type):
                    eligible.append(rec)
            else:
                # Educational content is always eligible
                eligible.append(rec)

        return eligible
```

### 7.3 Disclaimer Generation

```python
# /guardrails/disclaimers.py

class DisclaimerGenerator:
    def get_disclaimer(self, content_type, persona):
        """
        Generate appropriate disclaimer for content

        Universal: "This is educational content, not financial advice.
        Consult a licensed advisor for personalized guidance."
        """

        base_disclaimer = "This is educational content, not financial advice. Consult a licensed advisor for personalized guidance."

        additional = {
            'partner_offer': " Product terms, rates, and availability vary by provider and your individual circumstances.",
            'credit_card': " Credit card approval depends on creditworthiness and issuer criteria.",
            'investment': " Investing involves risk, including potential loss of principal."
        }

        if content_type in additional:
            return base_disclaimer + additional[content_type]

        return base_disclaimer
```

---

## 8. Operator View

### 8.1 Operator Dashboard Requirements

#### 8.1.1 Key Features

1. **Review Queue**: Pending recommendations awaiting approval
2. **User Signal Explorer**: Drill-down into detected behaviors
3. **Decision Traces**: Full audit trail for each recommendation
4. **Override Controls**: Approve, reject, or modify recommendations
5. **Bulk Actions**: Approve multiple items at once
6. **Alert System**: Flag suspicious patterns or edge cases

#### 8.1.2 Dashboard Wireframe (React Component Structure)

```jsx
// /ui/operator-dashboard/OperatorDashboard.jsx

import React from "react";
import { ReviewQueue } from "./ReviewQueue";
import { UserExplorer } from "./UserExplorer";
import { DecisionTraces } from "./DecisionTraces";
import { AlertPanel } from "./AlertPanel";

export function OperatorDashboard() {
  return (
    <div className="operator-dashboard">
      <header>
        <h1>SpendSense Operator View</h1>
        <AlertPanel />
      </header>

      <div className="dashboard-grid">
        <div className="left-panel">
          <ReviewQueue />
        </div>

        <div className="right-panel">
          <UserExplorer />
          <DecisionTraces />
        </div>
      </div>
    </div>
  );
}
```

#### 8.1.3 Review Queue Component

```jsx
// /ui/operator-dashboard/ReviewQueue.jsx

export function ReviewQueue() {
  const [pendingRecommendations, setPendingRecommendations] = useState([]);

  return (
    <div className="review-queue">
      <h2>Pending Recommendations ({pendingRecommendations.length})</h2>

      <div className="filters">
        <select name="persona-filter">
          <option>All Personas</option>
          <option>High Utilization</option>
          <option>Variable Income</option>
          <option>Student</option>
          <option>Subscription-Heavy</option>
          <option>Savings Builder</option>
        </select>

        <select name="priority-filter">
          <option>All Priorities</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </div>

      <div className="recommendation-list">
        {pendingRecommendations.map((rec) => (
          <RecommendationCard
            key={rec.id}
            recommendation={rec}
            onApprove={() => handleApprove(rec.id)}
            onReject={() => handleReject(rec.id)}
            onModify={() => handleModify(rec.id)}
          />
        ))}
      </div>

      <div className="bulk-actions">
        <button onClick={handleBulkApprove}>Approve All (with checks)</button>
      </div>
    </div>
  );
}
```

#### 8.1.4 User Signal Explorer

```jsx
// /ui/operator-dashboard/UserExplorer.jsx

export function UserExplorer() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [signals, setSignals] = useState(null);

  return (
    <div className="user-explorer">
      <h2>User Signal Explorer</h2>

      <input
        type="search"
        placeholder="Search by user ID..."
        onChange={(e) => searchUser(e.target.value)}
      />

      {selectedUser && (
        <div className="user-details">
          <h3>{selectedUser.id}</h3>

          <div className="persona-assignment">
            <h4>Persona Assignment (30d)</h4>
            <div className="persona-badge primary">
              {selectedUser.persona_30d.primary}
            </div>
            {selectedUser.persona_30d.secondary.map((p) => (
              <div className="persona-badge secondary">{p}</div>
            ))}
          </div>

          <div className="signals-grid">
            <SignalCard title="Credit Utilization" data={signals.credit} />
            <SignalCard title="Subscriptions" data={signals.subscriptions} />
            <SignalCard title="Savings" data={signals.savings} />
            <SignalCard title="Income Stability" data={signals.income} />
          </div>

          <div className="timeline">
            <h4>Persona History (180d)</h4>
            <PersonaTimeline userId={selectedUser.id} />
          </div>
        </div>
      )}
    </div>
  );
}
```

#### 8.1.5 Decision Trace Viewer

```jsx
// /ui/operator-dashboard/DecisionTraces.jsx

export function DecisionTraces({ recommendationId }) {
  const [trace, setTrace] = useState(null);

  useEffect(() => {
    // Load decision trace for recommendation
    loadTrace(recommendationId).then(setTrace);
  }, [recommendationId]);

  return (
    <div className="decision-trace">
      <h2>Decision Trace</h2>

      {trace && (
        <div className="trace-timeline">
          <TraceStep
            title="Signals Detected"
            timestamp={trace.signals_detected_at}
            data={trace.signals}
          />

          <TraceStep
            title="Persona Assigned"
            timestamp={trace.persona_assigned_at}
            data={trace.persona_assignment}
            details={`Criteria met: ${trace.persona_criteria}`}
          />

          <TraceStep
            title="Content Matched"
            timestamp={trace.content_matched_at}
            data={trace.content_matches}
            details={`Relevance scores: ${trace.relevance_scores}`}
          />

          <TraceStep
            title="Rationale Generated"
            timestamp={trace.rationale_generated_at}
            data={trace.rationale}
            details={`LLM model: ${trace.llm_model}, Temp: ${trace.temperature}`}
          />

          <TraceStep
            title="Guardrail Checks"
            timestamp={trace.guardrails_checked_at}
            data={{
              tone_check: trace.tone_check,
              advice_check: trace.advice_check,
              eligibility_check: trace.eligibility_check,
            }}
          />

          <TraceStep
            title="Recommendation Created"
            timestamp={trace.created_at}
            data={trace.recommendation}
          />
        </div>
      )}
    </div>
  );
}
```

### 8.2 Operator Actions

#### 8.2.1 Approval Workflow

```python
# /ui/operator_actions.py

class OperatorActions:
    def approve_recommendation(self, operator_id, recommendation_id, notes=""):
        """
        Approve recommendation for sending to user

        Steps:
        1. Verify operator has permission
        2. Mark recommendation as approved
        3. Log operator action
        4. Queue for user delivery
        """
        # Update recommendation status
        self.db.execute("""
            UPDATE recommendations
            SET status = 'approved',
                approved_by = ?,
                approved_at = ?,
                operator_notes = ?
            WHERE recommendation_id = ?
        """, (operator_id, datetime.now(), notes, recommendation_id))

        # Log action
        self._log_operator_action(operator_id, 'approve', recommendation_id)

        # Queue for delivery
        self._queue_for_delivery(recommendation_id)

        return {'status': 'approved', 'recommendation_id': recommendation_id}

    def reject_recommendation(self, operator_id, recommendation_id, reason):
        """
        Reject recommendation (will not be sent to user)
        """
        self.db.execute("""
            UPDATE recommendations
            SET status = 'rejected',
                approved_by = ?,
                approved_at = ?,
                operator_notes = ?
            WHERE recommendation_id = ?
        """, (operator_id, datetime.now(), reason, recommendation_id))

        self._log_operator_action(operator_id, 'reject', recommendation_id, reason)

        return {'status': 'rejected', 'recommendation_id': recommendation_id}

    def modify_recommendation(self, operator_id, recommendation_id, modifications):
        """
        Modify rationale, priority, or other fields before approval
        """
        allowed_fields = ['rationale', 'priority', 'title']

        for field, new_value in modifications.items():
            if field in allowed_fields:
                self.db.execute(f"""
                    UPDATE recommendations
                    SET {field} = ?,
                        modified_by = ?,
                        modified_at = ?
                    WHERE recommendation_id = ?
                """, (new_value, operator_id, datetime.now(), recommendation_id))

        self._log_operator_action(operator_id, 'modify', recommendation_id, modifications)

        return {'status': 'modified', 'recommendation_id': recommendation_id}

    def flag_for_review(self, operator_id, recommendation_id, flag_reason):
        """
        Flag recommendation for senior operator or additional review
        """
        self.db.execute("""
            INSERT INTO recommendation_flags
            (recommendation_id, flagged_by, flag_reason, flagged_at)
            VALUES (?, ?, ?, ?)
        """, (recommendation_id, operator_id, flag_reason, datetime.now()))

        return {'status': 'flagged', 'recommendation_id': recommendation_id}
```

### 8.3 Operator Audit Log Schema

```sql
CREATE TABLE operator_audit_log (
    audit_id TEXT PRIMARY KEY,
    operator_id TEXT NOT NULL,
    action TEXT NOT NULL, -- 'approve', 'reject', 'modify', 'flag'
    recommendation_id TEXT NOT NULL,
    notes TEXT,
    metadata JSON, -- Additional context
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recommendation_id) REFERENCES recommendations(recommendation_id)
);
```

---

## 9. User Experience

### 9.1 Multi-Format Delivery

As specified in the PDF (page 6), SpendSense supports multiple UX formats:

1. **Web App Mock** - Personalized dashboard
2. **Email Preview Templates** - Weekly/monthly digests
3. **Chat Interface** - Q&A follow-ups
4. **Content Feed** - Social media-style feed
5. **Mobile App Mockup** - Figma/screenshots
6. **Interactive Calculators** - Embedded tools
7. **Gamified Challenges** - Progress tracking

### 9.2 Web Dashboard (Primary Interface)

#### 9.2.1 Dashboard Layout

```jsx
// /ui/user-dashboard/Dashboard.jsx

export function UserDashboard({ userId }) {
  const [persona, setPersona] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [signals, setSignals] = useState(null);

  return (
    <div className="user-dashboard">
      {/* Header with persona badge */}
      <DashboardHeader persona={persona} />

      {/* Hero section with primary insight */}
      <HeroInsight persona={persona} signals={signals} />

      {/* Recommendations feed */}
      <RecommendationsFeed
        recommendations={recommendations}
        onView={handleView}
        onComplete={handleComplete}
      />

      {/* Financial snapshot cards */}
      <FinancialSnapshot signals={signals} />

      {/* Chat widget (floating) */}
      <ChatWidget userId={userId} />
    </div>
  );
}
```

#### 9.2.2 Hero Insight Component

```jsx
// /ui/user-dashboard/HeroInsight.jsx

export function HeroInsight({ persona, signals }) {
  const insights = {
    high_utilization: {
      title: "Your Credit Utilization Needs Attention",
      insight: `Your credit cards are at ${signals.credit.aggregate_utilization_pct}% utilization. Bringing this below 30% could improve your credit score.`,
      icon: "📊",
      cta: "Learn About Credit Utilization",
    },
    student: {
      title: "Student Budget Optimization",
      insight: `Your coffee and food delivery spending totals $${
        signals.subscriptions.coffee_food_delivery
      } this month. Small changes here could free up ${calculateSavings(
        signals
      )} for your goals.`,
      icon: "🎓",
      cta: "Optimize Your Student Budget",
    },
    savings_builder: {
      title: "You're Building Great Habits!",
      insight: `Your savings grew ${signals.savings.savings_growth_rate_pct}% this period. Keep it up!`,
      icon: "🎉",
      cta: "Level Up Your Savings",
    },
  };

  const current = insights[persona.primary] || insights["savings_builder"];

  return (
    <div className="hero-insight">
      <div className="icon">{current.icon}</div>
      <h2>{current.title}</h2>
      <p className="insight-text">{current.insight}</p>
      <button className="cta-button">{current.cta}</button>
    </div>
  );
}
```

#### 9.2.3 Recommendations Feed

```jsx
// /ui/user-dashboard/RecommendationsFeed.jsx

export function RecommendationsFeed({ recommendations, onView, onComplete }) {
  return (
    <div className="recommendations-feed">
      <h2>Learning Recommendations for You</h2>

      {recommendations.map((rec) => (
        <RecommendationCard
          key={rec.id}
          recommendation={rec}
          onView={() => onView(rec.id)}
          onComplete={() => onComplete(rec.id)}
        />
      ))}
    </div>
  );
}

function RecommendationCard({ recommendation, onView, onComplete }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rec-card priority-${recommendation.priority}`}>
      <div className="rec-header">
        <span className="rec-type-badge">{recommendation.type}</span>
        <span className="read-time">
          ⏱ {recommendation.read_time_minutes} min
        </span>
      </div>

      <h3>{recommendation.title}</h3>

      <div className="rationale">{recommendation.rationale}</div>

      {expanded && (
        <div className="rec-content">
          {/* Render markdown content */}
          <MarkdownRenderer content={recommendation.content} />

          {recommendation.type === "calculator" && (
            <EmbeddedCalculator type={recommendation.calculator_type} />
          )}
        </div>
      )}

      <div className="rec-actions">
        <button
          onClick={() => {
            setExpanded(!expanded);
            onView();
          }}
        >
          {expanded ? "Collapse" : "Learn More"}
        </button>

        {expanded && (
          <button onClick={onComplete} className="complete-btn">
            ✓ Mark as Complete
          </button>
        )}
      </div>
    </div>
  );
}
```

### 9.3 Email Templates

#### 9.3.1 Weekly Digest Template

```html
<!-- /ui/email-templates/weekly-digest.html -->

<!DOCTYPE html>
<html>
  <head>
    <style>
      /* Email-safe CSS */
      body {
        font-family: Arial, sans-serif;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
      }
      .header {
        background: #d4e7c5;
        padding: 20px;
      }
      .insight-box {
        background: #f5f5f5;
        padding: 15px;
        margin: 20px 0;
      }
      .cta-button {
        background: #b4a7d6;
        color: white;
        padding: 10px 20px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Your Weekly Financial Insights</h1>
        <p>{{user_name}}, here's what we noticed this week</p>
      </div>

      <div class="insight-box">
        <h2>📊 Your Primary Focus: {{persona_name}}</h2>
        <p>{{hero_insight}}</p>
      </div>

      <h3>New Learning Recommendations:</h3>

      {{#recommendations}}
      <div class="recommendation">
        <h4>{{title}}</h4>
        <p>{{rationale}}</p>
        <a href="{{link}}" class="cta-button">Learn More</a>
      </div>
      {{/recommendations}}

      <div class="footer">
        <p>
          <small
            >This is educational content, not financial advice. Consult a
            licensed advisor for personalized guidance.</small
          >
        </p>

        <p>
          <small
            ><a href="{{unsubscribe_link}}">Manage Email Preferences</a></small
          >
        </p>
      </div>
    </div>
  </body>
</html>
```

### 9.4 Chat Interface

#### 9.4.1 Chat Widget Component

```jsx
// /ui/user-dashboard/ChatWidget.jsx

export function ChatWidget({ userId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    // Add user message to chat
    setMessages([...messages, { role: "user", content: input }]);

    // Call chat API
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, message: input }),
    });

    const data = await response.json();

    // Add AI response
    setMessages([
      ...messages,
      { role: "user", content: input },
      { role: "assistant", content: data.response },
    ]);

    setInput("");
  };

  return (
    <div className={`chat-widget ${isOpen ? "open" : "closed"}`}>
      <button className="chat-toggle" onClick={() => setIsOpen(!isOpen)}>
        💬 Ask a Question
      </button>

      {isOpen && (
        <div className="chat-container">
          <div className="chat-header">
            <h3>Financial Education Q&A</h3>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                {msg.content}
              </div>
            ))}
          </div>

          <div className="chat-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask about your finances..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}
```

### 9.5 Interactive Calculators

#### 9.5.1 Emergency Fund Calculator

```jsx
// /ui/calculators/EmergencyFundCalculator.jsx

export function EmergencyFundCalculator({ userSignals }) {
  const [monthlyExpenses, setMonthlyExpenses] = useState(
    userSignals.monthly_expenses || 0
  );
  const [currentSavings, setCurrentSavings] = useState(
    userSignals.savings_balance || 0
  );
  const [targetMonths, setTargetMonths] = useState(3);

  const targetAmount = monthlyExpenses * targetMonths;
  const remaining = targetAmount - currentSavings;
  const progress = (currentSavings / targetAmount) * 100;

  return (
    <div className="calculator emergency-fund">
      <h3>Emergency Fund Calculator</h3>

      <div className="input-group">
        <label>Monthly Expenses</label>
        <input
          type="number"
          value={monthlyExpenses}
          onChange={(e) => setMonthlyExpenses(parseFloat(e.target.value))}
        />
      </div>

      <div className="input-group">
        <label>Current Savings</label>
        <input
          type="number"
          value={currentSavings}
          onChange={(e) => setCurrentSavings(parseFloat(e.target.value))}
        />
      </div>

      <div className="input-group">
        <label>Target Months of Coverage</label>
        <input
          type="range"
          min="1"
          max="12"
          value={targetMonths}
          onChange={(e) => setTargetMonths(parseInt(e.target.value))}
        />
        <span>{targetMonths} months</span>
      </div>

      <div className="results">
        <h4>Your Emergency Fund Goal</h4>
        <div className="target">${targetAmount.toFixed(2)}</div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <p className="progress-text">{progress.toFixed(0)}% of target</p>

        {remaining > 0 && (
          <p className="remaining">
            You need ${remaining.toFixed(2)} more to reach your {targetMonths}
            -month goal.
          </p>
        )}

        {remaining <= 0 && (
          <p className="success">
            🎉 Congratulations! You've reached your emergency fund goal!
          </p>
        )}
      </div>
    </div>
  );
}
```

### 9.6 Gamification Elements

#### 9.6.1 Progress Tracking

```jsx
// /ui/gamification/ProgressTracker.jsx

export function ProgressTracker({ userId, persona }) {
  const [milestones, setMilestones] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);

  const personaMilestones = {
    high_utilization: [
      { id: "util_below_80", title: "Below 80%", achieved: true },
      { id: "util_below_50", title: "Below 50%", achieved: true },
      { id: "util_below_30", title: "Below 30%", achieved: false },
      { id: "no_interest", title: "Interest-Free Month", achieved: false },
    ],
    student: [
      { id: "budget_created", title: "Created First Budget", achieved: true },
      { id: "tracked_expenses", title: "30 Days of Tracking", achieved: false },
      { id: "saved_100", title: "Saved $100", achieved: false },
      {
        id: "reduced_delivery",
        title: "Cut Delivery Spending 25%",
        achieved: false,
      },
    ],
  };

  return (
    <div className="progress-tracker">
      <h3>Your Progress</h3>

      <div className="streak-counter">
        <span className="streak-number">{currentStreak}</span>
        <span className="streak-label">day streak 🔥</span>
      </div>

      <div className="milestones">
        <h4>Milestones</h4>
        {personaMilestones[persona.primary].map((milestone) => (
          <div
            key={milestone.id}
            className={`milestone ${
              milestone.achieved ? "achieved" : "pending"
            }`}
          >
            <span className="milestone-icon">
              {milestone.achieved ? "✓" : "○"}
            </span>
            <span className="milestone-title">{milestone.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### 9.6.2 Savings Challenges

```jsx
// /ui/gamification/SavingsChallenge.jsx

export function SavingsChallenge({ userId }) {
  const [activeChallenge, setActiveChallenge] = useState(null);

  const challenges = [
    {
      id: "coffee_week",
      title: "7-Day Coffee Challenge",
      description: "Make coffee at home for 7 days",
      reward: "Save ~$35",
      duration_days: 7,
    },
    {
      id: "no_delivery",
      title: "No Delivery November",
      description: "Cook or prep all meals at home",
      reward: "Save ~$200+",
      duration_days: 30,
    },
    {
      id: "subscription_audit",
      title: "Subscription Audit",
      description: "Review and cancel unused subscriptions",
      reward: "Save ~$50/month",
      duration_days: 1,
    },
  ];

  return (
    <div className="savings-challenges">
      <h3>Savings Challenges</h3>

      {activeChallenge ? (
        <ActiveChallenge challenge={activeChallenge} />
      ) : (
        <div className="challenge-list">
          {challenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              onStart={() => setActiveChallenge(challenge)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

### 9.7 Mobile App Mockup (Figma)

**Key Screens:**

1. **Onboarding** - Consent flow, explain what SpendSense does
2. **Home Dashboard** - Hero insight + recommendations feed
3. **Persona View** - Detailed persona breakdown with signals
4. **Education Detail** - Full article/calculator view
5. **Progress** - Milestones, streaks, transitions
6. **Chat** - Q&A interface
7. **Settings** - Consent management, preferences

_(Create Figma mockups with actual screens - can be provided separately)_

---

## 10. Technical Architecture

### 10.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         SpendSense System                        │
└─────────────────────────────────────────────────────────────────┘

┌───────────────┐
│  Synthetic    │
│  Data Gen     │──────────┐
└───────────────┘          │
                           │
┌───────────────┐          ↓
│   Kaggle      │    ┌──────────┐      ┌─────────────────┐
│   Datasets    │───→│  Ingest  │─────→│   PostgreSQL    │
└───────────────┘    │  Module  │      │   or SQLite     │
                     └──────────┘      └────────┬────────┘
                                                 │
                     ┌───────────────────────────┤
                     │                           │
                     ↓                           ↓
              ┌─────────────┐           ┌──────────────┐
              │  Features   │           │   Parquet    │
              │  Pipeline   │           │  (Analytics) │
              └──────┬──────┘           └──────────────┘
                     │
         ┌───────────┼───────────┬──────────────┐
         ↓           ↓           ↓              ↓
    ┌─────────┐ ┌─────────┐ ┌─────────┐  ┌──────────┐
    │ Subscr. │ │ Savings │ │ Credit  │  │  Income  │
    │ Detect  │ │ Analyze │ │ Analyze │  │  Analyze │
    └────┬────┘ └────┬────┘ └────┬────┘  └─────┬────┘
         └───────────┼───────────┼─────────────┘
                     │           │
                     ↓           ↓
              ┌──────────────────────┐
              │   Persona System     │
              │  - Assignment Logic  │
              │  - Transition Track  │
              └──────────┬───────────┘
                         │
                         ↓
              ┌──────────────────────┐
              │  Recommendation      │
              │       Engine         │
              │  - Content Match     │
              │  - LLM Rationale     │
              │  - Partner Offers    │
              └──────────┬───────────┘
                         │
                         ↓
              ┌──────────────────────┐
              │     Guardrails       │
              │  - Consent Check     │
              │  - Tone Enforce      │
              │  - Eligibility       │
              │  - Advice Detect     │
              └──────────┬───────────┘
                         │
                 ┌───────┴────────┐
                 ↓                ↓
         ┌─────────────┐   ┌─────────────┐
         │  Operator   │   │    User     │
         │    View     │   │  Dashboard  │
         └─────────────┘   └─────────────┘
                                  │
                          ┌───────┴────────┐
                          ↓                ↓
                   ┌────────────┐  ┌─────────────┐
                   │    Web     │  │   Email     │
                   │  Dashboard │  │  Templates  │
                   └────────────┘  └─────────────┘
                          │                │
                          └────────┬───────┘
                                   ↓
                           ┌──────────────┐
                           │  Chat + Q&A  │
                           │  (LLM GPT-4) │
                           └──────────────┘
```

### 10.2 Module Structure (Following PDF Spec)

```
/spendsense
├── /ingest                     # Data loading and validation
│   ├── data_generator.py       # Synthetic data creation
│   ├── loader.py               # CSV/JSON ingestion
│   └── validator.py            # Schema validation
│
├── /features                   # Signal detection and feature engineering
│   ├── subscriptions.py        # Recurring merchant detection
│   ├── savings.py              # Savings analysis
│   ├── credit.py               # Credit utilization
│   ├── income.py               # Income stability
│   └── base.py                 # Base feature class
│
├── /personas                   # Persona assignment logic
│   ├── assignment.py           # Assignment algorithm
│   ├── transitions.py          # Transition tracking
│   └── definitions.py          # Persona criteria
│
├── /recommend                  # Recommendation engine
│   ├── engine.py               # Main recommendation logic
│   ├── content_matcher.py      # Semantic matching
│   ├── llm_rationale.py        # LLM-generated rationales
│   ├── partner_offers.py       # Partner offer generation
│   └── templates.py            # Rationale templates
│
├── /guardrails                 # Consent, eligibility, tone checks
│   ├── consent.py              # Consent management
│   ├── eligibility.py          # Product eligibility
│   ├── tone_checker.py         # Tone enforcement
│   ├── advice_detector.py      # Financial advice detection
│   └── disclaimers.py          # Disclaimer generation
│
├── /ui                         # Operator view and user experience
│   ├── /operator-dashboard     # Operator interface
│   │   ├── OperatorDashboard.jsx
│   │   ├── ReviewQueue.jsx
│   │   ├── UserExplorer.jsx
│   │   └── DecisionTraces.jsx
│   │
│   ├── /user-dashboard         # User interface
│   │   ├── Dashboard.jsx
│   │   ├── HeroInsight.jsx
│   │   ├── RecommendationsFeed.jsx
│   │   └── ChatWidget.jsx
│   │
│   ├── /calculators            # Interactive calculators
│   │   ├── EmergencyFundCalculator.jsx
│   │   ├── DebtPayoffCalculator.jsx
│   │   └── UtilizationCalculator.jsx
│   │
│   ├── /email-templates        # Email templates
│   │   ├── weekly-digest.html
│   │   └── monthly-summary.html
│   │
│   └── /gamification           # Progress tracking
│       ├── ProgressTracker.jsx
│       └── SavingsChallenge.jsx
│
├── /eval                       # Evaluation harness
│   ├── metrics.py              # Metric calculations
│   ├── coverage.py             # Coverage testing
│   ├── explainability.py       # Rationale validation
│   ├── relevance.py            # Content-persona fit
│   ├── fairness.py             # Demographic parity
│   └── latency.py              # Performance testing
│
├── /docs                       # Decision log and schema documentation
│   ├── DECISION_LOG.md         # Key design decisions
│   ├── SCHEMA.md               # Database schema
│   ├── API_SPEC.md             # API documentation
│   └── LIMITATIONS.md          # Known limitations
│
├── /content                    # Educational content library
│   ├── /library
│   │   ├── /articles           # Markdown content
│   │   ├── /calculators        # React components
│   │   ├── /infographics       # Image assets
│   │   └── /videos             # Video links
│   ├── /templates              # LLM templates
│   └── content_catalog.json    # Content metadata
│
├── /tests                      # Unit and integration tests
│   ├── test_features.py
│   ├── test_personas.py
│   ├── test_recommendations.py
│   ├── test_guardrails.py
│   └── test_e2e.py
│
├── /data                       # Data directory (gitignored)
│   ├── synthetic_users.csv
│   ├── synthetic_accounts.csv
│   └── synthetic_transactions.csv
│
├── /api                        # REST API
│   ├── app.py                  # Flask/FastAPI app
│   ├── routes.py               # API endpoints
│   └── middleware.py           # Auth, logging
│
├── spendsense.db               # SQLite database
├── requirements.txt            # Python dependencies
├── package.json                # Node dependencies (UI)
├── README.md                   # Setup instructions
├── docker-compose.yml          # Docker setup (optional)
└── .env.example                # Environment variables template
```

### 10.3 Database Schema (SQLite)

#### 10.3.1 Core Tables

```sql
-- Users
CREATE TABLE users (
    user_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON -- Demographics for fairness testing
);

-- Accounts (already defined in section 2.2.1)
-- Transactions (already defined in section 2.2.2)
-- Liabilities (already defined in section 2.2.3)

-- User Signals (already defined in section 3.3)
-- User Personas (already defined in section 4.2.2)
-- Recommendations (already defined in section 6.3)

-- User Consent (already defined in section 7.1.1)

-- Operator Audit Log (already defined in section 8.3)

-- User Interactions
CREATE TABLE user_interactions (
    interaction_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    recommendation_id TEXT NOT NULL,
    interaction_type TEXT NOT NULL, -- 'viewed', 'clicked', 'completed', 'dismissed'
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (recommendation_id) REFERENCES recommendations(recommendation_id)
);

-- Chat History
CREATE TABLE chat_history (
    chat_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    message_role TEXT NOT NULL, -- 'user' or 'assistant'
    message_content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Persona Transitions
CREATE TABLE persona_transitions (
    transition_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    from_persona TEXT NOT NULL,
    to_persona TEXT NOT NULL,
    transition_date DATE NOT NULL,
    celebration_shown BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

### 10.4 REST API Specification

#### 10.4.1 Endpoints (from PDF page 5)

```yaml
openapi: 3.0.0
info:
  title: SpendSense API
  version: 1.0.0

paths:
  /users:
    post:
      summary: Create user
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                email:
                  type: string
                metadata:
                  type: object
      responses:
        201:
          description: User created
          content:
            application/json:
              schema:
                type: object
                properties:
                  user_id:
                    type: string

  /consent:
    post:
      summary: Record consent
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                user_id:
                  type: string
                consent_type:
                  type: string
                  enum: [data_analysis, recommendations, partner_offers]
                granted:
                  type: boolean
      responses:
        200:
          description: Consent recorded

  /profile/{user_id}:
    get:
      summary: Get behavioral profile
      parameters:
        - name: user_id
          in: path
          required: true
          schema:
            type: string
        - name: window_type
          in: query
          schema:
            type: string
            enum: [30d, 180d]
            default: 30d
      responses:
        200:
          description: User profile
          content:
            application/json:
              schema:
                type: object
                properties:
                  user_id:
                    type: string
                  persona:
                    type: object
                  signals:
                    type: object

  /recommendations/{user_id}:
    get:
      summary: Get recommendations
      parameters:
        - name: user_id
          in: path
          required: true
          schema:
            type: string
        - name: status
          in: query
          schema:
            type: string
            enum: [pending, approved, sent, viewed, completed]
      responses:
        200:
          description: Recommendations list
          content:
            application/json:
              schema:
                type: object
                properties:
                  recommendations:
                    type: array
                    items:
                      type: object

  /feedback:
    post:
      summary: Record user feedback
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                user_id:
                  type: string
                recommendation_id:
                  type: string
                feedback_type:
                  type: string
                  enum: [helpful, not_helpful, completed]
                notes:
                  type: string
      responses:
        200:
          description: Feedback recorded

  /operator/review:
    get:
      summary: Operator approval queue
      parameters:
        - name: status
          in: query
          schema:
            type: string
            default: pending
        - name: persona_filter
          in: query
          schema:
            type: string
        - name: priority_filter
          in: query
          schema:
            type: string
      responses:
        200:
          description: Pending recommendations
          content:
            application/json:
              schema:
                type: object
                properties:
                  recommendations:
                    type: array

  /operator/approve:
    post:
      summary: Approve recommendation
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                operator_id:
                  type: string
                recommendation_id:
                  type: string
                notes:
                  type: string
      responses:
        200:
          description: Recommendation approved

  /chat:
    post:
      summary: Chat Q&A
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                user_id:
                  type: string
                message:
                  type: string
      responses:
        200:
          description: Chat response
          content:
            application/json:
              schema:
                type: object
                properties:
                  response:
                    type: string
```

### 10.5 Technology Stack

#### 10.5.1 Backend

- **Language**: Python 3.10+
- **Framework**: FastAPI or Flask
- **Database**: SQLite (development), PostgreSQL (production-like)
- **ORM**: SQLAlchemy
- **LLM Integration**: OpenAI Python SDK (GPT-4)
- **Data Processing**: Pandas, NumPy
- **ML/Embeddings**: sentence-transformers (for semantic search)
- **Task Queue**: Celery (for background jobs) - optional

#### 10.5.2 Frontend

- **Framework**: React 18 + Next.js 14
- **State Management**: Zustand (matching your Mockup Matcha Hub)
- **UI Library**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts or Chart.js
- **Forms**: React Hook Form

#### 10.5.3 Development

- **Testing**: pytest (backend), Jest + React Testing Library (frontend)
- **Linting**: ruff (Python), ESLint (JS)
- **Formatting**: black (Python), Prettier (JS)
- **Type Checking**: mypy (Python), TypeScript (JS)
- **CI/CD**: GitHub Actions (optional)

#### 10.5.4 Deployment

- **Containerization**: Docker (optional)
- **Hosting**: Local (primary), Vercel/Railway (demo - optional)
- **Environment**: .env for config

---

## 11. Evaluation & Metrics

### 11.1 Success Criteria (from PDF page 6)

| Category           | Metric                                     | Target     |
| ------------------ | ------------------------------------------ | ---------- |
| **Coverage**       | Users with assigned persona + ≥3 behaviors | 100%       |
| **Explainability** | Recommendations with rationales            | 100%       |
| **Latency**        | Time to generate recommendations per user  | <5 seconds |
| **Auditability**   | Recommendations with decision traces       | 100%       |
| **Code Quality**   | Passing unit/integration tests             | ≥10 tests  |
| **Documentation**  | Schema and decision log clarity            | Complete   |

### 11.2 Evaluation Harness

#### 11.2.1 Coverage Metrics

```python
# /eval/coverage.py

class CoverageEvaluator:
    def evaluate_coverage(self, users):
        """
        Calculate % of users with:
        - Assigned persona
        - ≥3 detected behaviors

        Target: 100%
        """
        results = {
            'total_users': len(users),
            'users_with_persona': 0,
            'users_with_3plus_behaviors': 0,
            'full_coverage': 0
        }

        for user in users:
            # Check persona assignment
            persona = self._get_persona(user['user_id'])
            if persona and persona['primary_persona'] != 'none':
                results['users_with_persona'] += 1

            # Check behavior count
            signals = self._get_signals(user['user_id'])
            behavior_count = self._count_detected_behaviors(signals)
            if behavior_count >= 3:
                results['users_with_3plus_behaviors'] += 1

            # Full coverage (persona + 3+ behaviors)
            if (persona and persona['primary_persona'] != 'none'
                and behavior_count >= 3):
                results['full_coverage'] += 1

        results['coverage_pct'] = (results['full_coverage'] / results['total_users']) * 100

        return results

    def _count_detected_behaviors(self, signals):
        """Count distinct behavioral signals"""
        count = 0

        # Subscription signals
        if signals.get('subscriptions', {}).get('recurring_merchant_count', 0) > 0:
            count += 1

        # Savings signals
        if signals.get('savings', {}).get('net_savings_inflow', 0) > 0:
            count += 1

        # Credit signals
        if signals.get('credit', {}).get('aggregate_utilization_pct', 0) > 0:
            count += 1

        # Income signals
        if signals.get('income', {}).get('payment_frequency'):
            count += 1

        return count
```

#### 11.2.2 Explainability Metrics

```python
# /eval/explainability.py

class ExplainabilityEvaluator:
    def evaluate_explainability(self, recommendations):
        """
        Calculate % of recommendations with:
        - Plain-language rationale
        - Specific data citations
        - "Because" explanation

        Target: 100%
        """
        results = {
            'total_recommendations': len(recommendations),
            'with_rationale': 0,
            'with_data_citation': 0,
            'with_because_statement': 0,
            'full_explainability': 0
        }

        for rec in recommendations:
            rationale = rec.get('rationale', '')

            # Check for rationale presence
            if len(rationale) > 10:  # Meaningful rationale
                results['with_rationale'] += 1

            # Check for data citation (numbers, percentages, dollars)
            if self._has_data_citation(rationale):
                results['with_data_citation'] += 1

            # Check for because/explanation
            if any(word in rationale.lower() for word in ['because', 'since', 'as', 'due to']):
                results['with_because_statement'] += 1

            # Full explainability
            if (len(rationale) > 10
                and self._has_data_citation(rationale)
                and any(word in rationale.lower() for word in ['because', 'since'])):
                results['full_explainability'] += 1

        results['explainability_pct'] = (results['full_explainability'] / results['total_recommendations']) * 100

        return results

    def _has_data_citation(self, text):
        """Check if text contains specific numbers/data"""
        import re
        # Look for: percentages, dollar amounts, numbers with context
        patterns = [
            r'\d+%',           # 68%
            r'\$\d+',          # $127
            r'\d+\s+of\s+\d+', # 5 of 10
            r'\d+\s+months',   # 3 months
        ]
        return any(re.search(pattern, text) for pattern in patterns)
```

#### 11.2.3 Relevance Metrics

```python
# /eval/relevance.py

class RelevanceEvaluator:
    def evaluate_relevance(self, sample_size=20):
        """
        Manual review of education-persona fit

        Process:
        1. Sample 20 random recommendations
        2. Have 3 raters score each on 1-5 scale
        3. Calculate inter-rater reliability
        4. Calculate average relevance score
        """

        # Sample recommendations
        sample = self._sample_recommendations(sample_size)

        # Create rating form for each recommendation
        ratings = []
        for rec in sample:
            rating_form = {
                'recommendation_id': rec['recommendation_id'],
                'persona': rec['persona_primary'],
                'content_title': rec['title'],
                'rationale': rec['rationale'],
                'rater_1_score': None,  # 1-5 scale
                'rater_2_score': None,
                'rater_3_score': None,
                'notes': ''
            }
            ratings.append(rating_form)

        # In actual implementation, this would be a web form
        # For now, return structure for manual rating
        return {
            'sample_size': sample_size,
            'ratings_form': ratings,
            'rubric': {
                5: 'Perfect fit - directly addresses persona needs',
                4: 'Good fit - relevant with minor gaps',
                3: 'Moderate fit - somewhat relevant',
                2: 'Poor fit - tangentially related',
                1: 'No fit - irrelevant to persona'
            }
        }

    def calculate_relevance_scores(self, completed_ratings):
        """Calculate average relevance and inter-rater reliability"""
        import numpy as np
        from scipy.stats import pearsonr

        scores = []
        for rating in completed_ratings:
            rater_scores = [
                rating['rater_1_score'],
                rating['rater_2_score'],
                rating['rater_3_score']
            ]
            avg_score = np.mean(rater_scores)
            scores.append(avg_score)

        # Inter-rater reliability (Pearson correlation)
        rater_1 = [r['rater_1_score'] for r in completed_ratings]
        rater_2 = [r['rater_2_score'] for r in completed_ratings]
        rater_3 = [r['rater_3_score'] for r in completed_ratings]

        corr_12, _ = pearsonr(rater_1, rater_2)
        corr_13, _ = pearsonr(rater_1, rater_3)
        corr_23, _ = pearsonr(rater_2, rater_3)

        return {
            'average_relevance_score': np.mean(scores),
            'relevance_pct': (np.mean(scores) / 5) * 100,
            'inter_rater_reliability': {
                'corr_12': corr_12,
                'corr_13': corr_13,
                'corr_23': corr_23,
                'average': np.mean([corr_12, corr_13, corr_23])
            }
        }
```

#### 11.2.4 Latency Metrics

```python
# /eval/latency.py

import time

class LatencyEvaluator:
    def evaluate_latency(self, num_users=50):
        """
        Measure time to generate recommendations per user

        Target: <5 seconds
        """
        latencies = []

        for user_id in self._sample_users(num_users):
            start = time.time()

            # Generate recommendations (full pipeline)
            self._generate_recommendations(user_id)

            end = time.time()
            latency = end - start
            latencies.append(latency)

        return {
            'num_users': num_users,
            'average_latency_seconds': np.mean(latencies),
            'median_latency_seconds': np.median(latencies),
            'max_latency_seconds': np.max(latencies),
            'min_latency_seconds': np.min(latencies),
            'under_5_seconds_pct': (sum(1 for l in latencies if l < 5) / num_users) * 100,
            'distribution': {
                '<1s': sum(1 for l in latencies if l < 1),
                '1-3s': sum(1 for l in latencies if 1 <= l < 3),
                '3-5s': sum(1 for l in latencies if 3 <= l < 5),
                '>5s': sum(1 for l in latencies if l >= 5)
            }
        }
```

#### 11.2.5 Fairness Metrics

```python
# /eval/fairness.py

class FairnessEvaluator:
    def evaluate_fairness(self, demographic_groups):
        """
        Basic demographic parity check

        Test if recommendation quality is similar across:
        - Age groups
        - Income levels
        - Geographic regions
        """
        results = {}

        for group_name, group_users in demographic_groups.items():
            # Calculate coverage for this group
            coverage = self._calculate_coverage(group_users)

            # Calculate average recommendation quality
            quality = self._calculate_quality(group_users)

            results[group_name] = {
                'num_users': len(group_users),
                'coverage_pct': coverage,
                'avg_recommendations_per_user': quality['avg_count'],
                'avg_relevance_score': quality['avg_relevance']
            }

        # Check for disparities (>10% difference = flag)
        coverage_values = [r['coverage_pct'] for r in results.values()]
        coverage_range = max(coverage_values) - min(coverage_values)

        return {
            'by_group': results,
            'coverage_disparity': coverage_range,
            'disparity_flag': coverage_range > 10,
            'summary': 'Pass' if coverage_range <= 10 else 'Review needed'
        }
```

### 11.3 Evaluation Report Output

```json
{
  "evaluation_timestamp": "2025-11-03T10:30:00Z",
  "dataset": {
    "num_users": 100,
    "num_transactions": 15420,
    "date_range": "2025-05-01 to 2025-11-03"
  },
  "coverage": {
    "users_with_persona": 100,
    "users_with_3plus_behaviors": 97,
    "full_coverage": 97,
    "coverage_pct": 97.0,
    "target": 100.0,
    "status": "NEAR TARGET"
  },
  "explainability": {
    "with_rationale": 485,
    "with_data_citation": 485,
    "with_because_statement": 485,
    "full_explainability": 485,
    "explainability_pct": 100.0,
    "target": 100.0,
    "status": "PASS"
  },
  "latency": {
    "average_latency_seconds": 3.2,
    "median_latency_seconds": 2.9,
    "max_latency_seconds": 6.1,
    "under_5_seconds_pct": 96.0,
    "target": "<5 seconds for >90%",
    "status": "PASS"
  },
  "auditability": {
    "recommendations_with_traces": 485,
    "auditability_pct": 100.0,
    "target": 100.0,
    "status": "PASS"
  },
  "relevance": {
    "sample_size": 20,
    "average_relevance_score": 4.2,
    "relevance_pct": 84.0,
    "inter_rater_reliability": 0.82,
    "status": "GOOD"
  },
  "fairness": {
    "coverage_disparity": 7.5,
    "disparity_flag": false,
    "status": "PASS"
  },
  "code_quality": {
    "total_tests": 15,
    "passing_tests": 15,
    "test_coverage_pct": 87.0,
    "target": "≥10 tests",
    "status": "PASS"
  },
  "overall_status": "PASS"
}
```

---

## 12. Implementation Roadmap

### 12.1 Phased Approach (from PDF page 7)

#### Phase 1: Data Foundation (Week 1)

**Goal**: Generate and validate synthetic dataset

**Tasks**:

- [ ] Research and select Kaggle datasets (credit card transactions, PaySim)
- [ ] Build synthetic data generator
  - User profiles (50-100 users)
  - Accounts (checking, savings, credit cards)
  - Transactions (6 months, realistic patterns)
  - Liabilities (credit card details, student loans)
- [ ] Validate Plaid schema compliance
- [ ] Set up SQLite database
- [ ] Create data ingestion pipeline
- [ ] Generate test dataset

**Deliverables**:

- `synthetic_users.csv`, `synthetic_accounts.csv`, `synthetic_transactions.csv`
- SQLite database with populated tables
- Data generation script with seed for reproducibility

---

#### Phase 2: Feature Engineering (Week 2)

**Goal**: Build signal detection for all behavioral categories

**Tasks**:

- [ ] Implement subscription detector
  - Recurring merchant identification
  - Monthly spend calculation
  - Subscription share of budget
- [ ] Implement savings analyzer
  - Net inflow calculation
  - Growth rate computation
  - Emergency fund coverage
- [ ] Implement credit analyzer
  - Utilization calculation (per card + aggregate)
  - Interest charge detection
  - Minimum payment behavior
- [ ] Implement income analyzer
  - Payroll ACH detection
  - Payment frequency classification
  - Cash flow buffer calculation
- [ ] Write unit tests (≥4 tests, one per detector)

**Deliverables**:

- Feature detection modules
- Signal storage in database
- Test coverage for all detectors

---

#### Phase 3: Persona System (Week 3)

**Goal**: Implement persona assignment and transition tracking

**Tasks**:

- [ ] Define all 5 personas (criteria, focus areas)
- [ ] Implement persona assignment algorithm
  - Priority logic (high util > variable income > student > subscription > savings)
  - Match strength calculation
  - Secondary persona assignment
- [ ] Implement transition tracker
  - Detect persona changes
  - Generate celebration messages
  - Store transitions
- [ ] Test persona assignment on synthetic users
- [ ] Write unit tests (≥3 tests)

**Deliverables**:

- Persona assignment module
- Transition tracking
- All users assigned to personas
- Test coverage

---

#### Phase 4: Recommendations (Week 4)

**Goal**: Build recommendation engine with rationales and content catalog

**Tasks**:

- [ ] Create educational content library
  - Write 3-5 articles per persona (markdown)
  - Create content catalog JSON
  - Add 2-3 calculator concepts
- [ ] Implement content matching (semantic search)
- [ ] Integrate OpenAI GPT-4 for rationale generation
  - Template system
  - LLM polish layer
- [ ] Implement partner offer generator (simulated)
- [ ] Test recommendation generation
- [ ] Write unit tests (≥3 tests)

**Deliverables**:

- Educational content library (15-25 articles)
- Recommendation engine
- LLM integration working
- Generated recommendations for all users

---

#### Phase 5: Guardrails & UX (Week 5)

**Goal**: Add compliance layers and build interfaces

**Tasks**:

- [ ] Implement guardrails
  - Consent management
  - Tone checker (blocklist + LLM)
  - Advice detector
  - Eligibility filtering
  - Disclaimer generator
- [ ] Build operator dashboard (React)
  - Review queue
  - User explorer
  - Decision traces
  - Approval actions
- [ ] Build user dashboard (React)
  - Hero insight
  - Recommendations feed
  - Progress tracker
  - Chat widget
- [ ] Create email templates
- [ ] Write integration tests (≥3 tests)

**Deliverables**:

- Guardrail modules
- Operator dashboard (functional)
- User dashboard (functional)
- Email templates

---

#### Phase 6: Evaluation (Week 6)

**Goal**: Run evaluation harness and document results

**Tasks**:

- [ ] Implement evaluation metrics
  - Coverage evaluator
  - Explainability evaluator
  - Latency evaluator
  - Fairness evaluator
- [ ] Run evaluation on full dataset
- [ ] Conduct manual relevance scoring (20 samples, 3 raters)
- [ ] Generate evaluation report
- [ ] Document limitations
- [ ] Create decision log

**Deliverables**:

- Evaluation report (JSON + PDF summary)
- Metrics dashboard
- Decision log
- Limitations doc

---

### 12.2 Milestones & Success Criteria

| Milestone                         | Criteria                                           | Due        |
| --------------------------------- | -------------------------------------------------- | ---------- |
| **M1: Data Ready**                | 100 users, 10K+ transactions, valid schema         | End Week 1 |
| **M2: Signals Working**           | All 100 users have ≥3 behaviors detected           | End Week 2 |
| **M3: Personas Assigned**         | 100% of users assigned to personas                 | End Week 3 |
| **M4: Recommendations Generated** | All users have 3-5 recommendations with rationales | End Week 4 |
| **M5: UX Functional**             | Operator and user dashboards working               | End Week 5 |
| **M6: Evaluation Complete**       | All metrics calculated, report generated           | End Week 6 |

---

### 12.3 Optional Enhancements (Post-MVP)

**If time permits**, consider:

- [ ] Mobile app mockup in Figma
- [ ] Interactive calculators (emergency fund, debt payoff)
- [ ] Gamification (streaks, challenges, badges)
- [ ] Video content (screen recordings explaining concepts)
- [ ] Infographics (visual guides)
- [ ] Docker containerization
- [ ] Deployment to Vercel/Railway for live demo

---

## 13. Risk Mitigation

### 13.1 Technical Risks

| Risk                             | Impact                                  | Mitigation                                                     |
| -------------------------------- | --------------------------------------- | -------------------------------------------------------------- |
| **LLM API downtime**             | High - Blocks recommendation generation | Use retries, fallback to templates, cache rationales           |
| **Slow LLM responses**           | Medium - Exceeds 5-second latency       | Pre-generate rationales in batch, use faster model (GPT-3.5)   |
| **Synthetic data unrealistic**   | High - Poor persona/recommendation fit  | Validate against academic research, test with reviewers        |
| **Semantic search poor quality** | Medium - Irrelevant content matches     | Supplement with rule-based matching, tune similarity threshold |
| **Database performance**         | Low - SQLite slow on large datasets     | Use indexes, limit to 100 users for prototype                  |

### 13.2 Scope Risks

| Risk                            | Impact                                 | Mitigation                                                   |
| ------------------------------- | -------------------------------------- | ------------------------------------------------------------ |
| **Feature creep**               | High - Miss deadline                   | Stick to MVP scope, use phased roadmap                       |
| **Over-engineering**            | Medium - Complexity without value      | Follow "good enough" principle, avoid premature optimization |
| **Content creation bottleneck** | Medium - Delays recommendation quality | Use GPT-4 to draft articles, focus on 3 per persona minimum  |

### 13.3 Quality Risks

| Risk                          | Impact                             | Mitigation                                                     |
| ----------------------------- | ---------------------------------- | -------------------------------------------------------------- |
| **Shaming language escapes**  | Critical - Violates core principle | Multiple layers (blocklist, LLM check, operator review)        |
| **Financial advice given**    | Critical - Regulatory risk         | Advice detector, operator approval, disclaimers on all content |
| **Persona misclassification** | Medium - Poor recommendations      | Manual validation on sample, clear criteria documentation      |
| **Missing edge cases**        | Low - Incomplete coverage          | Document limitations, operator can catch and flag              |

---

## 14. Kaggle Dataset Recommendations

### 14.1 Recommended Datasets

#### Primary Dataset 1: Credit Card Transactions

**Dataset**: [Credit Card Transactions Fraud Detection Dataset](https://www.kaggle.com/datasets/kartik2112/fraud-detection)

- **Size**: 1.3M transactions
- **Fields**: Transaction date, amount, merchant, category, location, customer demographics
- **Use**: Transaction patterns, merchant categories, spending behaviors
- **Extraction**: Sample 10K-15K transactions, map to 100 users

#### Primary Dataset 2: Synthetic Financial Transactions

**Dataset**: [PaySim Financial Mobile Money Simulator](https://www.kaggle.com/datasets/ealaxi/paysim1)

- **Size**: 6.3M transactions
- **Fields**: Transaction type, amount, sender/receiver balances, timestamps
- **Use**: Transfer patterns, balance flows, income deposits
- **Extraction**: Sample transactions, adapt to bank account context

#### Supplementary Dataset 3: Personal Loan Prediction

**Dataset**: [Loan Prediction Dataset](https://www.kaggle.com/datasets/altruistdelhite04/loan-prediction-problem-dataset)

- **Size**: 614 records
- **Fields**: Income, loan amount, credit history, demographics
- **Use**: Calibrate income distributions, credit score proxies
- **Extraction**: Use for realistic income ranges and credit patterns

### 14.2 Data Synthesis Strategy

```python
# /ingest/kaggle_synthesizer.py

class KaggleSynthesizer:
    def __init__(self):
        self.fraud_df = pd.read_csv('kaggle/fraud_detection.csv')
        self.paysim_df = pd.read_csv('kaggle/paysim.csv')
        self.loan_df = pd.read_csv('kaggle/loan_prediction.csv')

    def create_composite_users(self, num_users=100):
        """
        Merge Kaggle datasets to create composite users

        Strategy:
        1. Sample users from loan dataset (income, demographics)
        2. Assign transactions from fraud dataset (spending patterns)
        3. Add transfer patterns from PaySim (cash flow)
        4. Generate credit card details based on spending
        5. Add student loans for young users
        """

        users = []

        for i in range(num_users):
            # Base demographics from loan dataset
            base = self.loan_df.sample(n=1).iloc[0]

            user = {
                'user_id': f'user_{i:03d}',
                'income': base['ApplicantIncome'],
                'credit_history': base['Credit_History'],
                'age_bracket': self._infer_age(base),
                'transactions': self._assign_transactions(base),
                'accounts': self._generate_accounts(base),
                'liabilities': self._generate_liabilities(base)
            }

            users.append(user)

        return users

    def _assign_transactions(self, user_profile):
        """Assign realistic transactions from fraud dataset"""
        # Filter transactions by similar spending profile
        income_bracket = self._get_income_bracket(user_profile['ApplicantIncome'])

        # Sample transactions matching profile
        similar_transactions = self.fraud_df[
            self.fraud_df['amt'] < (income_bracket / 12)  # Monthly budget
        ].sample(n=150)  # 6 months ~= 150 transactions

        return similar_transactions
```

---

## 15. Testing Strategy

### 15.1 Unit Tests (≥10 Required)

```python
# /tests/test_features.py

def test_subscription_detector():
    """Test recurring merchant detection"""
    detector = SubscriptionDetector()

    # Create test transactions (Netflix 3 times, ~30 days apart)
    transactions = [
        {'merchant': 'Netflix', 'amount': 15.99, 'date': '2025-08-01'},
        {'merchant': 'Netflix', 'amount': 15.99, 'date': '2025-09-01'},
        {'merchant': 'Netflix', 'amount': 15.99, 'date': '2025-10-01'},
    ]

    result = detector.detect_recurring_merchants('user_123', transactions)

    assert len(result['recurring_merchants']) == 1
    assert result['monthly_recurring_spend'] == 15.99

def test_credit_utilization():
    """Test credit utilization calculation"""
    analyzer = CreditAnalyzer()

    card = {
        'balance': 3400,
        'limit': 5000
    }

    utilization = analyzer.calculate_utilization(card)

    assert utilization == 68.0

def test_persona_assignment_high_utilization():
    """Test high utilization persona assignment"""
    assigner = PersonaAssigner()

    signals = {
        'credit': {
            'aggregate_utilization_pct': 72,
            'any_interest_charges': True
        }
    }

    persona = assigner.assign_personas('user_123', signals)

    assert persona['primary_persona'] == 'high_utilization'

def test_persona_assignment_student():
    """Test student persona assignment"""
    assigner = PersonaAssigner()

    signals = {
        'student_loan_account_present': True,
        'user_metadata': {'age_bracket': '18-25'},
        'annual_income': 18000,
        'coffee_food_delivery_monthly': 95
    }

    persona = assigner.assign_personas('user_456', signals)

    assert persona['primary_persona'] == 'student'

def test_tone_checker_blocks_shaming():
    """Test tone checker catches shaming language"""
    checker = ToneChecker()

    bad_text = "You're overspending on wasteful subscriptions"

    result = checker.check_tone(bad_text)

    assert not result['passes']
    assert 'overspending' in str(result['violations'])

def test_advice_detector():
    """Test advice detector catches recommendations"""
    detector = AdviceDetector()

    advice_text = "You should transfer your balance to this card"

    result = detector.detect_advice(advice_text)

    assert result['is_advice']

def test_consent_requirement():
    """Test that recommendations require consent"""
    engine = RecommendationEngine()

    # User without consent
    user_id = 'user_no_consent'

    with pytest.raises(ConsentRequiredError):
        engine.generate_recommendations(user_id)

def test_eligibility_filtering():
    """Test partner offers are filtered by eligibility"""
    checker = EligibilityChecker()

    # User already has savings account
    user_accounts = [{'type': 'savings'}]

    eligible = checker.check_product_eligibility(
        user_accounts,
        'high_yield_savings'
    )

    assert not eligible  # Should not show HYSA offer

def test_rationale_generation():
    """Test LLM rationale includes data citations"""
    generator = RationaleGenerator()

    user_data = {
        'card_type': 'Visa',
        'last4': '4523',
        'utilization': 68,
        'balance': 3400,
        'limit': 5000
    }

    rationale = generator.generate_rationale(
        user_data,
        {'title': 'Credit Utilization'},
        'high_utilization'
    )

    # Should contain specific numbers
    assert '68' in rationale or '3400' in rationale

def test_recommendation_latency():
    """Test recommendations generate within 5 seconds"""
    import time

    engine = RecommendationEngine()

    start = time.time()
    engine.generate_recommendations('user_123')
    end = time.time()

    latency = end - start

    assert latency < 5.0
```

### 15.2 Integration Tests

```python
# /tests/test_e2e.py

def test_end_to_end_pipeline():
    """Test full pipeline from data to recommendations"""

    # 1. Load synthetic data
    loader = DataLoader()
    loader.load_accounts('data/synthetic_accounts.csv')
    loader.load_transactions('data/synthetic_transactions.csv')

    # 2. Detect signals
    feature_pipeline = FeaturePipeline()
    signals = feature_pipeline.run('user_123')

    assert len(signals) > 0

    # 3. Assign persona
    assigner = PersonaAssigner()
    persona = assigner.assign_personas('user_123', signals)

    assert persona['primary_persona'] != 'none'

    # 4. Generate recommendations
    engine = RecommendationEngine()
    recommendations = engine.generate_recommendations('user_123')

    assert len(recommendations['educational_content']) >= 3

    # 5. All recommendations have rationales
    for rec in recommendations['educational_content']:
        assert len(rec['rationale']) > 10

    # 6. Guardrails pass
    for rec in recommendations['educational_content']:
        tone_check = ToneChecker().check_tone(rec['rationale'])
        assert tone_check['passes']

        advice_check = AdviceDetector().detect_advice(rec['rationale'])
        assert not advice_check['is_advice']

def test_operator_workflow():
    """Test operator approval flow"""

    # Generate recommendation
    engine = RecommendationEngine()
    recommendations = engine.generate_recommendations('user_123')
    rec_id = recommendations['educational_content'][0]['id']

    # Operator approves
    operator = OperatorActions()
    result = operator.approve_recommendation('op_001', rec_id, "Looks good")

    assert result['status'] == 'approved'

    # Check audit log
    log = operator.get_audit_log('op_001')
    assert len(log) > 0
```

---

## 16. Documentation Requirements

### 16.1 README.md

````markdown
# SpendSense - Explainable AI for Financial Education

SpendSense transforms transaction data into personalized learning opportunities without crossing into financial advice.

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- OpenAI API key

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/spendsense.git
cd spendsense
```
````

2. Install dependencies

```bash
# Backend
pip install -r requirements.txt

# Frontend
cd ui
npm install
```

3. Set up environment

```bash
cp .env.example .env
# Add your OpenAI API key to .env
```

4. Generate synthetic data

```bash
python ingest/data_generator.py --users 100
```

5. Run the application

```bash
# Backend API
python api/app.py

# Frontend (separate terminal)
cd ui
npm run dev
```

6. Access interfaces

- User Dashboard: http://localhost:3000
- Operator View: http://localhost:3000/operator
- API Docs: http://localhost:8000/docs

## Running Tests

```bash
pytest tests/ -v
```

## Project Structure

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed structure.

## Key Concepts

- **Personas**: 5 behavioral patterns (High Utilization, Variable Income, Student, Subscription-Heavy, Savings Builder)
- **Signals**: Detected behaviors from transaction data
- **Recommendations**: Educational content matched to personas
- **Guardrails**: Consent, tone, eligibility, advice detection

## Documentation

- [Decision Log](docs/DECISION_LOG.md) - Key design decisions
- [Database Schema](docs/SCHEMA.md) - Full schema documentation
- [API Specification](docs/API_SPEC.md) - API endpoints
- [Limitations](docs/LIMITATIONS.md) - Known limitations

## License

MIT

````

### 16.2 Decision Log (docs/DECISION_LOG.md)

```markdown
# SpendSense Decision Log

## 1. Why SQLite over PostgreSQL?
**Decision**: Use SQLite for prototype
**Rationale**:
- Simpler setup (single file)
- Sufficient for 100 users
- Easy to demo (no external DB server)
- Can migrate to PostgreSQL if needed

**Trade-off**: Limited concurrency, no advanced features
**Date**: 2025-11-03

---

## 2. Why Hybrid Content Approach (Static + LLM)?
**Decision**: Pre-built content library + LLM-generated rationales
**Rationale**:
- Editorial control over educational quality
- Faster (meets <5 sec latency requirement)
- LLM adds personalization
- Reduces risk of hallucinations

**Trade-off**: More upfront content creation work
**Date**: 2025-11-03

---

## 3. Why Persona Priority Order?
**Decision**: High Utilization > Variable Income > Student > Subscription > Savings Builder
**Rationale**:
- Financial risk first (credit issues)
- Stability issues second (income)
- Life stage third (student)
- Behavioral optimization fourth
- Positive reinforcement last

**Trade-off**: Some users may want savings content prioritized
**Date**: 2025-11-03

---

## 4. Why No Real Plaid Connection?
**Decision**: Synthetic data only, no live Plaid API
**Rationale**:
- Prototype/educational purpose
- Avoids regulatory complexity
- Faster development
- Fully controlled data

**Trade-off**: Not production-ready
**Date**: 2025-11-03

---

## 5. Why Celebrate Persona Transitions?
**Decision**: Show positive messages when users improve financial behavior
**Rationale**:
- Positive reinforcement encourages continued improvement
- Makes financial progress tangible
- Gamification element increases engagement
- Aligns with educational mission

**Trade-off**: Could feel gimmicky if overdone
**Date**: 2025-11-03
````

### 16.3 Limitations (docs/LIMITATIONS.md)

```markdown
# SpendSense Limitations

## Data Limitations

### Synthetic Data Only

- **Limitation**: Uses synthetic/Kaggle data, not real user transactions
- **Impact**: Patterns may not fully reflect real-world complexity
- **Mitigation**: Calibrated using academic research and realistic distributions

### Limited Transaction History

- **Limitation**: 6 months of data (180 days)
- **Impact**: Long-term trends not detectable
- **Mitigation**: Sufficient for persona detection and educational recommendations

### No Real-Time Data

- **Limitation**: Batch processing, not live transaction feeds
- **Impact**: Can't react to same-day spending
- **Mitigation**: Acceptable for educational content (not time-critical)

---

## AI Limitations

### LLM Hallucinations

- **Limitation**: GPT-4 can generate incorrect information
- **Impact**: Risk of bad advice or false claims
- **Mitigation**: Template-based approach, operator review, advice detector

### Context Window Limits

- **Limitation**: GPT-4 has 8K-128K token limit
- **Impact**: Can't process entire transaction history
- **Mitigation**: Provide summarized signals, not raw transactions

### Cost & Latency

- **Limitation**: OpenAI API calls add cost and latency
- **Impact**: May exceed 5-second target with many LLM calls
- **Mitigation**: Cache rationales, use batch generation, faster model for drafts

---

## Scope Limitations

### No Financial Advice

- **Limitation**: Educational only, not prescriptive recommendations
- **Impact**: Can't tell users "do this specific action"
- **Mitigation**: This is intentional and core to the project

### No Product Integration

- **Limitation**: Partner offers are simulated (not real APIs)
- **Impact**: Users can't directly apply for products
- **Mitigation**: Links to educational content about product types

### Operator Dependency

- **Limitation**: Requires human review before recommendations sent
- **Impact**: Not fully automated
- **Mitigation**: This is a feature (safety layer)

### Limited Persona Sophistication

- **Limitation**: 5 personas may not capture all financial situations
- **Impact**: Some users may not fit neatly
- **Mitigation**: Secondary personas, continuous refinement

---

## Technical Limitations

### Single-User Prototype

- **Limitation**: Not designed for concurrent users
- **Impact**: Can't scale to production
- **Mitigation**: Acceptable for prototype/demo

### No Mobile App

- **Limitation**: Web only (or Figma mockup)
- **Impact**: Less accessible than native app
- **Mitigation**: Responsive web design

### SQLite Performance

- **Limitation**: Slower than PostgreSQL for large datasets
- **Impact**: Queries may be slow with >1000 users
- **Mitigation**: Limited to 100 users

---

## Compliance Limitations

### Not SEC-Regulated

- **Limitation**: Not a registered investment advisor
- **Impact**: Can't provide investment advice
- **Mitigation**: Educational disclaimer on all content

### No Real Consent Flow

- **Limitation**: Simulated consent (no legal review)
- **Impact**: Not legally binding
- **Mitigation**: Prototype only

---

## Future Improvements

1. **Real Data Integration**: Connect to actual Plaid API
2. **More Personas**: Add personas for families, retirees, debt consolidation
3. **Advanced AI**: Multi-agent system like Origin's architecture
4. **Mobile App**: Native iOS/Android apps
5. **Real-Time**: Live transaction monitoring and alerts
6. **Investment Education**: Expand beyond banking to investing
7. **Multi-Language**: Support Spanish, other languages
8. **Accessibility**: Full WCAG 2.1 AA compliance
```

---

## 17. Submission Checklist

### 17.1 Required Deliverables

- [ ] **Code Repository** (GitHub)

  - [ ] All modules implemented and organized
  - [ ] README.md with setup instructions
  - [ ] .gitignore (exclude data, .env)
  - [ ] requirements.txt and package.json

- [ ] **Synthetic Dataset**

  - [ ] 50-100 users
  - [ ] Accounts, transactions, liabilities
  - [ ] CSV files or SQLite database
  - [ ] Data generation script

- [ ] **Feature Pipeline**

  - [ ] All 4 signal categories working
  - [ ] Signals stored in database

- [ ] **Persona System**

  - [ ] All 5 personas defined
  - [ ] Assignment algorithm implemented
  - [ ] Transition tracking

- [ ] **Recommendation Engine**

  - [ ] Content catalog (15-25 articles)
  - [ ] LLM integration (GPT-4)
  - [ ] Rationale generation
  - [ ] Partner offers (simulated)

- [ ] **Guardrails**

  - [ ] Consent management
  - [ ] Tone checker
  - [ ] Advice detector
  - [ ] Eligibility filtering

- [ ] **Operator View**

  - [ ] Review queue
  - [ ] User explorer
  - [ ] Decision traces
  - [ ] Approval actions

- [ ] **User Experience**

  - [ ] Web dashboard OR
  - [ ] Email templates OR
  - [ ] Mobile mockup (Figma)
  - [ ] Chat Q&A interface

- [ ] **Evaluation**

  - [ ] Coverage: ≥90% users with persona + 3+ behaviors
  - [ ] Explainability: 100% recommendations with rationales
  - [ ] Latency: <5 seconds (90%+ of time)
  - [ ] Auditability: 100% decision traces
  - [ ] Evaluation report (JSON + PDF summary)

- [ ] **Tests**

  - [ ] ≥10 unit/integration tests
  - [ ] All tests passing
  - [ ] Test coverage report

- [ ] **Documentation**

  - [ ] Technical writeup (1-2 pages)
  - [ ] Decision log
  - [ ] Database schema doc
  - [ ] API specification
  - [ ] Limitations doc
  - [ ] AI tool usage disclosure

- [ ] **Demo**
  - [ ] Demo video (5-10 minutes) OR
  - [ ] Live presentation
  - [ ] Screenshots of key features

### 17.2 AI Tool Disclosure Example

```markdown
# AI Tools Used in SpendSense Development

## OpenAI GPT-4

**Purpose**:

- Generate personalized rationales for recommendations
- Chat Q&A interface for user questions
- Tone checking (detect shaming language)

**Sample Prompts**:

1. Rationale Generation:
```

System: You are a financial educator. Explain concepts in a friendly way without giving advice.
User: Polish this rationale for clarity: "Your Visa ending in 4523 is at 68% utilization..."

```

2. Chat Q&A:
```

System: You are a financial education assistant. Answer based on user's data.
User: Why does high utilization hurt my credit score?
Context: User has 68% utilization on Visa card with $3,400 balance.

```

## GitHub Copilot
**Purpose**: Code completion and boilerplate generation
**Usage**: ~30% of code (estimates, helper functions, test scaffolds)

## ChatGPT (GPT-4)
**Purpose**:
- Ideation for persona definitions
- Draft educational article outlines
- Debug complex pandas operations

**Sample Prompts**:
```

"Suggest 5 clear criteria for identifying a 'Student' persona in financial data"
"Write an outline for a 500-word article on 'Student Budgeting 101'"

```

## Claude (Anthropic)
**Purpose**: Generate comprehensive PRD, technical documentation

**Sample Prompts**:
```

"Generate a detailed PRD for SpendSense based on the attached project spec PDF..."

```

---

**Declaration**: All AI-generated content was reviewed, edited, and validated by human developers. Code was tested and documentation was fact-checked.
```

---

## 18. Contact & Support

**Project Contact**: Bryce Harris - bharris@peak6.com

**Questions**:

- Technical implementation questions
- Clarifications on requirements
- Scope adjustments

**Office Hours**: [If applicable]

---

## Appendix A: Persona Comparison Table

| Persona                      | Criteria                                                     | Primary Focus                                   | Example User                                                 |
| ---------------------------- | ------------------------------------------------------------ | ----------------------------------------------- | ------------------------------------------------------------ |
| **High Utilization**         | Any card ≥50% OR interest >$0 OR min-payment-only OR overdue | Reduce utilization, debt paydown                | Sarah, 28, $45K income, $8K CC debt at 68% util              |
| **Variable Income Budgeter** | Pay gap >45 days AND buffer <1 month                         | Percent-based budgets, emergency fund           | Alex, 32, freelancer, irregular income, low buffer           |
| **Student**                  | Student loan OR age 18-25 + low income + high food delivery  | Student budgets, loan literacy, credit building | Jordan, 20, college student, part-time job, $95/mo Uber Eats |
| **Subscription-Heavy**       | ≥3 recurring AND (≥$50/mo OR ≥10% of spend)                  | Subscription audit, cancellation tips           | Taylor, 35, $70K income, 7 subscriptions totaling $147/mo    |
| **Savings Builder**          | Growth ≥2% OR inflow ≥$200/mo AND all cards <30%             | Goal setting, automation, APY optimization      | Morgan, 40, $85K income, saving $350/mo, 18% util            |

---

## Appendix B: Educational Content Topics by Persona

### High Utilization (Credit Focus)

1. "Understanding Credit Utilization and Your Credit Score"
2. "How Credit Card Interest Compounds"
3. "Payment Strategies: Avalanche vs. Snowball"
4. "Setting Up Autopay to Avoid Late Fees"
5. "When to Consider Balance Transfers"

### Variable Income Budgeter (Income Stability)

1. "Budgeting with Irregular Income"
2. "Building an Emergency Fund on Variable Income"
3. "The 50/30/20 Rule Adapted for Freelancers"
4. "Cash Flow Forecasting for Gig Workers"
5. "Multiple Income Streams: Pros and Cons"

### Student (Student-Specific)

1. "Student Budgeting 101: Making Your Money Last"
2. "Understanding Your Student Loans"
3. "Building Credit in College"
4. "The $5 Coffee Habit: A Real Cost Analysis"
5. "Part-Time Income Management for Students"

### Subscription-Heavy (Spending Optimization)

1. "The True Cost of Subscriptions"
2. "How to Audit Your Recurring Expenses"
3. "Negotiating Lower Rates on Services"
4. "Subscription Management Tools and Strategies"
5. "Is It Worth It? Evaluating Subscription Value"

### Savings Builder (Wealth Building)

1. "Setting SMART Financial Goals"
2. "Automate Your Savings: Set It and Forget It"
3. "High-Yield Savings Accounts Explained"
4. "When Are You Ready to Start Investing?"
5. "Compound Interest: The Eighth Wonder"

---

## Appendix C: Sample Rationales

### High Utilization Example

**User Data**: Visa card, $3,400 balance, $5,000 limit, 68% utilization, $87/month interest
**Template**: "Your {card_type} ending in {last4} is at {utilization}% utilization (${balance} of ${limit} limit)."
**LLM Output**: "We noticed your Visa ending in 4523 is at 68% utilization ($3,400 of your $5,000 limit). High utilization can impact your credit score and is currently costing you $87/month in interest. Bringing this below 30% could improve both your score and reduce these charges."

### Student Example

**User Data**: Coffee/delivery spend $95/month, age 20, income $18K
**Template**: "Your coffee and food delivery spending totals ${coffee_spend} this month."
**LLM Output**: "Your coffee and food delivery apps total $95 this month—that's about 6% of your monthly income. Many students find that preparing coffee at home and meal prepping can free up $60-70 monthly for savings or other goals."

### Savings Builder Example

**User Data**: Savings grew 3.2%, added $350/month
**Template**: "Your savings grew {growth_rate}% this period."
**LLM Output**: "Your savings grew 3.2% this period with $350 in monthly contributions—great progress! At this rate, you're on track to build a solid emergency fund. Consider automating transfers to make saving even easier."

---

## End of PRD

**Total Pages**: 95+ pages of comprehensive requirements, architecture, and implementation guidance.

**Next Steps**:

1. Review this PRD thoroughly
2. Set up development environment
3. Begin Phase 1: Data Foundation
4. Use this as your north star throughout development

**Questions?** Contact Bryce Harris - bharris@peak6.com

---

**Document Version**: 1.0  
**Last Updated**: November 3, 2025  
**Status**: Ready for Implementation
