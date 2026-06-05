"""Rate Limiter - Token bucket rate limiting"""
import logging
import time
from typing import Dict, Tuple
from src.configs.app_config import settings

logger = logging.getLogger(__name__)

class RateLimiter:
    def __init__(self):
        self.buckets: Dict[str, Dict] = {}
        self.limits = {
            "standard": settings.RATE_LIMIT_STANDARD,
            "premium": settings.RATE_LIMIT_PREMIUM,
            "enterprise": settings.RATE_LIMIT_ENTERPRISE,
        }
    
    async def check_rate_limit(self, client_id: str, tier: str) -> Tuple[bool, int, int]:
        limit = self.limits.get(tier, self.limits["standard"])
        window = 3600  # 1 hour
        
        now = int(time.time())
        bucket_key = f"{client_id}:{tier}"
        
        if bucket_key not in self.buckets:
            self.buckets[bucket_key] = {"count": 0, "reset_time": now + window}
        
        bucket = self.buckets[bucket_key]
        
        if now >= bucket["reset_time"]:
            bucket["count"] = 0
            bucket["reset_time"] = now + window
        
        if bucket["count"] >= limit:
            remaining = 0
            reset_time = bucket["reset_time"]
            return False, remaining, reset_time
        
        bucket["count"] += 1
        remaining = limit - bucket["count"]
        reset_time = bucket["reset_time"]
        
        return True, remaining, reset_time
    
    def get_limit(self, tier: str) -> int:
        return self.limits.get(tier, self.limits["standard"])