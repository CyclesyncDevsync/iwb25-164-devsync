-- Insert delivery data

INSERT INTO delivery_tracking (id, order_id, status, current_location, estimated_delivery_date, driver_name, driver_phone, vehicle_number, notes, created_at, updated_at) VALUES
('delivery-001', 'ord-2024-001', 'in_transit', 'Pune Distribution Center', CURRENT_TIMESTAMP + INTERVAL '1 day', 'Rajesh Kumar', '+91 98765 00001', 'MH-12-AB-1234', 'Handle with care', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('delivery-002', 'ord-2024-002', 'delivered', 'Customer Location', CURRENT_TIMESTAMP - INTERVAL '8 days', 'Amit Sharma', '+91 98765 00002', 'DL-10-CD-5678', 'Delivered', CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '3 days'),
('delivery-003', 'ord-2024-003', 'delivered', 'Customer Location', CURRENT_TIMESTAMP - INTERVAL '5 days', 'Suresh Patel', '+91 98765 00003', 'KA-01-EF-9012', 'Delivered', CURRENT_TIMESTAMP - INTERVAL '6 days', CURRENT_TIMESTAMP - INTERVAL '1 day');

INSERT INTO delivery_updates (id, delivery_id, status, location, timestamp, description, updated_by, latitude, longitude) VALUES
('u1', 'delivery-001', 'in_transit', 'Pune', CURRENT_TIMESTAMP, 'On the way', 'system', 18.5204, 73.8567),
('u2', 'delivery-001', 'picked_up', 'Mumbai', CURRENT_TIMESTAMP - INTERVAL '1 day', 'Picked up', 'driver', 19.0760, 72.8777),
('u3', 'delivery-001', 'pickup_scheduled', 'Supplier', CURRENT_TIMESTAMP - INTERVAL '2 days', 'Scheduled', 'system', 19.0760, 72.8777),
('u4', 'delivery-002', 'delivered', 'Customer', CURRENT_TIMESTAMP - INTERVAL '3 days', 'Delivered', 'driver', 28.7041, 77.1025),
('u5', 'delivery-002', 'out_for_delivery', 'Delhi', CURRENT_TIMESTAMP - INTERVAL '3 days', 'Out', 'system', 28.6139, 77.2090),
('u6', 'delivery-002', 'in_transit', 'Transit', CURRENT_TIMESTAMP - INTERVAL '4 days', 'Transit', 'system', 28.4595, 77.0266),
('u7', 'delivery-002', 'picked_up', 'Supplier', CURRENT_TIMESTAMP - INTERVAL '5 days', 'Picked', 'driver', 28.7041, 77.1025),
('u8', 'delivery-003', 'delivered', 'Bangalore', CURRENT_TIMESTAMP - INTERVAL '1 day', 'Delivered', 'driver', 12.9716, 77.5946),
('u9', 'delivery-003', 'out_for_delivery', 'Bangalore', CURRENT_TIMESTAMP - INTERVAL '1 day', 'Out', 'system', 12.9716, 77.5946),
('u10', 'delivery-003', 'in_transit', 'Transit', CURRENT_TIMESTAMP - INTERVAL '3 days', 'Transit', 'system', 7.1907, 79.8838),
('u11', 'delivery-003', 'picked_up', 'Katunayake', CURRENT_TIMESTAMP - INTERVAL '6 days', 'Picked', 'driver', 7.1907, 79.8838);
