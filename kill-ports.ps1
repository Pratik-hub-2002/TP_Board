# Kill processes using common Firebase emulator ports
$ports = @(8080, 9099, 4000, 5001, 9199, 8085, 4400, 4500, 4100, 4101, 8181, 8182, 9200, 9299, 9300)

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

Write-Host "Port cleanup complete!"
