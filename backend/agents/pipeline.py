"""SENTINEL Agent Pipeline

Three-agent system:
  1. Validator Agent - decides which CAMARA APIs to call
  2. Classifier Agent - classifies type, severity, sector
  3. Anomaly Detector - finds geographic clusters
"""

import json
import logging
import time
import math

from groq import Groq
from sentinel.camara_client import camara_client
from sentinel.config import get_settings

log = logging.getLogger("sentinel.pipeline")


class ValidatorAgent:
    """Decides which CAMARA checks to run based on report context."""

    def run(self, phone, description, has_coords, language="en", source="app"):
        settings = get_settings()
        client = Groq(api_key=settings.groq_api_key)
        prompt = f"""You are a network validation agent.
Given an incident report, decide which CAMARA checks to run.

Available checks: Device Status, SIM Swap, Location Verification
Report: {description[:200]}
Has coordinates: {has_coords}

Return JSON: {{"checks_to_run": [...], "reasoning": "..."}}
Rules: urgent reports get all checks, low priority get only Device Status.
Respond ONLY with valid JSON."""
        try:
            resp = client.chat.completions.create(
                model="openai/gpt-oss-120b",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1, max_tokens=200,
            )
            text = resp.choices[0].message.content.strip()
            if text.startswith("```"):
                text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
            decision = json.loads(text)
        except Exception as e:
            log.warning("Validator LLM failed: %s", e)
            decision = {
                "checks_to_run": ["Device Status", "SIM Swap"]
                + (["Location Verification"] if has_coords else []),
                "reasoning": "Default: all available checks",
            }
        checks = decision.get("checks_to_run", [])
        results = {}
        if "Device Status" in checks:
            results["device"] = camara_client.check_device_status(phone)
        if "SIM Swap" in checks:
            results["sim_swap"] = camara_client.check_sim_swap(phone)
        score = 0
        if results.get("device", {}).get("reachable"): score += 35
        if not results.get("sim_swap", {}).get("swapped", True): score += 30
        return {
            "trust_score": score, "checks_run": len(results),
            "checks_decided": checks,
            "reasoning": decision.get("reasoning", ""),
            "results": results, "timestamp": time.time(),
        }


class ClassifierAgent:
    """Classifies incident reports using Groq LLM."""

    def run(self, description, language, trust_score, validation_results, location_name=""):
        settings = get_settings()
        client = Groq(api_key=settings.groq_api_key)
        prompt = f"""You are an urban incident classifier for UAE/MENA.
Classify this incident. Return JSON:
- incident_type: car_accident|flooding|fire|infrastructure|construction|utility|environmental|other
- severity: low|medium|high|critical
- sector: transport|utilities|environment|safety|construction|general
- confidence: 0-1
- summary: one sentence
- reasoning: one sentence
Severity rules: critical=danger to life, high=disruption, medium=moderate, low=minor
Trust score: {trust_score}/100
Language: {language}
Description: {description}
Location: {location_name}
Validation: {json.dumps(validation_results, default=str)[:300]}
Respond ONLY with valid JSON."""
        try:
            resp = client.chat.completions.create(
                model="openai/gpt-oss-120b",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1, max_tokens=300,
            )
            text = resp.choices[0].message.content.strip()
            if text.startswith("```"):
                text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
            data = json.loads(text)
            return {
                "incident_type": data.get("incident_type", "other"),
                "severity": data.get("severity", "medium"),
                "sector": data.get("sector", "general"),
                "confidence": float(data.get("confidence", 0.5)),
                "summary": data.get("summary", description[:100]),
                "reasoning": data.get("reasoning", ""),
            }
        except Exception as e:
            log.warning("Classifier LLM failed: %s", e)
            return self._fallback(description)

    def _fallback(self, description):
        d = description.lower()
        if any(w in d for w in ["accident", "crash", "car"]): t = "car_accident"
        elif any(w in d for w in ["flood", "water", "rain"]): t = "flooding"
        elif any(w in d for w in ["fire", "smoke"]): t = "fire"
        elif any(w in d for w in ["road", "bridge"]): t = "infrastructure"
        else: t = "other"
        return {"incident_type": t, "severity": "medium", "sector": "general",
                "confidence": 0.4, "summary": description[:100],
                "reasoning": "keyword fallback"}


