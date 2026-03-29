from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

# ─── Detection Schemas ───────────────────────────────────────────────────────

class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float

class DetectionResult(BaseModel):
    classname: str
    confidence: float
    bbox: BoundingBox
    color: str

class DetectionSummary(BaseModel):
    total_objects: int
    counts: Dict[str, int]
    image_width: int
    image_height: int

class DetectionResponse(BaseModel):
    success: bool
    message: str = ""
    summary: Optional[DetectionSummary] = None
    detections: List[DetectionResult] = []
    annotated_image_base64: Optional[str] = None
    detection_json: Optional[Dict] = None

# ─── Material Analysis Schemas ────────────────────────────────────────────────

class MaterialOption(BaseModel):
    name: str
    cost: str                        # "Low" | "Medium" | "High" | "Med-High"
    strength: str
    durability: str
    best_use: str
    score: float = Field(..., ge=0, le=100, description="Tradeoff score 0-100")
    cost_score: float
    strength_score: float
    durability_score: float
    is_recommended: bool = False

class StructuralConcern(BaseModel):
    severity: str                    # "warning" | "critical" | "info"
    message: str

class ElementAnalysis(BaseModel):
    element_id: str
    element_type: str                # "wall", "column", "door", etc.
    structural_role: str             # "load_bearing", "partition", "slab", "column", "opening"
    span_estimate_m: float           # estimated span from bbox width
    height_estimate_m: float         # estimated height from bbox height
    area_estimate_m2: float
    ranked_materials: List[MaterialOption]
    explanation: str                 # Gemini-generated plain-language explanation
    structural_concerns: List[StructuralConcern] = []

class StructuralSummary(BaseModel):
    total_elements: int
    load_bearing_count: int
    partition_count: int
    column_count: int
    opening_count: int
    max_span_m: float
    critical_concerns: int

class MaterialAnalysisRequest(BaseModel):
    detection_json: Dict[str, Any]
    scale_factor: float = 0.01       # pixels → meters conversion

class MaterialAnalysisResponse(BaseModel):
    success: bool
    message: str = ""
    element_analyses: List[ElementAnalysis] = []
    structural_summary: Optional[StructuralSummary] = None
    overall_explanation: str = ""

# ─── Cost Breakdown Report Schemas ────────────────────────────────────────────

class CostLineItem(BaseModel):
    element_id: str
    element_type: str
    structural_role: str
    recommended_material: str
    cost_tier: str                   # "Low" | "Medium" | "High" etc.
    area_m2: float
    unit_cost_low: float             # ₹ per m² — low estimate
    unit_cost_high: float            # ₹ per m² — high estimate
    total_cost_low: float            # ₹ total low
    total_cost_mid: float            # ₹ total mid
    total_cost_high: float           # ₹ total high
    notes: str = ""

class CostCategorySubtotal(BaseModel):
    category: str                    # "Load-Bearing Walls" etc.
    structural_role: str             # internal role key
    element_count: int
    total_area_m2: float
    subtotal_low: float
    subtotal_mid: float
    subtotal_high: float
    percentage_of_total: float = 0.0

class CostBreakdownReport(BaseModel):
    success: bool
    message: str = ""
    project_title: str = "Structural Cost Estimate"
    currency: str = "INR"
    line_items: List[CostLineItem] = []
    category_subtotals: List[CostCategorySubtotal] = []
    grand_total_low: float = 0.0
    grand_total_mid: float = 0.0
    grand_total_high: float = 0.0
    total_area_m2: float = 0.0
    total_elements: int = 0
    cost_per_sqm_mid: float = 0.0    # avg cost per m²
    generated_at: str = ""

class CostBreakdownRequest(BaseModel):
    element_analyses: List[ElementAnalysis]
    structural_summary: Optional[StructuralSummary] = None
    project_title: str = "Structural Cost Estimate"
