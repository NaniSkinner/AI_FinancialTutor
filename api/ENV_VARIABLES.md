# SpendSense Operator Dashboard API - Environment Variables

## Setup Instructions

1. Create a `.env` file in the `/api` directory
2. Copy the variables below and update the values
3. **IMPORTANT:** Change `JWT_SECRET_KEY` to a secure random string in production

## Required Environment Variables

### JWT Authentication

```bash
# JWT secret key - CHANGE THIS IN PRODUCTION!
# Should be a long, random string (minimum 32 characters)
# Generate with: python -c "import secrets; print(secrets.token_urlsafe(32))"
JWT_SECRET_KEY=your-secret-key-change-in-production-min-32-chars-long-for-security

# JWT algorithm (default: HS256)
JWT_ALGORITHM=HS256

# JWT token expiration time in minutes (default: 480 = 8 hours)
JWT_EXPIRE_MINUTES=480
```

### API Configuration

```bash
# API host (0.0.0.0 to allow external connections)
API_HOST=0.0.0.0

# API port
API_PORT=8000

# Debug mode (true for development, false for production)
DEBUG=true
```

### CORS Configuration

```bash
# Allowed CORS origins (comma-separated)
# Add your frontend URLs here
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Database

```bash
# Database path (relative to api directory)
DATABASE_PATH=../spendsense.db
```

## Generate Secure JWT Secret

For production, generate a secure random secret key:

```bash
# Using Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Using OpenSSL
openssl rand -base64 32
```

## Example .env File

Create `/api/.env` with:

```bash
JWT_SECRET_KEY=your-generated-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=480
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=true
CORS_ORIGINS=http://localhost:3000
DATABASE_PATH=../spendsense.db
```

## Security Notes

- **Never commit `.env` file to version control**
- Change the JWT secret key before deploying to production
- Use a key management service (AWS Secrets Manager, Azure Key Vault, etc.) in production
- Set `DEBUG=false` in production
- Restrict CORS origins to your actual frontend domains in production
