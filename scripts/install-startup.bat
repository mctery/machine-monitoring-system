@echo off
title Machine Monitoring System - Install Startup

echo ================================================
echo   Install Windows Startup Service
echo ================================================
echo.

:: Go to project root (parent of scripts folder)
cd /d "%~dp0.."

:: Check admin rights
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Please run as Administrator!
    echo Right-click and select "Run as administrator"
    pause
    exit /b 1
)

:: Check if PM2 is installed
where pm2 >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Installing PM2...
    npm install -g pm2
)

:: Install pm2-windows-startup
echo [INFO] Installing pm2-windows-startup...
npm install -g pm2-windows-startup

:: Setup PM2 startup
echo [INFO] Setting up PM2 startup service...
pm2-startup install

:: Build if needed
if not exist "dist" (
    echo [INFO] Building production...
    call npm run build
)

:: Create logs directory
if not exist "logs" mkdir logs

:: Start the app
echo [INFO] Starting application...
pm2 start ecosystem.config.cjs

:: Save PM2 process list
echo [INFO] Saving PM2 process list...
pm2 save

echo.
echo ================================================
echo   Installation Complete!
echo ================================================
echo.
echo   The application will now start automatically
echo   when Windows starts.
echo.
echo   Commands:
echo   - pm2 status          : View status
echo   - pm2 logs            : View logs
echo   - pm2 restart all     : Restart server
echo   - pm2 stop all        : Stop server
echo.
echo   URL: http://localhost:3000
echo.

pause
