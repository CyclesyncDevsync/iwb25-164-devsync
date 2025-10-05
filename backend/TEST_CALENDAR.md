# 📅 Google Calendar Integration - Testing Guide

## ✅ Setup Completed

- [x] Calendar ID configured
- [x] Service account key placed
- [x] Calendar service created
- [x] API controller created

---

## 🚀 How to Test

### Step 1: Start the Backend Server

```bash
cd D:\Ballerina\Cyclesync\backend
bal run
```

### Step 2: Initialize Calendar Service

```bash
curl -X POST http://localhost:8097/api/calendar/init
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Calendar service initialized successfully"
}
```

---

## 📌 Test Calendar Operations

### 1. Create an EVENT (Order Delivery)

```bash
curl -X POST http://localhost:8097/api/calendar/event \
  -H "Content-Type: application/json" \
  -d "{
    \"summary\": \"Order Delivery - Premium Aluminum\",
    \"description\": \"Order #ORD-2024-001\\nDelivery of 500kg aluminum to buyer\",
    \"startTime\": \"2024-10-10T14:00:00\",
    \"endTime\": \"2024-10-10T16:00:00\",
    \"location\": \"123 Industrial Road, Colombo\"
  }"
```

### 2. Create a TASK (Prepare Materials)

```bash
curl -X POST http://localhost:8097/api/calendar/task \
  -H "Content-Type: application/json" \
  -d "{
    \"summary\": \"Prepare Materials for Order\",
    \"description\": \"Sort and pack 500kg aluminum for ORD-2024-001\",
    \"dueDate\": \"2024-10-09T09:00:00\",
    \"location\": \"Warehouse A\"
  }"
```

### 3. Create an APPOINTMENT (Pickup Schedule)

```bash
curl -X POST http://localhost:8097/api/calendar/appointment \
  -H "Content-Type: application/json" \
  -d "{
    \"summary\": \"Pickup Appointment\",
    \"description\": \"Scheduled pickup for Order #ORD-2024-001\",
    \"startTime\": \"2024-10-10T10:00:00\",
    \"endTime\": \"2024-10-10T11:00:00\",
    \"location\": \"Supplier Warehouse, Gampaha\",
    \"attendees\": [\"buyer@example.com\", \"supplier@example.com\"]
  }"
```

### 4. Get Upcoming Items

```bash
curl http://localhost:8097/api/calendar/upcoming?maxResults=10
```

### 5. Update Calendar Item

```bash
curl -X PUT http://localhost:8097/api/calendar/item/EVENT_ID_HERE \
  -H "Content-Type: application/json" \
  -d "{
    \"summary\": \"Updated Order Delivery\",
    \"startTime\": \"2024-10-10T15:00:00\",
    \"endTime\": \"2024-10-10T17:00:00\"
  }"
```

### 6. Delete Calendar Item

```bash
curl -X DELETE http://localhost:8097/api/calendar/item/EVENT_ID_HERE
```

---

## 🔍 Verify in Google Calendar

1. Go to: https://calendar.google.com
2. Find "Cyclesync Orders" calendar in left sidebar
3. You should see:
   - 🔵 **Blue events** = Order deliveries
   - 🟡 **Yellow tasks** = Preparation tasks
   - 🟢 **Green appointments** = Pickup schedules

---

## ❌ Troubleshooting

### Error: "Calendar client not initialized"
**Solution:** Call `/api/calendar/init` first

### Error: "Failed to get access token"
**Solution:** Check service account JSON file exists at:
```
D:\Ballerina\Cyclesync\backend\service-account-key.json
```

### Error: "Calendar not found"
**Solution:** Verify calendar is shared with service account email

---

## 📝 Next Steps

Once testing is successful:

1. ✅ Integrate with auction creation
2. ✅ Integrate with order placement
3. ✅ Add frontend calendar display
4. ✅ Add "Add to Calendar" buttons

---

## 🎯 Calendar ID Used

```
beebed8c52807211f30712f048b6b06df5da13d0532c6a1bbb932e7b8d7fcff2@group.calendar.google.com
```
