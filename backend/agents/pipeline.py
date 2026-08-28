"""
SENTINEL Agent Framework
CrewAI-compatible multi-agent system for urban incident detection.

Follows the CrewAI architecture pattern: Agent -> Task -> Crew -> Process.
Built on Groq Llama 3.3 70B (free tier, approved under Resource & Tooling Guide).

Three agent roles:
  1. Validator Agent - orchestrates CAMARA API calls
  2. Classifier Agent - categorizes incidents using LLM
  3. Anomaly Detector - finds geographic clusters

When CrewAI becomes available (Python 3.10-3.13), this can be migrated
by importing from crewai directly. The architecture is identical.
"""

import json
import math
import time
import logging
from dataclasses import dataclass, field
from typing import Any, Callable

from groq import Groq
from ..sentinel.camara_client import camara_client
from ..sentinel.config import get_settings

log = logging.getLogger("sentinel.agents")


# ---------------------------------------------------------------------------
# Tool abstraction (CrewAI-compatible)
# ---------------------------------------------------------------------------

@dataclass
class Tool:
    """A callable tool that agents can invoke. Matches CrewAI Tool interface."""
    name: str
    description: str
    func: Callable[..., Any]

    def run(self, **kwargs) -> Any:
        return self.func(**kwargs)


# CAMARA API Tools
def _device_status_tool(phone: str) -> dict:
    return camara_client.check_device_status(phone)

def _sim_swap_tool(phone: str) -> dict:
    return camara_client.check_sim_swap(phone)

def _location_verify_tool(phone: str, lat: float, lon: float) -> dict:
    return camara_client.verify_location(phone, lat, lon)

def _geofence_tool(phone: str, zone_lat: float, zone_lon: float, radius: int = 2000) -> dict:
    return camara_client.create_geofence(zone_lat, zone_lon, radius, phone)


DEVICE_STATUS_TOOL = Tool(
    name="Device Status",
    description="Check if a mobile device is currently connected to the network (CONNECTED_DATA, CONNECTED_SMS, or NOT_CONNECTED).",
    func=_device_status_tool,
)

SIM_SWAP_TOOL = Tool(
    name="SIM Swap",
    description="Check if the SIM card has been recently swapped for a given phone number. Returns swapped: true/false and last_swap timestamp.",
    func=_sim_swap_tool,
)

LOCATION_VERIFY_TOOL = Tool(
    name="Location Verification",
    description="Verify if a device is physically within a specified area. Returns verified: true/false, distance in meters, and confidence level.",
    func=_location_verify_tool,
)

GEOFENCE_TOOL = Tool(
    name="Geofencing",
    description="Monitor a geographic zone for device entry/exit events. Returns zone status and subscription details.",
    func=_geofence_tool,
)


# ---------------------------------------------------------------------------
# Agent (CrewAI-compatible)
# ---------------------------------------------------------------------------

@dataclass
class Agent:
    """
    An agent with a role, goal, backstory, and available tools.
    Uses Groq Llama 3.3 70B for reasoning (free tier).
    Matches CrewAI Agent interface.
    """
    role: str
    goal: str
    backstory: str
    tools: list[Tool] = field(default_factory=list)
    verbose: bool = True
    _llm_client: Groq | None = field(default=None, repr=False)

    def _get_llm(self) -> Groq:
        if self._llm_client is None:
            settings = get_settings()
            self._llm_client = Groq(api_key=settings.groq_api_key)
        return self._llm_client

    def _call_llm(self, prompt: str, max_tokens: int = 500, temperature: float = 0.1) -> str:
        client = self._get_llm()
        try:
            resp = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=temperature,
                max_tokens=max_tokens,
            )
            text = resp.choices[0].message.content.strip()
            if text.startswith("```"):
                text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
            return text
        except Exception as e:
            log.warning("LLM call failed for agent '%s': %s", self.role, e)
            return ""

    def execute_task(self, task: "Task", context: dict | None = None) -> dict:
        """Execute a task by building a prompt from role/goal/backstory and calling the LLM."""
        tool_descriptions = "\n".join(
            f"  - {t.name}: {t.description}" for t in self.tools
        )
        context_str = json.dumps(context or {}, default=str)[:500]

        prompt = f"""You are {self.role}.
Goal: {self.goal}
Background: {self.backstory}

Available tools:
{tool_descriptions}

Task: {task.description}

Context from previous agents:
{context_str}

{task.expected_output}

Respond ONLY with valid JSON."""

        if self.verbose:
            log.info("Agent '%s' executing task...", self.role)

        response = self._call_llm(prompt, max_tokens=task.max_tokens)
        if not response:
            return task.fallback()

        try:
            return json.loads(response)
        except json.JSONDecodeError:
            log.warning("Agent '%s' returned invalid JSON, using fallback", self.role)
            return task.fallback()


