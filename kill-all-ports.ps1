# Kill processes using Firebase emulator ports
$ports = @(4000, 4001, 4002, 5001, 5002, 8080, 8081, 8082, 8085, 8090, 8088, 8089, 9000, 9099, 9199, 9200, 9299, 4400, 4401, 4500, 4501, 5000, 5010, 5011, 5012)

foreach ($port in $ports) {
    $processId = (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue).OwningProcess
    
    if ($processId) {
        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "Killing process $($process.ProcessName) (PID: $processId) using port $port"
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        }
    }
}

# Also kill any remaining node processes that might be running the emulators
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
foreach ($process in $nodeProcesses) {
    Write-Host "Killing Node.js process (PID: $($process.Id))"
    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
}

Write-Host "Port cleanup complete!"
