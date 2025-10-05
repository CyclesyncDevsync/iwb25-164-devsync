-- Delivery Tracking Table
CREATE TABLE IF NOT EXISTS delivery_tracking (
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
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Delivery Updates Table (Timeline)
CREATE TABLE IF NOT EXISTS delivery_updates (
    id VARCHAR(255) PRIMARY KEY,
    delivery_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    location VARCHAR(500) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    description TEXT NOT NULL,
    updated_by VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    FOREIGN KEY (delivery_id) REFERENCES delivery_tracking(id) ON DELETE CASCADE,
    INDEX idx_delivery_id (delivery_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_status (status)
);

-- Insert dummy delivery data for existing orders
INSERT INTO delivery_tracking (id, order_id, status, current_location, estimated_delivery_date, driver_name, driver_phone, vehicle_number, notes, created_at, updated_at)
VALUES
    -- Delivery for ORD-2024-001 (In Transit)
    (UUID(), 'ord-2024-001', 'in_transit', 'Pune Distribution Center', DATE_ADD(NOW(), INTERVAL 1 DAY), 'Rajesh Kumar', '+91 98765 00001', 'MH-12-AB-1234', 'Handle with care - fragile items', NOW(), NOW()),

    -- Delivery for ORD-2024-002 (Delivered)
    (UUID(), 'ord-2024-002', 'delivered', 'Customer Location', DATE_SUB(NOW(), INTERVAL 3 DAY), 'Amit Sharma', '+91 98765 00002', 'DL-10-CD-5678', 'Delivered successfully', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),

    -- Delivery for ORD-2024-003 (Delivered)
    (UUID(), 'ord-2024-003', 'delivered', 'Customer Location', DATE_SUB(NOW(), INTERVAL 1 DAY), 'Suresh Patel', '+91 98765 00003', 'KA-01-EF-9012', 'Completed delivery', DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Insert delivery updates for ORD-2024-001 (In Transit)
INSERT INTO delivery_updates (id, delivery_id, status, location, timestamp, description, updated_by, latitude, longitude)
SELECT
    UUID(),
    dt.id,
    'in_transit',
    'Pune Distribution Center',
    NOW(),
    'Package is on the way to your location',
    'system',
    18.5204,
    73.8567
FROM delivery_tracking dt WHERE dt.order_id = 'ord-2024-001';

INSERT INTO delivery_updates (id, delivery_id, status, location, timestamp, description, updated_by, latitude, longitude)
SELECT
    UUID(),
    dt.id,
    'picked_up',
    'Mumbai Warehouse',
    DATE_SUB(NOW(), INTERVAL 1 DAY),
    'Package picked up from supplier',
    'driver',
    19.0760,
    72.8777
FROM delivery_tracking dt WHERE dt.order_id = 'ord-2024-001';

INSERT INTO delivery_updates (id, delivery_id, status, location, timestamp, description, updated_by, latitude, longitude)
SELECT
    UUID(),
    dt.id,
    'pickup_scheduled',
    'Supplier Location',
    DATE_SUB(NOW(), INTERVAL 2 DAY),
    'Pickup scheduled with driver',
    'system',
    19.0760,
    72.8777
FROM delivery_tracking dt WHERE dt.order_id = 'ord-2024-001';

-- Insert delivery updates for ORD-2024-002 (Delivered)
INSERT INTO delivery_updates (id, delivery_id, status, location, timestamp, description, updated_by, latitude, longitude)
SELECT
    UUID(),
    dt.id,
    'delivered',
    'Customer Location - Delhi NCR',
    DATE_SUB(NOW(), INTERVAL 3 DAY),
    'Successfully delivered to customer',
    'driver',
    28.7041,
    77.1025
FROM delivery_tracking dt WHERE dt.order_id = 'ord-2024-002';

INSERT INTO delivery_updates (id, delivery_id, status, location, timestamp, description, updated_by, latitude, longitude)
SELECT
    UUID(),
    dt.id,
    'out_for_delivery',
    'Delhi Distribution Hub',
    DATE_SUB(NOW(), INTERVAL 3 DAY),
    'Out for delivery - estimated arrival in 2 hours',
    'system',
    28.6139,
    77.2090
FROM delivery_tracking dt WHERE dt.order_id = 'ord-2024-002';

INSERT INTO delivery_updates (id, delivery_id, status, location, timestamp, description, updated_by, latitude, longitude)
SELECT
    UUID(),
    dt.id,
    'in_transit',
    'Gurgaon Transit Point',
    DATE_SUB(NOW(), INTERVAL 4 DAY),
    'Package in transit to delivery location',
    'system',
    28.4595,
    77.0266
FROM delivery_tracking dt WHERE dt.order_id = 'ord-2024-002';

INSERT INTO delivery_updates (id, delivery_id, status, location, timestamp, description, updated_by, latitude, longitude)
SELECT
    UUID(),
    dt.id,
    'picked_up',
    'Supplier Warehouse',
    DATE_SUB(NOW(), INTERVAL 5 DAY),
    'Package picked up from supplier',
    'driver',
    28.7041,
    77.1025
FROM delivery_tracking dt WHERE dt.order_id = 'ord-2024-002';

-- Insert delivery updates for ORD-2024-003 (Delivered)
INSERT INTO delivery_updates (id, delivery_id, status, location, timestamp, description, updated_by, latitude, longitude)
SELECT
    UUID(),
    dt.id,
    'delivered',
    'Customer Location - Bangalore',
    DATE_SUB(NOW(), INTERVAL 1 DAY),
    'Package delivered successfully',
    'driver',
    12.9716,
    77.5946
FROM delivery_tracking dt WHERE dt.order_id = 'ord-2024-003';

INSERT INTO delivery_updates (id, delivery_id, status, location, timestamp, description, updated_by, latitude, longitude)
SELECT
    UUID(),
    dt.id,
    'out_for_delivery',
    'Bangalore Distribution Center',
    DATE_SUB(NOW(), INTERVAL 1 DAY),
    'Out for delivery',
    'system',
    12.9716,
    77.5946
FROM delivery_tracking dt WHERE dt.order_id = 'ord-2024-003';

INSERT INTO delivery_updates (id, delivery_id, status, location, timestamp, description, updated_by, latitude, longitude)
SELECT
    UUID(),
    dt.id,
    'in_transit',
    'Katunayake to Bangalore',
    DATE_SUB(NOW(), INTERVAL 3 DAY),
    'Package in transit',
    'system',
    7.1907,
    79.8838
FROM delivery_tracking dt WHERE dt.order_id = 'ord-2024-003';

INSERT INTO delivery_updates (id, delivery_id, status, location, timestamp, description, updated_by, latitude, longitude)
SELECT
    UUID(),
    dt.id,
    'picked_up',
    'Export Processing Zone, Katunayake',
    DATE_SUB(NOW(), INTERVAL 6 DAY),
    'Package collected from supplier',
    'driver',
    7.1907,
    79.8838
FROM delivery_tracking dt WHERE dt.order_id = 'ord-2024-003';
