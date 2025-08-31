-- Create test user for wallet functionality testing

INSERT INTO users (asgardeo_id, email, first_name, last_name, role, status, created_at, updated_at)
VALUES (
    'test-user-123',
    'testuser@cyclesync.com', 
    'Test', 
    'User', 
    'buyer', 
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

-- Also ensure we have a user with ID 1 for testing
INSERT INTO users (id, asgardeo_id, email, first_name, last_name, role, status, created_at, updated_at)
VALUES (
    1,
    'test-user-id-1',
    'user1@cyclesync.com', 
    'User', 
    'One', 
    'buyer', 
    'approved', 
    NOW(), 
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    asgardeo_id = EXCLUDED.asgardeo_id,
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    updated_at = NOW();

-- Verify users were created
SELECT id, asgardeo_id, email, first_name, last_name, role, status 
FROM users 
WHERE id = 1 OR email IN ('testuser@cyclesync.com');