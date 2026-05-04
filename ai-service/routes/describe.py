"""
POST /describe — AI Developer 2 (Jahnavi)
Validates input, loads prompt, calls Groq, returns JSON with generated_at.
Uses Redis cache for repeated queries.
"""

from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
import json
import os
import logging

from services.groq_client import GroqClient
from services.redis_cache import RedisCache

logger = logging.getLogger(__name__)

describe_bp = Blueprint('describe', __name__)
groq_client = GroqClient()
cache = RedisCache()


def load_prompt():
    """Load the describe prompt template from file."""
    prompt_path = os.path.join(
        os.path.dirname(__file__), '..', 'prompts', 'describe_prompt.txt'
    )
    with open(prompt_path, 'r') as f:
        return f.read()


@describe_bp.route('/describe', methods=['POST'])
def describe():
    """
    POST /describe
    Accepts GRC record data, returns AI-generated description with timestamp.
    Response keys: description, generated_at
    """
    # Use sanitised data from middleware (falls back to raw JSON)
    data = getattr(request, 'sanitised_data', None) or request.get_json()

    if not data:
        return jsonify({"error": "Invalid input"}), 400

    # Check cache first
    cached = cache.get("/describe", data)
    if cached:
        cached["cached"] = True
        return jsonify(cached), 200

    # Build prompt and call Groq
    prompt_template = load_prompt()
    prompt = prompt_template.replace('{input_data}', json.dumps(data))

    result = groq_client.call_groq(prompt, temperature=0.3, max_tokens=800)

    # Ensure required keys exist
    if "is_fallback" not in result:
        result.setdefault("description",
                          result.get("response", "Analysis unavailable"))

    result["generated_at"] = datetime.now(timezone.utc).isoformat()

    # Cache successful (non-fallback) responses
    if not result.get("is_fallback"):
        cache.set("/describe", data, result)

    return jsonify(result), 200
