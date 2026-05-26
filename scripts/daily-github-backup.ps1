# Respaldo diario automatico a GitHub (solo si hay cambios en el codigo)
# Uso manual: powershell -ExecutionPolicy Bypass -File scripts\daily-github-backup.ps1
# Programado: scripts\register-daily-github-backup.ps1

param(
  [switch]$IncludeLocalZip,
  [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

$logDir = Join-Path $root "backups\logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$logFile = Join-Path $logDir ("github-backup-{0:yyyy-MM-dd}.log" -f (Get-Date))

function Write-Log {
  param([string]$Message)
  $line = "[{0:yyyy-MM-dd HH:mm:ss}] {1}" -f (Get-Date), $Message
  Add-Content -Path $logFile -Value $line -Encoding UTF8
  Write-Host $line
}

# --- Git ---
$repoToolsGit = Join-Path $root ".tools\MinGit\cmd\git.exe"
$git = $null
foreach ($c in @($repoToolsGit, "C:\Program Files\Git\cmd\git.exe", "git")) {
  try {
    if ($c -eq "git") {
      if (-not (Get-Command git -ErrorAction SilentlyContinue)) { continue }
      $null = & git --version 2>$null
    } else {
      if (-not (Test-Path $c)) { continue }
      $null = & $c --version 2>$null
    }
    if ($LASTEXITCODE -eq 0) { $git = $c; break }
  } catch { }
}

if (-not $git) {
  Write-Log "ERROR: No se encontro Git. Usa GitHub Desktop o MinGit en .tools\MinGit"
  exit 1
}

function Invoke-Git {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Args)
  if ($git -eq "git") { & git @Args } else { & $git @Args }
  if ($LASTEXITCODE -ne 0) { throw "git fallo: $($Args -join ' ') (codigo $LASTEXITCODE)" }
}

Write-Log "Inicio respaldo GitHub ($Branch)"

if ($IncludeLocalZip) {
  Write-Log "Creando ZIP local..."
  $backupScript = Join-Path $root "scripts\create-backup.ps1"
  if (Test-Path $backupScript) {
    & powershell.exe -ExecutionPolicy Bypass -File $backupScript
    Write-Log "ZIP local listo (ver backups\archives\)"
  }
}

# Respeta .gitignore (.env, node_modules, backups/local-secrets, etc.)
Invoke-Git add -A

if ($git -eq "git") { $status = git status --porcelain } else { $status = & $git status --porcelain }
if (-not $status) {
  Write-Log "Sin cambios. No se hace commit ni push."
  exit 0
}

$date = Get-Date -Format "yyyy-MM-dd HH:mm"
$msg = "chore: backup automatico $date"
Invoke-Git commit -m $msg
Write-Log "Commit creado: $msg"

Invoke-Git push origin $Branch
Write-Log "Push OK -> https://github.com/elsegundocorreodejose-lab/ema-s-beauty-ai"
Write-Log "Fin"
