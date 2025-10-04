// Copyright (c) 2025 CircularSync
// Database Initialization for Auction and Wallet System

import Cyclesync.database_config;

import ballerina/log;
import ballerina/sql;
import ballerinax/postgresql;

# Initialize auction and wallet database schema
#
# + return - Error if initialization fails
public function initializeAuctionAndWalletSchema() returns error? {
    postgresql:Client dbClient = check database_config:getDbClient();

    log:printInfo("Initializing auction and wallet database schema");

    // Create UUID extension
    sql:ExecutionResult|error uuidResult = dbClient->execute(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    if uuidResult is error {
        log:printWarn("Failed to create UUID extension", uuidResult);
    }

    // Create ENUM types
    check createEnumTypes(dbClient);

    // Create tables
    check createMaterialWorkflowsTable(dbClient);
    check createAuctionsTable(dbClient);
    check createBidsTable(dbClient);
    check createUserWalletsTable(dbClient);
    check createWalletTransactionsTable(dbClient);
    check createBidFreezesTable(dbClient);
    check createAuctionMetricsTable(dbClient);
    check createAuctionTransactionsTable(dbClient);
    check createCommissionTrackingTable(dbClient);
    check createNotificationsTable(dbClient);

    // Create indexes
    check createIndexes(dbClient);

    // Create triggers and functions
    check createTriggers(dbClient);

    // Insert initial data
    check insertInitialWallets(dbClient);

    log:printInfo("Auction and wallet database schema initialized successfully");
    return;
}

# Create ENUM types for auction system
function createEnumTypes(postgresql:Client dbClient) returns error? {
    // Auction status enum
    sql:ExecutionResult|error result1 = dbClient->execute(`
        DO $$ BEGIN
            CREATE TYPE auction_status_enum AS ENUM ('upcoming', 'active', 'paused', 'ended', 'cancelled', 'completed', 'reserve_not_met');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    `);
    if result1 is error {
        log:printWarn("Failed to create auction_status_enum", result1);
    }

    // Auction type enum
    sql:ExecutionResult|error result2 = dbClient->execute(`
        DO $$ BEGIN
            CREATE TYPE auction_type_enum AS ENUM ('standard', 'buy_it_now', 'reserve', 'dutch', 'bulk');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    `);
    if result2 is error {
        log:printWarn("Failed to create auction_type_enum", result2);
    }

    // Bid status enum
    sql:ExecutionResult|error result3 = dbClient->execute(`
        DO $$ BEGIN
            CREATE TYPE bid_status_enum AS ENUM ('active', 'outbid', 'winning', 'lost', 'refunded');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    `);
    if result3 is error {
        log:printWarn("Failed to create bid_status_enum", result3);
    }

    // Transaction status enum
    sql:ExecutionResult|error result4 = dbClient->execute(`
        DO $$ BEGIN
            CREATE TYPE transaction_status_enum AS ENUM ('pending', 'completed', 'failed', 'refunded', 'processing');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    `);
    if result4 is error {
        log:printWarn("Failed to create transaction_status_enum", result4);
    }

    // Transaction type enum
    sql:ExecutionResult|error result5 = dbClient->execute(`
        DO $$ BEGIN
            CREATE TYPE transaction_type_enum AS ENUM ('deposit', 'withdrawal', 'bid_freeze', 'bid_refund', 'auction_payment', 'commission_payment', 'agent_fee');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    `);
    if result5 is error {
        log:printWarn("Failed to create transaction_type_enum", result5);
    }

    return;
}

# Create material workflows table
function createMaterialWorkflowsTable(postgresql:Client dbClient) returns error? {
    sql:ExecutionResult|error result = dbClient->execute(`
        CREATE TABLE IF NOT EXISTS material_workflows (
            workflow_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            material_id UUID NOT NULL,
            supplier_id INTEGER REFERENCES users(id),
            agent_id INTEGER REFERENCES users(id),
            current_stage VARCHAR(50) DEFAULT 'submitted',
            verified_quantity DECIMAL(10,2),
            verified_quality_score INTEGER DEFAULT 0,
            agent_visit_cost DECIMAL(10,2) DEFAULT 0,
            agent_notes TEXT,
            verification_details JSONB,
            auction_listing JSONB,
            auction_result JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    if result is error {
        log:printError("Failed to create material_workflows table", result);
        return result;
    }

    log:printInfo("Material workflows table created successfully");
    return;
}

# Create auctions table
function createAuctionsTable(postgresql:Client dbClient) returns error? {
    sql:ExecutionResult|error result = dbClient->execute(`
        CREATE TABLE IF NOT EXISTS auctions (
            auction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            material_id UUID NOT NULL,
            workflow_id UUID REFERENCES material_workflows(workflow_id),
            supplier_id INTEGER REFERENCES users(id),
            title VARCHAR(255) NOT NULL,
            description TEXT,
            category VARCHAR(100),
            sub_category VARCHAR(100),
            quantity DECIMAL(10,2) NOT NULL,
            unit VARCHAR(50),
            condition_rating INTEGER DEFAULT 0,
            quality_score INTEGER DEFAULT 0,
            
            starting_price DECIMAL(12,2) NOT NULL,
            current_price DECIMAL(12,2) NOT NULL,
            reserve_price DECIMAL(12,2),
            buy_it_now_price DECIMAL(12,2),
            bid_increment DECIMAL(12,2) DEFAULT 100.00,
            final_price DECIMAL(12,2),
            
            auction_type auction_type_enum DEFAULT 'standard',
            status auction_status_enum DEFAULT 'upcoming',
            start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            end_time TIMESTAMP NOT NULL,
            duration_days INTEGER DEFAULT 7,
            time_extension_minutes INTEGER DEFAULT 10,
            
            highest_bidder_id INTEGER REFERENCES users(id),
            last_bid_time TIMESTAMP,
            bid_count INTEGER DEFAULT 0,
            unique_bidders INTEGER DEFAULT 0,
            
            photos TEXT[] DEFAULT '{}',
            verification_details JSONB,
            agent_notes TEXT,
            location VARCHAR(255),
            reserve_met BOOLEAN DEFAULT FALSE,
            
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP
        )
    `);

    if result is error {
        log:printError("Failed to create auctions table", result);
        return result;
    }

    log:printInfo("Auctions table created successfully");
    return;
}

# Create bids table
function createBidsTable(postgresql:Client dbClient) returns error? {
    sql:ExecutionResult|error result = dbClient->execute(`
        CREATE TABLE IF NOT EXISTS bids (
            bid_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            auction_id UUID REFERENCES auctions(auction_id),
            bidder_id INTEGER REFERENCES users(id),
            bid_amount DECIMAL(12,2) NOT NULL,
            max_bid_amount DECIMAL(12,2),
            bid_type VARCHAR(20) DEFAULT 'manual',
            is_auto_bid BOOLEAN DEFAULT FALSE,
            status bid_status_enum DEFAULT 'active',
            
            ip_address INET,
            user_agent TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            processed_at TIMESTAMP
        )
    `);

    if result is error {
        log:printError("Failed to create bids table", result);
        return result;
    }

    log:printInfo("Bids table created successfully");
    return;
}

# Create user wallets table
function createUserWalletsTable(postgresql:Client dbClient) returns error? {
    // First create wallet_type enum
    sql:ExecutionResult|error enumResult = dbClient->execute(`
        DO $$ BEGIN
            CREATE TYPE wallet_type_enum AS ENUM ('buyer', 'supplier', 'agent', 'admin_shared');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    `);
    if enumResult is error {
        log:printWarn("Failed to create wallet_type_enum", enumResult);
    }

    sql:ExecutionResult|error result = dbClient->execute(`
        CREATE TABLE IF NOT EXISTS user_wallets (
            wallet_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id INTEGER REFERENCES users(id),
            wallet_type wallet_type_enum NOT NULL,
            available_balance DECIMAL(12,2) DEFAULT 0.00,
            frozen_balance DECIMAL(12,2) DEFAULT 0.00,
            total_balance DECIMAL(12,2) GENERATED ALWAYS AS (available_balance + frozen_balance) STORED,

            daily_withdrawal_limit DECIMAL(12,2) DEFAULT 100000.00,
            daily_withdrawal_used DECIMAL(12,2) DEFAULT 0.00,
            daily_limit_reset_date DATE DEFAULT CURRENT_DATE,

            is_shared BOOLEAN DEFAULT FALSE,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            CONSTRAINT unique_user_wallet_type UNIQUE(user_id, wallet_type)
        )
    `);

    if result is error {
        log:printError("Failed to create user_wallets table", result);
        return result;
    }

    log:printInfo("User wallets table created successfully");
    return;
}

# Create wallet transactions table
function createWalletTransactionsTable(postgresql:Client dbClient) returns error? {
    sql:ExecutionResult|error result = dbClient->execute(`
        CREATE TABLE IF NOT EXISTS wallet_transactions (
            transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            wallet_id UUID REFERENCES user_wallets(wallet_id),
            user_id INTEGER REFERENCES users(id),
            
            type transaction_type_enum NOT NULL,
            amount DECIMAL(12,2) NOT NULL,
            balance_before DECIMAL(12,2) NOT NULL,
            balance_after DECIMAL(12,2) NOT NULL,
            status transaction_status_enum DEFAULT 'pending',
            
            auction_id UUID REFERENCES auctions(auction_id),
            bid_id UUID REFERENCES bids(bid_id),
            related_user_id INTEGER REFERENCES users(id),
            
            payment_method VARCHAR(50),
            payment_reference VARCHAR(255),
            description TEXT,
            metadata JSONB,
            
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            processed_at TIMESTAMP,
            failed_at TIMESTAMP,
            failure_reason TEXT
        )
    `);

    if result is error {
        log:printError("Failed to create wallet_transactions table", result);
        return result;
    }

    log:printInfo("Wallet transactions table created successfully");
    return;
}

# Create bid freezes table
function createBidFreezesTable(postgresql:Client dbClient) returns error? {
    sql:ExecutionResult|error result = dbClient->execute(`
        CREATE TABLE IF NOT EXISTS bid_freezes (
            freeze_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            bid_id UUID REFERENCES bids(bid_id),
            user_id INTEGER REFERENCES users(id),
            auction_id UUID REFERENCES auctions(auction_id),
            frozen_amount DECIMAL(12,2) NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            released_at TIMESTAMP
        )
    `);

    if result is error {
        log:printError("Failed to create bid_freezes table", result);
        return result;
    }

    log:printInfo("Bid freezes table created successfully");
    return;
}

# Create auction metrics table
function createAuctionMetricsTable(postgresql:Client dbClient) returns error? {
    sql:ExecutionResult|error result = dbClient->execute(`
        CREATE TABLE IF NOT EXISTS auction_metrics (
            auction_id UUID PRIMARY KEY REFERENCES auctions(auction_id),
            view_count INTEGER DEFAULT 0,
            unique_viewers INTEGER DEFAULT 0,
            bid_count INTEGER DEFAULT 0,
            unique_bidders INTEGER DEFAULT 0,
            avg_bid_amount DECIMAL(12,2) DEFAULT 0,
            time_to_first_bid INTEGER,
            last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            peak_concurrent_viewers INTEGER DEFAULT 0,
            total_watch_time INTEGER DEFAULT 0
        )
    `);

    if result is error {
        log:printError("Failed to create auction_metrics table", result);
        return result;
    }

    log:printInfo("Auction metrics table created successfully");
    return;
}

# Create auction transactions table
function createAuctionTransactionsTable(postgresql:Client dbClient) returns error? {
    sql:ExecutionResult|error result = dbClient->execute(`
        CREATE TABLE IF NOT EXISTS auction_transactions (
            transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            auction_id UUID REFERENCES auctions(auction_id),
            buyer_id INTEGER REFERENCES users(id),
            supplier_id INTEGER REFERENCES users(id),
            agent_id INTEGER REFERENCES users(id),
            material_id UUID NOT NULL,
            
            total_amount DECIMAL(12,2) NOT NULL,
            supplier_amount DECIMAL(12,2) NOT NULL,
            platform_fee DECIMAL(12,2) NOT NULL,
            agent_fee DECIMAL(12,2) NOT NULL,
            
            status transaction_status_enum DEFAULT 'pending',
            payment_completed_at TIMESTAMP,
            disbursement_completed_at TIMESTAMP,
            
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    if result is error {
        log:printError("Failed to create auction_transactions table", result);
        return result;
    }

    log:printInfo("Auction transactions table created successfully");
    return;
}

# Create commission tracking table
function createCommissionTrackingTable(postgresql:Client dbClient) returns error? {
    sql:ExecutionResult|error result = dbClient->execute(`
        CREATE TABLE IF NOT EXISTS commission_tracking (
            commission_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            transaction_id UUID REFERENCES auction_transactions(transaction_id),
            recipient_id INTEGER REFERENCES users(id),
            recipient_type VARCHAR(20),
            commission_percentage DECIMAL(5,2) NOT NULL,
            commission_amount DECIMAL(12,2) NOT NULL,
            status transaction_status_enum DEFAULT 'pending',
            paid_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    if result is error {
        log:printError("Failed to create commission_tracking table", result);
        return result;
    }

    log:printInfo("Commission tracking table created successfully");
    return;
}

# Create notifications table
function createNotificationsTable(postgresql:Client dbClient) returns error? {
    sql:ExecutionResult|error result = dbClient->execute(`
        CREATE TABLE IF NOT EXISTS notifications (
            notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id INTEGER REFERENCES users(id),
            type VARCHAR(50) NOT NULL,
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            action_url VARCHAR(500),
            status VARCHAR(20) DEFAULT 'unread',
            
            auction_id UUID REFERENCES auctions(auction_id),
            bid_id UUID REFERENCES bids(bid_id),
            
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            read_at TIMESTAMP
        )
    `);

    if result is error {
        log:printError("Failed to create notifications table", result);
        return result;
    }

    log:printInfo("Notifications table created successfully");
    return;
}

# Create database indexes for performance
function createIndexes(postgresql:Client dbClient) returns error? {
    // Auction indexes
    sql:ExecutionResult|error result1 = dbClient->execute(`CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status)`);
    if result1 is error {
        log:printWarn("Failed to create idx_auctions_status", result1);
    }

    sql:ExecutionResult|error result2 = dbClient->execute(`CREATE INDEX IF NOT EXISTS idx_auctions_end_time ON auctions(end_time)`);
    if result2 is error {
        log:printWarn("Failed to create idx_auctions_end_time", result2);
    }

    sql:ExecutionResult|error result3 = dbClient->execute(`CREATE INDEX IF NOT EXISTS idx_auctions_supplier ON auctions(supplier_id)`);
    if result3 is error {
        log:printWarn("Failed to create idx_auctions_supplier", result3);
    }

    // Bid indexes
    sql:ExecutionResult|error result4 = dbClient->execute(`CREATE INDEX IF NOT EXISTS idx_bids_auction ON bids(auction_id)`);
    if result4 is error {
        log:printWarn("Failed to create idx_bids_auction", result4);
    }

    sql:ExecutionResult|error result5 = dbClient->execute(`CREATE INDEX IF NOT EXISTS idx_bids_bidder ON bids(bidder_id)`);
    if result5 is error {
        log:printWarn("Failed to create idx_bids_bidder", result5);
    }

    // Wallet transaction indexes
    sql:ExecutionResult|error result6 = dbClient->execute(`CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user ON wallet_transactions(user_id)`);
    if result6 is error {
        log:printWarn("Failed to create idx_wallet_transactions_user", result6);
    }

    sql:ExecutionResult|error result7 = dbClient->execute(`CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(type)`);
    if result7 is error {
        log:printWarn("Failed to create idx_wallet_transactions_type", result7);
    }

    // Notification indexes
    sql:ExecutionResult|error result8 = dbClient->execute(`CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)`);
    if result8 is error {
        log:printWarn("Failed to create idx_notifications_user", result8);
    }

    sql:ExecutionResult|error result9 = dbClient->execute(`CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status)`);
    if result9 is error {
        log:printWarn("Failed to create idx_notifications_status", result9);
    }

    log:printInfo("Database indexes created successfully");
    return;
}

# Create triggers and functions
function createTriggers(postgresql:Client dbClient) returns error? {
    // Create user wallet trigger function
    sql:ExecutionResult|error triggerFunctionResult = dbClient->execute(`
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
    `);

    if triggerFunctionResult is error {
        log:printWarn("Failed to create user wallet trigger function", triggerFunctionResult);
    }

    // Create trigger for automatic wallet creation
    sql:ExecutionResult|error triggerResult = dbClient->execute(`
        DROP TRIGGER IF EXISTS trigger_create_user_wallet ON users;
        CREATE TRIGGER trigger_create_user_wallet
            AFTER INSERT ON users
            FOR EACH ROW
            EXECUTE FUNCTION create_user_wallet();
    `);

    if triggerResult is error {
        log:printWarn("Failed to create user wallet trigger", triggerResult);
    }

    // Create auction metrics update function
    sql:ExecutionResult|error metricsFunctionResult = dbClient->execute(`
        CREATE OR REPLACE FUNCTION update_auction_metrics()
        RETURNS TRIGGER AS $$
        BEGIN
            IF TG_OP = 'INSERT' THEN
                UPDATE auction_metrics 
                SET bid_count = bid_count + 1,
                    last_activity = CURRENT_TIMESTAMP
                WHERE auction_id = NEW.auction_id;
                
                UPDATE auction_metrics 
                SET unique_bidders = (
                    SELECT COUNT(DISTINCT bidder_id) 
                    FROM bids 
                    WHERE auction_id = NEW.auction_id
                ),
                avg_bid_amount = (
                    SELECT AVG(bid_amount) 
                    FROM bids 
                    WHERE auction_id = NEW.auction_id
                )
                WHERE auction_id = NEW.auction_id;
                
                RETURN NEW;
            END IF;
            RETURN NULL;
        END;
        $$ LANGUAGE plpgsql;
    `);

    if metricsFunctionResult is error {
        log:printWarn("Failed to create auction metrics function", metricsFunctionResult);
    }

    // Create trigger for auction metrics
    sql:ExecutionResult|error metricsTriggersResult = dbClient->execute(`
        CREATE TRIGGER trigger_update_auction_metrics
            AFTER INSERT ON bids
            FOR EACH ROW
            EXECUTE FUNCTION update_auction_metrics();
    `);

    if metricsTriggersResult is error {
        log:printWarn("Failed to create auction metrics trigger", metricsTriggersResult);
    }

    // Create daily withdrawal limit reset function
    sql:ExecutionResult|error withdrawalFunctionResult = dbClient->execute(`
        CREATE OR REPLACE FUNCTION reset_daily_withdrawal_limits()
        RETURNS void AS $$
        BEGIN
            UPDATE user_wallets 
            SET daily_withdrawal_used = 0.00,
                daily_limit_reset_date = CURRENT_DATE
            WHERE daily_limit_reset_date < CURRENT_DATE;
        END;
        $$ LANGUAGE plpgsql;
    `);

    if withdrawalFunctionResult is error {
        log:printWarn("Failed to create withdrawal limit reset function", withdrawalFunctionResult);
    }

    log:printInfo("Database triggers and functions created successfully");
    return;
}

# Insert initial wallets for existing users
function insertInitialWallets(postgresql:Client dbClient) returns error? {
    // Create shared admin wallet first
    sql:ExecutionResult|error adminWalletResult = dbClient->execute(`
        INSERT INTO user_wallets (user_id, wallet_type, available_balance, frozen_balance, is_shared)
        SELECT NULL, 'admin_shared', 0.00, 0.00, TRUE
        WHERE NOT EXISTS (
            SELECT 1 FROM user_wallets WHERE wallet_type = 'admin_shared' AND is_shared = TRUE
        )
    `);

    if adminWalletResult is error {
        log:printWarn("Failed to create shared admin wallet", adminWalletResult);
    }

    // Create individual wallets for buyers
    sql:ExecutionResult|error buyerResult = dbClient->execute(`
        INSERT INTO user_wallets (user_id, wallet_type, available_balance, frozen_balance)
        SELECT id, 'buyer', 0.00, 0.00 FROM users WHERE role = 'buyer'
        ON CONFLICT (user_id, wallet_type) DO NOTHING
    `);

    if buyerResult is error {
        log:printWarn("Failed to create buyer wallets", buyerResult);
    }

    // Create individual wallets for suppliers
    sql:ExecutionResult|error supplierResult = dbClient->execute(`
        INSERT INTO user_wallets (user_id, wallet_type, available_balance, frozen_balance)
        SELECT id, 'supplier', 0.00, 0.00 FROM users WHERE role = 'supplier'
        ON CONFLICT (user_id, wallet_type) DO NOTHING
    `);

    if supplierResult is error {
        log:printWarn("Failed to create supplier wallets", supplierResult);
    }

    // Create individual wallets for agents
    sql:ExecutionResult|error agentResult = dbClient->execute(`
        INSERT INTO user_wallets (user_id, wallet_type, available_balance, frozen_balance)
        SELECT id, 'agent', 0.00, 0.00 FROM users WHERE role = 'agent'
        ON CONFLICT (user_id, wallet_type) DO NOTHING
    `);

    if agentResult is error {
        log:printWarn("Failed to create agent wallets", agentResult);
    }

    log:printInfo("Initial wallets created for existing users");
    return;
}
