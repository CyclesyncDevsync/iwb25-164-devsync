# Delivery Management System

## Overview

The Delivery Management System provides comprehensive tracking and status updates for orders from pickup to delivery. This feature enables suppliers to update delivery status in real-time and allows buyers to track their orders throughout the delivery process.

## Features

### For Suppliers
- **Real-time Status Updates**: Update delivery status with location and description
- **Delivery Timeline**: Track complete delivery history with timestamps
- **Driver Information**: Assign driver details, contact information, and vehicle numbers
- **Multiple Status Levels**: Track orders through various delivery stages

### For Buyers
- **Live Tracking**: View real-time delivery status and location
- **Driver Details**: Access driver name, phone number, and vehicle information
- **Delivery Timeline**: See complete delivery history with updates
- **ETA Information**: View estimated delivery dates and times
- **Visual Updates**: Enhanced UI with color-coded status indicators

## Architecture

### Frontend Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── buyer/
│   │   │   └── orders/
│   │   │       └── page.tsx          # Buyer orders page with delivery tracking
│   │   └── supplier/
│   │       └── orders/
│   │           └── page.tsx          # Supplier orders page
│   ├── components/
│   │   └── supplier/
│   │       ├── OrderManagement.tsx   # Order management with delivery tab
│   │       └── DeliveryStatusManager.tsx  # Delivery status update component
│   └── types/
│       └── supplier.ts               # TypeScript interfaces for delivery
```

### Backend Structure

```
backend/
└── modules/
    └── delivery/
        ├── delivery_service.bal      # Core delivery management service
        ├── delivery_controller.bal   # REST API endpoints
        └── database_schema.sql       # Database schema and dummy data
```

## Database Schema

### delivery_tracking Table

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(255) | Primary key |
| order_id | VARCHAR(255) | Foreign key to orders table |
| status | VARCHAR(50) | Current delivery status |
| current_location | VARCHAR(500) | Current delivery location |
| estimated_delivery_date | TIMESTAMP | Estimated delivery time |
| actual_delivery_date | TIMESTAMP | Actual delivery time |
| driver_name | VARCHAR(255) | Assigned driver name |
| driver_phone | VARCHAR(20) | Driver contact number |
| vehicle_number | VARCHAR(50) | Vehicle registration number |
| notes | TEXT | Additional notes |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Last update time |

### delivery_updates Table

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(255) | Primary key |
| delivery_id | VARCHAR(255) | Foreign key to delivery_tracking |
| status | VARCHAR(50) | Status at this update |
| location | VARCHAR(500) | Location at this update |
| timestamp | TIMESTAMP | Update timestamp |
| description | TEXT | Update description |
| updated_by | VARCHAR(255) | Who updated (system/driver/supplier) |
| latitude | DECIMAL(10,8) | GPS latitude (optional) |
| longitude | DECIMAL(11,8) | GPS longitude (optional) |

## Delivery Status Flow

```
PENDING
  ↓
PICKUP_SCHEDULED
  ↓
PICKED_UP
  ↓
IN_TRANSIT
  ↓
OUT_FOR_DELIVERY
  ↓
DELIVERED

(Alternative paths: FAILED, RETURNED)
```

## API Endpoints

### Create Delivery Tracking
```http
POST /delivery/create
Content-Type: application/json

