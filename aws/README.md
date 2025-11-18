# AWS Deployment Files

This directory contains all the necessary files and scripts to deploy MEDWEG to AWS.

## Files Overview

### Configuration Files

- **`ecs-task-definition.json`** - ECS Fargate task definition
  - Defines backend and frontend containers
  - Specifies resource allocation (CPU, memory)
  - References secrets from AWS Secrets Manager
  - Configures health checks and logging

- **`infrastructure-config.json`** - Generated after infrastructure setup
  - Contains VPC IDs, subnet IDs, security groups
  - Used by deployment scripts
  - Created by `setup-infrastructure.sh`

### Deployment Scripts

#### **`setup-infrastructure.sh`** (Bash)
Creates all AWS infrastructure needed:
- VPC with public/private subnets
- Internet Gateway and route tables
- Security groups (ALB, ECS, RDS)
- Application Load Balancer with target groups
- ECS cluster
- IAM roles
- CloudWatch log groups
- S3 bucket for invoices

**Usage:**
```bash
chmod +x setup-infrastructure.sh
./setup-infrastructure.sh
```

**Time:** ~10 minutes

#### **`setup-secrets.sh`** (Bash)
Sets up AWS Secrets Manager:
- Generates secure encryption keys
- Generates VAPID keys for push notifications
- Prompts for database, AWS, and email credentials
- Creates/updates all secrets in Secrets Manager
- Generates `.env.production` files

**Usage:**
```bash
chmod +x setup-secrets.sh
./setup-secrets.sh
```

**Time:** ~5 minutes

#### **`deploy.sh`** (Bash)
Deploys the application:
- Creates ECR repositories
- Builds Docker images
- Pushes images to ECR
- Registers ECS task definition
- Updates ECS service
- Waits for deployment completion

**Usage:**
```bash
chmod +x deploy.sh
./deploy.sh
```

**Time:** ~10-15 minutes

#### **`deploy.ps1`** (PowerShell)
Windows PowerShell version of `deploy.sh`

**Usage:**
```powershell
.\deploy.ps1
```

## Quick Start

### First Time Deployment

1. **Prerequisites**
   ```bash
   aws --version    # Check AWS CLI
   docker --version # Check Docker
   node --version   # Check Node.js 20+
   ```

2. **Configure AWS**
   ```bash
   aws configure
   # Enter: Access Key, Secret Key, Region (eu-central-1)
   ```

3. **Run All-in-One Script**
   ```bash
   cd ..
   ./quick-deploy.sh
   ```

   Or manually:
   ```bash
   ./setup-infrastructure.sh
   ./setup-secrets.sh
   ./deploy.sh
   ```

### Subsequent Deployments

Just run the deploy script:

```bash
./deploy.sh
# or
.\deploy.ps1  # Windows
```

## Environment Variables

The deployment requires these secrets in AWS Secrets Manager:

### Database
- `medweg/db-host` - RDS endpoint
- `medweg/db-name` - Database name (MEDWEG)
- `medweg/db-user` - Database username
- `medweg/db-password` - Database password
- `medweg/db-encryption-key` - 128-char hex for encrypting patient data

### Authentication
- `medweg/jwt-secret` - JWT signing secret
- `medweg/jwt-refresh-secret` - JWT refresh token secret

### AWS Services
- `medweg/aws-access-key-id` - For S3/SES access
- `medweg/aws-secret-key` - AWS secret access key

### Push Notifications
- `medweg/vapid-public-key` - Web Push public key
- `medweg/vapid-private-key` - Web Push private key

### Email
- `medweg/email-user` - Gmail address
- `medweg/email-password` - Gmail app password

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Internet                              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Application Load    │
          │     Balancer         │
          │  (Port 80/443)       │
          └──────────┬───────────┘
                     │
        ┌────────────┼────────────┐
        ▼                         ▼
┌───────────────┐         ┌───────────────┐
│   Frontend    │         │    Backend    │
│  Container    │         │   Container   │
│  (Nginx:80)   │         │  (Node:5000)  │
│               │         │               │
│  ECS Fargate  │         │  ECS Fargate  │
└───────────────┘         └───────┬───────┘
                                  │
                                  ▼
                          ┌───────────────┐
                          │   RDS Postgres │
                          │   (Port 5432)  │
                          └───────────────┘

