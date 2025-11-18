#!/bin/bash

# MEDWEG AWS Infrastructure Setup Script
# This script sets up all required AWS infrastructure for MEDWEG

set -e

# Configuration
AWS_REGION=${AWS_REGION:-"eu-central-1"}
PROJECT_NAME="medweg"
VPC_CIDR="10.0.0.0/16"
PUBLIC_SUBNET_1_CIDR="10.0.1.0/24"
PUBLIC_SUBNET_2_CIDR="10.0.2.0/24"
PRIVATE_SUBNET_1_CIDR="10.0.3.0/24"
PRIVATE_SUBNET_2_CIDR="10.0.4.0/24"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  MEDWEG Infrastructure Setup${NC}"
echo -e "${GREEN}========================================${NC}"

# Get AWS Account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}AWS Account ID: ${AWS_ACCOUNT_ID}${NC}"

# Step 1: Create VPC
echo -e "\n${YELLOW}Step 1: Creating VPC...${NC}"
VPC_ID=$(aws ec2 create-vpc \
    --cidr-block ${VPC_CIDR} \
    --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=${PROJECT_NAME}-vpc}]" \
    --query 'Vpc.VpcId' \
    --output text \
    --region ${AWS_REGION})

echo -e "${GREEN}VPC Created: ${VPC_ID}${NC}"

# Enable DNS hostnames
aws ec2 modify-vpc-attribute \
    --vpc-id ${VPC_ID} \
    --enable-dns-hostnames \
    --region ${AWS_REGION}

# Step 2: Create Internet Gateway
echo -e "\n${YELLOW}Step 2: Creating Internet Gateway...${NC}"
IGW_ID=$(aws ec2 create-internet-gateway \
    --tag-specifications "ResourceType=internet-gateway,Tags=[{Key=Name,Value=${PROJECT_NAME}-igw}]" \
    --query 'InternetGateway.InternetGatewayId' \
    --output text \
    --region ${AWS_REGION})

aws ec2 attach-internet-gateway \
    --vpc-id ${VPC_ID} \
    --internet-gateway-id ${IGW_ID} \
    --region ${AWS_REGION}

echo -e "${GREEN}Internet Gateway Created: ${IGW_ID}${NC}"

# Step 3: Get Availability Zones
echo -e "\n${YELLOW}Step 3: Getting Availability Zones...${NC}"
AZ1=$(aws ec2 describe-availability-zones --region ${AWS_REGION} --query 'AvailabilityZones[0].ZoneName' --output text)
AZ2=$(aws ec2 describe-availability-zones --region ${AWS_REGION} --query 'AvailabilityZones[1].ZoneName' --output text)

echo -e "${GREEN}Using AZs: ${AZ1}, ${AZ2}${NC}"

# Step 4: Create Public Subnets
echo -e "\n${YELLOW}Step 4: Creating Public Subnets...${NC}"
PUBLIC_SUBNET_1=$(aws ec2 create-subnet \
    --vpc-id ${VPC_ID} \
    --cidr-block ${PUBLIC_SUBNET_1_CIDR} \
    --availability-zone ${AZ1} \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=${PROJECT_NAME}-public-subnet-1}]" \
    --query 'Subnet.SubnetId' \
    --output text \
    --region ${AWS_REGION})

PUBLIC_SUBNET_2=$(aws ec2 create-subnet \
    --vpc-id ${VPC_ID} \
    --cidr-block ${PUBLIC_SUBNET_2_CIDR} \
    --availability-zone ${AZ2} \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=${PROJECT_NAME}-public-subnet-2}]" \
    --query 'Subnet.SubnetId' \
    --output text \
    --region ${AWS_REGION})

echo -e "${GREEN}Public Subnets Created: ${PUBLIC_SUBNET_1}, ${PUBLIC_SUBNET_2}${NC}"

# Enable auto-assign public IP
aws ec2 modify-subnet-attribute \
    --subnet-id ${PUBLIC_SUBNET_1} \
    --map-public-ip-on-launch \
    --region ${AWS_REGION}

aws ec2 modify-subnet-attribute \
    --subnet-id ${PUBLIC_SUBNET_2} \
    --map-public-ip-on-launch \
    --region ${AWS_REGION}

# Step 5: Create Private Subnets
echo -e "\n${YELLOW}Step 5: Creating Private Subnets...${NC}"
PRIVATE_SUBNET_1=$(aws ec2 create-subnet \
    --vpc-id ${VPC_ID} \
    --cidr-block ${PRIVATE_SUBNET_1_CIDR} \
    --availability-zone ${AZ1} \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=${PROJECT_NAME}-private-subnet-1}]" \
    --query 'Subnet.SubnetId' \
    --output text \
    --region ${AWS_REGION})

PRIVATE_SUBNET_2=$(aws ec2 create-subnet \
    --vpc-id ${VPC_ID} \
    --cidr-block ${PRIVATE_SUBNET_2_CIDR} \
    --availability-zone ${AZ2} \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=${PROJECT_NAME}-private-subnet-2}]" \
    --query 'Subnet.SubnetId' \
    --output text \
    --region ${AWS_REGION})

