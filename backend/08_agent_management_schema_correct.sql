-- Agent Management Schema Update
-- This script updates the agents table to match the service expectations

-- Drop existing agents table if it doesn't match the expected schema
DROP TABLE IF EXISTS agent_assignments CASCADE;
DROP TABLE IF EXISTS agent_performance CASCADE;
DROP TABLE IF EXISTS agents CASCADE;

-- Create agents table with the correct schema that matches the service
CREATE TABLE IF NOT EXISTS agents (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL, -- Changed to VARCHAR to match service expectations
    first_name VARCHAR(255),
    last_name VARCHAR(255), 
    phone VARCHAR(20),
    specialization VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    total_materials_collected INTEGER DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0.0,
    location_zone VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_specialization ON agents(specialization);
CREATE INDEX IF NOT EXISTS idx_agents_location_zone ON agents(location_zone);

-- Create agent_locations table for location tracking (optional)
CREATE TABLE IF NOT EXISTS agent_locations (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES agents(id) ON DELETE CASCADE,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    address TEXT,
    zone VARCHAR(255),
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for location queries
CREATE INDEX IF NOT EXISTS idx_agent_locations_agent_id ON agent_locations(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_locations_current ON agent_locations(is_current);

-- Insert some sample agent data for testing
INSERT INTO agents (user_id, first_name, last_name, phone, specialization, status, location_zone) VALUES
('agent1', 'John', 'Doe', '+1234567890', 'Electronics', 'approved', 'North Zone'),
('agent2', 'Jane', 'Smith', '+1234567891', 'Metal Recycling', 'approved', 'South Zone'),
('agent3', 'Mike', 'Johnson', '+1234567892', 'Plastic Recycling', 'pending', 'East Zone'),
('agent4', 'Sarah', 'Williams', '+1234567893', 'Paper Recycling', 'approved', 'West Zone'),
('agent5', 'David', 'Brown', '+1234567894', 'Glass Recycling', 'approved', 'Central Zone');

-- Update the updated_at timestamp trigger (optional)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for agents table
DROP TRIGGER IF EXISTS update_agents_updated_at ON agents;
CREATE TRIGGER update_agents_updated_at
    BEFORE UPDATE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
