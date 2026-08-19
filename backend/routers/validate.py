from fastapi import APIRouter
from pydantic import BaseModel
from ..sentinel.camara_client import CamaraClient

router = APIRouter()


class ValidateRequest(BaseModel):
    phone_number: str
    latitude: float
    longitude: float


@router.post("/")
async def validate_report(req: ValidateRequest):
    """Validate an incident report using CAMARA APIs."""
    client = CamaraClient()
    result = await client.validate_report(
        phone_number=req.phone_number,
        incident_lat=req.latitude,
        incident_lon=req.longitude,
    )
    return result


@router.post("/location")
async def verify_location(req: ValidateRequest):
    """Verify reporter location only."""
    client = CamaraClient()
    return await client.verify_location(
        phone_number=req.phone_number,
        target_lat=req.latitude,
        target_lon=req.longitude,
    )


@router.post("/number")
async def verify_number(phone_number: str):
    """Verify phone number only."""
    client = CamaraClient()
    return await client.verify_number(phone_number)
