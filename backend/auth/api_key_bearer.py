import os

from fastapi import Request, HTTPException


WORKER_API_KEY = os.environ.get("WORKER_API_KEY", "")


class WorkerAPIKeyBearer:
    """Validates X-Worker-API-Key header on internal worker endpoints."""

    async def __call__(self, request: Request):
        if not WORKER_API_KEY:
            raise HTTPException(
                status_code=500,
                detail="WORKER_API_KEY not configured on server.",
            )

        api_key = request.headers.get("X-Worker-API-Key")
        if not api_key or api_key != WORKER_API_KEY:
            raise HTTPException(status_code=403, detail="Invalid or missing worker API key.")
