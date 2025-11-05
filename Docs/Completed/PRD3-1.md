# Persona System - Quick Reference

**Version:** 1.0  
**Date:** November 3, 2025  
**Project:** SpendSense - Explainable AI for Financial Education

---

## 📁 Module Structure

```
/personas
├── __init__.py
├── definitions.py          # Persona criteria definitions
├── assignment.py           # Assignment algorithm (PersonaAssigner)
├── transitions.py          # Transition tracking (PersonaTransitionTracker)
└── matcher.py              # Match strength calculation
```

---

## 🎯 Persona Priority Order

When multiple personas match, assign in this order:

1. **High Utilization** (financial risk)
2. **Variable Income Budgeter** (stability risk)
3. **Student** (life stage specific)
4. **Subscription-Heavy** (behavioral optimization)
5. **Savings Builder** (positive reinforcement)

---

## 📊 Persona Quick Summary

| Persona                | Key Criteria                                    | Priority    |
| ---------------------- | ----------------------------------------------- | ----------- |
| **High Utilization**   | Credit util ≥50% OR interest charges OR overdue | 1 (Highest) |
| **Variable Income**    | Pay gap >45d AND buffer <1mo                    | 2           |
| **Student**            | Has loan OR age 18-25 + 2 supporting signals    | 3           |
| **Subscription-Heavy** | ≥3 subscriptions AND (≥$50/mo OR ≥10% of spend) | 4           |
| **Savings Builder**    | Savings growth ≥2% AND all cards <30% util      | 5           |

---

## 🔗 Shard Navigation

| Shard      | Purpose              | When to Use                      |
| ---------- | -------------------- | -------------------------------- |
| **PRD_01** | Persona Definitions  | Always open as reference         |
| **PRD_02** | Assignment Algorithm | Implementing PersonaAssigner     |
| **PRD_03** | Transitions          | Implementing transition tracking |
| **PRD_04** | Data/API             | Database and endpoints           |
| **PRD_05** | Testing              | Writing tests and validation     |

---

## 🗄️ Database Tables

**user_personas**

- Stores persona assignments
- Key fields: user_id, primary_persona, criteria_met, assigned_at

**persona_transitions**

- Tracks persona changes
- Key fields: user_id, from_persona, to_persona, milestone_achieved

---

## 📦 Key Dependencies

```python
# Standard library
from datetime import datetime, timedelta
import json
from typing import Dict, List, Optional, Tuple

# Database
import sqlite3  # or sqlalchemy
```

---

## 🔑 Common Signal Field Names

```python
# Credit signals
credit['aggregate_utilization_pct']
credit['any_card_high_util']
credit['any_interest_charges']
credit['any_overdue']

# Income signals
income['median_pay_gap_days']
income['cash_flow_buffer_months']
income['income_variability_pct']

# Subscription signals
subscriptions['recurring_merchant_count']
subscriptions['monthly_recurring_spend']
subscriptions['subscription_share_pct']

# Savings signals
savings['savings_growth_rate_pct']
savings['net_savings_inflow']
```

---

## 🎓 Cursor Usage Tips

### Starting a new implementation:

```
@PRD_00_Quick_Reference.md (always)
@PRD_01_Persona_Definitions.md (always)
@PRD_02_Assignment_Algorithm.md (for current task)
```

### Example prompt:

```
"Implement the _check_high_utilization method from PRD_02,
using criteria from PRD_01 section 4.2. Focus on the ANY logic
for card utilization, interest charges, and overdue status."
```

---

## ✅ Implementation Checklist

- [ ] Setup module structure
- [ ] Implement database schema (PRD_04)
- [ ] Implement PersonaAssigner class (PRD_02)
- [ ] Implement each persona check method (PRD_02)
- [ ] Implement match strength calculation (PRD_02)
- [ ] Implement PersonaTransitionTracker (PRD_03)
- [ ] Implement celebration messages (PRD_03)
- [ ] Create API endpoints (PRD_04)
- [ ] Write unit tests (PRD_05)
- [ ] Validate on synthetic data (PRD_05)

---

## 🚀 Quick Commands

