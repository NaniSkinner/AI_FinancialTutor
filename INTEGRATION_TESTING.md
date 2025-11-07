# Integration Testing Guide

## Overview

This guide covers end-to-end testing of the integrated SpendSense system with frontend, backend, and database connected.

## Prerequisites

Before testing integration:

- ✅ Frontend deployed to Vercel
- ✅ Backend deployed to AWS App Runner
- ✅ Firestore database populated
- ✅ Environment variables configured
- ✅ CORS properly set up

---

## Phase 5.1: Local Integration Testing

### Step 1: Test Backend Locally with Firestore

```bash
cd /Users/nanis/dev/Gauntlet/SpendSense/api

# Set environment variables
export ENVIRONMENT=production
export USE_FIRESTORE=true
export FIREBASE_PROJECT_ID=spendsense-production
export FIREBASE_CREDENTIALS_PATH=/path/to/service-account.json
export CORS_ORIGINS=http://localhost:3000

# Start backend
python main.py
```

**Verify:**

- Server starts on http://localhost:8000
- Health check passes: `curl http://localhost:8000/health`
- API docs accessible: http://localhost:8000/docs

### Step 2: Test Frontend Locally with Production Backend

```bash
cd /Users/nanis/dev/Gauntlet/SpendSense/ui/operator-dashboard

# Create .env.local for testing
cat > .env.local <<EOF
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_OPERATOR_ID=op_001
EOF

# Start frontend
bun run dev
```

**Verify:**

- Frontend loads on http://localhost:3000
- Console shows no errors
- API calls reach backend

---

## Phase 5.2: API Endpoint Testing

### Test Recommendations Endpoint

```bash
# Get all recommendations
curl http://localhost:8000/api/operator/recommendations

# Expected: JSON array of recommendations

# Filter by status
curl http://localhost:8000/api/operator/recommendations?status=pending

# Expected: Only pending recommendations
```

### Test User Signals Endpoint

```bash
# Get user signals
curl http://localhost:8000/api/operator/users/user_001/signals?window_type=30d

# Expected: User signals JSON with credit, savings, income, subscriptions
```

### Test Approve Recommendation

```bash
curl -X POST http://localhost:8000/api/operator/recommendations/rec_001_01/approve \
  -H "Content-Type: application/json" \
  -d '{"notes": "Approved for testing"}'

# Expected: Updated recommendation with status="approved"
```

### Test Health Endpoint

```bash
curl http://localhost:8000/health

# Expected:
# {
#   "status": "healthy",
#   "database": "healthy",
#   "api_version": "1.0.0"
# }
```

---

## Phase 5.3: Frontend Integration Testing

### Dashboard Loading

1. Open http://localhost:3000
2. Login with test credentials
3. Navigate to Dashboard

**Checklist:**

- [ ] Dashboard loads without errors
- [ ] Recommendations display from API (not mock data)
- [ ] User data loads correctly
- [ ] Stats show real numbers from backend
- [ ] No CORS errors in console

### Recommendation Actions

Test each operator action:

#### Approve Recommendation

1. Click on a pending recommendation
2. Click "Approve" button
3. Add notes
4. Confirm

**Expected:**

- Request sent to backend
- Status updates to "approved"
- UI reflects change
- Toast notification shows success

#### Reject Recommendation

1. Click on a pending recommendation
2. Click "Reject" button
3. Enter reason
4. Confirm

**Expected:**

- Status updates to "rejected"
- Rejection reason saved
- UI updates

#### Flag Recommendation

1. Click "Flag for Review"
2. Enter reason
3. Confirm

**Expected:**

- Status updates to "flagged"
- Appears in flagged filter

#### Undo Action

1. Approve or reject a recommendation
2. Click "Undo" within 5 minutes
3. Confirm

**Expected:**

- Status reverts to previous
- UI updates immediately

### User Explorer

1. Navigate to User Explorer tab
2. Search for a user (e.g., "user_001")
3. View user details

**Checklist:**

- [ ] User search works
- [ ] Signals display correctly
- [ ] Persona history loads
- [ ] Recommendations for user show

### Analytics

