# MaskAnyone Critical Code Review

**Date:** 2025-12-19
**Branch:** `code-review`
**Overall Assessment:** NOT PRODUCTION READY

---

## Executive Summary

This comprehensive review identified **190 issues** across security, architecture, code quality, performance, and DevOps. The codebase is a research prototype that requires significant hardening before production deployment.

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| Security | 3 | 5 | 11 | 4 | **23** |
| Architecture | 5 | 9 | 8 | 1 | **23** |
| Code Quality | 12 | 10 | 35 | 15 | **72** |
| Performance | 4 | 9 | 7 | 0 | **20** |
| DevOps | 17 | 20 | 12 | 3 | **52** |
| **TOTAL** | **41** | **53** | **73** | **23** | **190** |

---

## Top 10 Priorities

1. **Remove secrets from git** and rotate all credentials
2. **Add authentication** to worker and results endpoints
3. **Remove SSL private key** from repo, regenerate certs
4. **Implement connection pooling** in database layer
5. **Add database indexes** on frequently queried columns
6. **Implement tests** - currently at 0% coverage
7. **Add React ErrorBoundary** to prevent full app crashes
8. **Fix video memory loading** - stream instead of loading to RAM
9. **Add Docker health checks** and non-root users
10. **Set up monitoring** and centralized logging

---

## 1. Security Issues (23 Total)

### CRITICAL

#### 1.1 Missing Authentication on Worker Endpoints
- **File:** `backend/routers/worker_router.py`
- **Line:** 28 in `main.py` (no `Depends(JWTBearer())`)
- **Issue:** The `/_worker/*` router has NO authentication. Any external service can:
  - Fetch and manipulate jobs
  - Upload result videos
  - Access video files
  - Create jobs with arbitrary user IDs
- **Impact:** Complete bypass of authentication system
- **Fix:** Implement shared secret authentication or mutual TLS for worker-backend communication

#### 1.2 SSL Private Key Committed to Git
- **File:** `docker/nginx/ssl/server.key`
- **Commit:** d412a04
- **Issue:** SSL private key committed to repository
- **Impact:** Man-in-the-middle attacks possible if this key is used
- **Fix:**
  1. Revoke and regenerate all SSL certificates
  2. Add `*.key`, `*.pem` to `.gitignore`
  3. Never commit keys again

#### 1.3 Credentials Committed to Git
- **Files:** `app.env`, `docker-compose.yml`, `.env`
- **Issue:** Development credentials committed:
  ```
  POSTGRES_PASSWORD=dev
  KEYCLOAK_ADMIN_PASSWORD=dev
  PGADMIN_DEFAULT_PASSWORD=dev
  ```
- **Impact:** If used in production, complete system compromise
- **Fix:**
  1. Remove from git history (`git filter-branch` or BFG)
  2. Uncomment `.env` in `.gitignore` (currently commented out at line 125)
  3. Rotate all production credentials immediately

### HIGH

#### 1.4 Missing Auth on Results Endpoints
- **File:** `backend/routers/results_router.py`
- **Lines:** 42, 58, 73 (marked with `# @todo auth`)
- **Issue:** Three endpoints have no authentication:
  - `/results/{result_video_id}/blendshapes`
  - `/results/{result_video_id}/mp-kinematics`
  - `/results/{result_video_id}/mp-kinematics/{id}/csv`
- **Impact:** Anyone can access result data without authentication

#### 1.5 Hardcoded User ID
- **File:** `backend/routers/worker_router.py`
- **Line:** 67
- **Code:** `'dc2de8bb-60cd-4bf7-9574-d237a30bf96d'`
- **Issue:** Jobs created with hardcoded user ID instead of actual user

#### 1.6 Path Traversal Vulnerability
- **File:** `backend/routers/worker_router.py`
- **Lines:** 91, 104-110, 118
- **Issue:** Video IDs concatenated into file paths without validation
- **Code:**
  ```python
  video_path = os.path.join(VIDEOS_BASE_PATH, video_id + ".mp4")
  ```
- **Impact:** Attacker could use `video_id=../../etc/passwd` to access arbitrary files
- **Fix:** Validate video_id matches UUID format: `^[a-f0-9-]{36}$`

