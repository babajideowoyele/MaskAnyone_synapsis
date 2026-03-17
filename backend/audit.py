"""Structured audit logging for data access and modification events."""

import json
import logging
from datetime import datetime, timezone


class AuditFormatter(logging.Formatter):
    """Outputs log records as single-line JSON for machine-readable audit trails."""

    def format(self, record: logging.LogRecord) -> str:
        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        # Merge extra audit fields if present
        for key in ("user_id", "action", "resource_type", "resource_id"):
            if hasattr(record, key):
                entry[key] = getattr(record, key)
        return json.dumps(entry)


# Singleton audit logger — configure once at import time
audit_logger = logging.getLogger("audit")
audit_logger.setLevel(logging.INFO)
audit_logger.propagate = False

_handler = logging.StreamHandler()
_handler.setFormatter(AuditFormatter())
audit_logger.addHandler(_handler)


def log_data_access(
    user_id: str,
    action: str,
    resource_type: str,
    resource_id: str,
) -> None:
    """Log a data access or modification event to the audit trail.

    Args:
        user_id: Authenticated user or worker identifier.
        action: What happened (e.g. "upload", "download", "delete", "stream", "create").
        resource_type: Kind of resource (e.g. "video", "result", "job").
        resource_id: Unique identifier of the affected resource.
    """
    audit_logger.info(
        "%s %s %s/%s",
        user_id,
        action,
        resource_type,
        resource_id,
        extra={
            "user_id": user_id,
            "action": action,
            "resource_type": resource_type,
            "resource_id": resource_id,
        },
    )
