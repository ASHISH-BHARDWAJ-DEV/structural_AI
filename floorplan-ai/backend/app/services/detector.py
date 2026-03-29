import cv2
import numpy as np
from ultralytics import YOLO
import base64
from pathlib import Path
import logging
from app.models.schemas import (
    DetectionResponse, 
    DetectionResult, 
    DetectionSummary, 
    BoundingBox
)

logger = logging.getLogger(__name__)

class FloorPlanDetector:
    # Class colors for visualization
    CLASS_COLORS = {
        "door": "#22c55e",      # Green
        "window": "#3b82f6",    # Blue
        "wall": "#ef4444",      # Red
        "column": "#f59e0b",    # Amber
        "room": "#8b5cf6",      # Purple
        "stairs": "#ec4899",    # Pink
        "furniture": "#06b6d4", # Cyan
    }
    
    DEFAULT_COLOR = "#6b7280"  # Gray
    
    def __init__(self, model_path: str = None):
        """Initialize the floor plan detector with YOLOv8 model."""
        if model_path is None:
            # Look for model in multiple locations
            possible_paths = [
                Path("weights/best.pt"),
                Path("backend/weights/best.pt"),
                Path("app/weights/best.pt"),
                Path("../weights/best.pt"),
            ]
            
            model_path = None
            for path in possible_paths:
                if path.exists():
                    model_path = str(path)
                    break
            
            if model_path is None:
                # Use a pretrained YOLOv8 model as fallback
                logger.warning("Custom weights not found. Using pretrained YOLOv8n for demo.")
                model_path = "yolov8n.pt"
        
        logger.info(f"Loading model from: {model_path}")
        self.model = YOLO(model_path)
        
        # Get class names from model
        self.class_names = self.model.names
        logger.info(f"Model loaded. Classes: {self.class_names}")
    
    def get_color_for_class(self, class_name: str) -> str:
        """Get consistent color for a class."""
        class_lower = class_name.lower()
        for key, color in self.CLASS_COLORS.items():
            if key in class_lower:
                return color
        return self.DEFAULT_COLOR
    
    def hex_to_bgr(self, hex_color: str) -> tuple:
        """Convert hex color to BGR tuple for OpenCV."""
        hex_color = hex_color.lstrip('#')
        rgb = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
        return (rgb[2], rgb[1], rgb[0])
    
    def detect(self, image_bytes: bytes, confidence_threshold: float = 0.25) -> DetectionResponse:
        """
        Run detection on image bytes and return structured results.
        """
        try:
            # Decode image
            np_arr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            
            if image is None:
                return DetectionResponse(
                    success=False,
                    message="Failed to decode image"
                )
            
            img_height, img_width = image.shape[:2]
            
            # Run inference
            results = self.model.predict(
                source=image,
                conf=confidence_threshold,
                verbose=False
            )
            
            # Process results
            detections = []
            class_counts = {}
            
            # Create annotated image
            annotated_image = image.copy()
            
            for result in results:
                boxes = result.boxes
                
                if boxes is not None:
                    for box in boxes:
                        # Get box coordinates
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                        conf = float(box.conf[0].cpu().numpy())
                        cls_id = int(box.cls[0].cpu().numpy())
                        
                        # Get class name
                        class_name = self.class_names.get(cls_id, f"class_{cls_id}")
                        
                        # Update counts
                        class_counts[class_name] = class_counts.get(class_name, 0) + 1
                        
                        # Get color
                        color = self.get_color_for_class(class_name)
                        bgr_color = self.hex_to_bgr(color)
                        
                        # Add to detections
                        detections.append(DetectionResult(
                            classname=class_name,
                            confidence=round(conf, 3),
                            bbox=BoundingBox(
                                x1=round(float(x1), 2),
                                y1=round(float(y1), 2),
                                x2=round(float(x2), 2),
                                y2=round(float(y2), 2)
                            ),
                            color=color
                        ))
                        
                        # Draw on annotated image
                        cv2.rectangle(
                            annotated_image,
                            (int(x1), int(y1)),
                            (int(x2), int(y2)),
                            bgr_color,
                            2
                        )
                        
                        # Add label
                        label = f"{class_name}: {conf:.2f}"
                        label_size, _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2)
                        
                        # Label background
                        cv2.rectangle(
                            annotated_image,
                            (int(x1), int(y1) - label_size[1] - 10),
                            (int(x1) + label_size[0], int(y1)),
                            bgr_color,
                            -1
                        )
                        
                        # Label text
                        cv2.putText(
                            annotated_image,
                            label,
                            (int(x1), int(y1) - 5),
                            cv2.FONT_HERSHEY_SIMPLEX,
                            0.5,
                            (255, 255, 255),
                            2
                        )
            
            # Encode annotated image to base64
            _, buffer = cv2.imencode('.png', annotated_image)
            annotated_base64 = base64.b64encode(buffer).decode('utf-8')
            
            # Create JSON export format
            detection_json = {
                "image_dimensions": {
                    "width": img_width,
                    "height": img_height
                },
                "elements": [
                    {
                        "type": d.classname,
                        "confidence": d.confidence,
                        "bounds": {
                            "x1": d.bbox.x1,
                            "y1": d.bbox.y1,
                            "x2": d.bbox.x2,
                            "y2": d.bbox.y2,
                            "width": d.bbox.x2 - d.bbox.x1,
                            "height": d.bbox.y2 - d.bbox.y1,
                            "center_x": (d.bbox.x1 + d.bbox.x2) / 2,
                            "center_y": (d.bbox.y1 + d.bbox.y2) / 2
                        }
                    }
                    for d in detections
                ]
            }
            
            # Create summary
            summary = DetectionSummary(
                total_objects=len(detections),
                counts=class_counts,
                image_width=img_width,
                image_height=img_height
            )
            
            return DetectionResponse(
                success=True,
                message=f"Detected {len(detections)} objects",
                summary=summary,
                detections=detections,
                annotated_image_base64=annotated_base64,
                detection_json=detection_json
            )
            
        except Exception as e:
            logger.error(f"Detection error: {str(e)}")
            return DetectionResponse(
                success=False,
                message=f"Detection failed: {str(e)}"
            )
