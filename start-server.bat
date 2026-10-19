@echo off
cd /d "%~dp0"
title May Chu Dep Nam Tuyet Nhung - Cong 8080

where node >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Khoi dong bang Node.js tren cong 8080...
    start "" "http://localhost:8080"
    node server.js
    goto :end
)

where python >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Khoi dong bang Python tren cong 8080...
    start "" "http://localhost:8080"
    python -m http.server 8080
    goto :end
)

echo [OK] Khoi dong bang Windows PowerShell tren cong 8080...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"

:end
pause
