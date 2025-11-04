# SpendSense - Example Outputs

This document contains sample outputs from the synthetic data generator to help you understand the data structure and format.

---

## Table of Contents

- [Users](#users)
- [Accounts](#accounts)
- [Transactions](#transactions)
- [Liabilities](#liabilities)
- [Metadata](#metadata)
- [Database Queries](#database-queries)

---

## Users

### Sample User - Young Professional

```json
{
  "user_id": "user_001",
  "name": "Sarah Johnson",
  "email": "user001@example.com",
  "created_at": "2025-11-03T10:00:00Z",
  "metadata": {
    "age": 28,
    "age_bracket": "26-35",
    "income": 65000,
    "income_bracket": "mid",
    "region": "urban",
    "life_stage": "young_professional"
  }
}
```

### Sample User - Student

```json
{
  "user_id": "user_042",
  "name": "Michael Chen",
  "email": "user042@example.com",
  "created_at": "2025-11-03T10:00:00Z",
  "metadata": {
    "age": 22,
    "age_bracket": "18-25",
    "income": 28000,
    "income_bracket": "low",
    "region": "suburban",
    "life_stage": "student"
  }
}
```

### Sample User - High Earner

```json
{
  "user_id": "user_088",
  "name": "Jennifer Martinez",
  "email": "user088@example.com",
  "created_at": "2025-11-03T10:00:00Z",
  "metadata": {
    "age": 42,
    "age_bracket": "36-50",
    "income": 175000,
    "income_bracket": "high",
    "region": "urban",
    "life_stage": "mid_career_high_earner"
  }
}
```

### Life Stage Examples

The generator creates 9 distinct life stages based on age and income:

| Life Stage                      | Age Range | Income Range | Description                            |
| ------------------------------- | --------- | ------------ | -------------------------------------- |
| `student`                       | 18-25     | $20K-$35K    | College students with part-time income |
| `young_professional_struggling` | 26-35     | $20K-$40K    | Entry-level professionals              |
| `young_professional`            | 26-35     | $40K-$75K    | Established early career               |
| `mid_career_comfortable`        | 36-50     | $35K-$100K   | Stable mid-career                      |
| `mid_career_high_earner`        | 36-50     | $100K+       | Peak earning years                     |
| `pre_retirement_struggling`     | 51+       | <$50K        | Limited retirement savings             |
| `pre_retirement_comfortable`    | 51+       | $50K-$100K   | Adequate retirement prep               |
| `pre_retirement_wealthy`        | 51+       | $100K+       | Strong retirement position             |
| `variable_income`               | Any       | Any          | Gig economy/freelance                  |

---

## Accounts

### Checking Account

```json
{
  "account_id": "acc_a1b2c3d4e5f6",
  "user_id": "user_001",
  "type": "checking",
  "subtype": null,
  "name": "Chase Checking",
  "official_name": "Chase Bank N.A.",
  "mask": "4523",
  "available_balance": 12045.32,
  "current_balance": 12045.32,
  "credit_limit": null,
  "iso_currency_code": "USD",
  "holder_category": "personal",
  "created_at": "2025-11-03T10:00:00Z"
}
```

### Savings Account

```json
{
  "account_id": "acc_7g8h9i0j1k2l",
  "user_id": "user_001",
  "type": "savings",
  "subtype": null,
  "name": "Capital One Savings",
  "official_name": "Capital One N.A.",
  "mask": "8821",
  "available_balance": 25100.45,
  "current_balance": 25100.45,
  "credit_limit": null,
  "iso_currency_code": "USD",
  "holder_category": "personal",
  "created_at": "2025-11-03T10:00:00Z"
}
```

### Credit Card

```json
{
  "account_id": "acc_m3n4o5p6q7r8",
  "user_id": "user_001",
  "type": "credit_card",
  "subtype": "rewards",
  "name": "Bank of America Rewards Card",
  "official_name": "Bank of America Corporation",
  "mask": "3356",
  "available_balance": 23478.9,
  "current_balance": 8521.1,
  "credit_limit": 32000.0,
  "iso_currency_code": "USD",
  "holder_category": "personal",
  "created_at": "2025-11-03T10:00:00Z"
}
```

**Note**: For credit cards:

- `current_balance` = amount owed
- `available_balance` = credit_limit - current_balance
- `credit_limit` = total available credit

### Student Loan

```json
{
  "account_id": "acc_s9t0u1v2w3x4",
  "user_id": "user_042",
  "type": "student_loan",
  "subtype": null,
  "name": "Federal Student Loan",
  "official_name": "Federal Student Aid",
  "mask": "1245",
  "available_balance": null,
  "current_balance": 32500.0,
  "credit_limit": null,
  "iso_currency_code": "USD",
  "holder_category": "personal",
  "created_at": "2025-11-03T10:00:00Z"
}
```

### Account Distribution (100 Users)

| Account Type | Count    | Percentage        |
| ------------ | -------- | ----------------- |
| Checking     | 100      | 100% (all users)  |
| Savings      | 62-70    | 62-70%            |
| Credit Card  | 120-160  | 1.2-1.6 per user  |
| Student Loan | 20-30    | 20-30%            |
| **Total**    | **~326** | **3.26 per user** |

---

## Transactions

### Payroll Deposit (Income)

```json
{
  "transaction_id": "txn_a1b2c3d4e5f6",
  "account_id": "acc_checking_001",
  "user_id": "user_001",
  "date": "2025-10-15",
  "amount": 2708.33,
  "merchant_name": "Employer Direct Deposit",
  "merchant_entity_id": "employer_user_001",
  "payment_channel": "other",
  "category_primary": "INCOME",
  "category_detailed": "PAYROLL",
  "pending": false,
  "location_city": null,
  "location_region": null,
  "location_postal_code": null,
  "created_at": "2025-11-03T10:00:00Z"
}
```

**Note**: Amount is positive for income/deposits. Biweekly deposits appear every 14 days, monthly deposits every 30 days.

### Coffee Shop Purchase

```json
{
  "transaction_id": "txn_g7h8i9j0k1l2",
  "account_id": "acc_checking_001",
  "user_id": "user_001",
  "date": "2025-10-15",
  "amount": -5.75,
  "merchant_name": "Starbucks",
  "merchant_entity_id": "merch_coffee_001",
  "payment_channel": "in_store",
  "category_primary": "FOOD_AND_DRINK",
  "category_detailed": "COFFEE_SHOPS",
  "pending": false,
  "location_city": "Austin",
  "location_region": "TX",
  "location_postal_code": "78701",
  "created_at": "2025-11-03T10:00:00Z"
}
```

**Note**: Amount is negative for expenses/debits.

### Grocery Store Purchase

```json
{
  "transaction_id": "txn_m3n4o5p6q7r8",
  "account_id": "acc_checking_001",
  "user_id": "user_001",
  "date": "2025-10-12",
  "amount": -87.42,
  "merchant_name": "Whole Foods",
  "merchant_entity_id": "merch_grocery_001",
  "payment_channel": "in_store",
  "category_primary": "FOOD_AND_DRINK",
  "category_detailed": "GROCERIES",
  "pending": false,
  "location_city": "Austin",
  "location_region": "TX",
  "location_postal_code": "78701",
  "created_at": "2025-11-03T10:00:00Z"
}
```

### Rent Payment

```json
{
  "transaction_id": "txn_s9t0u1v2w3x4",
  "account_id": "acc_checking_001",
  "user_id": "user_001",
  "date": "2025-10-01",
  "amount": -1625.0,
  "merchant_name": "Property Management Co",
  "merchant_entity_id": "merch_rent_001",
  "payment_channel": "other",
  "category_primary": "RENT_AND_UTILITIES",
  "category_detailed": "RENT",
  "pending": false,
  "location_city": null,
  "location_region": null,
  "location_postal_code": null,
  "created_at": "2025-11-03T10:00:00Z"
}
```

**Note**: Rent appears on the 1st of each month (±2 days).

### Subscription Service

```json
{
  "transaction_id": "txn_y5z6a7b8c9d0",
  "account_id": "acc_checking_001",
  "user_id": "user_001",
  "date": "2025-10-15",
  "amount": -15.99,
  "merchant_name": "Netflix",
  "merchant_entity_id": "merch_netflix",
  "payment_channel": "online",
  "category_primary": "ENTERTAINMENT",
  "category_detailed": "SUBSCRIPTION",
  "pending": false,
  "location_city": null,
  "location_region": null,
  "location_postal_code": null,
  "created_at": "2025-11-03T10:00:00Z"
}
```

**Note**: Subscriptions repeat every 30 days on the same date (±1 day).

### Credit Card Purchase

```json
{
  "transaction_id": "txn_e1f2g3h4i5j6",
  "account_id": "acc_credit_001",
  "user_id": "user_001",
  "date": "2025-10-20",
  "amount": -124.99,
  "merchant_name": "Amazon",
  "merchant_entity_id": "merch_amazon_001",
  "payment_channel": "online",
  "category_primary": "SHOPPING",
  "category_detailed": "ONLINE",
  "pending": false,
  "location_city": null,
  "location_region": null,
  "location_postal_code": null,
  "created_at": "2025-11-03T10:00:00Z"
}
```

### Credit Card Payment

```json
{
  "transaction_id": "txn_k7l8m9n0o1p2",
  "account_id": "acc_credit_001",
  "user_id": "user_001",
  "date": "2025-10-25",
  "amount": 500.0,
  "merchant_name": "Credit Card Payment",
  "merchant_entity_id": "payment_from_checking",
  "payment_channel": "other",
  "category_primary": "TRANSFER",
  "category_detailed": "INTERNAL",
  "pending": false,
  "location_city": null,
  "location_region": null,
  "location_postal_code": null,
  "created_at": "2025-11-03T10:00:00Z"
}
```

**Note**: Credit card payments are positive (reducing the balance owed).

### Transaction Categories

| Category               | Subcategories                  | Frequency | Avg Amount  |
| ---------------------- | ------------------------------ | --------- | ----------- |
| **FOOD_AND_DRINK**     | Groceries, Restaurants, Coffee | 60%       | $30-$150    |
| **RENT_AND_UTILITIES** | Rent, Electric, Internet       | 5%        | $80-$1,800  |
| **TRANSPORTATION**     | Gas, Parking                   | 10%       | $35-$60     |
| **SHOPPING**           | Clothing, Electronics, Online  | 15%       | $25-$200    |
| **ENTERTAINMENT**      | Subscriptions, Movies, Gym     | 5%        | $10-$60     |
| **INCOME**             | Payroll, Interest              | 2%        | $500-$3,000 |
| **TRANSFER**           | Internal, Payments             | 3%        | $100-$500   |

---

## Liabilities

### Credit Card Liability

```json
{
  "liability_id": "liab_9289a5a732e1",
  "account_id": "acc_m3n4o5p6q7r8",
  "user_id": "user_001",
  "type": "credit_card",
  "apr_percentage": 18.96,
  "apr_type": "purchase_apr",
  "minimum_payment_amount": 262.32,
  "last_payment_amount": 675.22,
  "last_payment_date": "2025-10-22",
  "next_payment_due_date": "2025-11-28",
  "last_statement_balance": 13023.3,
  "is_overdue": false,
  "interest_rate": null,
  "created_at": "2025-11-03T10:00:00Z"
}
```

**Key Fields**:

- `apr_percentage`: 15.99% - 24.99% (realistic credit card APR)
- `minimum_payment_amount`: 2% of balance or $25 minimum
- `last_payment_amount`: Varies from min payment to 50% of balance
- `is_overdue`: 5% chance (realistic delinquency rate)

### Student Loan Liability

```json
{
  "liability_id": "liab_224cdd70a98c",
  "account_id": "acc_s9t0u1v2w3x4",
  "user_id": "user_042",
  "type": "student_loan",
  "apr_percentage": null,
  "apr_type": null,
  "minimum_payment_amount": 298.97,
  "last_payment_amount": 299.93,
  "last_payment_date": "2025-10-26",
  "next_payment_due_date": "2025-11-18",
  "last_statement_balance": 56048.61,
  "is_overdue": false,
  "interest_rate": 6.66,
  "created_at": "2025-11-03T10:00:00Z"
}
```

**Key Fields**:

- `interest_rate`: 4.5% - 7.5% (federal student loan range)
- `minimum_payment_amount`: $150 - $400 (standard monthly payments)
- `is_overdue`: 0.5% chance (students typically pay on time)

---

## Metadata

### Generation Metadata (metadata.json)

```json
{
  "num_users": 100,
  "num_accounts": 326,
  "num_transactions": 47143,
  "num_liabilities": 164,
  "seed": 42,
  "date_range": "2025-05-01 to 2025-10-31",
  "generation_timestamp": "2025-11-04T10:30:00Z",
  "generation_time_seconds": 0.47,
  "account_type_distribution": {
    "checking": 100,
    "savings": 62,
    "credit_card": 142,
    "student_loan": 22
  },
  "transaction_category_distribution": {
    "FOOD_AND_DRINK": 31543,
    "TRANSPORTATION": 4238,
    "SHOPPING": 7104,
    "ENTERTAINMENT": 2356,
    "RENT_AND_UTILITIES": 1800,
    "INCOME": 600,
    "TRANSFER": 502
  },
  "data_quality": {
    "missing_required_fields_pct": 0.0,
    "missing_optional_fields_pct": 0.02,
    "foreign_key_integrity_pct": 100.0,
    "unique_transaction_amounts_pct": 89.5
  }
}
```

---

## Database Queries

### Common Query Examples

#### Get User Summary

```sql
SELECT
    u.user_id,
    u.name,
    json_extract(u.metadata, '$.age') as age,
    json_extract(u.metadata, '$.income') as income,
    COUNT(DISTINCT a.account_id) as num_accounts,
    COUNT(t.transaction_id) as num_transactions,
    SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END) as total_income,
    SUM(CASE WHEN t.amount < 0 THEN ABS(t.amount) ELSE 0 END) as total_expenses
FROM users u
LEFT JOIN accounts a ON u.user_id = a.user_id
LEFT JOIN transactions t ON a.account_id = t.account_id
GROUP BY u.user_id
LIMIT 5;
```

**Sample Output**:

| user_id  | name          | age | income | num_accounts | num_transactions | total_income | total_expenses |
| -------- | ------------- | --- | ------ | ------------ | ---------------- | ------------ | -------------- |
| user_001 | Sarah Johnson | 28  | 65000  | 3            | 487              | 32500.00     | 29800.45       |
| user_002 | John Smith    | 34  | 82000  | 4            | 521              | 41000.00     | 38200.78       |
| user_003 | Emily Davis   | 22  | 28000  | 2            | 312              | 14000.00     | 13450.32       |

#### Get Monthly Spending by Category

```sql
SELECT
    strftime('%Y-%m', date) as month,
    category_primary,
    COUNT(*) as transaction_count,
    SUM(ABS(amount)) as total_spent
FROM transactions
WHERE user_id = 'user_001' AND amount < 0
GROUP BY month, category_primary
ORDER BY month, total_spent DESC;
```

**Sample Output**:

| month   | category_primary   | transaction_count | total_spent |
| ------- | ------------------ | ----------------- | ----------- |
| 2025-05 | FOOD_AND_DRINK     | 42                | 1,245.32    |
| 2025-05 | RENT_AND_UTILITIES | 2                 | 1,705.00    |
| 2025-05 | TRANSPORTATION     | 8                 | 389.45      |
| 2025-06 | FOOD_AND_DRINK     | 45                | 1,312.89    |

#### Get Credit Card Utilization

```sql
SELECT
    a.account_id,
    a.name,
    a.current_balance,
    a.credit_limit,
    ROUND(100.0 * a.current_balance / a.credit_limit, 2) as utilization_pct,
    l.apr_percentage,
    l.minimum_payment_amount,
    l.is_overdue
FROM accounts a
JOIN liabilities l ON a.account_id = l.account_id
WHERE a.type = 'credit_card' AND a.user_id = 'user_001';
```

**Sample Output**:

| account_id  | name        | current_balance | credit_limit | utilization_pct | apr_percentage | minimum_payment | is_overdue |
| ----------- | ----------- | --------------- | ------------ | --------------- | -------------- | --------------- | ---------- |
| acc_m3n4... | BoA Rewards | 8521.10         | 32000.00     | 26.63           | 18.96          | 262.32          | 0          |
| acc_p6q7... | Wells Fargo | 4125.88         | 38500.00     | 10.72           | 21.45          | 82.52           | 0          |

#### Detect Recurring Transactions

```sql
WITH recurring AS (
    SELECT
        merchant_name,
        category_detailed,
        COUNT(*) as occurrence_count,
        AVG(ABS(amount)) as avg_amount,
        MIN(date) as first_date,
        MAX(date) as last_date
    FROM transactions
    WHERE user_id = 'user_001' AND amount < 0
    GROUP BY merchant_name, category_detailed
    HAVING occurrence_count >= 3
)
SELECT * FROM recurring
ORDER BY occurrence_count DESC
LIMIT 10;
```

**Sample Output**:

| merchant_name          | category_detailed | occurrence_count | avg_amount | first_date | last_date  |
| ---------------------- | ----------------- | ---------------- | ---------- | ---------- | ---------- |
| Property Management Co | RENT              | 6                | 1625.00    | 2025-05-01 | 2025-10-01 |
| Netflix                | SUBSCRIPTION      | 6                | 15.99      | 2025-05-15 | 2025-10-15 |
| Starbucks              | COFFEE_SHOPS      | 91               | 5.85       | 2025-05-02 | 2025-10-30 |
| Whole Foods            | GROCERIES         | 83               | 92.34      | 2025-05-03 | 2025-10-29 |

---

## CSV Format Examples

### synthetic_users.csv

```csv
user_id,name,email,created_at,metadata
user_001,Sarah Johnson,user001@example.com,2025-11-03T10:00:00Z,"{""age"": 28, ""income"": 65000, ""region"": ""urban""}"
user_002,John Smith,user002@example.com,2025-11-03T10:00:00Z,"{""age"": 34, ""income"": 82000, ""region"": ""suburban""}"
```

### synthetic_accounts.csv

```csv
account_id,user_id,type,name,mask,current_balance,credit_limit
acc_a1b2c3d4e5f6,user_001,checking,Chase Checking,4523,12045.32,
acc_7g8h9i0j1k2l,user_001,savings,Capital One Savings,8821,25100.45,
acc_m3n4o5p6q7r8,user_001,credit_card,BoA Rewards Card,3356,8521.10,32000.00
```

### synthetic_transactions.csv

```csv
transaction_id,account_id,user_id,date,amount,merchant_name,category_primary,category_detailed
txn_a1b2c3d4e5f6,acc_a1b2c3d4e5f6,user_001,2025-10-15,2708.33,Employer Direct Deposit,INCOME,PAYROLL
txn_g7h8i9j0k1l2,acc_a1b2c3d4e5f6,user_001,2025-10-15,-5.75,Starbucks,FOOD_AND_DRINK,COFFEE_SHOPS
```

---

## File Sizes (100 Users)

| File                         | Size        | Record Count |
| ---------------------------- | ----------- | ------------ |
| `synthetic_users.csv`        | 2.3 KB      | 100          |
| `synthetic_accounts.csv`     | 5.1 KB      | 326          |
| `synthetic_transactions.csv` | 751 KB      | 47,143       |
| `synthetic_liabilities.csv`  | 2.6 KB      | 164          |
| `metadata.json`              | 794 B       | 1            |
| **Total**                    | **~760 KB** | **47,733**   |

Database size after loading: **8.1 MB**

---

**Last Updated**: November 4, 2025
