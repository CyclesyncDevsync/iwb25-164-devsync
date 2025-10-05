# Google Calendar API Test Script
# Run this after starting the backend server

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "Google Calendar Integration Tests" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:8097/api/calendar"

# Test 1: Initialize Calendar
Write-Host "`n[1] Initializing Calendar Service..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/init" -Method POST
    Write-Host "✅ SUCCESS: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ FAILED: $_" -ForegroundColor Red
    exit 1
}

# Test 2: Create Event
Write-Host "`n[2] Creating Event (Order Delivery)..." -ForegroundColor Yellow
$eventData = @{
    summary = "Order Delivery - Premium Aluminum"
    description = "Order #ORD-2024-001`nDelivery of 500kg aluminum to buyer"
    startTime = "2024-10-10T14:00:00"
    endTime = "2024-10-10T16:00:00"
    location = "123 Industrial Road, Colombo"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/event" -Method POST -Body $eventData -ContentType "application/json"
    Write-Host "✅ SUCCESS: Event ID: $($response.eventId)" -ForegroundColor Green
    $eventId = $response.eventId
} catch {
    Write-Host "❌ FAILED: $_" -ForegroundColor Red
}

# Test 3: Create Task
Write-Host "`n[3] Creating Task (Prepare Materials)..." -ForegroundColor Yellow
$taskData = @{
    summary = "Prepare Materials for Order"
    description = "Sort and pack 500kg aluminum for ORD-2024-001"
    dueDate = "2024-10-09T09:00:00"
    location = "Warehouse A"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/task" -Method POST -Body $taskData -ContentType "application/json"
    Write-Host "✅ SUCCESS: Task ID: $($response.taskId)" -ForegroundColor Green
} catch {
    Write-Host "❌ FAILED: $_" -ForegroundColor Red
}

# Test 4: Create Appointment
Write-Host "`n[4] Creating Appointment (Pickup Schedule)..." -ForegroundColor Yellow
$appointmentData = @{
    summary = "Pickup Appointment"
    description = "Scheduled pickup for Order #ORD-2024-001"
    startTime = "2024-10-10T10:00:00"
    endTime = "2024-10-10T11:00:00"
    location = "Supplier Warehouse, Gampaha"
    attendees = @("buyer@example.com", "supplier@example.com")
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/appointment" -Method POST -Body $appointmentData -ContentType "application/json"
    Write-Host "✅ SUCCESS: Appointment ID: $($response.appointmentId)" -ForegroundColor Green
} catch {
    Write-Host "❌ FAILED: $_" -ForegroundColor Red
}

# Test 5: Get Upcoming Items
Write-Host "`n[5] Getting Upcoming Calendar Items..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/upcoming?maxResults=10" -Method GET
    Write-Host "✅ SUCCESS: Retrieved upcoming items" -ForegroundColor Green
    Write-Host $($response | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "❌ FAILED: $_" -ForegroundColor Red
}

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "✅ Testing Complete!" -ForegroundColor Green
Write-Host "Check your Google Calendar:" -ForegroundColor Cyan
Write-Host "https://calendar.google.com" -ForegroundColor Blue
Write-Host "=====================================" -ForegroundColor Cyan
