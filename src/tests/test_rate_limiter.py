"""Unit tests for Rate Limiter"""
import pytest
from src.resources.rate_limiter import RateLimiter

class TestRateLimiter:
    @pytest.mark.asyncio
    async def test_rate_limit_standard(self):
        limiter = RateLimiter()
        client_id = "test-client"
        tier = "standard"
        is_allowed, remaining, reset_time = await limiter.check_rate_limit(client_id, tier)
        assert is_allowed is True
        assert remaining >= 0
        assert reset_time > 0
    
    @pytest.mark.asyncio
    async def test_get_limit(self):
        limiter = RateLimiter()
        assert limiter.get_limit("standard") == 1000
        assert limiter.get_limit("premium") == 10000
        assert limiter.get_limit("enterprise") == 100000