# ---------------------------------------------------------------------------
# Task (CrewAI-compatible)
# ---------------------------------------------------------------------------

@dataclass
class Task:
    """
    A task assigned to an agent. Matches CrewAI Task interface.
    """
    description: str
    agent: Agent
    expected_output: str = "Return a JSON object with the results."
    max_tokens: int = 500
    fallback: Callable[[], dict] = field(default_factory=lambda: {})


# ---------------------------------------------------------------------------
# Crew (CrewAI-compatible)
# ---------------------------------------------------------------------------

class Crew:
    """
    Orchestrates agents and tasks in sequence. Matches CrewAI Crew interface.
    Process: sequential (each agent's output feeds the next).
    """
    def __init__(self, agents: list[Agent], tasks: list[Task], verbose: bool = True):
        self.agents = agents
        self.tasks = tasks
        self.verbose = verbose

    def kickoff(self, inputs: dict | None = None) -> dict:
        """Run all tasks sequentially, passing context between them."""
        context: dict[str, Any] = inputs or {}
        results: dict[str, Any] = {}

        for task in self.tasks:
            agent = task.agent
            if self.verbose:
                log.info("Crew: Dispatching to agent '%s'", agent.role)

            result = agent.execute_task(task, context=context)
            results[agent.role] = result
            context.update(result)

        return results


# ---------------------------------------------------------------------------
# Pre-configured Agents
# ---------------------------------------------------------------------------

def create_validator_agent() -> Agent:
    return Agent(
        role="Network Validation Agent",
        goal="Verify the legitimacy of an incident report by orchestrating CAMARA API checks on the reporter's device and network identity.",
        backstory=(
            "You are a telecommunications intelligence specialist. Your job is to "
            "determine whether an incident report is credible by checking the reporter's "
            "device status, SIM integrity, and physical location using CAMARA network APIs. "
            "You decide which checks to run based on the report's urgency and available data. "
            "You calculate a trust score from 0-100 based on verification results."
        ),
        tools=[DEVICE_STATUS_TOOL, SIM_SWAP_TOOL, LOCATION_VERIFY_TOOL, GEOFENCE_TOOL],
    )

def create_classifier_agent() -> Agent:
    return Agent(
        role="Incident Classification Agent",
        goal="Classify urban incidents by type, severity, and sector using multilingual analysis.",
        backstory=(
            "You are an urban safety analyst with expertise in MENA region incidents. "
            "You classify reports into categories (car accident, flooding, fire, infrastructure, "
            "construction, utility, environmental) and assign severity levels (critical, high, "
            "medium, low). You understand Arabic, English, and Arabizi text. You consider "
            "the validation results and trust score when making your classification."
        ),
        tools=[],
    )

def create_anomaly_agent() -> Agent:
    return Agent(
        role="Anomaly Detection Agent",
        goal="Detect geographic clusters and escalation patterns across multiple incident reports.",
        backstory=(
            "You are a spatial analytics specialist. You analyze incoming reports against "
            "recent report history to identify clusters (multiple reports from the same area), "
            "escalations (increasing severity over time), and coordinated patterns. "
            "You use haversine distance calculations and statistical analysis."
        ),
        tools=[],
    )


# ---------------------------------------------------------------------------
# Pipeline (CrewAI-compatible)
# ---------------------------------------------------------------------------

