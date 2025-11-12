# SpendSense Development Setup

Quick guide to setting up your SpendSense development environment.

## Prerequisites

- **Python 3.9+**
- **Node.js 18+** (or Bun for faster builds)
- **Git**
- **Docker** (optional, for containerized development)

## Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd SpendSense
```

### 2. Backend Setup (API)

```bash
cd api

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp ENV_VARIABLES.md .env.example
# Edit .env with your configuration

# Run the API
uvicorn main:app --reload --port 8000
```

Backend will be available at: http://localhost:8000

API docs: http://localhost:8000/docs

### 3. Frontend Setup (UI)

```bash
cd ui/operator-dashboard

# Install dependencies
npm install
# Or with Bun: bun install

# Create .env.local
cp .env.example .env.local
# Add your OpenAI API key if using AI chat

# Run development server
npm run dev
# Or with Bun: bun run dev
```

Frontend will be available at: http://localhost:3000

### 4. Data Generation (Optional)

```bash
# From project root
python generate_data.py

# This creates:
# - Synthetic users
# - Transactions
# - Account data
# - Persona assignments
```

## Environment Variables

### Backend (.env in /api/)

```bash
# See /api/ENV_VARIABLES.md for full documentation
JWT_SECRET_KEY=your-secret-key
API_HOST=0.0.0.0
API_PORT=8000
DATABASE_PATH=../spendsense.db
```

### Frontend (.env.local in /ui/operator-dashboard/)

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_OPERATOR_ID=op_001

# Feature Flags
NEXT_PUBLIC_USE_MOCK_DATA=true
NEXT_PUBLIC_ENABLE_BULK_APPROVE=true

# OpenAI (Optional)
OPENAI_API_KEY=sk-your-key-here
NEXT_PUBLIC_USE_CHAT_AI=true
```

## Running Tests

### Backend Tests

```bash
cd api
pytest
pytest --cov  # With coverage
```

### Frontend Tests

```bash
cd ui/operator-dashboard
npm test
npm test -- --coverage
```

### Integration Tests

```bash
# From project root
pytest tests/test_integration.py
```

## Development Workflow

1. **Start Backend**: `cd api && uvicorn main:app --reload`
2. **Start Frontend**: `cd ui/operator-dashboard && npm run dev`
3. **Make Changes**: Edit code with hot-reload enabled
4. **Run Tests**: Ensure tests pass before committing
5. **Commit**: Follow conventional commit format

## Common Commands

```bash
# Generate synthetic data
python generate_data.py

# View database data
python view_data.py

# Validate personas
python validate_personas.py

# Run API with logging
cd api && uvicorn main:app --reload --log-level debug

# Build frontend for production
cd ui/operator-dashboard && npm run build
```

## Troubleshooting

### Port Already in Use

```bash
# Find process on port 8000
lsof -ti:8000 | xargs kill -9

# Find process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Module Not Found (Backend)

```bash
# Ensure venv is activated
source api/venv/bin/activate

# Reinstall dependencies
pip install -r api/requirements.txt
```

### Dependencies Issue (Frontend)

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database Locked

```bash
# Stop all processes using the database
# Delete and regenerate
rm spendsense.db
python generate_data.py
```

## Additional Resources

- [Integration Testing Guide](integration-testing.md)
- [Operations Manual](operations.md)
- [API Documentation](../../api/README.md)
- [Frontend Documentation](../../ui/operator-dashboard/README.md)
- [Architecture Overview](../Architecture.md)

## Next Steps

After setup:
1. Review [Architecture](../Architecture.md)
2. Explore [Examples](../EXAMPLES.md)
3. Read component-specific READMEs
4. Start building!
