# SENTINEL Pitch Deck
## GSMA MENA Ignite Hackathon 2026

---

## Slide 1: Title

**SENTINEL**
Real-Time Urban Incident Detection with Network Intelligence

GSMA MENA Ignite Hackathon 2026
Theme 2: Smart Cities, Urban Safety and Mega-Project Infrastructure

---

## Slide 2: The Problem

**Cities respond to emergencies blind.**

When a citizen reports a car accident on Sheikh Zayed Road:
- Nobody knows if they are actually there
- Nobody knows if their phone number is real
- Nobody knows if 10 people already reported the same thing
- Nobody knows if this is urgent or just someone venting

**Result:** Wasted resources, delayed responses, vulnerability to fake reports.

---

## Slide 3: The Solution

**SENTINEL validates every report in under 2 seconds using telecom network intelligence.**

Report arrives -> AI Agent orchestrates CAMARA APIs -> Validated alert dispatched

1. Location Verification confirms the reporter is within 500m
2. Number Verification confirms the phone is real
3. Device Status confirms the device is active
4. AI classifies severity and sector
5. Anomaly detection finds clusters
6. Alert sent to dashboard and Telegram

---

## Slide 4: CAMARA API Usage

**4 APIs orchestrated by AI:**

| API | What It Does | How We Use It |
|-----|-------------|---------------|
| Location Verification | Confirms device is at reported location | Verify reporter is within 500m of incident |
| Number Verification | Validates phone is real | Prevent spoofed/coordinated attacks |
| Device Status | Checks device is active | Filter stale or resubmitted reports |
| Geofencing | Monitors zones | Detect emerging incident clusters |

The agent decides WHICH APIs to call based on context, not the user pressing buttons.

---

## Slide 5: AI Agent Design

**Built using the approved Resource and Tooling Guide:**

- **Validator Agent:** Decides which CAMARA APIs to call, runs them, calculates trust score
- **Classifier Agent:** Uses Groq LLM to categorize incidents by type, severity, sector
- **Anomaly Detector:** Statistical analysis + LLM pattern recognition for cluster detection

Built with **CrewAI** (approved framework) with three defined agent roles.

The agent reasoning trace is visible on screen during the demo. Judges can see the thinking.

---

## Slide 6: Technical Architecture



- Backend: FastAPI (Python)
- AI: CrewAI + Groq Llama 3.3 70B (free tier)
- DB: Supabase (PostgreSQL)
- Frontend: Next.js on Vercel
- Network: Nokia Network-as-Code CAMARA APIs

---

## Slide 7: Dashboard

**Real-time command center:**

- 4 KPI cards with live metrics and count-up animations
- Severity breakdown (critical, high, medium, low)
- Incident type distribution with animated bars
- Recent incident feed with validation status
- Floating navigation with colorful tabs
- Dark futuristic theme with glassmorphism and animated gradients

---

## Slide 8: Business Model

**B2B SaaS for municipalities and enterprises:**

| Tier | Price | Includes |
|------|-------|----------|
| Free | /usr/bin/bash/month | 100 incidents, 1 city zone, dashboard |
| Pro | 9/month | 1,000 incidents, 10 zones, Telegram alerts |
| Enterprise | 99/month | Unlimited, custom integrations, SLA |

**Revenue potential:**
- UAE: 7 emirates with municipalities and police
- 14+ MENA countries with smart city programs
- Enterprise: construction, utilities, transport, events

---

## Slide 9: Demo

**3-minute live walkthrough:**

1. Submit incident report via web form
2. CAMARA APIs validate in real-time (Location, Number, Device)
3. AI agent classifies and scores
4. Dashboard updates with new incident
5. Telegram notification received
6. Agent reasoning trace visible on screen

---

## Slide 10: Impact and Why We Win

**Why SENTINEL wins:**

- 3+ CAMARA APIs orchestrated by multi-agent AI, not just 1 API on a button
- Multilingual: Arabic, English, and Arabizi (unique to MENA)
- Anomaly detection finds clusters before anyone reports them
- Production-ready: real dashboard, real database, real alerts
- Built by someone who already shipped a working AI product
- Clear monetization path
- API-first design for easy adoption

**Impact:**
- Faster emergency response
- Less resource waste
- Works across all MENA languages
- Scalable to any city
