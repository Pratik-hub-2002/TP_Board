@echo off
echo Stopping any running emulator processes...
taskkill /F /IM node.exe >nul 2>&1

echo Starting Firebase emulators...
firebase emulators:start --import=./emulator-data --export-on-exit --project=tp-board-6331b --only auth,firestore,storage

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ============================================
    echo ERROR: Failed to start emulators
    echo ============================================
    echo 1. Make sure you're in the project directory
    echo 2. Try running 'npm run emulators:stop' first
    echo 3. Check if ports 14000, 18080, 19099, 19199 are in use
    echo ============================================
    pause
)
