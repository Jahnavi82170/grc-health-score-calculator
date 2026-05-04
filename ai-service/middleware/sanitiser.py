"""
Input Sanitisation Middleware — AI Developer 2 (Jahnavi)
Provides:
  - strip_html(text): removes all HTML tags
  - detect_prompt_injection(text): detects prompt injection patterns
  - sanitise_request(): Flask before_request hook
"""

import re
import logging
from flask import request, jsonify

logger = logging.getLogger(__name__)

# Maximum allowed input length (characters)
MAX_INPUT_LENGTH = 5000

# Prompt injection patterns (case-insensitive)
INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?previous\s+instructions",
    r"ignore\s+(all\s+)?prior\s+instructions",
    r"disregard\s+(all\s+)?previous",
    r"disregard\s+(all\s+)?prior",
    r"you\s+are\s+now\b",
    r"you\s+are\s+a\s+new\b",
    r"forget\s+(all\s+)?previous",
    r"forget\s+(all\s+)?prior",
    r"\bsystem\s*:",
    r"\bassistant\s*:",
    r"\bdo\s+not\s+follow\b",
    r"\boverride\b.*\binstructions\b",
    r"\bjailbreak\b",
    r"\bDAN\b",
    r"\bpretend\s+to\s+be\b",
    r"\bact\s+as\s+(if\s+)?(you\s+are\s+)?a?\b.*\bunrestricted\b",
    r"\brole\s*play\b.*\bunfiltered\b",
]

# Compiled patterns for performance
_compiled_patterns = [
    re.compile(p, re.IGNORECASE) for p in INJECTION_PATTERNS
]


def strip_html(text: str) -> str:
    """Remove all HTML tags from the input text."""
    if not isinstance(text, str):
        return str(text)
    return re.sub(r"<[^>]*>", "", text)


def detect_prompt_injection(text: str) -> bool:
    """
    Check text for prompt injection patterns.
    Returns True if injection is detected, False otherwise.
    """
    if not isinstance(text, str):
        return False
    for pattern in _compiled_patterns:
        if pattern.search(text):
            logger.warning("Prompt injection detected: matched pattern '%s' "
                           "in input: %.100s", pattern.pattern, text)
            return True
    return False


def _extract_all_text(obj) -> str:
    """Recursively extract all string values from a dict/list structure."""
    if isinstance(obj, str):
        return obj
    if isinstance(obj, dict):
        return " ".join(_extract_all_text(v) for v in obj.values())
    if isinstance(obj, (list, tuple)):
        return " ".join(_extract_all_text(item) for item in obj)
    return str(obj) if obj is not None else ""


def _sanitise_object(obj):
    """Recursively strip HTML from all string values in a dict/list."""
    if isinstance(obj, str):
        return strip_html(obj)
    if isinstance(obj, dict):
        return {k: _sanitise_object(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [_sanitise_object(item) for item in obj]
    return obj


def sanitise_request():
    """
    Flask before_request hook.
    Applied globally to all POST endpoints.
    - Skips GET requests (e.g. /health)
    - Rejects empty JSON payloads with 400
    - Rejects prompt injection attempts with 400
    - Rejects oversized input with 400
    - Strips HTML from all string fields
    """
    # Only sanitise POST requests with JSON bodies
    if request.method != "POST":
        return None

    # Skip non-JSON content types
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400

    data = request.get_json(silent=True)

    # Reject empty input
    if not data:
        return jsonify({"error": "Invalid input"}), 400

    # Extract all text for validation
    all_text = _extract_all_text(data)

    # Reject oversized input
    if len(all_text) > MAX_INPUT_LENGTH:
        logger.warning("Input too long: %d chars (max %d)",
                       len(all_text), MAX_INPUT_LENGTH)
        return jsonify({"error": "Invalid input"}), 400

    # Check for prompt injection
    if detect_prompt_injection(all_text):
        return jsonify({"error": "Invalid input"}), 400

    # Sanitise HTML from all string fields (mutate the request data)
    # Store sanitised data for use by route handlers
    request.sanitised_data = _sanitise_object(data)

    return None
