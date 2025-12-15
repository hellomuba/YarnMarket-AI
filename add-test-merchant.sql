-- Add Test Merchant for WhatsApp Webhook Testing
-- Run this in your Railway PostgreSQL database

-- First, check if merchants table has required columns
-- Add columns if they don't exist
ALTER TABLE merchants
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS phone_number_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS whatsapp_business_account_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS business_address TEXT;

-- Insert or update test merchant with Meta's test phone number
INSERT INTO merchants (
    business_name,
    phone_number,
    phone_number_id,
    whatsapp_business_account_id,
    business_type,
    status,
    contact_phone,
    contact_email
) VALUES (
    'Test Store - YarnMarket AI',
    '16505551111',  -- Meta's test display phone number
    '123456123',    -- Your actual phone_number_id from Meta
    'WHATSAPP_BUSINESS_ACCOUNT_ID',  -- Replace with your actual WABA ID
    'general',
    'active',
    '16505551111',
    'test@yarnmarket.ai'
)
ON CONFLICT (phone_number)
DO UPDATE SET
    phone_number_id = EXCLUDED.phone_number_id,
    whatsapp_business_account_id = EXCLUDED.whatsapp_business_account_id,
    status = 'active',
    updated_at = CURRENT_TIMESTAMP;

-- Add some sample products for this merchant
INSERT INTO products (merchant_id, name, description, price, category, in_stock)
SELECT
    m.id,
    'Sample Product 1',
    'This is a test product for webhook testing',
    10000.00,
    'test',
    true
FROM merchants m
WHERE m.phone_number = '16505551111'
ON CONFLICT DO NOTHING;

-- Verify the merchant was added
SELECT
    id,
    business_name,
    phone_number,
    phone_number_id,
    status,
    created_at
FROM merchants
WHERE phone_number = '16505551111';
