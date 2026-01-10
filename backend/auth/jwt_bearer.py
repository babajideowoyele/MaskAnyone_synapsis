"""
JWT Bearer authentication for MaskAnyone API.

SECURITY NOTES:
- Tokens MUST be passed via Authorization header only (not query params)
- Local mode bypasses auth for development only - never use in production
"""
import logging
from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer
from jose import jwt, JWTError, ExpiredSignatureError

from config import AUTH_TOKEN_ISSUER, AUTH_TOKEN_AUDIENCE, AUTH_ALGORITHM, AUTH_PUBLIC_KEY, MASK_ANYONE_PLATFORM_MODE

logger = logging.getLogger(__name__)


class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        # In local mode there is no login and authentication, so we just fake a logged-in user
        # WARNING: Never deploy with MASK_ANYONE_PLATFORM_MODE="local" in production
        if MASK_ANYONE_PLATFORM_MODE == "local":
            logger.warning("Running in local mode - authentication bypassed")
            return {"sub": "00000000-0000-0000-0000-000000000000"}

        authorization: str = request.headers.get("Authorization")

        if not authorization:
            raise HTTPException(
                status_code=401,
                detail="Missing Authorization header",
                headers={"WWW-Authenticate": "Bearer"}
            )

        try:
            scheme, credentials = authorization.split()
            if scheme.lower() != "bearer":
                raise HTTPException(
                    status_code=401,
                    detail="Invalid authentication scheme. Use 'Bearer <token>'",
                    headers={"WWW-Authenticate": "Bearer"}
                )
            token = credentials
        except ValueError:
            raise HTTPException(
                status_code=401,
                detail="Invalid authorization header format",
                headers={"WWW-Authenticate": "Bearer"}
            )

        return self.verify_jwt(token)

    def verify_jwt(self, jwtoken: str) -> dict:
        """
        Verify and decode a JWT token.

        Args:
            jwtoken: The JWT token string

        Returns:
            dict: The decoded token payload

        Raises:
            HTTPException: If token is invalid or expired
        """
        try:
            payload = jwt.decode(
                jwtoken,
                AUTH_PUBLIC_KEY,
                algorithms=[AUTH_ALGORITHM],
                issuer=AUTH_TOKEN_ISSUER,
                audience=AUTH_TOKEN_AUDIENCE
            )
            return payload
        except ExpiredSignatureError:
            logger.info("Token expired for request")
            raise HTTPException(
                status_code=401,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"}
            )
        except JWTError as ex:
            logger.warning(f"JWT verification failed: {type(ex).__name__}")
            raise HTTPException(
                status_code=401,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"}
            )
