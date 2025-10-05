-- PostgreSQL Schema for Delivery Management
-- Drop existing tables if they exist
DROP TABLE IF EXISTS delivery_updates CASCADE;
DROP TABLE IF EXISTS delivery_tracking CASCADE;

-- Create delivery_tracking table
CREATE TABLE delivery_tracking (
    id VARCHAR(255) PRIMARY KEY,
    order_id VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    current_location VARCHAR(500),
    estimated_delivery_date TIMESTAMP,
    actual_delivery_date TIMESTAMP,
    driver_name VARCHAR(255),
    driver_phone VARCHAR(20),
    vehicle_number VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on order_id for faster lookups
CREATE INDEX idx_delivery_order_id ON delivery_tracking(order_id);
CREATE INDEX idx_delivery_status ON delivery_tracking(status);
CREATE INDEX idx_delivery_created_at ON delivery_tracking(created_at);

-- Create delivery_updates table
CREATE TABLE delivery_updates (
    id VARCHAR(255) PRIMARY KEY,
    delivery_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    location VARCHAR(500) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    description TEXT NOT NULL,
    updated_by VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    FOREIGN KEY (delivery_id) REFERENCES delivery_tracking(id) ON DELETE CASCADE
);

-- Create indexes for delivery_updates
CREATE INDEX idx_delivery_updates_delivery_id ON delivery_updates(delivery_id);
CREATE INDEX idx_delivery_updates_timestamp ON delivery_updates(timestamp);
CREATE INDEX idx_delivery_updates_status ON delivery_updates(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_delivery_tracking_updated_at
    BEFORE UPDATE ON delivery_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample delivery data

-- Delivery 1: In Transit
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
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Delivery updates for ord-2024-001
INSERT INTO delivery_updates (id, delivery_id, status, location, timestamp, description, updated_by, latitude, longitude)
VALUES
    ('update-001-1', 'delivery-001', 'in_transit', 'Pune Distribution Center', CURRENT_TIMESTAMP, 'Package is on the way to your location', 'system', 18.5204, 73.8567),
    ('update-001-2', 'delivery-001', 'picked_up', 'Mumbai Warehouse', CURRENT_TIMESTAMP - INTERVAL '1 day', 'Package picked up from supplier', 'driver', 19.0760, 72.8777),
    ('update-001-3', 'delivery-001', 'pickup_scheduled', 'Supplier Location', CURRENT_TIMESTAMP - INTERVAL '2 days', 'Pickup scheduled with driver', 'system', 19.0760, 72.8777);

-- Delivery 2: Delivered
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

-- Delivery updates for ord-2024-002
INSERT INTO delivery_updates (id, delivery_id, status, location, timestamp, description, updated_by, latitude, longitude)
VALUES
    ('update-002-1', 'delivery-002', 'delivered', 'Customer Location - Delhi NCR', CURRENT_TIMESTAMP - INTERVAL '3 days', 'Successfully delivered to customer', 'driver', 28.7041, 77.1025),
    ('update-002-2', 'delivery-002', 'out_for_delivery', 'Delhi Distribution Hub', CURRENT_TIMESTAMP - INTERVAL '3 days' - INTERVAL '2 hours', 'Out for delivery - estimated arrival in 2 hours', 'system', 28.6139, 77.2090),
    ('update-002-3', 'delivery-002', 'in_transit', 'Gurgaon Transit Point', CURRENT_TIMESTAMP - INTERVAL '4 days', 'Package in transit to delivery location', 'system', 28.4595, 77.0266),
    ('update-002-4', 'delivery-002', 'picked_up', 'Supplier Warehouse', CURRENT_TIMESTAMP - INTERVAL '5 days', 'Package picked up from supplier', 'driver', 28.7041, 77.1025);

-- Delivery 3: Delivered
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

-- Delivery updates for ord-2024-003
INSERT INTO delivery_updates (id, delivery_id, status, location, timestamp, description, updated_by, latitude, longitude)
VALUES
    ('update-003-1', 'delivery-003', 'delivered', 'Customer Location - Bangalore', CURRENT_TIMESTAMP - INTERVAL '1 day', 'Package delivered successfully', 'driver', 12.9716, 77.5946),
    ('update-003-2', 'delivery-003', 'out_for_delivery', 'Bangalore Distribution Center', CURRENT_TIMESTAMP - INTERVAL '1 day' - INTERVAL '3 hours', 'Out for delivery', 'system', 12.9716, 77.5946),
    ('update-003-3', 'delivery-003', 'in_transit', 'Katunayake to Bangalore', CURRENT_TIMESTAMP - INTERVAL '3 days', 'Package in transit', 'system', 7.1907, 79.8838),
    ('update-003-4', 'delivery-003', 'picked_up', 'Export Processing Zone, Katunayake', CURRENT_TIMESTAMP - INTERVAL '6 days', 'Package collected from supplier', 'driver', 7.1907, 79.8838);

-- Verify data inserted
SELECT 'Delivery Tracking Records:' as info;
SELECT id, order_id, status, driver_name, current_location FROM delivery_tracking;

SELECT 'Delivery Updates Count:' as info;
SELECT delivery_id, COUNT(*) as update_count FROM delivery_updates GROUP BY delivery_id;
