import json
from groq import Groq
from ..sentinel.config import get_settings
from ..sentinel.models import ClassificationResult, IncidentType, Severity


CLASSIFICATION_PROMPT = """You are an urban incident classifier for a smart city platform in the UAE/MENA region.

Given an incident report, classify it and return a JSON object with these exact fields:
- incident_type: one of [car_accident, flooding, fire, infrastructure, construction, utility, environmental, other]
- severity: one of [low, medium, high, critical]
- sector: the relevant city sector (e.g., "transport", "utilities", "environment", "safety", "construction")
- confidence: a number 0-1 representing classification confidence
- summary: a one-sentence English summary of the incident

Rules:
- If the report mentions accidents, crashes, collisions, or vehicles -> car_accident
- If it mentions water, rain, drainage, sewer, flooding -> flooding
- If it mentions fire, smoke, burning, explosion -> fire
- If it mentions roads, bridges, buildings, walls, collapse -> infrastructure
- If it mentions construction, crane, scaffolding -> construction
- If it mentions electricity, water supply, gas, telecom -> utility
- If it mentions pollution, waste, contamination -> environmental

Severity rules:
- critical: immediate danger to life, major infrastructure failure, active fire
- high: significant disruption, property damage, potential danger
- medium: moderate disruption, manageable incident
- low: minor issue, inconvenience, no immediate danger

Respond ONLY with valid JSON. No markdown, no explanation.

Incident Report:
Language: {language}
Type hint: {incident_type_hint}
Description: {description}
Location: {location_name}
"""

ANOMALY_PROMPT = """You are an anomaly detection agent for urban incident monitoring.

Given a set of recent incident reports, determine if there is an emerging pattern or anomaly.

Recent reports:
{reports}

Analyze:
1. Are there clusters of reports in the same area?
2. Are there multiple reports of the same type in a short time window?
3. Is there an escalating pattern?
4. Are there any sudden spikes?

Return a JSON object:
- anomaly_detected: boolean
- anomaly_type: "cluster" | "escalation" | "spike" | "none"
- description: one sentence describing the anomaly
- severity: "low" | "medium" | "high" | "critical"
- affected_area: location description if applicable

Respond ONLY with valid JSON."""


class ClassifierAgent:
    """AI agent that classifies incident reports and detects anomalies.
    
    This agent treats CAMARA API results as tools it reasons over,
    not as button presses. It combines validation signals with
    report content to make intelligent classification decisions.
    """

    def __init__(self):
        settings = get_settings()
        self.client = Groq(api_key=settings.groq_api_key) if settings.groq_api_key else None

    def classify_incident(
        self, description: str, language: str = "en",
        incident_type_hint: str = "other", location_name: str = "",
    ) -> ClassificationResult:
        """Classify an incident report using the LLM."""
        if not self.client:
            return self._fallback_classify(description, incident_type_hint)

        prompt = CLASSIFICATION_PROMPT.format(
            language=language, incident_type_hint=incident_type_hint,
            description=description, location_name=location_name,
        )
        try:
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1, max_tokens=300,
            )
            text = response.choices[0].message.content.strip()
            if text.startswith("```"):
                text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
            data = json.loads(text)
            return ClassificationResult(
                incident_type=IncidentType(data.get("incident_type", "other")),
                severity=Severity(data.get("severity", "medium")),
                sector=data.get("sector", "general"),
                confidence=float(data.get("confidence", 0.5)),
                summary=data.get("summary", description[:100]),
            )
        except Exception:
            return self._fallback_classify(description, incident_type_hint)

    def detect_anomaly(self, recent_reports: list[dict]) -> dict:
        """Detect anomalies in recent incident reports."""
        if not self.client or len(recent_reports) < 3:
            return {"anomaly_detected": False, "anomaly_type": "none",
                    "description": "Insufficient data", "severity": "low", "affected_area": ""}

        reports_text = "\n".join(
            f"- {r.get('type','unknown')}: {r.get('description','')[:80]} "
            f"at ({r.get('lat',0):.4f}, {r.get('lon',0):.4f}) [{r.get('time','')}]"
            for r in recent_reports
        )
        prompt = ANOMALY_PROMPT.format(reports=reports_text)
        try:
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1, max_tokens=300,
            )
            text = response.choices[0].message.content.strip()
            if text.startswith("```"):
                text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
            return json.loads(text)
        except Exception:
            return {"anomaly_detected": False, "anomaly_type": "none",
                    "description": "Detection unavailable", "severity": "low", "affected_area": ""}

    def _fallback_classify(self, description: str, hint: str) -> ClassificationResult:
        """Keyword-based fallback when LLM is unavailable."""
        desc = description.lower()
        if any(w in desc for w in ["accident", "crash", "collision", "car", "vehicle"]):
            itype = IncidentType.CAR_ACCIDENT
        elif any(w in desc for w in ["flood", "water", "rain", "drain"]):
            itype = IncidentType.FLOODING
        elif any(w in desc for w in ["fire", "smoke", "burn"]):
            itype = IncidentType.FIRE
        elif any(w in desc for w in ["road", "bridge", "collapse", "building"]):
            itype = IncidentType.INFRASTRUCTURE
        elif any(w in desc for w in ["construction", "crane"]):
            itype = IncidentType.CONSTRUCTION
        elif any(w in desc for w in ["electricity", "power", "gas"]):
            itype = IncidentType.UTILITY
        elif any(w in desc for w in ["pollution", "waste"]):
            itype = IncidentType.ENVIRONMENTAL
        else:
            itype = IncidentType(hint) if hint in [e.value for e in IncidentType] else IncidentType.OTHER

        sev = Severity.MEDIUM
        if any(w in desc for w in ["danger", "death", "major", "severe"]):
            sev = Severity.CRITICAL
        elif any(w in desc for w in ["damage", "disruption"]):
            sev = Severity.HIGH
        elif any(w in desc for w in ["minor", "small"]):
            sev = Severity.LOW

        return ClassificationResult(
            incident_type=itype, severity=sev, sector="general",
            confidence=0.4, summary=description[:100],
        )