```python
# Assign persona
assigner = PersonaAssigner(db_connection)
assignment = assigner.assign_personas('user_123', window_type='30d')

# Check transitions
tracker = PersonaTransitionTracker(db_connection)
transition = tracker.detect_transition('user_123')

# Store assignment
assignment_id = assigner.store_assignment(assignment)
```

---

## 📈 Success Metrics

| Metric               | Target                   |
| -------------------- | ------------------------ |
| Coverage             | 100% users assigned      |
| Explainability       | 100% include criteria    |
| Performance          | <500ms per assignment    |
| Transition Detection | 100% of changes detected |

---

**Pro Tip:** Keep this file open in Cursor alongside the specific shard you're working on for quick context switching.

# PRD Shard 01: Persona Definitions

**Version:** 1.0  
**Date:** November 3, 2025  
**Feature Owner:** Bryce Harris  
**Project:** SpendSense - Explainable AI for Financial Education

---

## 🔗 Shard Dependencies

- **Requires:** None (foundation document)
- **Consumed by:** PRD_02 (Assignment), PRD_03 (Transitions), PRD_05 (Testing)
- **Related:** PRD_00 (Quick Reference)

---

## Executive Summary

The Persona System classifies users into 5 behavioral personas based on detected financial signals. This classification enables personalized educational content recommendations and tracks users' financial progress through persona transitions. Unlike subjective profiling, this system uses quantitative criteria to ensure transparency and auditability.

### Core Value Proposition

Provide structured behavioral classification that:

- **Evidence-based**: Persona assignment backed by specific signal criteria
- **Explainable**: Clear rationale for why each persona was assigned
- **Dynamic**: Tracks transitions between personas over time
- **Celebratory**: Recognizes positive financial progress

---

## Feature Overview

### Problem Statement

Financial education needs differ dramatically based on user behavior. A user with high credit card utilization needs different guidance than a student learning to budget. The Persona System creates meaningful user segments to:

- Target educational content appropriately
- Prioritize the most impactful recommendations
- Track financial behavior improvement over time
- Celebrate positive changes

### User Stories

**As a recommendation engine**, I want to know a user's persona so that I can match them with relevant educational content.

**As an operator**, I want to see why a user was assigned a specific persona so that I can validate the classification logic.

**As a user**, I want to be recognized when I improve my financial behavior so that I feel motivated to continue.

**As a data scientist**, I want to track persona transitions over time so that I can measure the effectiveness of educational interventions.

### Scope

**In Scope:**

- ✅ 5 persona definitions with quantitative criteria
- ✅ Persona assignment algorithm with priority ordering
- ✅ Secondary persona assignment (up to 2)
- ✅ Match strength calculation (strong/moderate/weak)
- ✅ Transition detection and tracking
- ✅ Celebration message generation for positive transitions
- ✅ Historical persona tracking (30d and 180d windows)

**Out of Scope:**

- ❌ Machine learning-based persona prediction
- ❌ Custom user-defined personas
- ❌ Persona mixing/hybrid personas
- ❌ Real-time persona updates (batch processing only)

---

## Persona Priority Order

When multiple personas match, assign in this priority order:

1. **High Utilization** (financial risk)
2. **Variable Income Budgeter** (stability risk)
3. **Student** (life stage specific)
4. **Subscription-Heavy** (behavioral optimization)
5. **Savings Builder** (positive reinforcement)

**Rationale**: Financial risk issues (credit, income stability) take precedence over optimization opportunities.

---

## Persona 1: High Utilization

### Definition

Users with high credit card utilization, interest charges, or overdue accounts who need credit health education.

### Criteria (ANY of the following)

```python
{
    'any_card_utilization_gte_50': bool,      # Any card ≥50% utilization
    'any_interest_charges': bool,              # Interest charges > $0
    'minimum_payment_only': bool,              # Only paying minimum on any card
    'any_overdue': bool                        # Any card is overdue
}
```

### Primary Focus

- Reduce credit utilization below 30%
- Understand credit score impact
- Payment planning strategies
- Autopay setup
- Debt paydown methods (avalanche vs. snowball)

### Educational Topics

