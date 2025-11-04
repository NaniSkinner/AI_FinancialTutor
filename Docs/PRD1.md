# Feature PRD: Data Foundation

**SpendSense - Feature #1**

---

## Document Information

- **Feature ID**: SS-F001
- **Feature Name**: Data Foundation
- **Version**: 1.0
- **Date**: November 3, 2025
- **Owner**: Data Engineering Team
- **Status**: Ready for Implementation

---

## Executive Summary

The Data Foundation feature provides the core data infrastructure for SpendSense. It generates realistic synthetic financial data (50-100 users) following Plaid's schema conventions, implements a robust ingestion pipeline, and sets up the database structure required by all downstream features.

### Key Deliverables

- Synthetic data generator using Kaggle datasets
- 50-100 diverse user profiles with 6 months of transaction history
- SQLite database with Plaid-compliant schema
- Data validation and quality checks
- CSV export/import functionality

---

## Dependencies

### Upstream Dependencies

**None** - This is the foundational feature

### Downstream Dependencies

- **SS-F002 (Behavioral Signals)**: Requires transaction and account data
- **SS-F003 (Persona System)**: Requires user demographics and signals
- **SS-F004 (Recommendation Engine)**: Requires user context
- **SS-F008 (Evaluation)**: Requires diverse test dataset

### External Dependencies

- Kaggle datasets (Credit Card Fraud Detection, PaySim, Loan Prediction)
- Python packages: pandas, faker, numpy
- SQLite database

---

## Feature Requirements

### Functional Requirements

#### FR-1: Synthetic Data Generation

**Priority**: P0 (Critical)

Generate realistic synthetic financial data for 50-100 users including:

- User profiles with demographics (age, income, life stage)
- Bank accounts (checking, savings, credit cards, loans)
- 6 months of transactions (150-200 per user)
- Credit card liabilities (balances, limits, APR, payments)
- Realistic spending patterns and seasonality

**Acceptance Criteria**:

- [ ] Generate exactly 100 users by default (configurable 50-100)
- [ ] Each user has 1 checking, 0-1 savings, 0-3 credit cards
- [ ] 25% of users have student loans
- [ ] Transaction dates span exactly 180 days (May 1 - Oct 31, 2025)
- [ ] Income distribution: 20% low ($20K-$35K), 40% mid ($35K-$75K), 30% upper-mid ($75K-$150K), 10% high ($150K-$250K)
- [ ] Geographic variance: 50% urban, 30% suburban, 20% rural
- [ ] Age distribution: 20% (18-25), 30% (26-35), 35% (36-50), 15% (51+)

#### FR-2: Plaid Schema Compliance

**Priority**: P0 (Critical)

Implement exact Plaid API schema for accounts, transactions, and liabilities.

**Acceptance Criteria**:

- [ ] Accounts table matches Plaid `/accounts` response structure
- [ ] Transactions table matches Plaid `/transactions` response structure
- [ ] Liabilities table matches Plaid `/liabilities` response structure
- [ ] All required fields present (account_id, transaction_id, etc.)
- [ ] Data types match Plaid spec (decimals for money, ISO dates)
- [ ] Category taxonomy uses Plaid's detailed categories

#### FR-3: Realistic Pattern Modeling

**Priority**: P1 (High)

Generate transaction patterns that reflect real-world financial behavior.

**Acceptance Criteria**:

- [ ] Recurring transactions (subscriptions) appear at consistent intervals (±2 days)
- [ ] Payroll deposits occur biweekly or monthly
- [ ] Seasonal spending spikes (holidays, back-to-school)
- [ ] Weekend vs. weekday spending patterns differ
- [ ] Merchants repeat realistically (same coffee shop, grocery store)
- [ ] Credit card payments occur monthly
- [ ] Random life events (medical emergency, job change) for 10% of users

#### FR-4: Data Ingestion Pipeline

**Priority**: P0 (Critical)

Build robust CSV/JSON loader with validation.

**Acceptance Criteria**:

- [ ] Load CSV files into SQLite database
- [ ] Validate schema before insertion
- [ ] Report validation errors with line numbers
- [ ] Support batch loading (all users at once)
- [ ] Handle duplicate detection (skip or overwrite configurable)
- [ ] Transaction logging for debugging

#### FR-5: Database Setup

**Priority**: P0 (Critical)

Initialize SQLite database with complete schema.

**Acceptance Criteria**:

