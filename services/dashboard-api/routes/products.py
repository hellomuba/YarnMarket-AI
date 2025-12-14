"""
Products API Routes
Handles product catalog management for merchants
Supports both simple products and advanced products with variants
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/products", tags=["products"])


class ProductVariant(BaseModel):
    """Product variant model for advanced products"""
    id: Optional[int] = None
    sku: Optional[str] = None
    variant_name: str
    colour: Optional[str] = None
    size: Optional[str] = None
    price: float
    stock_quantity: int = 0
    availability: bool = True
    image_url: Optional[str] = None
    metadata: Optional[dict] = {}


class Product(BaseModel):
    """Product model supporting both simple and advanced types"""
    name: str
    description: Optional[str] = None
    brand: Optional[str] = None
    category: Literal[
        "Clothing",
        "Electronics",
        "Food & Groceries",
        "Beauty & Personal Care",
        "Home & Living",
        "Sports & Outdoors",
        "Books & Media",
        "Toys & Games",
        "Other"
    ]
    product_type: Literal["simple", "advanced"] = "simple"
    base_price: float
    currency: str = "NGN"
    ean: Optional[str] = None
    image_url: Optional[str] = None
    metadata: Optional[dict] = {}
    is_active: bool = True
    merchant_id: int = 1  # TODO: Get from auth context
    variants: Optional[List[ProductVariant]] = []


@router.get("")
async def get_products(merchant_id: int = 1):
    """Get all products for a merchant with their variants"""
    from main import db_pool

    if not db_pool:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        async with db_pool.acquire() as conn:
            # Use the view that includes variants
            rows = await conn.fetch("""
                SELECT * FROM products_with_variants
                WHERE merchant_id = $1
                ORDER BY created_at DESC
            """, merchant_id)

            products = [dict(row) for row in rows]
            return products
    except Exception as e:
        logger.error(f"Error fetching products: {e}")
        # Return empty array if table doesn't exist
        return []


@router.post("")
async def create_product(product: Product):
    """Create a new product (simple or advanced with variants)"""
    from main import db_pool
    import json

    if not db_pool:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        async with db_pool.acquire() as conn:
            # Start transaction
            async with conn.transaction():
                # Insert main product
                product_row = await conn.fetchrow("""
                    INSERT INTO products (
                        merchant_id, name, description, brand, category, product_type,
                        base_price, currency, ean, image_url, metadata, is_active, created_at
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                    RETURNING id, merchant_id, name, description, brand, category, product_type,
                              base_price, currency, ean, image_url, is_active, created_at
                """,
                    product.merchant_id,
                    product.name,
                    product.description,
                    product.brand,
                    product.category,
                    product.product_type,
                    product.base_price,
                    product.currency,
                    product.ean,
                    product.image_url,
                    json.dumps(product.metadata or {}),
                    product.is_active,
                    datetime.utcnow()
                )

                product_id = product_row['id']
                variants_data = []

                # If advanced product, insert variants
                if product.product_type == "advanced" and product.variants:
                    for variant in product.variants:
                        variant_row = await conn.fetchrow("""
                            INSERT INTO product_variants (
                                product_id, sku, variant_name, colour, size, price,
                                stock_quantity, availability, image_url, metadata, created_at
                            )
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                            RETURNING id, sku, variant_name, colour, size, price,
                                      stock_quantity, availability, image_url
                        """,
                            product_id,
                            variant.sku,
                            variant.variant_name,
                            variant.colour,
                            variant.size,
                            variant.price,
                            variant.stock_quantity,
                            variant.availability,
                            variant.image_url,
                            json.dumps(variant.metadata or {}),
                            datetime.utcnow()
                        )
                        variants_data.append(dict(variant_row))

                logger.info(f"✅ Created {product.product_type} product: {product.name} for merchant {product.merchant_id}")

                result = dict(product_row)
                result['variants'] = variants_data
                return result

    except Exception as e:
        logger.error(f"❌ Error creating product: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create product: {str(e)}")


@router.put("/{product_id}")
async def update_product(product_id: int, product: Product):
    """Update an existing product with variants"""
    from main import db_pool
    import json

    if not db_pool:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        async with db_pool.acquire() as conn:
            async with conn.transaction():
                # Update main product
                row = await conn.fetchrow("""
                    UPDATE products
                    SET
                        name = $1,
                        description = $2,
                        brand = $3,
                        category = $4,
                        product_type = $5,
                        base_price = $6,
                        currency = $7,
                        ean = $8,
                        image_url = $9,
                        metadata = $10,
                        is_active = $11,
                        updated_at = $12
                    WHERE id = $13 AND merchant_id = $14
                    RETURNING id, merchant_id, name, description, brand, category,
                              product_type, base_price, currency, ean, image_url, is_active
                """,
                    product.name,
                    product.description,
                    product.brand,
                    product.category,
                    product.product_type,
                    product.base_price,
                    product.currency,
                    product.ean,
                    product.image_url,
                    json.dumps(product.metadata or {}),
                    product.is_active,
                    datetime.utcnow(),
                    product_id,
                    product.merchant_id
                )

                if not row:
                    raise HTTPException(status_code=404, detail="Product not found")

                # Delete existing variants and recreate if advanced
                await conn.execute("DELETE FROM product_variants WHERE product_id = $1", product_id)

                variants_data = []
                if product.product_type == "advanced" and product.variants:
                    for variant in product.variants:
                        variant_row = await conn.fetchrow("""
                            INSERT INTO product_variants (
                                product_id, sku, variant_name, colour, size, price,
                                stock_quantity, availability, image_url, metadata
                            )
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                            RETURNING id, sku, variant_name, colour, size, price,
                                      stock_quantity, availability
                        """,
                            product_id,
                            variant.sku,
                            variant.variant_name,
                            variant.colour,
                            variant.size,
                            variant.price,
                            variant.stock_quantity,
                            variant.availability,
                            variant.image_url,
                            json.dumps(variant.metadata or {})
                        )
                        variants_data.append(dict(variant_row))

                logger.info(f"✅ Updated product: {product_id}")
                result = dict(row)
                result['variants'] = variants_data
                return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error updating product: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update product: {str(e)}")


@router.delete("/{product_id}")
async def delete_product(product_id: int, merchant_id: int = 1):
    """Delete a product"""
    from main import db_pool

    if not db_pool:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        async with db_pool.acquire() as conn:
            result = await conn.execute("""
                DELETE FROM products
                WHERE id = $1 AND merchant_id = $2
            """, product_id, merchant_id)

            if result == "DELETE 0":
                raise HTTPException(status_code=404, detail="Product not found")

            logger.info(f"✅ Deleted product: {product_id}")
            return {"status": "deleted", "id": product_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error deleting product: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete product: {str(e)}")
