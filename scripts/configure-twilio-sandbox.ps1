# Actualiza el webhook del WhatsApp Sandbox en Twilio (lee credenciales de .env)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

function Read-DotEnvValue($name) {
  $envFile = Join-Path $Root ".env"
  foreach ($line in Get-Content $envFile) {
    if ($line -match "^\s*$name\s*=\s*(.+)\s*$") {
      return $Matches[1].Trim().Trim('"').Trim("'")
    }
  }
  return $null
}

$sid = Read-DotEnvValue "TWILIO_ACCOUNT_SID"
$token = Read-DotEnvValue "TWILIO_AUTH_TOKEN"
$supabaseUrl = Read-DotEnvValue "SUPABASE_URL"
if (-not $supabaseUrl) { $supabaseUrl = Read-DotEnvValue "VITE_SUPABASE_URL" }
if (-not $sid -or $sid -match "REEMPLAZA") { throw "Falta TWILIO_ACCOUNT_SID en .env" }
if (-not $token -or $token -match "REEMPLAZA") { throw "Falta TWILIO_AUTH_TOKEN en .env" }

# Preferir Edge Function (HTTPS fijo en Supabase)
if ($supabaseUrl) {
  $webhookUrl = "$($supabaseUrl.TrimEnd('/'))/functions/v1/whatsapp-webhook"
} else {
  $publicUrl = Read-DotEnvValue "PUBLIC_APP_URL"
  if (-not $publicUrl -or $publicUrl -notmatch "^https://") {
    throw "Define SUPABASE_URL o PUBLIC_APP_URL HTTPS en .env"
  }
  $webhookUrl = "$($publicUrl.TrimEnd('/'))/api/webhooks/twilio"
}
$pair = "${sid}:${token}"
$bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
$basic = [Convert]::ToBase64String($bytes)
$headers = @{ Authorization = "Basic $basic" }

# Sandbox incoming message URL (Messaging API)
$body = @{
  WebhookUrl = $webhookUrl
  WebhookMethod = "POST"
}
$uri = "https://messaging.twilio.com/v1/Configuration/Webhooks"

Write-Host "Configurando sandbox webhook -> $webhookUrl" -ForegroundColor Cyan
try {
  $resp = Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body $body
  Write-Host "OK. Twilio sandbox apunta a:" $webhookUrl -ForegroundColor Green
} catch {
  Write-Host "API fallo. Configura manualmente en Twilio Console:" -ForegroundColor Yellow
  Write-Host "  POST $webhookUrl"
  Write-Host $_.Exception.Message
  exit 1
}
