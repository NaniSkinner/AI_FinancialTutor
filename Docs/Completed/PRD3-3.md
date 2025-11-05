# PRD Shard 03: Transition Tracking & Celebrations

**Version:** 1.0  
**Date:** November 3, 2025  
**Feature Owner:** Bryce Harris  
**Project:** SpendSense - Explainable AI for Financial Education

---

## 🔗 Shard Dependencies

- **Requires:** PRD_02 (Assignment Algorithm - must have persona assignments)
- **Consumed by:** PRD_04 (Data/API), PRD_05 (Testing)
- **Related:** PRD_01 (Persona Definitions), PRD_00 (Quick Reference)

---

## Overview

The Transition Tracking system detects when users move between personas and generates celebration messages for positive financial progress. This motivates users by recognizing their improvements.

### Key Features

- ✅ Automatic transition detection between persona assignments
- ✅ Celebration messages for positive transitions
- ✅ Milestone tracking (e.g., "Credit Health Turnaround")
- ✅ Historical transition logs
- ✅ Days-in-persona calculation

---

## Positive Transitions Map

### What Makes a Transition "Positive"?

Any transition that indicates financial improvement:

1. **From High Utilization → Anything else** (credit health improved)
2. **From Variable Income → Savings Builder** (stability + savings achieved)
3. **From Student → Savings Builder** (financial maturity)
4. **From Subscription-Heavy → Savings Builder** (spending optimized)
5. **Any transition → Savings Builder** (always positive)

### Celebration Messages

| From Persona       | To Persona         | Message                                                                              | Milestone             | Achievement Title             |
| ------------------ | ------------------ | ------------------------------------------------------------------------------------ | --------------------- | ----------------------------- |
| High Utilization   | Savings Builder    | 🎉 Congratulations! You've improved your credit health and started building savings! | credit_to_savings     | Financial Health Turnaround   |
| High Utilization   | Subscription-Heavy | 📈 Great progress! Your credit utilization has improved significantly!               | credit_improved       | Credit Health Recovery        |
| High Utilization   | General            | ✨ Excellent work! Your credit health has improved!                                  | credit_normalized     | Credit Health Restored        |
| Variable Income    | Savings Builder    | 🎉 Amazing! Your income has stabilized and you're building savings!                  | stability_achieved    | Income Stability & Savings    |
| Variable Income    | General            | 📊 Your cash flow situation has improved!                                            | cash_flow_improved    | Cash Flow Stability           |
| Student            | Savings Builder    | 🎓 You're making smart money moves! Keep building those savings!                     | student_graduate      | Student Financial Success     |
| Student            | General            | 🎓 Your financial habits are maturing!                                               | student_progress      | Financial Maturity            |
| Subscription-Heavy | Savings Builder    | 💰 Excellent! You've optimized your spending and started saving!                     | spending_optimized    | Spending Optimization Success |
| Subscription-Heavy | General            | ✂️ Great job managing your subscriptions!                                            | subscriptions_managed | Subscription Discipline       |

---

## PersonaTransitionTracker Class

```python
# /personas/transitions.py

from typing import Dict, List, Optional
from datetime import datetime, timedelta
import json

class PersonaTransitionTracker:
    """
    Tracks transitions between personas and generates celebration messages.

    Detects when users move from one persona to another and recognizes
    positive financial progress with celebratory messages and milestones.
    """

    def __init__(self, db_connection):
        """
        Initialize PersonaTransitionTracker with database connection.

        Args:
            db_connection: SQLite or SQLAlchemy database connection
        """
        self.db = db_connection

    def detect_transition(self, user_id: str) -> Dict:
        """
        Detect if user has transitioned between personas.

        Compares the most recent persona assignment with the previous one
        to determine if a transition occurred. Generates celebration messages
        for positive transitions.

        Args:
            user_id: User identifier

        Returns:
            Dictionary with transition details:
            {
                'transition_detected': bool,
                'from_persona': str,
                'to_persona': str,
                'transition_date': str,
                'from_assigned_at': str,
                'days_in_previous_persona': int,
                'celebration_message': str (if positive),
                'milestone_achieved': str (if positive),
                'achievement_title': str (if positive),
                'is_positive_transition': bool (if positive)
            }
        """
        # Get current and previous persona assignments
        current = self._get_latest_persona(user_id, '30d')
        previous = self._get_previous_persona(user_id, '30d')

        if not current or not previous:
            return {'transition_detected': False}

        # Check if persona changed
        if current['primary_persona'] == previous['primary_persona']:
            return {'transition_detected': False}

        # Create transition record
        transition = {
            'transition_detected': True,
            'from_persona': previous['primary_persona'],
            'to_persona': current['primary_persona'],
            'transition_date': current['assigned_at'],
            'from_assigned_at': previous['assigned_at'],
            'days_in_previous_persona': self._calculate_days_between(
                previous['assigned_at'],
                current['assigned_at']
            )
        }

        # Check if this is a positive transition (deserves celebration)
        celebration = self._create_celebration(previous, current)
        if celebration:
            transition.update(celebration)

        # Store transition
        self._store_transition(user_id, transition)

        return transition
```

