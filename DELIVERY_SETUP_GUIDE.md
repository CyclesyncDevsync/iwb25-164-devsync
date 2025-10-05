# Delivery Management - Complete Setup Guide

## 🚀 Quick Start

This guide will help you set up and test the delivery management system with real data from the database.

---

## Step 1: Setup Database Tables

### Run the SQL Schema

```bash
# Navigate to backend directory
cd backend

# Run the database schema
mysql -u root -p cyclesync < modules/delivery/database_schema.sql
```

Or connect to your MySQL database and run the SQL file:

```sql
-- Use your database
USE cyclesync;

-- Then paste the contents of modules/delivery/database_schema.sql
```

This will create:
- `delivery_tracking` table
- `delivery_updates` table
- Dummy data for 3 orders (ord-2024-001, ord-2024-002, ord-2024-003)

---

## Step 2: Start the Backend

```bash
# Make sure you're in the backend directory
cd backend

# Build and run
bal run
```

The delivery service will start on **port 9091**.

### Verify Backend is Running

```bash
# Test health endpoint
curl http://localhost:9091/delivery/health
```

Expected response:
```json
{
  "status": "UP",
  "service": "Delivery Management",
  "timestamp": "2024-01-15T10:30:00.000000000Z"
}
```

---

## Step 3: Start the Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not done)
npm install

# Start development server
npm run dev
```

Frontend will start on **http://localhost:3000**

---

## Step 4: Test the System

### Option 1: Test Delivery Tracking Page

Visit: **http://localhost:3000/test-delivery**

This is a dedicated test page where you can:
1. Enter an order ID (try: `ord-2024-001`, `ord-2024-002`, or `ord-2024-003`)
2. Click "Load" to fetch delivery data
3. View real-time delivery tracking information
4. See complete delivery timeline

### Option 2: Test via Buyer Orders Page

1. Navigate to: **http://localhost:3000/buyer/orders**
2. View orders with delivery tracking
3. Click "Track Order" to see detailed delivery information

### Option 3: Test via Supplier Orders Page

1. Navigate to: **http://localhost:3000/supplier/orders**
2. Click on any order
3. Go to "Delivery Tracking" tab
4. Update delivery status and see real-time changes

---

## Available Test Data

The database schema includes dummy data for testing:

### Order 1: `ord-2024-001` (In Transit)
- **Status:** In Transit
- **Driver:** Rajesh Kumar (+91 98765 00001)
- **Vehicle:** MH-12-AB-1234
- **Current Location:** Pune Distribution Center
- **Updates:** 3 delivery updates

### Order 2: `ord-2024-002` (Delivered)
- **Status:** Delivered
- **Driver:** Amit Sharma (+91 98765 00002)
- **Vehicle:** DL-10-CD-5678
- **Delivered:** 3 days ago
- **Updates:** 4 delivery updates

### Order 3: `ord-2024-003` (Delivered)
- **Status:** Delivered
- **Driver:** Suresh Patel (+91 98765 00003)
- **Vehicle:** KA-01-EF-9012
- **Delivered:** 1 day ago
- **Updates:** 4 delivery updates

---

## API Endpoints Available

### Base URL: `http://localhost:9091/delivery`

### 1. Get Delivery by Order ID
```bash
curl http://localhost:9091/delivery/ord-2024-001
```

### 2. Update Delivery Status
```bash
curl -X PATCH http://localhost:9091/delivery/ord-2024-001/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "out_for_delivery",
    "location": "Customer Area",
    "description": "Driver is 10 minutes away",
    "updatedBy": "driver"
  }'
```

### 3. Create New Delivery Tracking
```bash
curl -X POST http://localhost:9091/delivery/create \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ord-2024-004",
    "driverName": "New Driver",
    "driverPhone": "+91 98765 00004",
    "vehicleNumber": "MH-01-XY-9999",
    "notes": "Handle with care"
  }'
```

### 4. Get All Supplier Deliveries
```bash
curl http://localhost:9091/delivery/supplier/{supplierId}
```

---

## Frontend Components

### New Components Created

1. **`DeliveryTracker`** (`src/components/delivery/DeliveryTracker.tsx`)
   - Displays delivery tracking with real-time data
   - Shows driver info, vehicle details, and timeline
   - Auto-refreshes data
   - Handles loading and error states

2. **`DeliveryStatusManager`** (`src/components/supplier/DeliveryStatusManager.tsx`)
   - Updated to fetch data from API
   - Allows suppliers to update delivery status
   - Shows success/error messages
   - Real-time status updates

### New Services

