@echo off
echo Cleaning up existing processes...
taskkill /F /IM java.exe 2>nul
timeout /t 2 >nul

echo Starting Cyclesync Backend...
bal run

pause