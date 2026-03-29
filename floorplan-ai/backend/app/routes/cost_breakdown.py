"""
Cost Breakdown Report API Route

POST /api/cost-breakdown
  - Accepts element_analyses from MaterialAnalysisResponse
  - Returns a full CostBreakdownReport with line-item costs and PDF-ready data
"""

from fastapi import APIRouter, HTTPException
from app.services.cost_breakdown import CostBreakdownEngine
from app.models.schemas import CostBreakdownRequest, CostBreakdownReport
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

_engine = CostBreakdownEngine()


@router.post("/cost-breakdown", response_model=CostBreakdownReport)
async def generate_cost_breakdown(request: CostBreakdownRequest):
    """
    Generate a line-item material cost breakdown report.

    - **element_analyses**: List of ElementAnalysis objects from /api/materials
    - **project_title**: Optional custom title for the report (default: 'Structural Cost Estimate')

    Returns a full CostBreakdownReport with:
    - Line items per element (area, unit cost, totals)
    - Category subtotals (load-bearing, partitions, columns, etc.)
    - Grand total with Low / Mid / High scenario ranges (₹)
    """
    try:
        if not request.element_analyses:
            raise HTTPException(
                status_code=400,
                detail="No element analyses provided. Please complete material analysis first.",
            )

        logger.info(
            f"Generating cost breakdown for {len(request.element_analyses)} elements. "
            f"Project: '{request.project_title}'"
        )

        report = _engine.generate_report(
            element_analyses=request.element_analyses,
            structural_summary=request.structural_summary,
            project_title=request.project_title,
        )

        logger.info(
            f"Cost breakdown complete. Grand total mid: ₹{report.grand_total_mid:,.0f}, "
            f"Total area: {report.total_area_m2}m²"
        )
        return report

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Cost breakdown error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Cost breakdown generation failed: {str(e)}"
        )
