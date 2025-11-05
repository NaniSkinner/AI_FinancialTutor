# PRD Shard 05: Testing & Validation

**Version:** 1.0  
**Date:** November 3, 2025  
**Feature Owner:** Bryce Harris  
**Project:** SpendSense - Explainable AI for Financial Education

---

## 🔗 Shard Dependencies

- **Requires:** PRD_01 (Definitions), PRD_02 (Assignment), PRD_03 (Transitions), PRD_04 (Data/API)
- **Purpose:** Validate all implementations from PRD_02, PRD_03, PRD_04
- **Related:** PRD_00 (Quick Reference)

---

## Success Criteria

| Metric                   | Target                                         | Measurement                                     |
| ------------------------ | ---------------------------------------------- | ----------------------------------------------- |
| **Coverage**             | 100% of users assigned to a persona            | Count users with primary persona / total users  |
| **Explainability**       | 100% of assignments include criteria breakdown | All assignments have `criteria_met` field       |
| **Accuracy**             | 95% match expected persona in test cases       | Manual validation on 20 sample users            |
| **Transition Detection** | 100% of persona changes detected               | Count detected transitions / actual transitions |
| **Performance**          | Assignment completes in <500ms per user        | 95th percentile latency                         |

---

## Acceptance Criteria

**Must Have:**

- [ ] All 5 personas implemented with clear criteria
- [ ] Primary persona assigned to 100% of users
- [ ] Secondary personas assigned (up to 2) where applicable
- [ ] Match strength calculated for all assignments
- [ ] Transition detection working across time windows
- [ ] Celebration messages for positive transitions
- [ ] All assignments stored with criteria breakdown

**Should Have:**

- [ ] Assignment completes in <500ms per user
- [ ] Historical persona tracking (30d, 180d)
- [ ] Graceful handling of edge cases (multiple personas match equally)
- [ ] Detailed logging for debugging

**Nice to Have:**

- [ ] Persona comparison dashboard
- [ ] Persona distribution analytics
- [ ] A/B testing framework for persona criteria refinement

---

## Test Suite Structure

```
/tests
├── __init__.py
├── test_personas.py           # Persona assignment tests
├── test_transitions.py        # Transition detection tests
├── test_api.py               # API endpoint tests
├── test_performance.py       # Performance benchmarks
├── test_edge_cases.py        # Edge case handling
├── fixtures/
│   ├── sample_signals.py     # Test signal data
│   └── expected_results.py   # Expected persona assignments
└── conftest.py               # Pytest configuration
```

---

## Unit Tests: Persona Assignment

### Test 1: High Utilization Assignment

```python
# /tests/test_personas.py

import pytest
from personas.assignment import PersonaAssigner
from tests.fixtures.sample_signals import get_high_utilization_signals

class TestHighUtilizationPersona:

    def test_high_utilization_strong_match(self, db_connection):
        """Test strong match for high utilization (util ≥70% OR overdue)."""
        assigner = PersonaAssigner(db_connection)

        # Create signals for high utilization user
        signals = {
            'credit': {
                'aggregate_utilization_pct': 72.0,
                'any_card_high_util': True,
                'any_interest_charges': True,
                'any_overdue': True,
                'cards': [
                    {'utilization_pct': 72.0, 'minimum_payment_only': False}
                ]
            }
        }

        # Mock signal loading
        assigner._load_signals = lambda uid, wt: signals

        result = assigner.assign_personas('test_user', '30d')

        # Assertions
        assert result['primary_persona'] == 'high_utilization'
        assert result['primary_match_strength'] == 'strong'
        assert result['criteria_met']['high_utilization']['any_card_utilization_gte_50'] is True
        assert result['criteria_met']['high_utilization']['any_overdue'] is True

    def test_high_utilization_moderate_match(self, db_connection):
        """Test moderate match (util 50-69% with interest)."""
        assigner = PersonaAssigner(db_connection)

        signals = {
            'credit': {
                'aggregate_utilization_pct': 55.0,
                'any_card_high_util': True,
                'any_interest_charges': True,
                'any_overdue': False,
                'cards': [
                    {'utilization_pct': 55.0, 'minimum_payment_only': False}
                ]
            }
        }

        assigner._load_signals = lambda uid, wt: signals
        result = assigner.assign_personas('test_user', '30d')

        assert result['primary_persona'] == 'high_utilization'
        assert result['primary_match_strength'] == 'moderate'

    def test_high_utilization_interest_only(self, db_connection):
        """Test match on interest charges alone."""
        assigner = PersonaAssigner(db_connection)

        signals = {
            'credit': {
                'aggregate_utilization_pct': 35.0,
                'any_card_high_util': False,
                'any_interest_charges': True,  # This alone triggers match
                'any_overdue': False,
                'cards': [
                    {'utilization_pct': 35.0, 'minimum_payment_only': False}
                ]
            }
        }

        assigner._load_signals = lambda uid, wt: signals
        result = assigner.assign_personas('test_user', '30d')

        assert result['primary_persona'] == 'high_utilization'
        assert result['criteria_met']['high_utilization']['any_interest_charges'] is True
```

