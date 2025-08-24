$envFile = ".env.prod"
$secretID = "evercent-budget/secrets-l7w7z7"

Write-Host " ??  Syncing environment variables from '${envFile}' to AWS Secrets Manager secret '${secretID}'..."

# Get current secret from Secrets Manager (default to empty object if not found)
try {
    $currentSecretJson = aws secretsmanager get-secret-value --secret-id $secretID | ConvertFrom-Json
    $currentSecret = $currentSecretJson.SecretString | ConvertFrom-Json
}
catch {
    Write-Host " ??  Secret not found or empty. Starting with a new one."
    $currentSecret = @{}
}

# Read and parse the .env file
$envVars = @{}

Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -match '^\s*#' -or [string]::IsNullOrWhiteSpace($line)) { return }

    $parts = $line -split '=', 2
    if ($parts.Count -ne 2) { return }

    $key = $parts[0].Trim()
    $value = $parts[1].Trim().Trim('"')  # Remove surrounding quotes if present
    if (-not $key -or -not $value) { return }

    $envVars[$key] = $value
}

# Merge missing or changed keys
$updated = $false

foreach ($key in $envVars.Keys) {
    $newValue = $envVars[$key]
    if ($currentSecret.PSObject.Properties.Name -notcontains $key) {
        Write-Host " ?  Adding $key..."
        $currentSecret | Add-Member -NotePropertyName $key -NotePropertyValue $newValue -Force
        $updated = $true
    } elseif ($currentSecret.$key -ne $newValue) {
        Write-Host " ??  Updating $key..."
        $currentSecret | Add-Member -NotePropertyName $key -NotePropertyValue $newValue -Force
        $updated = $true
    }
}

if ($updated) {
    $updatedSecretJson = $currentSecret | ConvertTo-Json -Depth 100 -Compress
    Write-Host " ??  Updating secret in AWS..."
    aws secretsmanager update-secret `
        --secret-id $secretID `
        --secret-string "$updatedSecretJson" | Out-Null
    Write-Host " ?  Secret updated successfully."
}
else {
    Write-Host " ?  No changes needed. Secret is up-to-date."
}
