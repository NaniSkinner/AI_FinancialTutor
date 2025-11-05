# PRD Shard 04: Data Schema & API Specification

**Version:** 1.0  
**Date:** November 3, 2025  
**Feature Owner:** Bryce Harris  
**Project:** SpendSense - Explainable AI for Financial Education

---

## 🔗 Shard Dependencies

- **Requires:** PRD_01 (Persona Definitions for field requirements)
- **Consumed by:** PRD_02 (Assignment), PRD_03 (Transitions), PRD_05 (Testing)
- **Related:** PRD_00 (Quick Reference)

---

## Overview

This document defines the complete data model and API contracts for the Persona System. It includes:

- Database schema (tables, indexes, constraints)
- API endpoint specifications (request/response formats)
- Data storage patterns
- Integration contracts

---

## Database Schema

### Table 1: user_personas

Stores all persona assignments with detailed criteria breakdown.

```sql
CREATE TABLE user_personas (
    assignment_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    window_type TEXT NOT NULL,           -- '30d' or '180d'
    primary_persona TEXT NOT NULL,       -- Persona name
    primary_match_strength TEXT,         -- 'strong', 'moderate', 'weak', 'default'
    secondary_personas JSON,             -- Array of secondary persona names
    criteria_met JSON NOT NULL,          -- Detailed criteria breakdown by persona
    all_matches JSON,                    -- All personas that matched (in priority order)
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Indexes for fast queries
CREATE INDEX idx_user_personas_user_id ON user_personas(user_id);
CREATE INDEX idx_user_personas_primary ON user_personas(primary_persona);
CREATE INDEX idx_user_personas_window ON user_personas(window_type);
CREATE INDEX idx_user_personas_assigned_at ON user_personas(assigned_at);
CREATE INDEX idx_user_personas_user_window ON user_personas(user_id, window_type);
```

**Field Details:**

| Field                  | Type      | Description                  | Example                                      |
| ---------------------- | --------- | ---------------------------- | -------------------------------------------- |
| assignment_id          | TEXT      | Unique assignment identifier | `user_123_30d_1699012345`                    |
| user_id                | TEXT      | User identifier              | `user_123`                                   |
| window_type            | TEXT      | Signal time window           | `30d` or `180d`                              |
| primary_persona        | TEXT      | Highest priority match       | `high_utilization`                           |
| primary_match_strength | TEXT      | Match quality                | `strong`, `moderate`, `weak`                 |
| secondary_personas     | JSON      | Additional matches           | `["subscription_heavy"]`                     |
| criteria_met           | JSON      | Criteria breakdown           | See below                                    |
| all_matches            | JSON      | All matching personas        | `["high_utilization", "subscription_heavy"]` |
| assigned_at            | TIMESTAMP | Assignment timestamp         | `2025-11-03T10:30:00Z`                       |

**Example criteria_met structure:**

```json
{
  "high_utilization": {
    "any_card_utilization_gte_50": true,
    "aggregate_utilization_pct": 68.0,
    "any_interest_charges": true,
    "any_overdue": false,
    "highest_card_utilization": 68.0
  },
  "subscription_heavy": {
    "recurring_merchant_count": 5,
    "monthly_recurring_spend": 127.5,
    "subscription_share_pct": 12.0,
    "merchants": ["Netflix", "Spotify", "Adobe", "Gym", "NYT"]
  }
}
```

---

### Table 2: persona_transitions

Tracks transitions between personas over time.

```sql
CREATE TABLE persona_transitions (
    transition_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    from_persona TEXT NOT NULL,
    to_persona TEXT NOT NULL,
    transition_date DATE NOT NULL,
    days_in_previous_persona INTEGER,
    celebration_shown BOOLEAN DEFAULT FALSE,
    milestone_achieved TEXT,
    achievement_title TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Indexes for analytics and queries
CREATE INDEX idx_transitions_user_id ON persona_transitions(user_id);
CREATE INDEX idx_transitions_date ON persona_transitions(transition_date);
CREATE INDEX idx_transitions_from_persona ON persona_transitions(from_persona);
CREATE INDEX idx_transitions_to_persona ON persona_transitions(to_persona);
CREATE INDEX idx_transitions_milestone ON persona_transitions(milestone_achieved);
```

**Field Details:**

