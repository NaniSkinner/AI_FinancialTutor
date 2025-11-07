# Environment Variables Setup Guide

## For Local Development

Create a `.env.local` file in the `ui/operator-dashboard` directory with the following content:

```env
# Data Mode - Set to true for mock data, false for API connection
NEXT_PUBLIC_USE_MOCK_DATA=true

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Operator ID (for testing)
NEXT_PUBLIC_OPERATOR_ID=op_001
```

## For Production (Vercel)

Set these environment variables in the Vercel dashboard (Settings > Environment Variables):

### Phase 1 - Mock Data Mode (Initial Deployment)

```env
NEXT_PUBLIC_USE_MOCK_DATA=true
NEXT_PUBLIC_API_URL=https://placeholder.com
NEXT_PUBLIC_OPERATOR_ID=op_001
```

### Phase 2 - After Backend Deployment

Update these in Vercel:

```env
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_API_URL=https://your-api-url.awsapprunner.com
NEXT_PUBLIC_OPERATOR_ID=op_001
```

### Phase 3 - With Firebase Integration

Add these Firebase configuration variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

## Getting Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Project Settings (gear icon) > General
4. Scroll to "Your apps" section
5. Click on the web app or create one
6. Copy the configuration values

## Notes

- **Never commit `.env.local` or `.env.production` files**
- All variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Vercel automatically loads environment variables during build
- Changes to environment variables require redeployment
- Use Vercel's environment-specific variables for dev/preview/production

## Vercel CLI Deployment

When deploying via CLI, environment variables will be loaded from:

1. Vercel dashboard (if already set)
2. Prompted during first deployment
3. Can be set with: `vercel env add VARIABLE_NAME`

## Troubleshooting

- **Build fails**: Ensure all required `NEXT_PUBLIC_*` variables are set
- **API not connecting**: Check `NEXT_PUBLIC_API_URL` is correct
- **Mock data not loading**: Verify `NEXT_PUBLIC_USE_MOCK_DATA=true`