---

### Test 2: Variable Income Assignment

```python
class TestVariableIncomePersona:

    def test_variable_income_strong_match(self, db_connection):
        """Test strong match (buffer <0.5 months AND variability >30%)."""
        assigner = PersonaAssigner(db_connection)

        signals = {
            'income': {
                'median_pay_gap_days': 60,
                'cash_flow_buffer_months': 0.4,
                'income_variability_pct': 35.0,
                'payment_frequency': 'irregular',
                'income_type': 'freelance'
            }
        }

        assigner._load_signals = lambda uid, wt: signals
        result = assigner.assign_personas('test_user', '30d')

        assert result['primary_persona'] == 'variable_income_budgeter'
        assert result['primary_match_strength'] == 'strong'
        assert result['criteria_met']['variable_income_budgeter']['median_pay_gap_days'] == 60
        assert result['criteria_met']['variable_income_budgeter']['cash_flow_buffer_months'] == 0.4

    def test_variable_income_requires_both_criteria(self, db_connection):
        """Test that BOTH criteria must be met (AND logic)."""
        assigner = PersonaAssigner(db_connection)

        # Only pay gap, no buffer issue
        signals = {
            'income': {
                'median_pay_gap_days': 60,
                'cash_flow_buffer_months': 2.0,  # High buffer = doesn't match
                'income_variability_pct': 15.0
            }
        }

        assigner._load_signals = lambda uid, wt: signals
        result = assigner.assign_personas('test_user', '30d')

        # Should NOT match variable income
        assert result['primary_persona'] != 'variable_income_budgeter'
```

---

### Test 3: Student Assignment

```python
class TestStudentPersona:

    def test_student_with_loan_strong_match(self, db_connection):
        """Test strong match (has loan + 3 supporting criteria)."""
        assigner = PersonaAssigner(db_connection)

        signals = {
            'student_loan_account_present': True,
            'user_metadata': {'age_bracket': '18-25'},
            'annual_income': 18000,
            'subscriptions': {'coffee_food_delivery_monthly': 95},
            'credit': {'num_credit_cards': 1},
            'has_rent_transactions': True,
            'has_mortgage': False,
            'transaction_count_monthly': 35,
            'essentials_pct': 45,
            'income': {'payment_frequency': 'irregular'}
        }

        assigner._load_signals = lambda uid, wt: signals
        result = assigner.assign_personas('test_user', '30d')

        assert result['primary_persona'] == 'student'
        assert result['primary_match_strength'] == 'strong'
        assert result['criteria_met']['student']['has_student_loan'] is True

    def test_student_age_only_moderate_match(self, db_connection):
        """Test moderate match (age 18-25 + 2 supporting)."""
        assigner = PersonaAssigner(db_connection)

        signals = {
            'student_loan_account_present': False,
            'user_metadata': {'age_bracket': '18-25'},  # Major criterion
            'annual_income': 22000,  # Supporting #1
            'subscriptions': {'coffee_food_delivery_monthly': 80},  # Supporting #2
            'credit': {'num_credit_cards': 3},  # Doesn't count
            'has_rent_transactions': False,
            'has_mortgage': False,
            'income': {'payment_frequency': 'regular'}
        }

        assigner._load_signals = lambda uid, wt: signals
        result = assigner.assign_personas('test_user', '30d')

        assert result['primary_persona'] == 'student'
        assert result['primary_match_strength'] == 'moderate'

    def test_student_requires_major_plus_supporting(self, db_connection):
        """Test that 1 major + 2 supporting are required."""
        assigner = PersonaAssigner(db_connection)

        # Only supporting criteria, no major
        signals = {
            'student_loan_account_present': False,
            'user_metadata': {'age_bracket': '26-35'},  # Not 18-25
            'annual_income': 25000,
            'subscriptions': {'coffee_food_delivery_monthly': 80},
            'credit': {'num_credit_cards': 1},
            'transaction_count_monthly': 60
        }

        assigner._load_signals = lambda uid, wt: signals
        result = assigner.assign_personas('test_user', '30d')

        # Should NOT match student
        assert result['primary_persona'] != 'student'
```

