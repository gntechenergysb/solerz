param(
  [Parameter(Mandatory = $true)]
  [string]$PostgresUrl,

  [string]$OutDir = "./backups"
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command pg_dump -ErrorAction SilentlyContinue)) {
  Write-Error "pg_dump not found. Install PostgreSQL client tools and ensure pg_dump is in PATH."
}

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$ts = Get-Date -Format "yyyyMMdd-HHmmss"
$backupFile = Join-Path $OutDir "solerz.$ts.dump"

Write-Host "Writing DB backup to: $backupFile"

pg_dump --format=custom --no-owner --no-privileges --file "$backupFile" "$PostgresUrl"

Write-Host "Done."
