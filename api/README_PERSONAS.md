# Persona API Endpoints

REST API for SpendSense Persona System - Assign, retrieve, and track user personas based on behavioral signals.

## Base URL

```
http://localhost:8000/api/personas
```

## API Documentation

Interactive API documentation available at:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## Endpoints

### 1. Assign Persona

Assign a persona to a user based on their behavioral signals.

**Endpoint**: `POST /api/personas/assign/{user_id}`

**Request**:

```json
{
  "window_type": "30d" // or "180d"
}
```

**Response** (200):

```json
{
  "user_id": "user_001",
  "primary_persona": "high_utilization",
  "primary_match_strength": "strong",
  "secondary_personas": ["subscription_heavy"],
  "criteria_met": {
    "any_card_utilization_gte_50": true,
    "aggregate_utilization_pct": 68.0,
    "any_interest_charges": true,
    "any_overdue": true
  },
  "all_matches": ["high_utilization", "subscription_heavy"],
  "assigned_at": "2025-11-05T10:30:00Z",
  "window_type": "30d"
}
```

**Example**:

```bash
curl -X POST "http://localhost:8000/api/personas/assign/user_001" \
  -H "Content-Type: application/json" \
  -d '{"window_type": "30d"}'
```

**Error Responses**:

- `400` - Invalid window_type parameter
- `404` - User not found or no signals available
- `500` - Internal server error
- `503` - Persona system not available

---

### 2. Get Current Persona

Retrieve a user's current persona assignment.

**Endpoint**: `GET /api/personas/{user_id}`

**Query Parameters**:

- `window_type` (optional, default: "30d"): Time window ("30d" or "180d")

**Response** (200):

```json
{
  "user_id": "user_001",
  "primary_persona": "high_utilization",
  "primary_match_strength": "strong",
  "secondary_personas": ["subscription_heavy"],
  "criteria_met": {
    "any_card_utilization_gte_50": true,
    "aggregate_utilization_pct": 68.0
  },
  "all_matches": ["high_utilization", "subscription_heavy"],
  "assigned_at": "2025-11-05T10:30:00Z",
  "window_type": "30d"
}
```

**Example**:

```bash
curl "http://localhost:8000/api/personas/user_001?window_type=30d"
```

**Error Responses**:

- `400` - Invalid window_type parameter
- `404` - User not found or no persona assigned
- `500` - Internal server error

---

### 3. Detect Persona Transition

Detect if a user has transitioned between personas.

**Endpoint**: `POST /api/personas/detect-transition/{user_id}`

**Request**:

```json
{
  "window_type": "30d"
}
```

**Response** (200) - Positive Transition:

```json
{
  "user_id": "user_001",
  "transition_detected": true,
  "from_persona": "high_utilization",
  "to_persona": "savings_builder",
  "transition_date": "2025-11-05T10:30:00Z",
  "days_in_previous_persona": 45,
  "is_positive_transition": true,
  "celebration_message": "🎉 Congratulations! You've improved your credit health and started building savings!",
  "milestone_achieved": "credit_to_savings",
  "achievement_title": "Financial Health Turnaround"
}
```

**Response** (200) - No Transition:

```json
{
  "user_id": "user_001",
  "transition_detected": false
}
```

**Example**:

```bash
curl -X POST "http://localhost:8000/api/personas/detect-transition/user_001" \
  -H "Content-Type: application/json" \
  -d '{"window_type": "30d"}'
```

**Error Responses**:

- `404` - User not found or insufficient persona history
- `500` - Internal server error
- `503` - Persona system not available

---

### 4. Get Transition History

Get a user's persona transition history.

**Endpoint**: `GET /api/personas/{user_id}/transitions`

**Query Parameters**:

- `limit` (optional, default: 10, max: 100): Number of transitions to return

**Response** (200):

```json
{
  "user_id": "user_001",
  "transitions": [
    {
      "transition_id": "trans_001",
      "user_id": "user_001",
      "from_persona": "high_utilization",
      "to_persona": "savings_builder",
      "transition_date": "2025-11-05T10:00:00Z",
      "days_in_previous_persona": 45,
      "celebration_shown": true,
      "milestone_achieved": "credit_to_savings",
      "achievement_title": "Financial Health Turnaround"
    },
    {
      "transition_id": "trans_002",
      "user_id": "user_001",
      "from_persona": "student",
      "to_persona": "high_utilization",
      "transition_date": "2025-09-20T10:00:00Z",
      "days_in_previous_persona": 90,
      "celebration_shown": false
    }
  ],
  "total_transitions": 2
}
```

**Example**:

```bash
curl "http://localhost:8000/api/personas/user_001/transitions?limit=10"
```

**Error Responses**:

- `404` - User not found
- `422` - Invalid limit parameter
- `500` - Internal server error

