"""mesh3d microservice: ANNY 3D body model fitting.

Receives 2D keypoints from MaskAnyone's pose estimation pipeline
and returns fitted 3D mesh data (projected vertices + faces).
"""

from __future__ import annotations

import io
import json
import logging
import pickle

from fastapi import FastAPI, APIRouter, Form, Response

from src.fitting import ANNYFitter, FittingConfig

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="MaskAnyone mesh3d service")

router = APIRouter(prefix="/mesh3d")

# Initialize fitter at startup (loads ANNY model once)
fitter: ANNYFitter | None = None


@app.on_event("startup")
def startup() -> None:
    global fitter
    config = FittingConfig()
    fitter = ANNYFitter(config)
    logger.info("mesh3d service ready")


@router.post("/fit-mesh")
async def fit_mesh(
    keypoints: str = Form(...),
    options: str = Form(...),
) -> Response:
    """Fit ANNY model to 2D keypoint sequence.

    Args:
        keypoints: JSON string — list of per-frame keypoint lists.
            Each frame is a list of [x, y] or [x, y, confidence], or null.
        options: JSON string — {
            "pose_format": "mp_pose" | "openpose" | ...,
            "frame_width": int,
            "frame_height": int
        }

    Returns:
        Pickle-serialized list of per-frame dicts or None.
        Each dict has: vertices_2d, faces, params.
    """
    keypoints_data = json.loads(keypoints)
    options_data = json.loads(options)

    pose_format = options_data.get("pose_format", "mp_pose")
    frame_width = options_data.get("frame_width", 1920)
    frame_height = options_data.get("frame_height", 1080)

    mesh_data = fitter.fit_sequence(
        keypoints_sequence=keypoints_data,
        pose_format=pose_format,
        frame_width=frame_width,
        frame_height=frame_height,
    )

    buffer = io.BytesIO()
    pickle.dump(mesh_data, buffer)
    buffer.seek(0)

    return Response(buffer.getvalue(), media_type="application/octet-stream")


@router.get("/health")
async def health() -> dict:
    return {"status": "ok", "model_loaded": fitter is not None}


app.include_router(router)
