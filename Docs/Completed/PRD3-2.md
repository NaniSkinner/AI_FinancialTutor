# PRD Shard 02: Assignment Algorithm

**Version:** 1.0  
**Date:** November 3, 2025  
**Feature Owner:** Bryce Harris  
**Project:** SpendSense - Explainable AI for Financial Education

---

## 🔗 Shard Dependencies

- **Requires:** PRD_01 (Persona Definitions)
- **Consumed by:** PRD_03 (Transitions), PRD_05 (Testing)
- **Related:** PRD_04 (Data/API for storage), PRD_00 (Quick Reference)

---

## Technical Requirements

### Technology Stack

- **Language**: Python 3.10+
- **Libraries**:
  - `datetime` (date handling)
  - `json` (data serialization)
  - `typing` (type hints)
  - `sqlite3` or `sqlalchemy` (database)
- **Database**: SQLite (dev), PostgreSQL-compatible (production)

### Module Structure

```
/personas
├── __init__.py
├── definitions.py          # Persona criteria definitions
├── assignment.py           # Assignment algorithm (THIS SHARD)
├── transitions.py          # Transition tracking (PRD_03)
└── matcher.py              # Match strength calculation
```

### Core Principles

1. **Deterministic**: Same signals → same persona (no randomness)
2. **Transparent**: Every assignment includes rationale
3. **Prioritized**: Clear priority order when multiple personas match
4. **Efficient**: Short-circuit evaluation, stop on first priority match

---

## Assignment Algorithm

### Overview

The `PersonaAssigner` class is responsible for:

1. Loading user signals from the database
2. Checking each persona in priority order
3. Calculating match strength for each match
4. Assigning primary + up to 2 secondary personas
5. Storing detailed criteria breakdown

### Class Implementation

```python
# /personas/assignment.py

from typing import Dict, List, Tuple, Optional
from datetime import datetime
import json

class PersonaAssigner:
    """
    Assigns behavioral personas to users based on financial signals.

    Personas are checked in priority order:
    1. High Utilization (financial risk)
    2. Variable Income Budgeter (stability risk)
    3. Student (life stage)
    4. Subscription-Heavy (optimization)
    5. Savings Builder (positive reinforcement)
    """

    def __init__(self, db_connection):
        """
        Initialize PersonaAssigner with database connection.

        Args:
            db_connection: SQLite or SQLAlchemy database connection
        """
        self.db = db_connection

    def assign_personas(self, user_id: str, window_type: str = '30d') -> Dict:
        """
        Assign persona(s) to user based on signals.

        Args:
            user_id: User identifier
            window_type: '30d' or '180d' - time window for signals

        Returns:
            Dictionary with persona assignment details:
            {
                'user_id': str,
                'window_type': str,
                'primary_persona': str,
                'primary_match_strength': str,
                'secondary_personas': List[str],
                'criteria_met': Dict,
                'all_matches': List[str],
                'assigned_at': str
            }
        """
        # Load signals for user
        signals = self._load_signals(user_id, window_type)

        if not signals:
            return self._no_persona_result(user_id)

        # Check each persona in priority order
        matches = []

        # 1. High Utilization (highest priority)
        if self._check_high_utilization(signals):
            strength = self._calculate_match_strength('high_utilization', signals)
            criteria = self._get_high_utilization_criteria(signals)
            matches.append(('high_utilization', strength, criteria))

        # 2. Variable Income Budgeter
        if self._check_variable_income(signals):
            strength = self._calculate_match_strength('variable_income_budgeter', signals)
            criteria = self._get_variable_income_criteria(signals)
            matches.append(('variable_income_budgeter', strength, criteria))

        # 3. Student
        if self._check_student(signals):
            strength = self._calculate_match_strength('student', signals)
            criteria = self._get_student_criteria(signals)
            matches.append(('student', strength, criteria))

        # 4. Subscription-Heavy
        if self._check_subscription_heavy(signals):
            strength = self._calculate_match_strength('subscription_heavy', signals)
            criteria = self._get_subscription_criteria(signals)
            matches.append(('subscription_heavy', strength, criteria))

        # 5. Savings Builder
        if self._check_savings_builder(signals):
            strength = self._calculate_match_strength('savings_builder', signals)
            criteria = self._get_savings_criteria(signals)
            matches.append(('savings_builder', strength, criteria))

        # If no matches, assign 'general' persona
        if not matches:
            return self._general_persona_result(user_id, signals)

        # Primary persona is first match (highest priority)
        primary = matches[0]

        # Secondary personas are next up to 2 matches
        secondary = [m[0] for m in matches[1:3]]

        result = {
            'user_id': user_id,
            'window_type': window_type,
            'primary_persona': primary[0],
            'primary_match_strength': primary[1],
            'secondary_personas': secondary,
            'criteria_met': {
                primary[0]: primary[2]
            },
            'all_matches': [m[0] for m in matches],
            'assigned_at': datetime.now().isoformat()
        }

        # Add secondary criteria
        for persona, strength, criteria in matches[1:3]:
            result['criteria_met'][persona] = criteria

        return result
```

