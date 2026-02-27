Set-Location $PSScriptRoot

param(
    [Parameter(Mandatory = $true)]
    [string]$InputFile,
    [string]$DbUser = "ems",
    [string]$DbName = "ems",
    [string]$Service = "postgres"
)

if (-not (Test-Path $InputFile)) {
    throw "Backup file not found: $InputFile"
}

Write-Host "Ensuring Docker service '$Service' is running..."
docker compose up -d $Service | Out-Null
if ($LASTEXITCODE -ne 0) {
    throw "Failed to start docker compose service '$Service'."
}

Write-Host "Resetting schema for database '$DbName'..."
docker compose exec -T $Service psql -U $DbUser -d $DbName -c "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;"
if ($LASTEXITCODE -ne 0) {
    throw "Failed to reset schema before restore."
}

Write-Host "Restoring backup from: $InputFile"
Get-Content -Raw -Path $InputFile | docker compose exec -T $Service psql -U $DbUser -d $DbName
if ($LASTEXITCODE -ne 0) {
    throw "Restore failed."
}

Write-Host "Restore completed successfully."