#### 1.7 JWT Token in Query Parameters
- **File:** `backend/auth/jwt_bearer.py`
- **Lines:** 29-31
- **Issue:** Accepts JWT via query params (logged in server logs, browser history)

### MEDIUM

- No CSRF protection
- No rate limiting on any endpoints
- Missing security headers in nginx (X-Frame-Options, CSP, HSTS)
- Insecure Direct Object References (IDOR) on some endpoints
- File uploads lack proper validation (magic bytes, file type)
- No file size limit enforcement on backend
- Weak local authentication bypass (hardcoded all-zeros UUID)
- Missing authorization checks on prompts endpoints

### LOW

- Error information disclosure in JWT error handling
- Insecure file permissions (files created without explicit mode)
- Generic exception handling hides security issues

---

## 2. Architecture Issues (23 Total)

### CRITICAL

#### 2.1 No Database Connection Pooling
- **File:** `backend/db/db_connection.py`
- **Lines:** 6-13
- **Issue:** Single connection per `DBConnection` instance, no pooling
- **Code:**
  ```python
  def __init__(self):
      self.__connection = psycopg2.connect(...)
  ```
- **Impact:**
  - Each router creates 7+ manager instances with dedicated connections
  - Will exhaust PostgreSQL connection limits under load
  - Connection overhead on every request
- **Fix:** Use `psycopg2.pool.SimpleConnectionPool` or SQLAlchemy

#### 2.2 Stateful Workers Prevent Scaling
- **File:** `worker/worker.py`
- **Lines:** 18-20
- **Issue:** Workers have identity (UUID), jobs assigned to specific workers
- **Impact:** If worker crashes, job is stuck; can't scale horizontally
- **Fix:** Use stateless workers with job claiming pattern

### HIGH

#### 2.3 God Class - VideoRouter
- **File:** `backend/routers/videos_router.py`
- **Size:** 452 lines, 38 endpoints
- **Responsibilities:** Video CRUD, uploads, downloads, results, previews, exports
- **Fix:** Split into VideosRouter, StreamRouter, ResultsRouter, ExportsRouter

#### 2.4 Polling-Based Job Queue
- **File:** `worker/processing/worker_process.py`
- **Line:** 15: `SLEEP_INTERVAL = 5`
- **Issue:** Workers poll every 5 seconds instead of event-driven
- **Impact:** Wastes resources, 5-second delay before job starts
- **Fix:** Use Celery with Redis/RabbitMQ, or PostgreSQL LISTEN/NOTIFY

#### 2.5 No Dependency Injection
- **Files:** All routers instantiate managers at module level
- **Impact:** Impossible to mock for testing, tight coupling
- **Fix:** Use FastAPI's dependency injection system

### MEDIUM

- Business logic embedded in routers (should be service layer)
- No API versioning (breaking changes break all clients)
- Inconsistent REST patterns (`POST /delete` instead of `DELETE`)
- Mixed async/sync code (blocks event loop)
- No circuit breakers or retries in inter-service communication
- Hardcoded service URLs in workers

---

## 3. Code Quality Issues (72 Total)

### CRITICAL

#### 3.1 Zero Test Coverage
- **Backend:** 0 test files
- **Worker:** 0 test files
- **Frontend:** 0 custom test files
- **Impact:** No safety net for changes, bugs ship to production
- **Fix:** Implement testing infrastructure immediately

#### 3.2 No React Error Boundary
- **File:** `frontend/src/App.tsx`
- **Issue:** No ErrorBoundary component anywhere in frontend
- **Impact:** Unhandled errors crash the entire application
- **Fix:** Add ErrorBoundary at app root and around key components

### HIGH

#### 3.3 Memory Leak in React Component
- **File:** `frontend/src/components/videos/BlendshapeCharacter.tsx`
- **Lines:** 191-203
- **Issue:** `setInterval` without cleanup (no return function in useEffect)
- **Impact:** Memory leak on component unmount

#### 3.4 17 TODO Comments with Security Implications
Key ones:
- `# @todo auth` - Missing authentication (3 occurrences)
- `# @todo must be users video` - Missing authorization (2 occurrences)
- `# @todo use reference job user id here` - Hardcoded user ID

