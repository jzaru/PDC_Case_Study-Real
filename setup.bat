@echo off
REM Setup script for Stock Trading Simulation Platform (Windows)

echo.
echo ===================================================
echo   Stock Trading Simulation - Setup Script
echo ===================================================
echo.

REM Backend setup
echo 1. Setting up Backend...
cd Backend
echo   Installing Python dependencies...
pip install -r requirements.txt

if %ERRORLEVEL% EQU 0 (
    echo   [OK] Backend dependencies installed
) else (
    echo   [ERROR] Failed to install backend dependencies
    exit /b 1
)

cd ..

REM Frontend setup
echo.
echo 2. Setting up Frontend...
cd Frontend
echo   Installing Node dependencies...
call npm install

if %ERRORLEVEL% EQU 0 (
    echo   [OK] Frontend dependencies installed
) else (
    echo   [ERROR] Failed to install frontend dependencies
    exit /b 1
)

cd ..

echo.
echo ===================================================
echo   Setup Complete!
echo ===================================================
echo.
echo Run the application:
echo.
echo Terminal 1 - Backend:
echo   cd Backend
echo   python server.py
echo.
echo Terminal 2 - Frontend:
echo   cd Frontend
echo   npm run dev
echo.
echo Then visit: http://localhost:5173
echo.