---

### Test 4: Subscription-Heavy Assignment

```python
class TestSubscriptionHeavyPersona:

    def test_subscription_heavy_strong_match(self, db_connection):
        """Test strong match (≥5 subs AND share ≥15%)."""
        assigner = PersonaAssigner(db_connection)

        signals = {
            'subscriptions': {
                'recurring_merchant_count': 7,
                'monthly_recurring_spend': 152.94,
                'subscription_share_pct': 18.0,
                'merchants': ['Netflix', 'Spotify', 'Adobe', 'Gym', 'NYT', 'Prime', 'HBO']
            }
        }

        assigner._load_signals = lambda uid, wt: signals
        result = assigner.assign_personas('test_user', '30d')

        assert result['primary_persona'] == 'subscription_heavy'
        assert result['primary_match_strength'] == 'strong'

    def test_subscription_heavy_by_spend(self, db_connection):
        """Test match by spend threshold (≥$50) even with lower share."""
        assigner = PersonaAssigner(db_connection)

        signals = {
            'subscriptions': {
                'recurring_merchant_count': 3,
                'monthly_recurring_spend': 75.0,
                'subscription_share_pct': 8.0,  # Below 10% but spend is high
                'merchants': ['Netflix', 'Spotify', 'Gym']
            }
        }

        assigner._load_signals = lambda uid, wt: signals
        result = assigner.assign_personas('test_user', '30d')

        assert result['primary_persona'] == 'subscription_heavy'
```

---

### Test 5: Savings Builder Assignment

```python
class TestSavingsBuilderPersona:

    def test_savings_builder_strong_match(self, db_connection):
        """Test strong match (growth ≥5% AND inflow ≥$400)."""
        assigner = PersonaAssigner(db_connection)

        signals = {
            'savings': {
                'savings_growth_rate_pct': 6.0,
                'net_savings_inflow': 450.0,
                'total_savings_balance': 15000.0,
                'emergency_fund_months': 3.5
            },
            'credit': {
                'aggregate_utilization_pct': 15.0,
                'num_credit_cards': 2
            }
        }

        assigner._load_signals = lambda uid, wt: signals
        result = assigner.assign_personas('test_user', '30d')

        assert result['primary_persona'] == 'savings_builder'
        assert result['primary_match_strength'] == 'strong'

    def test_savings_builder_requires_low_utilization(self, db_connection):
        """Test that credit utilization must be <30%."""
        assigner = PersonaAssigner(db_connection)

        signals = {
            'savings': {
                'savings_growth_rate_pct': 5.0,
                'net_savings_inflow': 400.0
            },
            'credit': {
                'aggregate_utilization_pct': 45.0  # Too high!
            }
        }

        assigner._load_signals = lambda uid, wt: signals
        result = assigner.assign_personas('test_user', '30d')

        # Should NOT match savings builder
        assert result['primary_persona'] != 'savings_builder'
```

---

### Test 6: Priority Ordering

```python
class TestPersonaPriority:

    def test_high_util_beats_subscription_heavy(self, db_connection):
        """Test priority: High Utilization > Subscription-Heavy."""
        assigner = PersonaAssigner(db_connection)

        # User matches BOTH personas
        signals = {
            'credit': {
                'aggregate_utilization_pct': 55.0,
                'any_card_high_util': True,
                'any_interest_charges': True,
                'any_overdue': False,
                'cards': [{'utilization_pct': 55.0, 'minimum_payment_only': False}]
            },
            'subscriptions': {
                'recurring_merchant_count': 5,
                'monthly_recurring_spend': 127.50,
                'subscription_share_pct': 12.0
            }
        }

        assigner._load_signals = lambda uid, wt: signals
        result = assigner.assign_personas('test_user', '30d')

        # High utilization should be primary (priority 1)
        assert result['primary_persona'] == 'high_utilization'
        # Subscription-heavy should be secondary
        assert 'subscription_heavy' in result['secondary_personas']
        assert len(result['all_matches']) == 2

    def test_student_beats_savings_builder(self, db_connection):
        """Test priority: Student > Savings Builder."""
        assigner = PersonaAssigner(db_connection)

        # Unusual case: student with good savings
        signals = {
            'student_loan_account_present': True,
            'user_metadata': {'age_bracket': '18-25'},
            'annual_income': 28000,
            'credit': {'num_credit_cards': 1, 'aggregate_utilization_pct': 20.0},
            'has_rent_transactions': True,
            'has_mortgage': False,
            'savings': {
                'savings_growth_rate_pct': 3.0,
                'net_savings_inflow': 250.0
            }
        }

        assigner._load_signals = lambda uid, wt: signals
        result = assigner.assign_personas('test_user', '30d')

        # Student should be primary (priority 3 beats priority 5)
        assert result['primary_persona'] == 'student'
        assert 'savings_builder' in result['secondary_personas']
```

