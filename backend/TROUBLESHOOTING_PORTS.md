# Port Conflict Troubleshooting Guide

## The Problem
When you see "Address already in use: bind" errors, it means:
1. A previous instance of the application is still running
2. The ports are not being released properly after shutdown
3. Multiple services are trying to use the same port

## Root Causes Found

### 1. Duplicate Service Initialization
- The `chatbot_standalone.bal` file was being loaded alongside the main application
- It contained hardcoded port numbers (8083, 8089) that conflicted with configured ports
- **Solution**: Renamed to `chatbot_standalone.bal.disabled`

### 2. Multiple Java Processes
- Ballerina runs on JVM, creating Java processes
- When the application doesn't shut down cleanly, these processes keep ports occupied
- **Solution**: Kill all Java processes before starting

### 3. Port Configuration Mismatch
- Some services had hardcoded ports that didn't match Config.toml
- Log messages showed wrong ports even after configuration changes
- **Solution**: Updated all port assignments to avoid conflicts

## Quick Fix Commands

### PowerShell (Recommended)
```powershell
# Check which ports are in use
.\check-ports.ps1

# Clean start
.\start-clean.ps1
```

### Manual Steps
```powershell
# 1. Kill all Java processes
Stop-Process -Name java -Force -ErrorAction SilentlyContinue

# 2. Wait for ports to release
Start-Sleep -Seconds 3

# 3. Run the application
bal run
```

### Command Prompt
```cmd
REM Kill Java processes
taskkill /F /IM java.exe

REM Wait 3 seconds
timeout /t 3

REM Run application
bal run
```

## Port Assignment Summary

| Port | Service | Configuration Location |
|------|---------|----------------------|
| 8080 | Main API | main.bal |
| 8082 | Quality Assessment | Built-in |
| 8084 | Demand Prediction | Built-in |
| 8085 | Dynamic Pricing | Built-in |
| 8086 | Material Workflow | Built-in |
| 8087 | Auction | Built-in |
| 8088 | Agent Review | Built-in |
| 8091 | Agent Assignment | agent_api.bal |
| 8092 | Auth API | auth_controller.bal |
| 8093 | Admin Users | auth_controller.bal |
| 8094 | Chatbot WebSocket | Config.toml |
| 8095 | Chatbot Health | chatbot_service.bal |

## Prevention Tips

1. **Always use the clean start scripts** instead of just `bal run`
2. **Don't run multiple instances** of the application
3. **Use Ctrl+C to stop** the application properly
4. **Check ports before starting** with `check-ports.ps1`

## If Problems Persist

1. Restart your computer (nuclear option but effective)
2. Check for other applications using these ports:
   ```powershell
   netstat -ano | findstr "8080 8082 8084 8085 8086 8087 8088 8091 8092 8093 8094 8095"
   ```
3. Look for any `.bal` files with `public function main()` that might be auto-executing

## Configuration Files to Check

1. `/backend/Config.toml` - WebSocket port configuration
2. `/backend/modules/*/Module.md` - Module documentation
3. Individual service files for hardcoded listeners

Remember: The "Address already in use" error is almost always caused by leftover processes, not actual configuration issues.