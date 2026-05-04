import os
import time
import hashlib
import json
from flask import Flask, jsonify, request, make_response
from routes.describe import describe_bp
from routes.recommend import recommend_bp
from routes.generate_report import generate_report_bp
from dotenv import load_dotenv

import redis
from sentence_transformers import SentenceTransformer
import chromadb

load_dotenv()

app = Flask(__name__)

# Register Blueprints
app.register_blueprint(describe_bp)
app.register_blueprint(recommend_bp)
app.register_blueprint(generate_report_bp)

# Day 7: Redis Cache Setup
redis_host = os.environ.get('REDIS_HOST', 'localhost')
redis_port = int(os.environ.get('REDIS_PORT', 6379))
try:
    cache = redis.Redis(host=redis_host, port=redis_port, decode_responses=True)
    cache.ping()
    app.config['REDIS_AVAILABLE'] = True
except redis.ConnectionError:
    app.config['REDIS_AVAILABLE'] = False
    print("Warning: Redis is not available. Caching disabled.")

# Day 11: Pre-load sentence-transformers at startup
print("Loading sentence-transformers model...")
try:
    embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
    app.config['EMBEDDING_MODEL'] = embedding_model
    print("Model loaded successfully.")
except Exception as e:
    print(f"Failed to load sentence-transformers: {e}")

# Day 12: Seed ChromaDB
print("Initializing ChromaDB...")
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
    print("ChromaDB seeded successfully.")
except Exception as e:
    print(f"Failed to initialize ChromaDB: {e}")

uptime_start = time.time()

# Day 8: ZAP Fixes - Security Headers
@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['Content-Security-Policy'] = "default-src 'self'"
    return response

# Caching Middleware for AI routes
@app.before_request
def check_cache():
    if request.method == 'POST' and request.path in ['/describe', '/recommend', '/generate-report']:
        if app.config.get('REDIS_AVAILABLE'):
            data_str = request.get_data(as_text=True)
            if data_str:
                # Create SHA256 key
                key_hash = hashlib.sha256((request.path + data_str).encode('utf-8')).hexdigest()
                cached_response = cache.get(key_hash)
                if cached_response:
                    print("Cache hit for", request.path)
                    return make_response(jsonify(json.loads(cached_response)), 200)

@app.after_request
def set_cache(response):
    if request.method == 'POST' and request.path in ['/describe', '/recommend', '/generate-report'] and response.status_code == 200:
        if app.config.get('REDIS_AVAILABLE'):
            data_str = request.get_data(as_text=True)
            if data_str:
                key_hash = hashlib.sha256((request.path + data_str).encode('utf-8')).hexdigest()
                # 15 minutes TTL (900 seconds)
                cache.setex(key_hash, 900, response.get_data(as_text=True))
    return response

# Day 7: /health endpoint
@app.route('/health', methods=['GET'])
def health():
    uptime = time.time() - uptime_start
    return jsonify({
        "status": "healthy",
        "model": "llama-3.3-70b-versatile",
        "avg_response_time_ms": 1500, # Mocked or calculated metric
        "uptime_seconds": int(uptime),
        "redis_connected": app.config.get('REDIS_AVAILABLE', False)
    }), 200

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

