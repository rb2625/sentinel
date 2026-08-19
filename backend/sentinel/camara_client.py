import httpx
from .config import get_settings


class CamaraClient:
    """Client for Nokia Network-as-Code CAMARA APIs."""

    def __init__(self):
        settings = get_settings()
        self.base_url = settings.nokia_nac_base_url
        self.api_key = settings.nokia_nac_api_key
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    async def verify_location(
        self, phone_number: str, target_lat: float, target_lon: float,
        max_distance_meters: float = 500.0,
    ) -> dict:
        """Location Verification API."""
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/camara/location/v2/verify",
                    headers=self.headers,
                    json={
                        "phoneNumber": phone_number,
                        "targetLat": target_lat,
                        "targetLon": target_lon,
                        "maxDistance": max_distance_meters,
                    },
                )
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "verified": data.get("verified", False),
                        "distance_meters": data.get("distanceMeters", -1),
                        "confidence": data.get("confidence", 0.0),
                        "error": None,
                    }
                return {"verified": False, "error": f"API {response.status_code}"}
            except Exception as e:
                return {"verified": False, "error": str(e)}

    async def verify_number(self, phone_number: str) -> dict:
        """Number Verification API."""
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/camara/number-verify/v0/verify",
                    headers=self.headers,
                    json={"phoneNumber": phone_number},
                )
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "verified": data.get("verified", False),
                        "subscriber_name": data.get("subscriberName", ""),
                        "error": None,
                    }
                return {"verified": False, "error": f"API {response.status_code}"}
            except Exception as e:
                return {"verified": False, "error": str(e)}

    async def check_device_status(self, phone_number: str) -> dict:
        """Device Status API."""
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(
                    f"{self.base_url}/camara/device-status/v1/query",
                    headers=self.headers,
                    params={"phoneNumber": phone_number},
                )
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "active": data.get("active", False),
                        "roaming": data.get("roaming", False),
                        "carrier": data.get("carrier", ""),
                        "error": None,
                    }
                return {"active": False, "error": f"API {response.status_code}"}
            except Exception as e:
                return {"active": False, "error": str(e)}

    async def check_geofence(
        self, phone_number: str, zone_lat: float, zone_lon: float,
        zone_radius_meters: float = 1000.0,
    ) -> dict:
        """Geofencing API."""
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/camara/geofencing/v1/verify",
                    headers=self.headers,
                    json={
                        "phoneNumber": phone_number,
                        "zone": {"latitude": zone_lat, "longitude": zone_lon,
                                 "radius": zone_radius_meters},
                    },
                )
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "inside_zone": data.get("inside", False),
                        "distance_meters": data.get("distanceMeters", -1),
                        "error": None,
                    }
                return {"inside_zone": False, "error": f"API {response.status_code}"}
            except Exception as e:
                return {"inside_zone": False, "error": str(e)}

    async def validate_report(
        self, phone_number: str, incident_lat: float, incident_lon: float,
    ) -> dict:
        """Run all validation checks on an incoming incident report."""
        location = await self.verify_location(phone_number, incident_lat, incident_lon)
        number = await self.verify_number(phone_number)
        device = await self.check_device_status(phone_number)

        scores = []
        if location.get("verified"):
            scores.append(0.5)
        if number.get("verified"):
            scores.append(0.3)
        if device.get("active"):
            scores.append(0.2)

        overall = sum(scores) if scores else 0.0
        confidence = location.get("confidence", 0.0) if location.get("verified") else 0.0

        return {
            "location_verified": location.get("verified", False),
            "number_verified": number.get("verified", False),
            "device_active": device.get("active", False),
            "location_confidence": confidence,
            "overall_score": overall,
            "details": {"location": location, "number": number, "device": device},
        }
