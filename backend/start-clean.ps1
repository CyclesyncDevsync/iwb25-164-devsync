Write-Host "Cleaning up existing Java processes..." -ForegroundColor Yellow
Get-Process java -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "Waiting for ports to be released..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "Setting up file watcher for automatic builds..." -ForegroundColor Cyan

# Create a file watcher
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $PSScriptRoot
$watcher.Filter = "*.bal"
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true

# Define action for file changes
$action = {
    $path = $Event.SourceEventArgs.FullPath
    $changeType = $Event.SourceEventArgs.ChangeType
    Write-Host "`nDetected $changeType in: $path" -ForegroundColor Yellow
    Write-Host "Rebuilding backend..." -ForegroundColor Cyan
    
    Push-Location $PSScriptRoot
    try {
        $buildResult = & bal build 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Build successful!" -ForegroundColor Green
        } else {
            Write-Host "Build failed!" -ForegroundColor Red
            Write-Host $buildResult
        }
    }
    finally {
        Pop-Location
    }
    Write-Host "Watching for changes..." -ForegroundColor Gray
}

# Register event handlers
Register-ObjectEvent -InputObject $watcher -EventName "Changed" -Action $action
Register-ObjectEvent -InputObject $watcher -EventName "Created" -Action $action
Register-ObjectEvent -InputObject $watcher -EventName "Deleted" -Action $action
Register-ObjectEvent -InputObject $watcher -EventName "Renamed" -Action $action

Write-Host "File watcher active. Will automatically rebuild on .bal file changes." -ForegroundColor Green

# Initial build
Write-Host "`nPerforming initial build..." -ForegroundColor Green
bal build

Write-Host "`nStarting Cyclesync Backend..." -ForegroundColor Green
try {
    bal run
}
finally {
    # Cleanup on exit
    Get-EventSubscriber | Where-Object { $_.SourceObject -eq $watcher } | Unregister-Event
    $watcher.Dispose()
    Write-Host "`nFile watcher disposed." -ForegroundColor Yellow
}