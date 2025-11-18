# MEDWEG AWS Deployment Script for Windows PowerShell
# This script deploys the MEDWEG application to AWS ECS

param(
    [string]$AWSRegion = "eu-central-1",
    [string]$AWSAccountID = ""
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Green
Write-Host "  MEDWEG AWS Deployment Script" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Check if AWS CLI is installed
try {
    $awsVersion = aws --version
    Write-Host "AWS CLI installed: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: AWS CLI is not installed" -ForegroundColor Red
    Write-Host "Please install from: https://awscli.amazonaws.com/AWSCLIV2.msi" -ForegroundColor Yellow
    exit 1
}

# Check if Docker is installed
try {
    $dockerVersion = docker --version
    Write-Host "Docker installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Docker is not installed" -ForegroundColor Red
    exit 1
}

# Get AWS Account ID if not provided
if ([string]::IsNullOrEmpty($AWSAccountID)) {
    Write-Host "Fetching AWS Account ID..." -ForegroundColor Yellow
    $AWSAccountID = (aws sts get-caller-identity --query Account --output text)
}

Write-Host "AWS Account ID: $AWSAccountID" -ForegroundColor Green
Write-Host "AWS Region: $AWSRegion" -ForegroundColor Green

# Configuration
$ECR_BACKEND_REPO = "medweg-backend"
$ECR_FRONTEND_REPO = "medweg-frontend"
$ECS_CLUSTER = "medweg-cluster"
$ECS_SERVICE = "medweg-service"
$TASK_FAMILY = "medweg-task"

# Step 1: Create ECR repositories if they don't exist
Write-Host "`nStep 1: Creating ECR repositories..." -ForegroundColor Yellow

try {
    aws ecr describe-repositories --repository-names $ECR_BACKEND_REPO --region $AWSRegion 2>$null
} catch {
    aws ecr create-repository --repository-name $ECR_BACKEND_REPO --region $AWSRegion
}

try {
    aws ecr describe-repositories --repository-names $ECR_FRONTEND_REPO --region $AWSRegion 2>$null
} catch {
    aws ecr create-repository --repository-name $ECR_FRONTEND_REPO --region $AWSRegion
}

Write-Host "ECR repositories ready" -ForegroundColor Green

# Step 2: Login to ECR
Write-Host "`nStep 2: Logging in to ECR..." -ForegroundColor Yellow
$ecrLogin = aws ecr get-login-password --region $AWSRegion
$ecrLogin | docker login --username AWS --password-stdin "$AWSAccountID.dkr.ecr.$AWSRegion.amazonaws.com"

# Step 3: Build and push backend
Write-Host "`nStep 3: Building and pushing backend image..." -ForegroundColor Yellow
Set-Location backend
docker build -t "${ECR_BACKEND_REPO}:latest" .
docker tag "${ECR_BACKEND_REPO}:latest" "$AWSAccountID.dkr.ecr.$AWSRegion.amazonaws.com/${ECR_BACKEND_REPO}:latest"
docker push "$AWSAccountID.dkr.ecr.$AWSRegion.amazonaws.com/${ECR_BACKEND_REPO}:latest"
Set-Location ..

Write-Host "Backend image pushed successfully" -ForegroundColor Green

# Step 4: Build and push frontend
Write-Host "`nStep 4: Building and pushing frontend image..." -ForegroundColor Yellow

# Load environment variables for frontend build
if (Test-Path ".env.production") {
    Get-Content .env.production | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2])
        }
    }
}

$VITE_API_URL = $env:VITE_API_URL
$VITE_VAPID_PUBLIC_KEY = $env:VITE_VAPID_PUBLIC_KEY

Set-Location frontend
docker build `
    --build-arg VITE_API_URL=$VITE_API_URL `
    --build-arg VITE_API_TIMEOUT=10000 `
    --build-arg VITE_VAPID_PUBLIC_KEY=$VITE_VAPID_PUBLIC_KEY `
    --build-arg VITE_APP_NAME=MEDWEG `
    --build-arg VITE_APP_VERSION=0.1.0 `
    --build-arg VITE_NODE_ENV=production `
    -t "${ECR_FRONTEND_REPO}:latest" .
docker tag "${ECR_FRONTEND_REPO}:latest" "$AWSAccountID.dkr.ecr.$AWSRegion.amazonaws.com/${ECR_FRONTEND_REPO}:latest"
docker push "$AWSAccountID.dkr.ecr.$AWSRegion.amazonaws.com/${ECR_FRONTEND_REPO}:latest"
Set-Location ..

Write-Host "Frontend image pushed successfully" -ForegroundColor Green

# Step 5: Update task definition
Write-Host "`nStep 5: Updating ECS task definition..." -ForegroundColor Yellow

# Read and update task definition
$taskDefPath = "aws\ecs-task-definition.json"
$taskDef = Get-Content $taskDefPath -Raw
$taskDef = $taskDef -replace 'YOUR_ACCOUNT_ID', $AWSAccountID
$taskDef | Set-Content "$taskDefPath.tmp"

aws ecs register-task-definition --cli-input-json "file://$taskDefPath.tmp" --region $AWSRegion
Remove-Item "$taskDefPath.tmp"

Write-Host "Task definition updated" -ForegroundColor Green

# Step 6: Update ECS service
Write-Host "`nStep 6: Updating ECS service..." -ForegroundColor Yellow

try {
    aws ecs update-service `
        --cluster $ECS_CLUSTER `
        --service $ECS_SERVICE `
        --task-definition $TASK_FAMILY `
        --force-new-deployment `
        --region $AWSRegion
} catch {
    Write-Host "Service doesn't exist yet. You need to create it manually first." -ForegroundColor Yellow
    Write-Host "See AWS_DEPLOYMENT_GUIDE.md for instructions" -ForegroundColor Yellow
}

Write-Host "ECS service updated" -ForegroundColor Green

# Step 7: Wait for deployment
Write-Host "`nStep 7: Waiting for deployment to complete..." -ForegroundColor Yellow
Write-Host "This may take several minutes..." -ForegroundColor Yellow

try {
    aws ecs wait services-stable `
        --cluster $ECS_CLUSTER `
        --services $ECS_SERVICE `
        --region $AWSRegion
} catch {
    Write-Host "Timeout waiting for service. Check AWS Console for status." -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  Deployment completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Get the service URL
try {
    $ALB_DNS = (aws elbv2 describe-load-balancers `
        --query "LoadBalancers[?contains(LoadBalancerName, 'medweg')].DNSName" `
        --output text `
        --region $AWSRegion)

    if ($ALB_DNS) {
        Write-Host "`nApplication URL: http://$ALB_DNS" -ForegroundColor Green
    }
} catch {
    Write-Host "Could not retrieve ALB DNS. Check AWS Console." -ForegroundColor Yellow
}

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Check CloudWatch logs: aws logs tail /ecs/medweg-backend --follow" -ForegroundColor White
Write-Host "2. Monitor service: aws ecs describe-services --cluster $ECS_CLUSTER --services $ECS_SERVICE" -ForegroundColor White
Write-Host "3. Access your application using the URL above" -ForegroundColor White
