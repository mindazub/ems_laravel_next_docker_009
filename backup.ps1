Set-Location $PSScriptRoot

param(
    [string]$OutputFile,
    [string]$DbUser = "ems",
    [string]$DbName = "ems",
    [string]$Service = "postgres"
)

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$defaultDir = Join-Path $PSScriptRoot "backups"
if (-not (Test-Path $defaultDir)) {
    New-Item -ItemType Directory -Path $defaultDir | Out-Null
}

if (-not $OutputFile) {
    $OutputFile = Join-Path $defaultDir "ems_backup_$timestamp.sql"
}

Write-Host "Ensuring Docker service '$Service' is running..."
docker compose up -d $Service | Out-Null
if ($LASTEXITCODE -ne 0) {
    throw "Failed to start docker compose service '$Service'."
}

Write-Host "Creating backup: $OutputFile"
$dump = docker compose exec -T $Service pg_dump -U $DbUser $DbName
if ($LASTEXITCODE -ne 0) {
    throw "pg_dump failed."
}

$dump | Out-File -FilePath $OutputFile -Encoding utf8
Write-Host "Backup completed successfully: $OutputFile"
