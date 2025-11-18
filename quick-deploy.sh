#!/bin/bash

# MEDWEG One-Command Deployment Script
# Usage: ./quick-deploy.sh

set -e

clear
echo "╔════════════════════════════════════════╗"
echo "║   MEDWEG Quick Deployment to AWS       ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command -v aws &> /dev/null; then
    echo -e "${RED}✗ AWS CLI not found${NC}"
    echo "Install from: https://awscli.amazonaws.com/AWSCLIV2.msi"
    exit 1
fi
echo -e "${GREEN}✓ AWS CLI installed${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker not found${NC}"
    echo "Install Docker Desktop from: https://www.docker.com/products/docker-desktop"
    exit 1
fi
echo -e "${GREEN}✓ Docker installed${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found${NC}"
    echo "Install Node.js 20+ from: https://nodejs.org"
    exit 1
fi
echo -e "${GREEN}✓ Node.js installed${NC}"

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}✗ AWS credentials not configured${NC}"
    echo "Run: aws configure"
    exit 1
fi
echo -e "${GREEN}✓ AWS credentials configured${NC}"

AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=${AWS_REGION:-"eu-central-1"}

echo ""
echo -e "${GREEN}Account ID:${NC} $AWS_ACCOUNT_ID"
echo -e "${GREEN}Region:${NC} $AWS_REGION"
echo ""

# Ask for deployment confirmation
read -p "Do you want to proceed with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

# Check if this is first deployment
FIRST_DEPLOYMENT=false
if ! aws ecs describe-clusters --clusters medweg-cluster --region $AWS_REGION &> /dev/null; then
    FIRST_DEPLOYMENT=true
fi

if [ "$FIRST_DEPLOYMENT" = true ]; then
    echo ""
    echo -e "${YELLOW}═══════════════════════════════════════${NC}"
    echo -e "${YELLOW}  FIRST TIME DEPLOYMENT${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════${NC}"
    echo ""
    echo "This appears to be your first deployment."
    echo "I will set up the complete infrastructure."
    echo ""
    read -p "Continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled."
        exit 0
    fi

    echo ""
    echo -e "${BLUE}Setting up AWS infrastructure...${NC}"
    ./aws/setup-infrastructure.sh

    echo ""
    echo -e "${BLUE}Setting up secrets...${NC}"
    ./aws/setup-secrets.sh

    echo ""
    echo -e "${GREEN}Infrastructure setup complete!${NC}"
fi

# Deploy application
echo ""
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}  DEPLOYING APPLICATION${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo ""

./aws/deploy.sh

if [ "$FIRST_DEPLOYMENT" = true ]; then
    echo ""
    echo -e "${YELLOW}═══════════════════════════════════════${NC}"
    echo -e "${YELLOW}  CREATING ECS SERVICE${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════${NC}"
    echo ""

    # Load infrastructure config
    if [ -f aws/infrastructure-config.json ]; then
        export $(cat aws/infrastructure-config.json | jq -r 'to_entries | .[] | "\(.key)=\(.value)"')
    fi

    echo "Creating ECS service..."

    aws ecs create-service \
        --cluster medweg-cluster \
        --service-name medweg-service \
        --task-definition medweg-task \
        --desired-count 1 \
        --launch-type FARGATE \
        --platform-version LATEST \
        --network-configuration "awsvpcConfiguration={subnets=[$public_subnet_1,$public_subnet_2],securityGroups=[$ecs_security_group],assignPublicIp=ENABLED}" \
        --load-balancers "[{\"targetGroupArn\":\"$frontend_target_group\",\"containerName\":\"medweg-frontend\",\"containerPort\":80},{\"targetGroupArn\":\"$backend_target_group\",\"containerName\":\"medweg-backend\",\"containerPort\":5000}]" \
        --health-check-grace-period-seconds 60 \
        --region $AWS_REGION

    echo -e "${GREEN}ECS service created!${NC}"
fi

# Get application URL
echo ""
echo -e "${BLUE}Retrieving application URL...${NC}"
ALB_DNS=$(aws elbv2 describe-load-balancers \
    --query "LoadBalancers[?contains(LoadBalancerName, 'medweg')].DNSName" \
    --output text \
    --region $AWS_REGION)

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   DEPLOYMENT SUCCESSFUL! 🎉            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Your application is available at:${NC}"
echo -e "${GREEN}http://$ALB_DNS${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Wait 2-3 minutes for services to fully start"
echo "2. Visit the URL above to access your application"
echo "3. Check logs: aws logs tail /ecs/medweg-backend --follow"
echo ""
echo -e "${YELLOW}Monitoring commands:${NC}"
echo "• View logs: aws logs tail /ecs/medweg-backend --follow --region $AWS_REGION"
echo "• Service status: aws ecs describe-services --cluster medweg-cluster --services medweg-service --region $AWS_REGION"
echo "• Task status: aws ecs list-tasks --cluster medweg-cluster --region $AWS_REGION"
echo ""
echo -e "${YELLOW}Update your environment:${NC}"
echo "Replace YOUR_ALB_DNS in .env.production with: $ALB_DNS"
echo "Then run: ./quick-deploy.sh again to update with correct URLs"
echo ""

# Save URL to file
echo $ALB_DNS > .deployment-url
echo -e "${GREEN}Deployment URL saved to .deployment-url${NC}"
echo ""