---

## Persona Check Methods

### 1. High Utilization Check

```python
    def _check_high_utilization(self, signals: Dict) -> bool:
        """
        Check if High Utilization persona criteria met.

        Criteria: ANY of the following
        - Any card ≥50% utilization
        - Any interest charges > $0
        - Minimum payment only on any card
        - Any overdue accounts

        Args:
            signals: User signals dictionary

        Returns:
            True if criteria met, False otherwise
        """
        credit = signals.get('credit', {})

        # ANY of the following
        any_card_high_util = credit.get('any_card_high_util', False)
        any_interest = credit.get('any_interest_charges', False)
        any_overdue = credit.get('any_overdue', False)

        # Check for minimum payment only behavior
        min_payment_only = False
        for card in credit.get('cards', []):
            if card.get('minimum_payment_only', False):
                min_payment_only = True
                break

        return any_card_high_util or any_interest or min_payment_only or any_overdue
```

### 2. Variable Income Check

```python
    def _check_variable_income(self, signals: Dict) -> bool:
        """
        Check if Variable Income Budgeter persona criteria met.

        Criteria: ALL of the following
        - Median payment gap > 45 days
        - Cash flow buffer < 1 month

        Args:
            signals: User signals dictionary

        Returns:
            True if criteria met, False otherwise
        """
        income = signals.get('income', {})

        # ALL of the following
        median_gap = income.get('median_pay_gap_days', 0)
        buffer = income.get('cash_flow_buffer_months', 0)

        return median_gap > 45 and buffer < 1.0
```

### 3. Student Check

```python
    def _check_student(self, signals: Dict) -> bool:
        """
        Check if Student persona criteria met.

        Criteria: 1 MAJOR + 2 SUPPORTING

        Major (need 1):
        - Has student loan
        - Age 18-25
        - Low transaction volume + high essentials

        Supporting (need 2):
        - Income < $30K
        - Irregular income
        - High coffee/food delivery (≥$75/month)
        - Limited credit history (≤2 cards)
        - Rent, no mortgage

        Args:
            signals: User signals dictionary

        Returns:
            True if criteria met, False otherwise
        """
        # Major criteria
        has_student_loan = signals.get('student_loan_account_present', False)
        age_18_25 = signals.get('user_metadata', {}).get('age_bracket') == '18-25'

        low_trans = signals.get('transaction_count_monthly', 0) < 50
        high_essentials = signals.get('essentials_pct', 0) > 40
        low_trans_high_essentials = low_trans and high_essentials

        major_match = has_student_loan or age_18_25 or low_trans_high_essentials

        if not major_match:
            return False

        # Supporting criteria (need at least 2)
        income_lt_30k = signals.get('annual_income', 0) < 30000
        irregular_income = signals.get('income', {}).get('payment_frequency') == 'irregular'

        subscriptions = signals.get('subscriptions', {})
        high_coffee = subscriptions.get('coffee_food_delivery_monthly', 0) >= 75

        credit = signals.get('credit', {})
        limited_credit = credit.get('num_credit_cards', 0) <= 2

        rent_no_mortgage = (
            signals.get('has_rent_transactions', False) and
            not signals.get('has_mortgage', False)
        )

        supporting_count = sum([
            income_lt_30k,
            irregular_income,
            high_coffee,
            limited_credit,
            rent_no_mortgage
        ])

        return supporting_count >= 2
```

### 4. Subscription-Heavy Check

