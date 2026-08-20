"""
CAMARA API client using Nokia Network-as-Code (direct HTTP).

Uses httpx directly against the Nokia API Hub because the Python SDK
routes to incorrect endpoint paths. Wraps Device Status, Location
Verification, and SIM Swap APIs. Includes caching and fallback.
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
            log.warning("CAMARA %s returned %d: %s", path, resp.status_code, resp.text[:200])
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

    # Device Status - Connectivity
    def check_device_status(self, phone: str) -> dict:
        """Check if a device is connected to the network."""
        phone = self._resolve_phone(phone)
        cached = _cache.get("device", phone)
        if cached is not None:
            log.info("Device status cache hit for %s", phone)
            return cached
        data = self._post("device-status/v0/connectivity", {"device": {"phoneNumber": phone}})
        if "error" in data:
            return {"reachable": False, "status": "UNKNOWN", "error": data["error"]}
        status_val = data.get("connectivityStatus", "UNKNOWN")
        out = {
            "reachable": status_val in ("CONNECTED_DATA", "CONNECTED_SMS"),
            "status": status_val,
        }
        _cache.set("device", phone, out)
        return out

    # SIM Swap Check
    def check_sim_swap(self, phone: str, max_age_hours: int = 240) -> dict:
        """Check if SIM was swapped recently."""
        phone = self._resolve_phone(phone)
        cached = _cache.get("simswap", phone)
        if cached is not None:
            log.info("SIM swap cache hit for %s", phone)
            return cached
        data = self._post(
            "passthrough/camara/v1/sim-swap/sim-swap/v0/check",
            {"phoneNumber": phone, "maxAge": max_age_hours},
        )
        if "error" in data:
            return {"swapped": False, "risk_level": "unknown", "error": data["error"]}
        swapped = data.get("swapped", False)
        out = {
            "swapped": bool(swapped),
            "risk_level": "high" if swapped else "low",
        }
        _cache.set("simswap", phone, out)
        return out    # Location Verification
    def verify_location(
        self, phone: str, lat: float, lon: float, radius_m: int = 50000, max_age: int = 120
    ) -> dict:
        """Verify if a device is within a geographic area."""
        phone = self._resolve_phone(phone)
        area_key = f"{lat},{lon},{radius_m}"
        cached = _cache.get("location", phone, area=area_key)
        if cached is not None:
            log.info("Location cache hit for %s", phone)
            return cached
        data = self._post("location-verification/v1/verify", {
            "device": {"phoneNumber": phone},
            "area": {
                "areaType": "CIRCLE",
                "center": {"latitude": lat, "longitude": lon},
                "radius": radius_m,
            },
            "maxAge": max_age,
        })
        if "error" in data:
            return {"verified": False, "confidence": "unknown", "error": data["error"]}
        verified = data.get("verificationResult", "FALSE")
        if isinstance(verified, str):
            verified = verified.upper() == "TRUE"
        out = {
            "verified": bool(verified),
            "confidence": "high" if verified else "low",
            "last_location_time": data.get("lastLocationTime"),
        }
        _cache.set("location", phone, out, area=area_key)
        return out


    # Number Verification (requires OAuth, simplified for demo)
    def verify_number(self, phone: str) -> dict:
        """Verify if a phone number is real. Falls back to SIM swap check."""
        phone = self._resolve_phone(phone)
        cached = _cache.get("number", phone)
        if cached is not None:
            log.info("Number verification cache hit for %s", phone)
            return cached
        # Number Verification requires OAuth 3-legged flow.
        # For demo, use SIM swap + device status as proxy.
        sim = self.check_sim_swap(phone)
        device = self.check_device_status(phone)
        valid = device.get("reachable", False) and not sim.get("swapped", True)
        out = {"valid": valid, "source": "sim_swap+device_status"}
        _cache.set("number", phone, out)
        return out


    # Geofencing
    def create_geofence(
        self, lat: float, lon: float, radius_m: int = 2000,
        phone: str = "+99999991000", webhook_url: str | None = None,
    ) -> dict:
        """Create a geofencing subscription for a circular area."""
        cache_key = f"{lat},{lon},{radius_m}"
        cached = _cache.get("geofence", cache_key)
        if cached is not None:
            log.info("Geofence cache hit for %s", cache_key)
            return cached
        data = self._post("passthrough/camara/v0/geofencing/subscriptions", {
            "protocol": "HTTP",
            "sink": webhook_url or "https://example.com/webhook",
            "types": [
                "org.camaraproject.geofencing-subscriptions.v0.area-entered",
                "org.camaraproject.geofencing-subscriptions.v0.area-left",
            ],
            "config": {
                "subscriptionDetail": {
                    "device": {"phoneNumber": phone},
                    "area": {
                        "areaType": "CIRCLE",
                        "center": {"latitude": lat, "longitude": lon},
                        "radius": radius_m,
                    },
                },
                "initialEvent": True,
                "subscriptionMaxEvents": 10,
            },
        })
        if "error" in data:
            return {"subscription_id": None, "status": "failed", "error": data["error"]}
        out = {
            "subscription_id": data.get("id"),
            "status": "active",
        }
        _cache.set("geofence", cache_key, out)
        return out


    # Full Validation Pipeline
    def validate_report(
        self, phone: str, lat: float | None = None, lon: float | None = None,
    ) -> dict:
        """Run all CAMARA checks on an incident report. Returns trust score."""
        results = {}
        results["device"] = self.check_device_status(phone)
        results["sim_swap"] = self.check_sim_swap(phone)
        if lat is not None and lon is not None:
            results["location"] = self.verify_location(phone, lat, lon)

        score = 0
        checks = 0
        if results["device"].get("reachable"):
            score += 35
        checks += 1
        if not results["sim_swap"].get("swapped"):
            score += 30
        checks += 1
        if "location" in results:
            if results["location"].get("verified"):
                score += 35
            checks += 1

        return {
            "trust_score": score,
            "checks_run": checks,
            "results": results,
        }


camara_client = CamaraClient()