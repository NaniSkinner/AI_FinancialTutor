# SpendSense Operator Dashboard API

Backend API for the SpendSense Operator Dashboard, enabling operators to review, approve, reject, and modify AI-generated financial recommendations.

## Features

- **Operator Actions**: Approve, reject, modify, and flag recommendations
- **Bulk Operations**: Process multiple recommendations at once
- **Audit Logging**: Complete audit trail of all operator actions
- **Decision Traces**: View AI decision-making process
- **User Context**: Access user signals and persona history
- **Real-time Stats**: Operator performance metrics

## Tech Stack

- **Framework**: FastAPI 0.104.1
- **Database**: SQLite (extends existing spendsense.db)
- **Validation**: Pydantic 2.5.0
- **Testing**: pytest, httpx

## Quick Start

### 1. Setup Virtual Environment

```bash
cd api
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Initialize Database Schema

```bash
python -c "from database import init_database; init_database()"
```

### 4. Run Development Server

```bash
python main.py
```

Server will be available at `http://localhost:8000`

### 5. View API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Recommendations

- `GET /api/operator/recommendations` - List recommendations with filters
- `POST /api/operator/recommendations/{id}/approve` - Approve recommendation
- `POST /api/operator/recommendations/{id}/reject` - Reject recommendation
- `PATCH /api/operator/recommendations/{id}` - Modify recommendation
- `POST /api/operator/recommendations/{id}/flag` - Flag for review
- `POST /api/operator/recommendations/bulk-approve` - Bulk approve
- `GET /api/operator/recommendations/{id}/trace` - Get decision trace

### Users

- `GET /api/operator/users/{user_id}/signals` - Get user behavioral signals
- `GET /api/operator/users/{user_id}/persona-history` - Get persona history

### Audit & Stats

- `GET /api/operator/audit-logs` - Query audit logs
- `GET /api/operator/stats` - Operator statistics

### Health

- `GET /health` - Health check endpoint
- `GET /` - API information

## Database Schema

The API extends the existing `spendsense.db` with:

1. **recommendations** (extended) - AI-generated recommendations with operator actions
2. **operator_audit_log** (new) - Complete audit trail
3. **recommendation_flags** (new) - Flagged items requiring review
4. **decision_traces** (new) - AI decision-making trace data

## Development

### Run Tests

```bash
pytest -v
```

### With Coverage

```bash
pytest --cov=. --cov-report=html
```

### Seed Test Data

```bash
python seed_data.py
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

## Project Structure

```
/api
├── main.py                 # FastAPI application entry point
├── database.py             # Database connection & initialization
├── schemas.py              # Pydantic validation schemas
├── operator_actions.py     # Core business logic
├── recommendations.py      # Recommendations router
├── users.py                # Users router
├── audit.py                # Audit router
├── seed_data.py            # Test data generator
├── requirements.txt        # Python dependencies
└── tests/                  # Test suite
    ├── conftest.py
    ├── test_operator_actions.py
    ├── test_recommendations_api.py
    └── test_integration.py
```

## Security Notes

- Authentication is currently placeholder-based (operator_id parameter)
- JWT authentication planned for production
- CORS configured for localhost (update for production)
- Use environment variables for sensitive data

## License

Proprietary - SpendSense Project