---

### Test 7: General Persona Fallback

```python
class TestGeneralPersona:

    def test_no_persona_match_returns_general(self, db_connection):
        """Test fallback to general persona when no criteria met."""
        assigner = PersonaAssigner(db_connection)

        # User with normal behavior
        signals = {
            'credit': {
                'aggregate_utilization_pct': 15.0,
                'any_card_high_util': False,
                'any_interest_charges': False,
                'any_overdue': False
            },
            'savings': {
                'savings_growth_rate_pct': 1.0,
                'net_savings_inflow': 50.0
            },
            'subscriptions': {
                'recurring_merchant_count': 2,
                'monthly_recurring_spend': 30.0
            },
            'income': {
                'median_pay_gap_days': 14,
                'cash_flow_buffer_months': 1.5
            }
        }

        assigner._load_signals = lambda uid, wt: signals
        result = assigner.assign_personas('test_user', '30d')

        assert result['primary_persona'] == 'general'
        assert result['primary_match_strength'] == 'default'
        assert result['secondary_personas'] == []
```

---

## Unit Tests: Transition Detection

```python
# /tests/test_transitions.py

from personas.transitions import PersonaTransitionTracker

class TestTransitionDetection:

    def test_detect_transition_basic(self, db_connection):
        """Test basic transition detection."""
        tracker = PersonaTransitionTracker(db_connection)

        # Mock previous and current personas
        tracker._get_previous_persona = lambda uid, wt: {
            'primary_persona': 'high_utilization',
            'assigned_at': '2025-10-01T10:00:00Z'
        }

        tracker._get_latest_persona = lambda uid, wt: {
            'primary_persona': 'savings_builder',
            'assigned_at': '2025-11-03T10:00:00Z'
        }

        result = tracker.detect_transition('test_user')

        assert result['transition_detected'] is True
        assert result['from_persona'] == 'high_utilization'
        assert result['to_persona'] == 'savings_builder'
        assert result['days_in_previous_persona'] == 33

    def test_no_transition_same_persona(self, db_connection):
        """Test no transition when persona unchanged."""
        tracker = PersonaTransitionTracker(db_connection)

        tracker._get_previous_persona = lambda uid, wt: {
            'primary_persona': 'savings_builder',
            'assigned_at': '2025-10-01T10:00:00Z'
        }

        tracker._get_latest_persona = lambda uid, wt: {
            'primary_persona': 'savings_builder',
            'assigned_at': '2025-11-03T10:00:00Z'
        }

        result = tracker.detect_transition('test_user')

        assert result['transition_detected'] is False

    def test_positive_transition_celebration(self, db_connection):
        """Test celebration message for positive transitions."""
        tracker = PersonaTransitionTracker(db_connection)

        from_persona = {
            'primary_persona': 'high_utilization',
            'assigned_at': '2025-10-01T10:00:00Z'
        }
        to_persona = {
            'primary_persona': 'savings_builder',
            'assigned_at': '2025-11-03T10:00:00Z'
        }

        celebration = tracker._create_celebration(from_persona, to_persona)

        assert celebration is not None
        assert celebration['is_positive_transition'] is True
        assert 'Congratulations' in celebration['celebration_message']
        assert celebration['milestone_achieved'] == 'credit_to_savings'
        assert celebration['achievement_title'] == 'Financial Health Turnaround'

    def test_all_positive_transitions_have_messages(self, db_connection):
        """Test that all defined positive transitions have messages."""
        tracker = PersonaTransitionTracker(db_connection)

        positive_transitions = [
            ('high_utilization', 'savings_builder'),
            ('high_utilization', 'general'),
            ('variable_income_budgeter', 'savings_builder'),
            ('student', 'savings_builder'),
            ('subscription_heavy', 'savings_builder')
        ]

        for from_p, to_p in positive_transitions:
            from_persona = {'primary_persona': from_p, 'assigned_at': '2025-10-01T10:00:00Z'}
            to_persona = {'primary_persona': to_p, 'assigned_at': '2025-11-03T10:00:00Z'}

            celebration = tracker._create_celebration(from_persona, to_persona)

            assert celebration is not None, f"Missing celebration for {from_p} -> {to_p}"
            assert 'celebration_message' in celebration
            assert 'milestone_achieved' in celebration
```

