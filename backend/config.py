"""
MaskAnyone Backend Configuration

Environment variables:
- MASK_ANYONE_PLATFORM_MODE: "local" or "production"
- BACKEND_AUTH_PUBLIC_KEY: RSA public key for JWT verification
- BACKEND_AUTH_ISSUER: JWT issuer URL
- WORKER_API_KEY: Secret key for worker authentication (required in production)
- MAX_UPLOAD_SIZE_MB: Maximum upload file size in MB (default: 10000)
"""
import os

# File paths
RESULT_BASE_PATH = "/var/lib/maskanyone/data/results"
VIDEOS_BASE_PATH = "/var/lib/maskanyone/data/videos"
PRESETS_BASE_PATH = "/var/lib/maskanyone/data/presets"

# JWT Authentication
AUTH_TOKEN_ISSUER = os.getenv("BACKEND_AUTH_ISSUER", "https://localhost/auth/realms/maskanyone")
AUTH_TOKEN_AUDIENCE = "account"
AUTH_ALGORITHM = "RS256"
AUTH_PUBLIC_KEY = "-----BEGIN PUBLIC KEY-----\n" + os.environ.get('BACKEND_AUTH_PUBLIC_KEY', '') + "\n-----END PUBLIC KEY-----"

# Platform mode
MASK_ANYONE_PLATFORM_MODE = os.environ.get("MASK_ANYONE_PLATFORM_MODE", "local")

# Worker API authentication
# In production, this MUST be set to a strong random secret
WORKER_API_KEY = os.environ.get("WORKER_API_KEY", None)

# Upload limits
MAX_UPLOAD_SIZE_MB = int(os.environ.get("MAX_UPLOAD_SIZE_MB", "10000"))  # 10GB default
MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024
