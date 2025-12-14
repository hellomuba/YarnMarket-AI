"""
WhatsApp Business API Integration Routes
Handles merchant WhatsApp connection via Meta Embedded Signup
"""

import os
import logging
from datetime import datetime
from typing import Optional, Dict, Any

from fastapi import APIRouter, HTTPException, Depends
import httpx
import asyncpg

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/whatsapp", tags=["whatsapp"])

# Meta Graph API configuration
GRAPH_API_URL = "https://graph.facebook.com/v18.0"
APP_ID = os.getenv("META_APP_ID")
APP_SECRET = os.getenv("META_APP_SECRET")


def get_db_pool():
    """Get database connection pool (will be injected from main app)"""
    from main import db_pool
    if not db_pool:
        raise HTTPException(status_code=503, detail="Database not available")
    return db_pool


@router.post("/complete-signup")
async def complete_whatsapp_signup(payload: Dict[str, Any]):
    """
    Complete WhatsApp Embedded Signup flow
    Exchange Meta auth code for access tokens and configure merchant

    Payload:
        code: Authorization code from Meta
        merchant_id: ID of the merchant connecting WhatsApp
    """

    code = payload.get("code")
    merchant_id = payload.get("merchant_id")

    if not code:
        raise HTTPException(status_code=400, detail="Authorization code required")

    if not merchant_id:
        raise HTTPException(status_code=400, detail="Merchant ID required")

    if not APP_ID or not APP_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Meta API credentials not configured. Set META_APP_ID and META_APP_SECRET"
        )

    logger.info(f"Processing WhatsApp signup for merchant {merchant_id}")

    try:
        # STEP 1: Exchange authorization code for access token
        async with httpx.AsyncClient() as client:
            logger.info("Exchanging auth code for access token...")
            token_response = await client.post(
                f"{GRAPH_API_URL}/oauth/access_token",
                params={
                    "client_id": APP_ID,
                    "client_secret": APP_SECRET,
                    "code": code
                },
                timeout=30.0
            )

            if token_response.status_code != 200:
                logger.error(f"Token exchange failed: {token_response.text}")
                raise HTTPException(
                    status_code=400,
                    detail=f"Failed to exchange auth code: {token_response.text}"
                )

            token_data = token_response.json()
            access_token = token_data.get("access_token")

            if not access_token:
                raise HTTPException(status_code=400, detail="No access token received")

            logger.info("✅ Access token obtained")

        # STEP 2: Get debug token info to extract WABA ID and phone number ID
        async with httpx.AsyncClient() as client:
            logger.info("Getting token debug info...")
            debug_response = await client.get(
                f"{GRAPH_API_URL}/debug_token",
                params={
                    "input_token": access_token,
                    "access_token": f"{APP_ID}|{APP_SECRET}"
                },
                timeout=30.0
            )

            if debug_response.status_code != 200:
                logger.error(f"Debug token failed: {debug_response.text}")
                raise HTTPException(
                    status_code=400,
                    detail="Failed to get token info"
                )

            debug_data = debug_response.json()
            granular_scopes = debug_data.get("data", {}).get("granular_scopes", [])

            # Extract WABA ID and phone number ID from scopes
            waba_id = None
            phone_number_id = None

            for scope in granular_scopes:
                if scope.get("scope") == "whatsapp_business_management":
                    target_ids = scope.get("target_ids", [])
                    if target_ids:
                        waba_id = target_ids[0]

                if scope.get("scope") == "whatsapp_business_messaging":
                    target_ids = scope.get("target_ids", [])
                    if target_ids:
                        phone_number_id = target_ids[0]

            if not waba_id or not phone_number_id:
                logger.error(f"Could not extract IDs. Scopes: {granular_scopes}")
                raise HTTPException(
                    status_code=400,
                    detail="Could not extract WhatsApp account details from token"
                )

            logger.info(f"✅ Extracted WABA ID: {waba_id}, Phone ID: {phone_number_id}")

        # STEP 3: Get phone number details
        async with httpx.AsyncClient() as client:
            logger.info("Getting phone number details...")
            phone_response = await client.get(
                f"{GRAPH_API_URL}/{phone_number_id}",
                params={"access_token": access_token},
                timeout=30.0
            )

            if phone_response.status_code != 200:
                logger.error(f"Get phone failed: {phone_response.text}")
                raise HTTPException(
                    status_code=400,
                    detail="Failed to get phone number details"
                )

            phone_data = phone_response.json()
            display_phone_number = phone_data.get("display_phone_number")
            verified_name = phone_data.get("verified_name")
            quality_rating = phone_data.get("quality_rating", "UNKNOWN")

            if not display_phone_number:
                raise HTTPException(
                    status_code=400,
                    detail="Could not get phone number from Meta"
                )

            logger.info(f"✅ Phone: {display_phone_number}, Verified as: {verified_name}")

        # STEP 4: Check if phone number is already connected to another merchant
        db_pool = get_db_pool()
        async with db_pool.acquire() as conn:
            existing = await conn.fetchrow(
                """
                SELECT id, business_name
                FROM merchants
                WHERE phone_number = $1 AND id != $2
                """,
                display_phone_number,
                merchant_id
            )

            if existing:
                logger.warning(f"Phone {display_phone_number} already connected to merchant {existing['id']}")
                raise HTTPException(
                    status_code=400,
                    detail=f"Phone number {display_phone_number} is already connected to {existing['business_name']}"
                )

        # STEP 5: Update merchant record with WhatsApp details
        async with db_pool.acquire() as conn:
            logger.info(f"Updating merchant {merchant_id} with WhatsApp details...")

            updated = await conn.fetchrow(
                """
                UPDATE merchants
                SET
                    phone_number = $1,
                    phone_number_id = $2,
                    waba_id = $3,
                    whatsapp_access_token = $4,
                    verified_name = $5,
                    quality_rating = $6,
                    status = 'active',
                    whatsapp_connected_at = $7,
                    updated_at = $7
                WHERE id = $8
                RETURNING id, business_name, phone_number, verified_name, quality_rating, status
                """,
                display_phone_number,
                phone_number_id,
                waba_id,
                access_token,
                verified_name,
                quality_rating,
                datetime.utcnow(),
                merchant_id
            )

            if not updated:
                raise HTTPException(
                    status_code=404,
                    detail=f"Merchant {merchant_id} not found"
                )

            logger.info(f"✅ Merchant {merchant_id} updated successfully")

        # STEP 6: Subscribe app to webhooks for this phone number
        try:
            async with httpx.AsyncClient() as client:
                logger.info("Subscribing to webhooks...")
                subscribe_response = await client.post(
                    f"{GRAPH_API_URL}/{phone_number_id}/subscribed_apps",
                    params={"access_token": access_token},
                    timeout=30.0
                )

                if subscribe_response.status_code == 200:
                    logger.info("✅ Webhook subscription successful")
                else:
                    logger.warning(f"Webhook subscription warning: {subscribe_response.text}")
        except Exception as e:
            logger.warning(f"Non-critical webhook subscription error: {e}")

        # STEP 7: Create merchant-specific resources (Weaviate collection, etc.)
        try:
            await provision_merchant_resources(merchant_id)
        except Exception as e:
            logger.error(f"Error provisioning resources: {e}")
            # Don't fail the whole flow if resource provisioning fails

        logger.info(f"🎉 WhatsApp connection completed for merchant {merchant_id}")

        return {
            "success": True,
            "merchant_id": merchant_id,
            "phone_number": display_phone_number,
            "verified_name": verified_name,
            "quality_rating": quality_rating,
            "waba_id": waba_id,
            "status": "connected"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in WhatsApp signup: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal error during WhatsApp signup: {str(e)}"
        )