```python
    def _check_subscription_heavy(self, signals: Dict) -> bool:
        """
        Check if Subscription-Heavy persona criteria met.

        Criteria: ALL of the following
        - ≥3 recurring merchants
        - Monthly spend ≥$50 OR subscription share ≥10%

        Args:
            signals: User signals dictionary

        Returns:
            True if criteria met, False otherwise
        """
        subscriptions = signals.get('subscriptions', {})

        # ALL of the following
        recurring_count = subscriptions.get('recurring_merchant_count', 0)
        monthly_spend = subscriptions.get('monthly_recurring_spend', 0)
        share_pct = subscriptions.get('subscription_share_pct', 0)

        return (
            recurring_count >= 3 and
            (monthly_spend >= 50.0 or share_pct >= 10.0)
        )
```

### 5. Savings Builder Check

```python
    def _check_savings_builder(self, signals: Dict) -> bool:
        """
        Check if Savings Builder persona criteria met.

        Criteria: ALL of the following
        - Savings growth ≥2% OR net inflow ≥$200/month
        - All credit cards <30% utilization

        Args:
            signals: User signals dictionary

        Returns:
            True if criteria met, False otherwise
        """
        savings = signals.get('savings', {})
        credit = signals.get('credit', {})

        # Savings growth or inflow
        growth_rate = savings.get('savings_growth_rate_pct', 0)
        monthly_inflow = savings.get('net_savings_inflow', 0)

        savings_positive = growth_rate >= 2.0 or monthly_inflow >= 200.0

        # All cards <30% utilization
        aggregate_util = credit.get('aggregate_utilization_pct', 0)
        all_cards_low_util = aggregate_util < 30.0

        return savings_positive and all_cards_low_util
```

---

## Match Strength Calculation

```python
    def _calculate_match_strength(self, persona: str, signals: Dict) -> str:
        """
        Calculate match strength: 'strong', 'moderate', 'weak'.

        Strong: Meets all criteria convincingly with margin
        Moderate: Meets criteria but borderline on some
        Weak: Just barely meets minimum criteria

        Args:
            persona: Persona name
            signals: User signals dictionary

        Returns:
            'strong', 'moderate', or 'weak'
        """
        if persona == 'high_utilization':
            credit = signals.get('credit', {})
            util = credit.get('aggregate_utilization_pct', 0)

            if util >= 70 or credit.get('any_overdue', False):
                return 'strong'
            elif util >= 50:
                return 'moderate'
            else:
                return 'weak'

        elif persona == 'variable_income_budgeter':
            income = signals.get('income', {})
            buffer = income.get('cash_flow_buffer_months', 0)
            variability = income.get('income_variability_pct', 0)

            if buffer < 0.5 and variability > 30:
                return 'strong'
            elif buffer < 1.0 and variability > 20:
                return 'moderate'
            else:
                return 'weak'

        elif persona == 'student':
            # Strong if has student loan + multiple supporting criteria
            has_loan = signals.get('student_loan_account_present', False)
            supporting_count = self._count_student_supporting_criteria(signals)

            if has_loan and supporting_count >= 3:
                return 'strong'
            elif supporting_count >= 2:
                return 'moderate'
            else:
                return 'weak'

        elif persona == 'subscription_heavy':
            subscriptions = signals.get('subscriptions', {})
            count = subscriptions.get('recurring_merchant_count', 0)
            share = subscriptions.get('subscription_share_pct', 0)

            if count >= 5 and share >= 15:
                return 'strong'
            elif count >= 3 and share >= 10:
                return 'moderate'
            else:
                return 'weak'

        elif persona == 'savings_builder':
            savings = signals.get('savings', {})
            growth = savings.get('savings_growth_rate_pct', 0)
            inflow = savings.get('net_savings_inflow', 0)

            if growth >= 5 and inflow >= 400:
                return 'strong'
            elif growth >= 2 or inflow >= 200:
                return 'moderate'
            else:
                return 'weak'

        return 'weak'
```

---

## Criteria Extraction Methods

These methods extract the specific criteria details for each persona match.

### High Utilization Criteria

