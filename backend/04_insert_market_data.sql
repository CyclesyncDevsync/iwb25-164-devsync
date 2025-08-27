-- Step 4: Insert Market Analysis Data
-- Run this file fourth in Neon SQL Editor

-- Current market data for plastic
INSERT INTO market_data (waste_type_id, location_id, avg_price, volatility, trend, demand_index, supply_index, competition_level, market_share, recorded_at)
SELECT wt.id, l.id, 518.50, 0.12, 'increasing', 0.78, 0.65, 0.45, 0.32, NOW()
FROM waste_types wt, locations l
WHERE wt.name = 'plastic' AND l.city = 'Colombo';

INSERT INTO market_data (waste_type_id, location_id, avg_price, volatility, trend, demand_index, supply_index, competition_level, market_share, recorded_at)
SELECT wt.id, l.id, 512.25, 0.15, 'increasing', 0.72, 0.68, 0.38, 0.28, NOW()
FROM waste_types wt, locations l
WHERE wt.name = 'plastic' AND l.city = 'Galle';

-- Current market data for metal
INSERT INTO market_data (waste_type_id, location_id, avg_price, volatility, trend, demand_index, supply_index, competition_level, market_share, recorded_at)
SELECT wt.id, l.id, 1248.75, 0.08, 'increasing', 0.82, 0.58, 0.35, 0.45, NOW()
FROM waste_types wt, locations l
WHERE wt.name = 'metal' AND l.city = 'Colombo';

INSERT INTO market_data (waste_type_id, location_id, avg_price, volatility, trend, demand_index, supply_index, competition_level, market_share, recorded_at)
SELECT wt.id, l.id, 1251.25, 0.10, 'increasing', 0.79, 0.61, 0.32, 0.41, NOW()
FROM waste_types wt, locations l
WHERE wt.name = 'metal' AND l.city = 'Galle';

-- Current market data for organic
INSERT INTO market_data (waste_type_id, location_id, avg_price, volatility, trend, demand_index, supply_index, competition_level, market_share, recorded_at)
SELECT wt.id, l.id, 94.65, 0.25, 'stable', 0.68, 0.75, 0.55, 0.22, NOW()
FROM waste_types wt, locations l
WHERE wt.name = 'organic' AND l.city = 'Colombo';

-- Current market data for paper
INSERT INTO market_data (waste_type_id, location_id, avg_price, volatility, trend, demand_index, supply_index, competition_level, market_share, recorded_at)
SELECT wt.id, l.id, 145.75, 0.14, 'increasing', 0.73, 0.67, 0.41, 0.35, NOW()
FROM waste_types wt, locations l
WHERE wt.name = 'paper' AND l.city = 'Colombo';

-- Current market data for glass
INSERT INTO market_data (waste_type_id, location_id, avg_price, volatility, trend, demand_index, supply_index, competition_level, market_share, recorded_at)
SELECT wt.id, l.id, 125.50, 0.09, 'stable', 0.64, 0.72, 0.33, 0.42, NOW()
FROM waste_types wt, locations l
WHERE wt.name = 'glass' AND l.city = 'Colombo';

-- Insert market conditions
INSERT INTO market_conditions (location_id, fuel_price, exchange_rate, economic_index, inflation_rate, transport_cost_factor, recorded_at)
SELECT l.id, 165.50, 320.75, 78.5, 12.3, 1.15, NOW()
FROM locations l WHERE l.city = 'Colombo';

INSERT INTO market_conditions (location_id, fuel_price, exchange_rate, economic_index, inflation_rate, transport_cost_factor, recorded_at)
SELECT l.id, 162.25, 320.75, 72.1, 11.8, 1.22, NOW()
FROM locations l WHERE l.city = 'Galle';

INSERT INTO market_conditions (location_id, fuel_price, exchange_rate, economic_index, inflation_rate, transport_cost_factor, recorded_at)
SELECT l.id, 168.75, 320.75, 75.4, 12.1, 1.18, NOW()
FROM locations l WHERE l.city = 'Kandy';

-- Verify market data
SELECT 'Market Data Records: ' || COUNT(*) FROM market_data;
SELECT 'Market Conditions Records: ' || COUNT(*) FROM market_conditions;