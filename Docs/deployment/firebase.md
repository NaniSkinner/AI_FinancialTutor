# Firebase Setup Guide for SpendSense

## Overview

Firebase Firestore will replace SQLite as the production database for SpendSense. This guide covers setting up Firebase, configuring Firestore, and integrating with both the frontend and backend.

---

## Step 1: Create Firebase Project

### 1.1 Create Project in Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" or "Create a project"
3. Project name: `spendsense-production`
4. Enable Google Analytics (optional but recommended)
5. Choose analytics account or create new one
6. Click "Create project"

### 1.2 Enable Firestore Database

1. In Firebase Console, go to **Build > Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode** (we'll add security rules later)
4. Select region: **us-east1** (or closest to your users)
5. Click "Enable"

---

## Step 2: Get Firebase Configuration

### 2.1 Web App Configuration (Frontend)

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click "Add app" > Select Web (</> icon)
4. App nickname: `SpendSense Operator Dashboard`
5. Check "Also set up Firebase Hosting" (optional)
6. Click "Register app"
7. Copy the configuration object:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "spendsense-production.firebaseapp.com",
  projectId: "spendsense-production",
  storageBucket: "spendsense-production.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123...",
};
```

Save these values - you'll need them for environment variables.

### 2.2 Service Account (Backend)

1. In Firebase Console, go to **Project Settings > Service accounts**
2. Click "Generate new private key"
3. Click "Generate key" - downloads JSON file
4. **IMPORTANT**: Store this file securely, never commit to Git
5. Save as `firebase-service-account.json` in a secure location

---

## Step 3: Firestore Schema Design

### Collections Structure

```
📁 users/
  └── {userId}/
      - user_id: string
      - email: string
      - created_at: timestamp
      - consent_preferences: map
      - onboarding_completed: boolean

📁 recommendations/
  └── {recommendationId}/
      - recommendation_id: string
      - user_id: string
      - status: string (pending|approved|rejected|flagged)
      - persona_primary: string
      - persona_secondary: array<string>
      - priority: string (high|medium|low)
      - title: string
      - rationale: string
      - content_id: string
      - created_at: timestamp
      - generated_at: timestamp
      - approved_by: string (nullable)
      - approved_at: timestamp (nullable)
      - operator_notes: string (nullable)
      - status_changed_at: timestamp (nullable)
      - undo_window_expires_at: timestamp (nullable)
      - previous_status: string (nullable)

📁 user_signals/
  └── {userId}/
      - user_id: string
      - window_type: string (30d|90d|180d)
      - calculated_at: timestamp
      - signals: map
          - subscriptions: map
              - recurring_merchant_count: number
              - monthly_recurring_spend: number
              - subscription_share_pct: number
          - credit: map
              - total_credit_available: number
              - total_credit_used: number
              - aggregate_utilization_pct: number
              - any_card_high_util: boolean
              - any_interest_charges: boolean
          - savings: map
              - total_savings_balance: number
              - net_savings_inflow: number
              - savings_growth_rate_pct: number
              - emergency_fund_months: number
          - income: map
              - income_type: string
              - monthly_income: number
              - payment_frequency: string
              - cash_flow_buffer_months: number

📁 persona_history/
  └── {userId}/
      - user_id: string
      - entries: array<map>
          - date: timestamp
          - persona_primary: string
          - persona_secondary: array<string>
          - match_strength: number
          - window_type: string

📁 audit_logs/
  └── {logId}/
      - action: string (approve|reject|modify|flag|undo)
      - operator_id: string
      - recommendation_id: string
      - timestamp: timestamp
      - details: map
      - user_id: string
      - changes: map (nullable)

📁 operator_notes/
  └── {noteId}/
      - note_id: string
      - recommendation_id: string
      - operator_id: string
      - note_text: string
      - created_at: timestamp
      - updated_at: timestamp (nullable)

📁 tags/
  └── {tagId}/
      - tag_id: string
      - recommendation_id: string
      - tag_name: string
      - tagged_by: string
      - tagged_at: timestamp
```

### Indexes Required

Create these composite indexes in Firestore Console > Indexes:

```
Collection: recommendations
Fields:
  - status (Ascending)
  - created_at (Descending)

Collection: recommendations
Fields:
  - user_id (Ascending)
  - created_at (Descending)

Collection: audit_logs
Fields:
  - operator_id (Ascending)
  - timestamp (Descending)

Collection: tags
Fields:
  - recommendation_id (Ascending)
  - created_at (Descending)
```

---

## Step 4: Security Rules (Development)

For initial development, use these permissive rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all reads and writes (DEVELOPMENT ONLY)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ WARNING**: These rules are for development only. Update to production rules in Phase 6.

---

## Step 5: Environment Variables

### Frontend (Vercel)

Add these to Vercel dashboard:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=spendsense-production.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=spendsense-production
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=spendsense-production.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Backend (AWS App Runner)

Set these as environment variables:

```env
FIREBASE_PROJECT_ID=spendsense-production
```

For the service account JSON, either:

- **Option A**: Upload JSON as secret file
- **Option B**: Set entire JSON as environment variable `FIREBASE_CREDENTIALS`

---

## Step 6: Verify Setup

### Test Firestore Access

In Firebase Console > Firestore Database:

1. Manually create a test document:

   - Collection: `test`
   - Document ID: `doc1`
   - Fields: `message: "Hello Firestore"`

2. Verify it appears in the database
3. Delete the test collection

### Check Quota Limits

Free Tier (Spark Plan):

- 50K reads/day
- 20K writes/day
- 20K deletes/day
- 1 GB storage

For production, consider **Blaze Plan** (pay-as-you-go):

- More generous limits
- Required for some features
- Only pay for what you use

---

## Step 7: Firebase CLI Setup (Optional)

For advanced management and deployments:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize project
cd /Users/nanis/dev/Gauntlet/SpendSense
firebase init firestore

# Select existing project
# Choose default for Firestore rules location
# Choose default for Firestore indexes location

# Deploy rules and indexes
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

---

## Next Steps

After Firebase setup is complete:

1. ✅ Mark Phase 2 as complete
2. ⏭️ Proceed to Phase 2b: Install Firebase SDKs
3. ⏭️ Create Firebase adapter for backend
4. ⏭️ Update frontend to use Firebase
5. ⏭️ Test connection from both frontend and backend

---

## Troubleshooting

### "Permission denied" errors

- Check security rules are set to allow access
- Verify service account has correct permissions
- Ensure API keys are correct

### "Quota exceeded" errors

- Upgrade to Blaze plan
- Optimize queries to reduce reads
- Implement caching

### Connection timeout

- Check region is closest to your deployment
- Verify network connectivity
- Check Firestore status page

---

## Security Notes

- **Never commit** service account JSON to Git
- Use `.gitignore` for credential files
- Rotate keys if exposed
- Set up proper security rules before production
- Enable App Check for additional security
- Monitor usage in Firebase Console

---

## Cost Estimates

**Spark Plan (Free)**:

- Good for: Development, testing
- Limits: 50K reads, 20K writes/day

**Blaze Plan (Production)**:

- Reads: $0.06 per 100K documents
- Writes: $0.18 per 100K documents
- Storage: $0.18/GB/month
- Network: $0.12/GB

**Estimated Monthly Cost**:

- 100 users, 5 recommendations each/day
- ~150K reads/day = ~4.5M/month = $2.70
- ~10K writes/day = ~300K/month = $0.54
- 1GB storage = $0.18
- **Total: ~$3-5/month**

---

## Resources

- [Firebase Console](https://console.firebase.google.com)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Pricing Calculator](https://firebase.google.com/pricing)
