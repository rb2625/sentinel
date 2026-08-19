# SENTINEL
## Real-Time Urban Incident Detection with Network Intelligence

### GSMA MENA Ignite Hackathon 2026

---

## Team Details

**Team Name:** SENTINEL

**Team Members:**
Rabeeh (Solo Developer)

**Contact:**
GitHub: rb2625
Email: [your email]

---

## Integration Context

When citizens in MENA cities report emergencies, whether a car accident, flooding, fire, or infrastructure failure, authorities have no reliable way to verify the report before dispatching resources. They do not know if the reporter is actually at the scene, if the phone number is real, or if the report is a duplicate of something already called in. This wastes emergency resources on false or duplicate reports, delays responses to genuine incidents, and leaves cities vulnerable to coordinated misinformation.

SENTINEL solves this by using telecom network intelligence as a trust layer for every incoming incident report. Instead of treating each report at face value, an AI agent autonomously verifies the reporter location, phone number legitimacy, and device status using GSMA Open Gateway CAMARA APIs, then classifies the incident and dispatches a validated alert only when the evidence supports it.

---

## Theme Relevance

**Theme 2: Smart Cities, Urban Safety and Mega-Project Infrastructure**

MENA cities are investing heavily in smart city infrastructure. Dubai 2040, NEOM, Qatar 2030, and dozens of other giga-projects are building urban environments that need fast, reliable incident response. But the current workflow for handling citizen-reported emergencies is slow and unverified. SENTINEL directly addresses this gap by adding a network-intelligence-powered validation layer to urban incident response, making cities safer and more efficient without requiring citizens to install any special app.

---

## Project Type

AI agent-orchestrated urban safety platform using telecom network intelligence.

---

## GSMA Pillar

**Connectivity for Good**

SENTINEL uses mobile network connectivity as a safety infrastructure layer. By having an AI agent autonomously reason over Location Verification, Number Verification, and Device Status signals, the mobile network becomes a real-time trust anchor that helps cities respond faster and more accurately to emergencies.

---

## Solution Overview

SENTINEL is a smart city incident detection platform. When someone reports an incident through a web form, mobile app, or Telegram bot, the system does not just log it and wait. An AI agent immediately takes over:

1. **Validates the report** by calling CAMARA APIs. Location Verification confirms the reporter is within 500 meters of the reported incident. Number Verification confirms the phone number is legitimate and not spoofed. Device Status confirms the device is active and connected.

2. **Classifies the incident** using a multilingual LLM (Groq Llama 3.3 70B) that understands Arabic, English, and Arabizi. It assigns a type (car accident, flooding, fire, infrastructure, construction, utility, environmental), severity (critical, high, medium, low), and sector.

3. **Detects anomalies** by analyzing recent reports for clusters, escalation patterns, or sudden spikes in a geographic area.

4. **Dispatches validated alerts** to authorities via a real-time dashboard or Telegram notifications, with the trust score and agent reasoning attached.

The key difference from a simple alert system is that the AI agent decides which CAMARA APIs to call based on context, not the user pressing buttons. If Location Verification fails because the reporter is in a tunnel, the agent still runs Number and Device checks to build partial trust. If three reports come from the same area within 10 minutes, the anomaly detector escalates automatically.

---

## How It Helps Solve the Problem

- Collapses a multi-step manual verification process into a real-time, automated decision under 2 seconds
- Eliminates fake and duplicate reports before they reach emergency dispatch
- Works across Arabic, English, and Arabizi, covering the full linguistic landscape of the MENA region
- Requires no app installation from the reporter, works through existing communication channels
- Gives authorities a trust score and reasoning trace for every alert, not just a raw report

---

## Key Features and Benefits

- AI agent that autonomously decides which CAMARA APIs to call and in what sequence based on the report context
- Location Verification to confirm the reporter is physically near the incident
- Number Verification to prevent spoofed or fake reports
- Device Status to filter out stale or resubmitted reports from inactive devices
- Geofencing to monitor high-risk zones and detect emerging incident clusters
- Multilingual classification covering Arabic, English, and Arabizi
- Anomaly detection that finds patterns across multiple reports in the same area
- Explainable trust score with visible agent reasoning for every decision
- Real-time dashboard with KPIs, incident feed, severity breakdown, and alert management
- Telegram bot integration for instant alerts to field teams
- Graceful degradation with cached fallback responses when APIs or models are rate-limited
- API-first design so partner institutions can adopt it without replacing existing systems

---

## APIs and Technology

### APIs Used and How They Help

**Location Verification:** Confirms whether the reporter device is physically within a specified distance of the reported incident location. This is the primary trust signal. A report that claims an accident on Sheikh Zayed Road but comes from someone in Abu Dhabi gets flagged immediately.

**Number Verification:** Validates that the phone number used to report is real and belongs to the claimed carrier. This prevents coordinated fake reporting attacks where someone spoofs multiple numbers to flood the system with false emergencies.

**Device Status:** Checks whether the reporting device is active, connected, and not in airplane mode or switched off. Reports from inactive devices are likely old reports being resubmitted, not real-time incidents.

