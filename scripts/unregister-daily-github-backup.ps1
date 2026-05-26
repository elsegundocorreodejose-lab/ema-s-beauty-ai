# Elimina la tarea programada de respaldo diario a GitHub
$taskName = "EmaIA-GitHub-Backup-Diario"
$existing = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existing) {
  Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
  Write-Host "Tarea '$taskName' eliminada." -ForegroundColor Green
} else {
  Write-Host "No existia la tarea '$taskName'." -ForegroundColor Yellow
}
