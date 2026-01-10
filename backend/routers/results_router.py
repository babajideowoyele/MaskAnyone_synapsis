"""
Results router - endpoints for accessing masking results and extracted data.

All endpoints require authentication and verify user ownership.
"""
import os
import logging
from io import StringIO
import csv

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse

from db.job_manager import JobManager
from db.db_connection import DBConnection
from db.result_blendshapes_manager import ResultBlendshapesManager
from db.result_mp_kinematics_manager import ResultMpKinematicsManager
from db.video_manager import VideoManager
from db.result_video_manager import ResultVideoManager
from auth.jwt_bearer import JWTBearer
from config import RESULT_BASE_PATH

logger = logging.getLogger(__name__)

db_connection = DBConnection()
job_manager = JobManager(db_connection)
result_blendshapes_manager = ResultBlendshapesManager(db_connection)
result_mp_kinematics_manager = ResultMpKinematicsManager(db_connection)
video_manager = VideoManager(db_connection)
result_video_manager = ResultVideoManager(db_connection)

router = APIRouter(
    prefix="/results",
)


def _verify_user_owns_result(result_video_id: str, user_id: str):
    """
    Verify that the user owns the result video.

    Raises:
        HTTPException: 404 if result not found, 403 if user doesn't own it
    """
    result_video = result_video_manager.get_result_video(result_video_id)
    if not result_video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Result not found"
        )
    video_manager.assert_user_has_video(result_video.video_id, user_id)


@router.post("/{result_video_id}/delete")
def delete_result(result_video_id: str, token_payload: dict = Depends(JWTBearer())):
    user_id = token_payload["sub"]

    result_video = result_video_manager.get_result_video(result_video_id)
    video_manager.assert_user_has_video(result_video.video_id, user_id)

    result_video_manager.delete_result_video(result_video_id)

    result_video_path = os.path.join(RESULT_BASE_PATH, result_video.video_id, result_video_id + ".mp4")
    if os.path.exists(result_video_path):
        os.remove(result_video_path)


@router.get("/{result_video_id}/blendshapes")
def get_blendshapes(result_video_id: str, token_payload: dict = Depends(JWTBearer())):
    """Get facial blendshape data for a result video."""
    user_id = token_payload["sub"]
    _verify_user_owns_result(result_video_id, user_id)

    try:
        result_blendshapes = (
            result_blendshapes_manager.fetch_result_blendshapes_entry_by_resvid_id(
                result_video_id
            )
        )
        if not result_blendshapes:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Blendshapes data not found for this result"
            )
        return result_blendshapes.data
    except HTTPException:
        raise
    except Exception as error:
        logger.error(f"Error fetching blendshapes for {result_video_id}: {error}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch blendshapes data"
        )


@router.get("/{result_video_id}/mp-kinematics")
def get_mp_kinematics(result_video_id: str, token_payload: dict = Depends(JWTBearer())):
    """Get MediaPipe kinematics data for a result video."""
    user_id = token_payload["sub"]
    _verify_user_owns_result(result_video_id, user_id)

    try:
        result_mp_kinematics = (
            result_mp_kinematics_manager.fetch_result_mp_kinematics_entry_by_resvid_id(
                result_video_id
            )
        )
        if not result_mp_kinematics:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Kinematics data not found for this result"
            )
        return result_mp_kinematics.data
    except HTTPException:
        raise
    except Exception as error:
        logger.error(f"Error fetching mp-kinematics for {result_video_id}: {error}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch kinematics data"
        )


@router.get("/{result_video_id}/mp-kinematics/csv")
async def get_mp_kinematics_csv(result_video_id: str, token_payload: dict = Depends(JWTBearer())):
    """Get MediaPipe kinematics data as CSV for a result video."""
    user_id = token_payload["sub"]
    _verify_user_owns_result(result_video_id, user_id)

    try:
        result_mp_kinematics = (
            result_mp_kinematics_manager.fetch_result_mp_kinematics_entry_by_resvid_id(
                result_video_id
            )
        )

        json_data = result_mp_kinematics.data
        max_landmarks = max(len(entry['data']['landmarks']) for entry in json_data)
        max_world_landmarks = max(len(entry['data']['world_landmarks']) for entry in json_data)

        columns = ['timestamp']
        for i in range(max_landmarks):
            columns += [f'landmark_{i}_x', f'landmark_{i}_y', f'landmark_{i}_z', f'landmark_{i}_presence', f'landmark_{i}_visibility']
        for i in range(max_world_landmarks):
            columns += [f'world_landmark_{i}_x', f'world_landmark_{i}_y', f'world_landmark_{i}_z', f'world_landmark_{i}_presence', f'world_landmark_{i}_visibility']

        def iterfile():
            # Simulate writing to a file, but write to a string buffer instead
            buffer = StringIO()
            writer = csv.writer(buffer)
            writer.writerow(columns)

            for entry in json_data:
                row = [entry['timestamp']]
                for lm in entry['data']['landmarks']:
                    row += [lm['x'], lm['y'], lm['z'], lm.get('presence', ''), lm.get('visibility', '')]
                row += [''] * (max_landmarks - len(entry['data']['landmarks'])) * 5
                for lm in entry['data']['world_landmarks']:
                    row += [lm['x'], lm['y'], lm['z'], lm.get('presence', ''), lm.get('visibility', '')]
                row += [''] * (max_world_landmarks - len(entry['data']['world_landmarks'])) * 5

                buffer.seek(0)
                yield buffer.getvalue()
                buffer.truncate(0)
                buffer.seek(0)
                writer.writerow(row)

            buffer.seek(0)
            yield buffer.getvalue()

        return StreamingResponse(
            iterfile(),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=kinematics_{result_video_id}.csv"}
        )
    except HTTPException:
        raise
    except Exception as error:
        logger.error(f"Error generating CSV for {result_video_id}: {error}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate CSV export"
        )
