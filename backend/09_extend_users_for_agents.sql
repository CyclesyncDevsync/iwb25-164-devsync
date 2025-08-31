-- Add agent-specific fields to the existing users table
-- This extends the users table to support agent management without creating a separate table

-- Add agent-specific columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS specialization VARCHAR(255),
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
ADD COLUMN IF NOT EXISTS location_zone VARCHAR(100),
ADD COLUMN IF NOT EXISTS max_workload INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS total_assignments INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed_assignments INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Create indexes for agent-specific queries
CREATE INDEX IF NOT EXISTS idx_users_role_agent ON users(role) WHERE role = 'agent';
CREATE INDEX IF NOT EXISTS idx_users_specialization ON users(specialization);
CREATE INDEX IF NOT EXISTS idx_users_location_zone ON users(location_zone);
CREATE INDEX IF NOT EXISTS idx_users_rating ON users(rating);
CREATE INDEX IF NOT EXISTS idx_users_status_agent ON users(status, role) WHERE role = 'agent';

-- Insert some sample agent users (only if they don't already exist)
INSERT INTO users (asgardeo_id, email, first_name, last_name, role, status, phone, specialization, rating, location_zone, max_workload, hourly_rate)
VALUES 
    ('agent-001', 'john.smith@cyclesync.com', 'John', 'Smith', 'agent', 'approved', '+1234567890', 'Electronics Recycling', 4.5, 'North Zone', 15, 25.00),
    ('agent-002', 'sarah.johnson@cyclesync.com', 'Sarah', 'Johnson', 'agent', 'approved', '+1234567891', 'Hazardous Waste', 4.8, 'South Zone', 12, 30.00),
    ('agent-003', 'mike.wilson@cyclesync.com', 'Mike', 'Wilson', 'agent', 'pending', '+1234567892', 'Construction Waste', 4.2, 'East Zone', 20, 22.50),
    ('agent-004', 'lisa.brown@cyclesync.com', 'Lisa', 'Brown', 'agent', 'approved', '+1234567893', 'Organic Composting', 4.7, 'West Zone', 18, 28.00),
    ('agent-005', 'david.lee@cyclesync.com', 'David', 'Lee', 'agent', 'rejected', '+1234567894', 'Metal Recycling', 3.9, 'Central Zone', 10, 24.00)
ON CONFLICT (asgardeo_id) DO NOTHING;

-- Create a view for easy agent queries (optional but helpful)
CREATE OR REPLACE VIEW agent_view AS
SELECT 
    id,
    asgardeo_id,
    email,
    first_name,
    last_name,
    phone,
    specialization,
    status,
    rating,
    location_zone,
    max_workload,
    hourly_rate,
    total_assignments,
    completed_assignments,
    profile_image_url,
    created_at,
    updated_at,
    approved_by,
    rejected_by,
    rejection_reason
FROM users 
WHERE role = 'agent';

-- Create a simple function to get agent statistics
CREATE OR REPLACE FUNCTION get_agent_stats()
RETURNS TABLE(
    total_agents BIGINT,
    approved_agents BIGINT,
    pending_agents BIGINT,
    rejected_agents BIGINT,
    average_rating DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_agents,
        COUNT(*) FILTER (WHERE status = 'approved') as approved_agents,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_agents,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected_agents,
        COALESCE(AVG(rating), 0.0) as average_rating
    FROM users 
    WHERE role = 'agent';
END;
$$ LANGUAGE plpgsql;
