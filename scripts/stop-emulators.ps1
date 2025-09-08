# Stop Firebase emulators
Write-Host "Stopping Firebase emulators..."
$processes = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*firebase*emulators*" }

if ($processes) {
    $processes | ForEach-Object {
        Write-Host "Stopping process ID: $($_.Id)"
        Stop-Process -Id $_.Id -Force
    }
    Write-Host "Firebase emulators stopped."
} else {
    Write-Host "No Firebase emulator processes found."
}

# Clear emulator data
if (Test-Path "./emulator-data") {
    Write-Host "Clearing emulator data..."
    Remove-Item -Recurse -Force "./emulator-data"
    Write-Host "Emulator data cleared."
}

Write-Host "Done."
