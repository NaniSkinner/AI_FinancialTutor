# SpendSense

## Your Financial Learning Hub

**Version 1.0** | **November 4, 2025**

A comprehensive financial education platform combining synthetic data generation with AI-powered insights and recommendations. SpendSense provides realistic user profiles, bank accounts, and transaction histories following Plaid's schema conventions, enabling intelligent financial guidance and operator oversight.

---

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Usage](#usage)
- [Architecture](#architecture)
- [Data Schema](#data-schema)
- [Configuration](#configuration)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## Features

- **Realistic Synthetic Data**: Generates 50-100 users with authentic financial patterns
- **Plaid-Compliant Schema**: Follows Plaid API conventions for accounts, transactions, and liabilities
- **Rich Demographics**: Age-based income correlation, geographic diversity, life stages
- **Transaction Patterns**: Payroll deposits, recurring expenses, random spending, seasonal variance
- **Multiple Account Types**: Checking, savings, credit cards, student loans
- **Data Quality**: 100% foreign key integrity, 0% missing required fields
- **Reproducible**: Seed-based generation ensures consistent outputs
- **Fast**: Generates 100 users with 47K+ transactions in <1 second

### Data Coverage

| Entity           | Count (100 users) | Details                                                              |
| ---------------- | ----------------- | -------------------------------------------------------------------- |
| **Users**        | 100               | Demographics, income, age, life stage                                |
| **Accounts**     | 326               | Checking (100%), savings (70%), credit cards (1.4/user), loans (22%) |
| **Transactions** | 47,143            | 6 months (May-Oct 2025), avg 471 per user                            |
| **Liabilities**  | 164               | APR, payment schedules, overdue status                               |

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/spendsense.git
cd spendsense

# Install dependencies
pip install -r requirements.txt

# Generate synthetic data (100 users)
python generate_data.py

# Load into SQLite database
python -c "from ingest.loader import DataLoader; loader = DataLoader(); loader.load_all('data/')"

# View the data
python view_data.py
```

**Output**: 4 CSV files + metadata.json in `data/` directory, loaded into `spendsense.db`

---

## Installation

### Prerequisites

- Python 3.8 or higher
- pip package manager
- 50MB disk space

### Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

**Dependencies**:

- `pandas>=1.5.0` - Data manipulation
- `faker>=20.0.0` - Name and data generation
- `numpy>=1.24.0` - Numerical operations
- `pytest>=7.4.0` - Testing framework (optional)

### Step 2: Verify Installation

```bash
python -c "from ingest.data_generator import SyntheticDataGenerator; print('✓ Installation successful')"
```

---

## Usage

### Command-Line Interface

#### Basic Usage

```bash
# Generate default 100 users with seed=42
python generate_data.py
```

#### Advanced Options

```bash
# Generate 50 users
python generate_data.py --num-users 50

# Use custom seed for reproducibility
python generate_data.py --seed 123

# Save to custom directory
python generate_data.py --output-dir my_data/

# Quiet mode (suppress progress messages)
python generate_data.py --quiet

# Quick test with 10 users
python generate_data.py --num-users 10
```

#### CLI Arguments

| Argument       | Default | Description                          |
| -------------- | ------- | ------------------------------------ |
| `--num-users`  | 100     | Number of users to generate (1-1000) |
| `--seed`       | 42      | Random seed for reproducibility      |
| `--output-dir` | `data/` | Output directory for CSV files       |
| `--quiet`      | False   | Suppress progress messages           |

### Python API

#### Generate Data Programmatically

```python
from ingest.data_generator import SyntheticDataGenerator

# Initialize generator
generator = SyntheticDataGenerator(num_users=100, seed=42)

# Generate all data
metadata = generator.generate_all(output_dir='data/')

# Access individual components
users_df = generator.generate_users()
accounts_df = generator.generate_accounts(users_df)
transactions_df = generator.generate_transactions(accounts_df)
liabilities_df = generator.generate_liabilities(accounts_df)
```

#### Load Data into Database

```python
from ingest.loader import DataLoader

# Initialize loader
loader = DataLoader(db_path='spendsense.db')

# Load all CSV files
loader.load_all(data_dir='data/')

# Or load individually
loader.load_users('data/synthetic_users.csv')
loader.load_accounts('data/synthetic_accounts.csv')
loader.load_transactions('data/synthetic_transactions.csv')
loader.load_liabilities('data/synthetic_liabilities.csv')
```

#### Validate Data

```python
from ingest.validator import SchemaValidator
import pandas as pd

validator = SchemaValidator()

# Validate users
users_df = pd.read_csv('data/synthetic_users.csv')
validator.validate_users(users_df)  # Raises ValueError if invalid

# Validate transactions
transactions_df = pd.read_csv('data/synthetic_transactions.csv')
validator.validate_transactions(transactions_df)
```

### Query the Database

```python
import sqlite3

conn = sqlite3.connect('spendsense.db')

# Get user summary
query = """
SELECT
    u.user_id,
    u.name,
    COUNT(DISTINCT a.account_id) as num_accounts,
    COUNT(t.transaction_id) as num_transactions,
    SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END) as total_income,
    SUM(CASE WHEN t.amount < 0 THEN ABS(t.amount) ELSE 0 END) as total_expenses
FROM users u
LEFT JOIN accounts a ON u.user_id = a.user_id
LEFT JOIN transactions t ON a.account_id = t.account_id
GROUP BY u.user_id
LIMIT 5
"""

df = pd.read_sql(query, conn)
print(df)
```

---

## 🏗️ Architecture

### Project Structure

```
/spendsense
├── README.md                      # This file
├── requirements.txt               # Python dependencies
├── generate_data.py              # CLI entry point
├── view_data.py                  # Data viewer utility
├── spendsense.db                 # SQLite database
│
├── ingest/                       # Core data generation module
│   ├── __init__.py
│   ├── config.py                 # Configuration constants
│   ├── data_generator.py         # Main generator class
│   ├── db_schema.py              # Database schema
│   ├── loader.py                 # CSV → SQLite loader
│   ├── validator.py              # Schema validation
│   └── utils.py                  # Helper functions
│
├── data/                         # Generated data (gitignored)
│   ├── synthetic_users.csv
│   ├── synthetic_accounts.csv
│   ├── synthetic_transactions.csv
│   ├── synthetic_liabilities.csv
│   └── metadata.json
│
├── tests/                        # Test suite
│   ├── __init__.py
│   ├── test_data_generator.py    # Unit tests (25 tests)
│   └── test_integration.py       # Integration tests (10 tests)
│
└── Docs/                         # Documentation
    ├── Architecture.md           # System architecture
    ├── PRD1.md                   # Product requirements
    ├── Tasks1.md                 # Implementation tasks
    └── Tasks2.md                 # Future tasks
```

### Data Pipeline

```
┌─────────────────┐
│  Configuration  │
│   (config.py)   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐      ┌─────────────────┐
│ SyntheticData   │──1──>│  generate_users │
│   Generator     │      │  (demographics) │
└─────────────────┘      └─────────────────┘
         │                         │
         │──2──>┌─────────────────┴──────┐
         │      │ generate_accounts      │
         │      │ (checking, savings,    │
         │      │  credit cards, loans)  │
         │      └─────────────────┬──────┘
         │                        │
         │──3──>┌────────────────┴──────┐
         │      │ generate_transactions │
         │      │ (6 months of history) │
         │      └────────────────┬──────┘
         │                       │
         │──4──>┌───────────────┴──────┐
         │      │ generate_liabilities │
         │      │ (APR, payments)      │
         │      └───────────────┬──────┘
         │                      │
         │──5──>┌──────────────┴───────┐
         │      │   export_csv()       │
         │      │ (4 files + metadata) │
         │      └──────────────────────┘
         ↓
┌─────────────────┐
│   DataLoader    │──>  SQLite Database
│  + Validator    │     (spendsense.db)
└─────────────────┘
```

---

## Data Schema

### Users Table

| Field        | Type      | Description        | Example                             |
| ------------ | --------- | ------------------ | ----------------------------------- |
| `user_id`    | TEXT      | Unique user ID     | `user_001`                          |
| `name`       | TEXT      | Full name (Faker)  | `Sarah Johnson`                     |
| `email`      | TEXT      | Email address      | `user001@example.com`               |
| `created_at` | TIMESTAMP | Creation timestamp | `2025-11-03T10:00:00Z`              |
| `metadata`   | JSON      | Demographics       | `{"age": 28, "income": 65000, ...}` |

**Metadata Fields**: `age`, `age_bracket`, `income`, `income_bracket`, `region`, `life_stage`

### Accounts Table

| Field               | Type    | Description                  | Example                              |
| ------------------- | ------- | ---------------------------- | ------------------------------------ |
| `account_id`        | TEXT    | Unique account ID            | `acc_a1b2c3d4e5f6`                   |
| `user_id`           | TEXT    | Foreign key to users         | `user_001`                           |
| `type`              | TEXT    | Account type                 | `checking`, `savings`, `credit_card` |
| `name`              | TEXT    | Account name                 | `Chase Checking`                     |
| `mask`              | TEXT    | Last 4 digits                | `4523`                               |
| `current_balance`   | DECIMAL | Current balance              | `12045.32`                           |
| `available_balance` | DECIMAL | Available balance            | `12045.32`                           |
| `credit_limit`      | DECIMAL | Credit limit (if applicable) | `32000.00`                           |

### Transactions Table

| Field                  | Type    | Description             | Example                       |
| ---------------------- | ------- | ----------------------- | ----------------------------- |
| `transaction_id`       | TEXT    | Unique transaction ID   | `txn_a1b2c3d4e5f6`            |
| `account_id`           | TEXT    | Foreign key to accounts | `acc_checking_001`            |
| `user_id`              | TEXT    | Foreign key to users    | `user_001`                    |
| `date`                 | DATE    | Transaction date        | `2025-10-15`                  |
| `amount`               | DECIMAL | Amount (negative=debit) | `-5.75`                       |
| `merchant_name`        | TEXT    | Merchant name           | `Starbucks`                   |
| `payment_channel`      | TEXT    | Payment method          | `in_store`, `online`, `other` |
| `category_primary`     | TEXT    | Primary category        | `FOOD_AND_DRINK`              |
| `category_detailed`    | TEXT    | Detailed category       | `COFFEE_SHOPS`                |
| `location_city`        | TEXT    | City                    | `Austin`                      |
| `location_region`      | TEXT    | State code              | `TX`                          |
| `location_postal_code` | TEXT    | ZIP code                | `78701`                       |

### Liabilities Table

| Field                    | Type    | Description             | Example                       |
| ------------------------ | ------- | ----------------------- | ----------------------------- |
| `liability_id`           | TEXT    | Unique liability ID     | `liab_a1b2c3d4e5f6`           |
| `account_id`             | TEXT    | Foreign key to accounts | `acc_credit_001`              |
| `user_id`                | TEXT    | Foreign key to users    | `user_001`                    |
| `type`                   | TEXT    | Liability type          | `credit_card`, `student_loan` |
| `apr_percentage`         | DECIMAL | APR                     | `18.99`                       |
| `minimum_payment_amount` | DECIMAL | Min payment             | `262.32`                      |
| `last_payment_date`      | DATE    | Last payment            | `2025-10-20`                  |
| `next_payment_due_date`  | DATE    | Next due date           | `2025-11-15`                  |
| `is_overdue`             | BOOLEAN | Overdue status          | `false`                       |

---

## Configuration

### Default Settings

Edit `ingest/config.py` to customize generation parameters:

```python
# Number of users
NUM_USERS_DEFAULT = 100

# Random seed
SEED_DEFAULT = 42

# Date range (6 months)
DATE_RANGE_START = "2025-05-01"
DATE_RANGE_END = "2025-10-31"
```

### Income Distribution

```python
INCOME_BRACKETS = {
    'low': (20000, 35000, 0.20),        # 20% of users
    'mid': (35000, 75000, 0.40),        # 40% of users
    'upper_mid': (75000, 150000, 0.30), # 30% of users
    'high': (150000, 250000, 0.10)      # 10% of users
}
```

### Age Distribution

```python
AGE_BRACKETS = {
    '18-25': (18, 25, 0.20),  # 20% young adults
    '26-35': (26, 35, 0.30),  # 30% young professionals
    '36-50': (36, 50, 0.35),  # 35% mid-career
    '51-65': (51, 65, 0.15)   # 15% pre-retirement
}
```

### Transaction Categories

All categories follow Plaid's taxonomy:

- **FOOD_AND_DRINK**: Restaurants, coffee shops, groceries, bars
- **TRANSPORTATION**: Gas, parking, public transit, taxi
- **SHOPPING**: Clothing, electronics, general merchandise
- **ENTERTAINMENT**: Movies, concerts, subscriptions, gym
- **RENT_AND_UTILITIES**: Rent, electric, water, internet
- **HEALTHCARE**: Doctor, pharmacy, insurance
- **INCOME**: Payroll, interest, refunds

See `ingest/config.py` for complete list.

---

## Testing

### Run All Tests

```bash
# Run full test suite (35 tests)
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=ingest --cov-report=html
```

### Run Specific Test Suites

```bash
# Unit tests only (25 tests)
pytest tests/test_data_generator.py -v

# Integration tests only (10 tests)
pytest tests/test_integration.py -v
```

### Test Coverage

| Test Suite                 | Tests | Coverage                                        |
| -------------------------- | ----- | ----------------------------------------------- |
| **User Generation**        | 7     | Counts, uniqueness, distributions, demographics |
| **Account Generation**     | 5     | Types, distributions, balances, foreign keys    |
| **Transaction Generation** | 5     | Date ranges, counts, amounts, patterns          |
| **Liability Generation**   | 3     | APR ranges, payments, overdue status            |
| **Schema Validation**      | 3     | Missing fields, invalid types, duplicates       |
| **Reproducibility**        | 2     | Seed consistency, deterministic outputs         |
| **Full Pipeline**          | 2     | End-to-end generation and loading               |
| **Quality Metrics**        | 3     | Missing data, variance, database size           |
| **Performance**            | 3     | Generation time, load time, query speed         |
| **Foreign Keys**           | 1     | Cross-table integrity                           |

**Total**: 35 tests, 100% pass rate

### Performance Benchmarks

| Metric                      | Target | Actual  | Status             |
| --------------------------- | ------ | ------- | ------------------ |
| Generation time (100 users) | <120s  | 0.47s   | ✅ **256x faster** |
| Database load (50 users)    | <10s   | 0.10s   | ✅ **100x faster** |
| Simple query                | <100ms | 1.72ms  | ✅ **58x faster**  |
| Complex join                | <100ms | 11.57ms | ✅ **8.6x faster** |
| Database size (100 users)   | <50MB  | 8.1MB   | ✅ Within limits   |

---

## Troubleshooting

### Common Issues

#### Issue: "ModuleNotFoundError: No module named 'ingest'"

**Solution**: Make sure you're running commands from the project root directory:

```bash
cd /path/to/spendsense
python generate_data.py
```

#### Issue: "sqlite3.IntegrityError: FOREIGN KEY constraint failed"

**Solution**: Load data in correct order (users → accounts → transactions → liabilities):

```python
loader = DataLoader()
loader.load_all('data/')  # This loads in correct order
```

#### Issue: "ValueError: Missing required fields"

**Solution**: Regenerate data to ensure all required fields are present:

```bash
python generate_data.py --seed 42
```

#### Issue: Generation is slow

**Possible causes**:

- Generating >1000 users
- Low system memory
- Disk I/O bottleneck

**Solution**: Generate in smaller batches:

```bash
python generate_data.py --num-users 100
```

#### Issue: "Database is locked"

**Solution**: Close all connections to the database:

```python
conn.close()  # Close connection before reopening
```

### Data Quality Checks

#### Check for missing data

```python
import pandas as pd

df = pd.read_csv('data/synthetic_transactions.csv')
print(df.isnull().sum())  # Should be minimal
```

#### Verify foreign key integrity

```python
import sqlite3

conn = sqlite3.connect('spendsense.db')

# Check orphaned accounts
query = """
SELECT COUNT(*)
FROM accounts a
LEFT JOIN users u ON a.user_id = u.user_id
WHERE u.user_id IS NULL
"""

count = conn.execute(query).fetchone()[0]
print(f"Orphaned accounts: {count}")  # Should be 0
```

#### Verify date ranges

```python
df = pd.read_csv('data/synthetic_transactions.csv')
print(f"Min date: {df['date'].min()}")  # Should be 2025-05-01
print(f"Max date: {df['date'].max()}")  # Should be 2025-10-31
```

### Getting Help

- **Documentation**: See `Docs/` directory for detailed specs
- **Issues**: Report bugs on GitHub Issues
- **Questions**: Check `Docs/PRD1.md` for requirements

---

## Example Outputs

### Sample User Profile

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

### Sample Transaction

```json
{
  "transaction_id": "txn_a1b2c3d4e5f6",
  "account_id": "acc_checking_001",
  "user_id": "user_001",
  "date": "2025-10-15",
  "amount": -5.75,
  "merchant_name": "Starbucks",
  "merchant_entity_id": "merch_starbucks_001",
  "payment_channel": "in_store",
  "category_primary": "FOOD_AND_DRINK",
  "category_detailed": "COFFEE_SHOPS",
  "pending": false,
  "location_city": "Austin",
  "location_region": "TX",
  "location_postal_code": "78701"
}
```

### Metadata Summary

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
  }
}
```

---

## Contributing

We welcome contributions! Here's how you can help:

### Development Setup

```bash
# Clone repo
git clone https://github.com/yourusername/spendsense.git
cd spendsense

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run tests
pytest tests/
```

### Adding New Features

1. **Create a feature branch**: `git checkout -b feature/your-feature`
2. **Make changes**: Follow existing code style
3. **Add tests**: Maintain 100% test pass rate
4. **Update docs**: Update README and relevant docs
5. **Submit PR**: Include description and test results

### Code Style

- Follow PEP 8 guidelines
- Add docstrings to all public methods
- Use type hints where appropriate
- Keep functions focused and testable

---

## License

MIT License - see LICENSE file for details

---

## Acknowledgments

- **Plaid API**: Schema conventions and field definitions
- **Faker**: Name and data generation
- **Pandas**: Data manipulation framework
- **SQLite**: Embedded database

---

## Additional Resources

- [Plaid API Documentation](https://plaid.com/docs/api/)
- [Project Architecture](Docs/Architecture.md)
- [Product Requirements](Docs/PRD1.md)
- [Implementation Tasks](Docs/Tasks1.md)

---

## Credits

This is a **Gauntlet** project made with 🍵 by **Nani Skinner**

**Connect with Nani:**

- [LinkedIn](https://www.linkedin.com/in/nani-skinner-7b6b17324/)
- [Twitter/X](https://x.com/NaniSkinner)
- [Portfolio](https://www.naniskinner.com/)

---

**SpendSense Data Foundation** | Built with 🍵 for financial application development