---

## Celebration Generation

```python
    def _create_celebration(self, from_persona: Dict, to_persona: Dict) -> Optional[Dict]:
        """
        Generate celebration message for positive transitions.

        Positive transitions:
        - High Utilization → Any other persona
        - Variable Income → Savings Builder or General
        - Student → Savings Builder or General
        - Subscription-Heavy → Savings Builder or General

        Args:
            from_persona: Previous persona assignment dict
            to_persona: Current persona assignment dict

        Returns:
            Celebration dict if positive transition, None otherwise
        """
        from_p = from_persona['primary_persona']
        to_p = to_persona['primary_persona']

        # Map of positive transitions
        positive_transitions = {
            ('high_utilization', 'savings_builder'): {
                'message': "🎉 Congratulations! You've improved your credit health and started building savings!",
                'milestone': 'credit_to_savings',
                'achievement': 'Financial Health Turnaround'
            },
            ('high_utilization', 'subscription_heavy'): {
                'message': "📈 Great progress! Your credit utilization has improved significantly!",
                'milestone': 'credit_improved',
                'achievement': 'Credit Health Recovery'
            },
            ('high_utilization', 'general'): {
                'message': "✨ Excellent work! Your credit health has improved!",
                'milestone': 'credit_normalized',
                'achievement': 'Credit Health Restored'
            },
            ('high_utilization', 'student'): {
                'message': "📈 Your credit health has improved!",
                'milestone': 'credit_improved',
                'achievement': 'Credit Health Progress'
            },
            ('high_utilization', 'variable_income_budgeter'): {
                'message': "📈 Your credit health has improved!",
                'milestone': 'credit_improved',
                'achievement': 'Credit Health Progress'
            },
            ('variable_income_budgeter', 'savings_builder'): {
                'message': "🎉 Amazing! Your income has stabilized and you're building savings!",
                'milestone': 'stability_achieved',
                'achievement': 'Income Stability & Savings'
            },
            ('variable_income_budgeter', 'general'): {
                'message': "📊 Your cash flow situation has improved!",
                'milestone': 'cash_flow_improved',
                'achievement': 'Cash Flow Stability'
            },
            ('student', 'savings_builder'): {
                'message': "🎓 You're making smart money moves! Keep building those savings!",
                'milestone': 'student_graduate',
                'achievement': 'Student Financial Success'
            },
            ('student', 'general'): {
                'message': "🎓 Your financial habits are maturing!",
                'milestone': 'student_progress',
                'achievement': 'Financial Maturity'
            },
            ('subscription_heavy', 'savings_builder'): {
                'message': "💰 Excellent! You've optimized your spending and started saving!",
                'milestone': 'spending_optimized',
                'achievement': 'Spending Optimization Success'
            },
            ('subscription_heavy', 'general'): {
                'message': "✂️ Great job managing your subscriptions!",
                'milestone': 'subscriptions_managed',
                'achievement': 'Subscription Discipline'
            }
        }

        key = (from_p, to_p)
        if key in positive_transitions:
            transition_data = positive_transitions[key]
            return {
                'celebration_message': transition_data['message'],
                'milestone_achieved': transition_data['milestone'],
                'achievement_title': transition_data['achievement'],
                'is_positive_transition': True
            }

        return None
```

---

## Database Operations

### Get Latest Persona

```python
    def _get_latest_persona(self, user_id: str, window_type: str) -> Optional[Dict]:
        """
        Get most recent persona assignment for user.

        Args:
            user_id: User identifier
            window_type: '30d' or '180d'

        Returns:
            Dict with persona details or None if not found
        """
        query = """
            SELECT primary_persona, primary_match_strength,
                   secondary_personas, criteria_met, assigned_at
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
            'primary_persona': row[0],
            'primary_match_strength': row[1],
            'secondary_personas': json.loads(row[2]) if row[2] else [],
            'criteria_met': json.loads(row[3]) if row[3] else {},
            'assigned_at': row[4]
        }
```

### Get Previous Persona

