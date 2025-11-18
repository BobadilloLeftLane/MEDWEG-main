param(
    [string]$AWSRegion = "eu-central-1"
)

$ErrorActionPreference = "Stop"

Clear-Host
Write-Host "MEDWEG AWS Deployment" -ForegroundColor Green
Write-Host ""

# Get AWS Account ID
Write-Host "Getting AWS Account information..." -ForegroundColor Cyan
$AWSAccountID = (aws sts get-caller-identity --query Account --output text).Trim()
$AWSUser = (aws sts get-caller-identity --query Arn --output text).Trim()

Write-Host "AWS Account ID: $AWSAccountID" -ForegroundColor Green
Write-Host "AWS User: $AWSUser" -ForegroundColor Green
Write-Host "AWS Region: $AWSRegion" -ForegroundColor Green
Write-Host ""

# Configuration
$ECR_BACKEND_REPO = "medweg-backend"
$ECR_FRONTEND_REPO = "medweg-frontend"

Write-Host "This will build and push Docker images to ECR" -ForegroundColor Yellow
Write-Host "Estimated time: 15-20 minutes" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Continue? (y/n)"
if ($confirm -ne "y") {
    Write-Host "Cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "STEP 1: Create ECR Repositories" -ForegroundColor Cyan
Write-Host ""

# Create backend repo
Write-Host "Creating backend repository..." -ForegroundColor Cyan
$ErrorActionPreference = "SilentlyContinue"
aws ecr describe-repositories --repository-names $ECR_BACKEND_REPO --region $AWSRegion 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    $ErrorActionPreference = "Stop"
    aws ecr create-repository --repository-name $ECR_BACKEND_REPO --region $AWSRegion | Out-Null
    Write-Host "Backend repository created" -ForegroundColor Green
}
else {
    $ErrorActionPreference = "Stop"
    Write-Host "Backend repository already exists" -ForegroundColor Green
}

