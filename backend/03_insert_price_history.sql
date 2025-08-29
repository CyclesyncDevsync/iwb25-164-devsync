-- Step 3: Insert Price History Data
-- Run this file third in Neon SQL Editor

-- Recent plastic prices (last 5 days) - showing upward trend
INSERT INTO waste_data_points (waste_type_id, location_id, supplier_id, quantity, price_per_ton, quality_purity, quality_contamination, quality_moisture, recorded_at)
SELECT wt.id, l.id, s.id, 45.5, 520.00, 88.5, 2.1, NOW() - INTERVAL '1 day'
FROM waste_types wt, locations l, suppliers s
WHERE wt.name = 'plastic' AND l.city = 'Colombo' AND s.name = 'Green Recyclers Ltd';

INSERT INTO waste_data_points (waste_type_id, location_id, supplier_id, quantity, price_per_ton, quality_purity, quality_contamination, quality_moisture, recorded_at)
SELECT wt.id, l.id, s.id, 38.2, 515.50, 90.2, 1.8, NOW() - INTERVAL '2 days'
FROM waste_types wt, locations l, suppliers s
WHERE wt.name = 'plastic' AND l.city = 'Colombo' AND s.name = 'Eco Solutions Pvt Ltd';

INSERT INTO waste_data_points (waste_type_id, location_id, supplier_id, quantity, price_per_ton, quality_purity, quality_contamination, quality_moisture, recorded_at)
SELECT wt.id, l.id, s.id, 52.1, 510.75, 87.3, 2.5, NOW() - INTERVAL '3 days'
FROM waste_types wt, locations l, suppliers s
WHERE wt.name = 'plastic' AND l.city = 'Galle' AND s.name = 'Sustainable Resources Inc';

INSERT INTO waste_data_points (waste_type_id, location_id, supplier_id, quantity, price_per_ton, quality_purity, quality_contamination, quality_moisture, recorded_at)
SELECT wt.id, l.id, s.id, 41.8, 505.25, 89.1, 2.0, NOW() - INTERVAL '4 days'
FROM waste_types wt, locations l, suppliers s
WHERE wt.name = 'plastic' AND l.city = 'Kandy' AND s.name = 'Clean Earth Solutions';

INSERT INTO waste_data_points (waste_type_id, location_id, supplier_id, quantity, price_per_ton, quality_purity, quality_contamination, quality_moisture, recorded_at)
SELECT wt.id, l.id, s.id, 47.3, 500.10, 86.8, 2.7, NOW() - INTERVAL '5 days'
FROM waste_types wt, locations l, suppliers s
WHERE wt.name = 'plastic' AND l.city = 'Negombo' AND s.name = 'Metro Waste Management';

-- Historical plastic prices (30 days ago) - lower prices
INSERT INTO waste_data_points (waste_type_id, location_id, supplier_id, quantity, price_per_ton, quality_purity, quality_contamination, quality_moisture, recorded_at)
SELECT wt.id, l.id, s.id, 42.1, 485.00, 87.2, 2.8, NOW() - INTERVAL '30 days'
FROM waste_types wt, locations l, suppliers s
WHERE wt.name = 'plastic' AND l.city = 'Colombo' AND s.name = 'Green Recyclers Ltd';

INSERT INTO waste_data_points (waste_type_id, location_id, supplier_id, quantity, price_per_ton, quality_purity, quality_contamination, quality_moisture, recorded_at)
SELECT wt.id, l.id, s.id, 39.8, 478.50, 88.5, 2.3, NOW() - INTERVAL '32 days'
FROM waste_types wt, locations l, suppliers s
WHERE wt.name = 'plastic' AND l.city = 'Galle' AND s.name = 'Sustainable Resources Inc';

-- Older plastic prices (60 days ago) - even lower prices
INSERT INTO waste_data_points (waste_type_id, location_id, supplier_id, quantity, price_per_ton, quality_purity, quality_contamination, quality_moisture, recorded_at)
SELECT wt.id, l.id, s.id, 38.1, 445.00, 85.2, 3.2, NOW() - INTERVAL '60 days'
FROM waste_types wt, locations l, suppliers s
WHERE wt.name = 'plastic' AND l.city = 'Colombo' AND s.name = 'Green Recyclers Ltd';

INSERT INTO waste_data_points (waste_type_id, location_id, supplier_id, quantity, price_per_ton, quality_purity, quality_contamination, quality_moisture, recorded_at)
SELECT wt.id, l.id, s.id, 41.8, 438.50, 86.8, 2.9, NOW() - INTERVAL '65 days'
FROM waste_types wt, locations l, suppliers s
WHERE wt.name = 'plastic' AND l.city = 'Galle' AND s.name = 'Sustainable Resources Inc';

-- Recent metal prices
INSERT INTO waste_data_points (waste_type_id, location_id, supplier_id, quantity, price_per_ton, quality_purity, quality_contamination, quality_moisture, recorded_at)
SELECT wt.id, l.id, s.id, 25.4, 1250.00, 92.1, 1.2, NOW() - INTERVAL '1 day'
FROM waste_types wt, locations l, suppliers s
WHERE wt.name = 'metal' AND l.city = 'Colombo' AND s.name = 'Green Recyclers Ltd';

INSERT INTO waste_data_points (waste_type_id, location_id, supplier_id, quantity, price_per_ton, quality_purity, quality_contamination, quality_moisture, recorded_at)
SELECT wt.id, l.id, s.id, 28.7, 1245.50, 91.8, 1.5, NOW() - INTERVAL '2 days'
FROM waste_types wt, locations l, suppliers s
WHERE wt.name = 'metal' AND l.city = 'Colombo' AND s.name = 'Eco Solutions Pvt Ltd';

-- Historical metal prices
INSERT INTO waste_data_points (waste_type_id, location_id, supplier_id, quantity, price_per_ton, quality_purity, quality_contamination, quality_moisture, recorded_at)
SELECT wt.id, l.id, s.id, 23.1, 1180.00, 90.2, 1.8, NOW() - INTERVAL '30 days'
FROM waste_types wt, locations l, suppliers s
WHERE wt.name = 'metal' AND l.city = 'Colombo' AND s.name = 'Green Recyclers Ltd';

INSERT INTO waste_data_points (waste_type_id, location_id, supplier_id, quantity, price_per_ton, quality_purity, quality_contamination, quality_moisture, recorded_at)
SELECT wt.id, l.id, s.id, 21.1, 1120.00, 88.2, 2.1, NOW() - INTERVAL '60 days'
FROM waste_types wt, locations l, suppliers s
WHERE wt.name = 'metal' AND l.city = 'Colombo' AND s.name = 'Green Recyclers Ltd';

-- Verify price data
SELECT 'Price Data Points: ' || COUNT(*) FROM waste_data_points;