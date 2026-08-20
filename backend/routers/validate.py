from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from sentinel.camara_client import camara_client

router = APIRouter()


class ValidateRequest(BaseModel):
    phone_number: str
    latitude: float
    longitude: float


@router.post("/")
async def validate_report(req: ValidateRequest):
    """Run CAMARA validation on a phone number and location."""
    result = camara_client.validate_report(
        phone=req.phone_number, lat=req.latitude, lon=req.longitude,
    )
    return result


@router.post("/location")
async def verify_location(req: ValidateRequest):
    """Verify reporter location only."""
    return camara_client.verify_location(
        phone=req.phone_number, lat=req.latitude, lon=req.longitude,
    )


@router.post("/device")
async def check_device(phone_number: str):
    """Check device connectivity status."""
    return camara_client.check_device_status(phone_number)
