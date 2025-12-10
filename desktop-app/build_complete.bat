@echo off
echo ============================================
echo    AI Forge Studio - Complete Build Script
echo ============================================
echo.

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed!
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

:: Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo [1/5] Installing Python dependencies...
cd backend
python -m pip install pyinstaller fastapi uvicorn pydantic python-dotenv pynvml --quiet
if errorlevel 1 (
    echo [ERROR] Failed to install Python dependencies
    pause
    exit /b 1
)

echo [2/5] Creating Backend executable...
pyinstaller --onefile --noconsole --name backend_server ^
    --hidden-import=uvicorn.logging ^
    --hidden-import=uvicorn.protocols ^
    --hidden-import=uvicorn.protocols.http ^
    --hidden-import=uvicorn.protocols.http.auto ^
    --hidden-import=uvicorn.protocols.websockets ^
    --hidden-import=uvicorn.protocols.websockets.auto ^
    --hidden-import=uvicorn.lifespan ^
    --hidden-import=uvicorn.lifespan.on ^
    --add-data "gpu_monitor.py;." ^
    --add-data "benchmarks.py;." ^
    --add-data "inference.py;." ^
    server.py

if errorlevel 1 (
    echo [ERROR] Failed to create backend executable
    pause
    exit /b 1
)

:: Copy backend.exe to main folder
copy /Y dist\backend_server.exe ..\ >nul
cd ..

echo [3/5] Installing Node.js dependencies...
call npm install --silent
if errorlevel 1 (
    echo [ERROR] Failed to install Node.js dependencies
    pause
    exit /b 1
)

echo [4/5] Building Electron application...
call npm run build:win
if errorlevel 1 (
    echo [ERROR] Failed to build Electron app
    pause
    exit /b 1
)

echo [5/5] Build complete!
echo.
echo ============================================
echo    BUILD SUCCESSFUL!
echo ============================================
echo.
echo Your application is ready in the 'dist' folder:
echo   - AI Forge Studio-2.0.0-x64.exe (Installer)
echo   - AI Forge Studio-2.0.0-x64-portable.exe (Portable)
echo.
echo You can now run the application with a single click!
echo.
pause
