"""
Worker API authentication for internal worker endpoints.

Workers must provide the WORKER_API_KEY in the X-Worker-API-Key header.
In local mode, authentication is bypassed for development.
"""
import logging
from fastapi import Request, HTTPException, status

from config import WORKER_API_KEY, MASK_ANYONE_PLATFORM_MODE

logger = logging.getLogger(__name__)


async def verify_worker_api_key(request: Request):
    """
    Verify that the request contains a valid worker API key.

    In local mode, authentication is bypassed.
    In production mode, the X-Worker-API-Key header must match WORKER_API_KEY.

    Raises:
        HTTPException: 401 if API key is missing or invalid
        HTTPException: 500 if WORKER_API_KEY is not configured in production
    """
    # In local mode, bypass authentication
    if MASK_ANYONE_PLATFORM_MODE == "local":
        logger.debug("Worker auth bypassed in local mode")
        return True

    # In production, WORKER_API_KEY must be set
    if not WORKER_API_KEY:
        logger.error("WORKER_API_KEY not configured - rejecting worker request")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Worker API not configured"
        )

    # Check for API key in header
    provided_key = request.headers.get("X-Worker-API-Key")

    if not provided_key:
        logger.warning("Worker request missing API key")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing X-Worker-API-Key header"
        )

    # Constant-time comparison to prevent timing attacks
    if not _constant_time_compare(provided_key, WORKER_API_KEY):
        logger.warning("Worker request with invalid API key")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid worker API key"
        )

    return True


def _constant_time_compare(a: str, b: str) -> bool:
    """
    Compare two strings in constant time to prevent timing attacks.
    """
    if len(a) != len(b):
        return False
    result = 0
    for x, y in zip(a.encode(), b.encode()):
        result |= x ^ y
    return result == 0
