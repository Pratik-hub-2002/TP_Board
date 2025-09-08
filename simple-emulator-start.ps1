# Simple script to start Firebase emulators with minimal configuration

# Kill any existing emulator processes
try {
    Get-Process -Name "node" -ErrorAction Stop | 
        Where-Object { $_.CommandLine -like "*firebase*emulators*" } | 
        Stop-Process -Force -ErrorAction Stop
    Write-Host "Stopped any running Firebase emulator processes"
} catch {
    Write-Host "No running Firebase emulator processes found"
}

# Create a minimal firebase.json if it doesn't exist
$firebaseConfig = @{
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
        }
        "singleProjectMode" = $true
    }
}

# Save the config
$firebaseConfig | ConvertTo-Json -Depth 10 | Out-File -FilePath "./firebase.json" -Encoding utf8

# Create default rules files if they don't exist
if (-not (Test-Path "./firestore.rules")) {
    @'
rules_version = "2";
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
'@ | Out-File -FilePath "./firestore.rules" -Encoding utf8
}

if (-not (Test-Path "./storage.rules")) {
    @'
rules_version = "2";
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
'@ | Out-File -FilePath "./storage.rules" -Encoding utf8
}

# Create empty indexes file if it doesn't exist
if (-not (Test-Path "./firestore.indexes.json")) {
    '{
        "indexes": [],
        "fieldOverrides": []
    }' | Out-File -FilePath "./firestore.indexes.json" -Encoding utf8
}

# Start the emulators
Write-Host "Starting Firebase emulators..."
$ErrorActionPreference = 'Continue'
$output = npx firebase emulators:start --project=demo-1 --only auth,firestore,storage --import=./emulator-data --export-on-exit 2>&1

# If we get here, there was an error
Write-Host "Error starting emulators:"
$output