---

## Performance Tests

```python
# /tests/test_performance.py

import time
import pytest

class TestPerformance:

    def test_single_assignment_latency(self, db_connection):
        """Test that single assignment completes in <500ms."""
        assigner = PersonaAssigner(db_connection)

        signals = {
            'credit': {'aggregate_utilization_pct': 55.0, 'any_card_high_util': True},
            'subscriptions': {'recurring_merchant_count': 3, 'monthly_recurring_spend': 75.0}
        }

        assigner._load_signals = lambda uid, wt: signals

        start = time.time()
        result = assigner.assign_personas('test_user', '30d')
        elapsed = (time.time() - start) * 1000  # ms

        assert elapsed < 500, f"Assignment took {elapsed}ms (target: <500ms)"

    def test_batch_assignment_throughput(self, db_connection):
        """Test batch assignment for 100 users completes in <60 seconds."""
        assigner = PersonaAssigner(db_connection)

        signals = {
            'credit': {'aggregate_utilization_pct': 55.0, 'any_card_high_util': True}
        }

        assigner._load_signals = lambda uid, wt: signals

        start = time.time()
        for i in range(100):
            assigner.assign_personas(f'user_{i}', '30d')
        elapsed = time.time() - start

        assert elapsed < 60, f"Batch assignment took {elapsed}s (target: <60s)"
```

---

## Edge Case Tests

```python
# /tests/test_edge_cases.py

class TestEdgeCases:

    def test_missing_signals(self, db_connection):
        """Test graceful handling when signals missing."""
        assigner = PersonaAssigner(db_connection)

        assigner._load_signals = lambda uid, wt: {}

        result = assigner.assign_personas('test_user', '30d')

        assert result['primary_persona'] == 'none'
        assert 'error' in result

    def test_exact_threshold_values(self, db_connection):
        """Test users exactly at threshold values."""
        assigner = PersonaAssigner(db_connection)

        # Exactly 50% utilization (should match)
        signals = {
            'credit': {
                'aggregate_utilization_pct': 50.0,
                'any_card_high_util': True,
                'any_interest_charges': False,
                'any_overdue': False,
                'cards': [{'utilization_pct': 50.0, 'minimum_payment_only': False}]
            }
        }

        assigner._load_signals = lambda uid, wt: signals
        result = assigner.assign_personas('test_user', '30d')

        assert result['primary_persona'] == 'high_utilization'

    def test_invalid_window_type(self, db_connection):
        """Test handling of invalid window_type."""
        assigner = PersonaAssigner(db_connection)

        with pytest.raises(ValueError):
            assigner.assign_personas('test_user', '7d')  # Invalid
```

---

## Integration Tests

```python
# /tests/test_integration.py

class TestFullPipeline:

    def test_end_to_end_assignment_and_transition(self, db_connection):
        """Test full pipeline: signals → assignment → transition."""
        from personas.assignment import PersonaAssigner
        from personas.transitions import PersonaTransitionTracker

        assigner = PersonaAssigner(db_connection)
        tracker = PersonaTransitionTracker(db_connection)

        # Assignment 1: High Utilization
        signals1 = {
            'credit': {
                'aggregate_utilization_pct': 70.0,
                'any_card_high_util': True,
                'any_interest_charges': True,
                'any_overdue': True,
                'cards': [{'utilization_pct': 70.0, 'minimum_payment_only': False}]
            }
        }
        assigner._load_signals = lambda uid, wt: signals1
        assignment1 = assigner.assign_personas('user_integration', '30d')
        assigner.store_assignment(assignment1)

        assert assignment1['primary_persona'] == 'high_utilization'

        # Assignment 2: Savings Builder (improvement!)
        signals2 = {
            'savings': {
                'savings_growth_rate_pct': 5.0,
                'net_savings_inflow': 400.0
            },
            'credit': {
                'aggregate_utilization_pct': 20.0
            }
        }
        assigner._load_signals = lambda uid, wt: signals2
        assignment2 = assigner.assign_personas('user_integration', '30d')
        assigner.store_assignment(assignment2)

        assert assignment2['primary_persona'] == 'savings_builder'

        # Detect transition
        transition = tracker.detect_transition('user_integration')

        assert transition['transition_detected'] is True
        assert transition['from_persona'] == 'high_utilization'
        assert transition['to_persona'] == 'savings_builder'
        assert transition.get('celebration_message') is not None
```