```python
    def _get_previous_persona(self, user_id: str, window_type: str) -> Optional[Dict]:
        """
        Get second most recent persona assignment (previous state).

        Args:
            user_id: User identifier
            window_type: '30d' or '180d'

        Returns:
            Dict with persona details or None if not found
        """
        query = """
            SELECT primary_persona, primary_match_strength,
                   secondary_personas, criteria_met, assigned_at
            FROM user_personas
            WHERE user_id = ? AND window_type = ?
            ORDER BY assigned_at DESC
            LIMIT 1 OFFSET 1
        """

        cursor = self.db.execute(query, (user_id, window_type))
        row = cursor.fetchone()

        if not row:
            return None

        return {
            'primary_persona': row[0],
            'primary_match_strength': row[1],
            'secondary_personas': json.loads(row[2]) if row[2] else [],
            'criteria_met': json.loads(row[3]) if row[3] else {},
            'assigned_at': row[4]
        }
```

---

## Helper Methods

### Calculate Days Between Dates

```python
    def _calculate_days_between(self, start_date: str, end_date: str) -> int:
        """
        Calculate days between two ISO format dates.

        Args:
            start_date: ISO format datetime string
            end_date: ISO format datetime string

        Returns:
            Number of days between dates
        """
        start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        return (end - start).days
```

### Store Transition

```python
    def _store_transition(self, user_id: str, transition: Dict):
        """
        Store transition record in database.

        Args:
            user_id: User identifier
            transition: Transition dictionary with details
        """
        transition_id = f"{user_id}_{transition['from_persona']}_{transition['to_persona']}_{int(datetime.now().timestamp())}"

        query = """
            INSERT INTO persona_transitions
            (transition_id, user_id, from_persona, to_persona,
             transition_date, celebration_shown, milestone_achieved,
             achievement_title, days_in_previous_persona)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """

        self.db.execute(query, (
            transition_id,
            user_id,
            transition['from_persona'],
            transition['to_persona'],
            transition['transition_date'],
            transition.get('is_positive_transition', False),
            transition.get('milestone_achieved'),
            transition.get('achievement_title'),
            transition.get('days_in_previous_persona', 0)
        ))

        self.db.commit()
```

---

## Historical Queries

### Get Transition History

```python
    def get_transition_history(self, user_id: str, limit: int = 10) -> List[Dict]:
        """
        Get user's transition history (most recent first).

        Args:
            user_id: User identifier
            limit: Maximum number of transitions to return

        Returns:
            List of transition dictionaries
        """
        query = """
            SELECT from_persona, to_persona, transition_date,
                   milestone_achieved, celebration_shown, achievement_title,
                   days_in_previous_persona
            FROM persona_transitions
            WHERE user_id = ?
            ORDER BY transition_date DESC
            LIMIT ?
        """

        cursor = self.db.execute(query, (user_id, limit))
        rows = cursor.fetchall()

        transitions = []
        for row in rows:
            transitions.append({
                'from_persona': row[0],
                'to_persona': row[1],
                'transition_date': row[2],
                'milestone_achieved': row[3],
                'celebration_shown': row[4],
                'achievement_title': row[5],
                'days_in_previous_persona': row[6]
            })

        return transitions
```

### Get Persona Tenure

```python
    def get_persona_tenure(self, user_id: str) -> Dict:
        """
        Calculate how long user has been in current persona.

        Args:
            user_id: User identifier

        Returns:
            Dict with tenure details:
            {
                'current_persona': str,
                'assigned_at': str,
                'days_in_persona': int,
                'previous_persona': str (optional),
                'last_transition_date': str (optional)
            }
        """
        current = self._get_latest_persona(user_id, '30d')

        if not current:
            return {'error': 'No persona assignment found'}

        assigned_date = datetime.fromisoformat(current['assigned_at'].replace('Z', '+00:00'))
        days_in_persona = (datetime.now() - assigned_date).days

        result = {
            'current_persona': current['primary_persona'],
            'assigned_at': current['assigned_at'],
            'days_in_persona': days_in_persona
        }

        # Check for last transition
        previous = self._get_previous_persona(user_id, '30d')
        if previous:
            result['previous_persona'] = previous['primary_persona']
            result['last_transition_date'] = current['assigned_at']

        return result
```

---

## Usage Examples

### Example 1: Basic Transition Detection

```python
from personas.transitions import PersonaTransitionTracker

# Initialize
db = sqlite3.connect('spendsense.db')
tracker = PersonaTransitionTracker(db)

# Detect transitions
transition = tracker.detect_transition('user_123')

if transition['transition_detected']:
    print(f"Transition detected!")
    print(f"From: {transition['from_persona']}")
    print(f"To: {transition['to_persona']}")
    print(f"Days in previous persona: {transition['days_in_previous_persona']}")

    if transition.get('celebration_message'):
        print(f"\n{transition['celebration_message']}")
        print(f"Achievement: {transition['achievement_title']}")
else:
    print("No transition detected")
```

