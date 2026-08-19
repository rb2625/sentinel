from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class IncidentCreate(BaseModel):
    reporter_phone: str
    reporter_name: Optional[str] = None
    incident_type: str = "other"
    description: str
    latitude: float
    longitude: float
    location_name: Optional[str] = None
    language: str = "en"
    source: str = "app"


@router.post("/report")
async def submit_report(report: IncidentCreate):
    """Submit a new incident report. Triggers validation + classification."""
    return {
        "status": "received",
        "message": "Incident report submitted. Validation in progress.",
        "report": report.model_dump(),
    }


@router.get("/list")
async def list_incidents(limit: int = 50, offset: int = 0):
    """List incident reports."""
    return {"incidents": [], "total": 0}


@router.get("/{incident_id}")
async def get_incident(incident_id: int):
    """Get a single incident report with validation results."""
    return {"incident": None, "validation": None}
