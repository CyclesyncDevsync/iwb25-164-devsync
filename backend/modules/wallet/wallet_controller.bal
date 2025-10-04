// Copyright (c) 2025 CircularSync
// Wallet Management HTTP Controller

import Cyclesync.auth;
import Cyclesync.database_config;

import ballerina/http;
import ballerina/log;
import ballerina/sql;

// Initialize wallet service with database configuration
@http:ServiceConfig {
    cors: {
        allowOrigins: ["*"],
        allowCredentials: false,
        allowHeaders: ["*"],
        allowMethods: ["*"],
        maxAge: 84900
    }
}
service /api/wallet on new http:Listener(8097) {

    private auth:AuthMiddleware authMiddleware = new ();

    # Get authenticated user ID from request
    private function getAuthenticatedUserId(http:Request request) returns int|http:Response {
        auth:AuthContext|http:Unauthorized authResult = self.authMiddleware.authenticate(request);

        if authResult is http:Unauthorized {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                "error": "Unauthorized",
                "message": "Please login to access wallet features"
            });
            return response;
        }

        return authResult.userId;
    }

    # Get authenticated user context for admin operations
    private function getAuthContext(http:Request request) returns auth:AuthContext|http:Response {
        auth:AuthContext|http:Unauthorized authResult = self.authMiddleware.authenticate(request);

        if authResult is http:Unauthorized {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                "error": "Unauthorized", 
                "message": "Please login to access wallet features"
            });
            return response;
        }

        return authResult;
    }

    # Get user ID for wallet operations (all authenticated users)
    private function getUserIdForOperations(http:Request request) returns int|http:Response {
        auth:AuthContext|http:Response contextResult = self.getAuthContext(request);
        if contextResult is http:Response {
            return contextResult;
        }

        auth:AuthContext context = contextResult;
        return context.userId;
    }


    # Get user wallet balance
    resource function get balance(http:Request request) returns http:Response {
        http:Response response = new;

        // Get auth context to check user role
        auth:AuthContext|http:Response contextResult = self.getAuthContext(request);
        if contextResult is http:Response {
            return contextResult;
        }
        auth:AuthContext context = contextResult;
        int userId = context.userId;
        string userRole = context.role;

        do {
            var dbClient = check database_config:getDbClient();

            // For admin and super_admin, get shared wallet
            if userRole == "admin" || userRole == "super_admin" {
                record {
                    string wallet_id;
                    decimal available_balance;
                    decimal frozen_balance;
                    decimal total_balance;
                    decimal daily_withdrawal_limit;
                    decimal daily_withdrawal_used;
                    string wallet_type;
                    boolean is_shared;
                }|error walletResult = dbClient->queryRow(`
                    SELECT
                        wallet_id::text as wallet_id, available_balance, frozen_balance,
                        (available_balance + frozen_balance) as total_balance,
                        daily_withdrawal_limit, daily_withdrawal_used,
                        wallet_type::text as wallet_type, is_shared
                    FROM user_wallets
                    WHERE wallet_type = 'admin_shared' AND is_shared = TRUE
                `);

                if walletResult is record {} {
                    response.statusCode = 200;
                    response.setJsonPayload({
                        "status": "success",
                        "data": walletResult.toJson()
                    });
                    return response;
                }
            } else {
                // For other users, get their individual wallet
                record {
                    string wallet_id;
                    int user_id;
                    decimal available_balance;
                    decimal frozen_balance;
                    decimal total_balance;
                    decimal daily_withdrawal_limit;
                    decimal daily_withdrawal_used;
                    string wallet_type;
                }|error walletResult = dbClient->queryRow(`
                    SELECT
                        wallet_id::text as wallet_id, user_id, available_balance, frozen_balance,
                        (available_balance + frozen_balance) as total_balance,
                        daily_withdrawal_limit, daily_withdrawal_used,
                        wallet_type::text as wallet_type
                    FROM user_wallets
                    WHERE user_id = ${userId}
                `);

                if walletResult is record {} {
                    response.statusCode = 200;
                    response.setJsonPayload({
                        "status": "success",
                        "data": walletResult.toJson()
                    });
                    return response;
                }
            }

            // If no wallet found, return error
            response.statusCode = 404;
            response.setJsonPayload({
                "error": "Wallet not found",
                "message": "User wallet does not exist. It should have been created automatically."
            });

        } on fail error e {
            log:printError("Failed to fetch wallet balance", e);
            response.statusCode = 500;
            response.setJsonPayload({
                "error": "Failed to fetch wallet balance",
                "message": e.message()
            });
        }

        return response;
    }

    # Recharge wallet
    resource function post recharge(http:Request request, @http:Payload json payload) returns http:Response {
        http:Response response = new;

        // Get auth context
        auth:AuthContext|http:Response contextResult = self.getAuthContext(request);
        if contextResult is http:Response {
            return contextResult;
        }
        auth:AuthContext context = contextResult;
        int userId = context.userId;
        string userRole = context.role;

        do {
            var dbClient = check database_config:getDbClient();

            // Extract amount from payload
            decimal amount = check payload.amount;

            if amount <= 0d {
                response.statusCode = 400;
                response.setJsonPayload({
                    "error": "Invalid amount",
                    "message": "Amount must be greater than 0"
                });
                return response;
            }

            string walletId;
            decimal balanceBefore;
            decimal balanceAfter;

            // For admin and super_admin, use shared wallet
            if userRole == "admin" || userRole == "super_admin" {
                record {
                    string wallet_id;
                    decimal available_balance;
                }|error walletResult = dbClient->queryRow(`
                    SELECT wallet_id::text as wallet_id, available_balance
                    FROM user_wallets
                    WHERE wallet_type = 'admin_shared' AND is_shared = TRUE
                `);

                if walletResult is error {
                    response.statusCode = 404;
                    response.setJsonPayload({
                        "error": "Wallet not found",
                        "message": "Shared admin wallet does not exist"
                    });
                    return response;
                }

                walletId = walletResult.wallet_id;
                balanceBefore = walletResult.available_balance;
                balanceAfter = balanceBefore + amount;

                // Update shared wallet balance
                var updateResult = dbClient->execute(`
                    UPDATE user_wallets
                    SET available_balance = ${balanceAfter}, updated_at = CURRENT_TIMESTAMP
                    WHERE wallet_type = 'admin_shared' AND is_shared = TRUE
                `);

                if updateResult is error {
                    log:printError("Failed to update shared wallet balance", updateResult);
                    response.statusCode = 500;
                    response.setJsonPayload({
                        "error": "Failed to update balance",
                        "message": updateResult.message()
                    });
                    return response;
                }
            } else {
                // For other users, use individual wallet
                record {
                    string wallet_id;
                    decimal available_balance;
                }|error walletResult = dbClient->queryRow(`
                    SELECT wallet_id::text as wallet_id, available_balance
                    FROM user_wallets
                    WHERE user_id = ${userId}
                `);

                if walletResult is error {
                    response.statusCode = 404;
                    response.setJsonPayload({
                        "error": "Wallet not found",
                        "message": "User wallet does not exist"
                    });
                    return response;
                }

                walletId = walletResult.wallet_id;
                balanceBefore = walletResult.available_balance;
                balanceAfter = balanceBefore + amount;

                // Update wallet balance
                var updateResult = dbClient->execute(`
                    UPDATE user_wallets
                    SET available_balance = ${balanceAfter}, updated_at = CURRENT_TIMESTAMP
                    WHERE user_id = ${userId}
                `);

                if updateResult is error {
                    log:printError("Failed to update wallet balance", updateResult);
                    response.statusCode = 500;
                    response.setJsonPayload({
                        "error": "Failed to update balance",
                        "message": updateResult.message()
                    });
                    return response;
                }
            }

            // Create transaction record - cast wallet_id back to UUID
            var transactionResult = dbClient->execute(`
                INSERT INTO wallet_transactions (
                    wallet_id, user_id, type, amount,
                    balance_before, balance_after, status, description
                ) VALUES (
                    ${walletId}::uuid, ${userId}, 'deposit', ${amount},
                    ${balanceBefore}, ${balanceAfter}, 'completed',
                    'Wallet recharge'
                )
            `);

            if transactionResult is error {
                log:printError("Failed to create transaction record for recharge", transactionResult);
                // Don't fail the whole operation, but log the error
            } else {
                log:printInfo("Transaction record created successfully for recharge");
            }

            response.statusCode = 200;
            response.setJsonPayload({
                "status": "success",
                "message": "Wallet recharged successfully",
                "data": {
                    "amount": amount,
                    "new_balance": balanceAfter
                }
            });

        } on fail error e {
            log:printError("Failed to recharge wallet", e);
            response.statusCode = 500;
            response.setJsonPayload({
                "error": "Failed to recharge wallet",
                "message": e.message()
            });
        }

        return response;
    }

    # Withdraw funds from wallet
    resource function post withdraw(http:Request request, @http:Payload json payload) returns http:Response {
        http:Response response = new;

        // Get auth context
        auth:AuthContext|http:Response contextResult = self.getAuthContext(request);
        if contextResult is http:Response {
            return contextResult;
        }
        auth:AuthContext context = contextResult;
        int userId = context.userId;
        string userRole = context.role;

        do {
            var dbClient = check database_config:getDbClient();

            // Extract amount from payload
            decimal amount = check payload.amount;

            if amount <= 0d {
                response.statusCode = 400;
                response.setJsonPayload({
                    "error": "Invalid amount",
                    "message": "Amount must be greater than 0"
                });
                return response;
            }

            string walletId;
            decimal balanceBefore;
            decimal dailyLimit;
            decimal dailyUsed;
            decimal balanceAfter;
            decimal newDailyUsed;

            // For admin and super_admin, use shared wallet
            if userRole == "admin" || userRole == "super_admin" {
                record {
                    string wallet_id;
                    decimal available_balance;
                    decimal daily_withdrawal_limit;
                    decimal daily_withdrawal_used;
                }|error walletResult = dbClient->queryRow(`
                    SELECT wallet_id::text as wallet_id, available_balance, daily_withdrawal_limit, daily_withdrawal_used
                    FROM user_wallets
                    WHERE wallet_type = 'admin_shared' AND is_shared = TRUE
                `);

                if walletResult is error {
                    response.statusCode = 404;
                    response.setJsonPayload({
                        "error": "Wallet not found",
                        "message": "Shared admin wallet does not exist"
                    });
                    return response;
                }

                walletId = walletResult.wallet_id;
                balanceBefore = walletResult.available_balance;
                dailyLimit = walletResult.daily_withdrawal_limit;
                dailyUsed = walletResult.daily_withdrawal_used;

                // Check sufficient balance
                if amount > balanceBefore {
                    response.statusCode = 400;
                    response.setJsonPayload({
                        "error": "Insufficient balance",
                        "message": "Not enough available balance for withdrawal"
                    });
                    return response;
                }

                // Check daily withdrawal limit
                if (dailyUsed + amount) > dailyLimit {
                    response.statusCode = 400;
                    response.setJsonPayload({
                        "error": "Daily limit exceeded",
                        "message": "Withdrawal would exceed daily limit"
                    });
                    return response;
                }

                balanceAfter = balanceBefore - amount;
                newDailyUsed = dailyUsed + amount;

                // Update shared wallet balance and daily usage
                var updateResult = dbClient->execute(`
                    UPDATE user_wallets
                    SET available_balance = ${balanceAfter},
                        daily_withdrawal_used = ${newDailyUsed},
                        updated_at = CURRENT_TIMESTAMP
                    WHERE wallet_type = 'admin_shared' AND is_shared = TRUE
                `);

                if updateResult is error {
                    log:printError("Failed to update shared wallet balance", updateResult);
                    response.statusCode = 500;
                    response.setJsonPayload({
                        "error": "Failed to update balance",
                        "message": updateResult.message()
                    });
                    return response;
                }
            } else {
                // For other users, use individual wallet
                record {
                    string wallet_id;
                    decimal available_balance;
                    decimal daily_withdrawal_limit;
                    decimal daily_withdrawal_used;
                }|error walletResult = dbClient->queryRow(`
                    SELECT wallet_id::text as wallet_id, available_balance, daily_withdrawal_limit, daily_withdrawal_used
                    FROM user_wallets
                    WHERE user_id = ${userId}
                `);

                if walletResult is error {
                    response.statusCode = 404;
                    response.setJsonPayload({
                        "error": "Wallet not found",
                        "message": "User wallet does not exist"
                    });
                    return response;
                }

                walletId = walletResult.wallet_id;
                balanceBefore = walletResult.available_balance;
                dailyLimit = walletResult.daily_withdrawal_limit;
                dailyUsed = walletResult.daily_withdrawal_used;

                // Check sufficient balance
                if amount > balanceBefore {
                    response.statusCode = 400;
                    response.setJsonPayload({
                        "error": "Insufficient balance",
                        "message": "Not enough available balance for withdrawal"
                    });
                    return response;
                }

                // Check daily withdrawal limit
                if (dailyUsed + amount) > dailyLimit {
                    response.statusCode = 400;
                    response.setJsonPayload({
                        "error": "Daily limit exceeded",
                        "message": "Withdrawal would exceed daily limit"
                    });
                    return response;
                }

                balanceAfter = balanceBefore - amount;
                newDailyUsed = dailyUsed + amount;

                // Update wallet balance and daily usage
                var updateResult = dbClient->execute(`
                    UPDATE user_wallets
                    SET available_balance = ${balanceAfter},
                        daily_withdrawal_used = ${newDailyUsed},
                        updated_at = CURRENT_TIMESTAMP
                    WHERE user_id = ${userId}
                `);

                if updateResult is error {
                    log:printError("Failed to update wallet balance", updateResult);
                    response.statusCode = 500;
                    response.setJsonPayload({
                        "error": "Failed to update balance",
                        "message": updateResult.message()
                    });
                    return response;
                }
            }

            // Create transaction record - cast wallet_id back to UUID
            var transactionResult = dbClient->execute(`
                INSERT INTO wallet_transactions (
                    wallet_id, user_id, type, amount, 
                    balance_before, balance_after, status, description
                ) VALUES (
                    ${walletId}::uuid, ${userId}, 'withdrawal', ${amount},
                    ${balanceBefore}, ${balanceAfter}, 'completed', 
                    'Wallet withdrawal'
                )
            `);

            if transactionResult is error {
                log:printError("Failed to create transaction record for withdrawal", transactionResult);
                // Don't fail the whole operation, but log the error
            } else {
                log:printInfo("Transaction record created successfully for withdrawal");
            }

            response.statusCode = 200;
            response.setJsonPayload({
                "status": "success",
                "message": "Withdrawal processed successfully",
                "data": {
                    "amount": amount,
                    "new_balance": balanceAfter
                }
            });

        } on fail error e {
            log:printError("Failed to process withdrawal", e);
            response.statusCode = 500;
            response.setJsonPayload({
                "error": "Failed to process withdrawal",
                "message": e.message()
            });
        }

        return response;
    }

    # Get transaction history
    resource function get transactions(http:Request request, int page = 1, int 'limit = 20) returns http:Response {
        http:Response response = new;

        // Authenticate user
        int|http:Response userResult = self.getAuthenticatedUserId(request);
        if userResult is http:Response {
            return userResult;
        }
        int userId = userResult;

        do {
            var dbClient = check database_config:getDbClient();

            int offset = (page - 1) * 'limit;

            // Get transactions for user
            stream<record {}, sql:Error?> transactionStream = dbClient->query(`
                SELECT 
                    transaction_id, type, amount, balance_before, balance_after,
                    status, description, created_at::text, payment_method
                FROM wallet_transactions 
                WHERE user_id = ${userId}
                ORDER BY created_at DESC
                LIMIT ${'limit} OFFSET ${offset}
            `);

            json[] transactions = [];
            error? conversionResult = from var row in transactionStream
                do {
                    transactions.push(row.toJson());
                };

            if conversionResult is error {
                response.statusCode = 500;
                response.setJsonPayload({
                    "error": "Failed to process transactions",
                    "message": conversionResult.message()
                });
                return response;
            }

            // Get total count
            record {int count;}|error countResult = dbClient->queryRow(`
                SELECT COUNT(*) as count
                FROM wallet_transactions 
                WHERE user_id = ${userId}
            `);

            int totalCount = countResult is record {} ? countResult.count : 0;

            response.statusCode = 200;
            response.setJsonPayload({
                "status": "success",
                "data": transactions,
                "pagination": {
                    "page": page,
                    "limit": 'limit,
                    "total": totalCount,
                    "has_more": (offset + 'limit) < totalCount
                }
            });

        } on fail error e {
            log:printError("Failed to fetch transactions", e);
            response.statusCode = 500;
            response.setJsonPayload({
                "error": "Failed to fetch transactions",
                "message": e.message()
            });
        }

        return response;
    }

    # Initialize wallet for user (utility endpoint)
    resource function post init(http:Request request) returns http:Response {
        http:Response response = new;

        // Authenticate user
        int|http:Response userResult = self.getAuthenticatedUserId(request);
        if userResult is http:Response {
            return userResult;
        }
        int userId = userResult;

        do {
            var dbClient = check database_config:getDbClient();

            // Check if wallet already exists
            record {int count;}|error existsResult = dbClient->queryRow(`
                SELECT COUNT(*) as count FROM user_wallets WHERE user_id = ${userId}
            `);

            if existsResult is record {} && existsResult.count > 0 {
                response.statusCode = 200;
                response.setJsonPayload({
                    "status": "success",
                    "message": "Wallet already exists"
                });
                return response;
            }

            // Create new wallet
            var createResult = dbClient->execute(`
                INSERT INTO user_wallets (user_id, available_balance, frozen_balance)
                VALUES (${userId}, 0.00, 0.00)
                ON CONFLICT (user_id) DO NOTHING
            `);

            if createResult is error {
                log:printError("Failed to create wallet", createResult);
                response.statusCode = 500;
                response.setJsonPayload({
                    "error": "Failed to create wallet",
                    "message": createResult.message()
                });
                return response;
            }

            response.statusCode = 200;
            response.setJsonPayload({
                "status": "success",
                "message": "Wallet created successfully",
                "data": {

                    "user_id": userId
                }
            });

        } on fail error e {
            log:printError("Failed to initialize wallet", e);
            response.statusCode = 500;
            response.setJsonPayload({
                "error": "Failed to initialize wallet",
                "message": e.message()
            });
        }

        return response;
    }

    # Initialize wallets for all existing users (admin endpoint - no auth required for setup)
    resource function post initAllWallets() returns http:Response {
        http:Response response = new;

        do {
            var dbClient = check database_config:getDbClient();

            // Create shared admin wallet
            _ = check dbClient->execute(`
                INSERT INTO user_wallets (user_id, wallet_type, available_balance, frozen_balance, is_shared)
                SELECT NULL, 'admin_shared'::wallet_type_enum, 0.00, 0.00, TRUE
                WHERE NOT EXISTS (
                    SELECT 1 FROM user_wallets WHERE wallet_type = 'admin_shared' AND is_shared = TRUE
                )
            `);

            // Create wallets for buyers
            _ = check dbClient->execute(`
                INSERT INTO user_wallets (user_id, wallet_type, available_balance, frozen_balance, is_shared)
                SELECT id, 'buyer'::wallet_type_enum, 0.00, 0.00, FALSE
                FROM users WHERE role = 'buyer'
                ON CONFLICT (user_id, wallet_type) DO NOTHING
            `);

            // Create wallets for suppliers
            _ = check dbClient->execute(`
                INSERT INTO user_wallets (user_id, wallet_type, available_balance, frozen_balance, is_shared)
                SELECT id, 'supplier'::wallet_type_enum, 0.00, 0.00, FALSE
                FROM users WHERE role = 'supplier'
                ON CONFLICT (user_id, wallet_type) DO NOTHING
            `);

            // Create wallets for agents
            _ = check dbClient->execute(`
                INSERT INTO user_wallets (user_id, wallet_type, available_balance, frozen_balance, is_shared)
                SELECT id, 'agent'::wallet_type_enum, 0.00, 0.00, FALSE
                FROM users WHERE role = 'agent'
                ON CONFLICT (user_id, wallet_type) DO NOTHING
            `);

            // Get wallet counts
            record {
                int admin_shared;
                int buyer;
                int supplier;
                int agent;
            }|error counts = dbClient->queryRow(`
                SELECT
                    (SELECT COUNT(*) FROM user_wallets WHERE wallet_type = 'admin_shared' AND is_shared = TRUE) as admin_shared,
                    (SELECT COUNT(*) FROM user_wallets WHERE wallet_type = 'buyer') as buyer,
                    (SELECT COUNT(*) FROM user_wallets WHERE wallet_type = 'supplier') as supplier,
                    (SELECT COUNT(*) FROM user_wallets WHERE wallet_type = 'agent') as agent
            `);

            response.statusCode = 200;
            response.setJsonPayload({
                "status": "success",
                "message": "Wallets initialized for all existing users",
                "data": counts is record {} ? counts.toJson() : {}
            });

        } on fail error e {
            log:printError("Failed to initialize wallets for all users", e);
            response.statusCode = 500;
            response.setJsonPayload({
                "error": "Failed to initialize wallets",
                "message": e.message()
            });
        }

        return response;
    }

    # Create test user for wallet testing
    resource function post createTestUser() returns http:Response {
        http:Response response = new;

        do {
            var dbClient = check database_config:getDbClient();

            // Create test user with ID 1
            var createResult = dbClient->execute(`
                INSERT INTO users (id, asgardeo_id, email, first_name, last_name, role, status, created_at, updated_at)
                VALUES (
                    1, 'test-user-id-1', 'user1@cyclesync.com', 'Test', 'User', 'buyer', 'approved', NOW(), NOW()
                )
                ON CONFLICT (id) DO UPDATE SET
                    asgardeo_id = EXCLUDED.asgardeo_id,
                    email = EXCLUDED.email,
                    first_name = EXCLUDED.first_name,
                    last_name = EXCLUDED.last_name,
                    role = EXCLUDED.role,
                    status = EXCLUDED.status,
                    updated_at = NOW()
            `);

            if createResult is error {
                log:printError("Failed to create test user", createResult);
                response.statusCode = 500;
                response.setJsonPayload({
                    "error": "Failed to create test user",
                    "message": createResult.message()
                });
                return response;
            }

            response.statusCode = 200;
            response.setJsonPayload({
                "status": "success",
                "message": "Test user created successfully",
                "data": {
                    "user_id": 1,
                    "email": "user1@cyclesync.com"
                }
            });

        } on fail error e {
            log:printError("Failed to create test user", e);
            response.statusCode = 500;
            response.setJsonPayload({
                "error": "Failed to create test user",
                "message": e.message()
            });
        }

        return response;
    }

    # Test transaction insertion (debug endpoint)
    resource function post testTransaction(http:Request request) returns http:Response {
        http:Response response = new;

        // Authenticate user
        int|http:Response userResult = self.getAuthenticatedUserId(request);
        if userResult is http:Response {
            return userResult;
        }
        int userId = userResult;

        do {
            var dbClient = check database_config:getDbClient();

            // Get user's wallet
            record {
                string wallet_id;
                decimal available_balance;
            }|error walletResult = dbClient->queryRow(`
                SELECT wallet_id::text as wallet_id, available_balance
                FROM user_wallets 
                WHERE user_id = ${userId}
            `);

            if walletResult is error {
                response.statusCode = 404;
                response.setJsonPayload({
                    "error": "Wallet not found",
                    "message": "User wallet does not exist"
                });
                return response;
            }

            string walletId = walletResult.wallet_id;
            decimal balance = walletResult.available_balance;

            // Try to insert a test transaction - cast wallet_id back to UUID
            log:printInfo(string `Attempting to insert transaction with:
                wallet_id: ${walletId} 
                user_id: ${userId}
                balance: ${balance.toString()}`);

            var transactionResult = dbClient->execute(`
                INSERT INTO wallet_transactions (
                    wallet_id, user_id, type, amount, 
                    balance_before, balance_after, status, description
                ) VALUES (
                    ${walletId}::uuid, ${userId}, 'deposit', 100.00,
                    ${balance}, ${balance + 100.00d}, 'completed', 
                    'Test transaction'
                )
            `);

            if transactionResult is error {
                log:printError("Test transaction insertion failed", transactionResult);
                response.statusCode = 500;
                response.setJsonPayload({
                    "error": "Transaction insertion failed",
                    "message": transactionResult.message(),
                    "details": transactionResult.toString()
                });
            } else {
                log:printInfo("Test transaction inserted successfully");
                response.statusCode = 200;
                response.setJsonPayload({
                    "status": "success",
                    "message": "Test transaction created"
                });
            }

        } on fail error e {
            log:printError("Test transaction failed", e);
            response.statusCode = 500;
            response.setJsonPayload({
                "error": "Test transaction failed",
                "message": e.message()
            });
        }

        return response;
    }
}
