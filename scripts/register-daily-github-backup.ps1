# Registra tarea de Windows: respaldo diario a GitHub
# Ejecutar como administrador NO es obligatorio; ejecuta con TU usuario (para usar credenciales de GitHub Desktop).
# Uso: powershell -ExecutionPolicy Bypass -File scripts\register-daily-github-backup.ps1
#      powershell -ExecutionPolicy Bypass -File scripts\register-daily-github-backup.ps1 -Hour 21 -Minute 30

param(
  [int]$Hour = 20,
  [int]$Minute = 0,
  [switch]$IncludeLocalZip
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$taskName = "EmaIA-GitHub-Backup-Diario"
$scriptPath = Join-Path $root "scripts\daily-github-backup.ps1"
$args = "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$scriptPath`""
if ($IncludeLocalZip) { $args += " -IncludeLocalZip" }

$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $args -WorkingDirectory $root
$trigger = New-ScheduledTaskTrigger -Daily -At ([DateTime]::Today.AddHours($Hour).AddMinutes($Minute))
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

$existing = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existing) {
  Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description "Respaldo diario del proyecto Ema IA a GitHub (commit+push si hay cambios)" | Out-Null

Write-Host ""
Write-Host "Tarea programada: $taskName" -ForegroundColor Green
Write-Host "  Hora: cada dia a las $($Hour.ToString('00')):$($Minute.ToString('00'))"
Write-Host "  Script: $scriptPath"
Write-Host "  ZIP local: $(if ($IncludeLocalZip) { 'si' } else { 'no (solo GitHub)' })"
Write-Host ""
Write-Host "Requisitos:" -ForegroundColor Yellow
Write-Host "  - PC encendido a esa hora (o arranca despues con StartWhenAvailable)"
Write-Host "  - Sesion iniciada al menos una vez (credenciales GitHub / Git Credential Manager)"
Write-Host "  - Abre GitHub Desktop y haz un Push manual la primera vez si nunca subiste"
Write-Host ""
Write-Host "Probar ahora:" -ForegroundColor Cyan
Write-Host "  powershell -ExecutionPolicy Bypass -File scripts\daily-github-backup.ps1"
Write-Host ""
Write-Host "Quitar tarea:" -ForegroundColor Gray
Write-Host "  powershell -ExecutionPolicy Bypass -File scripts\unregister-daily-github-backup.ps1"
