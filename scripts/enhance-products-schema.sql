-- Migration: Enhance products table with advanced fields and variants support
-- Purpose: Support simple and advanced products with multiple variants
-- Date: 2025-12-14

-- Drop existing products table and recreate with enhanced schema
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS products CASCADE;

-- Main products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    merchant_id INTEGER NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    brand VARCHAR(100),
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'Clothing',
        'Electronics',
        'Food & Groceries',
        'Beauty & Personal Care',
        'Home & Living',
        'Sports & Outdoors',
        'Books & Media',
        'Toys & Games',
        'Other'
    )),
    product_type VARCHAR(20) DEFAULT 'simple' CHECK (product_type IN ('simple', 'advanced')),
    base_price NUMERIC(12,2) NOT NULL,
    currency CHAR(3) DEFAULT 'NGN',
    ean VARCHAR(50),
    image_url TEXT,
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product variants table (for advanced products with multiple options)
CREATE TABLE product_variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100),
    variant_name VARCHAR(255) NOT NULL,
    colour VARCHAR(50),
    size VARCHAR(50),
    price NUMERIC(12,2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    availability BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_products_merchant ON products(merchant_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_type ON products(product_type);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_sku ON product_variants(sku);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_variants_updated_at
    BEFORE UPDATE ON product_variants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add helpful views
CREATE OR REPLACE VIEW products_with_variants AS
SELECT
    p.id,
    p.merchant_id,
    p.name,
    p.description,
    p.brand,
    p.category,
    p.product_type,
    p.base_price,
    p.currency,
    p.ean,
    p.image_url AS product_image,
    p.is_active,
    p.created_at,
    COALESCE(
        json_agg(
            json_build_object(
                'id', pv.id,
                'sku', pv.sku,
                'variant_name', pv.variant_name,
                'colour', pv.colour,
                'size', pv.size,
                'price', pv.price,
                'stock_quantity', pv.stock_quantity,
                'availability', pv.availability,
                'image_url', pv.image_url
            ) ORDER BY pv.id
        ) FILTER (WHERE pv.id IS NOT NULL),
        '[]'
    ) AS variants,
    COALESCE(SUM(pv.stock_quantity), 0) AS total_stock
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
GROUP BY p.id;

-- Add comments for documentation
COMMENT ON TABLE products IS 'Main products table supporting both simple and advanced (variant-based) products';
COMMENT ON TABLE product_variants IS 'Product variants for advanced products with multiple size/color options';
COMMENT ON COLUMN products.product_type IS 'Type: simple (no variants) or advanced (with variants)';
COMMENT ON COLUMN products.base_price IS 'Base price for simple products or reference price for advanced products';
COMMENT ON COLUMN products.metadata IS 'Additional product data in JSON format';
COMMENT ON COLUMN product_variants.sku IS 'Stock Keeping Unit - unique identifier for each variant';

-- Insert sample data
INSERT INTO products (merchant_id, name, description, brand, category, product_type, base_price, currency, ean, image_url) VALUES
-- Simple products
(1, 'Cotton T-Shirt', 'Premium quality cotton t-shirt, comfortable and breathable', 'LocalBrand', 'Clothing', 'simple', 5000.00, 'NGN', '1234567890123', 'https://example.com/tshirt.jpg'),
(2, 'Wireless Mouse', 'Ergonomic wireless mouse with USB receiver', 'TechGear', 'Electronics', 'simple', 8500.00, 'NGN', '2345678901234', 'https://example.com/mouse.jpg'),
(3, 'Organic Honey', 'Pure organic honey from local farms, 500g jar', 'NaijaNatural', 'Food & Groceries', 'simple', 3500.00, 'NGN', '3456789012345', 'https://example.com/honey.jpg');

-- Advanced product with variants
INSERT INTO products (merchant_id, name, description, brand, category, product_type, base_price, currency, ean, image_url)
VALUES (1, 'Designer Sneakers', 'Premium designer sneakers available in multiple colors and sizes', 'UrbanFit', 'Clothing', 'advanced', 25000.00, 'NGN', '4567890123456', 'https://example.com/sneakers.jpg')
RETURNING id AS sneaker_product_id \gset

-- Insert variants for sneakers
INSERT INTO product_variants (product_id, sku, variant_name, colour, size, price, stock_quantity, availability) VALUES
((SELECT id FROM products WHERE name = 'Designer Sneakers'), 'SNK-BLK-40', 'Black Sneakers - Size 40', 'Black', '40', 25000.00, 10, TRUE),
((SELECT id FROM products WHERE name = 'Designer Sneakers'), 'SNK-BLK-42', 'Black Sneakers - Size 42', 'Black', '42', 25000.00, 15, TRUE),
((SELECT id FROM products WHERE name = 'Designer Sneakers'), 'SNK-BLK-44', 'Black Sneakers - Size 44', 'Black', '44', 25000.00, 8, TRUE),
((SELECT id FROM products WHERE name = 'Designer Sneakers'), 'SNK-WHT-40', 'White Sneakers - Size 40', 'White', '40', 27000.00, 12, TRUE),
((SELECT id FROM products WHERE name = 'Designer Sneakers'), 'SNK-WHT-42', 'White Sneakers - Size 42', 'White', '42', 27000.00, 20, TRUE),
((SELECT id FROM products WHERE name = 'Designer Sneakers'), 'SNK-RED-42', 'Red Sneakers - Size 42', 'Red', '42', 28000.00, 5, TRUE);

-- Grant permissions
GRANT ALL PRIVILEGES ON products TO yarnmarket;
GRANT ALL PRIVILEGES ON product_variants TO yarnmarket;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO yarnmarket;

-- Verify migration
SELECT
    'Products' as table_name,
    COUNT(*) as record_count
FROM products
UNION ALL
SELECT
    'Product Variants',
    COUNT(*)
FROM product_variants;

-- Show sample data
SELECT * FROM products_with_variants LIMIT 5;
