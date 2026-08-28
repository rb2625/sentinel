# SENTINEL

**Real-Time Urban Incident Detection with Network Intelligence**

[![GSMA MENA Ignite Hackathon 2026](https://img.shields.io/badge/GSMA_MENA_Ignite-2026-blue)](https://hackerearth.com/hackathon/mena-ignite/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Theme 2](https://img.shields.io/badge/Theme-2%20Smart%20Cities-orange)](https://hackerearth.com/hackathon/mena-ignite/)

SENTINEL validates citizen-reported emergencies using telecom network intelligence. When someone reports an incident through a web form, mobile app, or Telegram bot, an AI agent autonomously verifies the report using GSMA Open Gateway CAMARA APIs, classifies it, and dispatches a validated alert with a trust score.

## How It Works

```
Citizen Report --> Validator Agent --> Classifier Agent --> Anomaly Detector --> Validated Alert
                     |                    |                     |
               CAMARA APIs          Groq LLM              Cluster Analysis
          (Location, Device,       (Type, Severity,       (Geographic
           SIM Swap)                Sector)                Patterns)
```

1. **Validator Agent** autonomously calls CAMARA APIs (Location Verification, Number Verification, Device Status) based on report context
2. **Classifier Agent** categorizes the incident by type, severity, and sector using a multilingual LLM (Arabic, English, Arabizi)
3. **Anomaly Detector** finds geographic clusters and escalation patterns across multiple reports
4. Validated alerts with trust scores are dispatched to the dashboard and Telegram

## CAMARA APIs Used

| API | Purpose |
|-----|---------|
| Location Verification | Confirms reporter is physically near the incident |
| Number Verification | Validates phone number is real and not spoofed |
| Device Status | Checks if device is active and connected |
| Geofencing | Monitors high-risk zones for clustered activity |

## Tech Stack

- **Backend:** FastAPI (Python)
- **AI Agent Layer:** CrewAI-compatible architecture with Groq Llama 3.3 70B
- **Database:** Supabase (PostgreSQL)
- **Frontend:** Next.js on Vercel
- **Network APIs:** Nokia Network-as-Code CAMARA APIs
- **Alerts:** Telegram Bot API

## Quick Start

### 1. Run Schema in Supabase

Go to Supabase Dashboard > SQL Editor, paste and run `scripts/schema.sql`.

### 2. Backend

```bash
cd backend
python -m venv .venv
.venv/Scripts/activate  # Windows
pip install -r requirements.txt
cp ../.env.example ../.env  # Fill in your keys
uvicorn sentinel.main:app --reload
```

### 3. Dashboard

```bash
cd dashboard
npm install
npm run dev
```

### 4. Environment Variables

```
NOKIA_NAC_API_KEY=your_nokia_nac_api_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GROQ_API_KEY=your_groq_api_key
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

## Project Structure

```
sentinel/
  backend/
    sentinel/           # FastAPI app + CAMARA client
    agents/             # CrewAI-compatible agent framework
      pipeline.py       # Agent, Task, Crew, Tool abstractions
      classifier.py     # LLM-based incident classifier
    routers/            # API routes (incidents, validate, alerts)
  dashboard/
    app/                # Next.js pages (overview, validate, incidents, alerts, map, analytics)
    components/         # Reusable UI components
    lib/                # Supabase client
  scripts/
    schema.sql          # Database schema
  docs/                 # Submission documents
```

## License

MIT License - see [LICENSE](LICENSE)
