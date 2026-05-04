# AI Summary Card — Tool-86 Health Score Calculator

> **Print 2 copies for Demo Day (9 May 2026)**

---

## AI Service Endpoints

### 1. POST /describe
**What it does:** Generates an AI-powered description of a GRC record's compliance and risk posture.

**Example Input:**
```json
{
  "risk_score": 72,
  "compliance_level": "Moderate",
  "category": "Information Security",
  "controls_implemented": 45,
  "controls_total": 60,
  "findings_open": 8
}
```

**Example Output:**
```json
{
  "description": "The organisation demonstrates a moderate compliance posture with 75% of controls implemented. Eight open findings require attention, particularly in the information security domain.",
  "generated_at": "2026-05-09T10:30:00+00:00"
}
```

---

### 2. POST /recommend
**What it does:** Returns 3 prioritised recommendations to improve the GRC health score.

**Example Input:** Same as /describe

**Example Output:**
```json
{
  "recommendations": [
    {"action_type": "Process", "description": "Address 8 open findings with a 30-day remediation sprint.", "priority": "High"},
    {"action_type": "Technical", "description": "Implement automated monitoring for 15 unimplemented controls.", "priority": "Medium"},
    {"action_type": "Training", "description": "Quarterly security awareness training for all staff.", "priority": "Low"}
  ]
}
```

---

### 3. POST /generate-report
**What it does:** Produces a comprehensive executive-level GRC health assessment report.

**Example Input:** Same as /describe

**Example Output:**
```json
{
  "title": "GRC Health Assessment Report",
  "summary": "Moderate risk posture with 75% control coverage...",
  "overview": "Detailed analysis of governance, risk, and compliance...",
  "key_items": ["75% control implementation", "8 open findings", "Risk score 72"],
  "recommendations": ["Close open findings", "Implement remaining controls", "Schedule next audit"]
}
```

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| **AI Framework** | Flask 3.x (Python) |
| **AI Model** | Groq LLaMA-3.3-70b-versatile |
| **Caching** | Redis 7 (SHA256 key, 15-min TTL) |
| **Rate Limiting** | flask-limiter (30 req/min) |
| **Security** | Input sanitisation, prompt injection detection, security headers |
| **Container** | Docker (Python 3.11-slim) |

## GitHub Repository

🔗 [github.com/tecsxpert/grc-health-score-calculator](https://github.com/tecsxpert/grc-health-score-calculator)

---

*Team Tool-86 | Sprint: 14 April – 9 May 2026 | AI Developer 2: Jahnavi*
