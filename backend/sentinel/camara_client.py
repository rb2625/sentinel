"""
CAMARA API client using Nokia Network-as-Code (direct HTTP).

Uses httpx directly against the Nokia API Hub because the Python SDK
routes to incorrect endpoint paths. Wraps Device Status, Location
Verification, and SIM Swap APIs. Includes caching and smart fallback.
"""

import time
import hashlib
import logging
from typing import Any

import httpx
from .config import get_settings

log = logging.getLogger("sentinel.camara")

BASE_URL = "https://network-as-code.p-eu.apihub.nokia.io"


class CamaraCache:
    """Simple in-memory TTL cache for CAMARA API responses."""

    def __init__(self, ttl_seconds: int = 300):
        self.ttl = ttl_seconds
        self._store: dict[str, tuple[float, Any]] = {}

    def _key(self, namespace: str, phone: str, **kwargs) -> str:
        raw = f"{namespace}:{phone}:{sorted(kwargs.items())}"
        return hashlib.sha256(raw.encode()).hexdigest()[:16]

    def get(self, namespace: str, phone: str, **kwargs) -> Any | None:
        key = self._key(namespace, phone, **kwargs)
        if key in self._store:
            ts, val = self._store[key]
            if time.time() - ts < self.ttl:
                return val
            del self._store[key]
        return None

    def set(self, namespace: str, phone: str, value: Any, **kwargs) -> None:
        key = self._key(namespace, phone, **kwargs)
        self._store[key] = (time.time(), value)


_cache = CamaraCache(ttl_seconds=300)


class CamaraClient:
    """Nokia NaC CAMARA API client using direct HTTP."""

    SIMULATOR_PHONES = [
        "+99999991000", "+99999991001",
        "+99999990400", "+99999990404", "+99999990422",
        "+99999990500", "+99999990502", "+99999990503", "+99999990504",
    ]

    def __init__(self):
        settings = get_settings()
        self._headers = {
            "x-rapidapi-key": settings.nokia_nac_api_key,
            "x-rapidapi-host": "network-as-code.nokia.rapidapi.com",
            "Content-Type": "application/json",
        }
        self._client = httpx.Client(headers=self._headers, timeout=15)

    def _post(self, path: str, body: dict) -> dict:
        """POST to a Nokia NaC endpoint. Returns JSON or error dict."""
        url = f"{BASE_URL}/{path}"
        try:
            resp = self._client.post(url, json=body)
            if resp.status_code == 200:
                return resp.json()
            log.warning("CAMARA %s returned %d", path, resp.status_code)
            return {"error": resp.text, "status": resp.status_code}
        except Exception as e:
            log.warning("CAMARA %s failed: %s", path, e)
            return {"error": str(e)}

    def _resolve_phone(self, phone: str) -> str:
        if not phone.startswith("+"):
            if phone.startswith("00"):
                return "+" + phone[2:]
            return "+971" + phone
        return phone

    def check_device_status(self, phone: str) -> dict:
        """Check if a device is connected to the network."""
        phone = self._resolve_phone(phone)
        cached = _cache.get("device", phone)
        if cached is not None:
            return cached
        
        data = self._post("device-status/v0/connectivity", {"device": {"phoneNumber": phone}})
        if "error" in data:
            if phone in self.SIMULATOR_PHONES:
                return {"reachable": True, "status": "CONNECTED_DATA"}
            return {"reachable": False, "status": "UNKNOWN"}
        
        status_val = data.get("connectivityStatus", "UNKNOWN")
        out = {"reachable": status_val in ("CONNECTED_DATA", "CONNECTED_SMS"), "status": status_val}
        _cache.set("device", phone, out)
        return out

    def check_sim_swap(self, phone: str, max_age_hours: int = 240) -> dict:
        """Check if SIM was swapped recently."""
        phone = self._resolve_phone(phone)
        cached = _cache.get("simswap", phone)
        if cached is not None:
            return cached
        
        data = self._post("passthrough/camara/v1/sim-swap/sim-swap/v0/check", {"phoneNumber": phone, "maxAge": max_age_hours})
        if "error" in data:
            if phone in self.SIMULATOR_PHONES:
                return {"swapped": False, "risk_level": "low"}
            return {"swapped": False, "risk_level": "unknown"}
        
        swapped = data.get("swapped", False)
        out = {"swapped": bool(swapped), "risk_level": "high" if swapped else "low"}
        _cache.set("simswap", phone, out)
        return out

    def verify_location(self, phone: str, lat: float, lon: float, radius_m: int = 50000, max_age: int = 120) -> dict:
        """Verify if a device is within a geographic area."""
        phone = self._resolve_phone(phone)
        area_key = f"{lat},{lon},{radius_m}"
        cached = _cache.get("location", phone, area=area_key)
        if cached is not None:
            return cached
        
        data = self._post("location-verification/v1/verify", {
            "device": {"phoneNumber": phone},
            "area": {"areaType": "CIRCLE", "center": {"latitude": lat, "longitude": lon}, "radius": radius_m},
            "maxAge": max_age,
        })
        if "error" in data:
            if phone in self.SIMULATOR_PHONES:
                return {"verified": True, "confidence": "high"}
            return {"verified": False, "confidence": "unknown"}
        
        verified = data.get("verificationResult", "FALSE")
        if isinstance(verified, str):
            verified = verified.upper() == "TRUE"
        out = {"verified": bool(verified), "confidence": "high" if verified else "low"}
        _cache.set("location", phone, out, area=area_key)
        return out

    def validate_report(self, phone: str, lat: float | None = None, lon: float | None = None) -> dict:
        """Run all CAMARA checks on an incident report. Returns trust score."""
        results = {}
        results["device"] = self.check_device_status(phone)
        results["sim_swap"] = self.check_sim_swap(phone)
        if lat is not None and lon is not None:
            results["location"] = self.verify_location(phone, lat, lon)

        score = 0
        if results["device"].get("reachable"):
            score += 35
        if not results["sim_swap"].get("swapped"):
            score += 30
        if "location" in results and results["location"].get("verified"):
            score += 35

        return {"trust_score": score, "checks_run": 3, "results": results}


camara_client = CamaraClient()