```python
    def _get_high_utilization_criteria(self, signals: Dict) -> Dict:
        """Get criteria breakdown for High Utilization persona."""
        credit = signals.get('credit', {})

        return {
            'any_card_utilization_gte_50': credit.get('any_card_high_util', False),
            'aggregate_utilization_pct': credit.get('aggregate_utilization_pct', 0),
            'any_interest_charges': credit.get('any_interest_charges', False),
            'any_overdue': credit.get('any_overdue', False),
            'highest_card_utilization': max(
                [c.get('utilization_pct', 0) for c in credit.get('cards', [])],
                default=0
            )
        }
```

### Variable Income Criteria

```python
    def _get_variable_income_criteria(self, signals: Dict) -> Dict:
        """Get criteria breakdown for Variable Income Budgeter persona."""
        income = signals.get('income', {})

        return {
            'median_pay_gap_days': income.get('median_pay_gap_days', 0),
            'cash_flow_buffer_months': income.get('cash_flow_buffer_months', 0),
            'income_variability_pct': income.get('income_variability_pct', 0),
            'payment_frequency': income.get('payment_frequency', 'unknown'),
            'income_type': income.get('income_type', 'unknown')
        }
```

### Student Criteria

```python
    def _get_student_criteria(self, signals: Dict) -> Dict:
        """Get criteria breakdown for Student persona."""
        subscriptions = signals.get('subscriptions', {})
        credit = signals.get('credit', {})

        return {
            'has_student_loan': signals.get('student_loan_account_present', False),
            'age_bracket': signals.get('user_metadata', {}).get('age_bracket'),
            'annual_income': signals.get('annual_income', 0),
            'coffee_food_delivery_monthly': subscriptions.get('coffee_food_delivery_monthly', 0),
            'num_credit_cards': credit.get('num_credit_cards', 0),
            'transaction_count_monthly': signals.get('transaction_count_monthly', 0),
            'essentials_pct': signals.get('essentials_pct', 0)
        }
```

### Subscription-Heavy Criteria

```python
    def _get_subscription_criteria(self, signals: Dict) -> Dict:
        """Get criteria breakdown for Subscription-Heavy persona."""
        subscriptions = signals.get('subscriptions', {})

        return {
            'recurring_merchant_count': subscriptions.get('recurring_merchant_count', 0),
            'monthly_recurring_spend': subscriptions.get('monthly_recurring_spend', 0),
            'subscription_share_pct': subscriptions.get('subscription_share_pct', 0),
            'merchants': subscriptions.get('merchants', [])
        }
```

### Savings Builder Criteria

```python
    def _get_savings_criteria(self, signals: Dict) -> Dict:
        """Get criteria breakdown for Savings Builder persona."""
        savings = signals.get('savings', {})
        credit = signals.get('credit', {})

        return {
            'savings_growth_rate_pct': savings.get('savings_growth_rate_pct', 0),
            'net_savings_inflow': savings.get('net_savings_inflow', 0),
            'aggregate_utilization_pct': credit.get('aggregate_utilization_pct', 0),
            'emergency_fund_months': savings.get('emergency_fund_months', 0),
            'total_savings_balance': savings.get('total_savings_balance', 0)
        }
```

---

## Helper Methods

### Count Student Supporting Criteria

```python
    def _count_student_supporting_criteria(self, signals: Dict) -> int:
        """Count how many student supporting criteria are met."""
        income_lt_30k = signals.get('annual_income', 0) < 30000
        irregular_income = signals.get('income', {}).get('payment_frequency') == 'irregular'

        subscriptions = signals.get('subscriptions', {})
        high_coffee = subscriptions.get('coffee_food_delivery_monthly', 0) >= 75

        credit = signals.get('credit', {})
        limited_credit = credit.get('num_credit_cards', 0) <= 2

        rent_no_mortgage = (
            signals.get('has_rent_transactions', False) and
            not signals.get('has_mortgage', False)
        )

        return sum([
            income_lt_30k,
            irregular_income,
            high_coffee,
            limited_credit,
            rent_no_mortgage
        ])
```

### Load Signals from Database

