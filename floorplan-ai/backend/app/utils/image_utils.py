import cv2
import numpy as np
import base64

def encode_image_to_base64(image: np.ndarray) -> str:
    """Encode OpenCV image to base64 string."""
    _, buffer = cv2.imencode('.png', image)
    return base64.b64encode(buffer).decode('utf-8')

def decode_base64_to_image(base64_string: str) -> np.ndarray:
    """Decode base64 string to OpenCV image."""
    img_data = base64.b64decode(base64_string)
    np_arr = np.frombuffer(img_data, np.uint8)
    return cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
