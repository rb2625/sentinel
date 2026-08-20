"""CAMARA API client using Nokia Network-as-Code SDK."""

import time
import hashlib
import logging
from typing import Any

from network_as_code import NetworkAsCodeApi
from .config import get_settings

log = logging.getLogger("sentinel.camara")


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


def _get_client() -> NetworkAsCodeApi:
    settings = get_settings()
    return NetworkAsCodeApi(
        api_key=settings.nokia_nac_api_key,
        rapidapi_host="network-as-code.nokia.rapidapi.com",
    )


class CamaraClient:
    """Nokia NaC CAMARA API client with caching and fallback."""

    def __init__(self):
        self._client: NetworkAsCodeApi | None = None

    def _ensure_client(self) -> NetworkAsCodeApi:
        if self._client is None:
            self._client = _get_client()
        return self._client

    def _resolve_phone(self, phone: str) -> str:
        if not phone.startswith("+"):
            if phone.startswith("00"):
                return "+" + phone[2:]
            return "+971" + phone
        return phone

    def verify_number(self, phone: str) -> dict:
        """Verify if a phone number is real and active."""
        phone = self._resolve_phone(phone)
        cached = _cache.get("number", phone)
        if cached is not None:
            log.info("Number verification cache hit for %s", phone)
            return cached
        try:
            client = self._ensure_client()
            result = client.number_verification.verify(phone_number=phone)
            out = {
                "valid": True,
                "carrier": getattr(result, "carrier", None),
                "raw": getattr(result, "__dict__", {}),
            }
            _cache.set("number", phone, out)
            return out
        except Exception as e:
            log.warning("Number verification failed: %s", e)
            return {"valid": False, "carrier": None, "error": str(e)}


    def verify_location(
        self, phone: str, lat: float, lon: float, radius_m: int = 1000
    ) -> dict:
        """Verify if a device is within a geographic area."""
        phone = self._resolve_phone(phone)
        area_key = f"{lat},{lon},{radius_m}"
        cached = _cache.get("location", phone, area=area_key)
        if cached is not None:
            log.info("Location verification cache hit for %s", phone)
            return cached
        try:
            client = self._ensure_client()
            result = client.location.verify(
                device={"phone_number": phone},
                area={"area_type": "CIRCLE", "area_value": f"{lat},{lon},{radius_m}"},
            )
            verified = getattr(result, "verification_result", False)
            out = {
                "verified": verified,
                "distance_m": getattr(result, "distance", None),
                "confidence": "high" if verified else "low",
                "raw": getattr(result, "__dict__", {}),
            }
            _cache.set("location", phone, out, area=area_key)
            return out
        except Exception as e:
            log.warning("Location verification failed: %s", e)
            return {"verified": False, "distance_m": None, "confidence": "unknown", "error": str(e)}

    def check_device_status(self, phone: str) -> dict:
        """Check if a device is connected to the network."""
        phone = self._resolve_phone(phone)
        cached = _cache.get("device", phone)
        if cached is not None:
            log.info("Device status cache hit for %s", phone)
            return cached
        try:
            client = self._ensure_client()
            result = client.device_status.check_connectivity(
                device={"phone_number": phone}
            )
            status_val = getattr(result, "status", "UNKNOWN")
            out = {
                "reachable": status_val == "ACTIVE",
                "status": status_val,
                "raw": getattr(result, "__dict__", {}),
            }
            _cache.set("device", phone, out)
            return out
        except Exception as e:
            log.warning("Device status check failed: %s", e)
            return {"reachable": False, "status": "UNKNOWN", "error": str(e)}


    def create_geofence(
        self, lat: float, lon: float, radius_m: int = 500, webhook_url: str | None = None,
    ) -> dict:
        """Create a geofencing subscription for a circular area."""
        cache_key = f"{lat},{lon},{radius_m}"
        cached = _cache.get("geofence", cache_key)
        if cached is not None:
            log.info("Geofence cache hit for %s", cache_key)
            return cached
        try:
            client = self._ensure_client()
            result = client.geofencing.create_subscription(
                protocol="HTTP",
                sink=webhook_url or "https://example.com/webhook",
                types=[
                    "org.camaraproject.geofencing-subscriptions.v0.area-entered",
                    "org.camaraproject.geofencing-subscriptions.v0.area-left",
                ],
                config={
                    "area": {
                        "areaType": "CIRCLE",
                        "areaValue": f"{lat},{lon},{radius_m}",
                    }
                },
            )
            sub_id = getattr(result, "subscription_id", None)
            out = {
                "subscription_id": sub_id,
                "status": "active",
                "raw": getattr(result, "__dict__", {}),
            }
            _cache.set("geofence", cache_key, out)
            return out
        except Exception as e:
            log.warning("Geofence creation failed: %s", e)
            return {"subscription_id": None, "status": "failed", "error": str(e)}

    def validate_report(
        self, phone: str, lat: float | None = None, lon: float | None = None,
    ) -> dict:
        """Run all CAMARA checks on an incident report. Returns trust score."""
        results = {}
        results["number"] = self.verify_number(phone)
        results["device"] = self.check_device_status(phone)
        if lat is not None and lon is not None:
            results["location"] = self.verify_location(phone, lat, lon)

        score = 0
        checks = 0
        if results["number"].get("valid"):
            score += 35
        checks += 1
        if results["device"].get("reachable"):
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