---

### 5. Health Check

Check the health status of the persona system.

**Endpoint**: `GET /api/personas/health`

**Response** (200):

```json
{
  "status": "healthy",
  "persona_modules_available": true,
  "database_connected": true,
  "user_personas_table": true,
  "persona_transitions_table": true,
  "timestamp": "2025-11-05T10:30:00Z"
}
```

**Response** (503) - Unhealthy:

```json
{
  "status": "unhealthy",
  "persona_modules_available": false,
  "database_connected": false,
  "error": "Database connection failed",
  "timestamp": "2025-11-05T10:30:00Z"
}
```

**Example**:

```bash
curl "http://localhost:8000/api/personas/health"
```

---

## Personas

The system assigns users to one of 5 behavioral personas:

### 1. High Utilization

- **Description**: Users with high credit card utilization or overdue accounts
- **Priority**: 1 (Highest)
- **Key Criteria**: Credit utilization ≥50%, interest charges, overdue accounts

### 2. Variable Income Budgeter

- **Description**: Users with irregular income and low cash flow buffers
- **Priority**: 2
- **Key Criteria**: Payment gaps >45 days, cash flow buffer <1 month

### 3. Student

- **Description**: Students or recent graduates with limited income
- **Priority**: 3
- **Key Criteria**: Student loan, age 18-25, or low income with high lifestyle spending

### 4. Subscription-Heavy

- **Description**: Users with multiple recurring subscriptions
- **Priority**: 4
- **Key Criteria**: ≥3 subscriptions, monthly spend ≥$50 or ≥10% of spending

### 5. Savings Builder

- **Description**: Users actively building savings with healthy credit
- **Priority**: 5
- **Key Criteria**: Savings growth ≥2%, all credit cards <30% utilization

---

## Time Windows

The system supports two time windows for persona analysis:

- **30d**: Short-term analysis (30 days of data)
- **180d**: Long-term analysis (180 days of data)

Users can have different persona assignments for different time windows, allowing for both immediate and trend-based insights.

---

## Match Strength

Each persona assignment includes a match strength indicator:

- **strong**: User strongly matches the persona criteria
- **moderate**: User moderately matches the persona criteria
- **weak**: User weakly matches the persona criteria (minimum criteria met)
- **default**: Default assignment when no specific persona matches (general persona)

---

## Positive Transitions

The system celebrates 9 positive transitions with custom messages:

1. High Utilization → Savings Builder
2. High Utilization → Subscription-Heavy
3. High Utilization → General
4. Variable Income → Savings Builder
5. Variable Income → General
6. Student → Savings Builder
7. Student → General
8. Subscription-Heavy → Savings Builder
9. Subscription-Heavy → General

Each positive transition includes:

- Celebration message
- Milestone achieved
- Achievement title

---

## Error Codes

| Code | Description                                        |
| ---- | -------------------------------------------------- |
| 200  | Success                                            |
| 400  | Bad Request - Invalid parameters                   |
| 404  | Not Found - User or resource not found             |
| 422  | Validation Error - Request validation failed       |
| 500  | Internal Server Error                              |
| 503  | Service Unavailable - Persona system not available |

---

## Testing

Run the API tests:

```bash
cd api
pytest tests/test_personas.py -v
```

Run all tests with coverage:

```bash
pytest tests/test_personas.py --cov=personas --cov-report=html
```

---

## Development

### Starting the API Server

```bash
cd api
python main.py
```

The API will be available at `http://localhost:8000`

### Adding New Endpoints

1. Add Pydantic schemas to `schemas.py`
2. Implement endpoint in `personas.py`
3. Add tests to `tests/test_personas.py`
4. Update this documentation

---

## Integration

### With Recommendation Engine

```python
from personas.assignment import PersonaAssigner

# Get user's persona
assigner = PersonaAssigner(db_connection)
assignment = assigner.assign_personas(user_id, window_type='30d')
persona = assignment['primary_persona']

# Use persona to filter recommendations
if persona == 'high_utilization':
    recommended_content = get_credit_health_content()
elif persona == 'student':
    recommended_content = get_student_budget_content()
```

### With Operator Dashboard

```javascript
// Get user's current persona
const response = await fetch(`/api/personas/${userId}?window_type=30d`);
const persona = await response.json();

// Display persona in dashboard
displayPersona(persona.primary_persona, persona.primary_match_strength);
```

---

## Support

For issues or questions:

- Check the API documentation: `http://localhost:8000/docs`
- Review the tests: `api/tests/test_personas.py`
- See the PRD: `Docs/PRD3-1.md`
- View task list: `Docs/Tasks3-1.md`

---

**Last Updated**: November 5, 2025
**API Version**: 1.0
**Status**: Production Ready (awaiting signal generation)
