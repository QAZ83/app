@echo off
echo Starting AI Forge Studio...
echo.

:: Start backend in background
start /B "" backend_server.exe

:: Wait for backend to start
timeout /t 2 /nobreak >nul

:: Start Electron app
start "" "AI Forge Studio.exe"