1. "Understanding Credit Utilization and Credit Scores"
2. "How Interest Compounds on Credit Cards"
3. "Payment Strategies: More Than the Minimum"
4. "Setting Up Autopay to Avoid Late Fees"
5. "Debt Paydown: Avalanche vs. Snowball Method"

### Example User Profile

```
Name: Sarah
Age: 28
Income: $45K
Credit Cards: 2
  - Visa: $3,400 / $5,000 (68% utilization)
  - Mastercard: $2,100 / $8,000 (26% utilization)
Aggregate Utilization: 55%
Interest Charges: $87/month
Status: Overdue on Visa

Persona Match: HIGH UTILIZATION (Strong)
Criteria Met:
  - any_card_utilization_gte_50: True (Visa at 68%)
  - any_interest_charges: True ($87/month)
  - any_overdue: True (Visa overdue)
```

### Match Strength Guidelines

- **Strong**: Utilization ≥70% OR any overdue accounts
- **Moderate**: Utilization 50-69% with interest charges
- **Weak**: Just meets minimum criteria (any single criterion)

---

## Persona 2: Variable Income Budgeter

### Definition

Users with irregular income patterns and low cash flow buffers who need income-smoothing strategies.

### Criteria (ALL of the following)

```python
{
    'median_pay_gap_days_gt_45': bool,        # Payment gaps >45 days
    'cash_flow_buffer_lt_1_month': bool       # Buffer <1 month of expenses
}
```

**Additional Supporting Signals** (strengthen match):

- Income variability >20%
- Income type: 'freelance' or 'mixed'
- Checking account frequently near zero

### Primary Focus

- Percent-based budgeting (not fixed dollars)
- Emergency fund building
- Income smoothing strategies
- Multiple income stream management
- Cash flow forecasting

### Educational Topics

1. "Budgeting with Irregular Income"
2. "Building an Emergency Fund on Variable Income"
3. "The 50/30/20 Rule Adapted for Freelancers"
4. "Cash Flow Forecasting for Gig Workers"
5. "Multiple Income Streams: Pros and Cons"

### Example User Profile

```
Name: Alex
Age: 32
Income: Freelance, variable
Payment Frequency: Irregular (gaps 45-90 days)
Income Variability: 35%
Checking Balance: $800
Monthly Expenses: $2,500
Cash Flow Buffer: 0.32 months

Persona Match: VARIABLE INCOME BUDGETER (Strong)
Criteria Met:
  - median_pay_gap_days_gt_45: True (60 days)
  - cash_flow_buffer_lt_1_month: True (0.32 months)
```

### Match Strength Guidelines

- **Strong**: Buffer <0.5 months AND variability >30%
- **Moderate**: Buffer <1.0 months AND variability >20%
- **Weak**: Just meets minimum criteria

---

## Persona 3: Student

### Definition

Students or recent graduates with limited income, student loans, and high lifestyle spending who need foundational financial education.

### Criteria (MAJOR + SUPPORTING)

**Major Criteria (need 1):**

```python
{
    'has_student_loan': bool,                 # Student loan account present
    'age_18_25': bool,                        # Age bracket 18-25
    'low_transaction_volume_high_essentials': bool  # <50 trans/month + >40% essentials
}
```

**Supporting Criteria (need 2):**

```python
{
    'income_lt_30k': bool,                    # Annual income <$30K
    'irregular_income': bool,                  # Part-time, internships
    'high_coffee_food_delivery': bool,        # ≥$75/month on coffee/delivery
    'limited_credit_history': bool,           # ≤2 credit accounts
    'rent_no_mortgage': bool                   # Paying rent, no mortgage
}
```

### Primary Focus

- Student budget basics
- Student loan literacy (interest, repayment options)
- Building credit as a student
- Avoiding common student money mistakes
- Coffee/food delivery optimization

### Educational Topics

1. "Student Budgeting 101: Making Your Money Last"
2. "Understanding Your Student Loans"
3. "Building Credit in College"
4. "The $5 Coffee Habit: A Real Cost Analysis"
5. "Part-Time Income Management for Students"

### Example User Profile

