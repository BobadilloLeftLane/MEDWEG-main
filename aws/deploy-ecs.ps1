param(
    [string]$AWSRegion = "eu-central-1"
)

$ErrorActionPreference = "Stop"

Write-Host "MEDWEG ECS Deployment" -ForegroundColor Green
Write-Host ""

# Load configs
$infraConfig = Get-Content "$PSScriptRoot\infrastructure-config.json" | ConvertFrom-Json
$deployConfig = Get-Content "deployment-config.json" | ConvertFrom-Json

$AWSAccountID = $infraConfig.aws_account_id
$ALB_DNS = $infraConfig.alb_dns

Write-Host "Account: $AWSAccountID" -ForegroundColor Cyan
Write-Host "Region: $AWSRegion" -ForegroundColor Cyan
Write-Host "ALB DNS: $ALB_DNS" -ForegroundColor Cyan
Write-Host ""

# Collect secrets
Write-Host "We need to set up secrets for the application" -ForegroundColor Yellow
Write-Host ""

Write-Host "Database Information:" -ForegroundColor Cyan
$DB_HOST = Read-Host "Database host (your RDS endpoint)"
$DB_NAME = Read-Host "Database name [MEDWEG]"
if ([string]::IsNullOrWhiteSpace($DB_NAME)) { $DB_NAME = "MEDWEG" }
$DB_USER = Read-Host "Database user [postgres]"
if ([string]::IsNullOrWhiteSpace($DB_USER)) { $DB_USER = "postgres" }
$DB_PASSWORD = Read-Host "Database password" -AsSecureString
$DB_PASSWORD_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASSWORD))

Write-Host ""
Write-Host "Generating encryption keys..." -ForegroundColor Cyan
$DB_ENCRYPTION_KEY = -join ((1..128) | ForEach-Object { "{0:X}" -f (Get-Random -Maximum 16) })
$JWT_SECRET = -join ((1..128) | ForEach-Object { "{0:X}" -f (Get-Random -Maximum 16) })
$JWT_REFRESH_SECRET = -join ((1..128) | ForEach-Object { "{0:X}" -f (Get-Random -Maximum 16) })

Write-Host "Keys generated" -ForegroundColor Green

Write-Host ""
Write-Host "Email Configuration:" -ForegroundColor Cyan
$EMAIL_USER = Read-Host "Gmail address"
$EMAIL_PASSWORD = Read-Host "Gmail app password" -AsSecureString
$EMAIL_PASSWORD_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($EMAIL_PASSWORD))

Write-Host ""
Write-Host "AWS Credentials (for S3/SES):" -ForegroundColor Cyan
$AWS_ACCESS_KEY = Read-Host "AWS Access Key ID"
$AWS_SECRET_KEY = Read-Host "AWS Secret Access Key" -AsSecureString
$AWS_SECRET_KEY_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($AWS_SECRET_KEY))

Write-Host ""
Write-Host "Creating secrets in AWS Secrets Manager..." -ForegroundColor Cyan

function Create-Secret {
    param($name, $value)
    $ErrorActionPreference = "SilentlyContinue"
    aws secretsmanager create-secret --name $name --secret-string $value --region $AWSRegion 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        $ErrorActionPreference = "Stop"
        aws secretsmanager update-secret --secret-id $name --secret-string $value --region $AWSRegion | Out-Null
    }
    $ErrorActionPreference = "Stop"
    Write-Host "  $name" -ForegroundColor Green
}

Create-Secret "medweg/db-host" $DB_HOST
Create-Secret "medweg/db-name" $DB_NAME
Create-Secret "medweg/db-user" $DB_USER
Create-Secret "medweg/db-password" $DB_PASSWORD_PLAIN
Create-Secret "medweg/db-encryption-key" $DB_ENCRYPTION_KEY
Create-Secret "medweg/jwt-secret" $JWT_SECRET
Create-Secret "medweg/jwt-refresh-secret" $JWT_REFRESH_SECRET
Create-Secret "medweg/aws-access-key-id" $AWS_ACCESS_KEY
Create-Secret "medweg/aws-secret-key" $AWS_SECRET_KEY_PLAIN
Create-Secret "medweg/vapid-public-key" $deployConfig.vapid_public_key
Create-Secret "medweg/vapid-private-key" $deployConfig.vapid_private_key
Create-Secret "medweg/email-user" $EMAIL_USER
Create-Secret "medweg/email-password" $EMAIL_PASSWORD_PLAIN

Write-Host "Secrets created" -ForegroundColor Green

Write-Host ""
Write-Host "Creating IAM roles..." -ForegroundColor Cyan

# Task Execution Role
$execRolePolicy = @"
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "ecs-tasks.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}
"@

