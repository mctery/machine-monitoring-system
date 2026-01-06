@echo off
title Machine Monitoring System - Stop

echo ================================================
echo   Machine Monitoring System - Stopping...
echo ================================================

:: Go to project root (parent of scripts folder)
cd /d "%~dp0.."

pm2 stop machine-monitoring
pm2 delete machine-monitoring

echo.
echo [INFO] Server stopped successfully!
echo.

pause
