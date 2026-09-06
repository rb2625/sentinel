from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sentinel.config import get_settings
from routers import incidents, validate, alerts

settings = get_settings()

app = FastAPI(
    title="SENTINEL API",
    description="Real-Time Urban Incident Detection with Network Intelligence",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(incidents.router, prefix="/api/incidents", tags=["incidents"])
app.include_router(validate.router, prefix="/api/validate", tags=["validate"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["alerts"])


@app.get("/")
async def root():
    return {"service": "SENTINEL", "status": "running", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/api/stats")
async def get_stats():
    """Aggregate stats for dashboard."""
    from routers.incidents import _get_supabase
    db = _get_supabase()
    try:
        inc = db.table("incidents").select("id", count="exact").execute()
        val = db.table("validations").select("id", count="exact").execute()
        ale = db.table("sentinel_alerts").select("id", count="exact").execute()
        return {
            "total_incidents": inc.count or 0,
            "total_validations": val.count or 0,
            "total_alerts": ale.count or 0,
            "status": "ok",
        }
    except Exception as e:
        return {"total_incidents": 0, "total_validations": 0, "total_alerts": 0, "error": str(e)}