1. Navigate to Analytics tab
2. View charts and metrics

**Checklist:**

- [ ] Charts render with real data
- [ ] Stats calculate correctly
- [ ] Date range filtering works
- [ ] Export functionality works (if implemented)

---

## Phase 5.4: Production Testing (After Deployment)

### Update Frontend to Use Production API

In Vercel dashboard, update environment variables:

```env
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_API_URL=https://your-api.us-east-1.awsapprunner.com
```

Redeploy:

```bash
cd /Users/nanis/dev/Gauntlet/SpendSense/ui/operator-dashboard
vercel --prod
```

### Test Production Endpoints

Replace `localhost` with your production URLs:

```bash
# Backend health check
curl https://your-api.us-east-1.awsapprunner.com/health

# Frontend health
curl https://your-app.vercel.app

# API docs (verify OpenAPI works)
open https://your-api.us-east-1.awsapprunner.com/docs
```

### Cross-Origin Testing

Test CORS is properly configured:

```bash
# From browser console on frontend URL:
fetch('https://your-api.awsapprunner.com/api/operator/recommendations')
  .then(r => r.json())
  .then(console.log)

# Should return data, not CORS error
```

---

## Phase 5.5: End-to-End Test Scenarios

### Scenario 1: Complete Recommendation Workflow

1. **Generate:** Backend creates recommendation from user signals
2. **Review:** Operator views in dashboard
3. **Approve:** Operator approves with notes
4. **Audit:** Check audit log records action
5. **User Sees:** Recommendation appears in user dashboard (if implemented)

**Validation:**

- [ ] Recommendation created in Firestore
- [ ] Operator can view and interact
- [ ] Status transitions recorded
- [ ] Audit trail complete

### Scenario 2: Bulk Operations

1. Select 5-10 pending recommendations
2. Bulk approve with shared notes
3. Verify all updated

**Validation:**

- [ ] All selected items update
- [ ] Batch operation completes <5 seconds
- [ ] No partial updates (all or nothing)

### Scenario 3: Real-time Updates (if implemented)

1. Open dashboard in two browser windows
2. Approve recommendation in window 1
3. Check if window 2 updates automatically

**Expected:** Updates appear without refresh (if WebSocket/polling enabled)

---

## Phase 5.6: Performance Testing

### Load Testing with curl

```bash
# Test 100 concurrent requests
for i in {1..100}; do
  curl http://localhost:8000/api/operator/recommendations &
done
wait

# Check logs for errors or slow requests
```

### Response Time Testing

```bash
# Measure API response time
time curl -s http://localhost:8000/api/operator/recommendations > /dev/null

# Expected: <500ms for most endpoints
```

### Frontend Performance

Use Chrome DevTools:

1. Open Network tab
2. Reload dashboard
3. Check metrics:
   - [ ] First Contentful Paint < 1.5s
   - [ ] Time to Interactive < 3s
   - [ ] API calls complete < 1s

---

## Phase 5.7: Error Handling Testing

### Test Network Failures

1. Stop backend server
2. Try to load dashboard
3. Verify error handling:
   - [ ] User sees friendly error message
   - [ ] No app crash
   - [ ] Retry mechanism works (if implemented)

### Test Invalid Data

```bash
# Send invalid JSON
curl -X POST http://localhost:8000/api/operator/recommendations/rec_001/approve \
  -H "Content-Type: application/json" \
  -d '{invalid json}'

# Expected: 400 Bad Request with clear error message
```

### Test Authentication (if enabled)

```bash
# Request without auth token
curl http://localhost:8000/api/operator/recommendations

# Expected: 401 Unauthorized
```

---

## Phase 5.8: Data Integrity Testing

### Verify Data Consistency

```python
# Test script
from firebase_config import get_firestore_client

db = get_firestore_client()

# Count recommendations by status
statuses = ['pending', 'approved', 'rejected', 'flagged']
for status in statuses:
    count = len(list(db.collection('recommendations').where('status', '==', status).stream()))
    print(f"{status}: {count}")

# Check for orphaned recommendations (invalid user_id)
# Check for missing required fields
```

### Test Data Updates

