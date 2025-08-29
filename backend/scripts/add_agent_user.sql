-- Add Agent User to CycleSync Database
-- Execute this script to add the agent user

INSERT INTO users (asgardeo_id, email, first_name, last_name, role, status, created_at, updated_at)
VALUES (
    'bcee8b75-d97a-4a72-b7a9-686be582dc45',
    'agent@cyclesync.com', 
    'Agent', 
    'User', 
    'agent', 
    'approved', 
    NOW(), 
    NOW()
)
ON CONFLICT (asgardeo_id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    updated_at = NOW();

-- Verify the user was created
SELECT id, asgardeo_id, email, first_name, last_name, role, status, created_at 
FROM users 
WHERE email = 'agent@cyclesync.com';