$execRolePolicy | Out-File -FilePath "$env:TEMP\exec-role.json" -Encoding ASCII

$ErrorActionPreference = "SilentlyContinue"
aws iam create-role --role-name ecsTaskExecutionRole --assume-role-policy-document "file://$env:TEMP\exec-role.json" 2>&1 | Out-Null
$ErrorActionPreference = "Stop"

aws iam attach-role-policy --role-name ecsTaskExecutionRole --policy-arn "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy" 2>&1 | Out-Null
aws iam attach-role-policy --role-name ecsTaskExecutionRole --policy-arn "arn:aws:iam::aws:policy/SecretsManagerReadWrite" 2>&1 | Out-Null

# Task Role
$taskRolePolicy = @"
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "ecs-tasks.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}
"@

$taskRolePolicy | Out-File -FilePath "$env:TEMP\task-role.json" -Encoding ASCII

$ErrorActionPreference = "SilentlyContinue"
aws iam create-role --role-name ecsTaskRole --assume-role-policy-document "file://$env:TEMP\task-role.json" 2>&1 | Out-Null
$ErrorActionPreference = "Stop"

$taskPolicy = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::$($infraConfig.s3_bucket)/*", "arn:aws:s3:::$($infraConfig.s3_bucket)"]
    },
    {
      "Effect": "Allow",
      "Action": ["ses:SendEmail", "ses:SendRawEmail"],
      "Resource": "*"
    }
  ]
}
"@

$taskPolicy | Out-File -FilePath "$env:TEMP\task-policy.json" -Encoding ASCII

aws iam put-role-policy --role-name ecsTaskRole --policy-name MedwegTaskPolicy --policy-document "file://$env:TEMP\task-policy.json" 2>&1 | Out-Null

Write-Host "IAM roles created" -ForegroundColor Green

Write-Host ""
Write-Host "Creating ECS task definition..." -ForegroundColor Cyan

$taskDef = @'
{
  "family": "medweg-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::${AWSAccountID}:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::${AWSAccountID}:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "medweg-backend",
      "image": "$($deployConfig.backend_image)",
      "cpu": 512,
      "memory": 1024,
      "essential": true,
      "portMappings": [{"containerPort": 5000, "protocol": "tcp"}],
      "environment": [
        {"name": "NODE_ENV", "value": "production"},
        {"name": "PORT", "value": "5000"},
        {"name": "API_VERSION", "value": "v1"},
        {"name": "DB_PORT", "value": "5432"},
        {"name": "AWS_REGION", "value": "$AWSRegion"},
        {"name": "S3_BUCKET_NAME", "value": "$($infraConfig.s3_bucket)"},
        {"name": "SES_SENDER_EMAIL", "value": "noreply@medweg.de"},
        {"name": "FRONTEND_URL", "value": "http://$ALB_DNS"},
        {"name": "BACKEND_URL", "value": "http://$ALB_DNS"},
        {"name": "VAPID_SUBJECT", "value": "mailto:admin@medweg.de"},
        {"name": "EMAIL_HOST", "value": "smtp.gmail.com"},
        {"name": "EMAIL_PORT", "value": "587"},
        {"name": "EMAIL_SECURE", "value": "false"},
        {"name": "EMAIL_FROM_NAME", "value": "MEDWEG Bavaria"},
        {"name": "EMAIL_FROM_ADDRESS", "value": "$EMAIL_USER"},
        {"name": "JWT_EXPIRY", "value": "15m"},
        {"name": "JWT_REFRESH_EXPIRY", "value": "7d"},
        {"name": "DB_SSL", "value": "true"},
        {"name": "LOG_LEVEL", "value": "info"},
        {"name": "CRON_ENABLED", "value": "true"}
      ],
      "secrets": [
        {"name": "DB_HOST", "valueFrom": "arn:aws:secretsmanager:$AWSRegion:${AWSAccountID}:secret:medweg/db-host"},
        {"name": "DB_NAME", "valueFrom": "arn:aws:secretsmanager:$AWSRegion:${AWSAccountID}:secret:medweg/db-name"},
        {"name": "DB_USER", "valueFrom": "arn:aws:secretsmanager:$AWSRegion:${AWSAccountID}:secret:medweg/db-user"},
        {"name": "DB_PASSWORD", "valueFrom": "arn:aws:secretsmanager:$AWSRegion:${AWSAccountID}:secret:medweg/db-password"},
        {"name": "DB_ENCRYPTION_KEY", "valueFrom": "arn:aws:secretsmanager:$AWSRegion:${AWSAccountID}:secret:medweg/db-encryption-key"},
        {"name": "JWT_SECRET", "valueFrom": "arn:aws:secretsmanager:$AWSRegion:${AWSAccountID}:secret:medweg/jwt-secret"},
        {"name": "JWT_REFRESH_SECRET", "valueFrom": "arn:aws:secretsmanager:$AWSRegion:${AWSAccountID}:secret:medweg/jwt-refresh-secret"},
        {"name": "AWS_ACCESS_KEY_ID", "valueFrom": "arn:aws:secretsmanager:$AWSRegion:${AWSAccountID}:secret:medweg/aws-access-key-id"},
        {"name": "AWS_SECRET_ACCESS_KEY", "valueFrom": "arn:aws:secretsmanager:$AWSRegion:${AWSAccountID}:secret:medweg/aws-secret-key"},
        {"name": "VAPID_PUBLIC_KEY", "valueFrom": "arn:aws:secretsmanager:$AWSRegion:${AWSAccountID}:secret:medweg/vapid-public-key"},
        {"name": "VAPID_PRIVATE_KEY", "valueFrom": "arn:aws:secretsmanager:$AWSRegion:${AWSAccountID}:secret:medweg/vapid-private-key"},
        {"name": "EMAIL_USER", "valueFrom": "arn:aws:secretsmanager:$AWSRegion:${AWSAccountID}:secret:medweg/email-user"},
        {"name": "EMAIL_PASSWORD", "valueFrom": "arn:aws:secretsmanager:$AWSRegion:${AWSAccountID}:secret:medweg/email-password"}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/medweg-backend",
          "awslogs-region": "$AWSRegion",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    },
    {
      "name": "medweg-frontend",
      "image": "$($deployConfig.frontend_image)",
      "cpu": 512,
      "memory": 1024,
      "essential": true,
      "portMappings": [{"containerPort": 80, "protocol": "tcp"}],
      "dependsOn": [{"containerName": "medweg-backend", "condition": "HEALTHY"}],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/medweg-frontend",
          "awslogs-region": "$AWSRegion",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 30
      }
    }
  ]
}
'@

# Replace placeholders
$taskDef = $taskDef.Replace('$AWSRegion', $AWSRegion)
$taskDef = $taskDef.Replace('${AWSAccountID}', $AWSAccountID)
$taskDef = $taskDef.Replace('$($deployConfig.backend_image)', $deployConfig.backend_image)
$taskDef = $taskDef.Replace('$($deployConfig.frontend_image)', $deployConfig.frontend_image)
$taskDef = $taskDef.Replace('$($infraConfig.s3_bucket)', $infraConfig.s3_bucket)
$taskDef = $taskDef.Replace('$ALB_DNS', $ALB_DNS)
$taskDef = $taskDef.Replace('$EMAIL_USER', $EMAIL_USER)

$taskDef | Out-File -FilePath "$PSScriptRoot\task-definition-final.json" -Encoding ASCII

aws ecs register-task-definition --cli-input-json "file://$PSScriptRoot\task-definition-final.json" --region $AWSRegion | Out-Null

Write-Host "Task definition registered" -ForegroundColor Green

Write-Host ""
Write-Host "Creating ECS service..." -ForegroundColor Cyan

$serviceCmd = "aws ecs create-service " +
"--cluster $($infraConfig.ecs_cluster) " +
"--service-name medweg-service " +
"--task-definition medweg-task " +
"--desired-count 1 " +
"--launch-type FARGATE " +
"--platform-version LATEST " +
"--network-configuration 'awsvpcConfiguration={subnets=[$($infraConfig.public_subnet_1),$($infraConfig.public_subnet_2)],securityGroups=[$($infraConfig.ecs_security_group)],assignPublicIp=ENABLED}' " +
"--load-balancers 'targetGroupArn=$($infraConfig.frontend_target_group),containerName=medweg-frontend,containerPort=80' 'targetGroupArn=$($infraConfig.backend_target_group),containerName=medweg-backend,containerPort=5000' " +
"--health-check-grace-period-seconds 60 " +
"--region $AWSRegion"

Invoke-Expression $serviceCmd | Out-Null

Write-Host "ECS service created" -ForegroundColor Green

Write-Host ""
Write-Host "SUCCESS! Deployment Complete" -ForegroundColor Green
Write-Host ""
Write-Host "Your application URL: http://$ALB_DNS" -ForegroundColor Cyan
Write-Host ""
Write-Host "It will take 2-3 minutes for the service to start" -ForegroundColor Yellow
Write-Host ""
Write-Host "Monitor deployment:" -ForegroundColor Cyan
Write-Host "  aws ecs describe-services --cluster medweg-cluster --services medweg-service --region $AWSRegion" -ForegroundColor White
Write-Host ""
Write-Host "View logs:" -ForegroundColor Cyan
Write-Host "  aws logs tail /ecs/medweg-backend --follow --region $AWSRegion" -ForegroundColor White
Write-Host ""