| Field                    | Type      | Description                  | Example                                                |
| ------------------------ | --------- | ---------------------------- | ------------------------------------------------------ |
| transition_id            | TEXT      | Unique transition identifier | `user_123_high_utilization_savings_builder_1699012345` |
| user_id                  | TEXT      | User identifier              | `user_123`                                             |
| from_persona             | TEXT      | Previous persona             | `high_utilization`                                     |
| to_persona               | TEXT      | New persona                  | `savings_builder`                                      |
| transition_date          | DATE      | When transition occurred     | `2025-11-03`                                           |
| days_in_previous_persona | INTEGER   | Days spent in previous state | `45`                                                   |
| celebration_shown        | BOOLEAN   | If positive transition       | `true`                                                 |
| milestone_achieved       | TEXT      | Milestone key                | `credit_to_savings`                                    |
| achievement_title        | TEXT      | Display title                | `Financial Health Turnaround`                          |
| created_at               | TIMESTAMP | Record creation time         | `2025-11-03T10:30:00Z`                                 |

---

### Table 3: user_signals (Referenced by Assignment)

This table is created in PRD #2 (Behavioral Signals), but referenced here for completeness.

```sql
CREATE TABLE user_signals (
    signal_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    window_type TEXT NOT NULL,
    signal_category TEXT NOT NULL,      -- 'credit', 'income', 'subscriptions', 'savings'
    signal_data JSON NOT NULL,          -- Category-specific signal details
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX idx_signals_user_window ON user_signals(user_id, window_type);
CREATE INDEX idx_signals_category ON user_signals(signal_category);
```

---

## API Specification

### Endpoint 1: Assign Persona

**Purpose:** Assign primary and secondary personas to a user based on signals.

```http
POST /api/personas/assign
Content-Type: application/json
```

**Request Body:**

```json
{
  "user_id": "user_123",
  "window_type": "30d"
}
```

**Response (200 OK):**

```json
{
  "user_id": "user_123",
  "window_type": "30d",
  "primary_persona": "high_utilization",
  "primary_match_strength": "strong",
  "secondary_personas": ["subscription_heavy"],
  "criteria_met": {
    "high_utilization": {
      "any_card_utilization_gte_50": true,
      "aggregate_utilization_pct": 68.0,
      "any_interest_charges": true,
      "any_overdue": false,
      "highest_card_utilization": 68.0
    },
    "subscription_heavy": {
      "recurring_merchant_count": 5,
      "monthly_recurring_spend": 127.5,
      "subscription_share_pct": 12.0,
      "merchants": [
        "Netflix",
        "Spotify",
        "Adobe Creative",
        "Planet Fitness",
        "NYT"
      ]
    }
  },
  "all_matches": ["high_utilization", "subscription_heavy"],
  "assigned_at": "2025-11-03T10:30:00Z"
}
```

**Error Response (400 Bad Request):**

```json
{
  "error": "Invalid window_type. Must be '30d' or '180d'",
  "code": "INVALID_WINDOW_TYPE"
}
```

**Error Response (404 Not Found):**

```json
{
  "error": "No signals available for user",
  "code": "NO_SIGNALS",
  "user_id": "user_123"
}
```

---

### Endpoint 2: Get Persona

**Purpose:** Retrieve the current persona assignment for a user.

```http
GET /api/personas/{user_id}?window_type=30d
```

**Path Parameters:**

- `user_id` (required): User identifier

**Query Parameters:**

- `window_type` (optional, default: `30d`): Time window (`30d` or `180d`)

**Response (200 OK):**

```json
{
  "user_id": "user_123",
  "window_type": "30d",
  "primary_persona": "high_utilization",
  "primary_match_strength": "strong",
  "secondary_personas": ["subscription_heavy"],
  "criteria_met": {
    "high_utilization": { ... },
    "subscription_heavy": { ... }
  },
  "assigned_at": "2025-11-03T10:30:00Z",
  "last_transition": {
    "from_persona": "subscription_heavy",
    "to_persona": "high_utilization",
    "transition_date": "2025-10-15",
    "days_ago": 19
  }
}
```

**Error Response (404 Not Found):**

```json
{
  "error": "No persona assignment found for user",
  "code": "PERSONA_NOT_FOUND",
  "user_id": "user_123"
}
```

---

### Endpoint 3: Detect Transition

**Purpose:** Detect if a user has transitioned between personas.

```http
POST /api/personas/detect-transition
Content-Type: application/json
```

**Request Body:**

```json
{
  "user_id": "user_123"
}
```

