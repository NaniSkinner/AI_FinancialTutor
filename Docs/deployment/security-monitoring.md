# Security & Monitoring Setup Guide

## Overview

This guide covers production security configuration, monitoring setup, and operational best practices for SpendSense.

---

## Phase 6.1: Firebase Security Rules

### Deploy Production Security Rules

```bash
cd /Users/nanis/dev/Gauntlet/SpendSense

# Copy production rules
cp firestore.rules.production firestore.rules

# Deploy to Firebase
firebase deploy --only firestore:rules

# Expected output:
# ✔ Deploy complete!
# ✔ firestore: released rules
```

### Verify Security Rules

Test in Firebase Console:

1. Go to Firestore Database > Rules tab
2. Click "Rules playground"
3. Test different scenarios:

**Test 1: Unauthenticated User**

```javascript
// Location: /recommendations/rec_001
// Auth: None
// Operation: get

// Expected: Denied (auth required)
```

**Test 2: Operator Reading Recommendations**

```javascript
// Location: /recommendations/rec_001
// Auth: {uid: "op_001", role: "operator"}
// Operation: get

// Expected: Allowed
```

**Test 3: User Reading Own Data**

```javascript
// Location: /users/user_123
// Auth: {uid: "user_123", role: "user"}
// Operation: get

// Expected: Allowed (own data)
```

---

## Phase 6.2: Firestore Security Best Practices

### 1. Principle of Least Privilege

**Implemented:**

- ✅ Operators can only read/write operational data
- ✅ Users can only access their own data
- ✅ Audit logs are immutable (no updates/deletes)
- ✅ Default deny all for unlisted collections

### 2. Data Validation

Add validation rules to Firestore:

```javascript
// Example: Validate recommendation status
allow update: if request.resource.data.status in ['pending', 'approved', 'rejected', 'flagged'];

// Example: Validate email format
allow create: if request.resource.data.email.matches('.+@.+\\..+');
```

### 3. Rate Limiting

Firebase automatically rate limits, but you can add App Check for additional protection:

```bash
# Enable App Check in Firebase Console
# 1. Go to Build > App Check
# 2. Register your app
# 3. Enable enforcement for Firestore
```

---

## Phase 6.3: API Security (AWS App Runner)

### Environment Variables Security

**DO NOT** store secrets in plain text. Use AWS Secrets Manager:

```bash
# Store Firebase credentials
aws secretsmanager create-secret \
    --name spendsense/firebase-credentials \
    --secret-string file://firebase-service-account.json

# Store JWT secret
aws secretsmanager create-secret \
    --name spendsense/jwt-secret \
    --secret-string "your-generated-secret-key"

# Store OpenAI key
aws secretsmanager create-secret \
    --name spendsense/openai-key \
    --secret-string "sk-..."
```

### Update App Runner to Use Secrets

In App Runner service configuration:

1. IAM role needs `secretsmanager:GetSecretValue` permission
2. Load secrets at runtime in application code

### Enable HTTPS Only

```python
# In FastAPI main.py, redirect HTTP to HTTPS
from fastapi.middleware.trustedhost import TrustedHostMiddleware

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["your-app.awsapprunner.com"]
)
```

### Implement Rate Limiting

```python
# Install: pip install slowapi
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Apply to endpoints
@app.get("/api/operator/recommendations")
@limiter.limit("100/minute")
async def get_recommendations(request: Request):
    ...
```

---

## Phase 6.4: Monitoring Setup

### AWS CloudWatch (Backend)

#### Create CloudWatch Dashboard

```bash
# Create dashboard JSON
cat > cloudwatch-dashboard.json <<'EOF'
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/AppRunner", "RequestCount"],
          [".", "2xxStatusCode"],
          [".", "4xxStatusCode"],
          [".", "5xxStatusCode"]
        ],
        "period": 300,
        "stat": "Sum",
        "region": "us-east-1",
        "title": "API Request Metrics"
      }
    },
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/AppRunner", "RequestLatency"]
        ],
        "period": 300,
        "stat": "Average",
        "region": "us-east-1",
        "title": "Response Time"
      }
    }
  ]
}
EOF

# Create dashboard
aws cloudwatch put-dashboard \
    --dashboard-name SpendSense-API \
    --dashboard-body file://cloudwatch-dashboard.json
```

