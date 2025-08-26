-- CircularSync User Management Database Schema

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    asgardeo_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('super_admin', 'admin', 'agent', 'supplier', 'buyer')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by VARCHAR(255), -- admin user ID who approved
    rejected_by VARCHAR(255),  -- admin user ID who rejected
    rejection_reason TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_asgardeo_id ON users(asgardeo_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Create default super admin user (should be updated with real Asgardeo ID)
INSERT INTO users (asgardeo_id, email, first_name, last_name, role, status, created_at, updated_at)
VALUES ('default-super-admin-id', 'superadmin@cyclesync.com', 'Super', 'Admin', 'super_admin', 'approved', NOW(), NOW())
ON CONFLICT (asgardeo_id) DO NOTHING;

-- Create sample admin user (should be updated with real Asgardeo ID)
INSERT INTO users (asgardeo_id, email, first_name, last_name, role, status, created_at, updated_at)
VALUES ('default-admin-id', 'admin@cyclesync.com', 'Admin', 'User', 'admin', 'approved', NOW(), NOW())
ON CONFLICT (asgardeo_id) DO NOTHING;