**Response (200 OK - Transition Detected):**

```json
{
  "transition_detected": true,
  "from_persona": "high_utilization",
  "to_persona": "savings_builder",
  "transition_date": "2025-11-03",
  "from_assigned_at": "2025-09-19T10:30:00Z",
  "days_in_previous_persona": 45,
  "celebration_message": "🎉 Congratulations! You've improved your credit health and started building savings!",
  "milestone_achieved": "credit_to_savings",
  "achievement_title": "Financial Health Turnaround",
  "is_positive_transition": true
}
```

**Response (200 OK - No Transition):**

```json
{
  "transition_detected": false
}
```

**Error Response (404 Not Found):**

```json
{
  "error": "Insufficient persona history to detect transition",
  "code": "INSUFFICIENT_HISTORY",
  "user_id": "user_123"
}
```

---

### Endpoint 4: Get Transition History

**Purpose:** Retrieve a user's transition history.

```http
GET /api/personas/{user_id}/transitions?limit=10
```

**Path Parameters:**

- `user_id` (required): User identifier

**Query Parameters:**

- `limit` (optional, default: `10`): Max transitions to return (1-50)

**Response (200 OK):**

```json
{
  "user_id": "user_123",
  "transitions": [
    {
      "from_persona": "high_utilization",
      "to_persona": "savings_builder",
      "transition_date": "2025-11-03",
      "milestone_achieved": "credit_to_savings",
      "celebration_shown": true,
      "achievement_title": "Financial Health Turnaround",
      "days_in_previous_persona": 45
    },
    {
      "from_persona": "subscription_heavy",
      "to_persona": "high_utilization",
      "transition_date": "2025-10-15",
      "milestone_achieved": null,
      "celebration_shown": false,
      "achievement_title": null,
      "days_in_previous_persona": 30
    }
  ],
  "total_count": 2
}
```

---

### Endpoint 5: Get Persona Tenure

**Purpose:** Get how long user has been in current persona.

```http
GET /api/personas/{user_id}/tenure
```

**Response (200 OK):**

```json
{
  "user_id": "user_123",
  "current_persona": "savings_builder",
  "assigned_at": "2025-11-03T10:30:00Z",
  "days_in_persona": 12,
  "previous_persona": "high_utilization",
  "last_transition_date": "2025-11-03"
}
```

---

### Endpoint 6: Batch Assign Personas

**Purpose:** Assign personas to multiple users in batch.

```http
POST /api/personas/batch-assign
Content-Type: application/json
```

**Request Body:**

```json
{
  "user_ids": ["user_123", "user_456", "user_789"],
  "window_type": "30d"
}
```

**Response (200 OK):**

```json
{
  "total_requested": 3,
  "successful": 3,
  "failed": 0,
  "results": [
    {
      "user_id": "user_123",
      "status": "success",
      "primary_persona": "high_utilization"
    },
    {
      "user_id": "user_456",
      "status": "success",
      "primary_persona": "savings_builder"
    },
    {
      "user_id": "user_789",
      "status": "success",
      "primary_persona": "student"
    }
  ]
}
```

---

## Implementation Patterns

### Pattern 1: Storing Assignments

```python
# /personas/assignment.py

def store_assignment(self, assignment: Dict) -> str:
    """Store persona assignment in database."""
    assignment_id = f"{assignment['user_id']}_{assignment['window_type']}_{int(datetime.now().timestamp())}"

    query = """
        INSERT INTO user_personas
        (assignment_id, user_id, window_type, primary_persona,
         primary_match_strength, secondary_personas, criteria_met,
         all_matches, assigned_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    """

    self.db.execute(query, (
        assignment_id,
        assignment['user_id'],
        assignment['window_type'],
        assignment['primary_persona'],
        assignment['primary_match_strength'],
        json.dumps(assignment['secondary_personas']),
        json.dumps(assignment['criteria_met']),
        json.dumps(assignment['all_matches'])
    ))

    self.db.commit()
    return assignment_id
```

### Pattern 2: Loading Latest Assignment

