@echo off
echo Starting Firebase Emulator Suite...
echo.
echo Emulator UI will be available at: http://127.0.0.1:4005
echo Authentication Emulator: Port 9099
echo Firestore Emulator: Port 8080
echo.
echo Press Ctrl+C to stop the emulators
echo.
firebase emulators:start --config firebase-emulator.json
