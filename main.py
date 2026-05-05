import os
import uuid
import logging
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException, BackgroundTasks, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from models.store import store
from services.simulator import simulator
from services.asi_evolve import asi_evolve
from services.graph_rag import graph_rag

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="ANE.ai API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Match frontend SimulationRequest structure
class ContentInput(BaseModel):
    title: str
    text: str
    type: str
    target_platform: str

class DemographicsInput(BaseModel):
    age_groups: List[str]
    genders: List[str]
    region: str
    mena_focus: bool
    platforms: List[str]

class SimulationRequest(BaseModel):
    content: ContentInput
    demographics: DemographicsInput
    agent_count: int

class SimulationResponse(BaseModel):
    id: str
    status: str

# Create router with /api prefix
router = APIRouter(prefix="/api")

@router.post("/simulate")
async def create_simulation(request: SimulationRequest, background_tasks: BackgroundTasks):
    sim_id = str(uuid.uuid4())
    store.create_simulation(sim_id, request.dict())
    background_tasks.add_task(run_simulation_task, sim_id, request)
    return {"id": sim_id, "status": "started"}

@router.get("/simulate/{sim_id}")
async def get_simulation(sim_id: str):
    sim = store.get_simulation(sim_id)
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return sim

@router.get("/graph/query")
async def query_graph(entities: str):
    entity_list = [e.strip() for e in entities.split(",")]
    return {"context": graph_rag.query(entity_list)}

# Include router in app
app.include_router(router)

@app.get("/")
async def root():
    return {"message": "ANE Backend is Live"}

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "ANE Backend"}

async def run_simulation_task(sim_id: str, request: SimulationRequest):
    try:
        entities = request.demographics.age_groups + request.demographics.platforms + [request.demographics.region]
        enriched_context = graph_rag.query(entities)
        results = await simulator.simulate(request.content.text, request.agent_count, enriched_context)
        analytics = simulator.compute_analytics(results)
        store.update_simulation(sim_id, {
            "status": "completed",
            "results": results,
            "analytics": analytics
        })
        await asi_evolve.evolve_round(request.content.text, results)
    except Exception as e:
        logger.error(f"Simulation failed: {str(e)}")
        store.update_simulation(sim_id, {"status": "failed", "error": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
