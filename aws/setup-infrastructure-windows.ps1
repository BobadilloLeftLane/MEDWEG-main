param(
    [string]$AWSRegion = "eu-central-1",
    [string]$AWSAccountID = ""
)

$ErrorActionPreference = "Stop"

Write-Host "MEDWEG Infrastructure Setup" -ForegroundColor Green
Write-Host ""

if ([string]::IsNullOrEmpty($AWSAccountID)) {
    $AWSAccountID = (aws sts get-caller-identity --query Account --output text).Trim()
}

Write-Host "AWS Account: $AWSAccountID" -ForegroundColor Green
Write-Host "Region: $AWSRegion" -ForegroundColor Green
Write-Host ""

$PROJECT_NAME = "medweg"
$VPC_CIDR = "10.0.0.0/16"
$PUBLIC_SUBNET_1_CIDR = "10.0.1.0/24"
$PUBLIC_SUBNET_2_CIDR = "10.0.2.0/24"

Write-Host "This will create AWS infrastructure" -ForegroundColor Yellow
Write-Host "Estimated cost: ~75-100 USD/month" -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "Continue? (y/n)"
if ($confirm -ne "y") {
    Write-Host "Cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Creating VPC..." -ForegroundColor Cyan

$vpcName = "$PROJECT_NAME-vpc"
$VPC_ID = (aws ec2 create-vpc --cidr-block $VPC_CIDR --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=$vpcName}]" --query 'Vpc.VpcId' --output text --region $AWSRegion).Trim()
Write-Host "VPC Created: $VPC_ID" -ForegroundColor Green

aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-hostnames --region $AWSRegion
Write-Host "DNS hostnames enabled" -ForegroundColor Green

Write-Host ""
Write-Host "Creating Internet Gateway..." -ForegroundColor Cyan

$igwName = "$PROJECT_NAME-igw"
$IGW_ID = (aws ec2 create-internet-gateway --tag-specifications "ResourceType=internet-gateway,Tags=[{Key=Name,Value=$igwName}]" --query 'InternetGateway.InternetGatewayId' --output text --region $AWSRegion).Trim()
aws ec2 attach-internet-gateway --vpc-id $VPC_ID --internet-gateway-id $IGW_ID --region $AWSRegion
Write-Host "Internet Gateway: $IGW_ID" -ForegroundColor Green

Write-Host ""
Write-Host "Creating Subnets..." -ForegroundColor Cyan

$AZ1 = (aws ec2 describe-availability-zones --region $AWSRegion --query 'AvailabilityZones[0].ZoneName' --output text).Trim()
$AZ2 = (aws ec2 describe-availability-zones --region $AWSRegion --query 'AvailabilityZones[1].ZoneName' --output text).Trim()
Write-Host "Using AZs: $AZ1, $AZ2" -ForegroundColor Cyan

$subnet1Name = "$PROJECT_NAME-public-1"
$PUBLIC_SUBNET_1 = (aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block $PUBLIC_SUBNET_1_CIDR --availability-zone $AZ1 --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$subnet1Name}]" --query 'Subnet.SubnetId' --output text --region $AWSRegion).Trim()

$subnet2Name = "$PROJECT_NAME-public-2"
$PUBLIC_SUBNET_2 = (aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block $PUBLIC_SUBNET_2_CIDR --availability-zone $AZ2 --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$subnet2Name}]" --query 'Subnet.SubnetId' --output text --region $AWSRegion).Trim()

aws ec2 modify-subnet-attribute --subnet-id $PUBLIC_SUBNET_1 --map-public-ip-on-launch --region $AWSRegion
aws ec2 modify-subnet-attribute --subnet-id $PUBLIC_SUBNET_2 --map-public-ip-on-launch --region $AWSRegion

Write-Host "Public Subnet 1: $PUBLIC_SUBNET_1" -ForegroundColor Green
Write-Host "Public Subnet 2: $PUBLIC_SUBNET_2" -ForegroundColor Green

Write-Host ""
Write-Host "Creating Route Table..." -ForegroundColor Cyan

$rtName = "$PROJECT_NAME-public-rt"
$PUBLIC_RT = (aws ec2 create-route-table --vpc-id $VPC_ID --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=$rtName}]" --query 'RouteTable.RouteTableId' --output text --region $AWSRegion).Trim()

aws ec2 create-route --route-table-id $PUBLIC_RT --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW_ID --region $AWSRegion | Out-Null
aws ec2 associate-route-table --subnet-id $PUBLIC_SUBNET_1 --route-table-id $PUBLIC_RT --region $AWSRegion | Out-Null
aws ec2 associate-route-table --subnet-id $PUBLIC_SUBNET_2 --route-table-id $PUBLIC_RT --region $AWSRegion | Out-Null

Write-Host "Route table configured" -ForegroundColor Green

Write-Host ""
Write-Host "Creating Security Groups..." -ForegroundColor Cyan

$albSgName = "$PROJECT_NAME-alb-sg"
$ALB_SG = (aws ec2 create-security-group --group-name $albSgName --description "Security group for MEDWEG ALB" --vpc-id $VPC_ID --query 'GroupId' --output text --region $AWSRegion).Trim()

aws ec2 authorize-security-group-ingress --group-id $ALB_SG --protocol tcp --port 80 --cidr 0.0.0.0/0 --region $AWSRegion | Out-Null
aws ec2 authorize-security-group-ingress --group-id $ALB_SG --protocol tcp --port 443 --cidr 0.0.0.0/0 --region $AWSRegion | Out-Null

