from pydantic import BaseModel, Field
from typing import List, Dict, Optional

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
