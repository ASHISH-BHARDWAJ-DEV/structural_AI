from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from app.services.detector import FloorPlanDetector
from app.models.schemas import DetectionResponse, DetectionResult
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize detector (singleton)
detector = None

def get_detector():
    global detector
    if detector is None:
        detector = FloorPlanDetector()
    return detector

@router.post("/predict", response_model=DetectionResponse)
async def predict_floorplan(
    file: UploadFile = File(...),
    confidence: float = Form(0.25)
):
    """
    Analyze a floor plan image and detect architectural elements.
    
    - file: Floor plan image (PNG, JPG, JPEG)
    - confidence: Detection confidence threshold (0.0 - 1.0)
    """
    # Validate file type
    allowed_types = ["image/png", "image/jpeg", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {allowed_types}"
        )
    
    # Validate confidence threshold
    if not 0.0 <= confidence <= 1.0:
        raise HTTPException(
            status_code=400,
            detail="Confidence threshold must be between 0.0 and 1.0"
        )
    
    try:
        # Read image bytes
        image_bytes = await file.read()
        
        if len(image_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty file uploaded")
        
        # Get detector and run inference
        det = get_detector()
        result = det.detect(image_bytes, confidence)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Detection error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Detection failed: {str(e)}"
        )