#### 3.5 Swallowed Exceptions
- **File:** `backend/routers/results_router.py` (lines 52-53, 68-69)
- **File:** `backend/utils/video_compatibility_checker.py` (line 45)
- **Issue:** `except Exception:` catches all and returns None/empty
- **Impact:** Silent failures, debugging nightmare

### MEDIUM

- Long methods (sam2_pose_masker.py has 99-line method)
- Duplicate CSV generation code in videos_router.py and results_router.py
- Magic numbers throughout (e.g., `0.05`, `200_000_000`, `16`, `368`)
- 25+ print statements instead of proper logging
- Console.log statements in production React code
- Inconsistent coding styles (quotes, imports)
- No docstrings on most functions
- Deprecated dependencies (@mui/base, old glob/rimraf)

---

## 4. Performance Issues (20 Total)

### CRITICAL

#### 4.1 Missing Database Indexes
- **File:** `docker/postgres/docker-entrypoint-initdb.d/prototype.sql`
- **Issue:** No indexes on:
  - `jobs.status` (queried every 5 seconds by workers)
  - `jobs.user_id`, `jobs.video_id`
  - `videos.user_id`
  - `result_videos.video_id`, `result_videos.job_id`
- **Impact:** Full table scans on every query
- **Fix:** Add indexes:
  ```sql
  CREATE INDEX idx_jobs_status ON jobs(status);
  CREATE INDEX idx_jobs_user_id ON jobs(user_id);
  CREATE INDEX idx_videos_user_id ON videos(user_id);
  ```

#### 4.2 Loading Entire Videos into Memory
- **File:** `backend/routers/videos_router.py`
- **Line:** 170
- **Code:**
  ```python
  video_content = await request.body()  # Entire video in RAM
  ```
- **Impact:** For 1GB+ videos, causes OOM crashes
- **Fix:** Use streaming file uploads with chunked transfer

#### 4.3 Worker Reads Videos Multiple Times
- **File:** `worker/masking/sam2_pose_masker.py`
- **Issue:** Opens same video file 3 times (lines 67, 105, 281)
- **Fix:** Open once, reuse VideoCapture object

### HIGH

#### 4.4 No Pagination
- **File:** `backend/routers/jobs_router.py` (lines 15-21)
- **Issue:** Fetches ALL jobs without limit
- **Impact:** Unbounded result sets, memory grows with data
- **Fix:** Add `LIMIT/OFFSET` or cursor-based pagination

#### 4.5 N+1 Query Problem
- **File:** `backend/routers/videos_router.py` (lines 245-323)
- **Issue:** 4 separate queries for related data instead of JOIN
- **Fix:** Use JOIN query or batch loading

#### 4.6 Missing React Memoization
- **Issue:** Only 6 uses of `useMemo`/`useCallback` across entire frontend
- **Impact:** Unnecessary re-renders, poor performance
- **Fix:** Wrap callbacks in `useCallback`, computations in `useMemo`

### MEDIUM

- No response compression (gzip/brotli)
- No caching layer (Redis)
- MediaPipe using CPU delegate instead of GPU
- Frame-by-frame processing instead of batching
- Temp file cleanup only on success (disk leak on failures)
- No cache headers on API responses

---

## 5. DevOps Issues (52 Total)

### CRITICAL

#### 5.1 Containers Run as Root
- **Files:** All Dockerfiles
- **Issue:** No `USER` directive, all containers run as UID 0
- **Impact:** Container escape could compromise host
- **Fix:** Add non-root user:
  ```dockerfile
  RUN groupadd -r appuser && useradd -r -g appuser appuser
  USER appuser
  ```

#### 5.2 No Health Checks
- **File:** `docker-compose.yml`
- **Issue:** No health checks defined on any service
- **Impact:** Cannot use health-based dependencies, no auto-recovery
- **Fix:**
  ```yaml
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
    interval: 30s
    timeout: 3s
    retries: 3
  ```

#### 5.3 Exposed Internal Ports
- **File:** `docker-compose.yml`
- **Lines:** 36, 61
- **Issue:** pgadmin (5433) and keycloak (8080) exposed directly
- **Impact:** Admin interfaces accessible, bypasses nginx
- **Fix:** Remove port mappings, access via nginx proxy or SSH tunnel

