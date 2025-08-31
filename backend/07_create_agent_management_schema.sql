-- Agent Management Tables
-- This script creates tables for managing field agents

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
    id SERIAL PRIMARY KEY,
    agent_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    location VARCHAR(500) NOT NULL,
    assigned_area VARCHAR(500) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    verification_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    specializations TEXT[], -- Array of specialization strings
    total_assignments INTEGER DEFAULT 0,
    completed_assignments INTEGER DEFAULT 0,
    current_workload INTEGER DEFAULT 0,
    max_workload INTEGER DEFAULT 10,
    hourly_rate DECIMAL(10,2),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_location ON agents(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_email ON agents(email);
CREATE INDEX IF NOT EXISTS idx_agents_agent_id ON agents(agent_id);

-- Create agent specializations lookup table for better normalization (optional)
CREATE TABLE IF NOT EXISTS agent_specializations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default specializations
INSERT INTO agent_specializations (name, description) VALUES
('Electronics', 'Electronic waste and devices recycling'),
('Metal Recycling', 'Ferrous and non-ferrous metal processing'),
('Plastic Recycling', 'Various types of plastic waste processing'),
('Paper Recycling', 'Paper and cardboard waste processing'),
('Textiles', 'Clothing and fabric waste processing'),
('Glass Recycling', 'Glass containers and materials processing'),
('Organic Waste', 'Biodegradable and compostable materials'),
('Hazardous Materials', 'Safe handling of dangerous waste materials'),
('Construction Materials', 'Building and construction waste processing'),
('Furniture', 'Furniture and home goods recycling'),
('Appliances', 'Large household appliance processing'),
('Automotive Parts', 'Vehicle parts and components recycling'),
('General Waste', 'Mixed and general waste materials')
ON CONFLICT (name) DO NOTHING;

-- Create agent assignments tracking table
CREATE TABLE IF NOT EXISTS agent_assignments (
    id SERIAL PRIMARY KEY,
    assignment_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES agents(agent_id) ON DELETE CASCADE,
    material_submission_id UUID, -- Reference to material submission
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'assigned' CHECK (status IN ('assigned', 'accepted', 'in_progress', 'completed', 'cancelled')),
    estimated_duration INTEGER, -- in minutes
    actual_duration INTEGER, -- in minutes
    travel_distance DECIMAL(10,2), -- in kilometers
    travel_cost DECIMAL(10,2),
    service_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    notes TEXT,
    feedback_rating DECIMAL(3,2) CHECK (feedback_rating >= 0 AND feedback_rating <= 5),
    feedback_comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for agent assignments
CREATE INDEX IF NOT EXISTS idx_agent_assignments_agent_id ON agent_assignments(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_assignments_status ON agent_assignments(status);
CREATE INDEX IF NOT EXISTS idx_agent_assignments_assigned_at ON agent_assignments(assigned_at);

-- Create agent performance metrics table
CREATE TABLE IF NOT EXISTS agent_performance (
    id SERIAL PRIMARY KEY,
    agent_id UUID REFERENCES agents(agent_id) ON DELETE CASCADE,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    assignments_count INTEGER DEFAULT 0,
    completions_count INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0.0,
    average_rating DECIMAL(3,2) DEFAULT 0.0,
    total_earnings DECIMAL(10,2) DEFAULT 0.0,
    average_response_time INTEGER DEFAULT 0, -- in minutes
    on_time_completion_rate DECIMAL(5,2) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agent_id, month, year)
);

-- Create index for agent performance
CREATE INDEX IF NOT EXISTS idx_agent_performance_agent_id ON agent_performance(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_performance_month_year ON agent_performance(year, month);

-- Create trigger to update agent statistics
CREATE OR REPLACE FUNCTION update_agent_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update agent's assignment counts and rating
    UPDATE agents 
    SET 
        total_assignments = (
            SELECT COUNT(*) 
            FROM agent_assignments 
            WHERE agent_id = NEW.agent_id
        ),
        completed_assignments = (
            SELECT COUNT(*) 
            FROM agent_assignments 
            WHERE agent_id = NEW.agent_id AND status = 'completed'
        ),
        rating = (
            SELECT COALESCE(AVG(feedback_rating), 0) 
            FROM agent_assignments 
            WHERE agent_id = NEW.agent_id AND feedback_rating IS NOT NULL
        ),
        verification_count = (
            SELECT COUNT(*) 
            FROM agent_assignments 
            WHERE agent_id = NEW.agent_id AND status = 'completed'
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE agent_id = NEW.agent_id;

    -- Update current workload
    UPDATE agents 
    SET 
        current_workload = (
            SELECT COUNT(*) 
            FROM agent_assignments 
            WHERE agent_id = NEW.agent_id AND status IN ('assigned', 'accepted', 'in_progress')
        )
    WHERE agent_id = NEW.agent_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_agent_stats ON agent_assignments;
CREATE TRIGGER trigger_update_agent_stats
    AFTER INSERT OR UPDATE OR DELETE ON agent_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_agent_stats();

-- Create function to update last_active timestamp
CREATE OR REPLACE FUNCTION update_agent_last_active(agent_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE agents 
    SET last_active = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE agent_id = agent_uuid;
END;
$$ LANGUAGE plpgsql;

-- Add some sample agents for testing (optional)
-- Uncomment the following lines to insert sample data

/*
-- Sample agents
INSERT INTO agents (
    name, email, phone, location, assigned_area, 
    specializations, max_workload, hourly_rate, 
    latitude, longitude, user_id
) VALUES 
(
    'John Smith', 
    'john.smith@cyclesync.com', 
    '+1-555-0123', 
    'New York, NY', 
    'Manhattan District',
    ARRAY['Electronics', 'Metal Recycling'],
    15,
    25.00,
    40.7614327,
    -73.9776831,
    (SELECT id FROM users WHERE email = 'admin@cyclesync.com' LIMIT 1)
),
(
    'Sarah Johnson', 
    'sarah.j@cyclesync.com', 
    '+1-555-0124', 
    'Los Angeles, CA', 
    'Downtown LA',
    ARRAY['Plastic Recycling', 'Textiles'],
    12,
    22.50,
    34.0407056,
    -118.2467693,
    (SELECT id FROM users WHERE email = 'admin@cyclesync.com' LIMIT 1)
),
(
    'Mike Wilson', 
    'mike.wilson@cyclesync.com', 
    '+1-555-0125', 
    'Chicago, IL', 
    'North Chicago',
    ARRAY['Paper Recycling'],
    10,
    20.00,
    41.8755616,
    -87.6244212,
    (SELECT id FROM users WHERE email = 'admin@cyclesync.com' LIMIT 1)
);
*/
