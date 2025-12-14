-- Migration: Add WhatsApp integration columns to merchants table
-- Purpose: Support multi-tenant WhatsApp Business API integration
-- Date: 2025-12-14

\c yarnmarket;

-- Add WhatsApp-specific columns to merchants table
ALTER TABLE merchants
ADD COLUMN IF NOT EXISTS phone_number_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS waba_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS whatsapp_access_token TEXT,
ADD COLUMN IF NOT EXISTS verified_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS quality_rating VARCHAR(50) DEFAULT 'UNKNOWN',
ADD COLUMN IF NOT EXISTS whatsapp_connected_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';

-- Create indexes for fast phone number lookups (critical for webhook routing)
CREATE INDEX IF NOT EXISTS idx_merchants_phone ON merchants(phone_number);
CREATE INDEX IF NOT EXISTS idx_merchants_phone_number_id ON merchants(phone_number_id);
CREATE INDEX IF NOT EXISTS idx_merchants_waba ON merchants(waba_id);
CREATE INDEX IF NOT EXISTS idx_merchants_status ON merchants(status);

-- Add comments for documentation
COMMENT ON COLUMN merchants.phone_number IS 'WhatsApp phone number in E.164 format (e.g., +2348012345678)';
COMMENT ON COLUMN merchants.phone_number_id IS 'WhatsApp Business API phone number ID from Meta';
COMMENT ON COLUMN merchants.waba_id IS 'WhatsApp Business Account ID from Meta';
COMMENT ON COLUMN merchants.whatsapp_access_token IS 'Access token for sending WhatsApp messages via Meta API';
COMMENT ON COLUMN merchants.verified_name IS 'Verified business name displayed in WhatsApp';
COMMENT ON COLUMN merchants.quality_rating IS 'WhatsApp quality rating: GREEN, YELLOW, RED, UNKNOWN';
COMMENT ON COLUMN merchants.whatsapp_connected_at IS 'Timestamp when WhatsApp was connected via Embedded Signup';
COMMENT ON COLUMN merchants.status IS 'Merchant status: pending, active, suspended, disconnected';

-- Update existing merchants to 'active' status if they have phone numbers
UPDATE merchants
SET status = 'active'
WHERE phone_number IS NOT NULL
AND status = 'pending';

-- Create a function to check if merchant has WhatsApp connected
CREATE OR REPLACE FUNCTION is_whatsapp_connected(merchant_row merchants)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN merchant_row.phone_number_id IS NOT NULL
       AND merchant_row.waba_id IS NOT NULL
       AND merchant_row.whatsapp_access_token IS NOT NULL
       AND merchant_row.status = 'active';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION is_whatsapp_connected IS 'Check if merchant has completed WhatsApp Business API setup';

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO yarnmarket;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO yarnmarket;

-- Verify migration
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'merchants'
AND column_name IN ('phone_number_id', 'waba_id', 'whatsapp_access_token', 'verified_name', 'quality_rating', 'whatsapp_connected_at', 'status')
ORDER BY ordinal_position;

-- Show sample merchant data
SELECT
    id,
    business_name,
    phone_number,
    phone_number_id,
    waba_id,
    verified_name,
    quality_rating,
    status,
    whatsapp_connected_at
FROM merchants
LIMIT 5;