---

## Validation Checklist

### Pre-Deployment Validation

- [ ] All 5 personas implemented with criteria
- [ ] Assignment algorithm follows priority order
- [ ] Match strength calculation working
- [ ] Transition detection functional
- [ ] Celebration messages for positive transitions
- [ ] Unit tests passing (100% pass rate)
- [ ] Performance tests meeting targets (<500ms)
- [ ] Database schema created with indexes
- [ ] API endpoints tested
- [ ] Integration with signals module verified

### Post-Deployment Validation

- [ ] Run assignment on all synthetic users (target: 100 users)
- [ ] Verify 100% have assigned persona
- [ ] Check persona distribution (expect variety)
- [ ] Validate criteria breakdown for sample users
- [ ] Test transition detection with time-series data
- [ ] Verify celebration messages appear correctly
- [ ] Monitor latency in production (<500ms p95)
- [ ] Check database index performance

---

## Running Tests

### Run All Tests

```bash
pytest tests/ -v
```

### Run Specific Test Suite

```bash
pytest tests/test_personas.py -v
pytest tests/test_transitions.py -v
pytest tests/test_performance.py -v
```

### Run with Coverage

```bash
pytest tests/ --cov=personas --cov-report=html
```

### Performance Benchmarks

```bash
pytest tests/test_performance.py -v --benchmark-only
```

---

## Manual Validation Scripts

### Script 1: Validate All Personas

```python
# /scripts/validate_personas.py

from personas.assignment import PersonaAssigner
import sqlite3

def validate_all_personas(db_path):
    """Validate all personas can be assigned correctly."""

    db = sqlite3.connect(db_path)
    assigner = PersonaAssigner(db)

    test_cases = {
        'high_utilization': {
            'credit': {
                'aggregate_utilization_pct': 70.0,
                'any_card_high_util': True,
                'any_interest_charges': True,
                'any_overdue': True,
                'cards': [{'utilization_pct': 70.0, 'minimum_payment_only': False}]
            }
        },
        'variable_income_budgeter': {
            'income': {
                'median_pay_gap_days': 60,
                'cash_flow_buffer_months': 0.5
            }
        },
        'student': {
            'student_loan_account_present': True,
            'user_metadata': {'age_bracket': '18-25'},
            'annual_income': 18000,
            'subscriptions': {'coffee_food_delivery_monthly': 80},
            'credit': {'num_credit_cards': 1}
        },
        'subscription_heavy': {
            'subscriptions': {
                'recurring_merchant_count': 5,
                'monthly_recurring_spend': 100.0,
                'subscription_share_pct': 12.0
            }
        },
        'savings_builder': {
            'savings': {
                'savings_growth_rate_pct': 5.0,
                'net_savings_inflow': 400.0
            },
            'credit': {
                'aggregate_utilization_pct': 20.0
            }
        }
    }

    print("Validating persona assignments...")
    passed = 0
    failed = 0

    for expected_persona, signals in test_cases.items():
        assigner._load_signals = lambda uid, wt: signals
        result = assigner.assign_personas(f'test_{expected_persona}', '30d')

        if result['primary_persona'] == expected_persona:
            print(f"✅ {expected_persona}: PASS")
            passed += 1
        else:
            print(f"❌ {expected_persona}: FAIL (got {result['primary_persona']})")
            failed += 1

    print(f"\nResults: {passed} passed, {failed} failed")
    return failed == 0

if __name__ == '__main__':
    success = validate_all_personas('spendsense.db')
    exit(0 if success else 1)
```

---