#### Create CloudWatch Alarms

```bash
# Alarm for high error rate
aws cloudwatch put-metric-alarm \
    --alarm-name spendsense-high-error-rate \
    --alarm-description "Alert when API error rate > 5%" \
    --metric-name 5xxStatusCode \
    --namespace AWS/AppRunner \
    --statistic Sum \
    --period 300 \
    --evaluation-periods 2 \
    --threshold 5 \
    --comparison-operator GreaterThanThreshold \
    --alarm-actions arn:aws:sns:us-east-1:ACCOUNT_ID:spendsense-alerts

# Alarm for slow response times
aws cloudwatch put-metric-alarm \
    --alarm-name spendsense-slow-response \
    --alarm-description "Alert when API latency > 1s" \
    --metric-name RequestLatency \
    --namespace AWS/AppRunner \
    --statistic Average \
    --period 300 \
    --evaluation-periods 2 \
    --threshold 1000 \
    --comparison-operator GreaterThanThreshold \
    --alarm-actions arn:aws:sns:us-east-1:ACCOUNT_ID:spendsense-alerts
```

### Vercel Analytics (Frontend)

Vercel automatically provides:

- Web Vitals (LCP, FID, CLS)
- Page views and visitors
- Real User Monitoring

**Access:**

1. Go to Vercel dashboard
2. Select your project
3. Navigate to Analytics tab

### Firebase Monitoring

Firebase provides monitoring for:

- Firestore operations (reads/writes/deletes)
- Storage usage
- Rule evaluations

**Setup:**

1. Go to Firebase Console > Build > Firestore Database
2. Click "Usage" tab
3. View metrics:
   - Document reads per day
   - Document writes per day
   - Storage usage

#### Set Up Firebase Alerts

```bash
# Create alert for quota usage
# In Firebase Console:
# 1. Settings > Usage and billing
# 2. Set up budget alerts
# 3. Enter email for notifications
```

---

## Phase 6.5: Logging Strategy

### Structured Logging

Update FastAPI logging to use JSON format:

```python
# In main.py
import json
import logging
from datetime import datetime

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
        }
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)
        return json.dumps(log_data)

# Configure handler
handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logger.addHandler(handler)
```

### Log Retention

**CloudWatch Logs:**

- Default: Never expire
- Recommended: 30 days for cost optimization
- Critical logs: 1 year

```bash
# Set log retention
aws logs put-retention-policy \
    --log-group-name /aws/apprunner/spendsense-api/application \
    --retention-in-days 30
```

### Log Analysis

Use CloudWatch Insights:

```sql
-- Count errors by type
fields @timestamp, @message
| filter @message like /ERROR/
| stats count() by @message
| sort count desc

-- Average response time
fields @timestamp, @message
| filter @message like /Response:/
| parse @message /Time: (?<duration>[0-9.]+)s/
| stats avg(duration) as avg_response_time by bin(5m)
```

---

## Phase 6.6: Backup Strategy

### Firestore Backups

#### Automated Daily Backups

```bash
# Create Cloud Scheduler job for daily backups
gcloud scheduler jobs create http firestore-backup \
    --schedule="0 2 * * *" \
    --uri="https://firestore.googleapis.com/v1/projects/spendsense-production/databases/(default):exportDocuments" \
    --http-method=POST \
    --oauth-service-account-email=firebase-adminsdk@spendsense-production.iam.gserviceaccount.com \
    --message-body='{"outputUriPrefix":"gs://spendsense-backups/daily"}'
```

#### Manual Backup

```bash
# Export all collections
gcloud firestore export gs://spendsense-backups/manual-$(date +%Y%m%d)

# Export specific collections
gcloud firestore export gs://spendsense-backups/recommendations \
    --collection-ids='recommendations,audit_logs'
```

#### Restore from Backup

