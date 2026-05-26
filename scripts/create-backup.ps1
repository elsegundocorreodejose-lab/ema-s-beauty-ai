# Respaldo local del proyecto Ema IA (código + .env privado + ZIP)
# Uso: powershell -ExecutionPolicy Bypass -File scripts/create-backup.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$date = Get-Date -Format "yyyy-MM-dd"
$time = Get-Date -Format "HHmmss"
$archiveDir = Join-Path $root "backups\archives"
$secretsDir = Join-Path $root "backups\local-secrets"

New-Item -ItemType Directory -Force -Path $archiveDir, $secretsDir | Out-Null

# Copia .env (secretos — no va a Git)
$envFile = Join-Path $root ".env"
if (Test-Path $envFile) {
  $envBackup = Join-Path $secretsDir ".env.backup-$date"
  Copy-Item $envFile $envBackup -Force
  Write-Host "OK Copiado .env -> $envBackup"
} else {
  Write-Warning "No hay .env en la raíz del proyecto."
}

# ZIP del código (sin node_modules ni artefactos pesados)
$zipName = "ema-s-beauty-ai-$date-$time.zip"
$zipPath = Join-Path $archiveDir $zipName
$staging = Join-Path $env:TEMP "ema-backup-staging-$time"
if (Test-Path $staging) { Remove-Item $staging -Recurse -Force }
New-Item -ItemType Directory -Force -Path $staging | Out-Null

$excludeDirs = @(
  "node_modules", ".tools", "dist", ".output", ".vinxi", ".tanstack",
  ".nitro", ".wrangler", "backups\archives"
)
$excludeFiles = @("*.zip", "MinGit.zip", "gh.zip", "dev-server.log")

Get-ChildItem $root -Force | Where-Object {
  $name = $_.Name
  if ($name -eq "backups") {
    # Solo manifest y docs de backup, no ZIPs enormes ni secretos duplicados
    return $true
  }
  $name -notin $excludeDirs
} | ForEach-Object {
  if ($_.PSIsContainer -and $_.Name -in $excludeDirs) { return }
  $dest = Join-Path $staging $_.Name
  if ($_.Name -eq "backups") {
    New-Item -ItemType Directory -Force -Path $dest | Out-Null
    Copy-Item (Join-Path $root "backups\MANIFEST.json") $dest -ErrorAction SilentlyContinue
    Copy-Item (Join-Path $root "backups\README.md") $dest -ErrorAction SilentlyContinue
    return
  }
  Copy-Item $_.FullName $dest -Recurse -Force
}

# Quitar carpetas pesadas si se copiaron por error
foreach ($d in $excludeDirs) {
  $p = Join-Path $staging $d
  if (Test-Path $p) { Remove-Item $p -Recurse -Force }
}

if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($staging, $zipPath)
Remove-Item $staging -Recurse -Force

Write-Host ""
Write-Host "=== Respaldo completado ===" -ForegroundColor Green
Write-Host "ZIP:  $zipPath"
Write-Host "Docs: $root\docs\RESPALDO-2026-05-26.md"
Write-Host "      $root\docs\CHECKLIST-BACKUP-GITHUB.md"
Write-Host ""
Write-Host "Guarda tambien en la nube:" -ForegroundColor Yellow
Write-Host "  - Twilio Auth Token (Consola)"
Write-Host "  - Supabase service_role (Dashboard -> API)"
Write-Host "  - Copia del ZIP en OneDrive/Google Drive"