**Geofencing:** Creates virtual boundaries around high-risk zones (construction sites, flood-prone areas, major intersections). When multiple reports come from inside the same geofence zone, the agent knows to escalate rather than treat them as isolated incidents.

### Tech Stack and Frameworks

**Agent Orchestration:** CrewAI with three defined agent roles (Validator, Classifier, Anomaly Detector) handling the pipeline as a multi-step workflow.

**LLM:** Groq (Llama 3.3 70B, free tier) for fast incident classification and anomaly reasoning.

**Backend:** FastAPI (Python) for the API layer, handling incident submission, validation triggers, and alert dispatch.

**Database:** Supabase (PostgreSQL) for storing incidents, validations, classifications, alerts, and audit trails.

**Frontend:** Next.js on Vercel for the real-time command center dashboard.

**Data Source APIs:** CAMARA APIs (Location Verification, Number Verification, Device Status, Geofencing) via Nokia Network-as-Code.

**Notifications:** Telegram Bot API for instant alert delivery to field teams.

All components are chosen from free or freemium tiers so the full prototype can be built, demoed, and iterated on without any paid commitment during the hackathon.

---

## Innovation Highlights

- Treats CAMARA telecom signals as autonomous agent tools rather than user-triggered actions. The agent decides when and which APIs to call based on the report context, not a button press.
- Combines network verification with multilingual AI classification in a single pipeline. Most solutions use one or the other.
- Anomaly detection that monitors geographic clusters and escalation patterns across multiple reports, not just individual incidents.
- Visible reasoning trace showing why the agent approved, flagged, or escalated a case, which judges can see during the demo.
- Designed for graceful degradation with cached sandbox responses so live demos never fail on an API timeout.
- Built with a clear technical path from hackathon prototype to a pilot-ready, production-hardened service.

---

## Impact Metrics

- Reduction in false or unverified reports reaching emergency dispatch
- Average time from report submission to validated alert (target: under 2 seconds)
- Number of CAMARA API signals combined per validation decision (target: 3+)
- Percentage of incidents correctly classified by the AI agent
- Time for a new partner institution to integrate and go live with the agent
- Reduction in emergency resource waste from duplicate or fake reports

---

## Methodology and Architecture

### How the Agents Communicate

1. Citizen submits incident report via web form, app, or Telegram
2. Validator Agent receives the report and autonomously decides which CAMARA APIs to call based on available information (phone number, coordinates)
3. CAMARA APIs return location verification, number verification, and device status results
4. Classifier Agent takes the report content plus validation results and classifies the incident type, severity, and sector using the LLM
5. Anomaly Detector Agent checks the new report against recent reports in the same geographic area for clusters or escalation patterns
6. If the overall trust score passes the threshold, an alert is dispatched to the dashboard and Telegram

### Architecture Components

**Input Layer:** Web form or Telegram bot used by citizens to report incidents.

**Agent Layer:** CrewAI-based multi-agent system with Validator, Classifier, and Anomaly Detector roles.

**Verification Layer:** Middleware invoking CAMARA APIs (Location Verification, Number Verification, Device Status, Geofencing) via Nokia Network-as-Code.

**Classification Layer:** Groq LLM reasoning over combined report content and validation signals.

**Storage Layer:** Supabase PostgreSQL for incidents, validations, classifications, alerts, and audit trails.

**Dashboard Layer:** Next.js real-time command center showing KPIs, incident feed, severity breakdown, and alert management.

**Alerting Layer:** Telegram Bot API for instant notifications to field teams and authorities.

### Architecture Diagram

[Insert Lucidchart / Excalidraw link here]

---

## Monetization Strategy

**B2B SaaS for municipalities and enterprises:**

| Tier | Price | Includes |
|------|-------|----------|
| Free | /usr/bin/bash/month | 100 incidents, 1 city zone, dashboard only |
| Pro | 9/month | 1,000 incidents, 10 zones, Telegram alerts, API access |
| Enterprise | 99/month | Unlimited incidents, unlimited zones, custom integrations, SLA |

**Revenue potential:**
- UAE has 7 emirates, each with municipalities and police forces
- 14+ MENA countries with active smart city programs
- Enterprise clients: construction companies, utilities, transport authorities, event organizers
- The platform could expand to any city with mobile network coverage

---

## Why SENTINEL Wins

- Uses 3+ CAMARA APIs orchestrated by a multi-agent AI system, not just 1 API on a button press
- Multilingual AI handles Arabic, English, and Arabizi, which is unique to the MENA region and something most teams cannot do
- Anomaly detection finds emerging incident clusters before anyone reports them individually
- Production-ready architecture with a real dashboard, real database, and real alert delivery
- Built by a developer who already shipped a working AI product (BASR economic intelligence platform with 600+ classified signals)
- Clear monetization path that makes this a viable business, not just a hackathon project
- Designed API-first so partner institutions can adopt it incrementally

---

*This document is part of the GSMA MENA Ignite Hackathon 2026 submission.*
