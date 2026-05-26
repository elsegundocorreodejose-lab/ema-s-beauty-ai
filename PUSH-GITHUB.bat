@echo off
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "%~dp0scripts\push-to-github.ps1"
pause