```python
def get_latest_assignment(self, user_id: str, window_type: str = '30d') -> Optional[Dict]:
    """Load most recent persona assignment."""
    query = """
        SELECT assignment_id, primary_persona, primary_match_strength,
               secondary_personas, criteria_met, all_matches, assigned_at
        FROM user_personas
        WHERE user_id = ? AND window_type = ?
        ORDER BY assigned_at DESC
        LIMIT 1
    """

    cursor = self.db.execute(query, (user_id, window_type))
    row = cursor.fetchone()

    if not row:
        return None

    return {
        'assignment_id': row[0],
        'user_id': user_id,
        'window_type': window_type,
        'primary_persona': row[1],
        'primary_match_strength': row[2],
        'secondary_personas': json.loads(row[3]) if row[3] else [],
        'criteria_met': json.loads(row[4]) if row[4] else {},
        'all_matches': json.loads(row[5]) if row[5] else [],
        'assigned_at': row[6]
    }
```

### Pattern 3: Bulk Insert Assignments

```python
def batch_store_assignments(self, assignments: List[Dict]):
    """Store multiple assignments efficiently."""
    records = []
    for assignment in assignments:
        assignment_id = f"{assignment['user_id']}_{assignment['window_type']}_{int(datetime.now().timestamp())}"
        records.append((
            assignment_id,
            assignment['user_id'],
            assignment['window_type'],
            assignment['primary_persona'],
            assignment['primary_match_strength'],
            json.dumps(assignment['secondary_personas']),
            json.dumps(assignment['criteria_met']),
            json.dumps(assignment['all_matches'])
        ))

    query = """
        INSERT INTO user_personas
        (assignment_id, user_id, window_type, primary_persona,
         primary_match_strength, secondary_personas, criteria_met,
         all_matches, assigned_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    """

    self.db.executemany(query, records)
    self.db.commit()
```

---

## Data Validation Rules

### Assignment Data Validation

```python
def validate_assignment(assignment: Dict) -> bool:
    """Validate assignment data before storage."""

    # Required fields
    required_fields = [
        'user_id', 'window_type', 'primary_persona',
        'criteria_met', 'assigned_at'
    ]

    for field in required_fields:
        if field not in assignment:
            raise ValueError(f"Missing required field: {field}")

    # Valid window_type
    if assignment['window_type'] not in ['30d', '180d']:
        raise ValueError("window_type must be '30d' or '180d'")

    # Valid persona
    valid_personas = [
        'high_utilization', 'variable_income_budgeter',
        'student', 'subscription_heavy', 'savings_builder',
        'general', 'none'
    ]
    if assignment['primary_persona'] not in valid_personas:
        raise ValueError(f"Invalid persona: {assignment['primary_persona']}")

    # Valid match strength
    valid_strengths = ['strong', 'moderate', 'weak', 'default', 'none']
    if assignment.get('primary_match_strength') not in valid_strengths:
        raise ValueError(f"Invalid match strength: {assignment.get('primary_match_strength')}")

    # criteria_met must be dict
    if not isinstance(assignment['criteria_met'], dict):
        raise ValueError("criteria_met must be a dictionary")

    return True
```

---

## Analytics Queries

### Query 1: Persona Distribution

```sql
-- Get distribution of personas across all users
SELECT
    primary_persona,
    COUNT(*) as user_count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(DISTINCT user_id) FROM user_personas), 2) as percentage
FROM user_personas
WHERE window_type = '30d'
    AND assigned_at >= datetime('now', '-7 days')
GROUP BY primary_persona
ORDER BY user_count DESC;
```

### Query 2: Transition Patterns

```sql
-- Most common transition paths
SELECT
    from_persona,
    to_persona,
    COUNT(*) as transition_count,
    AVG(days_in_previous_persona) as avg_days_in_previous
FROM persona_transitions
WHERE transition_date >= date('now', '-30 days')
GROUP BY from_persona, to_persona
ORDER BY transition_count DESC
LIMIT 10;
```

### Query 3: Positive Transition Rate

```sql
-- Percentage of positive transitions
SELECT
    COUNT(CASE WHEN celebration_shown = 1 THEN 1 END) * 100.0 / COUNT(*) as positive_transition_pct,
    COUNT(*) as total_transitions,
    COUNT(CASE WHEN celebration_shown = 1 THEN 1 END) as positive_transitions
FROM persona_transitions
WHERE transition_date >= date('now', '-30 days');
```

### Query 4: Users Ready for Transition Check

```sql
-- Users with recent assignments (ready for transition check)
SELECT
    user_id,
    primary_persona,
    assigned_at,
    julianday('now') - julianday(assigned_at) as days_since_assignment
FROM user_personas
WHERE window_type = '30d'
    AND assigned_at = (
        SELECT MAX(assigned_at)
        FROM user_personas up2
        WHERE up2.user_id = user_personas.user_id
            AND up2.window_type = '30d'
    )
    AND julianday('now') - julianday(assigned_at) >= 7
ORDER BY assigned_at ASC
LIMIT 100;
```

