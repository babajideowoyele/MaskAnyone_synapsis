"""
Worker router - internal endpoints for processing workers.

All endpoints require worker API key authentication via X-Worker-API-Key header.
In local mode, authentication is bypassed for development.
"""
import os
import uuid
import logging
import cv2
import json
from pathlib import Path

from fastapi import APIRouter, Request, Depends, HTTPException, status

from models import RunParams, MpKinematicsType, ResultDataType, UpdateJobProgressParams, RegisterWorkerParams
from db.job_manager import JobManager
from db.worker_manager import WorkerManager
from db.video_manager import VideoManager
from db.result_video_manager import ResultVideoManager
from db.result_mp_kinematics_manager import ResultMpKinematicsManager
from db.result_blendshapes_manager import ResultBlendshapesManager
from db.result_audio_files_manager import ResultAudioFilesManager
from db.result_extra_files_manager import ResultExtraFilesManager
from db.db_connection import DBConnection
from config import RESULT_BASE_PATH, VIDEOS_BASE_PATH, MAX_UPLOAD_SIZE_BYTES
from auth.worker_auth import verify_worker_api_key
from utils.request_utils import range_requests_response
from utils.video_utils import extract_video_info_from_capture

logger = logging.getLogger(__name__)

db_connection = DBConnection()
video_manager = VideoManager(db_connection)
result_video_manager = ResultVideoManager(db_connection)
result_mp_kinematics_manager = ResultMpKinematicsManager(db_connection)
result_blendshapes_manager = ResultBlendshapesManager(db_connection)
result_audio_files_manager = ResultAudioFilesManager(db_connection)
result_extra_files_manager = ResultExtraFilesManager(db_connection)
job_manager = JobManager(db_connection)
worker_manager = WorkerManager(db_connection)

router = APIRouter(
    prefix="/_worker/{worker_id}",
    dependencies=[Depends(verify_worker_api_key)]  # All routes require worker auth
)


@router.post("/register")
def register_worker(worker_id: str, params: RegisterWorkerParams):
    worker_manager.register_worker(worker_id, params.capabilities)


@router.post("/ping")
def ping_backend(worker_id: str):
    worker_manager.update_worker_activity(worker_id)


@router.get("/jobs/next")
def fetch_next_job(worker_id: str):
    job = job_manager.fetch_next_job()

    if job:
        worker_manager.set_worker_job(worker_id, job.id)
    else:
        worker_manager.update_worker_activity(worker_id)

    return {"job": job}


@router.post("/jobs/create/{job_type}")
def create_job(job_type: str, run_params: RunParams):
    job_manager.create_new_jobs(
        run_params.id,
        run_params.video_ids,
        run_params.result_video_id,
        run_params.run_data,
        job_type,
        'dc2de8bb-60cd-4bf7-9574-d237a30bf96d' # @todo use reference job user id here
    )


@router.post("/jobs/{job_id}/progress")
def update_job_progress(worker_id: str, job_id: str, params: UpdateJobProgressParams):
    worker_manager.update_worker_activity(worker_id)
    job_manager.update_job_progress(job_id, params.progress)


@router.post("/jobs/{job_id}/finish")
def finish_job(worker_id: str, job_id: str):
    job_manager.mark_job_as_finished(job_id)
    worker_manager.remove_worker_job(worker_id, job_id)


@router.post("/jobs/{job_id}/fail")
def fail_job(worker_id: str, job_id: str):
    job_manager.mark_job_as_failed(job_id)
    worker_manager.remove_worker_job(worker_id, job_id)


@router.get("/videos/{video_id}")
def get_video_stream(worker_id: str, video_id: str, request: Request):
    video_path = os.path.join(VIDEOS_BASE_PATH, video_id + ".mp4")

    return range_requests_response(
        request, file_path=video_path, content_type="video/mp4"
    )


@router.get("/jobs/{job_id}/status")
def get_job_status(worker_id: str, job_id: str):
    return {"status": job_manager.get_job_status(job_id)}


