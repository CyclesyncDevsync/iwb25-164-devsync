-- Step 1: Create Tables Only
-- Run this file first in Neon SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
DO $$ BEGIN
    CREATE TYPE waste_category_enum AS ENUM ('recyclable', 'hazardous', 'compostable', 'reusable');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE market_trend_enum AS ENUM ('increasing', 'decreasing', 'stable', 'volatile');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE confidence_level_enum AS ENUM ('low', 'medium', 'high');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE source_industry_enum AS ENUM ('manufacturing', 'retail', 'construction', 'residential', 'commercial', 'agricultural');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Waste Types Table
CREATE TABLE IF NOT EXISTS waste_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category waste_category_enum NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    base_quantity DECIMAL(10,2) NOT NULL,
    seasonality_factor DECIMAL(3,2) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Locations Table
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    population INTEGER DEFAULT 0,
    economic_index DECIMAL(5,2) DEFAULT 50.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    location_id UUID REFERENCES locations(id),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    industry source_industry_enum DEFAULT 'commercial',
    capacity_tons_per_month DECIMAL(10,2) DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Waste Data Points Table
CREATE TABLE IF NOT EXISTS waste_data_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    waste_type_id UUID REFERENCES waste_types(id) NOT NULL,
    location_id UUID REFERENCES locations(id) NOT NULL,
    supplier_id UUID REFERENCES suppliers(id),
    quantity DECIMAL(10,2) NOT NULL,
    price_per_ton DECIMAL(10,2) NOT NULL,
    quality_purity DECIMAL(5,2) DEFAULT 0.0,
    quality_contamination DECIMAL(5,2) DEFAULT 0.0,
    quality_moisture DECIMAL(5,2) DEFAULT 0.0,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Market Data Table
CREATE TABLE IF NOT EXISTS market_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    waste_type_id UUID REFERENCES waste_types(id) NOT NULL,
    location_id UUID REFERENCES locations(id) NOT NULL,
    avg_price DECIMAL(10,2) NOT NULL,
    volatility DECIMAL(5,4) DEFAULT 0.0,
    trend market_trend_enum DEFAULT 'stable',
    demand_index DECIMAL(5,4) DEFAULT 0.5,
    supply_index DECIMAL(5,4) DEFAULT 0.5,
    competition_level DECIMAL(5,4) DEFAULT 0.5,
    market_share DECIMAL(5,4) DEFAULT 0.0,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Demand Forecasts Table
CREATE TABLE IF NOT EXISTS demand_forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    waste_type_id UUID REFERENCES waste_types(id) NOT NULL,
    location_id UUID REFERENCES locations(id) NOT NULL,
    forecast_date DATE NOT NULL,
    predicted_demand DECIMAL(10,2) NOT NULL,
    predicted_price DECIMAL(10,2) NOT NULL,
    confidence_level confidence_level_enum DEFAULT 'medium',
    model_accuracy DECIMAL(5,4) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Pricing Recommendations Table
CREATE TABLE IF NOT EXISTS pricing_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    waste_type_id UUID REFERENCES waste_types(id) NOT NULL,
    location_id UUID REFERENCES locations(id) NOT NULL,
    recommended_price DECIMAL(10,2) NOT NULL,
    min_price DECIMAL(10,2) NOT NULL,
    max_price DECIMAL(10,2) NOT NULL,
    confidence_score DECIMAL(5,4) DEFAULT 0.0,
    factors_considered TEXT[],
    valid_until TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Market Conditions Table
CREATE TABLE IF NOT EXISTS market_conditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES locations(id) NOT NULL,
    fuel_price DECIMAL(10,2) NOT NULL,
    exchange_rate DECIMAL(10,4) NOT NULL,
    economic_index DECIMAL(5,2) NOT NULL,
    inflation_rate DECIMAL(5,2) DEFAULT 0.0,
    transport_cost_factor DECIMAL(5,2) DEFAULT 1.0,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_waste_data_points_waste_type ON waste_data_points(waste_type_id);
CREATE INDEX IF NOT EXISTS idx_waste_data_points_location ON waste_data_points(location_id);
CREATE INDEX IF NOT EXISTS idx_waste_data_points_recorded_at ON waste_data_points(recorded_at);
CREATE INDEX IF NOT EXISTS idx_market_data_composite ON market_data(waste_type_id, location_id, recorded_at);

-- 9. Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    preferences JSONB DEFAULT '{"categories": ["business", "technology", "sustainability"]}',
    last_sent_at TIMESTAMP,
    unsubscribe_token VARCHAR(255) UNIQUE
);