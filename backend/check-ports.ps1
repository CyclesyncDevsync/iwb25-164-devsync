Write-Host "Checking Cyclesync Service Ports..." -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

$ports = @(
    @{Port=8080; Service="Main API Server"},
    @{Port=8082; Service="Quality Assessment API"},
    @{Port=8084; Service="Demand Prediction API"},
    @{Port=8085; Service="Dynamic Pricing API"},
    @{Port=8086; Service="Material Workflow API"},
    @{Port=8087; Service="Auction API"},
    @{Port=8088; Service="Agent Review API"},
    @{Port=8091; Service="Agent Assignment API"},
    @{Port=8092; Service="Auth API"},
    @{Port=8093; Service="Admin Users API"},
    @{Port=8094; Service="Chatbot WebSocket"},
    @{Port=8095; Service="Chatbot Health Check"}
)

foreach ($p in $ports) {
    $result = netstat -ano | findstr ":$($p.Port)"
    if ($result) {
        Write-Host "`nPort $($p.Port) ($($p.Service)):" -ForegroundColor Yellow
        $result | ForEach-Object {
            if ($_ -match 'LISTENING\s+(\d+)') {
                $pid = $matches[1]
                try {
                    $process = Get-Process -Id $pid -ErrorAction Stop
                    Write-Host "  PID: $pid - Process: $($process.ProcessName)" -ForegroundColor Red
                } catch {
                    Write-Host "  PID: $pid - Process: Unknown" -ForegroundColor Red
                }
            }
        }
    } else {
        Write-Host "Port $($p.Port) ($($p.Service)): Available" -ForegroundColor Green
    }
}

Write-Host "`nTo kill all Java processes, run: Stop-Process -Name java -Force" -ForegroundColor Cyan