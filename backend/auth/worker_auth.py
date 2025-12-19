import os
import secrets
from fastapi import Request, HTTPException, Depends
from fastapi.security import APIKeyHeader

# Shared secret for worker-to-backend authentication
# This should be set via environment variable in production
WORKER_API_KEY = os.getenv("WORKER_API_KEY", "")

# If no key is set, generate a warning (but don't fail in dev)
if not WORKER_API_KEY:
    import warnings
    warnings.warn(
        "WORKER_API_KEY environment variable not set. "
        "Worker endpoints are INSECURE. Set this in production!",
        RuntimeWarning
    )

api_key_header = APIKeyHeader(name="X-Worker-API-Key", auto_error=False)


async def verify_worker_api_key(
    request: Request,
    api_key: str = Depends(api_key_header)
) -> bool:
    """
    Verify that the request contains a valid worker API key.

    This provides authentication for internal worker-to-backend communication.
    The API key should be a strong, randomly generated secret shared between
    the backend and worker services.
    """
    # If no API key is configured, reject all requests in production
    # but allow in development (with warning already issued)
    if not WORKER_API_KEY:
        # Check if we're in a development/local mode
        platform_mode = os.getenv("MASK_ANYONE_PLATFORM_MODE", "server")
        if platform_mode == "local":
            return True
        raise HTTPException(
            status_code=500,
            detail="Worker authentication not configured. Set WORKER_API_KEY environment variable."
        )

    if not api_key:
        raise HTTPException(
            status_code=401,
            detail="Missing worker API key"
        )

    # Use constant-time comparison to prevent timing attacks
    if not secrets.compare_digest(api_key, WORKER_API_KEY):
        raise HTTPException(
            status_code=403,
            detail="Invalid worker API key"
        )

    return True


def generate_worker_api_key() -> str:
    """
    Generate a secure random API key for worker authentication.

    Use this to generate a new key:
        python -c "from auth.worker_auth import generate_worker_api_key; print(generate_worker_api_key())"
    """
    return secrets.token_urlsafe(32)
