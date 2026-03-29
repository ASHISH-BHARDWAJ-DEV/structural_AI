# Structural AI: Floor Plan Analysis & 3D Visualization

A complete AI system that takes 2D floor plan images, detects structural architectural elements (walls, doors, windows, columns) using a YOLOv8 model, and automatically generates an interactive 3D Web visualization using React and Three.js.

## Architecture

The project is split into two main components:
*   **Backend (`/floorplan-ai/backend/`)**: A FastAPI Python service that runs a lightweight YOLO model to extract bounding boxes of architectural elements using `ultralytics` and `opencv-python`.
*   **Frontend (`/floorplan-ai/frontend/`)**: A Vite + React application styled with Tailwind CSS that provides a modern UI for uploading images, viewing AI pipeline detections, and an interactive `@react-three/fiber` driven 3D house viewer (dollhouse view).

## Getting Started

### 1. Prerequisites
- Python 3.10+
- Node.js 18+

### 2. Backend Setup
```bash
cd floorplan-ai/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```
> Note: Ensure you have placed your trained YOLOv8 model weights at `backend/weights/best.pt`.

### 3. Frontend Setup
```bash
cd floorplan-ai/frontend
npm install
npm run dev
```

### 4. Usage
Open `http://localhost:5173` in your browser. Upload an image, click **Analyze Floor Plan**, and then click **Proceed to 3D Visualization** to see your detected layout in interactive 3D!
