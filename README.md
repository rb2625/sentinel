# SENTINEL - Real-Time Urban Incident Detection with Network Intelligence

**GSMA MENA Ignite Hackathon 2026 | Theme 2: Smart Cities, Urban Safety & Mega-Project Infrastructure**

---

SENTINEL is a smart city incident detection platform that validates real-time incident reports using telecom network intelligence (GSMA Open Gateway CAMARA APIs) and an AI agent layer. When someone reports a car accident, flooding, fire, or infrastructure damage in a MENA city, SENTINEL verifies the report is genuine before anyone responds.

## The Problem

Urban cities in the MENA region face a critical gap in incident response. When citizens report emergencies through apps, hotlines, or social media, authorities have no way to verify:
- Is the reporter physically at the incident location?
- Is the phone number real and not spoofed?
- Is this a duplicate of a report from 10 minutes ago?
- Is this genuinely urgent or just someone venting?

## The Solution

SENTINEL uses a network intelligence-powered AI agent to validate every incident report in under 2 seconds:

1. **Report arrives** (via app, web, Telegram, or API)
2. **AI Agent orchestrates CAMARA APIs:**
   - Location Verification confirms the reporter is within range
   - Number Verification confirms the phone number is legitimate
   - Device Status confirms the device is active and connected
   - Geofencing monitors high-risk zones for emerging patterns
3. **AI classifies** the incident (severity, sector, urgency) using multilingual NLP
4. **Anomaly detection** identifies emerging clusters
5. **Alerts dispatched** to relevant authorities via dashboard, Telegram, or webhook

## Architecture

```
                   +-----------------+
                   |   User Reports  |
                   | (App/Web/TG)   |
                   +--------+--------+
                            |
                   +--------v--------+
                   |   FastAPI        |
                   |   Backend        |
                   +--------+--------+
                            |
              +-------------+-------------+
              |                           |
     +--------v--------+      +---------v---------+
     |  AI Agent Layer  |      |  CAMARA API Client |
     |  (Groq LLM)     |      |  (Nokia NaC)       |
     |  Classify        |      |  Location Verify   |
     |  Severity        |      |  Number Verify     |
     |  Anomaly Detect  |      |  Device Status     |
     +--------+--------+      |  Geofencing        |
              |                +---------+---------+
              |                          |
     +--------v--------------------------v--------+
     |           Supabase (PostgreSQL)            |
     +----------------------+---------------------+
                            |
              +-------------+-------------+
              |                           |
     +--------v--------+      +---------v---------+
     |   Dashboard      |      |   Telegram Bot     |
     |   (Next.js)      |      |   Real-time alerts |
     +------------------+      +-------------------+
```

## CAMARA APIs Used

| API | Purpose |
|-----|---------|
| Location Verification | Confirm reporter is at incident location |
| Number Verification | Validate phone number is real |
| Device Status | Check device is active |
| Geofencing | Monitor high-risk zones |

## Tech Stack

- **Frontend:** Next.js + TypeScript + Tailwind CSS
- **Backend:** FastAPI (Python)
- **AI Layer:** Groq LLM (free tier) + custom classification
- **Database:** Supabase (PostgreSQL)
- **Network APIs:** Nokia Network-as-Code (CAMARA)
- **Alerts:** Telegram Bot API
- **CI/CD:** GitHub Actions

## Getting Started

```bash
# Clone
git clone https://github.com/rb2625/sentinel.git
cd sentinel

# Backend
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example ../.env
uvicorn sentinel.main:app --reload

# Dashboard
cd ../dashboard
npm install
npm run dev
```

## License

Apache 2.0 - see [LICENSE](LICENSE)
