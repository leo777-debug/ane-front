import os
import uuid
import logging
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException, BackgroundTasks, APIRouter, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from pydantic import BaseModel, Field
from models.store import store
from services.simulator import simulator
from services.asi_evolve import asi_evolve
from services.graph_rag import graph_rag

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── Rate limiter setup ────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address, default_limits=["10/minute"])

app = FastAPI(title="ANE.ai API")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── In-memory daily sim counter per IP ───────────────────────────────────────
from collections import defaultdict
from datetime import date

_sim_counts: Dict[str, Dict] = defaultdict(lambda: {"date": None, "count": 0})

def check_daily_limit(ip: str, max_per_day: int = 2) -> bool:
    """Returns True if allowed, False if limit exceeded."""
    today = str(date.today())
    record = _sim_counts[ip]
    if record["date"] != today:
        record["date"] = today
        record["count"] = 0
    if record["count"] >= max_per_day:
        return False
    record["count"] += 1
    return True


# ── Schemas ───────────────────────────────────────────────────────────────────

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
    agent_count: int = Field(default=20, ge=1, le=100)  # hard cap 100


# ── Router ────────────────────────────────────────────────────────────────────

router = APIRouter(prefix="/api")


@router.post("/simulate")
@limiter.limit("10/minute")
async def create_simulation(
    request: Request,
    body: SimulationRequest,
    background_tasks: BackgroundTasks,
):
    ip = get_remote_address(request)

    # Daily limit: 2 simulations per IP
    if not check_daily_limit(ip, max_per_day=2):
        raise HTTPException(
            status_code=429,
            detail="Daily limit reached. You can run 2 simulations per day on the demo. Come back tomorrow!"
        )

    # Hard cap agents at 100
    body.agent_count = min(body.agent_count, 100)

    sim_id = str(uuid.uuid4())
    store.create_simulation(sim_id, body.dict())
    background_tasks.add_task(run_simulation_task, sim_id, body)
    return {"id": sim_id, "status": "started"}


@router.get("/simulate/{sim_id}")
@limiter.limit("10/minute")
async def get_simulation(request: Request, sim_id: str):
    sim = store.get_simulation(sim_id)
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return sim


@router.get("/graph/query")
@limiter.limit("10/minute")
async def query_graph(request: Request, entities: str = ""):
    entity_list = [e.strip() for e in entities.split(",")]
    return {"context": graph_rag.query(entity_list)}


app.include_router(router)

@app.get("/")
@app.head("/")
async def root():
    return {"message": "ANE Backend is Live"}


@app.get("/health")
@app.head("/health")
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
            "analytics": analytics,
        })
        await asi_evolve.evolve_round(request.content.text, results)
    except Exception as e:
        logger.error(f"Simulation failed: {str(e)}")
        store.update_simulation(sim_id, {"status": "failed", "error": str(e)})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
