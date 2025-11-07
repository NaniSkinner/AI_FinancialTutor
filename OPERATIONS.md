# SpendSense Operations Runbook

## Overview

This document provides operational procedures for maintaining and troubleshooting the SpendSense production environment.

---

## Table of Contents

1. [System Status & Health](#system-status--health)
2. [Common Operations](#common-operations)
3. [Troubleshooting](#troubleshooting)
4. [Incident Response](#incident-response)
5. [Maintenance Tasks](#maintenance-tasks)
6. [Contact Information](#contact-information)

---

## System Status & Health

### Check Overall System Status

```bash
# Frontend (Vercel)
curl -I https://your-app.vercel.app
# Expected: HTTP/2 200

# Backend (AWS App Runner)
curl https://your-api.awsapprunner.com/health
# Expected: {"status":"healthy","database":"healthy","api_version":"1.0.0"}

# Database (Firebase)
# Check in Firebase Console > Firestore Database > Usage tab
```

### Monitoring Dashboards

- **CloudWatch:** https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=SpendSense-API
- **Vercel:** https://vercel.com/[your-team]/[your-project]/analytics
- **Firebase:** https://console.firebase.google.com/project/spendsense-production

### Key Metrics

**Frontend:**

- Page load time: Target < 3s
- Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1

**Backend:**

- Response time: Target < 500ms (p95)
- Error rate: Target < 1%
- Uptime: Target 99.9%

**Database:**

- Read latency: < 100ms
- Write latency: < 200ms
- Storage usage: Monitor for limits

---

## Common Operations

### Deploy Updates

#### Frontend Update

```bash
cd /Users/nanis/dev/Gauntlet/SpendSense/ui/operator-dashboard

# Pull latest code
git pull origin main

# Install dependencies
bun install

# Test build locally
bun run build

# Deploy to production
vercel --prod
```

#### Backend Update

```bash
cd /Users/nanis/dev/Gauntlet/SpendSense/api

# Pull latest code
git pull origin main

# Build new Docker image
export IMAGE_TAG=$(date +%Y%m%d_%H%M%S)
docker build -t spendsense-api:$IMAGE_TAG .

# Tag and push to ECR
docker tag spendsense-api:$IMAGE_TAG \
    $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/spendsense-api:$IMAGE_TAG
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/spendsense-api:$IMAGE_TAG

# Update App Runner service
aws apprunner start-deployment --service-arn $SERVICE_ARN
```

### Update Environment Variables

#### Vercel

```bash
# Via CLI
vercel env add VARIABLE_NAME

# Or in dashboard:
# Settings > Environment Variables > Add
# Then redeploy: vercel --prod
```

#### AWS App Runner

```bash
aws apprunner update-service \
    --service-arn $SERVICE_ARN \
    --source-configuration '{...with new env vars...}'
```

### Scale Resources

#### AWS App Runner

```bash
# Scale to 2 vCPU, 4 GB RAM
aws apprunner update-service \
    --service-arn $SERVICE_ARN \
    --instance-configuration '{
        "Cpu": "2 vCPU",
        "Memory": "4 GB"
    }'

# Enable autoscaling
aws apprunner update-service \
    --service-arn $SERVICE_ARN \
    --auto-scaling-configuration-arn $AUTO_SCALING_ARN
```

### View Logs

#### Backend Logs

```bash
# Real-time logs
aws logs tail /aws/apprunner/spendsense-api/application --follow

# Last 100 lines
aws logs tail /aws/apprunner/spendsense-api/application --since 1h

# Search logs
aws logs filter-log-events \
    --log-group-name /aws/apprunner/spendsense-api/application \
    --filter-pattern "ERROR"
```

#### Vercel Logs

```bash
# Via CLI
vercel logs [deployment-url]

# Or in dashboard:
# Deployments > Click deployment > View Function Logs
```

---

## Troubleshooting

### Frontend Issues

#### Issue: Site is Down

**Check:**

1. Vercel status page
2. Recent deployments
3. Browser console for errors

**Actions:**

```bash
# Check deployment status
vercel ls

# Rollback if needed
vercel promote [previous-deployment-url]
```

#### Issue: API Calls Failing

**Check:**

1. Network tab in browser
2. CORS errors in console
3. Backend health endpoint

**Actions:**

```bash
# Test API directly
curl https://your-api.awsapprunner.com/health

# Check environment variables
vercel env ls

# Verify NEXT_PUBLIC_API_URL is correct
```

### Backend Issues

#### Issue: High Error Rate

**Check:**

1. CloudWatch logs
2. Recent deployments
3. Error patterns

**Actions:**

```bash
# Check logs for errors
aws logs tail /aws/apprunner/spendsense-api/application \
    --filter-pattern "ERROR" --since 1h

# Rollback if needed
aws apprunner update-service --service-arn $SERVICE_ARN \
    --source-configuration ImageRepository={ImageIdentifier=$PREVIOUS_IMAGE}
```

#### Issue: Slow Response Times

**Check:**

1. CloudWatch RequestLatency metric
2. Database query performance
3. Resource utilization (CPU, memory)

**Actions:**

```bash
# Check App Runner metrics
aws apprunner describe-service --service-arn $SERVICE_ARN

# Scale up if needed
aws apprunner update-service --service-arn $SERVICE_ARN \
    --instance-configuration Cpu="2 vCPU",Memory="4 GB"

# Check Firestore for slow queries
# Firebase Console > Firestore > Usage > Performance
```

#### Issue: Service Unhealthy

**Check:**

1. Health endpoint
2. Container logs
3. Firestore connectivity

**Actions:**

```bash
# Check health
curl https://your-api.awsapprunner.com/health

# Restart service (force new deployment)
aws apprunner start-deployment --service-arn $SERVICE_ARN

# Check Firestore connection from local
cd api && python -c "from firebase_config import test_connection; test_connection()"
```

### Database Issues

#### Issue: Permission Denied Errors

**Check:**

1. Firestore security rules
2. Service account permissions
3. Recent rule changes

**Actions:**

```bash
# Check current rules
firebase firestore:rules --project spendsense-production

# Deploy development rules temporarily (CAREFUL!)
# Edit firestore.rules to be more permissive, then:
firebase deploy --only firestore:rules

# Monitor for 5-10 minutes, then deploy production rules
```

#### Issue: Quota Exceeded

**Check:**

- Firebase Console > Firestore > Usage tab
- Check against daily limits

**Actions:**

1. Upgrade to Blaze plan if on Spark
2. Optimize queries to reduce reads
3. Implement caching on frontend (SWR)
4. Review and remove inefficient queries

#### Issue: Data Inconsistency

**Check:**

1. Recent data migrations
2. Batch operations logs
3. Audit logs for unusual activity

**Actions:**

```bash
# Restore from backup
gcloud firestore import gs://spendsense-backups/[latest-backup]

# Or fix specific documents
cd api
python -c "
from firebase_config import update_document
update_document('recommendations', 'rec_001', {'status': 'pending'})
"
```

---

## Incident Response

### Incident Severity Levels

**P0 - Critical (Page immediately)**

- Complete outage
- Data breach
- Data corruption

**P1 - High (Alert within 30 min)**

- Partial outage
- Major feature broken
- Authentication failures

**P2 - Medium (Alert within 2 hours)**

- Minor feature broken
- Performance degradation
- Elevated errors

**P3 - Low (Next business day)**

- UI bugs
- Non-critical issues

### Incident Response Process

1. **Acknowledge**

   - Respond to alert within SLA
   - Create incident ticket

2. **Assess**

   - Determine severity
   - Check affected systems
   - Review recent changes

3. **Communicate**

   - Notify stakeholders
   - Update status page
   - Log actions taken

4. **Mitigate**

   - Rollback recent changes
   - Scale resources
   - Enable fallback mode

5. **Resolve**

   - Deploy fix
   - Verify resolution
   - Monitor for recurrence

6. **Document**
   - Write post-mortem
   - Document root cause
   - Create prevention tasks

### Emergency Contacts

**On-Call Rotation:**

- Primary: [Name] - [Phone] - [Email]
- Secondary: [Name] - [Phone] - [Email]
- Escalation: [Name] - [Phone] - [Email]

**External Vendors:**

- Vercel Support: https://vercel.com/support
- AWS Support: [Support plan link]
- Firebase Support: https://firebase.google.com/support

---

## Maintenance Tasks

### Daily

- [ ] Check monitoring dashboards for anomalies
- [ ] Review error logs
- [ ] Verify backups completed

### Weekly

- [ ] Review performance metrics
- [ ] Check resource utilization
- [ ] Update dependencies (if needed)
- [ ] Review security alerts

### Monthly

- [ ] Security audit
- [ ] Rotate JWT secrets
- [ ] Review and optimize costs
- [ ] Test backup restoration
- [ ] Update documentation

### Quarterly

- [ ] Load testing
- [ ] Penetration testing
- [ ] Review and update security rules
- [ ] Disaster recovery drill
- [ ] Team training/knowledge sharing

---

## Maintenance Windows

**Preferred:** Tuesdays, 2-4 AM EST (lowest traffic)

**Process:**

1. Schedule maintenance 1 week in advance
2. Notify users via email/banner
3. Create backup before changes
4. Have rollback plan ready
5. Monitor for 1 hour after completion

---

## Backup & Recovery

### Automated Backups

**Firestore:**

- Daily backups at 2 AM UTC
- Retention: 30 days
- Location: `gs://spendsense-backups/daily/`

**Verification:**

```bash
# List recent backups
gsutil ls gs://spendsense-backups/daily/

# Test restore (to test project)
gcloud firestore import gs://spendsense-backups/daily/[latest] \
    --project spendsense-test
```

### Manual Backup

```bash
# Before major changes
gcloud firestore export gs://spendsense-backups/manual-$(date +%Y%m%d_%H%M%S) \
    --project spendsense-production

# Verify export
gsutil ls gs://spendsense-backups/manual-*
```

### Recovery Procedures

**Complete Restore:**

```bash
# 1. Stop backend service (prevent writes)
aws apprunner pause-service --service-arn $SERVICE_ARN

# 2. Restore from backup
gcloud firestore import gs://spendsense-backups/[backup-path]

# 3. Verify data
# Check key collections in Firebase Console

# 4. Resume backend service
aws apprunner resume-service --service-arn $SERVICE_ARN
```

---

## Performance Optimization

### Frontend

**Caching:**

- Enable SWR revalidation intervals
- Use Vercel Edge caching where possible

**Bundle Size:**

```bash
# Analyze bundle
cd ui/operator-dashboard
npm run build
npx @next/bundle-analyzer
```

### Backend

**Query Optimization:**

- Use Firestore indexes for complex queries
- Implement pagination (limit results)
- Cache frequent reads

**Resource Scaling:**

```bash
# Monitor resource usage
aws apprunner describe-service --service-arn $SERVICE_ARN \
    | jq '.Service.ServiceObservability.Metrics'

# Scale if CPU > 70% or Memory > 80%
```

---

## Security Tasks

### Regular Security Checks

**Weekly:**

- [ ] Review failed authentication attempts
- [ ] Check for unusual API access patterns
- [ ] Monitor Firestore security rule violations

**Monthly:**

- [ ] Rotate JWT secret keys
- [ ] Update dependencies
- [ ] Run vulnerability scans

**Quarterly:**

- [ ] Full security audit
- [ ] Penetration testing
- [ ] Review IAM permissions

### Security Incident Response

1. **Isolate:** Revoke compromised credentials immediately
2. **Investigate:** Check logs for breach extent
3. **Notify:** Contact affected users if data exposed
4. **Remediate:** Fix vulnerability, rotate all secrets
5. **Document:** Post-incident report and prevention plan

---

## Quick Reference Commands

```bash
# System Health
curl https://your-api.awsapprunner.com/health

# View Logs
aws logs tail /aws/apprunner/spendsense-api/application --follow

# Deploy Frontend
cd ui/operator-dashboard && vercel --prod

# Deploy Backend
aws apprunner start-deployment --service-arn $SERVICE_ARN

# Backup Database
gcloud firestore export gs://spendsense-backups/manual-$(date +%Y%m%d)

# Restore Database
gcloud firestore import gs://spendsense-backups/[backup-path]

# Scale Backend
aws apprunner update-service --service-arn $SERVICE_ARN \
    --instance-configuration Cpu="2 vCPU",Memory="4 GB"

# Rollback Frontend
vercel promote [previous-deployment-url]
```

---

## Changelog

| Date       | Change                  | Author          |
| ---------- | ----------------------- | --------------- |
| 2025-11-07 | Initial runbook created | Deployment Team |
|            |                         |                 |

---

**Last Updated:** November 7, 2025  
**Version:** 1.0.0  
**Next Review:** December 7, 2025
