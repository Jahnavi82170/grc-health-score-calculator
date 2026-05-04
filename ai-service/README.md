# AI Service (Tool-86 Health Score Calculator)

This is the Flask microservice responsible for generating AI insights for the GRC Health Score Calculator using Groq, Sentence-Transformers, and ChromaDB.

## Features
- `POST /describe` - Generates a description of health score factors.
- `POST /recommend` - Generates prioritized recommendations.
- `POST /generate-report` - Generates a structured JSON report.
- `GET /health` - Service health and uptime.
- Redis caching for optimized AI generation.
- ChromaDB for Retrieval-Augmented Generation (RAG).

## Setup
1. Create a virtual environment: `python -m venv venv`
2. Activate it: `source venv/bin/activate` (Linux/Mac) or `venv\Scripts\activate` (Windows)
3. Install dependencies: `pip install -r requirements.txt`
4. Setup `.env`: Copy `.env.example` to `.env` and provide your Groq API key.
5. Run the server: `python app.py`

## Docker
Run using Docker Compose from the project root:
```bash
docker-compose up --build
```
