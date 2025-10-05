// Copyright (c) 2025 CircularSync
// Wallet Schema Migration

import Cyclesync.database_config;
import ballerina/http;
import ballerina/log;

@http:ServiceConfig {
    cors: {
        allowOrigins: ["*"],
        allowCredentials: false,
        allowHeaders: ["*"],
        allowMethods: ["*"],
        maxAge: 84900
    }
}
service /api/wallet/migrate on new http:Listener(8099) {

    resource function post schema() returns http:Response {
        http:Response response = new;

        do {
            var dbClient = check database_config:getDbClient();

            log:printInfo("Starting wallet schema migration...");

            // Step 1: Create wallet_type enum
            _ = check dbClient->execute(`
                DO $$ BEGIN
                    CREATE TYPE wallet_type_enum AS ENUM ('buyer', 'supplier', 'agent', 'admin_shared');
                EXCEPTION
                    WHEN duplicate_object THEN null;
                END $$;
            `);
            log:printInfo("Created wallet_type enum");

            // Step 2: Add new columns
            _ = check dbClient->execute(`
                ALTER TABLE user_wallets
                    ADD COLUMN IF NOT EXISTS wallet_type wallet_type_enum,
                    ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT FALSE;
            `);
            log:printInfo("Added wallet_type and is_shared columns");

            // Step 3: Drop old unique constraint
            _ = check dbClient->execute(`
                ALTER TABLE user_wallets DROP CONSTRAINT IF EXISTS user_wallets_user_id_key;
            `);
            log:printInfo("Dropped old unique constraint");

            // Step 4: Populate wallet_type for existing wallets
            _ = check dbClient->execute(`
                UPDATE user_wallets w
                SET wallet_type = CASE
                    WHEN u.role = 'buyer' THEN 'buyer'::wallet_type_enum
                    WHEN u.role = 'supplier' THEN 'supplier'::wallet_type_enum
                    WHEN u.role = 'agent' THEN 'agent'::wallet_type_enum
                    WHEN u.role IN ('admin', 'super_admin') THEN 'admin_shared'::wallet_type_enum
                    ELSE 'buyer'::wallet_type_enum
                END
                FROM users u
                WHERE w.user_id = u.id AND w.wallet_type IS NULL;
            `);
            log:printInfo("Populated wallet_type for existing wallets");

            // Step 5: Create shared admin wallet
            _ = check dbClient->execute(`
                INSERT INTO user_wallets (user_id, wallet_type, available_balance, frozen_balance, is_shared)
                SELECT NULL, 'admin_shared'::wallet_type_enum, 0.00, 0.00, TRUE
                WHERE NOT EXISTS (
                    SELECT 1 FROM user_wallets WHERE wallet_type = 'admin_shared' AND is_shared = TRUE
                );
            `);
            log:printInfo("Created shared admin wallet");

            // Step 6: Delete individual admin wallets
            _ = check dbClient->execute(`
                DELETE FROM user_wallets
                WHERE user_id IN (SELECT id FROM users WHERE role IN ('admin', 'super_admin'))
                AND (wallet_type != 'admin_shared' OR wallet_type IS NULL);
            `);
            log:printInfo("Deleted individual admin wallets");

            // Step 7: Make wallet_type NOT NULL
            _ = check dbClient->execute(`
                ALTER TABLE user_wallets ALTER COLUMN wallet_type SET NOT NULL;
            `);
            log:printInfo("Set wallet_type as NOT NULL");

            // Step 8: Add new unique constraint
            _ = check dbClient->execute(`
                DO $$ BEGIN
                    ALTER TABLE user_wallets ADD CONSTRAINT unique_user_wallet_type UNIQUE(user_id, wallet_type);
                EXCEPTION
                    WHEN duplicate_table THEN null;
                    WHEN duplicate_object THEN null;
                END $$;
            `);
            log:printInfo("Added unique constraint on (user_id, wallet_type)");

            response.statusCode = 200;
            response.setJsonPayload({
                "status": "success",
                "message": "Wallet schema migrated successfully"
            });

        } on fail error e {
            log:printError("Failed to migrate wallet schema", e);
            response.statusCode = 500;
            response.setJsonPayload({
                "error": "Migration failed",
                "message": e.message()
            });
        }

        return response;
    }
}
