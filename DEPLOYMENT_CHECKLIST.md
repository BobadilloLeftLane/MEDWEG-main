# MEDWEG Deployment Checklist - Tonight

Use this checklist to deploy MEDWEG to AWS tonight. Check off each step as you complete it.

## ⏰ Time Estimate: 30-45 minutes

---

## Phase 1: Prerequisites (5 minutes)

- [ ] **AWS CLI installed**
  ```bash
  aws --version
  ```
  ❌ Not installed? Download: https://awscli.amazonaws.com/AWSCLIV2.msi

- [ ] **Docker installed and running**
  ```bash
  docker --version
  ```
  ❌ Not installed? Download: https://www.docker.com/products/docker-desktop

  ⚠️ Make sure Docker Desktop is running!

- [ ] **Node.js 20+ installed**
  ```bash
  node --version
  ```

- [ ] **AWS Credentials configured**
  ```bash
  aws configure
  ```
  Enter:
  - AWS Access Key ID: `_______________________________`
  - AWS Secret Access Key: `_______________________________`
  - Default region: `eu-central-1`
  - Default output format: `json`

- [ ] **Verify AWS access**
  ```bash
  aws sts get-caller-identity
  ```
  Should show your account ID.

---

## Phase 2: Prepare Information (5 minutes)

Gather this information before starting:

### Database Information
- [ ] Database host: `________________________________`
  - Your existing: `database-1.cf6eiuamshse.eu-north-1.rds.amazonaws.com`
- [ ] Database name: `MEDWEG`
- [ ] Database user: `postgres`
- [ ] Database password: `________________________________`

### Email Configuration
- [ ] Gmail address: `________________________________`
- [ ] Gmail app password: `________________________________`
  - Create at: https://myaccount.google.com/apppasswords

### AWS Credentials (for S3/SES)
- [ ] AWS Access Key (can be same as above): `________________`
- [ ] AWS Secret Key: `________________________________`

---

## Phase 3: Quick Deploy (30-35 minutes)

### Option A: One-Command Deploy (Recommended)

- [ ] **Navigate to project**
  ```bash
  cd C:\Users\38163\MEDWEG-main
  ```

- [ ] **Open Git Bash** (right-click in folder → Git Bash Here)

- [ ] **Make script executable**
  ```bash
  chmod +x quick-deploy.sh aws/*.sh
  ```

- [ ] **Run deployment**
  ```bash
  ./quick-deploy.sh
  ```

- [ ] **Follow prompts** and enter the information from Phase 2

- [ ] **Wait for completion** (20-30 minutes)
  - ☕ Get coffee while it deploys

- [ ] **Note the URL** displayed at the end:
  ```
  http://______________________________________
  ```

### Option B: Manual Step-by-Step

If Option A doesn't work, follow these steps:

#### Step 2.1: Infrastructure Setup (10 minutes)
- [ ] ```bash
      ./aws/setup-infrastructure.sh
      ```
- [ ] Wait for completion
- [ ] Verify infrastructure config created: `aws/infrastructure-config.json`

#### Step 2.2: Secrets Setup (5 minutes)
- [ ] ```bash
      ./aws/setup-secrets.sh
      ```
- [ ] Enter database information
- [ ] Enter email configuration
- [ ] Enter AWS credentials
- [ ] Verify secrets created in AWS Secrets Manager

#### Step 2.3: Deploy Application (15 minutes)
- [ ] ```bash
      ./aws/deploy.sh
      ```
- [ ] Wait for images to build and push
- [ ] Note any errors

#### Step 2.4: Create ECS Service (First Time Only)
- [ ] Open `DEPLOY_TONIGHT.md` and follow "Step 9: Create ECS Service"
- [ ] Run the `aws ecs create-service` command with your subnet/SG IDs

---

## Phase 4: Verification (5 minutes)

- [ ] **Get application URL**
  ```bash
  aws elbv2 describe-load-balancers \
      --query "LoadBalancers[?contains(LoadBalancerName, 'medweg')].DNSName" \
      --output text \
      --region eu-central-1
  ```
  URL: `http://______________________________________`

- [ ] **Wait 2-3 minutes** for services to start

- [ ] **Open URL in browser**

