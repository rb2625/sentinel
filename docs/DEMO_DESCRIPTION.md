# SENTINEL Demo Description

## 3-Minute Demo Walkthrough

### Minute 1: Submit + Validate
1. Open SENTINEL dashboard at localhost:3000
2. Submit an incident report: "Car accident on Sheikh Zayed Road near Mall of the Emirates"
3. Enter phone number +971501234567, coordinates 25.2048, 55.2708
4. SENTINEL calls Location Verification (reporter is 120m from incident - verified)
5. Number Verification confirms the phone is real (verified)
6. Device Status confirms the device is active (verified)
7. Trust score: 1.0 (all three verified)

### Minute 2: AI Agent Classifies
8. The AI agent (Groq Llama 3.3 70B) classifies: car_accident, severity HIGH, sector "transport"
9. Summary: "Multi-vehicle collision on Sheikh Zayed Road near Mall of the Emirates"
10. Anomaly detector checks recent reports for clusters
11. The agent's reasoning trace is shown on screen (judges can see the thinking)

### Minute 3: Dashboard + Alerts
12. Dashboard updates in real-time: KPIs increment, incident appears in feed
13. Severity badge shows HIGH in amber
14. Telegram alert sent to the operator's phone
15. Map shows the incident location (when implemented)

## API Usage Synopsis

Location Verification: Called with phone + coordinates. Returns verified/distance/confidence.
Number Verification: Called with phone. Returns verified/subscriber info.
Device Status: Called with phone. Returns active/roaming/carrier.
Geofencing: Called with phone + zone. Returns inside/outside.

The agent decides which to call based on context. For example, if Location Verification fails, it still runs Number and Device checks to build partial trust.

## Commercial Value

- Dubai Police handles 50,000+ daily calls, many duplicates/false
- Municipalities waste resources on fake reports
- Platform is B2B SaaS with clear monetization
- Works across Arabic, English, and Arabizi (unique differentiator)
