# Deploy MEDWEG to AWS Tonight - Quick Guide

This is a streamlined guide to get MEDWEG deployed to AWS **tonight**.

⏱️ **Total estimated time**: 30-45 minutes

## Prerequisites Check (5 minutes)

Run these commands to verify you have everything:

```bash
# Check AWS CLI
aws --version
# If not installed: https://awscli.amazonaws.com/AWSCLIV2.msi

# Check Docker
docker --version
# If not installed: https://www.docker.com/products/docker-desktop

# Check Node.js
node --version
# Should be 20+

# Configure AWS (if not done)
aws configure
# Enter your Access Key, Secret Key, region (eu-central-1)
```

## Fast Track Deployment

### 1. Open Git Bash or PowerShell (as Administrator)

```bash
cd C:\Users\38163\MEDWEG-main
```

### 2. Set Up AWS Infrastructure (10 minutes)

**Option A: Using Git Bash/WSL (Recommended)**

```bash
# Make scripts executable
chmod +x aws/*.sh

# Run infrastructure setup
./aws/setup-infrastructure.sh
```

**Option B: Using PowerShell**

Since the bash scripts might not work directly in PowerShell, I'll create the infrastructure manually:

```powershell
# Get your AWS Account ID
$AWS_ACCOUNT_ID = (aws sts get-caller-identity --query Account --output text)
$AWS_REGION = "eu-central-1"

Write-Host "AWS Account: $AWS_ACCOUNT_ID"
Write-Host "Region: $AWS_REGION"
```

Let me know if you prefer Option A or B, and I'll guide you through the rest.

### 3. Use Your Existing Database (FAST!)

Good news! You already have an RDS database:
- **Host**: `database-1.cf6eiuamshse.eu-north-1.rds.amazonaws.com`
- This saves 15-20 minutes!

### 4. Set Up Secrets (5 minutes)

**Quick Method** - Run this in Git Bash:

```bash
./aws/setup-secrets.sh
```

It will ask you for:
- Database host (use: `database-1.cf6eiuamshse.eu-north-1.rds.amazonaws.com`)
- Database password (your current password)
- Gmail credentials for emails
- AWS credentials

**Manual Method** - If script doesn't work, generate keys and create secrets manually:

```bash
# Generate encryption keys
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copy this as DB_ENCRYPTION_KEY

node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copy this as JWT_SECRET

node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copy this as JWT_REFRESH_SECRET

# Generate VAPID keys
cd backend
npx web-push generate-vapid-keys
# Copy both public and private keys
cd ..
```

Then create secrets in AWS Secrets Manager (AWS Console):
1. Go to AWS Secrets Manager in eu-central-1
2. Create these secrets:
   - `medweg/db-host`: Your RDS endpoint
   - `medweg/db-password`: Your DB password
   - `medweg/db-encryption-key`: Generated key
   - `medweg/jwt-secret`: Generated key
   - `medweg/jwt-refresh-secret`: Generated key
   - `medweg/vapid-public-key`: Generated VAPID public
   - `medweg/vapid-private-key`: Generated VAPID private
   - `medweg/email-user`: Your Gmail
   - `medweg/email-password`: Gmail app password
   - `medweg/aws-access-key-id`: Your AWS key
   - `medweg/aws-secret-key`: Your AWS secret

### 5. Deploy! (15-20 minutes)

**Using PowerShell:**

```powershell
cd C:\Users\38163\MEDWEG-main
.\aws\deploy.ps1
```

**Using Git Bash:**

```bash
cd /c/Users/38163/MEDWEG-main
./aws/deploy.sh
```

This will:
1. ✅ Create Docker images
2. ✅ Push to AWS ECR
3. ✅ Deploy to ECS Fargate
4. ✅ Give you the URL!

### 6. Create ECS Service (First Time - 5 minutes)

After deploy.sh completes, create the service:

```bash
# Load the infrastructure config created by setup-infrastructure.sh
# Or use these commands directly (replace with your values from aws/infrastructure-config.json)

aws ecs create-service \
    --cluster medweg-cluster \
    --service-name medweg-service \
    --task-definition medweg-task \
    --desired-count 1 \
    --launch-type FARGATE \
    --platform-version LATEST \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
    --load-balancers "targetGroupArn=arn:aws:...,containerName=medweg-frontend,containerPort=80" \
    --region eu-central-1
```

### 7. Get Your URL!

```bash
aws elbv2 describe-load-balancers \
    --query "LoadBalancers[?contains(LoadBalancerName, 'medweg')].DNSName" \
    --output text \
    --region eu-central-1
```

Visit the URL and your app should be live! 🎉

## Troubleshooting

### "Script won't run"
- **Windows**: Use PowerShell as Administrator
- **Git Bash**: Make sure you have Git for Windows installed

### "AWS Access Denied"
```bash
# Check your credentials
aws sts get-caller-identity

# If wrong, reconfigure
aws configure
```

### "Docker error"
- Make sure Docker Desktop is running
- Right-click Docker Desktop → Settings → Resources → WSL Integration → Enable

### "Can't connect to database"
1. Check security group allows ECS to connect to RDS
2. Verify database credentials in Secrets Manager
3. Ensure both are in compatible networks

### "ECS task keeps stopping"
```bash
# Check logs
aws logs tail /ecs/medweg-backend --follow --region eu-central-1

# Common issues:
# - Wrong database credentials
# - Missing secrets
# - Security group blocking traffic
```

## If You Get Stuck

**Fastest option tonight**: Let me know where you're stuck and I can provide:
1. Pre-built CloudFormation template (1-click deployment)
2. Step-by-step commands for your specific error
3. Alternative deployment method (Amplify, Elastic Beanstalk)

## Alternative: Super Quick Deployment with AWS Amplify (Frontend Only)

If ECS is taking too long, deploy frontend quickly:

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Configure Amplify
amplify init

# Deploy frontend
cd frontend
amplify publish
```

This gets your frontend live in ~10 minutes while you work on backend.

## Post-Deployment

Once live, you need to:

1. **Update URLs** in .env.production with your ALB DNS
2. **Redeploy** with updated URLs
3. **Set up SSL** (optional but recommended)
4. **Configure custom domain** (if you have one)

## Cost Alert

Your deployment will cost approximately:
- **Per hour**: ~$0.10
- **Per day**: ~$2.40
- **Per month**: ~$70-100

**To save money overnight**: Stop ECS service when not testing

```bash
aws ecs update-service --cluster medweg-cluster --service medweg-service --desired-count 0
```

## Next Steps After Tonight

1. ✅ Application is live
2. 📝 Set up SSL certificate
3. 🔒 Review security settings
4. 📊 Configure monitoring alerts
5. 🔄 Set up automated backups
6. 🚀 Set up CI/CD (already configured in .github/workflows/deploy.yml)

---

**Questions?** Check AWS_DEPLOYMENT_GUIDE.md for detailed explanations.

**Ready to deploy?** Start with step 1! ⚡
