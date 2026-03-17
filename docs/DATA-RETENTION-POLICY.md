# MaskAnyone Data Retention Policy

## Purpose

This document defines data retention rules for the MaskAnyone platform,
ensuring compliance with GDPR Art. 5(1)(c) (data minimization) and
Art. 5(1)(e) (storage limitation).

## Scope

Applies to all data stored within the MaskAnyone platform:

- Uploaded source videos
- Masking job records and metadata
- Result videos (anonymized outputs)
- Derived data: kinematics, blendshapes, audio files, extra files
- User presets

## Retention Periods

| Data type | Default retention | Rationale |
|-----------|-------------------|-----------|
| Source videos | 90 days | Contains identifiable personal data; retain only for processing and verification |
| Result videos | 180 days | Anonymized output; longer retention for researcher access |
| Job metadata | 180 days | Linked to results; needed for audit trail |
| Kinematics / blendshapes | 180 days | Derived data, no PII |
| Audio files | 90 days | May contain identifiable voice data |
| Presets | No automatic deletion | User configuration, no PII |
| Audit logs | 365 days | Required for compliance evidence |

Retention periods are configurable via the `RETENTION_DAYS` environment
variable (default: 90 for source data, 180 for anonymized output).

## Deletion Behavior

- **Cascade**: Deleting a source video cascades to all associated jobs,
  result videos, kinematics, blendshapes, audio files, and extra files.
  This is enforced at the database level via `ON DELETE CASCADE` foreign keys.
- **Manual deletion**: Users can delete their own videos and results at
  any time through the web interface. Deletion is immediate and permanent.
- **Automatic cleanup**: A scheduled cleanup job (to be implemented) will
  remove data exceeding the retention period. Until automated cleanup is
  deployed, administrators should run manual cleanup periodically.
- **File system**: When database records are deleted, corresponding files
  on disk (video files, preview images) are also removed by the application.

## Audit Trail

All data access and deletion events are recorded in structured JSON audit
logs (see `backend/audit.py`). Audit logs are retained separately from
the data they describe and have their own retention period (365 days).

## Responsibilities

- **Data controller**: The institution deploying MaskAnyone is responsible
  for setting appropriate retention periods for their use case.
- **Platform administrator**: Must configure retention periods and ensure
  the cleanup job runs.
- **Researchers**: Should download results within the retention window and
  delete source videos when no longer needed.

## Review

This policy should be reviewed and agreed upon with the Information
Security Officer (ISO) and Data Protection Officer (DPO) before
production deployment. The retention periods above are defaults and
should be adjusted based on institutional requirements.
