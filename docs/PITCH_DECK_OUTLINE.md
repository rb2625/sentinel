# SENTINEL Pitch Deck Outline

## Slide 1: Title
SENTINEL - Real-Time Urban Incident Detection with Network Intelligence
GSMA MENA Ignite Hackathon 2026

## Slide 2: The Problem
Cities respond to emergencies blind. When a citizen reports a car accident, nobody knows if they are actually there, if their phone is real, or if 10 people already reported the same thing.

## Slide 3: The Solution
SENTINEL validates every report in under 2 seconds using telecom network intelligence.

Report arrives -> AI Agent orchestrates CAMARA APIs -> Validated alert dispatched

## Slide 4: CAMARA API Usage
Location Verification: Confirm reporter is within 500m of incident
Number Verification: Prevent spoofed/coordinated attacks
Device Status: Filter stale or resubmitted reports
Geofencing: Detect emerging incident clusters

The agent decides WHICH APIs to call based on context, not the user pressing buttons.

## Slide 5: AI Agent Design
Built using the approved Resource & Tooling Guide:
- Classifier Agent: Uses Groq LLM to categorize incidents
- Anomaly Detector: Statistical + LLM pattern recognition
- Validation Orchestrator: Chains CAMARA API calls, calculates trust scores
- Alert Dispatcher: Routes validated alerts to channels

The agent's reasoning trace is visible on screen during the demo.

## Slide 6: Technical Architecture
FastAPI Backend + CAMARA APIs (Nokia NaC) + Groq LLM + Supabase + Next.js Dashboard + Telegram Alerts

## Slide 7: Dashboard
Real-time command center with KPIs, incident feed, severity breakdown, type distribution, and alert management.

## Slide 8: Business Model
B2B SaaS: Free ($0/100 incidents), Pro ($49/mo), Enterprise ($499/mo)
Revenue from municipalities, construction companies, utilities across MENA.

## Slide 9: Demo
Live walkthrough: submit report -> CAMARA validation -> AI classification -> dashboard update -> Telegram alert

## Slide 10: Impact
Reduces false reports, speeds up response, works across Arabic/English/Arabizi, scalable to any MENA city.
