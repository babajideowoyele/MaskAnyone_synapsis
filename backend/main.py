from fastapi import FastAPI, Depends

import routers.jobs_router as jobs_router
import routers.videos_router as videos_router
import routers.workers_router as workers_router
import routers.worker_router as worker_router
import routers.results_router as results_router
import routers.presets_router as presets_router
import routers.prompts_router as prompts_router
import routers.platform_router as platform_router
from auth.jwt_bearer import JWTBearer
from auth.api_key_bearer import WorkerAPIKeyBearer

app = FastAPI()

# /platform — unauthenticated (non-sensitive system info)
app.include_router(platform_router.router)

# /videos
app.include_router(videos_router.router, dependencies=[Depends(JWTBearer())])

# /jobs
app.include_router(jobs_router.router, dependencies=[Depends(JWTBearer())])

# /workers
app.include_router(workers_router.router, dependencies=[Depends(JWTBearer())])

# /_worker — authenticated via API key (internal service-to-service)
app.include_router(worker_router.router, dependencies=[Depends(WorkerAPIKeyBearer())])

# /results
app.include_router(results_router.router, dependencies=[Depends(JWTBearer())])

# /presets
app.include_router(presets_router.router, dependencies=[Depends(JWTBearer())])

# /prompts
app.include_router(prompts_router.router, dependencies=[Depends(JWTBearer())])
