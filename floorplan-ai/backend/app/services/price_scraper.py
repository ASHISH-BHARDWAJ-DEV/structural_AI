"""
Live Material Price Scraper Service
====================================
Scrapes current construction material prices from Indian housing/construction sites.

Strategy:
  - Parse HTML price TABLES directly (material name + unit + price range in separate columns)
  - Convert raw scraped prices to ₹/m² using realistic conversion factors
  - Validate converted prices against per-material bounds before accepting
  - Cache results in-memory for 6 hours
  - Fall back to compiled 2025-26 baseline prices if scraping fails or prices are invalid

Sources:
  - Table 0 at houseyog.com/blog/building-material-cost-list/ — main price table:
      Cement | Steel | Bricks | Fly Ash | AAC | Sand | Aggregate | RMC
"""

import re
import time
import logging
import threading
from typing import Dict, Tuple, Optional, List
from dataclasses import dataclass, field
from datetime import datetime

import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

# ─── Cache Config ──────────────────────────────────────────────────────────────
CACHE_TTL_SECONDS = 6 * 60 * 60   # Refresh every 6 hours
REQUEST_TIMEOUT   = 15
REQUEST_HEADERS   = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-IN,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

# ─── Data Models ───────────────────────────────────────────────────────────────
@dataclass
class LivePrice:
    material: str
    unit: str
    low: float
    high: float
    mid: float
    source_name: str
    source_url: str
    scraped_at: str
    is_live: bool = True


@dataclass
class PriceCache:
    data: Dict[str, "LivePrice"] = field(default_factory=dict)
    fetched_at: float = 0.0
    is_stale: bool = True


# ─── Baseline prices (₹/m²) — 2025-26 compiled data ───────────────────────────
BASELINE_PRICES: Dict[str, Tuple[float, float, str]] = {
    "AAC Blocks":             (800,   1200,  "per m²"),
    "Red Brick":              (1000,  1500,  "per m²"),
    "RCC":                    (2000,  3000,  "per m²"),
    "Steel Frame":            (3500,  5500,  "per m²"),
    "Hollow Concrete Block":  (700,   1000,  "per m²"),
    "Fly Ash Brick":          (850,   1200,  "per m²"),
    "Precast Concrete Panel": (1800,  2800,  "per m²"),
}

# ─── Per-material valid price bounds (₹/m²) ────────────────────────────────────
# Scraped+converted prices outside these ranges are rejected → falls to baseline.
PRICE_BOUNDS_PER_M2: Dict[str, Tuple[float, float]] = {
    "AAC Blocks":             (400,    2500),
    "Red Brick":              (500,    3000),
    "RCC":                    (1000,   8000),
    "Steel Frame":            (1500,  15000),
    "Hollow Concrete Block":  (300,    2500),
    "Fly Ash Brick":          (200,    2500),
    "Precast Concrete Panel": (800,    8000),
}

# ─── Source URL ────────────────────────────────────────────────────────────────
MAIN_SOURCE = {
    "name": "Houseyog",
    "url":  "https://www.houseyog.com/blog/building-material-cost-list/",
}

# ─── Material mapping: page name fragments → canonical names + conversion ──────
#
# conversion_to_m2: multiply raw scraped (lo, hi) per-unit by this to get ₹/m²
#
# Fly Ash Bricks:  ₹6–₹9 per piece × 55 pieces/m²  → ₹330–₹495/m²
#   (but baselines say 850-1200 after mortar+wastage → we use scraped + labour uplift)
#   Actual installed cost ≈ raw material × 2.5 (mortar, labour, wastage)
# AAC Blocks:      ₹60–₹90 per block × 8 blocks/m² × 1.4 (mortar+labour) → ₹672–₹1008
# Red Brick/Clay:  ₹7–₹12 per piece × 55/m² × 2.5 → ₹963–₹1650
# Steel (TMT):     ₹60–₹75 per kg × 12 kg/m² (RCC wall equivalent) → ₹720–₹900
#   (Steel Frame cost = steel + formwork + labour ≈ ×5 → ₹3600–₹4500)
# RMC Concrete:    ₹4500–₹6500 per m³ → per 0.15m thick wall = ×0.15 → ₹675–₹975
#   but full RCC cost includes rebar + formwork + labour ≈ ×3 → ₹2025–₹2925

