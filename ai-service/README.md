# AI Service — Tool-86 Health Score Calculator

Flask-based AI microservice that provides GRC (Governance, Risk, and Compliance) analysis powered by Groq's LLaMA-3.3-70b-versatile model.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | Flask 3.x |
| AI Model | Groq LLaMA-3.3-70b-versatile |
| Cache | Redis 7 (SHA256 keys, 15-min TTL) |
| Rate Limiting | flask-limiter (30 req/min per IP) |
| Container | Docker (Python 3.11-slim) |
| Testing | pytest (8 unit tests, Groq mocked) |

## Getting Started

### Prerequisites
- Python 3.11+
- Redis 7 (optional — service works without it)
- Groq API key ([Get one at console.groq.com](https://console.groq.com))

### How to Get a Groq API Key
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up or log in with your account
3. Navigate to **API Keys** in the left sidebar
4. Click **Create API Key**
5. Copy the key (starts with `gsk_`)
6. Paste it into your `.env` file as `GROQ_API_KEY=gsk_your_key_here`

### Setup

```bash
# 1. Navigate to ai-service directory
cd ai-service

# 2. Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create .env file from example
copy .env.example .env
# Edit .env and add your real GROQ_API_KEY

# 5. Run the service
python app.py
```

The service starts on `http://localhost:5000`.

### Docker

```bash
# Build
docker build -t ai-service .

# Run
docker run -p 5000:5000 --env-file .env ai-service
```

### Docker Compose (full stack)

```bash
# From project root
docker-compose up
```

## Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `GROQ_API_KEY` | ✅ Yes | Groq API key (starts with gsk_) | — |
| `REDIS_URL` | No | Redis connection URL | `redis://localhost:6379/0` |
| `FLASK_ENV` | No | `development` or `production` | `production` |
| `PORT` | No | Flask server port | `5000` |

## API Reference

### GET /health

Returns service health status, model info, and performance metrics.

**Response:**
```json
{
  "status": "healthy",
  "model": "llama-3.3-70b-versatile",
  "avg_response_time": 1.234,
  "uptime": 3600.5,
  "version": "1.0.0"
}
```

### POST /describe

Generates an AI description of a GRC record's health posture.

**Request:**
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

**Response:**
```json
{
  "description": "The organisation demonstrates a moderate compliance posture with 75% of controls implemented...",
  "generated_at": "2026-04-20T10:30:00+00:00"
}
```

### POST /recommend

Returns 3 prioritised recommendations for improving the GRC health score.

**Request:** Same as `/describe`

**Response:**
```json
{
  "recommendations": [
    {
      "action_type": "Process",
      "description": "Prioritise closure of 8 open findings through a dedicated remediation sprint.",
      "priority": "High"
    },
    {
      "action_type": "Technical",
      "description": "Implement automated compliance monitoring for unimplemented controls.",
      "priority": "Medium"
    },
    {
      "action_type": "Training",
      "description": "Conduct quarterly security awareness sessions for all staff.",
      "priority": "Low"
    }
  ]
}
```

### POST /generate-report

Generates a comprehensive GRC health assessment report.

**Request:** Same as `/describe`

**Response:**
```json
{
  "title": "GRC Health Assessment Report",
  "summary": "Executive summary of the compliance posture...",
  "overview": "Detailed analysis paragraph...",
  "key_items": ["Finding 1", "Finding 2", "Finding 3"],
  "recommendations": ["Action 1", "Action 2", "Action 3"],
  "generated_at": "2026-04-20T10:30:00+00:00"
}
```

## Security

- **Input Sanitisation:** All POST requests pass through global middleware that strips HTML and detects prompt injection (17 patterns)
- **Rate Limiting:** 30 requests/minute per IP via flask-limiter
- **Security Headers:** X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, CSP, HSTS, Referrer-Policy
- **Fallback:** All Groq failures return `{"is_fallback": true}` — never HTTP 500
- **Secrets:** All API keys via `os.getenv()`, `.env` in `.gitignore`, zero secrets in repo

See [SECURITY.md](./SECURITY.md) for the full threat model and security test results.

## Testing

```bash
# Run all tests (from ai-service directory)
pytest tests/ -v

# Run specific test file
pytest tests/test_endpoints.py -v
pytest tests/test_sanitiser.py -v
pytest tests/test_security.py -v
```

All tests mock the Groq API — no real network calls are made during testing.

## Project Structure

```
ai-service/
├── app.py                  # Flask entry point
├── Dockerfile              # Container build file
├── requirements.txt        # Pinned dependencies
├── SECURITY.md             # Security documentation
├── README.md               # This file
├── middleware/
│   └── sanitiser.py        # Input sanitisation + injection detection
├── prompts/
│   ├── describe_prompt.txt # Prompt template for /describe
│   ├── recommend_prompt.txt# Prompt template for /recommend
│   └── report_prompt.txt   # Prompt template for /generate-report
├── routes/
│   ├── describe.py         # POST /describe endpoint
│   ├── recommend.py        # POST /recommend endpoint
│   └── generate_report.py  # POST /generate-report endpoint
├── services/
│   ├── groq_client.py      # Groq REST API client (3-retry backoff)
│   └── redis_cache.py      # Redis cache (SHA256, 15-min TTL)
└── tests/
    ├── test_endpoints.py   # 8 Demo Day pytest tests
    ├── test_sanitiser.py   # Sanitiser unit tests
    └── test_security.py    # Security test suite
```

## GitHub Repository

[https://github.com/tecsxpert/grc-health-score-calculator](https://github.com/tecsxpert/grc-health-score-calculator)
