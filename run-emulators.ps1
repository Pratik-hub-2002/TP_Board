# Stop any running emulator processes
Write-Host "[1/3] Stopping any running emulator processes..."
Stop-Process -Name "node" -ErrorAction SilentlyContinue | Out-Null

# Kill processes on common Firebase emulator ports
$ports = @(4000, 8080, 5001, 8085, 9099, 9199, 14000, 18080, 19099, 19199, 14400, 14500)
foreach ($port in $ports) {
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($process) {
        $process | ForEach-Object {
            $processId = $_.OwningProcess
            $processName = (Get-Process -Id $processId -ErrorAction SilentlyContinue).ProcessName
            Write-Host "Stopping process $processId ($processName) on port $port"
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        }
    }
}

# Start the Firebase emulators
Write-Host "`n[2/3] Starting Firebase emulators..."
$env:FIRESTORE_EMULATOR_HOST = "localhost:18080"
$env:FIREBASE_AUTH_EMULATOR_HOST = "localhost:19099"
$env:FIREBASE_STORAGE_EMULATOR_HOST = "localhost:19199"

# Start the emulators
$firebaseCmd = "firebase emulators:start --import=./emulator-data --export-on-exit --project=tp-board-6331b --only auth,firestore,storage"
Write-Host "Running: $firebaseCmd"

# Execute the command directly instead of using Start-Process
Invoke-Expression $firebaseCmd

# Check the last exit code
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[3/3] ERROR: Failed to start emulators (Exit code: $LASTEXITCODE)" -ForegroundColor Red
    Write-Host "`nTroubleshooting steps:" -ForegroundColor Yellow
    Write-Host "1. Make sure you're in the project directory"
    Write-Host "2. Check if ports 14000 (UI), 18080 (Firestore), 19099 (Auth), 19199 (Storage) are in use"
    Write-Host "3. Try running 'npm run emulators:stop' first"
    Write-Host "4. Check if Firebase CLI is installed (run: firebase --version)"
    exit 1
}
