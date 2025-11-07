# AWS App Runner Deployment Guide

## Prerequisites

- AWS Account with billing enabled
- AWS CLI installed and configured
- Docker installed locally
- IAM user with permissions for ECR and App Runner

## Step 1: Configure AWS CLI

```bash
# Configure AWS CLI with your credentials
aws configure

# Enter when prompted:
# AWS Access Key ID: YOUR_ACCESS_KEY
# AWS Secret Access Key: YOUR_SECRET_KEY
# Default region: us-east-1 (or your preferred region)
# Default output format: json
```

## Step 2: Create ECR Repository

```bash
# Set variables
export AWS_REGION=us-east-1
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export ECR_REPO_NAME=spendsense-api

# Create ECR repository
aws ecr create-repository \
    --repository-name $ECR_REPO_NAME \
    --region $AWS_REGION

# Expected output: Repository created with repositoryUri
```

## Step 3: Build and Push Docker Image

```bash
# Navigate to API directory
cd /Users/nanis/dev/Gauntlet/SpendSense/api

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | \
    docker login --username AWS --password-stdin \
    $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build Docker image
docker build -t $ECR_REPO_NAME .

# Tag image for ECR
docker tag $ECR_REPO_NAME:latest \
    $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:latest

# Push to ECR
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:latest
```

## Step 4: Create IAM Role for App Runner

```bash
# Create trust policy for App Runner
cat > app-runner-trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "build.apprunner.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create IAM role
aws iam create-role \
    --role-name AppRunnerECRAccessRole \
    --assume-role-policy-document file://app-runner-trust-policy.json

# Attach ECR policy
aws iam attach-role-policy \
    --role-name AppRunnerECRAccessRole \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess

# Get role ARN (save this)
aws iam get-role --role-name AppRunnerECRAccessRole --query 'Role.Arn' --output text
```

## Step 5: Prepare Environment Variables

Create a file `app-runner-env-vars.json`:

```json
{
  "ENVIRONMENT": "production",
  "DEBUG": "false",
  "USE_FIRESTORE": "true",
  "FIREBASE_PROJECT_ID": "spendsense-production",
  "CORS_ORIGINS": "https://your-app.vercel.app",
  "JWT_SECRET_KEY": "your-generated-secret-key-here",
  "LOG_LEVEL": "INFO"
}
```

**Security Note**: For sensitive data like Firebase credentials, use AWS Secrets Manager (see Step 6).

## Step 6: Store Firebase Credentials in Secrets Manager

```bash
# Create secret for Firebase service account
aws secretsmanager create-secret \
    --name spendsense-firebase-credentials \
    --description "Firebase service account for SpendSense" \
    --secret-string file://path/to/firebase-service-account.json \
    --region $AWS_REGION

# Get secret ARN (save this)
aws secretsmanager describe-secret \
    --secret-id spendsense-firebase-credentials \
    --region $AWS_REGION \
    --query 'ARN' \
    --output text
```

## Step 7: Create App Runner Service

```bash
# Set variables
export IMAGE_URI=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:latest
export ROLE_ARN=arn:aws:iam::$AWS_ACCOUNT_ID:role/AppRunnerECRAccessRole

# Create App Runner service
aws apprunner create-service \
    --service-name spendsense-api \
    --source-configuration '{
        "ImageRepository": {
            "ImageIdentifier": "'$IMAGE_URI'",
            "ImageRepositoryType": "ECR",
            "ImageConfiguration": {
                "Port": "8000",
                "RuntimeEnvironmentVariables": {
                    "ENVIRONMENT": "production",
                    "DEBUG": "false",
                    "USE_FIRESTORE": "true",
                    "FIREBASE_PROJECT_ID": "spendsense-production",
                    "CORS_ORIGINS": "https://your-app.vercel.app",
                    "LOG_LEVEL": "INFO"
                }
            }
        },
        "AuthenticationConfiguration": {
            "AccessRoleArn": "'$ROLE_ARN'"
        },
        "AutoDeploymentsEnabled": false
    }' \
    --instance-configuration '{
        "Cpu": "1 vCPU",
        "Memory": "2 GB"
    }' \
    --health-check-configuration '{
        "Protocol": "HTTP",
        "Path": "/health",
        "Interval": 10,
        "Timeout": 5,
        "HealthyThreshold": 2,
        "UnhealthyThreshold": 3
    }' \
    --region $AWS_REGION

# Expected output: Service created with ServiceUrl
```

## Step 8: Get Service URL

```bash
# Get service URL
aws apprunner describe-service \
    --service-arn $(aws apprunner list-services --query 'ServiceSummaryList[0].ServiceArn' --output text) \
    --region $AWS_REGION \
    --query 'Service.ServiceUrl' \
    --output text

# Example output: https://abc123.us-east-1.awsapprunner.com
```

## Step 9: Update Environment Variables (Post-Deployment)