# Create frontend repo
Write-Host "Creating frontend repository..." -ForegroundColor Cyan
$ErrorActionPreference = "SilentlyContinue"
aws ecr describe-repositories --repository-names $ECR_FRONTEND_REPO --region $AWSRegion 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    $ErrorActionPreference = "Stop"
    aws ecr create-repository --repository-name $ECR_FRONTEND_REPO --region $AWSRegion | Out-Null
    Write-Host "Frontend repository created" -ForegroundColor Green
}
else {
    $ErrorActionPreference = "Stop"
    Write-Host "Frontend repository already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "STEP 2: Login to ECR" -ForegroundColor Cyan
Write-Host ""

$ecrPassword = aws ecr get-login-password --region $AWSRegion
$ecrPassword | docker login --username AWS --password-stdin "$AWSAccountID.dkr.ecr.$AWSRegion.amazonaws.com"
Write-Host "Logged in to ECR" -ForegroundColor Green

Write-Host ""
Write-Host "STEP 3: Build Backend Image" -ForegroundColor Cyan
Write-Host "This may take 5-10 minutes..." -ForegroundColor Yellow
Write-Host ""

Set-Location backend
docker build -t "${ECR_BACKEND_REPO}:latest" .
if ($LASTEXITCODE -ne 0) {
    Write-Host "Backend build failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

docker tag "${ECR_BACKEND_REPO}:latest" "$AWSAccountID.dkr.ecr.$AWSRegion.amazonaws.com/${ECR_BACKEND_REPO}:latest"
Write-Host "Backend image built" -ForegroundColor Green

Write-Host "Pushing backend image to ECR..." -ForegroundColor Cyan
docker push "$AWSAccountID.dkr.ecr.$AWSRegion.amazonaws.com/${ECR_BACKEND_REPO}:latest"
Write-Host "Backend image pushed to ECR" -ForegroundColor Green

Set-Location ..

Write-Host ""
Write-Host "STEP 4: Build Frontend Image" -ForegroundColor Cyan
Write-Host ""

# Get API URL
Write-Host "Enter API URL (or press Enter for default):" -ForegroundColor Yellow
$VITE_API_URL = Read-Host
if ([string]::IsNullOrWhiteSpace($VITE_API_URL)) {
    $VITE_API_URL = "http://localhost:5000/api/v1"
    Write-Host "Using default: $VITE_API_URL" -ForegroundColor Yellow
}

# Generate VAPID keys
Write-Host "Generating VAPID keys..." -ForegroundColor Cyan
Set-Location backend
$vapidOutput = npx web-push generate-vapid-keys --json 2>$null | ConvertFrom-Json
$VITE_VAPID_PUBLIC_KEY = $vapidOutput.publicKey
Set-Location ..

Write-Host "VAPID keys generated" -ForegroundColor Green
Write-Host "Public Key: $VITE_VAPID_PUBLIC_KEY" -ForegroundColor Cyan

Write-Host ""
Write-Host "Building frontend image..." -ForegroundColor Cyan
Write-Host "This may take 5-10 minutes..." -ForegroundColor Yellow
Write-Host ""

Set-Location frontend

docker build --build-arg VITE_API_URL=$VITE_API_URL --build-arg VITE_API_TIMEOUT=10000 --build-arg VITE_VAPID_PUBLIC_KEY=$VITE_VAPID_PUBLIC_KEY --build-arg VITE_APP_NAME=MEDWEG --build-arg VITE_APP_VERSION=0.1.0 --build-arg VITE_NODE_ENV=production -t "${ECR_FRONTEND_REPO}:latest" .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend build failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

docker tag "${ECR_FRONTEND_REPO}:latest" "$AWSAccountID.dkr.ecr.$AWSRegion.amazonaws.com/${ECR_FRONTEND_REPO}:latest"
Write-Host "Frontend image built" -ForegroundColor Green

Write-Host "Pushing frontend image to ECR..." -ForegroundColor Cyan
docker push "$AWSAccountID.dkr.ecr.$AWSRegion.amazonaws.com/${ECR_FRONTEND_REPO}:latest"
Write-Host "Frontend image pushed to ECR" -ForegroundColor Green

Set-Location ..

Write-Host ""
Write-Host "SUCCESS! Docker Images Pushed" -ForegroundColor Green
Write-Host ""
Write-Host "Backend Image: $AWSAccountID.dkr.ecr.$AWSRegion.amazonaws.com/${ECR_BACKEND_REPO}:latest" -ForegroundColor Cyan
Write-Host "Frontend Image: $AWSAccountID.dkr.ecr.$AWSRegion.amazonaws.com/${ECR_FRONTEND_REPO}:latest" -ForegroundColor Cyan
Write-Host ""
Write-Host "VAPID Public Key: $VITE_VAPID_PUBLIC_KEY" -ForegroundColor Cyan
Write-Host "VAPID Private Key: $($vapidOutput.privateKey)" -ForegroundColor Cyan
Write-Host ""
Write-Host "SAVE THESE VAPID KEYS!" -ForegroundColor Yellow
Write-Host ""

# Save config
$config = @{
    aws_account_id = $AWSAccountID
    aws_region = $AWSRegion
    backend_image = "$AWSAccountID.dkr.ecr.$AWSRegion.amazonaws.com/${ECR_BACKEND_REPO}:latest"
    frontend_image = "$AWSAccountID.dkr.ecr.$AWSRegion.amazonaws.com/${ECR_FRONTEND_REPO}:latest"
    vapid_public_key = $VITE_VAPID_PUBLIC_KEY
    vapid_private_key = $vapidOutput.privateKey
    vite_api_url = $VITE_API_URL
}

$config | ConvertTo-Json | Out-File "deployment-config.json"
Write-Host "Configuration saved to deployment-config.json" -ForegroundColor Green

Write-Host ""
Write-Host "Continue with infrastructure setup? (y/n)" -ForegroundColor Yellow
$continue = Read-Host

if ($continue -eq "y") {
    Write-Host ""
    Write-Host "Starting infrastructure setup..." -ForegroundColor Cyan
    & "$PSScriptRoot\aws\setup-infrastructure-windows.ps1" -AWSRegion $AWSRegion -AWSAccountID $AWSAccountID
}
else {
    Write-Host ""
    Write-Host "Done! Run infrastructure setup later with:" -ForegroundColor Yellow
    Write-Host "  .\aws\setup-infrastructure-windows.ps1" -ForegroundColor White
}
