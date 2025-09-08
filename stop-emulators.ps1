# Stop any running Firebase emulator processes
Write-Host "Stopping any running Firebase emulator processes..."
Get-Process -Name "node" -ErrorAction SilentlyContinue | 
    Where-Object { $_.CommandLine -like "*firebase*emulators*" } | 
    Stop-Process -Force -ErrorAction SilentlyContinue

# Kill processes on common Firebase emulator ports
$ports = @(4000, 8080, 8085, 5001, 9099, 9199, 4400, 4500, 14000, 18080, 19099, 19199, 14400, 14500)

foreach ($port in $ports) {
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($process) {
        $process | ForEach-Object {
            $processId = $_.OwningProcess
            $processName = (Get-Process -Id $processId -ErrorAction SilentlyContinue).ProcessName
            Write-Host "Killing process $processId ($processName) on port $port"
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        }
    }
}

Write-Host "All Firebase emulator processes have been stopped."
Write-Host "You can now start the emulators using: npm run emulators:start"