1. **`deliveryService`** (`src/services/deliveryService.ts`)
   - API client for all delivery operations
   - Handles data transformation
   - Error handling

2. **`useDelivery` hook** (`src/hooks/useDelivery.ts`)
   - React hook for delivery data
   - Auto-fetching and caching
   - Status update functionality

---

## Testing Workflow

### 1. Test Data Fetching

1. Open **http://localhost:3000/test-delivery**
2. Enter `ord-2024-001`
3. Click "Load"
4. Verify you see:
   - ✅ Delivery status (In Transit)
   - ✅ Driver name and phone
   - ✅ Vehicle number
   - ✅ Current location
   - ✅ Delivery timeline with 3 updates

### 2. Test Status Update

1. Open developer console (F12)
2. Run this in console or use the supplier page:

```javascript
fetch('http://localhost:9091/delivery/ord-2024-001/status', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'out_for_delivery',
    location: 'Near Customer Location',
    description: 'Driver is on the way',
    updatedBy: 'system'
  })
})
.then(r => r.json())
.then(console.log);
```

3. Refresh the tracking page
4. Verify new status appears in timeline

### 3. Test Supplier Interface

1. Navigate to **http://localhost:3000/supplier/orders**
2. Click on any order with delivery tracking
3. Go to "Delivery Tracking" tab
4. Fill in the update form:
   - Select new status (e.g., "Out for Delivery")
   - Enter location (e.g., "Mumbai Central")
   - Enter description (e.g., "Package will arrive soon")
5. Click "Update Status"
6. Verify:
   - ✅ Success message appears
   - ✅ New status shows in current status
   - ✅ Timeline updates with new entry

---

## Troubleshooting

### Backend Not Starting

**Problem:** Backend fails to start
**Solution:**
```bash
# Check if port 9091 is available
netstat -ano | findstr :9091

# Check database connection in Config.toml
# Make sure database credentials are correct
```

### No Data Showing

**Problem:** Delivery tracking shows "No delivery tracking available"
**Solution:**
1. Verify database has data:
```sql
SELECT * FROM delivery_tracking;
SELECT * FROM delivery_updates;
```

2. Check API is accessible:
```bash
curl http://localhost:9091/delivery/health
curl http://localhost:9091/delivery/ord-2024-001
```

### CORS Errors

**Problem:** CORS errors in browser console
**Solution:**
- Verify backend CORS is configured for `http://localhost:3000`
- Check `delivery_controller.bal` has proper CORS settings

### Status Update Not Working

**Problem:** Status update fails with error
**Solution:**
1. Check browser console for error details
2. Verify API endpoint is correct
3. Check request payload matches the schema
4. Ensure database connection is active

---

## Environment Variables

Create `.env.local` in frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:9091
```

---

## Database Verification

### Check Tables Exist

```sql
USE cyclesync;
SHOW TABLES LIKE 'delivery%';
```

Expected output:
```
delivery_tracking
delivery_updates
```

### Check Sample Data

```sql
-- Check delivery tracking records
SELECT id, order_id, status, driver_name, vehicle_number
FROM delivery_tracking;

-- Check delivery updates
SELECT delivery_id, status, location, description, timestamp
FROM delivery_updates
ORDER BY timestamp DESC
LIMIT 10;
```

---

## Next Steps

### Add Real Orders

To add delivery tracking for your own orders:

```sql
-- Example: Add delivery for a new order
INSERT INTO delivery_tracking (
  id, order_id, status, driver_name, driver_phone, vehicle_number,
  current_location, notes, created_at, updated_at
) VALUES (
  UUID(), 'your-order-id', 'pending', 'Your Driver', '+1234567890',
  'ABC-123', 'Warehouse', 'New delivery', NOW(), NOW()
);
```

### Integrate with Real Order System

Update your order creation flow to automatically create delivery tracking:

```typescript
// After order is created
await deliveryService.createDelivery({
  orderId: newOrder.id,
  driverName: assignedDriver.name,
  driverPhone: assignedDriver.phone,
  vehicleNumber: assignedVehicle.number
});
```

---

## Summary

✅ **Database Setup:** Tables created with sample data
✅ **Backend Running:** Delivery API on port 9091
✅ **Frontend Running:** Test page at /test-delivery
✅ **API Integration:** Real-time data fetching
✅ **Status Updates:** Working supplier interface

**You can now:**
- View delivery tracking with real database data
- Update delivery status from supplier interface
- Track deliveries on buyer interface
- Test all delivery statuses and workflows

**No more hardcoded data!** 🎉