Write-Host "ALB Security Group: $ALB_SG" -ForegroundColor Green

$ecsSgName = "$PROJECT_NAME-ecs-sg"
$ECS_SG = (aws ec2 create-security-group --group-name $ecsSgName --description "Security group for MEDWEG ECS tasks" --vpc-id $VPC_ID --query 'GroupId' --output text --region $AWSRegion).Trim()

aws ec2 authorize-security-group-ingress --group-id $ECS_SG --protocol tcp --port 5000 --source-group $ALB_SG --region $AWSRegion | Out-Null
aws ec2 authorize-security-group-ingress --group-id $ECS_SG --protocol tcp --port 80 --source-group $ALB_SG --region $AWSRegion | Out-Null

Write-Host "ECS Security Group: $ECS_SG" -ForegroundColor Green

Write-Host ""
Write-Host "Creating Application Load Balancer..." -ForegroundColor Cyan
Write-Host "This takes about 2 minutes..." -ForegroundColor Yellow

$albName = "$PROJECT_NAME-alb"
$ALB_ARN = (aws elbv2 create-load-balancer --name $albName --subnets $PUBLIC_SUBNET_1 $PUBLIC_SUBNET_2 --security-groups $ALB_SG --scheme internet-facing --type application --ip-address-type ipv4 --query 'LoadBalancers[0].LoadBalancerArn' --output text --region $AWSRegion).Trim()

Start-Sleep -Seconds 10

$ALB_DNS = (aws elbv2 describe-load-balancers --load-balancer-arns $ALB_ARN --query 'LoadBalancers[0].DNSName' --output text --region $AWSRegion).Trim()

Write-Host "ALB Created: $ALB_DNS" -ForegroundColor Green

Write-Host ""
Write-Host "Creating Target Groups..." -ForegroundColor Cyan

$frontendTgName = "$PROJECT_NAME-frontend-tg"
$FRONTEND_TG = (aws elbv2 create-target-group --name $frontendTgName --protocol HTTP --port 80 --vpc-id $VPC_ID --target-type ip --health-check-path /health --health-check-interval-seconds 30 --query 'TargetGroups[0].TargetGroupArn' --output text --region $AWSRegion).Trim()

$backendTgName = "$PROJECT_NAME-backend-tg"
$BACKEND_TG = (aws elbv2 create-target-group --name $backendTgName --protocol HTTP --port 5000 --vpc-id $VPC_ID --target-type ip --health-check-path /health --health-check-interval-seconds 30 --query 'TargetGroups[0].TargetGroupArn' --output text --region $AWSRegion).Trim()

Write-Host "Target groups created" -ForegroundColor Green

Write-Host ""
Write-Host "Creating ALB Listener..." -ForegroundColor Cyan

$LISTENER_ARN = (aws elbv2 create-listener --load-balancer-arn $ALB_ARN --protocol HTTP --port 80 --default-actions "Type=forward,TargetGroupArn=$FRONTEND_TG" --query 'Listeners[0].ListenerArn' --output text --region $AWSRegion).Trim()

aws elbv2 create-rule --listener-arn $LISTENER_ARN --priority 1 --conditions "Field=path-pattern,Values='/api/*'" --actions "Type=forward,TargetGroupArn=$BACKEND_TG" --region $AWSRegion | Out-Null

Write-Host "ALB listener configured" -ForegroundColor Green

Write-Host ""
Write-Host "Creating ECS Cluster..." -ForegroundColor Cyan

$clusterName = "$PROJECT_NAME-cluster"
aws ecs create-cluster --cluster-name $clusterName --region $AWSRegion | Out-Null
Write-Host "ECS Cluster created" -ForegroundColor Green

Write-Host ""
Write-Host "Creating CloudWatch Log Groups..." -ForegroundColor Cyan

$ErrorActionPreference = "SilentlyContinue"
aws logs create-log-group --log-group-name /ecs/medweg-backend --region $AWSRegion 2>&1 | Out-Null
aws logs create-log-group --log-group-name /ecs/medweg-frontend --region $AWSRegion 2>&1 | Out-Null
$ErrorActionPreference = "Stop"

Write-Host "CloudWatch log groups created" -ForegroundColor Green

Write-Host ""
Write-Host "Creating S3 Bucket..." -ForegroundColor Cyan

$bucketName = "medweg-invoices-$AWSAccountID"
$ErrorActionPreference = "SilentlyContinue"
aws s3 mb "s3://$bucketName" --region $AWSRegion 2>&1 | Out-Null
$ErrorActionPreference = "Stop"

Write-Host "S3 bucket: $bucketName" -ForegroundColor Green

$config = @{
    aws_account_id = $AWSAccountID
    aws_region = $AWSRegion
    vpc_id = $VPC_ID
    public_subnet_1 = $PUBLIC_SUBNET_1
    public_subnet_2 = $PUBLIC_SUBNET_2
    alb_security_group = $ALB_SG
    ecs_security_group = $ECS_SG
    alb_arn = $ALB_ARN
    alb_dns = $ALB_DNS
    frontend_target_group = $FRONTEND_TG
    backend_target_group = $BACKEND_TG
    ecs_cluster = $clusterName
    s3_bucket = $bucketName
}

$config | ConvertTo-Json | Out-File "$PSScriptRoot\infrastructure-config.json"

Write-Host ""
Write-Host "Infrastructure Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Application URL: http://$ALB_DNS" -ForegroundColor Cyan
Write-Host ""
Write-Host "Configuration saved to: aws\infrastructure-config.json" -ForegroundColor Green
Write-Host ""
