-- Insert Delivery Data for PostgreSQL
-- Run this file after creating the tables

-- Clear existing data (optional - remove if you want to keep existing data)
DELETE FROM delivery_updates;
DELETE FROM delivery_tracking;

-- Insert Delivery Tracking Records

-- Delivery 1: In Transit (ord-2024-001)
INSERT INTO delivery_tracking (
    id, order_id, status, current_location, estimated_delivery_date,
    driver_name, driver_phone, vehicle_number, notes, created_at, updated_at
) VALUES (
    'delivery-001',
    'ord-2024-001',
    'in_transit',
    'Pune Distribution Center',
    CURRENT_TIMESTAMP + INTERVAL '1 day',
    'Rajesh Kumar',
    '+91 98765 00001',
    'MH-12-AB-1234',
    'Handle with care - fragile items',
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    CURRENT_TIMESTAMP
);

-- Delivery 2: Delivered (ord-2024-002)
INSERT INTO delivery_tracking (
    id, order_id, status, current_location, estimated_delivery_date,
    actual_delivery_date, driver_name, driver_phone, vehicle_number, notes, created_at, updated_at
) VALUES (
    'delivery-002',
    'ord-2024-002',
    'delivered',
    'Customer Location - Delhi NCR',
    CURRENT_TIMESTAMP - INTERVAL '8 days',
    CURRENT_TIMESTAMP - INTERVAL '3 days',
    'Amit Sharma',
    '+91 98765 00002',
    'DL-10-CD-5678',
    'Delivered successfully',
    CURRENT_TIMESTAMP - INTERVAL '5 days',
    CURRENT_TIMESTAMP - INTERVAL '3 days'
);

-- Delivery 3: Delivered (ord-2024-003)
INSERT INTO delivery_tracking (
    id, order_id, status, current_location, estimated_delivery_date,
    actual_delivery_date, driver_name, driver_phone, vehicle_number, notes, created_at, updated_at
) VALUES (
    'delivery-003',
    'ord-2024-003',
    'delivered',
    'Customer Location - Bangalore',
    CURRENT_TIMESTAMP - INTERVAL '5 days',
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    'Suresh Patel',
    '+91 98765 00003',
    'KA-01-EF-9012',
    'Package delivered successfully',
    CURRENT_TIMESTAMP - INTERVAL '6 days',
    CURRENT_TIMESTAMP - INTERVAL '1 day'
);

-- Insert Delivery Updates

-- Updates for ord-2024-001 (In Transit)
INSERT INTO delivery_updates (id, delivery_id, status, location, timestamp, description, updated_by, latitude, longitude)
VALUES
    ('update-001-1', 'delivery-001', 'in_transit', 'Pune Distribution Center', CURRENT_TIMESTAMP, 'Package is on the way to your location', 'system', 18.5204, 73.8567),
    ('update-001-2', 'delivery-001', 'picked_up', 'Mumbai Warehouse', CURRENT_TIMESTAMP - INTERVAL '1 day', 'Package picked up from supplier', 'driver', 19.0760, 72.8777),
    ('update-001-3', 'delivery-001', 'pickup_scheduled', 'Supplier Location', CURRENT_TIMESTAMP - INTERVAL '2 days', 'Pickup scheduled with driver', 'system', 19.0760, 72.8777);

-- Updates for ord-2024-002 (Delivered)
INSERT INTO delivery_updates (id, delivery_id, status, location, timestamp, description, updated_by, latitude, longitude)
VALUES
    ('update-002-1', 'delivery-002', 'delivered', 'Customer Location - Delhi NCR', CURRENT_TIMESTAMP - INTERVAL '3 days', 'Successfully delivered to customer', 'driver', 28.7041, 77.1025),
    ('update-002-2', 'delivery-002', 'out_for_delivery', 'Delhi Distribution Hub', CURRENT_TIMESTAMP - INTERVAL '3 days' - INTERVAL '2 hours', 'Out for delivery - estimated arrival in 2 hours', 'system', 28.6139, 77.2090),
    ('update-002-3', 'delivery-002', 'in_transit', 'Gurgaon Transit Point', CURRENT_TIMESTAMP - INTERVAL '4 days', 'Package in transit to delivery location', 'system', 28.4595, 77.0266),
    ('update-002-4', 'delivery-002', 'picked_up', 'Supplier Warehouse', CURRENT_TIMESTAMP - INTERVAL '5 days', 'Package picked up from supplier', 'driver', 28.7041, 77.1025);

-- Updates for ord-2024-003 (Delivered)
INSERT INTO delivery_updates (id, delivery_id, status, location, timestamp, description, updated_by, latitude, longitude)
VALUES
    ('update-003-1', 'delivery-003', 'delivered', 'Customer Location - Bangalore', CURRENT_TIMESTAMP - INTERVAL '1 day', 'Package delivered successfully', 'driver', 12.9716, 77.5946),
    ('update-003-2', 'delivery-003', 'out_for_delivery', 'Bangalore Distribution Center', CURRENT_TIMESTAMP - INTERVAL '1 day' - INTERVAL '3 hours', 'Out for delivery', 'system', 12.9716, 77.5946),
    ('update-003-3', 'delivery-003', 'in_transit', 'Katunayake to Bangalore', CURRENT_TIMESTAMP - INTERVAL '3 days', 'Package in transit', 'system', 7.1907, 79.8838),
    ('update-003-4', 'delivery-003', 'picked_up', 'Export Processing Zone, Katunayake', CURRENT_TIMESTAMP - INTERVAL '6 days', 'Package collected from supplier', 'driver', 7.1907, 79.8838);

-- Verify the data
SELECT 'Delivery Tracking Records:' as message;
SELECT id, order_id, status, driver_name, vehicle_number, current_location FROM delivery_tracking;

SELECT '' as message;
SELECT 'Delivery Updates Count by Order:' as message;
SELECT dt.order_id, COUNT(du.id) as update_count
FROM delivery_tracking dt
LEFT JOIN delivery_updates du ON dt.id = du.delivery_id
GROUP BY dt.order_id
ORDER BY dt.order_id;
