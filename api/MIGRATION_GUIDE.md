# Data Migration Guide: SQLite to Firestore

## Overview

This guide covers migrating your SpendSense data from the local SQLite database to Firebase Firestore for production deployment.

## Prerequisites

1. ✅ Firebase project created
2. ✅ Firestore database enabled
3. ✅ Firebase Admin SDK installed: `pip install firebase-admin`
4. ✅ Service account credentials configured
5. ✅ Environment variables set

## Migration Options

### Option 1: Migrate Existing Data

Use this if you have real data in SQLite that you want to preserve.

### Option 2: Generate Fresh Data

Use this for a clean start with synthetic data in production.

---

## Option 1: Migrate Existing SQLite Data

### Step 1: Backup Your Database

```bash
cd /Users/nanis/dev/Gauntlet/SpendSense

# Create backup
cp spendsense.db spendsense.db.backup_$(date +%Y%m%d_%H%M%S)

# Verify backup
ls -lh spendsense.db*
```

### Step 2: Set Firebase Credentials

```bash
# Set environment variables
export FIREBASE_PROJECT_ID=spendsense-production
export FIREBASE_CREDENTIALS_PATH=/path/to/service-account.json

# Or use JSON string
export FIREBASE_CREDENTIALS='{"type":"service_account",...}'
```

### Step 3: Test Connection

```bash
cd /Users/nanis/dev/Gauntlet/SpendSense/api

python -c "from firebase_config import test_connection; test_connection()"

# Expected output: ✓ Firebase connection test successful
```

### Step 4: Dry Run Migration

```bash
# Preview migration without writing data
python migrations/sqlite_to_firestore.py \
    --source ../spendsense.db \
    --env production \
    --dry-run

# Review output:
# - Number of rows per table
# - Data transformations
# - Potential errors
```

### Step 5: Run Migration

```bash
# Migrate all data to Firestore
python migrations/sqlite_to_firestore.py \
    --source ../spendsense.db \
    --env production

# Expected output:
# Migrating users -> users
# Found 100 rows in users
# ✓ Migrated 100 documents to users
# ...
# MIGRATION COMPLETE
```

### Step 6: Verify Migration

```bash
# Verify data was migrated correctly
python migrations/sqlite_to_firestore.py \
    --source ../spendsense.db \
    --env production \
    --verify

# Check counts match:
# ✓ users: 100 documents match
# ✓ recommendations: 300 documents match
# ✓ user_signals: 100 documents match
```

### Step 7: Test in Firebase Console

1. Go to https://console.firebase.google.com
2. Select your project
3. Navigate to Firestore Database
4. Verify collections exist:
   - users
   - recommendations
   - user_signals
   - persona_history
   - audit_logs

---

## Option 2: Generate Fresh Synthetic Data

### Step 1: Set Firebase Credentials

```bash
export FIREBASE_PROJECT_ID=spendsense-production
export FIREBASE_CREDENTIALS_PATH=/path/to/service-account.json
```

### Step 2: Generate Data

```bash
cd /Users/nanis/dev/Gauntlet/SpendSense/api

# Generate 50 users with recommendations
python seed_firestore.py --users 50 --env production

# Expected output:
# Seeding 50 users...
# ✓ Seeded 50 users
# ✓ Seeded 50 user signals
# ✓ Seeded 150 recommendations
# ✓ Seeding complete
```

### Step 3: Verify in Firestore

Check Firebase Console:

- users: 50 documents
- user_signals: 50 documents
- recommendations: 150 documents

---

## Table/Collection Mapping

SQLite tables map to Firestore collections as follows:

| SQLite Table         | Firestore Collection | Notes                   |
| -------------------- | -------------------- | ----------------------- |
| `users`              | `users`              | Direct mapping          |
| `recommendations`    | `recommendations`    | Direct mapping          |
| `user_signals`       | `user_signals`       | Direct mapping          |
| `user_personas`      | `persona_history`    | Renamed for clarity     |
| `operator_audit_log` | `audit_logs`         | Renamed for consistency |

---

## Data Transformations

The migration script automatically handles:

### Datetime Conversion

- SQLite: ISO 8601 strings (`"2024-11-07T10:30:00Z"`)
- Firestore: Timestamp objects

### Boolean Conversion

- SQLite: 0/1 integers
- Firestore: true/false booleans

### NULL Handling

- NULL values are preserved
- Empty strings remain empty strings

---

