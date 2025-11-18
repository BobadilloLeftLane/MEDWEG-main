# MEDWEG AWS Deployment Guide

This guide will help you deploy the MEDWEG application to AWS using ECS (Elastic Container Service) with Fargate.

## Overview

The deployment uses the following AWS services:
- **ECS Fargate**: Serverless container orchestration
- **RDS PostgreSQL**: Managed database
- **Application Load Balancer**: Traffic distribution
- **ECR**: Docker image registry
- **Secrets Manager**: Secure credential storage
- **S3**: Invoice storage
- **SES**: Email notifications
- **CloudWatch**: Logging and monitoring

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured (`aws configure`)
3. **Docker** installed locally
4. **Node.js** 20+ installed
5. **Git Bash** or WSL (for Windows users)

## Quick Start (Tonight!)

If you want to get this deployed quickly tonight, follow these steps:

### Step 1: Install AWS CLI (if not installed)

```bash
# Windows (PowerShell as Administrator)
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi

# macOS
brew install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### Step 2: Configure AWS CLI

```bash
aws configure
# Enter your:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region: eu-central-1
# - Default output format: json
```

### Step 3: Set Up AWS Infrastructure

This will create VPC, subnets, security groups, load balancer, and ECS cluster:

```bash
cd C:\Users\38163\MEDWEG-main

