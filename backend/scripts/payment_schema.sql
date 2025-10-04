-- Payment System Database Schema Updates
-- Add support for Stripe payments and wallet transactions

-- Create payment_intents table for tracking Stripe payment intents
CREATE TABLE IF NOT EXISTS payment_intents (
    id VARCHAR(255) PRIMARY KEY,
    user_id INTEGER NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'LKR',
    status VARCHAR(50) NOT NULL,
    description TEXT,
    client_secret VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_payment_intents_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create payment_methods table for storing user payment methods
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL,
    stripe_payment_method_id VARCHAR(255),
    type VARCHAR(50) NOT NULL, -- 'card', 'bank_account', etc.
    provider VARCHAR(100) DEFAULT 'stripe',
    card_brand VARCHAR(50),
    card_last_four VARCHAR(4),
    card_exp_month INTEGER,
    card_exp_year INTEGER,
    bank_name VARCHAR(255),
    account_number_last_four VARCHAR(4),
    is_default BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_payment_methods_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create stripe_customers table for mapping users to Stripe customers
CREATE TABLE IF NOT EXISTS stripe_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL UNIQUE,
    stripe_customer_id VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    email VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_stripe_customers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Update wallet_transactions table to include payment method and reference information
ALTER TABLE wallet_transactions 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS reference_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_intents_user_id ON payment_intents(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON payment_intents(status);
CREATE INDEX IF NOT EXISTS idx_payment_intents_created ON payment_intents(created_at);

CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_default ON payment_methods(is_default);
CREATE INDEX IF NOT EXISTS idx_payment_methods_stripe_id ON payment_methods(stripe_payment_method_id);

CREATE INDEX IF NOT EXISTS idx_stripe_customers_user_id ON stripe_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_customers_stripe_id ON stripe_customers(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_payment_method ON wallet_transactions(payment_method);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_reference_id ON wallet_transactions(reference_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_stripe_payment_intent_id ON wallet_transactions(stripe_payment_intent_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to new tables
CREATE TRIGGER update_payment_intents_updated_at BEFORE UPDATE ON payment_intents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stripe_customers_updated_at BEFORE UPDATE ON stripe_customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample payment method types (for reference)
INSERT INTO payment_methods (user_id, type, provider, is_default, is_verified, metadata) 
VALUES 
    (1, 'stripe', 'stripe', true, true, '{"description": "Stripe credit/debit card payments"}')
ON CONFLICT DO NOTHING;