"""
Material Analysis & Cost-Strength Tradeoff Engine (Phase 4)

Implements:
  - Full starter material database (7 materials from problem statement)
  - Element role classifier (YOLO class → structural role)
  - Span/area estimation from bounding box
  - Weighted tradeoff scoring formula (weights differ per structural role)
  - Top-N material ranker per element
"""

import logging
from typing import List, Dict, Any, Tuple
from app.models.schemas import MaterialOption, ElementAnalysis, StructuralConcern, StructuralSummary

logger = logging.getLogger(__name__)

# ─── Starter Material Database ────────────────────────────────────────────────
# Extended from problem statement with numeric values for scoring

MATERIAL_DATABASE = {
    "AAC Blocks": {
        "cost": "Low",
        "strength": "Medium",
        "durability": "High",
        "best_use": "Partition walls",
        "cost_val": 1,       # 1=Low, 2=Medium, 3=High
        "strength_val": 2,
        "durability_val": 3,
    },
    "Red Brick": {
        "cost": "Medium",
        "strength": "High",
        "durability": "Medium",
        "best_use": "Load-bearing walls",
        "cost_val": 2,
        "strength_val": 3,
        "durability_val": 2,
    },
    "RCC": {
        "cost": "High",
        "strength": "Very High",
        "durability": "Very High",
        "best_use": "Columns, slabs",
        "cost_val": 3,
        "strength_val": 4,
        "durability_val": 4,
    },
    "Steel Frame": {
        "cost": "High",
        "strength": "Very High",
        "durability": "Very High",
        "best_use": "Long spans (>5m)",
        "cost_val": 3,
        "strength_val": 4,
        "durability_val": 4,
    },
    "Hollow Concrete Block": {
        "cost": "Low-Med",
        "strength": "Medium",
        "durability": "Medium",
        "best_use": "Non-structural walls",
        "cost_val": 1.5,
        "strength_val": 2,
        "durability_val": 2,
    },
    "Fly Ash Brick": {
        "cost": "Low",
        "strength": "Medium-High",
        "durability": "High",
        "best_use": "General walling",
        "cost_val": 1,
        "strength_val": 2.5,
        "durability_val": 3,
    },
    "Precast Concrete Panel": {
        "cost": "Med-High",
        "strength": "High",
        "durability": "Very High",
        "best_use": "Structural walls, slabs",
        "cost_val": 2.5,
        "strength_val": 3,
        "durability_val": 4,
    },
}

# Max numeric value for normalization
_MAX_VAL = 4.0

# ─── Role Normalization ───────────────────────────────────────────────────────

def _normalize(val: float) -> float:
    return val / _MAX_VAL

# Scoring weights per structural role
# Higher strength weight for load-bearing; higher cost weight for partitions
ROLE_WEIGHTS = {
    "load_bearing": {"cost": 0.20, "strength": 0.50, "durability": 0.30},
    "partition":    {"cost": 0.45, "strength": 0.20, "durability": 0.35},
    "slab":         {"cost": 0.20, "strength": 0.45, "durability": 0.35},
    "column":       {"cost": 0.15, "strength": 0.55, "durability": 0.30},
    "opening":      {"cost": 0.50, "strength": 0.25, "durability": 0.25},
    "unknown":      {"cost": 0.33, "strength": 0.33, "durability": 0.34},
}

# ─── Element Role Classifier ──────────────────────────────────────────────────

YOLO_TO_ROLE: Dict[str, str] = {
    # Load bearing
    "wall":         "load_bearing",
    "load_bearing_wall": "load_bearing",
    "load-bearing": "load_bearing",
    "exterior_wall": "load_bearing",
    # Partitions
    "partition":    "partition",
    "partition_wall": "partition",
    "interior_wall": "partition",
    # Structural elements
    "column":       "column",
    "pillar":       "column",
    "beam":         "slab",
    "slab":         "slab",
    "floor":        "slab",
    "ceiling":      "slab",
    "stair":        "slab",
    "stairs":       "slab",
    # Openings
    "door":         "opening",
    "window":       "opening",
    "opening":      "opening",
    # Misc
    "room":         "unknown",
    "furniture":    "unknown",
}

