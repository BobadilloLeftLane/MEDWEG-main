param(
    [string]$AWSRegion = "eu-central-1"
)

Write-Host "Fixing task definition with correct secret ARNs..." -ForegroundColor Cyan

# Get all secrets
$secrets = aws secretsmanager list-secrets --region $AWSRegion | ConvertFrom-Json

# Create ARN map
$secretArns = @{}
foreach ($secret in $secrets.SecretList) {
    $secretArns[$secret.Name] = $secret.ARN
}

# Load configs
$infraConfig = Get-Content "$PSScriptRoot\infrastructure-config.json" | ConvertFrom-Json
$deployConfig = Get-Content "deployment-config.json" | ConvertFrom-Json

$AWSAccountID = $infraConfig.aws_account_id
$ALB_DNS = $infraConfig.alb_dns

# Read the task definition file
$taskDefPath = "$PSScriptRoot\task-definition-final.json"
$taskDef = Get-Content $taskDefPath -Raw | ConvertFrom-Json

# Update secret ARNs in the backend container
foreach ($container in $taskDef.containerDefinitions) {
    if ($container.name -eq "medweg-backend" -and $container.secrets) {
        foreach ($secret in $container.secrets) {
            $secretName = $secret.name
            $lookupName = "medweg/" + $secretName.ToLower().Replace("_", "-")

            if ($secretArns.ContainsKey($lookupName)) {
                $secret.valueFrom = $secretArns[$lookupName]
                Write-Host "Updated $secretName to $($secretArns[$lookupName])" -ForegroundColor Green
            }
        }
    }
}

# Save updated task definition
$taskDef | ConvertTo-Json -Depth 10 | Out-File -FilePath $taskDefPath -Encoding ASCII

Write-Host ""
Write-Host "Registering updated task definition..." -ForegroundColor Cyan
aws ecs register-task-definition --cli-input-json "file://$taskDefPath" --region $AWSRegion | Out-Null

Write-Host "Task definition updated" -ForegroundColor Green

Write-Host ""
Write-Host "Updating ECS service..." -ForegroundColor Cyan
aws ecs update-service --cluster medweg-cluster --service medweg-service --task-definition medweg-task --force-new-deployment --region $AWSRegion | Out-Null

Write-Host "Service updated - new tasks will start with correct secrets" -ForegroundColor Green
Write-Host ""
Write-Host "Wait 2-3 minutes, then check: http://$ALB_DNS" -ForegroundColor Cyan