- [ ] Create all required tables (users, accounts, transactions, liabilities)
- [ ] Add indexes on frequently queried columns (user_id, date)
- [ ] Enforce foreign key constraints
- [ ] Support schema migrations (if schema changes)
- [ ] Database file is portable (single .db file)

### Non-Functional Requirements

#### NFR-1: Data Quality

- Variance: Amounts should vary ±10% for realistic randomness
- Completeness: 0% missing required fields, <5% missing optional fields
- Consistency: Cross-table references (account_id) must be valid

#### NFR-2: Performance

- Generation time: <2 minutes for 100 users on modern laptop
- Load time: <10 seconds to import all data into SQLite
- Query time: <100ms for typical queries (user's transactions)

#### NFR-3: Reproducibility

- Seed-based generation for deterministic output
- Same seed produces identical dataset
- Document seed in metadata

---

## Technical Specifications

### Architecture Overview

```
┌─────────────────┐
│ Kaggle Datasets │
│ - Fraud Det.    │
│ - PaySim        │──────┐
│ - Loan Pred.    │      │
└─────────────────┘      │
                         ↓
                  ┌──────────────┐
                  │  Synthesizer │
                  │  - Merge     │
                  │  - Calibrate │
                  │  - Noise     │
                  └──────┬───────┘
                         │
         ┌───────────────┼───────────────┐
         ↓               ↓               ↓
   ┌─────────┐    ┌─────────┐    ┌─────────┐
   │  users  │    │accounts │    │  txns   │
   │  .csv   │    │  .csv   │    │  .csv   │
   └────┬────┘    └────┬────┘    └────┬────┘
        │              │              │
        └──────────────┼──────────────┘
                       ↓
                 ┌───────────┐
                 │  Loader   │
                 │ + Validator│
                 └─────┬─────┘
                       ↓
                 ┌───────────┐
                 │  SQLite   │
                 │   .db     │
                 └───────────┘
```

### Data Models

#### Users Table

```sql
CREATE TABLE users (
    user_id TEXT PRIMARY KEY,           -- 'user_001' format
    name TEXT NOT NULL,                 -- Faker-generated
    email TEXT UNIQUE,                  -- name@example.com
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON                       -- {'age': 28, 'income': 45000, 'region': 'urban'}
);
```

#### Accounts Table

```sql
CREATE TABLE accounts (
    account_id TEXT PRIMARY KEY,        -- 'acc_' + uuid
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,                 -- checking, savings, credit_card, student_loan, mortgage
    subtype TEXT,                       -- e.g., 'rewards' for credit_card
    name TEXT,                          -- 'Chase Checking'
    official_name TEXT,                 -- 'Chase Bank N.A.'
    mask TEXT,                          -- Last 4 digits: '4523'
    available_balance DECIMAL(12,2),
    current_balance DECIMAL(12,2),
    credit_limit DECIMAL(12,2),         -- NULL for non-credit accounts
    iso_currency_code TEXT DEFAULT 'USD',
    holder_category TEXT DEFAULT 'personal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX idx_accounts_user ON accounts(user_id);
```

#### Transactions Table

```sql
CREATE TABLE transactions (
    transaction_id TEXT PRIMARY KEY,     -- 'txn_' + uuid
    account_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    date DATE NOT NULL,                  -- YYYY-MM-DD
    amount DECIMAL(10,2) NOT NULL,       -- Negative = debit, Positive = credit
    merchant_name TEXT,                  -- 'Starbucks'
    merchant_entity_id TEXT,             -- 'merch_starbucks_001'
    payment_channel TEXT,                -- online, in_store, other
    category_primary TEXT,               -- FOOD_AND_DRINK
    category_detailed TEXT,              -- COFFEE_SHOPS
    pending BOOLEAN DEFAULT FALSE,
    location_city TEXT,
    location_region TEXT,                -- State code: 'TX'
    location_postal_code TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id)
);

CREATE INDEX idx_transactions_user_date ON transactions(user_id, date);
CREATE INDEX idx_transactions_account ON transactions(account_id);
```

#### Liabilities Table

```sql
CREATE TABLE liabilities (
    liability_id TEXT PRIMARY KEY,       -- 'liab_' + uuid
    account_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,                  -- credit_card, student_loan, mortgage
    apr_percentage DECIMAL(5,2),         -- 18.99
    apr_type TEXT,                       -- purchase_apr, balance_transfer_apr
    minimum_payment_amount DECIMAL(10,2),
    last_payment_amount DECIMAL(10,2),
    last_payment_date DATE,
    next_payment_due_date DATE,
    last_statement_balance DECIMAL(10,2),
    is_overdue BOOLEAN DEFAULT FALSE,
    interest_rate DECIMAL(5,2),          -- For mortgages/loans
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id)
);

CREATE INDEX idx_liabilities_user ON liabilities(user_id);
```

### Module Structure

```
/ingest
├── __init__.py
├── data_generator.py          # Main synthetic data generator
├── kaggle_synthesizer.py      # Kaggle dataset merger
├── pattern_generator.py       # Realistic transaction patterns
├── loader.py                  # CSV/JSON loader
├── validator.py               # Schema validation
├── config.py                  # Configuration constants
└── utils.py                   # Helper functions

/data                          # Output directory (gitignored)
├── synthetic_users.csv
├── synthetic_accounts.csv
├── synthetic_transactions.csv
├── synthetic_liabilities.csv
└── metadata.json              # Generation metadata (seed, counts, etc.)
```

### Core Classes

#### SyntheticDataGenerator

```python
class SyntheticDataGenerator:
    """Main class for generating synthetic financial data"""

    def __init__(self, num_users: int = 100, seed: int = 42):
        """
        Initialize generator

        Args:
            num_users: Number of users to generate (50-100)
            seed: Random seed for reproducibility
        """
        self.num_users = num_users
        self.seed = seed
        self.fake = Faker()
        Faker.seed(seed)
        random.seed(seed)
        np.random.seed(seed)

    def generate_all(self, output_dir: str = 'data/') -> dict:
        """
        Generate complete dataset

        Returns:
            Dictionary with file paths and metadata
        """
        # 1. Generate users
        users_df = self.generate_users()

        # 2. Generate accounts for each user
        accounts_df = self.generate_accounts(users_df)

        # 3. Generate transactions for each account
        transactions_df = self.generate_transactions(accounts_df)

        # 4. Generate liabilities for credit accounts
        liabilities_df = self.generate_liabilities(accounts_df)

        # 5. Export to CSV
        self.export_csv(users_df, accounts_df, transactions_df, liabilities_df, output_dir)

        # 6. Return metadata
        return self._create_metadata(users_df, accounts_df, transactions_df, liabilities_df)

    def generate_users(self) -> pd.DataFrame:
        """Generate user profiles with demographics"""
        users = []

        for i in range(self.num_users):
            # Age distribution
            age = self._sample_age()

            # Income based on age and distribution
            income = self._sample_income(age)

            # Geographic region
            region = random.choices(
                ['urban', 'suburban', 'rural'],
                weights=[0.5, 0.3, 0.2]
            )[0]

            user = {
                'user_id': f'user_{i:03d}',
                'name': self.fake.name(),
                'email': f'user{i:03d}@example.com',
                'created_at': datetime.now().isoformat(),
                'metadata': json.dumps({
                    'age': age,
                    'age_bracket': self._get_age_bracket(age),
                    'income': income,
                    'income_bracket': self._get_income_bracket(income),
                    'region': region,
                    'life_stage': self._infer_life_stage(age, income)
                })
            }
            users.append(user)

        return pd.DataFrame(users)

    def generate_accounts(self, users_df: pd.DataFrame) -> pd.DataFrame:
        """Generate bank accounts for users"""
        accounts = []

        for _, user in users_df.iterrows():
            user_id = user['user_id']
            metadata = json.loads(user['metadata'])
            income = metadata['income']

            # Every user has checking
            accounts.append(self._create_checking_account(user_id, income))

            # 70% have savings
            if random.random() < 0.7:
                accounts.append(self._create_savings_account(user_id, income))

            # Credit cards (0-3 based on income)
            num_cards = self._sample_credit_card_count(income)
            for _ in range(num_cards):
                accounts.append(self._create_credit_card(user_id, income))

            # 25% have student loans (more likely if age 18-35)
            age = metadata['age']
            if age <= 35 and random.random() < 0.35:
                accounts.append(self._create_student_loan(user_id, income))
            elif random.random() < 0.15:
                accounts.append(self._create_student_loan(user_id, income))

        return pd.DataFrame(accounts)

    def generate_transactions(self, accounts_df: pd.DataFrame) -> pd.DataFrame:
        """Generate 6 months of transactions"""
        all_transactions = []

        start_date = datetime(2025, 5, 1)
        end_date = datetime(2025, 10, 31)

        for _, account in accounts_df.iterrows():
            account_id = account['account_id']
            account_type = account['type']
            user_id = account['user_id']

            # Generate transactions based on account type
            if account_type == 'checking':
                txns = self._generate_checking_transactions(
                    account_id, user_id, start_date, end_date
                )
            elif account_type == 'savings':
                txns = self._generate_savings_transactions(
                    account_id, user_id, start_date, end_date
                )
            elif account_type == 'credit_card':
                txns = self._generate_credit_transactions(
                    account_id, user_id, start_date, end_date
                )
            else:
                txns = []  # Loans don't have many transactions

            all_transactions.extend(txns)

        return pd.DataFrame(all_transactions)

    def _generate_checking_transactions(self, account_id, user_id, start_date, end_date):
        """Generate realistic checking account transactions"""
        transactions = []
        current_date = start_date

        # Get user metadata for calibration
        user_metadata = self._get_user_metadata(user_id)
        monthly_income = user_metadata['income'] / 12

        # Payroll deposits (biweekly or monthly)
        payment_frequency = random.choice(['biweekly', 'monthly'])
        if payment_frequency == 'biweekly':
            pay_amount = monthly_income / 2
            pay_interval = 14
        else:
            pay_amount = monthly_income
            pay_interval = 30

        # Generate payroll deposits
        deposit_date = start_date + timedelta(days=random.randint(1, 7))
        while deposit_date <= end_date:
            transactions.append({
                'transaction_id': f'txn_{uuid.uuid4().hex[:12]}',
                'account_id': account_id,
                'user_id': user_id,
                'date': deposit_date.date(),
                'amount': round(pay_amount * random.uniform(0.98, 1.02), 2),  # Slight variance
                'merchant_name': 'Employer Direct Deposit',
                'merchant_entity_id': f'employer_{user_id}',
                'payment_channel': 'other',
                'category_primary': 'INCOME',
                'category_detailed': 'PAYROLL',
                'pending': False,
                'location_city': None,
                'location_region': None,
                'location_postal_code': None,
                'created_at': datetime.now().isoformat()
            })
            deposit_date += timedelta(days=pay_interval)

        # Regular expenses (rent, utilities, groceries, etc.)
        transactions.extend(self._generate_regular_expenses(
            account_id, user_id, start_date, end_date, monthly_income
        ))

        # Random spending (restaurants, shopping, entertainment)
        transactions.extend(self._generate_random_spending(
            account_id, user_id, start_date, end_date, monthly_income
        ))

        return transactions

    def _generate_regular_expenses(self, account_id, user_id, start_date, end_date, monthly_income):
        """Generate recurring monthly expenses"""
        transactions = []

        # Rent/mortgage (if applicable)
        rent = monthly_income * random.uniform(0.25, 0.35)  # 25-35% of income
        current_date = start_date + timedelta(days=1)  # 1st of month
        while current_date <= end_date:
            transactions.append({
                'transaction_id': f'txn_{uuid.uuid4().hex[:12]}',
                'account_id': account_id,
                'user_id': user_id,
                'date': current_date.date(),
                'amount': -round(rent * random.uniform(0.99, 1.01), 2),
                'merchant_name': 'Property Management Co',
                'merchant_entity_id': 'merch_rent_001',
                'payment_channel': 'other',
                'category_primary': 'RENT_AND_UTILITIES',
                'category_detailed': 'RENT',
                'pending': False,
                'location_city': None,
                'location_region': None,
                'location_postal_code': None,
                'created_at': datetime.now().isoformat()
            })
            current_date += timedelta(days=30)

        # Utilities (monthly)
        utility_amount = random.uniform(80, 150)
        current_date = start_date + timedelta(days=15)
        while current_date <= end_date:
            transactions.append({
                'transaction_id': f'txn_{uuid.uuid4().hex[:12]}',
                'account_id': account_id,
                'user_id': user_id,
                'date': current_date.date(),
                'amount': -round(utility_amount * random.uniform(0.9, 1.1), 2),
                'merchant_name': 'Electric Company',
                'merchant_entity_id': 'merch_utility_001',
                'payment_channel': 'other',
                'category_primary': 'RENT_AND_UTILITIES',
                'category_detailed': 'ELECTRIC',
                'pending': False,
                'location_city': None,
                'location_region': None,
                'location_postal_code': None,
                'created_at': datetime.now().isoformat()
            })
            current_date += timedelta(days=30)

        # Subscriptions (30-40% of users have Netflix, Spotify, etc.)
        if random.random() < 0.4:
            subscription_merchants = [
                ('Netflix', 15.99, 'SUBSCRIPTION'),
                ('Spotify', 10.99, 'SUBSCRIPTION'),
                ('Amazon Prime', 14.99, 'SUBSCRIPTION'),
                ('Gym Membership', 45.00, 'GYM'),
                ('Cloud Storage', 9.99, 'SUBSCRIPTION')
            ]

            num_subscriptions = random.randint(1, 3)
            selected = random.sample(subscription_merchants, num_subscriptions)

            for merchant, amount, category in selected:
                current_date = start_date + timedelta(days=random.randint(1, 28))
                while current_date <= end_date:
                    transactions.append({
                        'transaction_id': f'txn_{uuid.uuid4().hex[:12]}',
                        'account_id': account_id,
                        'user_id': user_id,
                        'date': current_date.date(),
                        'amount': -round(amount, 2),
                        'merchant_name': merchant,
                        'merchant_entity_id': f'merch_{merchant.lower().replace(" ", "_")}',
                        'payment_channel': 'online',
                        'category_primary': 'ENTERTAINMENT',
                        'category_detailed': category,
                        'pending': False,
                        'location_city': None,
                        'location_region': None,
                        'location_postal_code': None,
                        'created_at': datetime.now().isoformat()
                    })
                    current_date += timedelta(days=30)

        return transactions

    def _generate_random_spending(self, account_id, user_id, start_date, end_date, monthly_income):
        """Generate random daily spending"""
        transactions = []

        # Groceries (2-3 times per week)
        current_date = start_date
        while current_date <= end_date:
            if random.random() < 0.4:  # 40% chance each day
                transactions.append({
                    'transaction_id': f'txn_{uuid.uuid4().hex[:12]}',
                    'account_id': account_id,
                    'user_id': user_id,
                    'date': current_date.date(),
                    'amount': -round(random.uniform(30, 150), 2),
                    'merchant_name': random.choice(['Whole Foods', 'Trader Joes', 'Kroger', 'Safeway']),
                    'merchant_entity_id': 'merch_grocery_001',
                    'payment_channel': 'in_store',
                    'category_primary': 'FOOD_AND_DRINK',
                    'category_detailed': 'GROCERIES',
                    'pending': False,
                    'location_city': 'Austin',
                    'location_region': 'TX',
                    'location_postal_code': '78701',
                    'created_at': datetime.now().isoformat()
                })
            current_date += timedelta(days=1)

        # Restaurants (3-5 times per week)
        current_date = start_date
        while current_date <= end_date:
            if random.random() < 0.5:  # 50% chance
                transactions.append({
                    'transaction_id': f'txn_{uuid.uuid4().hex[:12]}',
                    'account_id': account_id,
                    'user_id': user_id,
                    'date': current_date.date(),
                    'amount': -round(random.uniform(12, 60), 2),
                    'merchant_name': random.choice(['Chipotle', 'Panera', 'Local Diner', 'Pizza Place']),
                    'merchant_entity_id': 'merch_restaurant_001',
                    'payment_channel': random.choice(['in_store', 'online']),
                    'category_primary': 'FOOD_AND_DRINK',
                    'category_detailed': 'RESTAURANTS',
                    'pending': False,
                    'location_city': 'Austin',
                    'location_region': 'TX',
                    'location_postal_code': '78701',
                    'created_at': datetime.now().isoformat()
                })
            current_date += timedelta(days=1)

        # Coffee shops (students and high-income - 3-7 times per week)
        user_metadata = self._get_user_metadata(user_id)
        if user_metadata['age'] <= 25 or monthly_income > 6000:
            current_date = start_date
            while current_date <= end_date:
                if random.random() < 0.6:  # 60% chance
                    transactions.append({
                        'transaction_id': f'txn_{uuid.uuid4().hex[:12]}',
                        'account_id': account_id,
                        'user_id': user_id,
                        'date': current_date.date(),
                        'amount': -round(random.uniform(4, 8), 2),
                        'merchant_name': random.choice(['Starbucks', 'Local Coffee', 'Dunkin']),
                        'merchant_entity_id': 'merch_coffee_001',
                        'payment_channel': 'in_store',
                        'category_primary': 'FOOD_AND_DRINK',
                        'category_detailed': 'COFFEE_SHOPS',
                        'pending': False,
                        'location_city': 'Austin',
                        'location_region': 'TX',
                        'location_postal_code': '78701',
                        'created_at': datetime.now().isoformat()
                    })
                current_date += timedelta(days=1)

        return transactions

    def generate_liabilities(self, accounts_df: pd.DataFrame) -> pd.DataFrame:
        """Generate liability records for credit accounts"""
        liabilities = []

        for _, account in accounts_df.iterrows():
            if account['type'] == 'credit_card':
                liability = {
                    'liability_id': f'liab_{uuid.uuid4().hex[:12]}',
                    'account_id': account['account_id'],
                    'user_id': account['user_id'],
                    'type': 'credit_card',
                    'apr_percentage': round(random.uniform(15.99, 24.99), 2),
                    'apr_type': 'purchase_apr',
                    'minimum_payment_amount': round(account['current_balance'] * 0.02, 2),
                    'last_payment_amount': round(account['current_balance'] * random.uniform(0.02, 0.5), 2),
                    'last_payment_date': (datetime.now() - timedelta(days=random.randint(5, 25))).date(),
                    'next_payment_due_date': (datetime.now() + timedelta(days=random.randint(5, 25))).date(),
                    'last_statement_balance': account['current_balance'],
                    'is_overdue': random.random() < 0.05,  # 5% overdue
                    'interest_rate': None,
                    'created_at': datetime.now().isoformat()
                }
                liabilities.append(liability)

            elif account['type'] == 'student_loan':
                liability = {
                    'liability_id': f'liab_{uuid.uuid4().hex[:12]}',
                    'account_id': account['account_id'],
                    'user_id': account['user_id'],
                    'type': 'student_loan',
                    'apr_percentage': None,
                    'apr_type': None,
                    'minimum_payment_amount': round(random.uniform(150, 400), 2),
                    'last_payment_amount': round(random.uniform(150, 400), 2),
                    'last_payment_date': (datetime.now() - timedelta(days=random.randint(1, 28))).date(),
                    'next_payment_due_date': (datetime.now() + timedelta(days=random.randint(1, 28))).date(),
                    'last_statement_balance': account['current_balance'],
                    'is_overdue': False,
                    'interest_rate': round(random.uniform(4.5, 7.5), 2),
                    'created_at': datetime.now().isoformat()
                }
                liabilities.append(liability)

        return pd.DataFrame(liabilities)

    # Helper methods
    def _sample_age(self) -> int:
        """Sample age from distribution"""
        age_brackets = [
            (18, 25, 0.20),
            (26, 35, 0.30),
            (36, 50, 0.35),
            (51, 65, 0.15)
        ]
        bracket = random.choices(age_brackets, weights=[b[2] for b in age_brackets])[0]
        return random.randint(bracket[0], bracket[1])

    def _sample_income(self, age: int) -> int:
        """Sample income based on age"""
        # Younger = lower income
        if age < 25:
            return int(random.uniform(18000, 45000))
        elif age < 35:
            return int(random.uniform(35000, 85000))
        elif age < 50:
            return int(random.uniform(45000, 150000))
        else:
            return int(random.uniform(50000, 200000))

    def _get_user_metadata(self, user_id: str) -> dict:
        """Get user metadata for calibration"""
        # This would query the users table in practice
        pass

    # ... additional helper methods
```

#### DataLoader

```python
class DataLoader:
    """Load CSV files into SQLite database"""

    def __init__(self, db_path: str = 'spendsense.db'):
        self.db_path = db_path
        self.conn = None

    def connect(self):
        """Connect to database"""
        self.conn = sqlite3.connect(self.db_path)
        return self.conn

    def load_all(self, data_dir: str = 'data/'):
        """Load all CSV files"""
        self.connect()

        # Load in order (respecting foreign keys)
        self.load_users(f'{data_dir}/synthetic_users.csv')
        self.load_accounts(f'{data_dir}/synthetic_accounts.csv')
        self.load_transactions(f'{data_dir}/synthetic_transactions.csv')
        self.load_liabilities(f'{data_dir}/synthetic_liabilities.csv')

        self.conn.close()

    def load_users(self, csv_path: str):
        """Load users from CSV"""
        df = pd.read_csv(csv_path)

        # Validate
        validator = SchemaValidator()
        validator.validate_users(df)

        # Load
        df.to_sql('users', self.conn, if_exists='append', index=False)
        print(f"✓ Loaded {len(df)} users")

    def load_transactions(self, csv_path: str):
        """Load transactions from CSV"""
        df = pd.read_csv(csv_path)

        # Validate
        validator = SchemaValidator()
        validator.validate_transactions(df)

        # Load in chunks (may be large)
        chunk_size = 1000
        for i in range(0, len(df), chunk_size):
            chunk = df.iloc[i:i+chunk_size]
            chunk.to_sql('transactions', self.conn, if_exists='append', index=False)

        print(f"✓ Loaded {len(df)} transactions")
```

#### SchemaValidator

```python
class SchemaValidator:
    """Validate data against Plaid schema"""

    def validate_users(self, df: pd.DataFrame):
        """Validate users dataframe"""
        required = ['user_id', 'name', 'email']
        self._check_required_fields(df, required)

        # Check uniqueness
        if df['user_id'].duplicated().any():
            raise ValueError("Duplicate user_ids found")

    def validate_transactions(self, df: pd.DataFrame):
        """Validate transactions dataframe"""
        required = ['transaction_id', 'account_id', 'user_id', 'date', 'amount']
        self._check_required_fields(df, required)

        # Check data types
        if not pd.api.types.is_numeric_dtype(df['amount']):
            raise ValueError("Amount must be numeric")

        # Check date format
        try:
            pd.to_datetime(df['date'])
        except:
            raise ValueError("Invalid date format")

    def _check_required_fields(self, df: pd.DataFrame, required: list):
        """Check all required fields present"""
        missing = set(required) - set(df.columns)
        if missing:
            raise ValueError(f"Missing required fields: {missing}")
```

---

## Acceptance Criteria

### Primary Criteria

- [ ] **AC-1**: Generate 100 synthetic users with complete profiles
- [ ] **AC-2**: Each user has 150-200 transactions spanning 6 months
- [ ] **AC-3**: All Plaid schema fields present and valid
- [ ] **AC-4**: Income distribution matches target (20/40/30/10)
- [ ] **AC-5**: Age distribution matches target
- [ ] **AC-6**: Recurring transactions detected (subscriptions, payroll)
- [ ] **AC-7**: Data loads into SQLite without errors
- [ ] **AC-8**: Database file is <50MB
- [ ] **AC-9**: Generation completes in <2 minutes
- [ ] **AC-10**: Same seed produces identical output

### Quality Criteria

- [ ] **QC-1**: 0% missing required fields
- [ ] **QC-2**: <5% missing optional fields
- [ ] **QC-3**: All foreign keys valid
- [ ] **QC-4**: Transaction dates within May 1 - Oct 31, 2025
- [ ] **QC-5**: Amounts have realistic variance (±10%)

---

## Testing Requirements

### Unit Tests (Minimum 3)

```python
def test_user_generation():
    """Test user generation produces correct count and distribution"""
    generator = SyntheticDataGenerator(num_users=100, seed=42)
    users_df = generator.generate_users()

    assert len(users_df) == 100
    assert users_df['user_id'].is_unique

    # Check income distribution
    metadata = users_df['metadata'].apply(json.loads)
    incomes = [m['income'] for m in metadata]

    low = sum(1 for i in incomes if i < 35000)
    assert 15 <= low <= 25  # 20% ± 5%

def test_transaction_dates():
    """Test all transactions within date range"""
    generator = SyntheticDataGenerator(num_users=10, seed=42)
    generator.generate_all('test_data/')

    df = pd.read_csv('test_data/synthetic_transactions.csv')
    dates = pd.to_datetime(df['date'])

    assert dates.min() >= pd.Timestamp('2025-05-01')
    assert dates.max() <= pd.Timestamp('2025-10-31')

def test_schema_validation():
    """Test validator catches missing fields"""
    validator = SchemaValidator()

    # Missing required field
    bad_df = pd.DataFrame({
        'user_id': ['user_001'],
        # Missing 'name' and 'email'
    })

    with pytest.raises(ValueError, match="Missing required fields"):
        validator.validate_users(bad_df)

def test_data_loading():
    """Test CSV loads into SQLite correctly"""
    # Generate test data
    generator = SyntheticDataGenerator(num_users=5, seed=42)
    generator.generate_all('test_data/')

    # Load into test database
    loader = DataLoader('test.db')
    loader.load_all('test_data/')

    # Verify
    conn = sqlite3.connect('test.db')
    count = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    assert count == 5

    conn.close()
```

### Integration Tests

- [ ] Full pipeline: Generate → Export → Load → Query
- [ ] Verify foreign key relationships intact
- [ ] Test data quality metrics calculation

---

## Implementation Guide

### Phase 1: Setup (Day 1)

1. Create module structure
2. Set up SQLite schema
3. Install dependencies: `pip install pandas faker numpy`
4. Download Kaggle datasets (if using)

### Phase 2: Core Generation (Days 2-3)

1. Implement `SyntheticDataGenerator.generate_users()`
2. Implement `SyntheticDataGenerator.generate_accounts()`
3. Test with small dataset (10 users)

### Phase 3: Transaction Generation (Days 4-5)

1. Implement checking account transactions
2. Implement credit card transactions
3. Add recurring patterns (subscriptions, payroll)
4. Add seasonal variance

### Phase 4: Loading & Validation (Day 6)

1. Implement `DataLoader`
2. Implement `SchemaValidator`
3. Test full pipeline with 100 users

### Phase 5: Quality Assurance (Day 7)

1. Run quality checks
2. Fix issues
3. Document metadata
4. Write tests

---

## Configuration

### config.py

```python
# Data generation constants
NUM_USERS_DEFAULT = 100
SEED_DEFAULT = 42
DATE_RANGE_START = "2025-05-01"
DATE_RANGE_END = "2025-10-31"

# Income distribution
INCOME_BRACKETS = {
    'low': (20000, 35000, 0.20),
    'mid': (35000, 75000, 0.40),
    'upper_mid': (75000, 150000, 0.30),
    'high': (150000, 250000, 0.10)
}

# Age distribution
AGE_BRACKETS = {
    '18-25': (18, 25, 0.20),
    '26-35': (26, 35, 0.30),
    '36-50': (36, 50, 0.35),
    '51+': (51, 65, 0.15)
}

# Category taxonomy (Plaid-style)
TRANSACTION_CATEGORIES = {
    'FOOD_AND_DRINK': ['RESTAURANTS', 'COFFEE_SHOPS', 'GROCERIES', 'BARS'],
    'TRANSPORTATION': ['GAS', 'PARKING', 'PUBLIC_TRANSIT', 'TAXI'],
    'SHOPPING': ['CLOTHING', 'ELECTRONICS', 'GENERAL'],
    'ENTERTAINMENT': ['MOVIES', 'CONCERTS', 'SUBSCRIPTION', 'GYM'],
    'RENT_AND_UTILITIES': ['RENT', 'ELECTRIC', 'WATER', 'INTERNET'],
    'INCOME': ['PAYROLL', 'INTEREST', 'REFUND']
}

# Merchant pools
MERCHANTS = {
    'coffee': ['Starbucks', 'Local Coffee', 'Dunkin', 'Peets'],
    'grocery': ['Whole Foods', 'Trader Joes', 'Kroger', 'Safeway', 'HEB'],
    'restaurant': ['Chipotle', 'Panera', 'Local Diner', 'Pizza Place', 'Thai Food'],
    'subscription': [
        ('Netflix', 15.99),
        ('Spotify', 10.99),
        ('Amazon Prime', 14.99),
        ('Apple iCloud', 9.99),
        ('Disney+', 7.99),
        ('Gym Membership', 45.00)
    ]
}
```

---

## Risks & Mitigations

| Risk                       | Likelihood | Impact | Mitigation                                                           |
| -------------------------- | ---------- | ------ | -------------------------------------------------------------------- |
| **Unrealistic patterns**   | Medium     | High   | Validate against real Plaid data examples, use academic research     |
| **Performance issues**     | Low        | Medium | Generate in batches, optimize pandas operations                      |
| **Schema mismatch**        | Medium     | High   | Use Plaid documentation as reference, validate strictly              |
| **Data too uniform**       | Medium     | Medium | Add noise, variance, and edge cases (life events)                    |
| **Kaggle dataset quality** | Low        | Low    | Inspect datasets before use, can generate purely synthetic if needed |

---

## Success Metrics

1. **Generation Success**: 100% completion rate for 100 users
2. **Data Quality**: <1% validation errors
3. **Performance**: Generation time <2 minutes
4. **Reproducibility**: Same seed = identical output
5. **Coverage**: All required signals detectable (verified in Phase 2)

---

## Future Enhancements

- [ ] Add more life events (marriage, children, relocation)
- [ ] Support international currencies (EUR, GBP)
- [ ] Generate investment account transactions
- [ ] Add fraud patterns for testing guardrails
- [ ] PostgreSQL support for production scale
- [ ] Real Plaid API integration (optional)

---

## References

- [Plaid API Documentation](https://plaid.com/docs/api/)
- Kaggle: Credit Card Fraud Detection Dataset
- Kaggle: PaySim Financial Mobile Money Simulator
- JP Morgan Chase Institute: Synthetic Data Generation Papers

---

## Appendix: Sample Data

### Sample User

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
  "location_postal_code": "78701",
  "created_at": "2025-11-03T10:00:00Z"
}
```

---

**End of Data Foundation PRD**