MATERIAL_MAP = [
    # (fragment in page table, canonical name, unit_from_page, conversion_factor)
    # conversion converts raw price-per-unit → ₹/m² installed wall/element
    {
        "fragments":  ["fly ash brick", "fly ash bricks"],
        "material":   "Fly Ash Brick",
        "raw_unit":   "per piece",
        "to_per_m2":  55 * 2.5,   # 55 pieces/m² × 2.5 installation multiplier
    },
    {
        "fragments":  ["aac block", "aac blocks"],
        "material":   "AAC Blocks",
        "raw_unit":   "per block",
        "to_per_m2":  8 * 1.5,    # 8 blocks/m² × 1.5 (mortar+minor labour)
    },
    {
        "fragments":  ["bricks (clay)", "clay brick", "red brick"],
        "material":   "Red Brick",
        "raw_unit":   "per piece",
        "to_per_m2":  55 * 2.5,   # 55 bricks/m² × 2.5 installation
    },
    {
        "fragments":  ["ready mix concrete", "rmc"],
        "material":   "RCC",
        "raw_unit":   "per m³",
        "to_per_m2":  0.15 * 3.2, # 0.15m wall thickness × 3.2 (rebar+formwork+labour)
    },
    {
        "fragments":  ["steel (tmt bars)", "steel tmt", "tmt bar"],
        "material":   "Steel Frame",
        "raw_unit":   "per kg",
        "to_per_m2":  12 * 5.0,   # 12 kg/m² structural steel × 5 (full steel frame cost)
    },
]

# ─── Price range regex ─────────────────────────────────────────────────────────
_PRICE_RANGE_RE = re.compile(
    r"₹\s*([\d,]+)\s*(?:–|-|to|and)\s*(?:₹\s*)?([\d,]+)",
    re.IGNORECASE,
)

def _parse_num(s: str) -> float:
    return float(s.replace(",", "").strip())


def _extract_price_range(text: str) -> Optional[Tuple[float, float]]:
    """Extract the first ₹X–₹Y range from a string. Returns (lo, hi) or None."""
    m = _PRICE_RANGE_RE.search(text)
    if m:
        try:
            lo = _parse_num(m.group(1))
            hi = _parse_num(m.group(2))
            if 0 < lo < hi:
                return (lo, hi)
        except (ValueError, IndexError):
            pass
    return None


def _fetch_page_tables(url: str) -> List[List[List[str]]]:
    """
    Fetch a URL and return all tables as list-of-rows-of-cells (text only).
    """
    try:
        resp = requests.get(url, headers=REQUEST_HEADERS, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.content, "html.parser")
        result = []
        for table in soup.find_all("table"):
            rows = []
            for tr in table.find_all("tr"):
                cells = [td.get_text(strip=True) for td in tr.find_all(["td", "th"])]
                if cells:
                    rows.append(cells)
            if rows:
                result.append(rows)
        return result
    except Exception as exc:
        logger.warning(f"Failed to fetch/parse tables from {url}: {exc}")
        return []


def _scrape_all_sources() -> Dict[str, LivePrice]:
    """
    Scrape the main Houseyog price table and convert to ₹/m² wall costs.
    Returns only prices that pass the per-material bounds check.
    """
    url        = MAIN_SOURCE["url"]
    source_name = MAIN_SOURCE["name"]
    scraped_at  = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    results: Dict[str, LivePrice] = {}

    logger.info(f"Scraping price tables from {url}")
    all_tables = _fetch_page_tables(url)

    if not all_tables:
        logger.warning("No tables found — falling back to baselines entirely")
        return results

    # Build a flat look-up: lower(material_label) → (lo_raw, hi_raw)
    raw_lookup: Dict[str, Tuple[float, float]] = {}
    for table in all_tables:
        for row in table:
            if len(row) < 2:
                continue
            label = row[0].lower().strip()
            # Find first column that has a ₹ range
            for cell in row[1:]:
                price_range = _extract_price_range(cell)
                if price_range:
                    raw_lookup[label] = price_range
                    break

    logger.info(f"Raw price entries from table: {list(raw_lookup.keys())}")

    # Map to canonical material names using MATERIAL_MAP
    for entry in MATERIAL_MAP:
        mat        = entry["material"]
        multiplier = entry["to_per_m2"]

        raw = None
        for frag in entry["fragments"]:
            # Exact or partial match against scraped table labels
            for label, price_range in raw_lookup.items():
                if frag in label or label in frag:
                    raw = price_range
                    break
            if raw:
                break

        if not raw:
            logger.info(f"No scraped data found for {mat} — will use baseline")
            continue

        lo_raw, hi_raw = raw
        lo_m2 = round(lo_raw * multiplier, 0)
        hi_m2 = round(hi_raw * multiplier, 0)

        if hi_m2 < lo_m2:
            lo_m2, hi_m2 = hi_m2, lo_m2

        # Validate against bounds
        bounds = PRICE_BOUNDS_PER_M2.get(mat)
        if bounds:
            b_lo, b_hi = bounds
            if lo_m2 < b_lo or hi_m2 > b_hi:
                logger.warning(
                    f"Rejecting out-of-bounds price for {mat}: "
                    f"₹{lo_m2}–₹{hi_m2}/m² (valid: ₹{b_lo}–₹{b_hi}) — using baseline"
                )
                continue

        results[mat] = LivePrice(
            material=mat,
            unit="per m²",
            low=lo_m2,
            high=hi_m2,
            mid=round((lo_m2 + hi_m2) / 2, 0),
            source_name=source_name,
            source_url=url,
            scraped_at=scraped_at,
            is_live=True,
        )
        logger.info(
            f"✓ Scraped {mat}: ₹{lo_raw}–₹{hi_raw} raw "
            f"× {multiplier} → ₹{lo_m2}–₹{hi_m2}/m²"
        )

    return results


