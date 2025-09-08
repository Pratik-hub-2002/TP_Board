# Simple script to test Firebase emulator startup

# Kill any existing emulator processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | 
    Where-Object { $_.CommandLine -like "*firebase*emulators*" } | 
    Stop-Process -Force -ErrorAction SilentlyContinue

# Create a basic config
$config = @{
    "firestore" = @{
        "rules" = "firestore.rules"
        "indexes" = "firestore.indexes.json"
    }
    "storage" = @{
        "rules" = "storage.rules"
    }
    "emulators" = @{
        "auth" = @{
            "port" = 9099
            "host" = "127.0.0.1"
        }
        "firestore" = @{
            "port" = 8080
            "host" = "127.0.0.1"
        }
        "storage" = @{
            "port" = 9199
            "host" = "127.0.0.1"
        }
        "ui" = @{
            "enabled" = $true
            "port" = 4000
            "host" = "127.0.0.1"
        }
    }
}

# Save config
$configPath = "./firebase-test.json"
$config | ConvertTo-Json -Depth 10 | Out-File -FilePath $configPath -Encoding utf8

Write-Host "Starting Firebase emulators with config:"
Get-Content $configPath | Write-Host

# Start emulators
try {
    npx firebase emulators:start --import=./emulator-data --export-on-exit --project=tp-board-6331b --only auth,firestore,storage --config $configPath
}
finally {
    # Clean up
    if (Test-Path $configPath) {
        Remove-Item $configPath -ErrorAction SilentlyContinue
    }
}