{
  "orderId": "ord-2024-001",
  "driverName": "John Doe",
  "driverPhone": "+94 77 123 4567",
  "vehicleNumber": "ABC-1234",
  "estimatedDeliveryDate": "2024-01-20T14:00:00",
  "notes": "Handle with care"
}
```

### Get Delivery by Order ID
```http
GET /delivery/{orderId}
```

**Response:**
```json
{
  "id": "delivery-uuid",
  "orderId": "ord-2024-001",
  "status": "in_transit",
  "currentLocation": "Pune Distribution Center",
  "estimatedDeliveryDate": "2024-01-20T14:00:00",
  "driverName": "John Doe",
  "driverPhone": "+94 77 123 4567",
  "vehicleNumber": "ABC-1234",
  "updates": [
    {
      "id": "update-uuid",
      "status": "in_transit",
      "location": "Pune",
      "timestamp": "2024-01-15T10:30:00",
      "description": "Package in transit",
      "updatedBy": "driver"
    }
  ],
  "createdAt": "2024-01-15T09:00:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

### Update Delivery Status
```http
PATCH /delivery/{orderId}/status
Content-Type: application/json

{
  "status": "in_transit",
  "location": "Pune Distribution Center",
  "description": "Package is on the way",
  "updatedBy": "driver",
  "latitude": 18.5204,
  "longitude": 73.8567
}
```

### Get Supplier Deliveries
```http
GET /delivery/supplier/{supplierId}
```

## TypeScript Interfaces

### DeliveryTracking
```typescript
interface DeliveryTracking {
  id: string;
  orderId: string;
  status: DeliveryStatus;
  currentLocation?: string;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  driverName?: string;
  driverPhone?: string;
  vehicleNumber?: string;
  notes?: string;
  updates: DeliveryUpdate[];
  createdAt: Date;
  updatedAt: Date;
}
```

### DeliveryUpdate
```typescript
interface DeliveryUpdate {
  id: string;
  status: DeliveryStatus;
  location: string;
  timestamp: Date;
  description: string;
  updatedBy: string;
  latitude?: number;
  longitude?: number;
}
```

### DeliveryStatus Enum
```typescript
enum DeliveryStatus {
  PENDING = 'pending',
  PICKUP_SCHEDULED = 'pickup_scheduled',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  RETURNED = 'returned'
}
```

## Usage Guide

### For Suppliers

#### 1. View Order Deliveries
1. Navigate to `/supplier/orders`
2. Click on any order to view details
3. Click on the "Delivery Tracking" tab

#### 2. Update Delivery Status
1. In the Delivery Tracking tab, fill in:
   - New Status (select from dropdown)
   - Current Location
   - Description of the update
2. Click "Update Status"
3. The buyer will see the updated status in real-time

#### 3. Add Driver Information
When creating a delivery, include:
- Driver name
- Driver contact number
- Vehicle registration number
- Estimated delivery date/time

### For Buyers

#### 1. Track Orders
1. Navigate to `/buyer/orders`
2. Active deliveries show enhanced tracking information:
   - Current status and location
   - Driver details
   - Vehicle information
   - Estimated arrival time

#### 2. View Delivery Timeline
1. Click "Track Order" on any in-transit order
2. View complete delivery history with:
   - Status updates
   - Location changes
   - Timestamps
   - Update descriptions

#### 3. Contact Driver
- Driver contact information is displayed for in-transit orders
- Direct phone number available for urgent queries

## Setup Instructions

### Database Setup

1. Run the database schema:
```bash
mysql -u root -p cyclesync < backend/modules/delivery/database_schema.sql
```

2. The schema includes dummy data for testing:
   - 3 sample deliveries
   - Multiple delivery updates for each order
   - Complete timeline history

### Backend Setup

1. The delivery service is auto-initialized with the database configuration
2. Ensure database connection is properly configured in `backend/modules/database_config/`
3. The service runs on port 9090 (configurable)

### Frontend Integration

1. Import delivery types:
```typescript
import { DeliveryStatus, DeliveryTracking, DeliveryUpdate } from '@/types/supplier';
```

2. Use the DeliveryStatusManager component:
```typescript
import DeliveryStatusManager from '@/components/supplier/DeliveryStatusManager';

<DeliveryStatusManager
  orderId={orderId}
  delivery={deliveryData}
  onStatusUpdate={handleStatusUpdate}
/>
```

## Testing

### Test Data Available

The system includes dummy data for:
- ORD-2024-001: In Transit (with 3 updates)
- ORD-2024-002: Delivered (with 4 updates)
- ORD-2024-003: Delivered (with 4 updates)

### Testing Workflow

1. **Supplier Flow:**
   - Login as supplier
   - Navigate to orders
   - Open order details
   - Go to Delivery Tracking tab
   - Update status with location and description
   - Verify update appears in timeline

2. **Buyer Flow:**
   - Login as buyer
   - Navigate to orders
   - View in-transit orders with delivery info
   - Click "Track Order" to see detailed timeline
   - Verify driver and vehicle information displayed

## Future Enhancements

### Planned Features
- [ ] Real-time GPS tracking integration
- [ ] Push notifications for status updates
- [ ] SMS notifications to buyers
- [ ] Photo uploads for delivery proof
- [ ] Digital signature on delivery
- [ ] Route optimization
- [ ] Delivery scheduling calendar
- [ ] Multi-language support
- [ ] Delivery analytics dashboard
- [ ] Integration with third-party logistics

### Performance Optimizations
- [ ] Caching for frequent queries
- [ ] WebSocket for real-time updates
- [ ] Pagination for delivery history
- [ ] Indexing optimization

## Troubleshooting

### Common Issues

**Issue: Delivery not showing up**
- Solution: Ensure order has a valid delivery_tracking record
- Check database foreign key constraints

**Issue: Status updates not appearing**
- Solution: Verify API endpoint is correctly configured
- Check browser console for API errors

**Issue: Timeline not loading**
- Solution: Ensure delivery_updates table has records
- Verify deliveryId is correct in queries

## Support

For issues or questions:
1. Check the database schema is properly initialized
2. Verify API endpoints are accessible
3. Review browser console for errors
4. Check backend logs for service errors

## License

This feature is part of the CycleSync platform and follows the same license terms.
