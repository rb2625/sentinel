from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class Severity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class IncidentType(str, Enum):
    CAR_ACCIDENT = "car_accident"
    FLOODING = "flooding"
    FIRE = "fire"
    INFRASTRUCTURE = "infrastructure"
    CONSTRUCTION = "construction"
    UTILITY = "utility"
    ENVIRONMENTAL = "environmental"
    OTHER = "other"


class IncidentReport(BaseModel):
    id: Optional[int] = None
    reporter_phone: str
    reporter_name: Optional[str] = None
    incident_type: IncidentType
    description: str
    latitude: float
    longitude: float
    location_name: Optional[str] = None
    language: str = "en"
    source: str = "app"
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Validation(BaseModel):
    id: Optional[int] = None
    incident_id: int
    location_verified: bool = False
    number_verified: bool = False
    device_active: bool = False
    location_confidence: float = 0.0
    overall_score: float = 0.0
    validation_details: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Alert(BaseModel):
    id: Optional[int] = None
    incident_id: int
    severity: Severity
    sector: str
    summary: str
    dispatch_channel: str = "dashboard"
    acknowledged: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ClassificationResult(BaseModel):
    incident_type: IncidentType
    severity: Severity
    sector: str
    confidence: float
    summary: str
    reasoning: Optional[str] = None