def _build_fallbacks(existing: Dict[str, LivePrice]) -> Dict[str, LivePrice]:
    """Fill missing materials with reliable 2025-26 baseline prices."""
    scraped_at = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    full = dict(existing)
    for mat, (lo, hi, unit) in BASELINE_PRICES.items():
        if mat not in full:
            full[mat] = LivePrice(
                material=mat, unit=unit,
                low=lo, high=hi, mid=round((lo + hi) / 2, 0),
                source_name="Baseline (2025-26 compiled)",
                source_url="",
                scraped_at=scraped_at,
                is_live=False,
            )
    return full


# ─── Singleton Cache Manager ───────────────────────────────────────────────────
class PriceCacheManager:
    """Thread-safe in-memory cache with background refresh."""

    def __init__(self):
        self._lock  = threading.Lock()
        self._cache = PriceCache()
        self._populate_baselines()

    def _populate_baselines(self):
        scraped_at = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
        baselines = {}
        for mat, (lo, hi, unit) in BASELINE_PRICES.items():
            baselines[mat] = LivePrice(
                material=mat, unit=unit,
                low=lo, high=hi, mid=round((lo + hi) / 2, 0),
                source_name="Baseline (2025-26 compiled)", source_url="",
                scraped_at=scraped_at, is_live=False,
            )
        with self._lock:
            self._cache.data = baselines
            self._cache.is_stale = True

    def _refresh(self):
        logger.info("PriceCacheManager: refreshing live prices...")
        try:
            live = _scrape_all_sources()
            full = _build_fallbacks(live)
            with self._lock:
                self._cache.data = full
                self._cache.fetched_at = time.time()
                self._cache.is_stale = False
            live_count = sum(1 for p in full.values() if p.is_live)
            logger.info(
                f"PriceCacheManager: done — {live_count}/{len(full)} prices live-scraped"
            )
        except Exception as exc:
            logger.error(f"PriceCacheManager: refresh error: {exc}", exc_info=True)
            with self._lock:
                self._cache.fetched_at = time.time() - CACHE_TTL_SECONDS + 30 * 60
                self._cache.is_stale = False

    def get_prices(self, force_refresh: bool = False) -> Dict[str, LivePrice]:
        with self._lock:
            stale = (
                self._cache.is_stale
                or force_refresh
                or (time.time() - self._cache.fetched_at) > CACHE_TTL_SECONDS
            )
        if stale:
            self._refresh()
        with self._lock:
            return dict(self._cache.data)

    def get_price_for_material(self, material_name: str) -> Optional[LivePrice]:
        prices = self.get_prices()
        if material_name in prices:
            return prices[material_name]
        name_lower = material_name.lower()
        for mat, price in prices.items():
            if mat.lower() in name_lower or name_lower in mat.lower():
                return price
        return None

    def get_price_range(self, material_name: str) -> Tuple[float, float]:
        p = self.get_price_for_material(material_name)
        if p:
            return (p.low, p.high)
        return (1000.0, 2000.0)


# ─── Global singleton ─────────────────────────────────────────────────────────
price_cache = PriceCacheManager()