@router.post("/disconnect")
async def disconnect_whatsapp(payload: Dict[str, Any]):
    """
    Disconnect WhatsApp from a merchant account
    """
    merchant_id = payload.get("merchant_id")

    if not merchant_id:
        raise HTTPException(status_code=400, detail="Merchant ID required")

    db_pool = get_db_pool()

    async with db_pool.acquire() as conn:
        updated = await conn.fetchrow(
            """
            UPDATE merchants
            SET
                phone_number_id = NULL,
                waba_id = NULL,
                whatsapp_access_token = NULL,
                status = 'disconnected',
                updated_at = $1
            WHERE id = $2
            RETURNING id, business_name
            """,
            datetime.utcnow(),
            merchant_id
        )

        if not updated:
            raise HTTPException(status_code=404, detail=f"Merchant {merchant_id} not found")

    logger.info(f"WhatsApp disconnected for merchant {merchant_id}")

    return {
        "success": True,
        "merchant_id": merchant_id,
        "status": "disconnected"
    }


@router.get("/status/{merchant_id}")
async def get_whatsapp_status(merchant_id: int):
    """
    Get WhatsApp connection status for a merchant
    """
    db_pool = get_db_pool()

    async with db_pool.acquire() as conn:
        merchant = await conn.fetchrow(
            """
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
            WHERE id = $1
            """,
            merchant_id
        )

        if not merchant:
            raise HTTPException(status_code=404, detail=f"Merchant {merchant_id} not found")

        is_connected = (
            merchant["phone_number_id"] is not None
            and merchant["waba_id"] is not None
            and merchant["status"] == "active"
        )

        return {
            "merchant_id": merchant_id,
            "connected": is_connected,
            "phone_number": merchant["phone_number"],
            "verified_name": merchant["verified_name"],
            "quality_rating": merchant["quality_rating"],
            "status": merchant["status"],
            "connected_at": merchant["whatsapp_connected_at"].isoformat() if merchant["whatsapp_connected_at"] else None
        }


async def provision_merchant_resources(merchant_id: int):
    """
    Provision merchant-specific resources after WhatsApp connection
    - Weaviate collection for product search
    - MongoDB settings document
    - Redis cache entries
    """
    logger.info(f"Provisioning resources for merchant {merchant_id}...")

    # Create Weaviate collection
    try:
        import weaviate
        weaviate_client = weaviate.Client(
            url=os.getenv("WEAVIATE_URL", "http://weaviate:8080")
        )

        collection_name = f"Merchant_{merchant_id}_Products"

        # Check if collection exists
        try:
            weaviate_client.schema.get(collection_name)
            logger.info(f"Weaviate collection {collection_name} already exists")
        except:
            # Create new collection
            weaviate_client.schema.create_class({
                "class": collection_name,
                "vectorizer": "text2vec-openai",
                "moduleConfig": {
                    "text2vec-openai": {
                        "model": "ada",
                        "modelVersion": "002",
                        "type": "text"
                    }
                },
                "properties": [
                    {"name": "product_id", "dataType": ["int"]},
                    {"name": "merchant_id", "dataType": ["int"]},
                    {"name": "product_name", "dataType": ["text"]},
                    {"name": "description", "dataType": ["text"]},
                    {"name": "price", "dataType": ["number"]},
                    {"name": "currency", "dataType": ["text"]},
                    {"name": "category", "dataType": ["text"]},
                    {"name": "in_stock", "dataType": ["boolean"]},
                    {"name": "image_url", "dataType": ["text"]}
                ]
            })
            logger.info(f"✅ Created Weaviate collection: {collection_name}")

    except Exception as e:
        logger.warning(f"Could not create Weaviate collection: {e}")

    logger.info(f"✅ Resource provisioning completed for merchant {merchant_id}")