echo -e "${GREEN}Private Subnets Created: ${PRIVATE_SUBNET_1}, ${PRIVATE_SUBNET_2}${NC}"

# Step 6: Create Route Table
echo -e "\n${YELLOW}Step 6: Creating Route Tables...${NC}"
PUBLIC_RT=$(aws ec2 create-route-table \
    --vpc-id ${VPC_ID} \
    --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=${PROJECT_NAME}-public-rt}]" \
    --query 'RouteTable.RouteTableId' \
    --output text \
    --region ${AWS_REGION})

aws ec2 create-route \
    --route-table-id ${PUBLIC_RT} \
    --destination-cidr-block 0.0.0.0/0 \
    --gateway-id ${IGW_ID} \
    --region ${AWS_REGION}

aws ec2 associate-route-table \
    --subnet-id ${PUBLIC_SUBNET_1} \
    --route-table-id ${PUBLIC_RT} \
    --region ${AWS_REGION}

aws ec2 associate-route-table \
    --subnet-id ${PUBLIC_SUBNET_2} \
    --route-table-id ${PUBLIC_RT} \
    --region ${AWS_REGION}

echo -e "${GREEN}Route Tables Created${NC}"

# Step 7: Create Security Groups
echo -e "\n${YELLOW}Step 7: Creating Security Groups...${NC}"

# ALB Security Group
ALB_SG=$(aws ec2 create-security-group \
    --group-name ${PROJECT_NAME}-alb-sg \
    --description "Security group for MEDWEG ALB" \
    --vpc-id ${VPC_ID} \
    --query 'GroupId' \
    --output text \
    --region ${AWS_REGION})

aws ec2 authorize-security-group-ingress \
    --group-id ${ALB_SG} \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0 \
    --region ${AWS_REGION}

aws ec2 authorize-security-group-ingress \
    --group-id ${ALB_SG} \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0 \
    --region ${AWS_REGION}

echo -e "${GREEN}ALB Security Group Created: ${ALB_SG}${NC}"

# ECS Security Group
ECS_SG=$(aws ec2 create-security-group \
    --group-name ${PROJECT_NAME}-ecs-sg \
    --description "Security group for MEDWEG ECS tasks" \
    --vpc-id ${VPC_ID} \
    --query 'GroupId' \
    --output text \
    --region ${AWS_REGION})

aws ec2 authorize-security-group-ingress \
    --group-id ${ECS_SG} \
    --protocol tcp \
    --port 5000 \
    --source-group ${ALB_SG} \
    --region ${AWS_REGION}

aws ec2 authorize-security-group-ingress \
    --group-id ${ECS_SG} \
    --protocol tcp \
    --port 80 \
    --source-group ${ALB_SG} \
    --region ${AWS_REGION}

echo -e "${GREEN}ECS Security Group Created: ${ECS_SG}${NC}"

# RDS Security Group
RDS_SG=$(aws ec2 create-security-group \
    --group-name ${PROJECT_NAME}-rds-sg \
    --description "Security group for MEDWEG RDS" \
    --vpc-id ${VPC_ID} \
    --query 'GroupId' \
    --output text \
    --region ${AWS_REGION})

aws ec2 authorize-security-group-ingress \
    --group-id ${RDS_SG} \
    --protocol tcp \
    --port 5432 \
    --source-group ${ECS_SG} \
    --region ${AWS_REGION}

echo -e "${GREEN}RDS Security Group Created: ${RDS_SG}${NC}"

# Step 8: Create Application Load Balancer
echo -e "\n${YELLOW}Step 8: Creating Application Load Balancer...${NC}"
ALB_ARN=$(aws elbv2 create-load-balancer \
    --name ${PROJECT_NAME}-alb \
    --subnets ${PUBLIC_SUBNET_1} ${PUBLIC_SUBNET_2} \
    --security-groups ${ALB_SG} \
    --scheme internet-facing \
    --type application \
    --ip-address-type ipv4 \
    --query 'LoadBalancers[0].LoadBalancerArn' \
    --output text \
    --region ${AWS_REGION})

ALB_DNS=$(aws elbv2 describe-load-balancers \
    --load-balancer-arns ${ALB_ARN} \
    --query 'LoadBalancers[0].DNSName' \
    --output text \
    --region ${AWS_REGION})

echo -e "${GREEN}ALB Created: ${ALB_DNS}${NC}"

# Create Target Groups
FRONTEND_TG=$(aws elbv2 create-target-group \
    --name ${PROJECT_NAME}-frontend-tg \
    --protocol HTTP \
    --port 80 \
    --vpc-id ${VPC_ID} \
    --target-type ip \
    --health-check-path /health \
    --health-check-interval-seconds 30 \
    --query 'TargetGroups[0].TargetGroupArn' \
    --output text \
    --region ${AWS_REGION})

BACKEND_TG=$(aws elbv2 create-target-group \
    --name ${PROJECT_NAME}-backend-tg \
    --protocol HTTP \
    --port 5000 \
    --vpc-id ${VPC_ID} \
    --target-type ip \
    --health-check-path /health \
    --health-check-interval-seconds 30 \
    --query 'TargetGroups[0].TargetGroupArn' \
    --output text \
    --region ${AWS_REGION})

