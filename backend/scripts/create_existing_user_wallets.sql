-- Create wallets for all existing users who don't have them yet

-- First, create the shared admin wallet if it doesn't exist
INSERT INTO user_wallets (user_id, wallet_type, available_balance, frozen_balance, is_shared, created_at, updated_at)
SELECT NULL, 'admin_shared'::wallet_type_enum, 0.00, 0.00, TRUE, NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM user_wallets WHERE wallet_type = 'admin_shared' AND is_shared = TRUE
);

-- Create wallets for buyers
INSERT INTO user_wallets (user_id, wallet_type, available_balance, frozen_balance, is_shared, created_at, updated_at)
SELECT
    u.id,
    'buyer'::wallet_type_enum,
    0.00,
    0.00,
    FALSE,
    NOW(),
    NOW()
FROM users u
WHERE u.role = 'buyer'
ON CONFLICT (user_id, wallet_type) DO NOTHING;

-- Create wallets for suppliers
INSERT INTO user_wallets (user_id, wallet_type, available_balance, frozen_balance, is_shared, created_at, updated_at)
SELECT
    u.id,
    'supplier'::wallet_type_enum,
    0.00,
    0.00,
    FALSE,
    NOW(),
    NOW()
FROM users u
WHERE u.role = 'supplier'
ON CONFLICT (user_id, wallet_type) DO NOTHING;

-- Create wallets for agents
INSERT INTO user_wallets (user_id, wallet_type, available_balance, frozen_balance, is_shared, created_at, updated_at)
SELECT
    u.id,
    'agent'::wallet_type_enum,
    0.00,
    0.00,
    FALSE,
    NOW(),
    NOW()
FROM users u
WHERE u.role = 'agent'
ON CONFLICT (user_id, wallet_type) DO NOTHING;

-- Show results
SELECT
    'Wallets created successfully' as status,
    (SELECT COUNT(*) FROM user_wallets WHERE wallet_type = 'admin_shared' AND is_shared = TRUE) as admin_shared_wallets,
    (SELECT COUNT(*) FROM user_wallets WHERE wallet_type = 'buyer') as buyer_wallets,
    (SELECT COUNT(*) FROM user_wallets WHERE wallet_type = 'supplier') as supplier_wallets,
    (SELECT COUNT(*) FROM user_wallets WHERE wallet_type = 'agent') as agent_wallets;
