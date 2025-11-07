# Firebase SDK Installation Guide

## Frontend (Next.js / Bun)

### Install Firebase SDK

```bash
cd /Users/nanis/dev/Gauntlet/SpendSense/ui/operator-dashboard

# Install Firebase client SDK
bun add firebase
```

This installs:

- `firebase` - Core Firebase SDK
- Includes: Firestore, Auth, Storage, etc.

### Verify Installation

Check that Firebase is added to `package.json`:

```json
{
  "dependencies": {
    "firebase": "^10.x.x",
    ...
  }
}
```

### Configuration Files Created

The following Firebase configuration files have been created:

1. **`lib/firebase.ts`**
   - Firebase app initialization
   - Firestore client setup
   - Auth client setup
   - Configuration validation

2. **`lib/firebaseHelpers.ts`**
   - CRUD operation helpers
   - Query builders
   - Data conversion utilities
   - Batch operations

### Usage Example

```typescript
// In any component or page
import { getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase";
import { getDocument, getDocuments } from "@/lib/firebaseHelpers";

// Check if Firebase is configured
if (isFirebaseConfigured()) {
  // Get a single recommendation
  const rec = await getDocument("recommendations", "rec_123");

  // Get all pending recommendations
  const pending = await getDocuments("recommendations", [
    where("status", "==", "pending"),
    orderBy("created_at", "desc"),
  ]);
}
```

---

## Backend (Python / FastAPI)

### Install Firebase Admin SDK

```bash
cd /Users/nanis/dev/Gauntlet/SpendSense/api

# Install Firebase Admin SDK
pip install firebase-admin

# Update requirements.txt
pip freeze > requirements.txt
```

Or install all requirements:

```bash
cd /Users/nanis/dev/Gauntlet/SpendSense/api
pip install -r requirements.txt
```

### Verify Installation

```bash
python -c "import firebase_admin; print(firebase_admin.__version__)"
```

Should output version: `6.2.0` or higher

### Configuration File Created

**`api/firebase_config.py`**

- Firebase Admin SDK initialization
- Firestore client management
- CRUD helper functions
- Query utilities
- Connection testing

### Set Up Service Account

1. Download service account JSON from Firebase Console
2. Save to a secure location (NOT in Git)
3. Set environment variable:

```bash
# Option 1: Path to JSON file
export FIREBASE_CREDENTIALS_PATH=/path/to/service-account.json

# Option 2: JSON string (for AWS/Vercel)
export FIREBASE_CREDENTIALS='{"type":"service_account",...}'

# Also set project ID
export FIREBASE_PROJECT_ID=spendsense-production
```

### Test Connection

```bash
cd /Users/nanis/dev/Gauntlet/SpendSense/api

python -c "from firebase_config import test_connection; test_connection()"
```

Expected output: `✓ Firebase connection test successful`

### Usage Example

```python
from firebase_config import get_firestore_client, get_document, query_documents

# Get Firestore client
db = get_firestore_client()

# Get a single document
recommendation = get_document('recommendations', 'rec_123')

# Query documents
pending_recs = query_documents(
    'recommendations',
    filters=[('status', '==', 'pending')],
    order_by='created_at',
    descending=True,
    limit=50
)
```

---

## Environment Variables Summary

### Frontend (.env.local)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=spendsense-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=spendsense-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=spendsense-prod.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Backend (.env or environment variables)

```env
FIREBASE_PROJECT_ID=spendsense-production
FIREBASE_CREDENTIALS_PATH=/path/to/service-account.json
# OR
FIREBASE_CREDENTIALS={"type":"service_account",...}
```

---

## Troubleshooting

### Frontend Issues

**Error: "Firebase configuration missing"**

- Check all `NEXT_PUBLIC_FIREBASE_*` variables are set
- Restart dev server after adding variables

**Error: "Firebase app already initialized"**

- This is normal, the code handles it
- Uses singleton pattern to prevent re-initialization

**TypeScript errors**

- Run: `bun install` to install types
- Check `firebase` is in dependencies

### Backend Issues

**Error: "No module named 'firebase_admin'"**

- Run: `pip install firebase-admin`
- Check Python version is 3.9+

**Error: "Failed to initialize Firebase"**

- Check `FIREBASE_CREDENTIALS_PATH` points to valid JSON
- Verify service account JSON is valid
- Check `FIREBASE_PROJECT_ID` matches your project

**Permission errors**

- Verify service account has Firestore permissions
- Check IAM roles in Firebase Console

---

## Next Steps

1. ✅ Install Firebase SDKs (this step)
2. ⏭️ Set environment variables
3. ⏭️ Test connections
4. ⏭️ Update API endpoints to use Firestore
5. ⏭️ Deploy to production

---

## Security Checklist

- [ ] Never commit service account JSON to Git
- [ ] Add `*.json` to `.gitignore` (for service account files)
- [ ] Use environment variables for all credentials
- [ ] Rotate keys if accidentally exposed
- [ ] Set up Firestore security rules (Phase 6)
- [ ] Enable audit logging in Firebase Console
- [ ] Monitor usage and set budget alerts

---

## Package Versions

**Frontend:**

- `firebase`: ^10.x.x (includes Firestore, Auth, etc.)

**Backend:**

- `firebase-admin`: >=6.2.0 (server-side SDK)

Both SDKs are actively maintained and production-ready.