class IncidentPipeline:
    """
    End-to-end incident processing pipeline using CrewAI architecture.
    Three agents, three tasks, sequential process.
    """

    def __init__(self):
        self.validator = create_validator_agent()
        self.classifier = create_classifier_agent()
        self.anomaly_detector = create_anomaly_agent()

    def process(self, report: dict, recent_reports: list[dict] | None = None) -> dict:
        t0 = time.time()
        phone = report.get("phone", "+99999991000")
        desc = report.get("description", "")
        lat = report.get("lat")
        lon = report.get("lon")
        has_coords = lat is not None and lon is not None
        lang = report.get("language", "en")

        # --- Build the three tasks ---
        validate_task = Task(
            description=(
                f"Incident report received via {report.get('source', 'app')}. "
                f"Phone: {phone}. Language: {lang}. "
                f"Description: {desc[:300]}. "
                f"Has coordinates: {has_coords} "
                f"({'lat: ' + str(lat) + ', lon: ' + str(lon) if has_coords else 'no coordinates provided'}). "
                f"Decide which CAMARA checks to run and execute them. "
                f"Calculate a trust score from 0-100."
            ),
            agent=self.validator,
            expected_output=(
                "Return JSON with: trust_score (0-100), checks_run (list of API names), "
                "reasoning (string), results (dict with each API response)."
            ),
            max_tokens=600,
            fallback=lambda: {
                "trust_score": 0,
                "checks_run": [],
                "reasoning": "Validation failed",
                "results": {},
            },
        )

        classify_task = Task(
            description=(
                f"Classify this incident report. Description: {desc[:300]}. "
                f"Language: {lang}. Location: {report.get('location_name', 'unknown')}. "
                f"Trust score from validator: see context."
            ),
            agent=self.classifier,
            expected_output=(
                "Return JSON with: incident_type (car_accident|flooding|fire|infrastructure|"
                "construction|utility|environmental|other), severity (critical|high|medium|low), "
                "sector (transport|utilities|environment|safety|construction|general), "
                "confidence (0-1), summary (one sentence), reasoning (one sentence)."
            ),
            max_tokens=400,
            fallback=lambda: {
                "incident_type": "other",
                "severity": "medium",
                "sector": "general",
                "confidence": 0.4,
                "summary": desc[:100],
                "reasoning": "Classification fallback",
            },
        )

        anomaly_task = Task(
            description=(
                f"Analyze this report against recent report history for clusters. "
                f"Report location: lat={lat or 0}, lon={lon or 0}. "
                f"Number of recent reports to compare: {len(recent_reports or [])}."
            ),
            agent=self.anomaly_detector,
            expected_output=(
                "Return JSON with: anomaly_detected (bool), anomaly_type (cluster|escalation|none), "
                "description (string), severity (high|medium|low), affected_area (string)."
            ),
            max_tokens=300,
            fallback=lambda: {
                "anomaly_detected": False,
                "anomaly_type": "none",
                "description": "Insufficient data",
                "severity": "low",
                "affected_area": "",
            },
        )

        # --- Run the Crew (sequential) ---
        crew = Crew(
            agents=[self.validator, self.classifier, self.anomaly_detector],
            tasks=[validate_task, classify_task, anomaly_task],
            verbose=True,
        )

        inputs = {
            "phone": phone,
            "description": desc,
            "latitude": lat,
            "longitude": lon,
            "has_coords": has_coords,
            "language": lang,
            "source": report.get("source", "app"),
            "location_name": report.get("location_name", ""),
            "recent_reports": recent_reports or [],
        }

        crew_result = crew.kickoff(inputs=inputs)

        # Extract results from each agent
        validation = crew_result.get("Network Validation Agent", {})
        classification = crew_result.get("Incident Classification Agent", {})
        anomaly = crew_result.get("Anomaly Detection Agent", {})

        # If the LLM returned raw CAMARA results in validation, parse them
        if "results" not in validation:
            validation["results"] = {}
            if "device_status" in validation:
                validation["results"]["device"] = validation.pop("device_status")
            if "sim_swap" in validation:
                validation["results"]["sim_swap"] = validation.pop("sim_swap")

        # Ensure trust_score exists
        if "trust_score" not in validation:
            score = 0
            results = validation.get("results", {})
            if results.get("device", {}).get("reachable"):
                score += 35
            if not results.get("sim_swap", {}).get("swapped", True):
                score += 30
            validation["trust_score"] = score

        elapsed = round(time.time() - t0, 2)
        log.info("Pipeline complete in %.2fs, trust=%s", elapsed, validation.get("trust_score", 0))

        return {
            "trust_score": validation.get("trust_score", 0),
            "validation": validation,
            "classification": classification,
            "anomaly": anomaly,
            "processing_time_seconds": elapsed,
        }


# Module-level singleton
pipeline = IncidentPipeline()