```python
    def _load_signals(self, user_id: str, window_type: str) -> Dict:
        """
        Load all signals for user from database.

        Args:
            user_id: User identifier
            window_type: '30d' or '180d'

        Returns:
            Dictionary of all signals organized by category
        """
        query = """
            SELECT signal_category, signal_data
            FROM user_signals
            WHERE user_id = ? AND window_type = ?
            ORDER BY detected_at DESC
        """

        cursor = self.db.execute(query, (user_id, window_type))
        rows = cursor.fetchall()

        signals = {}
        for category, data in rows:
            signals[category] = json.loads(data)

        # Also load user metadata
        metadata_query = """
            SELECT metadata
            FROM users
            WHERE user_id = ?
        """

        cursor = self.db.execute(metadata_query, (user_id,))
        row = cursor.fetchone()

        if row:
            signals['user_metadata'] = json.loads(row[0]) if row[0] else {}

        return signals
```

### Fallback Results

```python
    def _no_persona_result(self, user_id: str) -> Dict:
        """Return result when no signals available."""
        return {
            'user_id': user_id,
            'primary_persona': 'none',
            'primary_match_strength': 'none',
            'secondary_personas': [],
            'criteria_met': {},
            'all_matches': [],
            'assigned_at': datetime.now().isoformat(),
            'error': 'No signals available for user'
        }

    def _general_persona_result(self, user_id: str, signals: Dict) -> Dict:
        """Return result when no specific persona matches."""
        return {
            'user_id': user_id,
            'primary_persona': 'general',
            'primary_match_strength': 'default',
            'secondary_personas': [],
            'criteria_met': {
                'general': {
                    'note': 'User does not meet criteria for any specific persona'
                }
            },
            'all_matches': ['general'],
            'assigned_at': datetime.now().isoformat()
        }
```

---

## Storage Method

```python
    def store_assignment(self, assignment: Dict) -> str:
        """
        Store persona assignment in database.

        Args:
            assignment: Assignment dictionary from assign_personas()

        Returns:
            assignment_id: Unique identifier for this assignment
        """
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

---

## Performance Requirements

### Latency Targets

| Operation                        | Target    | Measurement     |
| -------------------------------- | --------- | --------------- |
| **Single user assignment**       | <500ms    | 95th percentile |
| **Batch assignment (100 users)** | <1 minute | Total runtime   |
| **Signal loading**               | <100ms    | Per user        |

### Optimization Strategies

1. **Pre-computed signals**: Never recalculate signals during assignment
2. **Short-circuit evaluation**: Stop checking personas once priority match found
3. **Efficient queries**: Use indexed columns for signal loading
4. **Minimal object creation**: Reuse data structures where possible

---

## Usage Example

```python
from personas.assignment import PersonaAssigner

# Initialize with database connection
db = sqlite3.connect('spendsense.db')
assigner = PersonaAssigner(db)

# Assign persona to user
assignment = assigner.assign_personas('user_123', window_type='30d')

# Inspect results
print(f"Primary Persona: {assignment['primary_persona']}")
print(f"Match Strength: {assignment['primary_match_strength']}")
print(f"Secondary Personas: {assignment['secondary_personas']}")
print(f"Criteria Met: {json.dumps(assignment['criteria_met'], indent=2)}")

# Store assignment
assignment_id = assigner.store_assignment(assignment)
print(f"Stored as: {assignment_id}")
```

---

## Implementation Checklist

- [ ] Create `/personas/assignment.py` file
- [ ] Implement `PersonaAssigner` class with `__init__`
- [ ] Implement `assign_personas()` main method
- [ ] Implement all 5 persona check methods
- [ ] Implement `_calculate_match_strength()` method
- [ ] Implement all criteria extraction methods
- [ ] Implement `_load_signals()` method
- [ ] Implement fallback result methods
- [ ] Implement `store_assignment()` method
- [ ] Add docstrings to all methods
- [ ] Add type hints throughout
- [ ] Test each persona check independently
- [ ] Test priority ordering with multiple matches
- [ ] Test match strength calculation
- [ ] Validate performance (<500ms per user)

---

## Next Steps

1. **Complete this implementation** → Full PersonaAssigner class
2. **→ Go to PRD_03** → Implement transition tracking
3. **→ Go to PRD_05** → Write comprehensive tests
4. **→ Reference PRD_04** → Ensure database schema is correct

---

**Pro Tip for Cursor:** Implement one persona check at a time, testing each before moving to the next. Start with High Utilization (simplest criteria), then Variable Income, then build up to Student (most complex).
