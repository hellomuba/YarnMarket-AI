"""
Products API Routes
Handles product catalog management for merchants
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/products", tags=["products"])


class Product(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    currency: str = "NGN"
    category: str
    in_stock: bool = True
    stock_quantity: Optional[int] = None
    merchant_id: int = 1  # TODO: Get from auth context


@router.get("")
async def get_products(merchant_id: int = 1):
    """Get all products for a merchant"""
    from main import db_pool

    if not db_pool:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        async with db_pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT
                    id, merchant_id, name, description, price, currency,
                    category, in_stock, stock_quantity, created_at
                FROM products
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
    """Create a new product"""
    from main import db_pool

    if not db_pool:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        async with db_pool.acquire() as conn:
            row = await conn.fetchrow("""
                INSERT INTO products (
                    merchant_id, name, description, price, currency,
                    category, in_stock, stock_quantity, created_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING
                    id, merchant_id, name, description, price, currency,
                    category, in_stock, stock_quantity, created_at
            """,
                product.merchant_id,
                product.name,
                product.description,
                product.price,
                product.currency,
                product.category,
                product.in_stock,
                product.stock_quantity,
                datetime.utcnow()
            )

            logger.info(f"✅ Created product: {product.name} for merchant {product.merchant_id}")
            return dict(row)
    except Exception as e:
        logger.error(f"❌ Error creating product: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create product: {str(e)}")


@router.put("/{product_id}")
async def update_product(product_id: int, product: Product):
    """Update an existing product"""
    from main import db_pool

    if not db_pool:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        async with db_pool.acquire() as conn:
            row = await conn.fetchrow("""
                UPDATE products
                SET
                    name = $1,
                    description = $2,
                    price = $3,
                    currency = $4,
                    category = $5,
                    in_stock = $6,
                    stock_quantity = $7
                WHERE id = $8 AND merchant_id = $9
                RETURNING
                    id, merchant_id, name, description, price, currency,
                    category, in_stock, stock_quantity, created_at
            """,
                product.name,
                product.description,
                product.price,
                product.currency,
                product.category,
                product.in_stock,
                product.stock_quantity,
                product_id,
                product.merchant_id
            )

            if not row:
                raise HTTPException(status_code=404, detail="Product not found")

            logger.info(f"✅ Updated product: {product_id}")
            return dict(row)
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
