"""
Materials Analysis API Route (Phase 4 + 5)

POST /api/materials
  - Accepts detection JSON from Phase 1/2
  - Runs material tradeoff analysis (Phase 4)
  - Enriches with Gemini explanations (Phase 5)
  - Returns full MaterialAnalysisResponse
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from app.services.material_analyzer import MaterialAnalyzer
from app.services.explainer import ExplainabilityEngine
from app.models.schemas import MaterialAnalysisRequest, MaterialAnalysisResponse
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Singletons — initialize once at import time
_analyzer  = MaterialAnalyzer()
_explainer = ExplainabilityEngine()


@router.post("/materials", response_model=MaterialAnalysisResponse)
async def analyze_materials(request: MaterialAnalysisRequest):
    """
    Analyze detected floor plan elements for material recommendations.

    - **detection_json**: The `detection_json` field from the /api/predict response
    - **scale_factor**: Pixels-to-meters conversion factor (default 0.01 → 100px = 1m)

    Returns ranked materials per element with Gemini-generated explanations.
    """
    try:
        detection_json = request.detection_json
        scale_factor   = request.scale_factor

        elements = detection_json.get("elements", [])
        if not elements:
            return MaterialAnalysisResponse(
                success=False,
                message="No elements found in detection JSON. Please run floor plan detection first.",
            )

        logger.info(f"Analyzing {len(elements)} elements with scale_factor={scale_factor}")

        # Phase 4: tradeoff scoring
        analyses, summary = _analyzer.analyze_all(detection_json, scale_factor)
        logger.info(f"Material analysis complete. Max span: {summary.max_span_m}m, "
                    f"Critical concerns: {summary.critical_concerns}")

        # Phase 5: Gemini explanations
        enriched_analyses, overall_explanation = _explainer.enrich_analyses(analyses, summary)
        logger.info("Explainability enrichment complete.")

        return MaterialAnalysisResponse(
            success=True,
            message=f"Analyzed {len(enriched_analyses)} structural elements successfully.",
            element_analyses=enriched_analyses,
            structural_summary=summary,
            overall_explanation=overall_explanation,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Material analysis error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Material analysis failed: {str(e)}"
        )
