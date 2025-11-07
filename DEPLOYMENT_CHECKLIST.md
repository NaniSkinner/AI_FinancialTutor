# SpendSense Production Deployment Checklist

## ✅ Phase 1: Frontend Deployment (Vercel)

### Preparation Complete ✅

- [x] Created `vercel.json` with bun configuration
- [x] Updated `next.config.ts` for production
- [x] Created environment variable documentation (`ENV_SETUP.md`)
- [x] Created deployment guide (`VERCEL_DEPLOYMENT.md`)

### Ready to Deploy 🚀

**To deploy the frontend to Vercel:**

```bash
cd /Users/nanis/dev/Gauntlet/SpendSense/ui/operator-dashboard

# Option 1: Deploy with Vercel CLI
vercel --prod

# Option 2: Connect via GitHub and Vercel Dashboard
# 1. Push code to GitHub
# 2. Go to vercel.com/new
# 3. Import repository
# 4. Set root directory to: ui/operator-dashboard
# 5. Deploy
```

**Environment Variables to Set in Vercel:**

- `NEXT_PUBLIC_USE_MOCK_DATA` = `true`
- `NEXT_PUBLIC_API_URL` = `https://placeholder.com`
- `NEXT_PUBLIC_OPERATOR_ID` = `op_001`

---

## ⏳ Phase 2: Firebase Setup

### Files to Create

- [ ] Firebase project configuration
- [ ] Firestore security rules
- [ ] Firebase SDK integration (frontend)
- [ ] Firebase Admin SDK integration (backend)
- [ ] Firestore schema migration scripts

### Actions Required

- [ ] Create Firebase project at console.firebase.google.com
- [ ] Enable Firestore Database
- [ ] Generate service account key for backend
- [ ] Get Firebase config for frontend
- [ ] Install Firebase SDKs

---

## ⏳ Phase 3: Backend API Deployment (AWS)

### Files to Create

- [ ] Dockerfile for FastAPI
- [ ] .dockerignore
- [ ] Production database adapter (Firestore)
- [ ] Environment configuration for production
- [ ] Health check enhancements

### Actions Required

- [ ] Build Docker image
- [ ] Push to AWS ECR
- [ ] Create App Runner service
- [ ] Configure environment variables
- [ ] Set up CORS with Vercel URL

---

## ⏳ Phase 4: Database Migration

### Files to Create

- [ ] SQLite to Firestore migration script
- [ ] Data validation scripts
- [ ] Seed data scripts for Firestore

### Actions Required

- [ ] Export data from SQLite
- [ ] Transform to Firestore format
- [ ] Import to production database
- [ ] Verify data integrity

---

## ⏳ Phase 5: Integration Testing

### Files to Create

- [ ] E2E test suite updates
- [ ] API integration tests
- [ ] Load testing scripts

### Actions Required

- [ ] Update frontend to use production API
- [ ] Test all CRUD operations
- [ ] Verify real-time features
- [ ] Load test with 100+ concurrent users

---

## ⏳ Phase 6: Security & Monitoring

### Files to Create

- [ ] Firestore security rules (production)
- [ ] Monitoring configuration
- [ ] Backup scripts
- [ ] Alerting setup

### Actions Required

- [ ] Implement security rules
- [ ] Set up CloudWatch (AWS)
- [ ] Configure Vercel Analytics
- [ ] Set up Firebase monitoring
- [ ] Enable automatic backups

---

## ⏳ Phase 7: Documentation

### Files to Create

- [x] DEPLOYMENT_CHECKLIST.md (this file)
- [ ] DEPLOYMENT.md (comprehensive guide)
- [ ] OPERATIONS.md (runbook)
- [ ] ARCHITECTURE_DIAGRAM.md (updated)
- [ ] TROUBLESHOOTING.md

---

## Timeline Estimate

- **Phase 1 (Frontend)**: ✅ Ready to deploy (15 minutes to deploy)
- **Phase 2 (Firebase)**: 1 hour
- **Phase 3 (Backend)**: 3 hours
- **Phase 4 (Migration)**: 2 hours
- **Phase 5 (Testing)**: 2 hours
- **Phase 6 (Security)**: 2 hours
- **Phase 7 (Docs)**: 1 hour

**Total**: 11-13 hours of implementation

---

## Current Status

**Date**: November 7, 2025
**Phase**: 1 - Ready for Vercel Deployment
**Next Action**: Deploy frontend to Vercel, then proceed to Firebase setup

---

## Quick Deploy Commands

```bash
# Phase 1: Deploy Frontend
cd ui/operator-dashboard
vercel --prod

# Phase 2: Test Firebase locally (after setup)
cd api
python -c "from firebase_config import test_connection; test_connection()"

# Phase 3: Build and deploy backend
cd api
docker build -t spendsense-api .
# ... (push to ECR and deploy to App Runner)

# Phase 4: Run migrations
cd api
python migrations/sqlite_to_firestore.py --env production

# Phase 5: Integration tests
cd ui/operator-dashboard
bun test:e2e

# Phase 6: Verify security
cd api
python scripts/verify_security.py
```

---

## Rollback Plan

If any phase fails:

1. **Frontend**: Revert to previous Vercel deployment
2. **Backend**: Roll back App Runner to previous container
3. **Database**: Restore from Firestore backup
4. **Emergency**: Set `NEXT_PUBLIC_USE_MOCK_DATA=true` to use frontend-only mode
