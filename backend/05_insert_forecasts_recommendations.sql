-- Step 5: Insert Forecasts and Recommendations
-- Run this file last in Neon SQL Editor

-- Insert demand forecasts for plastic
INSERT INTO demand_forecasts (waste_type_id, location_id, forecast_date, predicted_demand, predicted_price, confidence_level, model_accuracy, created_at)
SELECT wt.id, l.id, NOW() + INTERVAL '7 days', 180.5, 525.00, 'high', 0.85, NOW()
FROM waste_types wt, locations l
WHERE wt.name = 'plastic' AND l.city = 'Colombo';

INSERT INTO demand_forecasts (waste_type_id, location_id, forecast_date, predicted_demand, predicted_price, confidence_level, model_accuracy, created_at)
SELECT wt.id, l.id, NOW() + INTERVAL '14 days', 195.2, 530.50, 'high', 0.82, NOW()
FROM waste_types wt, locations l
WHERE wt.name = 'plastic' AND l.city = 'Colombo';

INSERT INTO demand_forecasts (waste_type_id, location_id, forecast_date, predicted_demand, predicted_price, confidence_level, model_accuracy, created_at)
SELECT wt.id, l.id, NOW() + INTERVAL '30 days', 220.8, 545.75, 'medium', 0.78, NOW()
FROM waste_types wt, locations l
WHERE wt.name = 'plastic' AND l.city = 'Colombo';

-- Insert demand forecasts for metal
INSERT INTO demand_forecasts (waste_type_id, location_id, forecast_date, predicted_demand, predicted_price, confidence_level, model_accuracy, created_at)
SELECT wt.id, l.id, NOW() + INTERVAL '7 days', 95.5, 1260.00, 'high', 0.88, NOW()
FROM waste_types wt, locations l
WHERE wt.name = 'metal' AND l.city = 'Colombo';

INSERT INTO demand_forecasts (waste_type_id, location_id, forecast_date, predicted_demand, predicted_price, confidence_level, model_accuracy, created_at)
SELECT wt.id, l.id, NOW() + INTERVAL '14 days', 102.2, 1275.50, 'high', 0.85, NOW()
FROM waste_types wt, locations l
WHERE wt.name = 'metal' AND l.city = 'Colombo';

-- Insert pricing recommendations for plastic
INSERT INTO pricing_recommendations (waste_type_id, location_id, recommended_price, min_price, max_price, confidence_score, factors_considered, created_at)
SELECT wt.id, l.id, 522.50, 495.00, 550.00, 0.87, ARRAY['market_trend', 'competition', 'quality', 'demand'], NOW()
FROM waste_types wt, locations l
WHERE wt.name = 'plastic' AND l.city = 'Colombo';

INSERT INTO pricing_recommendations (waste_type_id, location_id, recommended_price, min_price, max_price, confidence_score, factors_considered, created_at)
SELECT wt.id, l.id, 518.25, 490.00, 545.00, 0.83, ARRAY['market_trend', 'competition', 'quality', 'demand'], NOW()
FROM waste_types wt, locations l
WHERE wt.name = 'plastic' AND l.city = 'Galle';

-- Insert pricing recommendations for metal
INSERT INTO pricing_recommendations (waste_type_id, location_id, recommended_price, min_price, max_price, confidence_score, factors_considered, created_at)
SELECT wt.id, l.id, 1255.75, 1200.00, 1310.00, 0.91, ARRAY['market_trend', 'supply', 'quality', 'transport'], NOW()
FROM waste_types wt, locations l
WHERE wt.name = 'metal' AND l.city = 'Colombo';

INSERT INTO pricing_recommendations (waste_type_id, location_id, recommended_price, min_price, max_price, confidence_score, factors_considered, created_at)
SELECT wt.id, l.id, 1258.50, 1210.00, 1305.00, 0.89, ARRAY['market_trend', 'supply', 'quality', 'transport'], NOW()
FROM waste_types wt, locations l
WHERE wt.name = 'metal' AND l.city = 'Galle';

-- Insert pricing recommendations for other materials
INSERT INTO pricing_recommendations (waste_type_id, location_id, recommended_price, min_price, max_price, confidence_score, factors_considered, created_at)
SELECT wt.id, l.id, 96.25, 88.00, 105.00, 0.73, ARRAY['seasonality', 'perishability', 'demand'], NOW()
FROM waste_types wt, locations l
WHERE wt.name = 'organic' AND l.city = 'Colombo';

INSERT INTO pricing_recommendations (waste_type_id, location_id, recommended_price, min_price, max_price, confidence_score, factors_considered, created_at)
SELECT wt.id, l.id, 148.50, 135.00, 162.00, 0.79, ARRAY['market_trend', 'recycling_demand'], NOW()
FROM waste_types wt, locations l
WHERE wt.name = 'paper' AND l.city = 'Colombo';

INSERT INTO pricing_recommendations (waste_type_id, location_id, recommended_price, min_price, max_price, confidence_score, factors_considered, created_at)
SELECT wt.id, l.id, 127.75, 118.00, 138.00, 0.75, ARRAY['quality', 'transport'], NOW()
FROM waste_types wt, locations l
WHERE wt.name = 'glass' AND l.city = 'Colombo';

-- Final verification
SELECT 'Final Database Summary:';
SELECT 'Waste Types: ' || COUNT(*) FROM waste_types;
SELECT 'Locations: ' || COUNT(*) FROM locations;
SELECT 'Suppliers: ' || COUNT(*) FROM suppliers;
SELECT 'Price Data Points: ' || COUNT(*) FROM waste_data_points;
SELECT 'Market Data: ' || COUNT(*) FROM market_data;
SELECT 'Market Conditions: ' || COUNT(*) FROM market_conditions;
SELECT 'Demand Forecasts: ' || COUNT(*) FROM demand_forecasts;
SELECT 'Pricing Recommendations: ' || COUNT(*) FROM pricing_recommendations;