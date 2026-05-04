"""
POST /recommend — AI Developer 2 (Jahnavi)
Returns 3 recommendations as JSON array.
Each has: action_type, description, priority.
Uses Redis cache for repeated queries.
"""

from flask import Blueprint, request, jsonify
import json
import os
import logging

from services.groq_client import GroqClient
from services.redis_cache import RedisCache

logger = logging.getLogger(__name__)

recommend_bp = Blueprint('recommend', __name__)
groq_client = GroqClient()
cache = RedisCache()


def load_prompt():
    """Load the recommend prompt template from file."""
    prompt_path = os.path.join(
        os.path.dirname(__file__), '..', 'prompts', 'recommend_prompt.txt'
    )
    with open(prompt_path, 'r') as f:
        return f.read()


# Fallback recommendations when Groq is unavailable
FALLBACK_RECOMMENDATIONS = [
    {
        "action_type": "Process",
        "description": "Review and update risk assessment procedures to "
                       "ensure alignment with current regulatory requirements.",
        "priority": "High"
    },
    {
        "action_type": "Policy",
        "description": "Establish a regular compliance audit schedule with "
                       "documented findings and remediation tracking.",
        "priority": "Medium"
    },
    {
        "action_type": "Training",
        "description": "Implement quarterly compliance awareness training "
                       "for all staff members involved in GRC processes.",
        "priority": "Medium"
    }
]


@recommend_bp.route('/recommend', methods=['POST'])
def recommend():
    """
    POST /recommend
    Accepts GRC record data, returns 3 AI-generated recommendations.
    Response: list of 3 objects with action_type, description, priority.
    """
    data = getattr(request, 'sanitised_data', None) or request.get_json()

    if not data:
        return jsonify({"error": "Invalid input"}), 400

    # Check cache first
    cached = cache.get("/recommend", data)
    if cached:
        cached["cached"] = True
        return jsonify(cached), 200

    # Build prompt and call Groq
    prompt_template = load_prompt()
    prompt = prompt_template.replace('{input_data}', json.dumps(data))

    result = groq_client.call_groq(prompt, temperature=0.3, max_tokens=800)

    # Handle fallback
    if result.get("is_fallback"):
        response = {
            "is_fallback": True,
            "recommendations": FALLBACK_RECOMMENDATIONS
        }
        return jsonify(response), 200

    # Ensure recommendations array exists with correct structure
    recommendations = result.get("recommendations", [])
    if not isinstance(recommendations, list) or len(recommendations) == 0:
        # Try to extract from nested structure
        if isinstance(result, dict):
            for key, val in result.items():
                if isinstance(val, list) and len(val) > 0:
                    recommendations = val
                    break

    # Validate each recommendation has required keys
    valid_recs = []
    for rec in recommendations[:3]:
        if isinstance(rec, dict):
            valid_recs.append({
                "action_type": rec.get("action_type", "Process"),
                "description": rec.get("description", ""),
                "priority": rec.get("priority", "Medium")
            })

    # Pad to 3 if needed
    while len(valid_recs) < 3:
        valid_recs.append(FALLBACK_RECOMMENDATIONS[len(valid_recs)])

    response = {"recommendations": valid_recs[:3]}

    # Cache successful response
    cache.set("/recommend", data, response)

    return jsonify(response), 200
