import re
from fastapi import HTTPException


# UUID v4 pattern - allows standard UUID format with hyphens
UUID_PATTERN = re.compile(
    r'^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$',
    re.IGNORECASE
)


def validate_uuid(value: str, field_name: str = "id") -> str:
    """
    Validate that a string is a valid UUID format.

    This prevents path traversal attacks by ensuring IDs used in file paths
    only contain valid UUID characters (hex digits and hyphens).

    Args:
        value: The string to validate
        field_name: Name of the field for error messages

    Returns:
        The validated UUID string (lowercase)

    Raises:
        HTTPException: If the value is not a valid UUID
    """
    if not value:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required {field_name}"
        )

    if not UUID_PATTERN.match(value):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid {field_name} format. Expected UUID."
        )

    return value.lower()


def validate_video_id(video_id: str) -> str:
    """Validate a video ID is a proper UUID."""
    return validate_uuid(video_id, "video_id")


def validate_result_video_id(result_video_id: str) -> str:
    """Validate a result video ID is a proper UUID."""
    return validate_uuid(result_video_id, "result_video_id")


def validate_job_id(job_id: str) -> str:
    """Validate a job ID is a proper UUID."""
    return validate_uuid(job_id, "job_id")
