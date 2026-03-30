"""
Live Prices API Route
======================
GET  /api/live-prices         — Returns current scraped + cached material prices
POST /api/live-prices/refresh — Forces a fresh scrape (bypasses cache)
"""

from fastapi import APIRouter, BackgroundTasks
from typing import Dict, Any
from app.services.price_scraper import price_cache, LivePrice
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


def _price_to_dict(p: LivePrice) -> Dict[str, Any]:
    return {
        "material":    p.material,
        "unit":        p.unit,
        "low":         p.low,
        "high":        p.high,
        "mid":         p.mid,
        "source_name": p.source_name,
        "source_url":  p.source_url,
        "scraped_at":  p.scraped_at,
        "is_live":     p.is_live,
    }


@router.get("/live-prices")
async def get_live_prices():
    """
    Return the current live-scraped material prices.

    Response includes:
    - `prices`: dict of material name → price object
    - `live_count`: how many were scraped live (vs baseline)
    - `total`: total materials in response
    - `cache_note`: human-readable freshness note
    """
    try:
        prices = price_cache.get_prices()
        live_count = sum(1 for p in prices.values() if p.is_live)
        return {
            "success":    True,
            "prices":     {k: _price_to_dict(v) for k, v in prices.items()},
            "live_count": live_count,
            "total":      len(prices),
            "cache_note": (
                f"{live_count} of {len(prices)} prices are live-scraped from Indian construction sites."
                if live_count > 0
                else "All prices are from compiled 2025-26 baseline — scraping may have failed."
            ),
        }
    except Exception as exc:
        logger.error(f"live-prices endpoint error: {exc}", exc_info=True)
        return {
            "success":    False,
            "prices":     {},
            "live_count": 0,
            "total":      0,
            "cache_note": f"Error: {str(exc)}",
        }


@router.post("/live-prices/refresh")
async def force_refresh_prices(background_tasks: BackgroundTasks):
    """
    Force a fresh scrape in the background.
    Returns immediately — use GET /api/live-prices after a few seconds to see results.
    """
    background_tasks.add_task(_do_refresh)
    return {
        "success": True,
        "message": "Price refresh triggered. Results will be available in ~10 seconds.",
    }


def _do_refresh():
    price_cache.get_prices(force_refresh=True)
