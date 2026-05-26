# Setup local Twilio webhook: npm install, dev server, HTTPS tunnel, .env hints
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$NodeDir = Join-Path $Root ".tools\node-v22.14.0-win-x64"
if (Test-Path (Join-Path $NodeDir "node.exe")) {
  $env:PATH = "$NodeDir;$NodeDir\node_modules\npm\bin;" + $env:PATH
}

function Read-DotEnvValue($name) {
  $envFile = Join-Path $Root ".env"
  if (-not (Test-Path $envFile)) { return $null }
  foreach ($line in Get-Content $envFile) {
    if ($line -match "^\s*$name\s*=\s*(.+)\s*$") {
      return $Matches[1].Trim().Trim('"').Trim("'")
    }
  }
  return $null
}

function Set-DotEnvValue($name, $value) {
  $envFile = Join-Path $Root ".env"
  $lines = if (Test-Path $envFile) { Get-Content $envFile } else { @() }
  $pattern = "^\s*$([regex]::Escape($name))\s*="
  $newLine = "$name=$value"
  $found = $false
  $out = foreach ($line in $lines) {
    if ($line -match $pattern) {
      $found = $true
      $newLine
    } else { $line }
  }
  if (-not $found) { $out += $newLine }
  $out | Set-Content $envFile -Encoding utf8
}

Write-Host "== Ema IA — Twilio dev setup ==" -ForegroundColor Cyan

$required = @(
  "SUPABASE_SERVICE_ROLE_KEY",
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_WHATSAPP_FROM"
)
$missing = @()
foreach ($k in $required) {
  $v = Read-DotEnvValue $k
  if (-not $v -or $v -match "^(tu_|ACx|REEMPLAZA)") { $missing += $k }
}
if ($missing.Count -gt 0) {
  Write-Host ""
  Write-Host "Faltan en .env (rellena y vuelve a ejecutar):" -ForegroundColor Yellow
  $missing | ForEach-Object { Write-Host "  - $_" }
  Write-Host ""
  Write-Host "Supabase service_role: Dashboard -> Settings -> API" -ForegroundColor Gray
  Write-Host "Twilio: console.twilio.com -> Account Info + WhatsApp Sandbox" -ForegroundColor Gray
  exit 1
}

Write-Host "npm install..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$port = 8082
# Si 8082 no responde, prueba 8081 u 8080
foreach ($p in 8082, 8081, 8080) {
  try {
    Invoke-WebRequest -Uri "http://localhost:$p" -UseBasicParsing -TimeoutSec 2 | Out-Null
    $port = $p
    break
  } catch { }
}
$devLog = Join-Path $Root ".tools\dev-server.log"
if (-not (Test-Path (Join-Path $Root ".tools"))) { New-Item -ItemType Directory -Path (Join-Path $Root ".tools") | Out-Null }

$devRunning = $false
try {
  $r = Invoke-WebRequest -Uri "http://localhost:$port" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
  $devRunning = $true
} catch { }

if (-not $devRunning) {
  Write-Host "Iniciando npm run dev en puerto $port (segundo plano)..." -ForegroundColor Cyan
  $devJob = Start-Process -FilePath "npm" -ArgumentList "run","dev" -WorkingDirectory $Root -PassThru -WindowStyle Hidden -RedirectStandardOutput $devLog -RedirectStandardError $devLog
  Start-Sleep -Seconds 8
  for ($i = 0; $i -lt 30; $i++) {
    try {
      Invoke-WebRequest -Uri "http://localhost:$port" -UseBasicParsing -TimeoutSec 2 | Out-Null
      $devRunning = $true
      break
    } catch { Start-Sleep -Seconds 2 }
  }
  if (-not $devRunning) {
    Write-Host "No responde http://localhost:$port — revisa $devLog" -ForegroundColor Red
    exit 1
  }
  Write-Host "Dev server OK en http://localhost:$port" -ForegroundColor Green
} else {
  Write-Host "Dev server ya activo en http://localhost:$port" -ForegroundColor Green
}

# HTTPS tunnel
$tunnelUrl = $null
$cf = Get-Command cloudflared -ErrorAction SilentlyContinue
$cfPath = Join-Path $Root ".tools\cloudflared.exe"
if ((Get-Command cloudflared -ErrorAction SilentlyContinue) -or (Test-Path $cfPath)) {
  $cfExe = if (Test-Path $cfPath) { $cfPath } else { "cloudflared" }
  Write-Host "Iniciando cloudflared tunnel..." -ForegroundColor Cyan
  $tunnelLog = Join-Path $Root ".tools\cloudflared.log"
  if (Test-Path $tunnelLog) { Remove-Item $tunnelLog -Force }
  Start-Process -FilePath $cfExe -ArgumentList "tunnel","--url","http://localhost:$port" -WorkingDirectory $Root -WindowStyle Hidden -RedirectStandardOutput $tunnelLog -RedirectStandardError $tunnelLog | Out-Null
  for ($i = 0; $i -lt 45; $i++) {
    Start-Sleep -Seconds 1
    if (Test-Path $tunnelLog) {
      $log = Get-Content $tunnelLog -Raw -ErrorAction SilentlyContinue
      if ($log -match "(https://[a-z0-9-]+\.trycloudflare\.com)") {
        $tunnelUrl = $Matches[1]
        break
      }
    }
  }
}

if (-not $tunnelUrl) {
  Write-Host "Iniciando localtunnel (npx)..." -ForegroundColor Cyan
  $ltLog = Join-Path $Root ".tools\localtunnel.log"
  if (Test-Path $ltLog) { Remove-Item $ltLog -Force }
  Start-Process -FilePath "npx" -ArgumentList "--yes","localtunnel","--port",$port -WorkingDirectory $Root -WindowStyle Hidden -RedirectStandardOutput $ltLog -RedirectStandardError $ltLog | Out-Null
  for ($i = 0; $i -lt 45; $i++) {
    Start-Sleep -Seconds 1
    if (Test-Path $ltLog) {
      $log = Get-Content $ltLog -Raw -ErrorAction SilentlyContinue
      if ($log -match "(https://[a-z0-9-]+\.loca\.lt)") {
        $tunnelUrl = $Matches[1]
        break
      }
    }
  }
}

if ($tunnelUrl) {
  Set-DotEnvValue "PUBLIC_APP_URL" $tunnelUrl
  Write-Host "PUBLIC_APP_URL = $tunnelUrl" -ForegroundColor Green
} else {
  Write-Host "cloudflared no encontrado o sin URL — instala: winget install Cloudflare.cloudflared" -ForegroundColor Yellow
  Write-Host "Mientras tanto usa ngrok o pon PUBLIC_APP_URL manualmente en .env" -ForegroundColor Yellow
  $tunnelUrl = Read-DotEnvValue "PUBLIC_APP_URL"
}

$webhook = if ($tunnelUrl) { "$tunnelUrl/api/webhooks/twilio" } else { "http://localhost:$port/api/webhooks/twilio" }

Write-Host ""
Write-Host "=== Configura Twilio Console ===" -ForegroundColor Cyan
Write-Host "Messaging -> Try it out -> WhatsApp Sandbox"
Write-Host "When a message comes in: POST"
Write-Host "URL: $webhook"
Write-Host ""
Write-Host "Desde tu WhatsApp envia el mensaje join que muestra Twilio al numero sandbox."
Write-Host ""
Write-Host "Reinicia npm run dev si cambiaste .env (Ctrl+C y npm run dev)." -ForegroundColor Gray
