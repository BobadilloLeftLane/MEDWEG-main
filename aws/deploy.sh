#!/bin/bash

# MEDWEG AWS Deployment Script
# This script deploys the MEDWEG application to AWS ECS

set -e

# Configuration
AWS_REGION=${AWS_REGION:-"eu-central-1"}
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID:-""}
ECR_BACKEND_REPO="medweg-backend"
ECR_FRONTEND_REPO="medweg-frontend"
ECS_CLUSTER="medweg-cluster"
ECS_SERVICE="medweg-service"
TASK_FAMILY="medweg-task"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  MEDWEG AWS Deployment Script${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}ERROR: AWS CLI is not installed${NC}"
    exit 1
fi

# Check if AWS account ID is set
if [ -z "$AWS_ACCOUNT_ID" ]; then
    echo -e "${YELLOW}Fetching AWS Account ID...${NC}"
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
fi

echo -e "${GREEN}AWS Account ID: ${AWS_ACCOUNT_ID}${NC}"
echo -e "${GREEN}AWS Region: ${AWS_REGION}${NC}"

# Step 1: Create ECR repositories if they don't exist
echo -e "\n${YELLOW}Step 1: Creating ECR repositories...${NC}"
aws ecr describe-repositories --repository-names ${ECR_BACKEND_REPO} --region ${AWS_REGION} 2>/dev/null || \
    aws ecr create-repository --repository-name ${ECR_BACKEND_REPO} --region ${AWS_REGION}

aws ecr describe-repositories --repository-names ${ECR_FRONTEND_REPO} --region ${AWS_REGION} 2>/dev/null || \
    aws ecr create-repository --repository-name ${ECR_FRONTEND_REPO} --region ${AWS_REGION}

echo -e "${GREEN}ECR repositories ready${NC}"

# Step 2: Login to ECR
echo -e "\n${YELLOW}Step 2: Logging in to ECR...${NC}"
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Step 3: Build and push backend
echo -e "\n${YELLOW}Step 3: Building and pushing backend image...${NC}"
cd backend
docker build -t ${ECR_BACKEND_REPO}:latest .
docker tag ${ECR_BACKEND_REPO}:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_BACKEND_REPO}:latest
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_BACKEND_REPO}:latest
cd ..

echo -e "${GREEN}Backend image pushed successfully${NC}"

# Step 4: Build and push frontend
echo -e "\n${YELLOW}Step 4: Building and pushing frontend image...${NC}"

# Load environment variables for frontend build
if [ -f .env.production ]; then
    export $(grep -v '^#' .env.production | xargs)
fi

cd frontend
docker build \
    --build-arg VITE_API_URL=${VITE_API_URL} \
    --build-arg VITE_API_TIMEOUT=${VITE_API_TIMEOUT:-10000} \
    --build-arg VITE_VAPID_PUBLIC_KEY=${VITE_VAPID_PUBLIC_KEY} \
    --build-arg VITE_APP_NAME="MEDWEG" \
    --build-arg VITE_APP_VERSION="0.1.0" \
    --build-arg VITE_NODE_ENV="production" \
    -t ${ECR_FRONTEND_REPO}:latest .
docker tag ${ECR_FRONTEND_REPO}:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_FRONTEND_REPO}:latest
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_FRONTEND_REPO}:latest
cd ..

echo -e "${GREEN}Frontend image pushed successfully${NC}"

# Step 5: Update task definition
echo -e "\n${YELLOW}Step 5: Updating ECS task definition...${NC}"
sed -i "s/YOUR_ACCOUNT_ID/${AWS_ACCOUNT_ID}/g" aws/ecs-task-definition.json
aws ecs register-task-definition --cli-input-json file://aws/ecs-task-definition.json --region ${AWS_REGION}

echo -e "${GREEN}Task definition updated${NC}"

# Step 6: Update ECS service
echo -e "\n${YELLOW}Step 6: Updating ECS service...${NC}"
aws ecs update-service \
    --cluster ${ECS_CLUSTER} \
    --service ${ECS_SERVICE} \
    --task-definition ${TASK_FAMILY} \
    --force-new-deployment \
    --region ${AWS_REGION}

echo -e "${GREEN}ECS service updated${NC}"

# Step 7: Wait for deployment
echo -e "\n${YELLOW}Step 7: Waiting for deployment to complete...${NC}"
aws ecs wait services-stable \
    --cluster ${ECS_CLUSTER} \
    --services ${ECS_SERVICE} \
    --region ${AWS_REGION}

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"

# Get the service URL
ALB_DNS=$(aws elbv2 describe-load-balancers \
    --query "LoadBalancers[?contains(LoadBalancerName, 'medweg')].DNSName" \
    --output text \
    --region ${AWS_REGION})

if [ ! -z "$ALB_DNS" ]; then
    echo -e "\n${GREEN}Application URL: http://${ALB_DNS}${NC}"
fi