#### 5.4 No Backup Strategy
- **Issue:** No automated backups for PostgreSQL or data volumes
- **Impact:** Data loss risk, no disaster recovery
- **Fix:** Implement pg_dump automation and volume backup solution

#### 5.5 No Monitoring or Logging
- **Issue:** No Prometheus, Grafana, or centralized logging
- **Impact:** Blind to issues, no performance visibility, no audit trail
- **Fix:** Add Prometheus + Grafana stack, configure log aggregation

### HIGH

#### 5.6 Missing .dockerignore
- **Issue:** No .dockerignore files anywhere
- **Impact:** Large build context, slow builds, secrets potentially copied
- **Fix:** Create .dockerignore with `.git`, `node_modules`, `__pycache__`, `.env`

#### 5.7 No Resource Limits
- **File:** `docker-compose.yml`
- **Issue:** No CPU or memory limits on containers
- **Impact:** One service can consume all host resources
- **Fix:**
  ```yaml
  deploy:
    resources:
      limits:
        cpus: '2.0'
        memory: 4G
  ```

#### 5.8 Unpinned Action Versions
- **Files:** `.github/workflows/*.yml`
- **Issue:** `uses: actions/checkout@master` instead of pinned version
- **Impact:** Non-deterministic builds, security risk
- **Fix:** Use `actions/checkout@v4`

#### 5.9 No Network Segmentation
- **File:** `docker-compose.yml`
- **Issue:** All services on default bridge network
- **Impact:** All services can communicate, no isolation
- **Fix:** Define separate networks for frontend, backend, database

### MEDIUM

- Development mode in main compose file (--reload, start-dev)
- No rolling update strategy
- No rate limiting in nginx
- Large base images (devel instead of runtime)
- Missing log rotation
- No PR testing workflow (only runs on release)
- Hardcoded keystore password in Keycloak Dockerfile

---

## Recommended Immediate Actions

### Day 1: Security Emergency
- [ ] Remove `.env` and `app.env` from git history
- [ ] Rotate all passwords and credentials
- [ ] Add `.env` to .gitignore (uncomment line 125)
- [ ] Remove SSL private key from repo

### Week 1: Critical Security
- [ ] Add authentication to worker endpoints
- [ ] Add authentication to results endpoints
- [ ] Implement UUID validation for path traversal prevention
- [ ] Add non-root users to all Dockerfiles
- [ ] Add health checks to docker-compose

### Week 2: Stability
- [ ] Implement database connection pooling
- [ ] Add database indexes
- [ ] Add React ErrorBoundary
- [ ] Fix memory leak in BlendshapeCharacter
- [ ] Set up basic test infrastructure

### Week 3: Observability
- [ ] Deploy Prometheus + Grafana
- [ ] Set up centralized logging
- [ ] Configure log rotation
- [ ] Add health endpoints to all services

### Week 4: Reliability
- [ ] Implement automated database backups
- [ ] Set up volume backup system
- [ ] Document restore procedures
- [ ] Add network segmentation

---

## Files with Most Issues

| File | Issues | Categories |
|------|--------|------------|
| `backend/routers/videos_router.py` | 15+ | Architecture, Performance, Security |
| `backend/routers/worker_router.py` | 10+ | Security, Architecture |
| `docker-compose.yml` | 12+ | DevOps, Security |
| `worker/masking/sam2_pose_masker.py` | 8+ | Performance, Code Quality |
| `backend/routers/results_router.py` | 6+ | Security, Code Quality |
| `frontend/src/components/videos/BlendshapeCharacter.tsx` | 5+ | Performance, Code Quality |

---

## Conclusion

This codebase has the bones of a functional video de-identification platform but requires significant work before production deployment. The most critical issues involve:

1. **Complete authentication bypass** via worker endpoints
2. **Secrets in git history** that must be rotated
3. **Zero test coverage** providing no safety net
4. **No monitoring or backups** for production operations

Estimated effort to address critical and high issues: **4-6 weeks** with a dedicated team.

---

*Generated by Claude Code on 2025-12-19*