1. Approve a recommendation via API
2. Check Firestore console
3. Verify:
   - [ ] `status` field updated
   - [ ] `approved_at` timestamp added
   - [ ] `approved_by` field set
   - [ ] `updated_at` timestamp current

---

## Phase 5.9: Mobile Responsiveness Testing

### Test on Different Devices

1. **Desktop:** 1920x1080, 1366x768
2. **Tablet:** iPad (768x1024)
3. **Mobile:** iPhone (375x667)

**Checklist:**

- [ ] Dashboard layout adapts
- [ ] Tables scroll horizontally on mobile
- [ ] Buttons are touch-friendly (min 44x44px)
- [ ] Text is readable (min 16px)
- [ ] No horizontal scrolling required

### Browser Testing

Test in multiple browsers:

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS/iOS)

---

## Phase 5.10: Accessibility Testing

### Keyboard Navigation

1. Tab through interface
2. Verify all interactive elements reachable
3. Test keyboard shortcuts (if implemented)

**Checklist:**

- [ ] All buttons accessible via Tab
- [ ] Enter/Space activates buttons
- [ ] Escape closes modals
- [ ] No keyboard traps

### Screen Reader Testing

Use VoiceOver (Mac) or NVDA (Windows):

**Checklist:**

- [ ] Page title announced
- [ ] Buttons have labels
- [ ] Form fields have labels
- [ ] Error messages announced

---

## Troubleshooting

### CORS Errors

**Symptom:** Browser console shows CORS policy error

**Solutions:**

1. Verify backend `CORS_ORIGINS` includes frontend URL
2. Check protocol matches (http:// vs https://)
3. No trailing slashes in URLs
4. Restart backend after config changes

```python
# In main.py, verify CORS settings
cors_origins = ["https://your-app.vercel.app"]
```

### API Requests Failing

**Symptom:** Network errors, 404, or 500 responses

**Solutions:**

1. Check API URL in frontend env vars
2. Verify backend is running
3. Check backend logs for errors
4. Test endpoint directly with curl

### Data Not Loading

**Symptom:** Empty lists, no recommendations

**Solutions:**

1. Verify Firestore has data
2. Check Firestore security rules allow reads
3. Verify backend can connect to Firestore
4. Check API endpoint returns data

### Slow Performance

**Symptom:** Long load times, laggy UI

**Solutions:**

1. Check Firestore indexes are deployed
2. Optimize queries (add limits, filters)
3. Enable caching (SWR on frontend)
4. Check network latency to API

---

## Test Checklist

### Backend API

- [ ] Health check returns 200 OK
- [ ] All endpoints return expected data
- [ ] CORS configured correctly
- [ ] Authentication works (if enabled)
- [ ] Error responses are informative
- [ ] Response times < 500ms (p95)

### Frontend

- [ ] Loads without console errors
- [ ] Connects to backend API
- [ ] All CRUD operations work
- [ ] UI updates reflect backend changes
- [ ] Error states display properly
- [ ] Loading states show

### Integration

- [ ] Data flows end-to-end
- [ ] Operator actions persist
- [ ] Audit logs created
- [ ] Real-time updates work (if enabled)
- [ ] No data loss or corruption

### Performance

- [ ] API response times acceptable
- [ ] Frontend loads quickly (<3s TTI)
- [ ] Handles 100+ concurrent users
- [ ] No memory leaks

### Mobile & Accessibility

- [ ] Responsive on all devices
- [ ] Touch-friendly interface
- [ ] Keyboard accessible
- [ ] Screen reader compatible

---

## Success Criteria

✅ All API endpoints functional  
✅ Frontend connects to production API  
✅ CRUD operations work end-to-end  
✅ Data persistence verified  
✅ No console errors or warnings  
✅ Performance meets targets  
✅ Mobile responsive  
✅ Accessible (WCAG AA)

---

## Next Steps

After successful integration testing:

1. ✅ Mark Phase 5 complete
2. ⏭️ Proceed to Phase 6: Security & Monitoring
3. ⏭️ Set up production security rules
4. ⏭️ Configure monitoring and alerts
5. ⏭️ Enable backups and disaster recovery