```
Name: Jordan
Age: 20
Income: $18K (part-time)
Student Loan: $15K at 4.5%
Transaction Volume: 35/month
Coffee/Delivery Spend: $95/month
Credit Cards: 1 (secured card)

Persona Match: STUDENT (Strong)
Criteria Met:
Major:
  - has_student_loan: True
  - age_18_25: True
Supporting:
  - income_lt_30k: True ($18K)
  - high_coffee_food_delivery: True ($95/month)
  - limited_credit_history: True (1 card)
```

### Match Strength Guidelines

- **Strong**: Has student loan + ≥3 supporting criteria
- **Moderate**: 1 major + 2 supporting criteria
- **Weak**: Just meets minimum (1 major + 2 supporting)

---

## Persona 4: Subscription-Heavy

### Definition

Users with multiple recurring subscriptions consuming significant portions of their budget who need spending optimization.

### Criteria (ALL of the following)

```python
{
    'recurring_merchants_gte_3': bool,        # ≥3 recurring merchants
    'subscription_threshold_met': bool        # Monthly ≥$50 OR share ≥10%
}
```

Where `subscription_threshold_met` is:

```python
monthly_recurring_spend >= 50.0 OR subscription_share_pct >= 10.0
```

### Primary Focus

- Subscription audit strategies
- Cancellation/negotiation tips
- Bill tracking and alerts
- Value assessment of recurring services
- Subscription management tools

### Educational Topics

1. "The True Cost of Subscriptions"
2. "How to Audit Your Recurring Expenses"
3. "Negotiating Lower Rates on Services"
4. "Subscription Management Tools and Strategies"
5. "Is It Worth It? Evaluating Subscription Value"

### Example User Profile

```
Name: Taylor
Age: 35
Income: $70K
Recurring Subscriptions: 7
  - Netflix: $15.99
  - Spotify: $10.99
  - HBO Max: $15.99
  - Amazon Prime: $14.99
  - Planet Fitness: $24.99
  - NYT Digital: $17.00
  - Adobe Creative: $52.99
Monthly Subscription Spend: $152.94
Subscription Share: 14.2% of total spend

Persona Match: SUBSCRIPTION-HEAVY (Strong)
Criteria Met:
  - recurring_merchants_gte_3: True (7 subscriptions)
  - monthly_recurring_spend_gte_50: True ($152.94)
  - subscription_share_gte_10: True (14.2%)
```

### Match Strength Guidelines

- **Strong**: ≥5 subscriptions AND share ≥15%
- **Moderate**: ≥3 subscriptions AND share ≥10%
- **Weak**: Just meets minimum criteria

---

## Persona 5: Savings Builder

### Definition

Users actively building savings with healthy credit who need goal-setting and optimization strategies.

### Criteria (ALL of the following)

```python
{
    'savings_growth_or_inflow': bool,         # Growth ≥2% OR inflow ≥$200/month
    'all_cards_utilization_lt_30': bool       # All credit cards <30% utilization
}
```

### Primary Focus

- SMART financial goal setting
- Savings automation strategies
- APY optimization (HYSA, CDs)
- Investment readiness education
- Advanced saving techniques

### Educational Topics

1. "Setting SMART Financial Goals"
2. "Automate Your Savings: Set It and Forget It"
3. "High-Yield Savings Accounts Explained"
4. "When Are You Ready to Start Investing?"
5. "Compound Interest: The Eighth Wonder"

### Example User Profile

```
Name: Morgan
Age: 40
Income: $85K
Savings Balance: $12,000
Savings Growth: 3.2% over 6 months
Monthly Savings Inflow: $350
Credit Cards: 2
  - Card 1: $500 / $5,000 (10%)
  - Card 2: $1,200 / $8,000 (15%)
Aggregate Utilization: 13%

Persona Match: SAVINGS BUILDER (Strong)
Criteria Met:
  - savings_growth_rate_gte_2: True (3.2%)
  - monthly_inflow_gte_200: True ($350)
  - all_cards_utilization_lt_30: True (13% aggregate)
```

### Match Strength Guidelines

- **Strong**: Growth ≥5% AND inflow ≥$400
- **Moderate**: Growth ≥2% OR inflow ≥$200
- **Weak**: Just meets minimum criteria

---

## Persona Decision Matrix