- [ ] **Test frontend loads**
  - [ ] Page displays
  - [ ] No console errors

- [ ] **Test backend health**
  ```bash
  curl http://YOUR_ALB_DNS/api/v1/health
  ```
  Should return health status

- [ ] **Check logs** (if needed)
  ```bash
  aws logs tail /ecs/medweg-backend --follow --region eu-central-1
  ```

---

## Phase 5: Post-Deployment (Optional)

- [ ] **Update URLs in .env.production**
  - Replace `YOUR_ALB_DNS` with actual DNS
  - Update both `FRONTEND_URL` and `BACKEND_URL`

- [ ] **Redeploy with updated URLs**
  ```bash
  ./aws/deploy.sh
  ```

- [ ] **Set up SSL certificate** (optional, see AWS_DEPLOYMENT_GUIDE.md)

- [ ] **Configure custom domain** (optional)

- [ ] **Set up CloudWatch alarms** (optional)

---

## Troubleshooting Checklist

### ❌ Deployment Failed

- [ ] Check AWS CLI credentials
  ```bash
  aws sts get-caller-identity
  ```

- [ ] Verify Docker is running
  ```bash
  docker ps
  ```

- [ ] Check CloudWatch logs
  ```bash
  aws logs tail /ecs/medweg-backend --region eu-central-1
  ```

### ❌ Can't Access Application

- [ ] Check ECS service is running
  ```bash
  aws ecs describe-services \
      --cluster medweg-cluster \
      --services medweg-service \
      --region eu-central-1
  ```

- [ ] Check tasks are running
  ```bash
  aws ecs list-tasks \
      --cluster medweg-cluster \
      --region eu-central-1
  ```

- [ ] Check target health
  - Go to AWS Console → EC2 → Target Groups
  - Verify targets are healthy

### ❌ Database Connection Failed

- [ ] Verify RDS security group allows ECS security group on port 5432

- [ ] Check database credentials in Secrets Manager
  ```bash
  aws secretsmanager get-secret-value \
      --secret-id medweg/db-password \
      --region eu-central-1
  ```

- [ ] Test database connection from ECS task

---

## Success Criteria

✅ **Deployment is successful when:**

- [ ] ALB DNS resolves
- [ ] Frontend loads in browser
- [ ] Backend health endpoint responds
- [ ] No errors in CloudWatch logs
- [ ] ECS tasks are running and healthy
- [ ] Can access the application

---

## Rollback Plan (If Needed)

If something goes wrong:

- [ ] **Stop ECS service**
  ```bash
  aws ecs update-service \
      --cluster medweg-cluster \
      --service medweg-service \
      --desired-count 0 \
      --region eu-central-1
  ```

- [ ] **Review logs** to identify issue

- [ ] **Fix issue** and redeploy

- [ ] **Or delete everything** and start fresh (see DEPLOYMENT_GUIDE.md cleanup section)

---

## Quick Reference Commands

```bash
# View logs
aws logs tail /ecs/medweg-backend --follow --region eu-central-1

# Check service status
aws ecs describe-services \
    --cluster medweg-cluster \
    --services medweg-service \
    --region eu-central-1

# List tasks
aws ecs list-tasks \
    --cluster medweg-cluster \
    --region eu-central-1

# Stop service (saves money when not in use)
aws ecs update-service \
    --cluster medweg-cluster \
    --service medweg-service \
    --desired-count 0 \
    --region eu-central-1

# Start service
aws ecs update-service \
    --cluster medweg-cluster \
    --service medweg-service \
    --desired-count 1 \
    --region eu-central-1
```

---

## Completion

- [ ] ✅ Application deployed
- [ ] ✅ URL saved: `_______________________________`
- [ ] ✅ Verified working
- [ ] ✅ Documentation reviewed
- [ ] 🎉 **SUCCESS!**

**Deployment completed at**: `__________` (time)

---

## Notes / Issues Encountered

```
_________________________________________________________________

_________________________________________________________________

_________________________________________________________________

_________________________________________________________________
```

---

**Good luck with your deployment tonight! 🚀**

For detailed help, see:
- `AWS_DEPLOYMENT_GUIDE.md` - Complete guide
- `DEPLOY_TONIGHT.md` - Quick start guide
- `aws/README.md` - AWS files documentation