class AnomalyDetector:
    """Detects geographic clusters across recent reports."""

    def run(self, new_report, recent_reports):
        if len(recent_reports) < 2:
            return {"anomaly_detected": False, "anomaly_type": "none",
                    "description": "Insufficient data", "severity": "low",
                    "affected_area": ""}
        if self._has_cluster(new_report, recent_reports):
            return {"anomaly_detected": True, "anomaly_type": "cluster",
                    "description": f"Multiple reports near ({new_report.get(chr(108)+chr(97)+chr(116),0):.4f}, {new_report.get(chr(108)+chr(111)+chr(110),0):.4f})",
                    "severity": "high",
                    "affected_area": new_report.get("location_name", "unknown")}
        return {"anomaly_detected": False, "anomaly_type": "none",
                "description": "No anomaly detected", "severity": "low",
                "affected_area": ""}

    def _has_cluster(self, new, recent, threshold_km=2.0):
        lat1 = new.get("lat", 0)
        lon1 = new.get("lon", 0)
        if not lat1 or not lon1:
            return False
        count = 0
        for r in recent:
            lat2 = r.get("lat", 0)
            lon2 = r.get("lon", 0)
            if not lat2 or not lon2:
                continue
            dlat = math.radians(lat2 - lat1)
            dlon = math.radians(lon2 - lon1)
            a = (math.sin(dlat/2)**2 +
                 math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
                 math.sin(dlon/2)**2)
            dist = 6371 * 2 * math.asin(math.sqrt(a))
            if dist <= threshold_km:
                count += 1
        return count >= 2

class IncidentPipeline:
    """End-to-end pipeline: report in, validated + classified + anomaly checked."""

    def __init__(self):
        self.validator = ValidatorAgent()
        self.classifier = ClassifierAgent()
        self.anomaly = AnomalyDetector()

    def process(self, report, recent_reports=None):
        t0 = time.time()
        phone = report.get("phone", "+99999991000")
        desc = report.get("description", "")
        lat = report.get("lat")
        lon = report.get("lon")
        has_coords = lat is not None and lon is not None

        # Agent 1: Validate
        log.info("Validator Agent: %s", phone)
        validation = self.validator.run(
            phone=phone, description=desc, has_coords=has_coords,
            language=report.get("language", "en"),
            source=report.get("source", "app"),
        )
        # Add location if coordinates provided
        if has_coords:
            validation["results"]["location"] = camara_client.verify_location(phone, lat, lon)
            if validation["results"]["location"].get("verified"):
                validation["trust_score"] += 35

        # Agent 2: Classify
        log.info("Classifier Agent")
        classification = self.classifier.run(
            description=desc, language=report.get("language", "en"),
            trust_score=validation["trust_score"],
            validation_results=validation.get("results", {}),
            location_name=report.get("location_name", ""),
        )

        # Agent 3: Anomaly Detection
        log.info("Anomaly Detector")
        new_data = {
            "lat": lat or 0, "lon": lon or 0,
            "type": classification.get("incident_type", "other"),
            "description": desc[:100],
            "time": time.strftime("%Y-%m-%d %H:%M:%S"),
        }
        anomaly = self.anomaly.run(new_data, recent_reports or [])

        elapsed = round(time.time() - t0, 2)
        log.info("Pipeline done in %.2fs, trust=%d", elapsed, validation["trust_score"])

        return {
            "trust_score": validation["trust_score"],
            "validation": validation,
            "classification": classification,
            "anomaly": anomaly,
            "processing_time_seconds": elapsed,
        }


pipeline = IncidentPipeline()