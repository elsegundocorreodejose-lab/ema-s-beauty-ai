$ErrorActionPreference = "Stop"
$root = "C:\Users\Jofi\Documents\ema-s-beauty-ai"
$git = Join-Path $root ".tools\MinGit\cmd\git.exe"
Set-Location $root

& $git add -A
& $git commit -m "chore: backup completo 2026-05-30 - modulo maternidad y manifest"
& $git push origin main
& $git tag -a "v0.3-backup-2026-05-30" -m "Backup completo local + GitHub 2026-05-30"
& $git push origin "v0.3-backup-2026-05-30"

Write-Host "OK Git push and tag complete"
