-- Migration script to update wallet schema for shared admin wallet
-- Run this script on your Neon PostgreSQL database

-- Step 1: Create wallet_type enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE wallet_type_enum AS ENUM ('buyer', 'supplier', 'agent', 'admin_shared');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Add new columns to user_wallets table
ALTER TABLE user_wallets
    ADD COLUMN IF NOT EXISTS wallet_type wallet_type_enum,
    ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT FALSE;

-- Step 3: Drop the old UNIQUE constraint on user_id (if it exists)
ALTER TABLE user_wallets
    DROP CONSTRAINT IF EXISTS user_wallets_user_id_key;

-- Step 4: Populate wallet_type for existing wallets based on user role
UPDATE user_wallets w
SET wallet_type = CASE
    WHEN u.role = 'buyer' THEN 'buyer'::wallet_type_enum
    WHEN u.role = 'supplier' THEN 'supplier'::wallet_type_enum
    WHEN u.role = 'agent' THEN 'agent'::wallet_type_enum
    WHEN u.role IN ('admin', 'super_admin') THEN 'admin_shared'::wallet_type_enum
    ELSE 'buyer'::wallet_type_enum
END
FROM users u
WHERE w.user_id = u.id
AND w.wallet_type IS NULL;

-- Step 5: Create the shared admin wallet
INSERT INTO user_wallets (user_id, wallet_type, available_balance, frozen_balance, is_shared)
SELECT NULL, 'admin_shared', 0.00, 0.00, TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM user_wallets WHERE wallet_type = 'admin_shared' AND is_shared = TRUE
);

-- Step 6: Delete individual admin/super_admin wallets (they'll use shared wallet)
DELETE FROM user_wallets
WHERE user_id IN (SELECT id FROM users WHERE role IN ('admin', 'super_admin'))
AND (wallet_type != 'admin_shared' OR wallet_type IS NULL);

-- Step 7: Make wallet_type NOT NULL now that all rows have values
ALTER TABLE user_wallets
    ALTER COLUMN wallet_type SET NOT NULL;

-- Step 8: Add new UNIQUE constraint on (user_id, wallet_type)
ALTER TABLE user_wallets
    ADD CONSTRAINT unique_user_wallet_type UNIQUE(user_id, wallet_type);

-- Step 9: Update the trigger function for automatic wallet creation
CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS TRIGGER AS $$
DECLARE
    admin_wallet_id UUID;
BEGIN
    -- For admin and super_admin users, link to shared wallet
    IF NEW.role IN ('admin', 'super_admin') THEN
        -- Get or create shared admin wallet
        SELECT wallet_id INTO admin_wallet_id
        FROM user_wallets
        WHERE wallet_type = 'admin_shared' AND is_shared = TRUE
        LIMIT 1;

        IF admin_wallet_id IS NULL THEN
            -- Create shared admin wallet with NULL user_id
            INSERT INTO user_wallets (user_id, wallet_type, available_balance, frozen_balance, is_shared)
            VALUES (NULL, 'admin_shared', 0.00, 0.00, TRUE)
            RETURNING wallet_id INTO admin_wallet_id;
        END IF;
    ELSE
        -- For other users (buyer, supplier, agent), create individual wallets
        IF NEW.role = 'buyer' THEN
            INSERT INTO user_wallets (user_id, wallet_type, available_balance, frozen_balance)
            VALUES (NEW.id, 'buyer', 0.00, 0.00)
            ON CONFLICT (user_id, wallet_type) DO NOTHING;
        ELSIF NEW.role = 'supplier' THEN
            INSERT INTO user_wallets (user_id, wallet_type, available_balance, frozen_balance)
            VALUES (NEW.id, 'supplier', 0.00, 0.00)
            ON CONFLICT (user_id, wallet_type) DO NOTHING;
        ELSIF NEW.role = 'agent' THEN
            INSERT INTO user_wallets (user_id, wallet_type, available_balance, frozen_balance)
            VALUES (NEW.id, 'agent', 0.00, 0.00)
            ON CONFLICT (user_id, wallet_type) DO NOTHING;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 10: Recreate the trigger
DROP TRIGGER IF EXISTS trigger_create_user_wallet ON users;
CREATE TRIGGER trigger_create_user_wallet
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_wallet();

-- Step 11: Create wallets for any existing users who don't have them
-- Buyers
INSERT INTO user_wallets (user_id, wallet_type, available_balance, frozen_balance)
SELECT id, 'buyer', 0.00, 0.00
FROM users
WHERE role = 'buyer'
AND id NOT IN (SELECT user_id FROM user_wallets WHERE user_id IS NOT NULL)
ON CONFLICT (user_id, wallet_type) DO NOTHING;

-- Suppliers
INSERT INTO user_wallets (user_id, wallet_type, available_balance, frozen_balance)
SELECT id, 'supplier', 0.00, 0.00
FROM users
WHERE role = 'supplier'
AND id NOT IN (SELECT user_id FROM user_wallets WHERE user_id IS NOT NULL)
ON CONFLICT (user_id, wallet_type) DO NOTHING;

-- Agents
INSERT INTO user_wallets (user_id, wallet_type, available_balance, frozen_balance)
SELECT id, 'agent', 0.00, 0.00
FROM users
WHERE role = 'agent'
AND id NOT IN (SELECT user_id FROM user_wallets WHERE user_id IS NOT NULL)
ON CONFLICT (user_id, wallet_type) DO NOTHING;

-- Migration complete
SELECT 'Migration completed successfully' AS status;
