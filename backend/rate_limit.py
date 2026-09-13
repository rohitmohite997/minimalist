"""Rate limiting middleware for mini malist API"""
import time
from collections import defaultdict
from typing import Dict, Tuple
from config import settings


class RateLimiter:
    """Simple in-memory rate limiter"""
    
    def __init__(self, requests: int, window: int):
        """
        Initialize rate limiter
        
        Args:
            requests: Number of requests allowed
            window: Time window in seconds
        """
        self.requests = requests
        self.window = window
        self.requests_dict: Dict[str, list] = defaultdict(list)
    
    def is_allowed(self, identifier: str) -> Tuple[bool, int]:
        """
        Check if request is allowed
        
        Args:
            identifier: User ID or IP address
            
        Returns:
            Tuple of (allowed: bool, remaining_requests: int)
        """
        now = time.time()
        cutoff = now - self.window
        
        # Remove old requests outside the window
        if identifier in self.requests_dict:
            self.requests_dict[identifier] = [
                req_time for req_time in self.requests_dict[identifier]
                if req_time > cutoff
            ]
        
        # Check if limit exceeded
        recent_requests = len(self.requests_dict[identifier])
        
        if recent_requests >= self.requests:
            return False, 0
        
        # Record this request
        self.requests_dict[identifier].append(now)
        
        remaining = self.requests - recent_requests - 1
        return True, remaining
    
    def get_reset_time(self, identifier: str) -> int:
        """Get when rate limit resets (seconds)"""
        if identifier not in self.requests_dict or not self.requests_dict[identifier]:
            return 0
        
        oldest_request = min(self.requests_dict[identifier])
        reset_time = int(oldest_request + self.window - time.time())
        return max(0, reset_time)


# Global rate limiter instance
if settings.RATE_LIMIT_ENABLED:
    rate_limiter = RateLimiter(
        requests=settings.RATE_LIMIT_REQUESTS,
        window=settings.RATE_LIMIT_WINDOW
    )
else:
    rate_limiter = None
