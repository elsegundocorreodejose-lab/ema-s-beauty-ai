# Subir el estado actual a GitHub (elsegundocorreodejose-lab/ema-s-beauty-ai)
# Ejecutar en TU PC: clic derecho -> Ejecutar con PowerShell
# o: powershell -ExecutionPolicy Bypass -File scripts\push-to-github.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

$git = $null
$candidates = @(
  "C:\Program Files\Git\cmd\git.exe",
  "C:\Program Files (x86)\Git\cmd\git.exe",
  "git"
)
foreach ($c in $candidates) {
  try {
    if ($c -eq "git") {
      $v = & git --version 2>$null
    } else {
      if (-not (Test-Path $c)) { continue }
      $v = & $c --version 2>$null
    }
    if ($LASTEXITCODE -eq 0) {
      $git = if ($c -eq "git") { "git" } else { $c }
      Write-Host "Git: $v"
      break
    }
  } catch { }
}

if (-not $git) {
  Write-Host "No se encontro Git. Instala Git for Windows:" -ForegroundColor Red
  Write-Host "  https://git-scm.com/download/win"
  Write-Host "Luego vuelve a ejecutar este script."
  pause
  exit 1
}

function Invoke-Git {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Args)
  if ($git -eq "git") {
    & git @Args
  } else {
    & $git @Args
  }
  if ($LASTEXITCODE -ne 0) { throw "git $($Args -join ' ') fallo con codigo $LASTEXITCODE" }
}

Write-Host "`n=== Estado actual ===" -ForegroundColor Cyan
Invoke-Git status -sb

Write-Host "`n=== Anadiendo archivos (sin secretos ni ZIPs) ===" -ForegroundColor Cyan
Invoke-Git add `
  .gitignore `
  .env.example `
  ESTADO_PROYECTO.md `
  README.md `
  docs `
  backups/MANIFEST.json `
  backups/README.md `
  scripts `
  supabase `
  src `
  package.json `
  vite.config.ts `
  wrangler.jsonc `
  tsconfig.json `
  components.json `
  eslint.config.js `
  bunfig.toml `
  2>$null

# Archivos nuevos/modificados no listados arriba
Invoke-Git add -u

Write-Host "`n=== Commit ===" -ForegroundColor Cyan
$msg = @"
WhatsApp Twilio: recibir y responder via Supabase Edge

- Edge Functions whatsapp-webhook, whatsapp-send, twilio-secrets-check
- Panel Mensajes con envio via whatsapp-send
- Respaldo y documentacion (docs/RESPALDO, scripts/create-backup.ps1)
"@
Invoke-Git commit -m $msg

Write-Host "`n=== Push a origin main ===" -ForegroundColor Cyan
Invoke-Git push -u origin main

Write-Host "`n=== Listo ===" -ForegroundColor Green
Write-Host "Repo: https://github.com/elsegundocorreodejose-lab/ema-s-beauty-ai"
Write-Host ""
Write-Host "Opcional — etiqueta de respaldo:" -ForegroundColor Yellow
Write-Host '  git tag -a v0.1-whatsapp-mvp -m "WhatsApp entrante y saliente funcionando"'
Write-Host "  git push origin v0.1-whatsapp-mvp"
if ($Host.Name -eq "ConsoleHost") { pause }
