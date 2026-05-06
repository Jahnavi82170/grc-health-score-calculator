"""
Flask AI Service — Entry Point
AI Developer 1 & 2 — Tool-86 Health Score Calculator

Features:
  - flask-limiter: 30 requests/minute per IP
  - Global input sanitisation via before_request hook
  - Security headers via after_request hook
  - /health endpoint with model info, avg_response_time, uptime
  - 3 AI endpoints: /describe, /recommend, /generate-report
  - Redis cache
  - Sentence-transformers and ChromaDB
"""

import os
import time
import hashlib
import json
import logging
from flask import Flask, jsonify, request, make_response
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv

import redis
from sentence_transformers import SentenceTransformer
import chromadb

load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

# ─── App Initialisation ───────────────────────────────────────────────
app = Flask(__name__)

# ─── Rate Limiting: 30 requests/minute per IP ─────────────────────────
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["30 per minute"],
    storage_uri=os.getenv("REDIS_URL", "memory://"),
)

# ─── Track server start time for /health uptime ───────────────────────
SERVER_START_TIME = time.time()

# ─── Import and register blueprints ───────────────────────────────────
from routes.describe import describe_bp
from routes.recommend import recommend_bp
from routes.generate_report import report_bp

app.register_blueprint(describe_bp)
app.register_blueprint(recommend_bp)
app.register_blueprint(report_bp)

# ─── Redis Cache Setup ────────────────────────────────────────────────
redis_host = os.environ.get('REDIS_HOST', 'localhost')
redis_port = int(os.environ.get('REDIS_PORT', 6379))
try:
    cache = redis.Redis(host=redis_host, port=redis_port, decode_responses=True)
    cache.ping()
    app.config['REDIS_AVAILABLE'] = True
except redis.ConnectionError:
    app.config['REDIS_AVAILABLE'] = False
    logger.warning("Redis is not available. Caching disabled.")

# ─── Pre-load sentence-transformers at startup ────────────────────────
logger.info("Loading sentence-transformers model...")
try:
    embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
    app.config['EMBEDDING_MODEL'] = embedding_model
    logger.info("Model loaded successfully.")
except Exception as e:
    logger.error("Failed to load sentence-transformers: %s", e)

# ─── Seed ChromaDB ────────────────────────────────────────────────────
logger.info("Initializing ChromaDB...")
try:
    chroma_client = chromadb.Client()
    collection = chroma_client.get_or_create_collection(name="domain_knowledge")
    
    # Seed with domain knowledge documents
    documents = [
        "GRC stands for Governance, Risk, and Compliance.",
        "A high health score indicates lower risk and better compliance.",
        "Security headers are essential for mitigating XSS and clickjacking attacks.",
        "Data encryption at rest is a critical compliance requirement for GDPR."
    ]
    
    collection.add(
        documents=documents,
        ids=[f"doc_{i}" for i in range(len(documents))]
    )
    app.config['CHROMA_COLLECTION'] = collection
    logger.info("ChromaDB seeded successfully.")
except Exception as e:
    logger.error("Failed to initialize ChromaDB: %s", e)

# ─── Global Input Sanitisation (before_request hook) ──────────────────
from middleware.sanitiser import sanitise_request

app.before_request(sanitise_request)

# ─── Security Headers (after_request hook) ────────────────────────────
@app.after_request
def add_security_headers(response):
    """Add security headers to ALL Flask responses."""
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    response.headers["Strict-Transport-Security"] = (
        "max-age=31536000; includeSubDomains"
    )
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# ─── Health Endpoint ──────────────────────────────────────────────────
@app.route('/', methods=['GET'])
@app.route('/health', methods=['GET'])
def health():
    """
    GET /health
    Returns: model name, avg_response_time, uptime in seconds.
    Used for monitoring and Demo Day presentation.
    """
    from routes.describe import groq_client as describe_groq

    uptime_seconds = round(time.time() - SERVER_START_TIME, 2)

    return jsonify({
        "status": "healthy",
        "model": "llama-3.3-70b-versatile",
        "avg_response_time": describe_groq.avg_response_time,
        "uptime": uptime_seconds,
        "version": "1.0.0",
        "redis_connected": app.config.get('REDIS_AVAILABLE', False)
    }), 200

# ─── Error Handlers ──────────────────────────────────────────────────
@app.errorhandler(429)
def rate_limit_exceeded(e):
    """Custom response for rate limit exceeded."""
    return jsonify({
        "error": "Rate limit exceeded. Maximum 30 requests per minute.",
        "retry_after": "60 seconds"
    }), 429

@app.errorhandler(404)
def not_found(e):
    """Custom 404 response."""
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(e):
    """Custom 500 response — should rarely trigger due to fallbacks."""
    logger.error("Internal server error: %s", str(e))
    return jsonify({
        "error": "Internal server error",
        "is_fallback": True
    }), 500

# ─── Main ─────────────────────────────────────────────────────────────
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_ENV", "production") == "development"
    logger.info("Starting AI Service on port %d (debug=%s)", port, debug)
    app.run(host='0.0.0.0', port=port, debug=debug)