# Make scripts executable (Git Bash or WSL)
chmod +x aws/*.sh

# Run infrastructure setup
./aws/setup-infrastructure.sh
```

**Estimated time**: 5-10 minutes

**What it creates**:
- VPC with public and private subnets
- Internet Gateway and route tables
- Security groups for ALB, ECS, and RDS
- Application Load Balancer
- ECS Cluster
- CloudWatch Log Groups
- S3 bucket for invoices
- IAM roles

### Step 4: Create RDS Database

You have two options:

#### Option A: Use Existing RDS (Faster - Recommended for Tonight)

Your existing RDS instance is at: `database-1.cf6eiuamshse.eu-north-1.rds.amazonaws.com`

Skip to Step 5 and use this endpoint when setting up secrets.

#### Option B: Create New RDS (15-20 minutes)

```bash
# Create RDS PostgreSQL database
aws rds create-db-instance \
    --db-instance-identifier medweg-db \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --engine-version 14.7 \
    --master-username postgres \
    --master-user-password YOUR_SECURE_PASSWORD \
    --allocated-storage 20 \
    --vpc-security-group-ids sg-XXXXX \  # From infrastructure-config.json
    --db-subnet-group-name medweg-db-subnet \
    --publicly-accessible false \
    --backup-retention-period 7 \
    --region eu-central-1

# Wait for database to be available (15-20 min)
aws rds wait db-instance-available --db-instance-identifier medweg-db
```

### Step 5: Set Up Secrets

Run the secrets setup script which will:
- Generate secure encryption keys
- Prompt you for database credentials
- Generate VAPID keys for push notifications
- Store everything in AWS Secrets Manager

```bash
./aws/setup-secrets.sh
```

You'll be prompted for:
- Database host (RDS endpoint)
- Database credentials
- AWS credentials (for S3/SES access)
- Email configuration (Gmail)

**Note**: For Gmail, you need to create an App Password:
1. Go to https://myaccount.google.com/apppasswords
2. Create new app password for "MEDWEG"
3. Use that 16-character password

### Step 6: Initialize Database Schema

```bash
# Connect to your RDS database and run the schema
# Option 1: Using psql
psql -h YOUR_RDS_ENDPOINT -U postgres -d MEDWEG < backend/src/config/schema.sql

# Option 2: From within a bastion host or ECS task
# (If RDS is in private subnet)
```

If you need to search for the schema file:

```bash
# Find database schema
find . -name "*.sql" -o -name "schema*"
```

### Step 7: Update Task Definition with Your Account ID

```bash
# Get your AWS Account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo $AWS_ACCOUNT_ID

# Update task definition (this is done automatically in deploy.sh)
# Or manually replace YOUR_ACCOUNT_ID in aws/ecs-task-definition.json
```

### Step 8: Deploy the Application

```bash
# Set environment variables
export AWS_REGION=eu-central-1
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Run deployment script
./aws/deploy.sh
```

**What it does**:
1. Creates ECR repositories
2. Builds Docker images for backend and frontend
3. Pushes images to ECR
4. Registers ECS task definition
5. Creates/updates ECS service
6. Waits for deployment to stabilize

**Estimated time**: 10-15 minutes

### Step 9: Create ECS Service (First Time Only)

```bash
# Load infrastructure config
source <(cat aws/infrastructure-config.json | jq -r 'to_entries | .[] | "export \(.key)=\(.value)"')

# Create ECS service
aws ecs create-service \
    --cluster medweg-cluster \
    --service-name medweg-service \
    --task-definition medweg-task \
    --desired-count 1 \
    --launch-type FARGATE \
    --platform-version LATEST \
    --network-configuration "awsvpcConfiguration={subnets=[$public_subnet_1,$public_subnet_2],securityGroups=[$ecs_security_group],assignPublicIp=ENABLED}" \
    --load-balancers "targetGroupArn=$frontend_target_group,containerName=medweg-frontend,containerPort=80" "targetGroupArn=$backend_target_group,containerName=medweg-backend,containerPort=5000" \
    --health-check-grace-period-seconds 60 \
    --region eu-central-1
```

### Step 10: Access Your Application

```bash
# Get the ALB DNS name
ALB_DNS=$(aws elbv2 describe-load-balancers \
    --query "LoadBalancers[?contains(LoadBalancerName, 'medweg')].DNSName" \
    --output text \
    --region eu-central-1)

echo "Your application is available at: http://$ALB_DNS"
```

## Important Configuration Updates

After deployment, update these URLs in your secrets/environment:

1. **Update .env.production**:
   ```bash
   # Replace YOUR_ALB_DNS with actual ALB DNS
   FRONTEND_URL=http://your-alb-dns-here.eu-central-1.elb.amazonaws.com
   BACKEND_URL=http://your-alb-dns-here.eu-central-1.elb.amazonaws.com
   ```

2. **Rebuild and redeploy** after URL updates:
   ```bash
   ./aws/deploy.sh
   ```

## Monitoring and Logs

### View Logs

```bash
# Backend logs
aws logs tail /ecs/medweg-backend --follow --region eu-central-1

# Frontend logs
aws logs tail /ecs/medweg-frontend --follow --region eu-central-1
```

### Check Service Status

```bash
aws ecs describe-services \
    --cluster medweg-cluster \
    --services medweg-service \
    --region eu-central-1
```

### Check Task Status

```bash
aws ecs list-tasks \
    --cluster medweg-cluster \
    --service-name medweg-service \
    --region eu-central-1

# Get task details
aws ecs describe-tasks \
    --cluster medweg-cluster \
    --tasks TASK_ARN \
    --region eu-central-1
```

## Troubleshooting

### Container Won't Start

1. Check CloudWatch logs
2. Verify secrets are correctly set in Secrets Manager
3. Check security group rules
4. Verify RDS is accessible from ECS tasks

### Health Checks Failing

1. Ensure `/health` endpoint is responding
2. Check security group allows traffic from ALB
3. Increase health check grace period
4. Review container logs

### Database Connection Issues

1. Verify RDS security group allows traffic from ECS security group
2. Check database credentials in Secrets Manager
3. Ensure database is in the same VPC
4. Verify subnet routing

### Can't Access Application

1. Check ALB security group allows inbound traffic on ports 80/443
2. Verify target groups have healthy targets
3. Check listener rules are correctly configured
4. Ensure DNS is resolving correctly

## Cost Optimization

Current setup costs (approximate monthly):

- **ECS Fargate**: $30-50 (1 task, 1vCPU, 2GB RAM)
- **RDS t3.micro**: $15-20
- **ALB**: $20-25
- **Data Transfer**: Variable
- **S3/CloudWatch**: $5-10

**Total**: ~$70-105/month

### To Reduce Costs:

1. Use t4g.micro for RDS (ARM-based, cheaper)
2. Stop ECS service when not in use
3. Use S3 lifecycle policies for old invoices
4. Reduce CloudWatch log retention

## Scaling

### Horizontal Scaling

```bash
# Increase number of tasks
aws ecs update-service \
    --cluster medweg-cluster \
    --service medweg-service \
    --desired-count 2 \
    --region eu-central-1
```

### Vertical Scaling

Update task definition CPU/memory:
- Edit `aws/ecs-task-definition.json`
- Update `cpu` and `memory` values
- Run `./aws/deploy.sh`

## SSL/HTTPS Setup

### Option 1: AWS Certificate Manager (Free)

```bash
# Request certificate
aws acm request-certificate \
    --domain-name medweg.de \
    --validation-method DNS \
    --region eu-central-1

# Add HTTPS listener to ALB
aws elbv2 create-listener \
    --load-balancer-arn $ALB_ARN \
    --protocol HTTPS \
    --port 443 \
    --certificates CertificateArn=YOUR_CERT_ARN \
    --default-actions Type=forward,TargetGroupArn=$FRONTEND_TG
```

### Option 2: CloudFlare (Free SSL + CDN)

1. Add domain to CloudFlare
2. Update DNS to CloudFlare nameservers
3. Enable SSL (Full mode)
4. Point A record to ALB DNS

## Backup and Recovery

### Database Backups

```bash
# Manual snapshot
aws rds create-db-snapshot \
    --db-instance-identifier medweg-db \
    --db-snapshot-identifier medweg-backup-$(date +%Y%m%d) \
    --region eu-central-1

# Automated backups are enabled (7 day retention)
```

### S3 Backups

```bash
# Enable versioning
aws s3api put-bucket-versioning \
    --bucket medweg-invoices \
    --versioning-configuration Status=Enabled
```

## Rollback

### Rollback to Previous Task Definition

```bash
# List task definitions
aws ecs list-task-definitions \
    --family-prefix medweg-task \
    --region eu-central-1

# Update service to use previous version
aws ecs update-service \
    --cluster medweg-cluster \
    --service medweg-service \
    --task-definition medweg-task:REVISION_NUMBER \
    --region eu-central-1
```

## CI/CD with GitHub Actions

See `.github/workflows/deploy.yml` for automated deployment on push to main branch.

## Clean Up (When Needed)

To remove all resources and stop billing:

```bash
# Delete ECS service
aws ecs delete-service --cluster medweg-cluster --service medweg-service --force

# Delete ECS cluster
aws ecs delete-cluster --cluster medweg-cluster

# Delete RDS instance
aws rds delete-db-instance --db-instance-identifier medweg-db --skip-final-snapshot

# Delete ALB
aws elbv2 delete-load-balancer --load-balancer-arn $ALB_ARN

# Delete target groups
aws elbv2 delete-target-group --target-group-arn $FRONTEND_TG
aws elbv2 delete-target-group --target-group-arn $BACKEND_TG

# And so on... (or use CloudFormation/Terraform for easier cleanup)
```

## Support

For issues or questions:
1. Check CloudWatch logs
2. Review this documentation
3. Check AWS service health dashboard
4. Consult AWS documentation

## Security Best Practices

1. ✅ Use Secrets Manager for all credentials
2. ✅ Enable SSL/TLS in production
3. ✅ Use security groups to restrict access
4. ✅ Enable CloudWatch logging
5. ✅ Regular security updates
6. ✅ Database encryption at rest
7. ✅ Use IAM roles (no hardcoded credentials)
8. ✅ Enable AWS WAF for ALB (optional)

---

**Last Updated**: 2025-11-17
**Version**: 1.0
