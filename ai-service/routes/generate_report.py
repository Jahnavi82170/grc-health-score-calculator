"""
POST /generate-report — AI Developer 2 (Jahnavi)
Generates a structured GRC health report.
Response keys: title, summary, overview, key_items, recommendations
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

report_bp = Blueprint('report', __name__)
groq_client = GroqClient()
cache = RedisCache()


def load_prompt():
    """Load the report prompt template from file."""
    prompt_path = os.path.join(
        os.path.dirname(__file__), '..', 'prompts', 'report_prompt.txt'
    )
    with open(prompt_path, 'r') as f:
        return f.read()


# Fallback report when Groq is unavailable
FALLBACK_REPORT = {
    "title": "GRC Health Assessment Report",
    "summary": "An automated health assessment could not be generated at "
               "this time. Please review the record data manually and "
               "consult with your compliance team.",
    "overview": "The AI analysis service is temporarily unavailable. This "
                "fallback report indicates that the system was unable to "
                "process the GRC record data through the language model. "
                "The record data has been received and validated, but a "
                "detailed analysis requires the AI service to be operational. "
                "Please retry the report generation or consult the compliance "
                "team for a manual assessment.",
    "key_items": [
        "AI analysis service temporarily unavailable",
        "Record data received and validated successfully",
        "Manual review recommended until service is restored"
    ],
    "recommendations": [
        "Retry report generation when AI service is available",
        "Perform manual compliance review of the submitted data",
        "Contact system administrator if the issue persists"
    ]
}


@report_bp.route('/generate-report', methods=['POST'])
def generate_report():
    """
    POST /generate-report
    Accepts GRC record data, returns structured AI-generated report.
    Response keys: title, summary, overview, key_items, recommendations
    """
    data = getattr(request, 'sanitised_data', None) or request.get_json()

    if not data:
        return jsonify({"error": "Invalid input"}), 400

    # Check cache first
    cached = cache.get("/generate-report", data)
    if cached:
        cached["cached"] = True
        return jsonify(cached), 200

    # Build prompt and call Groq
    prompt_template = load_prompt()
    prompt = prompt_template.replace('{input_data}', json.dumps(data))

    result = groq_client.call_groq(prompt, temperature=0.3, max_tokens=1500)

    # Handle fallback
    if result.get("is_fallback"):
        fallback = FALLBACK_REPORT.copy()
        fallback["is_fallback"] = True
        fallback["generated_at"] = datetime.now(timezone.utc).isoformat()
        return jsonify(fallback), 200

    # Validate and ensure all required keys
    report = {
        "title": result.get("title", "GRC Health Assessment Report"),
        "summary": result.get("summary", ""),
        "overview": result.get("overview", ""),
        "key_items": result.get("key_items", []),
        "recommendations": result.get("recommendations", []),
        "generated_at": datetime.now(timezone.utc).isoformat()
    }

    # Ensure key_items and recommendations are lists
    if not isinstance(report["key_items"], list):
        report["key_items"] = [str(report["key_items"])]
    if not isinstance(report["recommendations"], list):
        report["recommendations"] = [str(report["recommendations"])]

    # Cache successful response
    cache.set("/generate-report", data, report)

    return jsonify(report), 200