```bash
# Import from backup
gcloud firestore import gs://spendsense-backups/daily/[EXPORT_PREFIX]

# Import specific collections
gcloud firestore import gs://spendsense-backups/recommendations \
    --collection-ids='recommendations'
```

### Database Backup Verification

```bash
# Test restore process monthly
# 1. Create test project
# 2. Restore backup to test project
# 3. Verify data integrity
# 4. Document process and timing
```

---

## Phase 6.7: Incident Response

### Incident Response Playbook

#### Severity Levels

**P0 - Critical (Immediate Response)**

- Complete service outage
- Data breach or security incident
- Data loss or corruption

**P1 - High (30 min response)**

- Partial service outage
- Significant performance degradation
- Authentication failures

**P2 - Medium (2 hour response)**

- Minor feature broken
- Slow performance
- Elevated error rates

**P3 - Low (Next business day)**

- UI issues
- Non-critical bugs
- Documentation errors

### Incident Response Steps

1. **Detect** - Alert fires or user reports issue
2. **Assess** - Determine severity level
3. **Notify** - Alert team via Slack/PagerDuty
4. **Investigate** - Check logs, metrics, recent deploys
5. **Mitigate** - Rollback, disable feature, or scale resources
6. **Resolve** - Deploy fix and verify
7. **Document** - Write post-mortem
8. **Prevent** - Add monitoring, tests, or safeguards

### Rollback Procedures

**Frontend (Vercel):**

```bash
# List recent deployments
vercel ls

# Promote previous deployment
vercel promote [DEPLOYMENT_URL]
```

**Backend (AWS App Runner):**

```bash
# Deploy previous image
aws apprunner update-service \
    --service-arn [SERVICE_ARN] \
    --source-configuration ImageRepository={ImageIdentifier=[PREVIOUS_IMAGE_URI]}
```

**Database (Firestore):**

```bash
# Restore from backup (see Backup Strategy section)
gcloud firestore import gs://spendsense-backups/[BACKUP_PATH]
```

---

## Phase 6.8: Security Checklist

### Pre-Production Security Audit

- [ ] **Firestore Rules:** Production rules deployed and tested
- [ ] **API Authentication:** JWT validation enabled
- [ ] **HTTPS Only:** No HTTP endpoints accessible
- [ ] **CORS:** Restricted to known domains
- [ ] **Secrets Management:** No secrets in code or environment variables
- [ ] **Rate Limiting:** Implemented on all public endpoints
- [ ] **Input Validation:** All user inputs validated and sanitized
- [ ] **Error Messages:** No sensitive data in error responses
- [ ] **Logging:** No passwords or tokens logged
- [ ] **Dependencies:** All packages up to date, no known vulnerabilities

### Ongoing Security Practices

- [ ] **Monthly:** Review access logs for suspicious activity
- [ ] **Monthly:** Rotate JWT secrets
- [ ] **Monthly:** Update dependencies
- [ ] **Quarterly:** Security audit and penetration testing
- [ ] **Quarterly:** Review and update security rules
- [ ] **Annually:** Third-party security assessment

---

## Phase 6.9: Monitoring Dashboard URLs

After setup, bookmark these URLs:

- **CloudWatch Dashboard:** https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=SpendSense-API
- **Firebase Console:** https://console.firebase.google.com/project/spendsense-production
- **Vercel Analytics:** https://vercel.com/your-team/your-project/analytics
- **AWS App Runner:** https://console.aws.amazon.com/apprunner/home?region=us-east-1#/services

---

## Phase 6.10: Success Criteria

✅ Production security rules deployed  
✅ CloudWatch dashboard created  
✅ Alerts configured for critical metrics  
✅ Daily backups automated  
✅ Incident response playbook documented  
✅ Security audit checklist completed  
✅ Monitoring accessible to team  
✅ Logs retained appropriately

---

## Next Steps

After security and monitoring setup:

1. ✅ Mark Phase 6 complete
2. ⏭️ Proceed to Phase 7: Final Documentation
3. ⏭️ Create operations runbook
4. ⏭️ Document architecture
5. ⏭️ Training materials for operators
