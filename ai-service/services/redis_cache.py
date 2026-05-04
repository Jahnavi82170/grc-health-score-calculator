"""
Redis AI Cache — AI Developer 2 (Jahnavi)
SHA256 key hashing, 15-minute TTL.
Graceful fallback when Redis is unavailable.
"""

import os
import json
import hashlib
import logging
import redis

logger = logging.getLogger(__name__)

# Default TTL: 15 minutes (900 seconds)
CACHE_TTL = 900


class RedisCache:
    """Redis-backed cache for AI responses with SHA256 key hashing."""

    def __init__(self):
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        try:
            self.client = redis.from_url(redis_url, decode_responses=True)
            self.client.ping()
            self.available = True
            logger.info("Redis cache connected: %s", redis_url)
        except (redis.ConnectionError, redis.TimeoutError) as e:
            logger.warning("Redis unavailable, caching disabled: %s", str(e))
            self.client = None
            self.available = False

    @staticmethod
    def _make_key(endpoint: str, data: dict) -> str:
        """Generate SHA256 cache key from endpoint + serialised input data."""
        raw = f"{endpoint}:{json.dumps(data, sort_keys=True)}"
        return f"ai_cache:{hashlib.sha256(raw.encode()).hexdigest()}"

    def get(self, endpoint: str, data: dict) -> dict | None:
        """
        Retrieve cached response for the given endpoint and input data.
        Returns None on cache miss or if Redis is unavailable.
        """
        if not self.available:
            return None
        try:
            key = self._make_key(endpoint, data)
            cached = self.client.get(key)
            if cached:
                logger.info("Cache HIT: %s", key[:40])
                return json.loads(cached)
            logger.debug("Cache MISS: %s", key[:40])
            return None
        except Exception as e:
            logger.warning("Redis GET error: %s", str(e))
            return None

    def set(self, endpoint: str, data: dict, response: dict) -> bool:
        """
        Cache a response with SHA256 key and 15-minute TTL.
        Returns True on success, False on failure.
        """
        if not self.available:
            return False
        try:
            key = self._make_key(endpoint, data)
            self.client.setex(key, CACHE_TTL, json.dumps(response))
            logger.info("Cache SET: %s (TTL=%ds)", key[:40], CACHE_TTL)
            return True
        except Exception as e:
            logger.warning("Redis SET error: %s", str(e))
            return False