def classify_element_role(classname: str) -> str:
    """Map a YOLO classname to a structural role."""
    lower = classname.lower().strip()
    
    # Direct lookup
    if lower in YOLO_TO_ROLE:
        return YOLO_TO_ROLE[lower]
    
    # Fuzzy keyword match
    for key, role in YOLO_TO_ROLE.items():
        if key in lower or lower in key:
            return role
    
    # Heuristic — anything with "wall" is load_bearing by default
    if "wall" in lower:
        return "load_bearing"
    if "col" in lower or "pillar" in lower:
        return "column"
    if "door" in lower or "window" in lower or "opening" in lower:
        return "opening"
    
    return "unknown"

# ─── Span & Area Estimation ───────────────────────────────────────────────────

PIXELS_PER_METER = 100  # default: assume 100px ≈ 1m if no scale given

def estimate_geometry(
    bounds: Dict[str, float],
    scale_factor: float = 0.01,
) -> Tuple[float, float, float]:
    """
    Estimate span, height, and area in meters from bounding box pixel coords.
    
    scale_factor: pixels → meters (default 0.01 = 100px per meter)
    Returns: (span_m, height_m, area_m2)
    """
    width_px  = bounds.get("width",  bounds.get("x2", 0) - bounds.get("x1", 0))
    height_px = bounds.get("height", bounds.get("y2", 0) - bounds.get("y1", 0))
    
    span_m   = round(max(width_px, height_px) * scale_factor, 2)
    height_m = round(min(width_px, height_px) * scale_factor, 2)
    area_m2  = round(span_m * height_m, 2)
    
    return span_m, height_m, area_m2

# ─── Tradeoff Scorer ─────────────────────────────────────────────────────────

def score_material(
    material: Dict,
    role: str,
    span_m: float,
) -> Tuple[float, float, float, float]:
    """
    Compute a weighted tradeoff score (0–100) for a material given a structural role.
    
    Score = cost_w*(1-cost_norm) + strength_w*strength_norm + durability_w*durability_norm
    
    For long spans (>5m), strength weight is boosted by +0.10.
    
    Returns: (total_score, cost_score, strength_score, durability_score)
    """
    weights = dict(ROLE_WEIGHTS.get(role, ROLE_WEIGHTS["unknown"]))
    
    # Boost strength for long spans
    if span_m > 5.0:
        extra = 0.10
        weights["strength"] = min(weights["strength"] + extra, 1.0)
        weights["cost"]     = max(weights["cost"] - extra / 2, 0.05)
        weights["durability"] = max(weights["durability"] - extra / 2, 0.05)
    
    cost_norm     = _normalize(material["cost_val"])
    strength_norm = _normalize(material["strength_val"])
    dur_norm      = _normalize(material["durability_val"])
    
    # Cost: we want LOW cost to score HIGH → invert
    cost_score     = round((1 - cost_norm) * weights["cost"] * 100, 1)
    strength_score = round(strength_norm   * weights["strength"] * 100, 1)
    dur_score      = round(dur_norm        * weights["durability"] * 100, 1)
    total          = round(cost_score + strength_score + dur_score, 1)
    
    return total, cost_score, strength_score, dur_score

# ─── Structural Concern Detector ─────────────────────────────────────────────

def detect_concerns(
    role: str,
    span_m: float,
    element_type: str,
) -> List[StructuralConcern]:
    """Generate structural concern flags based on geometry and role."""
    concerns: List[StructuralConcern] = []
    
    if span_m > 7.0:
        concerns.append(StructuralConcern(
            severity="critical",
            message=f"Very large unsupported span ({span_m:.1f}m). Steel Frame or RCC strongly recommended."
        ))
    elif span_m > 5.0:
        concerns.append(StructuralConcern(
            severity="warning",
            message=f"Large span detected ({span_m:.1f}m). Consider Steel Frame or Precast Concrete Panel for structural safety."
        ))
    
    if role == "load_bearing" and span_m > 4.0:
        concerns.append(StructuralConcern(
            severity="warning",
            message=f"Load-bearing wall with span {span_m:.1f}m — intermediate column support may be required."
        ))
    
    if role == "column" and span_m > 3.0:
        concerns.append(StructuralConcern(
            severity="info",
            message=f"Column element with large cross-section ({span_m:.1f}m). Verify alignment with load path."
        ))
    
    if role == "opening" and span_m > 2.5:
        concerns.append(StructuralConcern(
            severity="warning",
            message=f"Large opening ({span_m:.1f}m wide). Lintel or arch support required above this {element_type}."
        ))
    
    return concerns

