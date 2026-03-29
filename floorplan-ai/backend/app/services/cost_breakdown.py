"""
Cost Breakdown Report Service

Generates a line-item material cost estimate for the full structure based on
MaterialAnalysis results. Uses price ranges per m² for each material type.

Cost tiers (₹ per m²):
  AAC Blocks               ₹800  – ₹1,200
  Red Brick                ₹1,000 – ₹1,500
  RCC                      ₹2,000 – ₹3,000
  Steel Frame              ₹3,500 – ₹5,500
  Hollow Concrete Block    ₹700  – ₹1,000
  Fly Ash Brick            ₹850  – ₹1,200
  Precast Concrete Panel   ₹1,800 – ₹2,800
"""

import logging
from datetime import datetime, timezone
from typing import List, Dict, Tuple
from app.models.schemas import (
    ElementAnalysis,
    StructuralSummary,
    CostLineItem,
    CostCategorySubtotal,
    CostBreakdownReport,
)

logger = logging.getLogger(__name__)

# ─── Material Price Database (₹ per m²) ──────────────────────────────────────

MATERIAL_PRICES: Dict[str, Tuple[float, float]] = {
    "AAC Blocks":             (800,   1200),
    "Red Brick":              (1000,  1500),
    "RCC":                    (2000,  3000),
    "Steel Frame":            (3500,  5500),
    "Hollow Concrete Block":  (700,   1000),
    "Fly Ash Brick":          (850,   1200),
    "Precast Concrete Panel": (1800,  2800),
    # Fallback for unknown materials
    "default":                (1000,  2000),
}

# ─── Category Labels ──────────────────────────────────────────────────────────

ROLE_CATEGORY_LABELS: Dict[str, str] = {
    "load_bearing": "Load-Bearing Walls",
    "partition":    "Partition Walls",
    "column":       "Columns & Pillars",
    "slab":         "Slabs & Beams",
    "opening":      "Doors & Windows (Frames)",
    "unknown":      "Other Elements",
}

# Small minimum area for openings (frames) to avoid zero costs
MINIMUM_AREA_BY_ROLE: Dict[str, float] = {
    "opening": 2.0,   # door/window frame minimum 2m²
    "column":  1.5,   # column minimum 1.5m²
}


def _get_price(material_name: str) -> Tuple[float, float]:
    """Look up low/high price per m² for a material."""
    # Try exact match first, then partial match
    if material_name in MATERIAL_PRICES:
        return MATERIAL_PRICES[material_name]
    for key in MATERIAL_PRICES:
        if key.lower() in material_name.lower() or material_name.lower() in key.lower():
            return MATERIAL_PRICES[key]
    return MATERIAL_PRICES["default"]


def _get_element_notes(analysis: ElementAnalysis, material_name: str) -> str:
    """Generate a short notes string for a line item."""
    notes_parts = []
    if analysis.structural_concerns:
        worst = max(
            analysis.structural_concerns,
            key=lambda c: {"critical": 2, "warning": 1, "info": 0}.get(c.severity, 0),
        )
        notes_parts.append(f"⚠ {worst.severity.upper()}: {worst.message[:60]}...")
    if analysis.span_estimate_m > 5.0:
        notes_parts.append(f"Long span ({analysis.span_estimate_m}m)")
    return " | ".join(notes_parts) if notes_parts else ""


class CostBreakdownEngine:
    """Generates a full line-item cost breakdown from material analysis results."""

    def generate_report(
        self,
        element_analyses: List[ElementAnalysis],
        structural_summary: StructuralSummary | None = None,
        project_title: str = "Structural Cost Estimate",
    ) -> CostBreakdownReport:
        """
        Produce a CostBreakdownReport from enriched element analyses.
        """
        if not element_analyses:
            return CostBreakdownReport(
                success=False,
                message="No element analyses provided. Please run material analysis first.",
                project_title=project_title,
            )

        line_items: List[CostLineItem] = []
        category_buckets: Dict[str, List[CostLineItem]] = {}

        for analysis in element_analyses:
            # Pick recommended (top-ranked) material
            if not analysis.ranked_materials:
                continue
            top_mat = analysis.ranked_materials[0]
            material_name = top_mat.name

            # Look up price
            price_low, price_high = _get_price(material_name)
            price_mid = (price_low + price_high) / 2

            # Area — use estimated area; apply minimum for small elements
            min_area = MINIMUM_AREA_BY_ROLE.get(analysis.structural_role, 0.5)
            area = max(analysis.area_estimate_m2, min_area)

            # Totals
            total_low  = round(area * price_low,  2)
            total_mid  = round(area * price_mid,  2)
            total_high = round(area * price_high, 2)

            notes = _get_element_notes(analysis, material_name)

            item = CostLineItem(
                element_id=analysis.element_id,
                element_type=analysis.element_type,
                structural_role=analysis.structural_role,
                recommended_material=material_name,
                cost_tier=top_mat.cost,
                area_m2=round(area, 2),
                unit_cost_low=price_low,
                unit_cost_high=price_high,
                total_cost_low=total_low,
                total_cost_mid=total_mid,
                total_cost_high=total_high,
                notes=notes,
            )
            line_items.append(item)

            # Bucket by category
            role = analysis.structural_role
            category_buckets.setdefault(role, []).append(item)

        # Build category subtotals
        grand_low = grand_mid = grand_high = 0.0
        category_subtotals: List[CostCategorySubtotal] = []

        for role, items in category_buckets.items():
            sub_low  = round(sum(i.total_cost_low  for i in items), 2)
            sub_mid  = round(sum(i.total_cost_mid  for i in items), 2)
            sub_high = round(sum(i.total_cost_high for i in items), 2)
            total_area = round(sum(i.area_m2 for i in items), 2)

            grand_low  += sub_low
            grand_mid  += sub_mid
            grand_high += sub_high

            category_subtotals.append(CostCategorySubtotal(
                category=ROLE_CATEGORY_LABELS.get(role, role.replace("_", " ").title()),
                structural_role=role,
                element_count=len(items),
                total_area_m2=total_area,
                subtotal_low=sub_low,
                subtotal_mid=sub_mid,
                subtotal_high=sub_high,
            ))

        # Compute percentage of grand total (mid) for each category
        if grand_mid > 0:
            for cat in category_subtotals:
                cat.percentage_of_total = round(cat.subtotal_mid / grand_mid * 100, 1)

        # Sort category subtotals by subtotal_mid descending
        category_subtotals.sort(key=lambda c: c.subtotal_mid, reverse=True)

        # Totals
        total_area = round(sum(i.area_m2 for i in line_items), 2)
        cost_per_sqm_mid = round(grand_mid / total_area, 2) if total_area > 0 else 0.0

        return CostBreakdownReport(
            success=True,
            message=f"Cost breakdown generated for {len(line_items)} structural elements.",
            project_title=project_title,
            currency="INR",
            line_items=line_items,
            category_subtotals=category_subtotals,
            grand_total_low=round(grand_low, 2),
            grand_total_mid=round(grand_mid, 2),
            grand_total_high=round(grand_high, 2),
            total_area_m2=total_area,
            total_elements=len(line_items),
            cost_per_sqm_mid=cost_per_sqm_mid,
            generated_at=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        )