---

## Database Migration Scripts

### Migration 1: Create Tables

```sql
-- migration_001_create_personas_tables.sql

-- Create user_personas table
CREATE TABLE IF NOT EXISTS user_personas (
    assignment_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    window_type TEXT NOT NULL,
    primary_persona TEXT NOT NULL,
    primary_match_strength TEXT,
    secondary_personas JSON,
    criteria_met JSON NOT NULL,
    all_matches JSON,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_personas_user_id ON user_personas(user_id);
CREATE INDEX IF NOT EXISTS idx_user_personas_primary ON user_personas(primary_persona);
CREATE INDEX IF NOT EXISTS idx_user_personas_window ON user_personas(window_type);
CREATE INDEX IF NOT EXISTS idx_user_personas_assigned_at ON user_personas(assigned_at);
CREATE INDEX IF NOT EXISTS idx_user_personas_user_window ON user_personas(user_id, window_type);

-- Create persona_transitions table
CREATE TABLE IF NOT EXISTS persona_transitions (
    transition_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    from_persona TEXT NOT NULL,
    to_persona TEXT NOT NULL,
    transition_date DATE NOT NULL,
    days_in_previous_persona INTEGER,
    celebration_shown BOOLEAN DEFAULT FALSE,
    milestone_achieved TEXT,
    achievement_title TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transitions_user_id ON persona_transitions(user_id);
CREATE INDEX IF NOT EXISTS idx_transitions_date ON persona_transitions(transition_date);
CREATE INDEX IF NOT EXISTS idx_transitions_from_persona ON persona_transitions(from_persona);
CREATE INDEX IF NOT EXISTS idx_transitions_to_persona ON persona_transitions(to_persona);
CREATE INDEX IF NOT EXISTS idx_transitions_milestone ON persona_transitions(milestone_achieved);
```

---

## Integration Contracts

### Contract 1: Signal Data Format (from PRD #2)

Assignment algorithm expects signals in this format:

```python
signals = {
    'credit': {
        'aggregate_utilization_pct': float,
        'any_card_high_util': bool,
        'any_interest_charges': bool,
        'any_overdue': bool,
        'num_credit_cards': int,
        'cards': [
            {
                'utilization_pct': float,
                'minimum_payment_only': bool
            }
        ]
    },
    'income': {
        'median_pay_gap_days': int,
        'cash_flow_buffer_months': float,
        'income_variability_pct': float,
        'payment_frequency': str,  # 'regular', 'irregular'
        'income_type': str  # 'salary', 'freelance', 'mixed'
    },
    'subscriptions': {
        'recurring_merchant_count': int,
        'monthly_recurring_spend': float,
        'subscription_share_pct': float,
        'coffee_food_delivery_monthly': float,
        'merchants': [str]
    },
    'savings': {
        'savings_growth_rate_pct': float,
        'net_savings_inflow': float,
        'total_savings_balance': float,
        'emergency_fund_months': float
    },
    'user_metadata': {
        'age_bracket': str,  # '18-25', '26-35', etc.
        'annual_income': float,
        'student_loan_account_present': bool,
        'has_rent_transactions': bool,
        'has_mortgage': bool,
        'transaction_count_monthly': int,
        'essentials_pct': float
    }
}
```

---

## Implementation Checklist

- [ ] Create database migration script
- [ ] Run migration to create tables and indexes
- [ ] Implement `store_assignment()` method
- [ ] Implement `get_latest_assignment()` method
- [ ] Implement `batch_store_assignments()` method
- [ ] Implement all API endpoints
- [ ] Add data validation
- [ ] Test API endpoints with curl/Postman
- [ ] Verify index performance
- [ ] Test bulk operations
- [ ] Document API in OpenAPI/Swagger format

---

## Next Steps

1. **Run database migrations** → Create tables
2. **→ Return to PRD_02** → Integrate storage methods
3. **→ Return to PRD_03** → Integrate transition storage
4. **→ Go to PRD_05** → Test database operations

---

**Pro Tip for Cursor:** Start by running the migration script to create tables, then implement the storage methods in PRD_02 and PRD_03 to actually use these tables.
