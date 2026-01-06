@echo off
title Machine Monitoring System - Production

echo ================================================
echo   Machine Monitoring System - Starting...
echo ================================================

:: Go to project root (parent of scripts folder)
cd /d "%~dp0.."

:: Check if node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    pause
    exit /b 1
)

:: Check if PM2 is installed
where pm2 >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Installing PM2...
    npm install -g pm2
)

:: Create logs directory if not exists
if not exist "logs" mkdir logs

:: Check if dist folder exists
if not exist "dist" (
    echo [INFO] Building production...
    call npm run build
)

:: Start with PM2
echo [INFO] Starting PM2...
pm2 start ecosystem.config.cjs

echo.
echo ================================================
echo   Server started successfully!
echo   URL: http://localhost:3000
echo ================================================
echo.
echo [INFO] Use 'pm2 logs' to view logs
echo [INFO] Use 'pm2 stop machine-monitoring' to stop
echo [INFO] Use 'pm2 restart machine-monitoring' to restart
echo.

:: Keep window open
pause
