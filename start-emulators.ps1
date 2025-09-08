# Kill any existing Firebase emulator processes
Get-Process -Name "node" | Where-Object { $_.CommandLine -like "*firebase*emulators*" } | Stop-Process -Force -ErrorAction SilentlyContinue

# Function to find an available port starting from a given port
function Get-AvailablePort {
    param (
        [int]$startPort,
        [int]$maxAttempts = 10
    )
    
    for ($i = 0; $i -lt $maxAttempts; $i++) {
        $port = $startPort + $i
        
        try {
            $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)
            $listener.Start()
            $listener.Stop()
            return $port
        }
        catch {
            Write-Host "Port $port is in use, trying next port..."
        }
    }
    
    throw "Could not find an available port after $maxAttempts attempts"
}

# Find available ports
$ports = @{
    ui = Get-AvailablePort -startPort 4100
    auth = Get-AvailablePort -startPort 9199
    firestore = Get-AvailablePort -startPort 8181
    storage = Get-AvailablePort -startPort 9299
    hub = Get-AvailablePort -startPort 4400
    logging = Get-AvailablePort -startPort 4500
}

# Create a temporary firebase.json with the available ports
$tempConfig = @{
    "firestore" = @{
        "rules" = "firestore.rules"
        "indexes" = "firestore.indexes.json"
    }
    "storage" = @{
        "rules" = "storage.rules"
    }
    "emulators" = @{
        "auth" = @{
            "port" = $ports.auth
            "host" = "127.0.0.1"
        }
        "firestore" = @{
            "port" = $ports.firestore
            "host" = "127.0.0.1"
        }
        "storage" = @{
            "port" = $ports.storage
            "host" = "127.0.0.1"
        }
        "ui" = @{
            "enabled" = $true
            "port" = $ports.ui
            "host" = "127.0.0.1"
        }
        "hub" = @{
            "port" = $ports.hub
            "host" = "127.0.0.1"
        }
        "logging" = @{
            "port" = $ports.logging
            "host" = "127.0.0.1"
        }
        "singleProjectMode" = $true
    }
}

# Save the temporary config
$tempConfigPath = "./firebase-temp.json"
$tempConfig | ConvertTo-Json -Depth 10 | Out-File -FilePath $tempConfigPath -Encoding utf8

try {
    # Try to start with primary ports
    Write-Host "Starting Firebase emulators with configuration:"
    Get-Content $tempConfigPath | Write-Host
    
    $arguments = @(
        "firebase",
        "emulators:start",
        "--import=./emulator-data",
        "--export-on-exit",
        "--project=tp-board-6331b",
        "--only", "auth,firestore,storage",
        "--config", $tempConfigPath
    )
    
    Write-Host "Running: npx $($arguments -join ' ')"
    npx @arguments
}
catch {
    Write-Host "Failed to start with primary ports, trying alternatives..."
    
    # Update ports for the second attempt
    $tempConfig.emulators.auth.port = 9200
    $tempConfig.emulators.firestore.port = 8182
    $tempConfig.emulators.storage.port = 9300
    $tempConfig.emulators.ui.port = 4101
    
    # Save the updated config
    $tempConfig | ConvertTo-Json -Depth 10 | Out-File -FilePath $tempConfigPath -Encoding utf8
    
    Write-Host "Trying alternative configuration:"
    Get-Content $tempConfigPath | Write-Host
    
    $arguments = @(
        "firebase",
        "emulators:start",
        "--import=./emulator-data",
        "--export-on-exit",
        "--project=tp-board-6331b",
        "--only", "auth,firestore,storage",
        "--config", $tempConfigPath
    )
    
    Write-Host "Running: npx $($arguments -join ' ')"
    npx @arguments
}
finally {
    # Clean up the temporary config file
    if (Test-Path $tempConfigPath) {
        Remove-Item $tempConfigPath -ErrorAction SilentlyContinue
    }
}