@router.get("/results/video/{job_id}")
def get_result_video_stream(worker_id: str, job_id: str, request: Request):
    result_video_id = job_manager.get_result_video_id(job_id)
    video_id = job_manager.get_video_id(job_id)
    video_path = os.path.join(RESULT_BASE_PATH, video_id, result_video_id + ".mp4")

    return range_requests_response(
        request, file_path=video_path, content_type="video/mp4"
    )


def _validate_path_component(component: str, name: str) -> str:
    """Validate that a path component doesn't contain path traversal attempts."""
    if not component or '..' in component or '/' in component or '\\' in component:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid {name}"
        )
    return component


@router.post("/videos/{video_id}/results/{result_video_id}")
async def upload_result_video(
    worker_id: str, video_id: str, result_video_id: str, request: Request
):
    """Upload a result video from a worker."""
    # Validate path components to prevent path traversal
    _validate_path_component(video_id, "video_id")
    _validate_path_component(result_video_id, "result_video_id")

    # Check content length
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size is {MAX_UPLOAD_SIZE_BYTES // (1024*1024)} MB"
        )

    result_dir = Path(RESULT_BASE_PATH) / video_id
    result_dir.mkdir(parents=True, exist_ok=True)

    video_path = result_dir / f"{result_video_id}.mp4"

    # Use context manager for safe file handling
    video_content = await request.body()

    # Double-check size after receiving body
    if len(video_content) > MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size is {MAX_UPLOAD_SIZE_BYTES // (1024*1024)} MB"
        )

    try:
        with open(video_path, "wb") as f:
            f.write(video_content)
    except IOError as e:
        logger.error(f"Failed to write result video: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save result video"
        )

    job = job_manager.fetch_job_by_result_video_id(result_video_id)

    capture = cv2.VideoCapture(video_path)
    video_info = extract_video_info_from_capture(video_path, capture)
    capture.release()

    result_video_manager.create_result_video(
        result_video_id, video_id, job.id, "Result", video_info
    )


@router.post("/videos/{video_id}/results/{result_video_id}/preview")
async def upload_result_video_preview_image(
    worker_id: str, video_id: str, result_video_id: str, request: Request
):
    """Upload a preview image for a result video."""
    # Validate path components
    _validate_path_component(video_id, "video_id")
    _validate_path_component(result_video_id, "result_video_id")

    result_dir = Path(RESULT_BASE_PATH) / video_id
    result_dir.mkdir(parents=True, exist_ok=True)

    image_path = result_dir / f"{result_video_id}.png"

    image_content = await request.body()

    # Limit preview image size to 50MB
    if len(image_content) > 50 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Preview image too large"
        )

    try:
        with open(image_path, "wb") as f:
            f.write(image_content)
    except IOError as e:
        logger.error(f"Failed to write preview image: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save preview image"
        )


@router.post("/videos/{video_id}/results/{result_video_id}/mp_kinematics/{type}")
async def upload_result_mp_kinematics(
    worker_id: str,
    video_id: str,
    result_video_id: str,
    type: MpKinematicsType,
    request: Request,
):
    job = job_manager.fetch_job_by_result_video_id(result_video_id)

    result_mp_kinematics_manager.create_result_mp_kinematics_entry(
        str(uuid.uuid4()), result_video_id, video_id, job.id, type, await request.json()
    )

@router.post("/videos/{video_id}/results/{result_video_id}/data/{data_type}")
async def upload_result_data(
    worker_id: str,
    video_id: str,
    result_video_id: str,
    data_type: ResultDataType,
    request: Request,
):
    job = job_manager.fetch_job_by_result_video_id(result_video_id)

    result_extra_files_manager.create_result_extra_files_entry(
        str(uuid.uuid4()),
        result_video_id,
        video_id,
        job.id,
        data_type,
        (json.dumps(await request.json()) if data_type == 'poses' else await request.body()),
    )
