# SpendSense Production Deployment Guide

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Deployment Steps](#deployment-steps)
5. [Environment Variables](#environment-variables)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)
8. [Rollback Procedures](#rollback-procedures)

---

## Overview

SpendSense is deployed using a modern, scalable architecture:

- **Frontend:** Next.js app on Vercel
- **Backend:** FastAPI on AWS App Runner
- **Database:** Firebase Firestore
- **Authentication:** JWT tokens
- **Monitoring:** CloudWatch + Vercel Analytics + Firebase Console

---

## Architecture

```
┌─────────────┐      HTTPS       ┌──────────────┐
│   Browser   │ ────────────────> │    Vercel    │
│   (User)    │                   │  (Frontend)  │
└─────────────┘                   └──────────────┘
                                         │
                                         │ API Calls
                                         │
                                         v
                                  ┌──────────────┐
                                  │ AWS App      │
                                  │ Runner       │
                                  │ (Backend)    │
                                  └──────────────┘
                                         │
                                         │ Read/Write
                                         │
                                         v
                                  ┌──────────────┐
                                  │   Firebase   │
                                  │  Firestore   │
                                  │ (Database)   │
                                  └──────────────┘
```

---

## Prerequisites

### Required Accounts & Access

- [ ] Vercel account with deployment permissions
- [ ] AWS account with IAM permissions for ECR and App Runner
- [ ] Firebase project with Firestore enabled
- [ ] GitHub/Git repository access
- [ ] Domain name (optional, for custom domain)

### Required Tools

```bash
# Install required CLI tools
brew install awscli  # or: pip install awscli
npm install -g vercel firebase-tools
brew install docker  # or Docker Desktop
```

### Required Credentials

- [ ] AWS access key and secret
- [ ] Firebase service account JSON
- [ ] Vercel auth token
- [ ] OpenAI API key (optional)

---

## Deployment Steps

### Phase 1: Deploy Frontend to Vercel (15 minutes)

**File:** `VERCEL_DEPLOYMENT.md`

```bash
cd /Users/nanis/dev/Gauntlet/SpendSense/ui/operator-dashboard

# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard:
# - NEXT_PUBLIC_USE_MOCK_DATA=true (initially)
# - NEXT_PUBLIC_API_URL=https://placeholder.com
# - NEXT_PUBLIC_OPERATOR_ID=op_001
```

**Result:** Frontend accessible at `https://your-app.vercel.app`

---

### Phase 2: Set Up Firebase (30 minutes)

**File:** `FIREBASE_SETUP.md`

1. Create Firebase project at console.firebase.google.com
2. Enable Firestore Database
3. Get Firebase config (API key, project ID, etc.)
4. Download service account JSON
5. Deploy initial security rules (permissive for testing)

```bash
# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# Deploy security rules
firebase deploy --only firestore:rules
```

---

### Phase 3: Deploy Backend to AWS (1 hour)

**File:** `AWS_DEPLOYMENT.md`

```bash
cd /Users/nanis/dev/Gauntlet/SpendSense/api

# Build and push Docker image
docker build -t spendsense-api .
docker tag spendsense-api:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/spendsense-api:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/spendsense-api:latest

# Create App Runner service
aws apprunner create-service \
    --service-name spendsense-api \
    --source-configuration [...]
```

**Result:** Backend accessible at `https://xyz.us-east-1.awsapprunner.com`

---

### Phase 4: Migrate Data (30 minutes)

**File:** `MIGRATION_GUIDE.md`

Option A: Migrate existing SQLite data

```bash
cd /Users/nanis/dev/Gauntlet/SpendSense/api

python migrations/sqlite_to_firestore.py \
    --source ../spendsense.db \
    --env production \
    --verify
```

Option B: Generate fresh data

```bash
python seed_firestore.py --users 50 --env production
```

---

### Phase 5: Integration Testing (1 hour)

**File:** `INTEGRATION_TESTING.md`

1. Test backend endpoints with curl
2. Test frontend connects to backend
3. Verify CRUD operations work
4. Check data persistence
5. Test mobile responsiveness
6. Run accessibility checks

---

### Phase 6: Security & Monitoring (1 hour)

**File:** `SECURITY_MONITORING.md`

1. Deploy production Firestore security rules
2. Set up CloudWatch dashboard and alarms
3. Configure Vercel Analytics
4. Enable Firebase monitoring
5. Set up automated backups
6. Document incident response procedures

---

### Phase 7: Go Live (30 minutes)

**Final Steps:**

1. Update Vercel environment variables:

   ```env
   NEXT_PUBLIC_USE_MOCK_DATA=false
   NEXT_PUBLIC_API_URL=https://your-api.awsapprunner.com
   ```

2. Redeploy frontend:

   ```bash
   vercel --prod
   ```

3. Smoke test all features

4. Monitor for issues

---

## Environment Variables

### Frontend (Vercel)

| Variable                           | Description      | Example                           | Required |
| ---------------------------------- | ---------------- | --------------------------------- | -------- |
| `NEXT_PUBLIC_USE_MOCK_DATA`        | Enable mock mode | `false`                           | Yes      |
| `NEXT_PUBLIC_API_URL`              | Backend API URL  | `https://api.awsapprunner.com`    | Yes      |
| `NEXT_PUBLIC_OPERATOR_ID`          | Default operator | `op_001`                          | Yes      |
| `NEXT_PUBLIC_FIREBASE_API_KEY`     | Firebase config  | `AIza...`                         | Yes      |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`  | Firebase project | `spendsense-prod`                 | Yes      |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Auth domain      | `spendsense-prod.firebaseapp.com` | Yes      |

### Backend (AWS App Runner)

| Variable               | Description          | Example                  | Required |
| ---------------------- | -------------------- | ------------------------ | -------- |
| `ENVIRONMENT`          | Environment name     | `production`             | Yes      |
| `DEBUG`                | Debug mode           | `false`                  | Yes      |
| `USE_FIRESTORE`        | Use Firestore        | `true`                   | Yes      |
| `FIREBASE_PROJECT_ID`  | Firebase project     | `spendsense-production`  | Yes      |
| `FIREBASE_CREDENTIALS` | Service account JSON | `{...}`                  | Yes      |
| `CORS_ORIGINS`         | Allowed origins      | `https://app.vercel.app` | Yes      |
| `JWT_SECRET_KEY`       | JWT secret           | Generated key            | Yes      |
| `OPENAI_API_KEY`       | OpenAI API key       | `sk-...`                 | Optional |

---

## Verification

### Post-Deployment Checklist

**Frontend:**

- [ ] Loads without errors
- [ ] Login works
- [ ] Dashboard displays data
- [ ] Actions persist to backend
- [ ] Mobile responsive
- [ ] No console errors

**Backend:**

- [ ] Health check returns 200 OK
- [ ] API docs accessible
- [ ] All endpoints functional
- [ ] CORS configured correctly
- [ ] Logs show no errors

**Database:**

- [ ] Collections populated
- [ ] Security rules active
- [ ] Indexes deployed
- [ ] Backups configured

**Monitoring:**

- [ ] CloudWatch dashboard visible
- [ ] Alerts configured
- [ ] Vercel Analytics active
- [ ] Firebase monitoring enabled

---

## Troubleshooting

### Frontend Not Loading

**Symptoms:**

- Blank page
- 404 errors
- Build failures

**Solutions:**

1. Check Vercel deployment logs
2. Verify environment variables set
3. Check for build errors in logs
4. Try rebuilding: `vercel --prod`

### API Connection Errors

**Symptoms:**

- CORS errors in console
- Network errors
- 502/503 errors

**Solutions:**

1. Verify `NEXT_PUBLIC_API_URL` is correct
2. Check backend is running (health check)
3. Verify CORS origins include frontend URL
4. Check AWS App Runner logs

### Database Errors

**Symptoms:**

- "Permission denied"
- Empty data
- Read/write failures

**Solutions:**

1. Check Firestore security rules
2. Verify service account permissions
3. Check Firebase credentials are valid
4. Ensure collections exist

---

## Rollback Procedures

### Rollback Frontend

```bash
# List recent deployments
vercel ls

# Promote previous deployment
vercel promote [PREVIOUS_DEPLOYMENT_URL]
```

### Rollback Backend

```bash
# Deploy previous Docker image
aws apprunner update-service \
    --service-arn $SERVICE_ARN \
    --source-configuration ImageRepository={ImageIdentifier=$PREVIOUS_IMAGE}
```

### Rollback Database

```bash
# Restore from backup
gcloud firestore import gs://spendsense-backups/[BACKUP_DATE]
```

### Emergency Fallback

Enable mock data mode to keep frontend operational:

```env
# In Vercel
NEXT_PUBLIC_USE_MOCK_DATA=true
```

Redeploy frontend - now works without backend/database.

---

## Deployment Timeline

| Phase              | Duration     | Status          |
| ------------------ | ------------ | --------------- |
| Phase 1: Frontend  | 15 min       | ✅ Ready        |
| Phase 2: Firebase  | 30 min       | ✅ Ready        |
| Phase 3: Backend   | 1 hour       | ✅ Ready        |
| Phase 4: Migration | 30 min       | ✅ Ready        |
| Phase 5: Testing   | 1 hour       | ✅ Ready        |
| Phase 6: Security  | 1 hour       | ✅ Ready        |
| Phase 7: Go Live   | 30 min       | ✅ Ready        |
| **Total**          | **~5 hours** | ✅ **Complete** |

---

## Cost Estimates (Monthly)

- **Vercel:** $0-20 (Free tier or Pro)
- **AWS App Runner:** $25-40 (1 vCPU, 2GB RAM)
- **Firebase Firestore:** $3-10 (Blaze plan, moderate usage)
- **AWS ECR:** $1 (image storage)
- **Total:** **$30-70/month**

---

## Support & Resources

### Documentation

- **Architecture:** `Architecture.md`
- **API Docs:** https://your-api.awsapprunner.com/docs
- **Firebase:** https://console.firebase.google.com
- **Vercel:** https://vercel.com/dashboard

### Detailed Guides

- **Vercel Deployment:** `ui/operator-dashboard/VERCEL_DEPLOYMENT.md`
- **Firebase Setup:** `FIREBASE_SETUP.md`
- **AWS Deployment:** `api/AWS_DEPLOYMENT.md`
- **Migration:** `api/MIGRATION_GUIDE.md`
- **Integration Testing:** `INTEGRATION_TESTING.md`
- **Security:** `SECURITY_MONITORING.md`
- **Operations:** `OPERATIONS.md`

### Quick Commands

```bash
# Deploy frontend
cd ui/operator-dashboard && vercel --prod

# Deploy backend
cd api && docker build -t spendsense-api . && [push to ECR]

# Migrate data
cd api && python migrations/sqlite_to_firestore.py --source ../spendsense.db

# View logs
aws logs tail /aws/apprunner/spendsense-api/application --follow

# Check health
curl https://your-api.awsapprunner.com/health
```

---

## Next Steps

After successful deployment:

1. ✅ All phases complete
2. ⏭️ Monitor for first 24-48 hours
3. ⏭️ Gather user feedback
4. ⏭️ Plan feature iterations
5. ⏭️ Schedule security audit

---

**Deployment Date:** November 7, 2025  
**Status:** ✅ All implementation complete - Ready for deployment
**Version:** 1.0.0
