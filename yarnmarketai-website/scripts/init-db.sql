-- YarnMarket AI Database Initialization Script

-- Create database if it doesn't exist
SELECT 'CREATE DATABASE yarnmarket' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'yarnmarket');

-- Connect to yarnmarket database
\c yarnmarket;

-- Create merchants table
CREATE TABLE IF NOT EXISTS merchants (
    id SERIAL PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    business_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create customers table  
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255),
    preferred_language VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_interaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    merchant_id INTEGER REFERENCES merchants(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'NGN',
    category VARCHAR(100),
    in_stock BOOLEAN DEFAULT TRUE,
    stock_quantity INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    customer_phone VARCHAR(20) NOT NULL,
    merchant_id INTEGER REFERENCES merchants(id),
    status VARCHAR(20) DEFAULT 'active',
    language VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_phone VARCHAR(20) NOT NULL,
    merchant_id INTEGER REFERENCES merchants(id),
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'NGN',
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO merchants (business_name, phone_number, business_type) VALUES
('Kemi Fashion Store', '+2348012345678', 'clothing'),
('Ibrahim Electronics', '+2348123456789', 'electronics'),
('Mama Ngozi Provisions', '+2348234567890', 'grocery')
ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO customers (phone_number, name, preferred_language) VALUES
('+2349012345678', 'Adebayo Johnson', 'pidgin'),
('+2349123456789', 'Fatima Hassan', 'english'),
('+2349234567890', 'Chioma Okafor', 'igbo')
ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO products (merchant_id, name, description, price, category) VALUES
(1, 'Cotton Shirt', 'High quality cotton shirt, available in multiple colors', 15000.00, 'clothing'),
(1, 'Jeans', 'Durable denim jeans, perfect fit', 25000.00, 'clothing'),
(2, 'Smartphone', 'Latest Android smartphone with great camera', 150000.00, 'electronics'),
(3, 'Rice (50kg)', 'Premium quality local rice', 35000.00, 'food');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_customer ON conversations(customer_phone);
CREATE INDEX IF NOT EXISTS idx_conversations_merchant ON conversations(merchant_id);
CREATE INDEX IF NOT EXISTS idx_products_merchant ON products(merchant_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_phone);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO yarnmarket;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO yarnmarket;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_merchants_updated_at BEFORE UPDATE ON merchants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;