| Signals                | High Util | Var Income | Student | Sub-Heavy | Savings |
| ---------------------- | --------- | ---------- | ------- | --------- | ------- |
| **Credit util ≥50%**   | ✅        | ❌         | ❌      | ❌        | ❌      |
| **Interest charges**   | ✅        | ❌         | ❌      | ❌        | ❌      |
| **Overdue accounts**   | ✅        | ❌         | ❌      | ❌        | ❌      |
| **Pay gap >45d**       | ❌        | ✅         | ❌      | ❌        | ❌      |
| **Buffer <1mo**        | ❌        | ✅         | ✅      | ❌        | ❌      |
| **Student loan**       | ❌        | ❌         | ✅      | ❌        | ❌      |
| **Age 18-25**          | ❌        | ❌         | ✅      | ❌        | ❌      |
| **≥3 subscriptions**   | ❌        | ❌         | ❌      | ✅        | ❌      |
| **Sub spend ≥$50**     | ❌        | ❌         | ❌      | ✅        | ❌      |
| **Savings growth ≥2%** | ❌        | ❌         | ❌      | ❌        | ✅      |
| **All cards <30%**     | ❌        | ❌         | ❌      | ❌        | ✅      |

---

## Signal Field Reference

### Credit Signals

```python
credit = {
    'aggregate_utilization_pct': float,      # Overall utilization
    'any_card_high_util': bool,              # Any card ≥50%
    'any_interest_charges': bool,            # Any interest >$0
    'any_overdue': bool,                     # Any overdue accounts
    'num_credit_cards': int,                 # Number of cards
    'cards': [                               # Individual card details
        {
            'utilization_pct': float,
            'minimum_payment_only': bool
        }
    ]
}
```

### Income Signals

```python
income = {
    'median_pay_gap_days': int,              # Days between payments
    'cash_flow_buffer_months': float,        # Months of expenses
    'income_variability_pct': float,         # Income variation
    'payment_frequency': str,                # 'regular', 'irregular'
    'income_type': str                       # 'salary', 'freelance', 'mixed'
}
```

### Subscription Signals

```python
subscriptions = {
    'recurring_merchant_count': int,         # Number of subscriptions
    'monthly_recurring_spend': float,        # Total monthly spend
    'subscription_share_pct': float,         # % of total spending
    'coffee_food_delivery_monthly': float,   # Specific category
    'merchants': [str]                       # List of merchant names
}
```

### Savings Signals

```python
savings = {
    'savings_growth_rate_pct': float,        # Growth rate
    'net_savings_inflow': float,             # Monthly inflow
    'total_savings_balance': float,          # Current balance
    'emergency_fund_months': float           # Months of coverage
}
```

### User Metadata

```python
user_metadata = {
    'age_bracket': str,                      # '18-25', '26-35', etc.
    'annual_income': float,
    'student_loan_account_present': bool,
    'has_rent_transactions': bool,
    'has_mortgage': bool,
    'transaction_count_monthly': int,
    'essentials_pct': float
}
```

---

## Implementation Notes

### General Persona Assignment Rules

1. **Priority trumps match strength**: A "weak" match for High Utilization beats a "strong" match for Subscription-Heavy
2. **Secondary personas**: Assign up to 2 additional matching personas (in priority order)
3. **General persona**: Fallback when no specific persona matches
4. **Deterministic**: Same signals always produce same persona assignment

### Edge Cases

**Multiple strong matches:**

- Follow priority order strictly
- Strongest match becomes primary, rest become secondary

**Borderline criteria:**

- If user is at exact threshold (e.g., 50% utilization), they match
- Use ≥ for thresholds, not >

**Missing signals:**

- If critical signals missing, persona cannot be assigned
- Fall back to 'general' persona with note in criteria_met

**Conflicting personas:**

- Example: High savings + high utilization → High Utilization wins (priority 1 vs 5)
- Document both in secondary_personas array

---

## Next Steps

After understanding these definitions:

1. **→ Go to PRD_02**: Implement the assignment algorithm using these criteria
2. **→ Reference PRD_04**: For signal data structure in database
3. **→ Use PRD_05**: For test cases validating each persona

---

**Pro Tip for Cursor:** Keep this file open as a reference tab while implementing assignment logic in PRD_02. All persona criteria details are here.
