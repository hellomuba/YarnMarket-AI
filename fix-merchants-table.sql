-- Fix Merchants Table Schema
-- Add all missing columns for admin dashboard

-- Add missing columns one by one
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS contact_name VARCHAR(255);
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20);
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS business_address TEXT;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS phone_number_id VARCHAR(100);
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS whatsapp_business_account_id VARCHAR(100);
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS api_key VARCHAR(255);
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS webhook_url VARCHAR(500);
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS total_messages INTEGER DEFAULT 0;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS total_customers INTEGER DEFAULT 0;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_merchants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS merchants_updated_at_trigger ON merchants;
CREATE TRIGGER merchants_updated_at_trigger
    BEFORE UPDATE ON merchants
    FOR EACH ROW
    EXECUTE FUNCTION update_merchants_updated_at();

-- Add phone and whatsapp_number columns (dashboard-api expects these)
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20);

-- Verify the schema
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'merchants'
ORDER BY ordinal_position;
