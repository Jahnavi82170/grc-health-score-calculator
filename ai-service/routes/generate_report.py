from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
import json
import os
from services.groq_client import GroqClient

generate_report_bp = Blueprint('generate_report', __name__)
groq_client = GroqClient()

def load_prompt():
    prompt_path = os.path.join(os.path.dirname(__file__), '../prompts/primary_prompt.txt')
    with open(prompt_path, 'r') as f:
        return f.read()

@generate_report_bp.route('/generate-report', methods=['POST'])
def generate_report():
    """
    Day 6 Task: POST /generate-report 
    Returns structured JSON with title, summary, overview, key items, recommendations.
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid input, JSON payload required"}), 400

    prompt_template = load_prompt()
    # Modify the prompt explicitly to ask for a full report format
    report_instruction = (
        "\nBased on the input data, generate a comprehensive structured report in JSON format "
        "with exactly these keys: 'title', 'summary', 'overview', 'key_items' (array of strings), "
        "and 'recommendations' (array of objects with 'action_type', 'description', 'priority').\n"
    )
    prompt = prompt_template.replace('{input_data}', json.dumps(data) + report_instruction)
    
    response_content = groq_client.generate_response(prompt, is_json=True)
    
    try:
        parsed_response = json.loads(response_content)
        parsed_response['generated_at'] = datetime.now(timezone.utc).isoformat()
        return jsonify(parsed_response), 200
    except Exception as e:
        return jsonify({
            "is_fallback": True, 
            "title": "Fallback Report",
            "summary": "AI generation failed. Please review manually.",
            "overview": "An error occurred while generating the report.",
            "key_items": [],
            "recommendations": []
        }), 500
