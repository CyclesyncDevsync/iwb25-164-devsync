-- Step 2: Insert Master Data
-- Run this file second in Neon SQL Editor

-- Insert waste types
INSERT INTO waste_types (name, category, base_price, base_quantity, seasonality_factor) VALUES
('plastic', 'recyclable', 450.00, 15.5, 0.3),
('metal', 'recyclable', 890.00, 8.2, 0.2),
('organic', 'compostable', 85.00, 45.8, 0.7),
('paper', 'recyclable', 120.00, 22.1, 0.4),
('glass', 'recyclable', 95.00, 6.7, 0.1);

-- Insert Sri Lankan locations
INSERT INTO locations (city, province, latitude, longitude, population, economic_index) VALUES
('Colombo', 'Western Province', 6.9271, 79.8612, 750000, 85.5),
('Galle', 'Southern Province', 6.0535, 80.2210, 120000, 72.3),
('Kandy', 'Central Province', 7.2906, 80.6337, 125000, 78.1),
('Negombo', 'Western Province', 7.2083, 79.8358, 140000, 75.8),
('Jaffna', 'Northern Province', 9.6615, 80.0255, 88000, 68.5);

-- Insert suppliers
INSERT INTO suppliers (name, location_id, contact_email, contact_phone, industry, capacity_tons_per_month, verified)
SELECT 'Green Recyclers Ltd', l.id, 'info@greenrecyclers.lk', '+94112234567', 'manufacturing', 150.5, true
FROM locations l WHERE l.city = 'Colombo';

INSERT INTO suppliers (name, location_id, contact_email, contact_phone, industry, capacity_tons_per_month, verified)
SELECT 'Eco Solutions Pvt Ltd', l.id, 'contact@ecosolutions.lk', '+94112345678', 'commercial', 200.8, true
FROM locations l WHERE l.city = 'Colombo';

INSERT INTO suppliers (name, location_id, contact_email, contact_phone, industry, capacity_tons_per_month, verified)
SELECT 'Sustainable Resources Inc', l.id, 'hello@sustainable.lk', '+94912234567', 'retail', 85.2, true
FROM locations l WHERE l.city = 'Galle';

INSERT INTO suppliers (name, location_id, contact_email, contact_phone, industry, capacity_tons_per_month, verified)
SELECT 'Clean Earth Solutions', l.id, 'support@cleanearth.lk', '+94812345678', 'residential', 120.5, false
FROM locations l WHERE l.city = 'Kandy';

INSERT INTO suppliers (name, location_id, contact_email, contact_phone, industry, capacity_tons_per_month, verified)
SELECT 'Metro Waste Management', l.id, 'info@metrowaste.lk', '+94312234567', 'commercial', 175.3, true
FROM locations l WHERE l.city = 'Negombo';

-- Verify data
SELECT 'Waste Types: ' || COUNT(*) FROM waste_types;
SELECT 'Locations: ' || COUNT(*) FROM locations;
SELECT 'Suppliers: ' || COUNT(*) FROM suppliers;