-- CircularSync Auction and Wallet System Database Schema
-- Run this after the basic tables are created

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types for auction system
DO $$ BEGIN
    CREATE TYPE auction_status_enum AS ENUM ('upcoming', 'active', 'paused', 'ended', 'cancelled', 'completed', 'reserve_not_met');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE auction_type_enum AS ENUM ('standard', 'buy_it_now', 'reserve', 'dutch', 'bulk');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE bid_status_enum AS ENUM ('active', 'outbid', 'winning', 'lost', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_status_enum AS ENUM ('pending', 'completed', 'failed', 'refunded', 'processing');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_type_enum AS ENUM ('deposit', 'withdrawal', 'bid_freeze', 'bid_refund', 'auction_payment', 'commission_payment', 'agent_fee');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Material Workflows Table (for auction flow)
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
);

-- 2. Auctions Table
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
    
    -- Pricing
    starting_price DECIMAL(12,2) NOT NULL,
    current_price DECIMAL(12,2) NOT NULL,
    reserve_price DECIMAL(12,2),
    buy_it_now_price DECIMAL(12,2),
    bid_increment DECIMAL(12,2) DEFAULT 100.00,
    final_price DECIMAL(12,2),
    
    -- Auction settings
    auction_type auction_type_enum DEFAULT 'standard',
    status auction_status_enum DEFAULT 'upcoming',
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NOT NULL,
    duration_days INTEGER DEFAULT 7,
    time_extension_minutes INTEGER DEFAULT 10,
    
    -- Bidding info
    highest_bidder_id INTEGER REFERENCES users(id),
    last_bid_time TIMESTAMP,
    bid_count INTEGER DEFAULT 0,
    unique_bidders INTEGER DEFAULT 0,
    
    -- Additional data
    photos TEXT[] DEFAULT '{}',
    verification_details JSONB,
    agent_notes TEXT,
    location VARCHAR(255),
    reserve_met BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- 3. Bids Table