# ─── Main Analyzer ────────────────────────────────────────────────────────────

class MaterialAnalyzer:
    """Orchestrates material analysis for all detected elements."""
    
    def analyze_element(
        self,
        element: Dict[str, Any],
        element_id: str,
        scale_factor: float = 0.01,
        top_n: int = 3,
    ) -> ElementAnalysis:
        """Analyze a single detected element and rank materials."""
        element_type = element.get("type", "unknown")
        bounds       = element.get("bounds", {})
        
        role                       = classify_element_role(element_type)
        span_m, height_m, area_m2 = estimate_geometry(bounds, scale_factor)
        concerns                   = detect_concerns(role, span_m, element_type)
        
        # Score all materials
        scored: List[Tuple[str, float, float, float, float]] = []
        for mat_name, mat_data in MATERIAL_DATABASE.items():
            total, c_s, s_s, d_s = score_material(mat_data, role, span_m)
            scored.append((mat_name, total, c_s, s_s, d_s))
        
        # Sort descending by total score
        scored.sort(key=lambda x: x[1], reverse=True)
        
        # Build MaterialOption list (top N)
        ranked: List[MaterialOption] = []
        for idx, (name, total, c_s, s_s, d_s) in enumerate(scored[:top_n]):
            mat = MATERIAL_DATABASE[name]
            ranked.append(MaterialOption(
                name=name,
                cost=mat["cost"],
                strength=mat["strength"],
                durability=mat["durability"],
                best_use=mat["best_use"],
                score=total,
                cost_score=c_s,
                strength_score=s_s,
                durability_score=d_s,
                is_recommended=(idx == 0),
            ))
        
        return ElementAnalysis(
            element_id=element_id,
            element_type=element_type,
            structural_role=role,
            span_estimate_m=span_m,
            height_estimate_m=height_m,
            area_estimate_m2=area_m2,
            ranked_materials=ranked,
            explanation="",          # filled by ExplainabilityEngine
            structural_concerns=concerns,
        )
    
    def analyze_all(
        self,
        detection_json: Dict[str, Any],
        scale_factor: float = 0.01,
    ) -> Tuple[List[ElementAnalysis], StructuralSummary]:
        """Analyze all elements and produce a structural summary."""
        elements = detection_json.get("elements", [])
        
        analyses: List[ElementAnalysis] = []
        load_bearing_count = 0
        partition_count    = 0
        column_count       = 0
        opening_count      = 0
        max_span           = 0.0
        critical_concerns  = 0
        
        for idx, elem in enumerate(elements):
            analysis = self.analyze_element(
                element=elem,
                element_id=f"elem_{idx}",
                scale_factor=scale_factor,
            )
            analyses.append(analysis)
            
            # Tally
            role = analysis.structural_role
            if role == "load_bearing": load_bearing_count += 1
            elif role == "partition":  partition_count    += 1
            elif role == "column":     column_count       += 1
            elif role == "opening":    opening_count      += 1
            
            if analysis.span_estimate_m > max_span:
                max_span = analysis.span_estimate_m
            
            for c in analysis.structural_concerns:
                if c.severity == "critical":
                    critical_concerns += 1
        
        summary = StructuralSummary(
            total_elements=len(analyses),
            load_bearing_count=load_bearing_count,
            partition_count=partition_count,
            column_count=column_count,
            opening_count=opening_count,
            max_span_m=round(max_span, 2),
            critical_concerns=critical_concerns,
        )
        
        return analyses, summary
