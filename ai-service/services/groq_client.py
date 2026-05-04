"""
GroqClient — AI Developer 2 (Jahnavi)
Uses Groq REST API directly via requests (not SDK).
Model: llama-3.3-70b-versatile
3-retry loop with exponential backoff on rate-limit or 5xx errors.
Returns fallback dict on ALL failures — NEVER raises uncaught exceptions.
"""

import os
import json
import time
import logging
import requests

logger = logging.getLogger(__name__)

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"


class GroqClient:
    """Client for Groq LLaMA-3.3-70b-versatile via REST API."""

    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY", "")
        self.model = "llama-3.3-70b-versatile"
        self._total_calls = 0
        self._total_response_time = 0.0

    @property
    def avg_response_time(self):
        """Average response time in seconds across all calls."""
        if self._total_calls == 0:
            return 0.0
        return round(self._total_response_time / self._total_calls, 3)

    def call_groq(self, prompt: str, temperature: float = 0.3,
                  max_tokens: int = 1000) -> dict:
        """
        Call Groq REST API with the given prompt.

        Args:
            prompt: The user prompt to send to the model.
            temperature: Sampling temperature (0.3 = factual, 0.7 = creative).
            max_tokens: Maximum tokens in the response.

        Returns:
            Parsed JSON dict from model response, or fallback dict on failure.
            Fallback: {"is_fallback": true, "error": "<error message>"}
        """
        if not self.api_key:
            logger.error("GROQ_API_KEY not set — returning fallback")
            return {"is_fallback": True, "error": "GROQ_API_KEY not configured"}

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": self.model,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": temperature,
            "max_tokens": max_tokens,
            "response_format": {"type": "json_object"}
        }

        # 3-retry loop with exponential backoff: 1s, 2s, 4s
        backoff_times = [1, 2, 4]

        for attempt in range(3):
            start_time = time.time()
            try:
                response = requests.post(
                    GROQ_API_URL,
                    headers=headers,
                    json=payload,
                    timeout=30
                )
                elapsed = time.time() - start_time
                self._total_calls += 1
                self._total_response_time += elapsed

                if response.status_code == 200:
                    data = response.json()
                    content = data["choices"][0]["message"]["content"]
                    try:
                        return json.loads(content)
                    except json.JSONDecodeError:
                        logger.warning("Groq returned non-JSON content, "
                                       "wrapping in dict")
                        return {"response": content}

                # Rate limit (429) or server error (5xx) — retry
                if response.status_code == 429 or response.status_code >= 500:
                    wait = backoff_times[attempt]
                    logger.warning(
                        "Groq API attempt %d/%d failed: HTTP %d — "
                        "retrying in %ds | endpoint: %s",
                        attempt + 1, 3, response.status_code, wait,
                        GROQ_API_URL
                    )
                    time.sleep(wait)
                    continue

                # Other client errors — do not retry
                error_msg = (f"Groq API HTTP {response.status_code}: "
                             f"{response.text[:200]}")
                logger.error(error_msg)
                return {"is_fallback": True, "error": error_msg}

            except requests.exceptions.Timeout:
                wait = backoff_times[attempt]
                logger.warning(
                    "Groq API attempt %d/%d timed out — retrying in %ds",
                    attempt + 1, 3, wait
                )
                time.sleep(wait)
                continue

            except requests.exceptions.ConnectionError as e:
                wait = backoff_times[attempt]
                logger.warning(
                    "Groq API attempt %d/%d connection error: %s — "
                    "retrying in %ds",
                    attempt + 1, 3, str(e)[:100], wait
                )
                time.sleep(wait)
                continue

            except Exception as e:
                logger.error("Groq API unexpected error: %s", str(e))
                return {"is_fallback": True, "error": str(e)}

        # All 3 retries exhausted
        logger.error("Groq API: all 3 retries exhausted — returning fallback")
        return {"is_fallback": True, "error": "All retries exhausted"}