echo -e "${GREEN}Target Groups Created${NC}"

# Create Listener
aws elbv2 create-listener \
    --load-balancer-arn ${ALB_ARN} \
    --protocol HTTP \
    --port 80 \
    --default-actions Type=forward,TargetGroupArn=${FRONTEND_TG} \
    --region ${AWS_REGION}

# Create rule for backend API
aws elbv2 create-rule \
    --listener-arn $(aws elbv2 describe-listeners --load-balancer-arn ${ALB_ARN} --query 'Listeners[0].ListenerArn' --output text --region ${AWS_REGION}) \
    --priority 1 \
    --conditions Field=path-pattern,Values='/api/*' \
    --actions Type=forward,TargetGroupArn=${BACKEND_TG} \
    --region ${AWS_REGION}

echo -e "${GREEN}ALB Listener and Rules Created${NC}"

# Step 9: Create ECS Cluster
echo -e "\n${YELLOW}Step 9: Creating ECS Cluster...${NC}"
aws ecs create-cluster \
    --cluster-name ${PROJECT_NAME}-cluster \
    --region ${AWS_REGION}

echo -e "${GREEN}ECS Cluster Created${NC}"

# Step 10: Create IAM Roles
echo -e "\n${YELLOW}Step 10: Creating IAM Roles...${NC}"

# ECS Task Execution Role
cat > /tmp/ecs-task-execution-role.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

aws iam create-role \
    --role-name ecsTaskExecutionRole \
    --assume-role-policy-document file:///tmp/ecs-task-execution-role.json \
    --region ${AWS_REGION} 2>/dev/null || echo "Role already exists"

aws iam attach-role-policy \
    --role-name ecsTaskExecutionRole \
    --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy \
    --region ${AWS_REGION}

aws iam attach-role-policy \
    --role-name ecsTaskExecutionRole \
    --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite \
    --region ${AWS_REGION}

# ECS Task Role
cat > /tmp/ecs-task-role.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

aws iam create-role \
    --role-name ecsTaskRole \
    --assume-role-policy-document file:///tmp/ecs-task-role.json \
    --region ${AWS_REGION} 2>/dev/null || echo "Role already exists"

# Create policy for S3 and SES access
cat > /tmp/ecs-task-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::medweg-invoices/*",
        "arn:aws:s3:::medweg-invoices"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    }
  ]
}
EOF

aws iam put-role-policy \
    --role-name ecsTaskRole \
    --policy-name MedwegTaskPolicy \
    --policy-document file:///tmp/ecs-task-policy.json \
    --region ${AWS_REGION}

echo -e "${GREEN}IAM Roles Created${NC}"

# Step 11: Create CloudWatch Log Groups
echo -e "\n${YELLOW}Step 11: Creating CloudWatch Log Groups...${NC}"
aws logs create-log-group \
    --log-group-name /ecs/medweg-backend \
    --region ${AWS_REGION} 2>/dev/null || echo "Log group already exists"

aws logs create-log-group \
    --log-group-name /ecs/medweg-frontend \
    --region ${AWS_REGION} 2>/dev/null || echo "Log group already exists"

echo -e "${GREEN}CloudWatch Log Groups Created${NC}"

# Step 12: Create S3 Bucket for Invoices
echo -e "\n${YELLOW}Step 12: Creating S3 Bucket...${NC}"
aws s3 mb s3://medweg-invoices --region ${AWS_REGION} 2>/dev/null || echo "Bucket already exists"

echo -e "${GREEN}S3 Bucket Created${NC}"

# Save configuration
echo -e "\n${YELLOW}Saving configuration...${NC}"
cat > aws/infrastructure-config.json <<EOF
{
  "aws_account_id": "${AWS_ACCOUNT_ID}",
  "aws_region": "${AWS_REGION}",
  "vpc_id": "${VPC_ID}",
  "public_subnet_1": "${PUBLIC_SUBNET_1}",
  "public_subnet_2": "${PUBLIC_SUBNET_2}",
  "private_subnet_1": "${PRIVATE_SUBNET_1}",
  "private_subnet_2": "${PRIVATE_SUBNET_2}",
  "alb_security_group": "${ALB_SG}",
  "ecs_security_group": "${ECS_SG}",
  "rds_security_group": "${RDS_SG}",
  "alb_arn": "${ALB_ARN}",
  "alb_dns": "${ALB_DNS}",
  "frontend_target_group": "${FRONTEND_TG}",
  "backend_target_group": "${BACKEND_TG}",
  "ecs_cluster": "${PROJECT_NAME}-cluster"
}
EOF

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  Infrastructure Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n${YELLOW}Next Steps:${NC}"
echo -e "1. Set up AWS Secrets Manager with your secrets"
echo -e "2. Create RDS PostgreSQL database"
echo -e "3. Update ecs-task-definition.json with correct ARNs"
echo -e "4. Run deploy.sh to deploy the application"
echo -e "\n${GREEN}Application URL will be: http://${ALB_DNS}${NC}"