## Troubleshooting

### Error: "Firebase connection failed"

**Solution:**

1. Check service account JSON is valid
2. Verify `FIREBASE_PROJECT_ID` matches your project
3. Ensure IAM permissions are correct

```bash
# Test credentials
python -c "from firebase_config import test_connection; test_connection()"
```

### Error: "Permission denied"

**Solution:**
Update Firestore security rules to allow writes:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Development only!
    }
  }
}
```

### Error: "Batch size exceeded"

**Solution:**
Reduce batch size:

```bash
python migrations/sqlite_to_firestore.py \
    --source ../spendsense.db \
    --batch-size 250
```

### Migration is Slow

**Causes:**

- Large dataset (>10K documents)
- Network latency
- Firestore rate limits

**Solutions:**

- Run from same region as Firestore
- Increase batch size (max 500)
- Run during off-peak hours

---

## Post-Migration Steps

### 1. Update Backend Configuration

```env
# In .env or environment variables
USE_FIRESTORE=true
FIREBASE_PROJECT_ID=spendsense-production
```

### 2. Test Backend API

```bash
# Start API locally with Firestore
cd /Users/nanis/dev/Gauntlet/SpendSense/api
ENVIRONMENT=production python main.py

# Test endpoint
curl http://localhost:8000/api/operator/recommendations
```

### 3. Update Frontend Configuration

```env
# In Vercel dashboard
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_API_URL=https://your-api-url.awsapprunner.com
```

### 4. Deploy to Production

```bash
# Deploy backend to AWS App Runner (see AWS_DEPLOYMENT.md)
# Deploy frontend to Vercel
cd /Users/nanis/dev/Gauntlet/SpendSense/ui/operator-dashboard
vercel --prod
```

---

## Rollback Plan

If migration fails or data is incorrect:

### Option A: Re-run Migration

```bash
# Clear Firestore collections (be careful!)
python seed_firestore.py --clear --users 0

# Re-run migration
python migrations/sqlite_to_firestore.py --source ../spendsense.db --env production
```

### Option B: Restore from Backup

```bash
# Restore SQLite backup
cp spendsense.db.backup_YYYYMMDD_HHMMSS spendsense.db

# Re-run migration from backup
python migrations/sqlite_to_firestore.py --source spendsense.db
```

---

## Data Validation Checklist

After migration, verify:

- [ ] User count matches between SQLite and Firestore
- [ ] Recommendation statuses preserved correctly
- [ ] Timestamps converted properly
- [ ] Boolean fields are true/false (not 0/1)
- [ ] No data loss (spot check random records)
- [ ] Indexes created in Firestore (see firestore.indexes.json)
- [ ] API endpoints return correct data
- [ ] Frontend displays data properly

---

## Performance Considerations

### Batch Size

- Default: 500 documents (Firestore max)
- Reduce if hitting rate limits
- Increase for faster migration (if allowed)

### Indexes

Composite indexes are required for queries. Deploy indexes:

```bash
firebase deploy --only firestore:indexes
```

Or manually create in Firebase Console.

### Rate Limits

Firestore Free Tier:

- 20K writes/day
- 50K reads/day

If migrating large datasets, upgrade to Blaze plan.

---

## Cost Estimates

**One-time migration:**

- 100 users + 300 recommendations + signals = ~500 writes
- Cost: ~$0.001 (essentially free)

**Production usage (ongoing):**

- See FIREBASE_SETUP.md for monthly cost estimates

---

## Support

### Common Commands

```bash
# Test Firebase connection
python -c "from firebase_config import test_connection; test_connection()"

# Dry run migration
python migrations/sqlite_to_firestore.py --dry-run --source spendsense.db

# Full migration with verification
python migrations/sqlite_to_firestore.py --source spendsense.db --verify

# Generate fresh data
python seed_firestore.py --users 100 --env production

# Clear all data (WARNING: destructive!)
python seed_firestore.py --clear --users 0
```

### Getting Help

- Firebase Documentation: https://firebase.google.com/docs/firestore
- Migration script: `api/migrations/sqlite_to_firestore.py`
- Seeding script: `api/seed_firestore.py`

---

## Next Steps

After successful migration:

1. ✅ Mark Phase 4 complete
2. ⏭️ Proceed to Phase 5: Integration Testing
3. ⏭️ Deploy backend to AWS App Runner
4. ⏭️ Update frontend to use production API
5. ⏭️ Run end-to-end tests