```bash
# Get service ARN
SERVICE_ARN=$(aws apprunner list-services \
    --query 'ServiceSummaryList[?ServiceName==`spendsense-api`].ServiceArn' \
    --output text)

# Update environment variables
aws apprunner update-service \
    --service-arn $SERVICE_ARN \
    --source-configuration '{
        "ImageRepository": {
            "ImageConfiguration": {
                "RuntimeEnvironmentVariables": {
                    "ENVIRONMENT": "production",
                    "DEBUG": "false",
                    "USE_FIRESTORE": "true",
                    "FIREBASE_PROJECT_ID": "spendsense-production",
                    "CORS_ORIGINS": "https://your-actual-vercel-url.vercel.app",
                    "LOG_LEVEL": "INFO",
                    "JWT_SECRET_KEY": "your-new-secret-key"
                }
            }
        }
    }' \
    --region $AWS_REGION
```

## Step 10: Verify Deployment

```bash
# Get service URL
SERVICE_URL=$(aws apprunner describe-service \
    --service-arn $SERVICE_ARN \
    --region $AWS_REGION \
    --query 'Service.ServiceUrl' \
    --output text)

# Test health endpoint
curl https://$SERVICE_URL/health

# Expected output: {"status":"healthy","database":"healthy","api_version":"1.0.0"}

# Test API docs
open https://$SERVICE_URL/docs
```

## Step 11: Update Vercel Environment Variables

After deployment, update your Vercel frontend with the API URL:

```bash
# In Vercel dashboard, update:
NEXT_PUBLIC_API_URL=https://your-service-url.us-east-1.awsapprunner.com
NEXT_PUBLIC_USE_MOCK_DATA=false

# Then redeploy frontend:
cd /Users/nanis/dev/Gauntlet/SpendSense/ui/operator-dashboard
vercel --prod
```

## Updating the Deployment

When you need to deploy updates:

```bash
# Rebuild and push new image
cd /Users/nanis/dev/Gauntlet/SpendSense/api

docker build -t $ECR_REPO_NAME .
docker tag $ECR_REPO_NAME:latest \
    $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:latest

# Trigger new deployment
aws apprunner start-deployment \
    --service-arn $SERVICE_ARN \
    --region $AWS_REGION
```

## Monitoring

### View Logs

```bash
# List log streams
aws logs describe-log-streams \
    --log-group-name /aws/apprunner/spendsense-api/application \
    --order-by LastEventTime \
    --descending \
    --max-items 5

# View recent logs
aws logs tail /aws/apprunner/spendsense-api/application --follow
```

### Check Service Status

```bash
aws apprunner describe-service \
    --service-arn $SERVICE_ARN \
    --region $AWS_REGION \
    --query 'Service.Status' \
    --output text
```

## Troubleshooting

### Service Failed to Deploy

1. Check logs:

   ```bash
   aws logs tail /aws/apprunner/spendsense-api/application
   ```

2. Verify Docker image works locally:

   ```bash
   docker run -p 8000:8000 -e ENVIRONMENT=production $ECR_REPO_NAME
   curl http://localhost:8000/health
   ```

3. Check IAM permissions for the role

### Health Check Failing

1. Verify health endpoint returns 200 OK
2. Check path is `/health` (not `/health/`)
3. Ensure container listens on port 8000
4. Check environment variables are set correctly

### CORS Errors

1. Verify `CORS_ORIGINS` includes your Vercel URL
2. Check protocol (https:// vs http://)
3. No trailing slashes in origin URLs

## Cost Optimization

**Current Configuration:**

- 1 vCPU, 2 GB RAM
- Estimated: $25-40/month for low traffic

**Optimization Options:**

1. Use 0.25 vCPU, 0.5 GB for development (~$7/month)
2. Enable auto-scaling (min: 1, max: 10)
3. Set up auto-pause for non-production environments

## Security Best Practices

- ✅ Use HTTPS only (App Runner provides this automatically)
- ✅ Store secrets in AWS Secrets Manager
- ✅ Use IAM roles instead of access keys
- ✅ Enable CloudWatch logs
- ✅ Set up CloudWatch alarms for errors
- ✅ Rotate JWT secret keys regularly
- ✅ Use VPC connector for database access (if needed)

## Cleanup (if needed)

```bash
# Delete App Runner service
aws apprunner delete-service --service-arn $SERVICE_ARN --region $AWS_REGION

# Delete ECR repository
aws ecr delete-repository --repository-name $ECR_REPO_NAME --force --region $AWS_REGION

# Delete IAM role
aws iam detach-role-policy --role-name AppRunnerECRAccessRole \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess
aws iam delete-role --role-name AppRunnerECRAccessRole

# Delete secret
aws secretsmanager delete-secret \
    --secret-id spendsense-firebase-credentials \
    --force-delete-without-recovery \
    --region $AWS_REGION
```

## Resources

- [AWS App Runner Documentation](https://docs.aws.amazon.com/apprunner/)
- [ECR User Guide](https://docs.aws.amazon.com/ecr/)
- [App Runner Pricing](https://aws.amazon.com/apprunner/pricing/)
