from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import json
import time

from supabase import create_client
from sentinel.config import get_settings
from agents.pipeline import pipeline

router = APIRouter()


def _get_supabase():
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


class IncidentCreate(BaseModel):
    reporter_phone: str
    reporter_name: Optional[str] = None
    description: str
    latitude: float
    longitude: float
    location_name: Optional[str] = None
    language: str = "en"
    source: str = "app"


@router.post("/report")
async def submit_report(report: IncidentCreate):
    """Submit incident. Runs full 3-agent pipeline + CAMARA validation."""
    t0 = time.time()
    db = _get_supabase()

    # Run the 3-agent pipeline
    result = pipeline.process({
        "phone": report.reporter_phone,
        "description": report.description,
        "lat": report.latitude,
        "lon": report.longitude,
        "language": report.language,
        "source": report.source,
        "location_name": report.location_name or "",
    })

    classification = result.get("classification", {})
    validation = result.get("validation", {})

    # Store incident
    inc_data = {
        "reporter_phone": report.reporter_phone,
        "reporter_name": report.reporter_name,
        "incident_type": classification.get("incident_type", "other"),
        "description": report.description,
        "latitude": report.latitude,
        "longitude": report.longitude,
        "location_name": report.location_name,
        "language": report.language,
        "source": report.source,
    }
    inc_resp = db.table("incidents").insert(inc_data).execute()
    incident_id = inc_resp.data[0]["id"] if inc_resp.data else None

    # Store validation
    if incident_id:
        val_results = validation.get("results", {})
        db.table("validations").insert({
            "incident_id": incident_id,
            "location_verified": val_results.get("location", {}).get("verified", False),
            "device_active": val_results.get("device", {}).get("reachable", False),
            "overall_score": validation.get("trust_score", 0),
            "validation_details": json.dumps(val_results, default=str),
        }).execute()

        # Store classification
        db.table("sentinel_classifications").insert({
            "incident_id": incident_id,
            "incident_type": classification.get("incident_type", "other"),
            "severity": classification.get("severity", "medium"),
            "sector": classification.get("sector", "general"),
            "confidence": classification.get("confidence", 0),
            "summary": classification.get("summary", ""),
            "reasoning": classification.get("reasoning", ""),
        }).execute()

        # Auto-alert if severity is high or critical
        severity = classification.get("severity", "medium")
        if severity in ("high", "critical"):
            db.table("sentinel_alerts").insert({
                "incident_id": incident_id,
                "severity": severity,
                "sector": classification.get("sector", "general"),
                "summary": classification.get("summary", report.description[:100]),
                "dispatch_channel": "dashboard",
            }).execute()

    elapsed = round(time.time() - t0, 2)

    return {
        "status": "processed",
        "incident_id": incident_id,
        "trust_score": validation.get("trust_score", 0),
        "classification": classification,
        "validation": {
            "checks_run": validation.get("checks_run", 0),
            "reasoning": validation.get("reasoning", ""),
            "results": validation.get("results", {}),
        },
        "anomaly": result.get("anomaly", {}),
        "processing_time_seconds": elapsed,
    }


@router.get("/list")
async def list_incidents(limit: int = 50, offset: int = 0):
    """List incidents with classification and validation data."""
    db = _get_supabase()
    try:
        inc_resp = db.table("incidents").select("*").order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        incidents = inc_resp.data or []
        count_resp = db.table("incidents").select("id", count="exact").execute()
        return {"incidents": incidents, "total": count_resp.count or 0}
    except Exception as e:
        return {"incidents": [], "total": 0, "error": str(e)}


@router.get("/{incident_id}")
async def get_incident(incident_id: int):
    """Get single incident with validation and classification."""
    db = _get_supabase()
    try:
        inc = db.table("incidents").select("*").eq("id", incident_id).execute()
        if not inc.data:
            raise HTTPException(status_code=404, detail="Incident not found")
        val = db.table("validations").select("*").eq("incident_id", incident_id).execute()
        cls = db.table("sentinel_classifications").select("*").eq("incident_id", incident_id).execute()
        return {
            "incident": inc.data[0],
            "validation": val.data[0] if val.data else None,
            "classification": cls.data[0] if cls.data else None,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))