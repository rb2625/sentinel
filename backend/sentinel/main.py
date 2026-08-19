from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import get_settings
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