Additional Services:
- S3 (Invoice Storage)
- SES (Email Sending)
- Secrets Manager (Credentials)
- CloudWatch (Logs & Monitoring)
```

## Resource Allocation

### ECS Task
- **Total**: 1 vCPU, 2 GB RAM
- **Backend**: 512 CPU units, 1024 MB
- **Frontend**: 512 CPU units, 1024 MB

### Database
- **Instance**: db.t3.micro (or existing)
- **Storage**: 20 GB
- **Backups**: 7 day retention

## Cost Estimate

Monthly costs (approximate):

| Service | Cost |
|---------|------|
| ECS Fargate (1 task) | $30-50 |
| RDS t3.micro | $15-20 |
| Application Load Balancer | $20-25 |
| Data Transfer | $5-10 |
| S3 + CloudWatch | $5-10 |
| **Total** | **$75-115** |

## Monitoring

### View Logs

```bash
# Backend logs
aws logs tail /ecs/medweg-backend --follow --region eu-central-1

# Frontend logs
aws logs tail /ecs/medweg-frontend --follow --region eu-central-1
```

### Service Status

```bash
aws ecs describe-services \
    --cluster medweg-cluster \
    --services medweg-service \
    --region eu-central-1
```

### Task Status

```bash
aws ecs list-tasks \
    --cluster medweg-cluster \
    --service-name medweg-service \
    --region eu-central-1
```

## Troubleshooting

### Tasks Keep Stopping

1. **Check logs**
   ```bash
   aws logs tail /ecs/medweg-backend --region eu-central-1
   ```

2. **Common issues:**
   - Wrong database credentials
   - Missing secrets in Secrets Manager
   - Security group blocking database access
   - Insufficient memory/CPU

### Can't Access Application

1. **Check ALB status**
   ```bash
   aws elbv2 describe-load-balancers --region eu-central-1
   ```

2. **Check target health**
   ```bash
   aws elbv2 describe-target-health \
       --target-group-arn YOUR_TG_ARN
   ```

3. **Verify security groups**
   - ALB SG allows inbound 80/443 from internet
   - ECS SG allows inbound from ALB SG

### Database Connection Failed

1. **Check RDS security group**
   - Must allow port 5432 from ECS security group

2. **Verify secrets**
   ```bash
   aws secretsmanager get-secret-value \
       --secret-id medweg/db-password \
       --region eu-central-1
   ```

3. **Test connection**
   ```bash
   # From ECS task or bastion host
   psql -h YOUR_RDS_ENDPOINT -U postgres -d MEDWEG
   ```

## Security Best Practices

✅ **Implemented:**
- Secrets stored in AWS Secrets Manager
- Security groups restrict traffic
- Database in private subnet
- IAM roles (no hardcoded credentials)
- Encrypted environment variables
- CloudWatch logging enabled

🔄 **Recommended:**
- Enable SSL/TLS with ACM certificate
- Enable AWS WAF on ALB
- Set up CloudWatch alarms
- Enable RDS encryption at rest
- Configure automated backups
- Implement log retention policies

## Scaling

### Horizontal Scaling

Increase number of tasks:

```bash
aws ecs update-service \
    --cluster medweg-cluster \
    --service medweg-service \
    --desired-count 2 \
    --region eu-central-1
```

### Vertical Scaling

Update task definition CPU/memory in `ecs-task-definition.json` and redeploy.

## Rollback

```bash
# List task definition versions
aws ecs list-task-definitions \
    --family-prefix medweg-task \
    --region eu-central-1

# Rollback to specific version
aws ecs update-service \
    --cluster medweg-cluster \
    --service medweg-service \
    --task-definition medweg-task:VERSION \
    --region eu-central-1
```

## Clean Up

To delete all resources (stops billing):

```bash
# Delete ECS service and cluster
aws ecs delete-service --cluster medweg-cluster --service medweg-service --force
aws ecs delete-cluster --cluster medweg-cluster

# Delete RDS (if created new one)
aws rds delete-db-instance --db-instance-identifier medweg-db --skip-final-snapshot

# Delete other resources (ALB, target groups, VPC, etc.)
# See AWS_DEPLOYMENT_GUIDE.md for complete cleanup
```

## Support

- **Full Documentation**: See `../AWS_DEPLOYMENT_GUIDE.md`
- **Quick Start**: See `../DEPLOY_TONIGHT.md`
- **Issues**: Check CloudWatch logs first

---

**Last Updated**: 2025-11-17