### Example 2: Show Celebration to User

```python
# After detecting transition, display to user
transition = tracker.detect_transition('user_456')

if transition.get('is_positive_transition'):
    # Display in UI
    show_celebration_modal(
        message=transition['celebration_message'],
        title=transition['achievement_title'],
        milestone=transition['milestone_achieved']
    )

    # Log achievement
    log_user_achievement(
        user_id='user_456',
        achievement=transition['achievement_title'],
        date=transition['transition_date']
    )
```

### Example 3: Get Transition History

```python
# Get last 5 transitions
history = tracker.get_transition_history('user_789', limit=5)

print("Transition History:")
for t in history:
    print(f"{t['transition_date']}: {t['from_persona']} → {t['to_persona']}")
    if t['milestone_achieved']:
        print(f"  Milestone: {t['achievement_title']}")
```

### Example 4: Check Persona Tenure

```python
# How long has user been in current persona?
tenure = tracker.get_persona_tenure('user_101')

print(f"Current Persona: {tenure['current_persona']}")
print(f"Days in this persona: {tenure['days_in_persona']}")

if 'previous_persona' in tenure:
    print(f"Previous Persona: {tenure['previous_persona']}")
    print(f"Transitioned on: {tenure['last_transition_date']}")
```

---

## Integration with Assignment Pipeline

```python
# /features/pipeline.py (example integration)

from personas.assignment import PersonaAssigner
from personas.transitions import PersonaTransitionTracker

def run_persona_pipeline(user_id: str, db):
    """Full persona assignment + transition detection pipeline."""

    # Step 1: Assign current persona
    assigner = PersonaAssigner(db)
    assignment = assigner.assign_personas(user_id, window_type='30d')
    assignment_id = assigner.store_assignment(assignment)

    print(f"Assigned persona: {assignment['primary_persona']}")

    # Step 2: Check for transitions
    tracker = PersonaTransitionTracker(db)
    transition = tracker.detect_transition(user_id)

    # Step 3: Handle transition if detected
    if transition['transition_detected']:
        print(f"Transition: {transition['from_persona']} → {transition['to_persona']}")

        if transition.get('celebration_message'):
            # Display celebration to user
            display_celebration(
                user_id=user_id,
                message=transition['celebration_message'],
                achievement=transition['achievement_title']
            )

    return {
        'assignment': assignment,
        'transition': transition
    }
```

---

## Performance Considerations

### Query Optimization

1. **Index on assigned_at**: Ensures fast retrieval of latest/previous personas
2. **Limit queries**: Use LIMIT to fetch only what's needed
3. **JSON parsing**: Only parse criteria_met when actually needed

### Caching Strategy

```python
# Cache recent transitions to avoid repeated database queries
class PersonaTransitionTracker:
    def __init__(self, db_connection):
        self.db = db_connection
        self._transition_cache = {}  # user_id -> last_transition

    def detect_transition(self, user_id: str) -> Dict:
        # Check cache first
        if user_id in self._transition_cache:
            cached = self._transition_cache[user_id]
            if (datetime.now() - cached['cached_at']).seconds < 300:  # 5 min cache
                return cached['transition']

        # ... rest of detection logic ...

        # Cache result
        self._transition_cache[user_id] = {
            'transition': transition,
            'cached_at': datetime.now()
        }

        return transition
```

---

## Implementation Checklist

- [ ] Create `/personas/transitions.py` file
- [ ] Implement `PersonaTransitionTracker` class
- [ ] Implement `detect_transition()` method
- [ ] Implement `_create_celebration()` with all positive transitions
- [ ] Implement `_get_latest_persona()` method
- [ ] Implement `_get_previous_persona()` method
- [ ] Implement `_store_transition()` method
- [ ] Implement `get_transition_history()` method
- [ ] Implement `get_persona_tenure()` method
- [ ] Add docstrings to all methods
- [ ] Test transition detection
- [ ] Test celebration messages
- [ ] Verify database operations
- [ ] Validate performance (<200ms)

---

## Next Steps

1. **Complete this implementation** → Full PersonaTransitionTracker class
2. **→ Go to PRD_04** → Verify database schema for transitions table
3. **→ Go to PRD_05** → Write tests for transition detection
4. **→ Integrate with PRD_02** → Add to persona assignment pipeline

---

**Pro Tip for Cursor:** Implement and test `_create_celebration()` first with all the positive transition mappings. This ensures celebration messages are correct before integrating with detection logic.