CREATE TABLE IF NOT EXISTS bids (
    bid_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auction_id UUID REFERENCES auctions(auction_id),
    bidder_id INTEGER REFERENCES users(id),
    bid_amount DECIMAL(12,2) NOT NULL,
    max_bid_amount DECIMAL(12,2), -- For automatic bidding
    bid_type VARCHAR(20) DEFAULT 'manual', -- manual, auto
    is_auto_bid BOOLEAN DEFAULT FALSE,
    status bid_status_enum DEFAULT 'active',
    
    -- Tracking
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

-- 4. User Wallets Table
CREATE TABLE IF NOT EXISTS user_wallets (
    wallet_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id INTEGER UNIQUE REFERENCES users(id),
    available_balance DECIMAL(12,2) DEFAULT 0.00,
    frozen_balance DECIMAL(12,2) DEFAULT 0.00, -- Amount frozen for bids
    total_balance DECIMAL(12,2) GENERATED ALWAYS AS (available_balance + frozen_balance) STORED,
    
    -- Limits and settings
    daily_withdrawal_limit DECIMAL(12,2) DEFAULT 100000.00,
    daily_withdrawal_used DECIMAL(12,2) DEFAULT 0.00,
    daily_limit_reset_date DATE DEFAULT CURRENT_DATE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Wallet Transactions Table
CREATE TABLE IF NOT EXISTS wallet_transactions (
    transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID REFERENCES user_wallets(wallet_id),
    user_id INTEGER REFERENCES users(id),
    
    -- Transaction details
    type transaction_type_enum NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    balance_before DECIMAL(12,2) NOT NULL,
    balance_after DECIMAL(12,2) NOT NULL,
    status transaction_status_enum DEFAULT 'pending',
    
    -- References
    auction_id UUID REFERENCES auctions(auction_id),
    bid_id UUID REFERENCES bids(bid_id),
    related_user_id INTEGER REFERENCES users(id), -- For transfers/commissions
    
    -- Payment details
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    description TEXT,
    metadata JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    failed_at TIMESTAMP,
    failure_reason TEXT
);

-- 6. Bid Freezes Table (to track frozen amounts for active bids)
CREATE TABLE IF NOT EXISTS bid_freezes (
    freeze_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bid_id UUID REFERENCES bids(bid_id),
    user_id INTEGER REFERENCES users(id),
    auction_id UUID REFERENCES auctions(auction_id),
    frozen_amount DECIMAL(12,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    released_at TIMESTAMP
);

-- 7. Auction Metrics Table
CREATE TABLE IF NOT EXISTS auction_metrics (
    auction_id UUID PRIMARY KEY REFERENCES auctions(auction_id),
    view_count INTEGER DEFAULT 0,
    unique_viewers INTEGER DEFAULT 0,
    bid_count INTEGER DEFAULT 0,
    unique_bidders INTEGER DEFAULT 0,
    avg_bid_amount DECIMAL(12,2) DEFAULT 0,
    time_to_first_bid INTEGER, -- seconds
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    peak_concurrent_viewers INTEGER DEFAULT 0,
    total_watch_time INTEGER DEFAULT 0 -- seconds
);

-- 8. Auction Transactions Table (for completed sales)
CREATE TABLE IF NOT EXISTS auction_transactions (
    transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auction_id UUID REFERENCES auctions(auction_id),
    buyer_id INTEGER REFERENCES users(id),
    supplier_id INTEGER REFERENCES users(id),
    agent_id INTEGER REFERENCES users(id),
    material_id UUID NOT NULL,
    
    -- Financial breakdown
    total_amount DECIMAL(12,2) NOT NULL,
    supplier_amount DECIMAL(12,2) NOT NULL, -- 85%
    platform_fee DECIMAL(12,2) NOT NULL,    -- 10%
    agent_fee DECIMAL(12,2) NOT NULL,       -- 5%
    
    status transaction_status_enum DEFAULT 'pending',
    payment_completed_at TIMESTAMP,
    disbursement_completed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Commission Tracking Table
CREATE TABLE IF NOT EXISTS commission_tracking (
    commission_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES auction_transactions(transaction_id),
    recipient_id INTEGER REFERENCES users(id),
    recipient_type VARCHAR(20), -- 'platform', 'agent'
    commission_percentage DECIMAL(5,2) NOT NULL,
    commission_amount DECIMAL(12,2) NOT NULL,
    status transaction_status_enum DEFAULT 'pending',
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Notifications Table (enhanced for auction notifications)
CREATE TABLE IF NOT EXISTS notifications (
    notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'unread',
    
    -- Auction specific
    auction_id UUID REFERENCES auctions(auction_id),
    bid_id UUID REFERENCES bids(bid_id),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status);
CREATE INDEX IF NOT EXISTS idx_auctions_end_time ON auctions(end_time);
CREATE INDEX IF NOT EXISTS idx_auctions_supplier ON auctions(supplier_id);
CREATE INDEX IF NOT EXISTS idx_auctions_category ON auctions(category, sub_category);

CREATE INDEX IF NOT EXISTS idx_bids_auction ON bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder ON bids(bidder_id);
CREATE INDEX IF NOT EXISTS idx_bids_amount ON bids(bid_amount DESC);
CREATE INDEX IF NOT EXISTS idx_bids_created_at ON bids(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_auction ON wallet_transactions(auction_id);

CREATE INDEX IF NOT EXISTS idx_bid_freezes_user ON bid_freezes(user_id);
CREATE INDEX IF NOT EXISTS idx_bid_freezes_auction ON bid_freezes(auction_id);
CREATE INDEX IF NOT EXISTS idx_bid_freezes_active ON bid_freezes(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Create triggers for automatic wallet creation
CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_wallets (user_id, available_balance, frozen_balance)
    VALUES (NEW.id, 0.00, 0.00)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_user_wallet
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_wallet();

-- Create trigger for updating auction metrics
CREATE OR REPLACE FUNCTION update_auction_metrics()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE auction_metrics 
        SET bid_count = bid_count + 1,
            last_activity = CURRENT_TIMESTAMP
        WHERE auction_id = NEW.auction_id;
        
        -- Update unique bidders count
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

CREATE TRIGGER trigger_update_auction_metrics
    AFTER INSERT ON bids
    FOR EACH ROW
    EXECUTE FUNCTION update_auction_metrics();

-- Create function to reset daily withdrawal limits
CREATE OR REPLACE FUNCTION reset_daily_withdrawal_limits()
RETURNS void AS $$
BEGIN
    UPDATE user_wallets 
    SET daily_withdrawal_used = 0.00,
        daily_limit_reset_date = CURRENT_DATE
    WHERE daily_limit_reset_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Insert initial wallets for existing users
INSERT INTO user_wallets (user_id, available_balance, frozen_balance)
SELECT id, 0.00, 0.00 FROM users
ON CONFLICT (user_id) DO NOTHING;