-- Create Orders Table and Link with Delivery Tracking
-- Run this in Neon SQL Editor: https://console.neon.tech/

-- Step 1: Create orders table if not exists
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(255) PRIMARY KEY,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    material_id VARCHAR(255),
    material_title VARCHAR(500),
    material_category VARCHAR(100),
    buyer_id VARCHAR(255) NOT NULL,
    buyer_name VARCHAR(255) NOT NULL,
    buyer_email VARCHAR(255),
    buyer_phone VARCHAR(50),
    supplier_id VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expected_pickup_date TIMESTAMP,
    actual_pickup_date TIMESTAMP,
    pickup_address VARCHAR(500),
    pickup_city VARCHAR(100),
    pickup_district VARCHAR(100),
    pickup_province VARCHAR(100),
    special_instructions TEXT,
    agent_id VARCHAR(255),
    agent_name VARCHAR(255),
    tracking_number VARCHAR(100)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_supplier_id ON orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Step 2: Insert sample orders linked to existing deliveries
INSERT INTO orders (
    id, order_number, material_id, material_title, material_category,
    buyer_id, buyer_name, buyer_email, buyer_phone,
    supplier_id, quantity, unit_price, total_amount,
    status, payment_status, payment_method,
    created_at, updated_at,
    expected_pickup_date, pickup_address, pickup_city, pickup_district, pickup_province,
    special_instructions, agent_id, agent_name, tracking_number
) VALUES
-- Order 1: In Transit
(
    'ord-2024-001',
    'ORD-2024-001',
    'mat-1',
    'High-Quality Aluminum Sheets',
    'metal',
    'buyer-1',
    'ABC Manufacturing Ltd',
    'procurement@abcmfg.com',
    '+94 77 123 4567',
    'SUP001',
    500,
    250.00,
    125000.00,
    'in_transit',
    'paid',
    'Bank Transfer',
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '1 day',
    '123 Industrial Road, Colombo 01',
    'Colombo',
    'Colombo',
    'Western',
    'Please ensure materials are properly sorted and clean',
    'agent-1',
    'John Silva',
    'TRK-2024-001'
),
-- Order 2: Delivered
(
    'ord-2024-002',
    'ORD-2024-002',
    'mat-2',
    'PET Plastic Bottles',
    'plastic',
    'buyer-2',
    'Green Recycling Co.',
    'orders@greenrecycling.lk',
    '+94 77 987 6543',
    'SUP001',
    1000,
    15.00,
    15000.00,
    'delivered',
    'paid',
    'Digital Wallet',
    CURRENT_TIMESTAMP - INTERVAL '5 days',
    CURRENT_TIMESTAMP - INTERVAL '3 days',
    CURRENT_TIMESTAMP - INTERVAL '3 days',
    '456 Industrial Zone, Gampaha',
    'Gampaha',
    'Gampaha',
    'Western',
    NULL,
    'agent-2',
    'Sarah Perera',
    'TRK-2024-002'
),
-- Order 3: Delivered
(
    'ord-2024-003',
    'ORD-2024-003',
    'mat-3',
    'Cardboard Boxes',
    'paper',
    'buyer-3',
    'EcoPackaging Solutions',
    'purchase@ecopack.lk',
    '+94 77 555 7777',
    'SUP001',
    200,
    45.00,
    9000.00,
    'completed',
    'paid',
    'Bank Transfer',
    CURRENT_TIMESTAMP - INTERVAL '6 days',
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    '789 Export Processing Zone, Katunayake',
    'Katunayake',
    'Gampaha',
    'Western',
    'Fragile items - handle with care',
    'agent-1',
    'John Silva',
    'TRK-2024-003'
)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Verify the data
SELECT 'Orders Count:' as info;
SELECT COUNT(*) as total_orders FROM orders;

SELECT '' as info;
SELECT 'Orders with Deliveries:' as info;
SELECT
    o.id,
    o.order_number,
    o.buyer_name,
    o.material_title,
    o.status as order_status,
    dt.status as delivery_status,
    dt.current_location
FROM orders o
LEFT JOIN delivery_tracking dt ON o.id = dt.order_id
ORDER BY o.created_at DESC;
