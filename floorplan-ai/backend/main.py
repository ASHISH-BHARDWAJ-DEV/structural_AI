from dotenv import load_dotenv
load_dotenv()  # MUST be first — loads .env before any service singletons are created

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import predict, health, materials
from app.routes import cost_breakdown
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Autonomous Structural Intelligence API",
    description=(
        "AI-powered floor plan analysis pipeline:\n"
        "• Phase 1+2: Floor Plan Parsing & Geometry (YOLOv8)\n"
        "• Phase 3: 3D Model Generation (frontend Three.js)\n"
        "• Phase 4: Material Analysis & Cost-Strength Tradeoff\n"
        "• Phase 5: Deep Explainability (Google Gemini — structured 4-section reports)\n"
        "• Bonus: Cost Breakdown Report with PDF export\n"
    ),
    version="3.0.0"
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
app.include_router(predict.router, prefix="/api", tags=["Phase 1-2: Detection"])
app.include_router(materials.router, prefix="/api", tags=["Phase 4-5: Materials & Explainability"])
app.include_router(cost_breakdown.router, prefix="/api", tags=["Cost Breakdown Report"])

@app.on_event("startup")
async def startup_event():
    logger.info("Autonomous Structural Intelligence API v3.0 starting up...")
    logger.info("Phase 1-2: YOLOv8 Detection ready")
    logger.info("Phase 4: Material Analyzer ready")
    logger.info("Phase 5: Gemini Deep Explainability engine ready (1200 tokens, 4-section)")
    logger.info("Bonus: Cost Breakdown Report engine ready — POST /api/cost-breakdown")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Autonomous Structural Intelligence API shutting down...")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

