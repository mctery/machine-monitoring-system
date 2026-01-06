@echo off
:: This script runs silently on Windows startup
:: No window will be shown

:: Go to project root (parent of scripts folder)
cd /d "%~dp0.."

:: Start PM2 with the ecosystem config
pm2 start ecosystem.config.cjs --silent

:: Save PM2 process list (for auto-resurrection)
pm2 save --silent
