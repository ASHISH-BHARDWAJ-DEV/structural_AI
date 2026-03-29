from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import predict, health
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Floor Plan AI Detection API",
    description="AI-powered floor plan analysis for detecting walls, doors, windows, and columns",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(predict.router, prefix="/api", tags=["Detection"])

@app.on_event("startup")
async def startup_event():
    logger.info("Floor Plan AI Detection API starting up...")
    logger.info("Loading YOLOv8 model...")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Floor Plan AI Detection API shutting down...")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
