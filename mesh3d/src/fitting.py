"""ANNY 3D body model fitting to 2D keypoint observations.

Optimizes ANNY pose and camera parameters to match 2D keypoints
from MediaPipe or OpenPose, using differentiable rendering.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass

import anny
import numpy as np
import torch
import torch.nn.functional as F

logger = logging.getLogger(__name__)

# ── MediaPipe Pose (33 landmarks) → ANNY bone indices ──────────────────────
# Only map landmarks that have clear ANNY bone correspondences.
# MediaPipe indices: https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker
MP_POSE_TO_ANNY: dict[int, int] = {
    0: 103,   # nose → head
    11: 48,   # left_shoulder → clavicle.L
    12: 74,   # right_shoulder → clavicle.R
    13: 52,   # left_elbow → lowerarm01.L
    14: 78,   # right_elbow → lowerarm01.R
    15: 54,   # left_wrist → wrist.L
    16: 80,   # right_wrist → wrist.R
    23: 2,    # left_hip → upperleg01.L
    24: 22,   # right_hip → upperleg01.R
    25: 4,    # left_knee → lowerleg01.L
    26: 24,   # right_knee → lowerleg01.R
    27: 6,    # left_ankle → foot.L
    28: 26,   # right_ankle → foot.R
}

# ── OpenPose BODY_25 → ANNY bone indices ───────────────────────────────────
# OpenPose indices: https://cmu-perceptual-computing-lab.github.io/openpose/web/html/doc/md_doc_02_output.html
OP_BODY25_TO_ANNY: dict[int, int] = {
    0: 103,   # Nose → head
    1: 100,   # Neck → neck01
    2: 48,    # RShoulder → clavicle.R (OpenPose mirrors)
    3: 78,    # RElbow → lowerarm01.R
    4: 80,    # RWrist → wrist.R
    5: 74,    # LShoulder → clavicle.L
    6: 52,    # LElbow → lowerarm01.L
    7: 54,    # LWrist → wrist.L
    8: 0,     # MidHip → root
    9: 22,    # RHip → upperleg01.R
    10: 24,   # RKnee → lowerleg01.R
    11: 26,   # RAnkle → foot.R
    12: 2,    # LHip → upperleg01.L
    13: 4,    # LKnee → lowerleg01.L
    14: 6,    # LAnkle → foot.L
}


@dataclass
class FittingConfig:
    """Configuration for the ANNY fitting loop."""

    num_iterations: int = 80
    learning_rate: float = 0.02
    temporal_weight: float = 0.05
    confidence_threshold: float = 0.3
    device: str = "cuda"


class ANNYFitter:
    """Fits ANNY 3D body model to 2D keypoint sequences.

    Uses weak-perspective projection and gradient-based optimization
    to find pose and camera parameters that best explain observed
    2D keypoints from MediaPipe or OpenPose.
    """

    def __init__(self, config: FittingConfig | None = None) -> None:
        self.config = config or FittingConfig()
        self.device = torch.device(
            self.config.device if torch.cuda.is_available() else "cpu"
        )
        logger.info("Creating ANNY model on %s", self.device)

        import warnings
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            self.model = anny.create_fullbody_model().float().to(self.device)

        # Pre-compute rest pose joint positions for initialization
        with torch.no_grad():
            identity_pose = (
                torch.eye(4, dtype=torch.float32, device=self.device)
                .unsqueeze(0)
                .unsqueeze(0)
                .expand(1, self.model.bone_count, 4, 4)
                .clone()
            )
            rest_output = self.model(
                pose_parameters=identity_pose, return_bone_ends=True
            )
            bone_poses = rest_output["bone_poses"][0]  # (163, 4, 4)
            self.rest_joints = bone_poses[:, :3, 3].clone()  # (163, 3)

        # Pre-compute triangle faces from quads
        quads = self.model.faces  # (13710, 4)
        tri1 = quads[:, [0, 1, 2]]
        tri2 = quads[:, [0, 2, 3]]
        self.triangle_faces = torch.cat([tri1, tri2], dim=0).cpu().numpy()

        logger.info(
            "ANNY ready: %d bones, %d vertices, %d triangles",
            self.model.bone_count,
            self.model.template_vertices.shape[0],
            self.triangle_faces.shape[0],
        )

    def _get_keypoint_mapping(
        self, pose_format: str
    ) -> dict[int, int]:
        """Return the keypoint index → ANNY bone index mapping."""
        if pose_format in ("mp_pose", "mediapipe"):
            return MP_POSE_TO_ANNY
        elif pose_format.startswith("openpose"):
            return OP_BODY25_TO_ANNY
        else:
            raise ValueError(f"Unknown pose format: {pose_format}")

    def _project_weak_perspective(
        self,
        joints_3d: torch.Tensor,
        scale: torch.Tensor,
        translation: torch.Tensor,
    ) -> torch.Tensor:
        """Weak-perspective projection: 2D = scale * XY + translation.

        Args:
            joints_3d: (N, 3) joint positions in 3D.
            scale: scalar scale factor.
            translation: (2,) translation in pixel space.

        Returns:
            (N, 2) projected 2D positions.
        """
        # ANNY uses X=right, Y=back, Z=up. Project XZ plane (frontal view).
        joints_2d = joints_3d[:, [0, 2]]  # X (horizontal), Z (vertical)
        # Flip Z so up maps to lower y in image coords
        joints_2d = joints_2d * torch.tensor(
            [1.0, -1.0], device=joints_2d.device
        )
        return scale * joints_2d + translation

    def fit_sequence(
        self,
        keypoints_sequence: list[list[list[float]] | None],
        pose_format: str,
        frame_width: int,
        frame_height: int,
    ) -> list[dict | None]:
        """Fit ANNY model to a sequence of 2D keypoint observations.

        Args:
            keypoints_sequence: Per-frame list of keypoints.
                Each keypoint is [x, y] or [x, y, confidence].
                None for frames with no detection.
            pose_format: 'mp_pose' or 'openpose' variant.
            frame_width: Video frame width in pixels.
            frame_height: Video frame height in pixels.

        Returns:
            Per-frame list of dicts with 'vertices_2d', 'faces',
            and 'params', or None for skipped frames.
        """
        mapping = self._get_keypoint_mapping(pose_format)
        kp_indices = sorted(mapping.keys())
        anny_indices = [mapping[k] for k in kp_indices]

        results: list[dict | None] = []
        prev_pose = None
        prev_camera = None

        for frame_idx, kps in enumerate(keypoints_sequence):
            if kps is None:
                results.append(None)
                continue

            result = self._fit_single_frame(
                kps,
                kp_indices,
                anny_indices,
                frame_width,
                frame_height,
                prev_pose,
                prev_camera,
            )

            if result is not None:
                prev_pose = result["_pose_params"]
                prev_camera = result["_camera_params"]
                # Remove internal tensors before serialization
                result.pop("_pose_params")
                result.pop("_camera_params")

            results.append(result)

            if frame_idx % 50 == 0:
                logger.info("Fitted frame %d / %d", frame_idx, len(keypoints_sequence))

        return results

    def _fit_single_frame(
        self,
        keypoints: list[list[float]],
        kp_indices: list[int],
        anny_indices: list[int],
        frame_width: int,
        frame_height: int,
        prev_pose: torch.Tensor | None,
        prev_camera: tuple[torch.Tensor, torch.Tensor] | None,
    ) -> dict | None:
        """Fit ANNY to a single frame's keypoints."""
        # Parse observed keypoints and confidences
        observed_2d = []
        confidences = []
        valid_kp_mask = []

        for kp_idx in kp_indices:
            if kp_idx >= len(keypoints) or keypoints[kp_idx] is None:
                observed_2d.append([0.0, 0.0])
                confidences.append(0.0)
                valid_kp_mask.append(False)
                continue

            kp = keypoints[kp_idx]
            x, y = float(kp[0]), float(kp[1])
            conf = float(kp[2]) if len(kp) > 2 else 1.0

            if conf < self.config.confidence_threshold or (x < 1 and y < 1):
                observed_2d.append([0.0, 0.0])
                confidences.append(0.0)
                valid_kp_mask.append(False)
            else:
                observed_2d.append([x, y])
                confidences.append(conf)
                valid_kp_mask.append(True)

        if sum(valid_kp_mask) < 4:
            return None

        observed_2d_t = torch.tensor(
            observed_2d, dtype=torch.float32, device=self.device
        )
        confidence_t = torch.tensor(
            confidences, dtype=torch.float32, device=self.device
        )
        valid_mask = torch.tensor(
            valid_kp_mask, dtype=torch.bool, device=self.device
        )

        # Initialize pose parameters (identity transforms)
        if prev_pose is not None:
            pose_params = prev_pose.clone().detach().requires_grad_(True)
        else:
            pose_params = (
                torch.eye(4, dtype=torch.float32, device=self.device)
                .unsqueeze(0)
                .unsqueeze(0)
                .expand(1, self.model.bone_count, 4, 4)
                .clone()
                .requires_grad_(True)
            )

        # Initialize camera: scale and translation
        if prev_camera is not None:
            scale = prev_camera[0].clone().detach().requires_grad_(True)
            trans = prev_camera[1].clone().detach().requires_grad_(True)
        else:
            # Estimate initial scale from observed keypoint spread
            valid_pts = observed_2d_t[valid_mask]
            spread = (valid_pts.max(dim=0).values - valid_pts.min(dim=0).values).max()
            init_scale = spread / 1.5  # ANNY body is ~1.5 units tall
            center = valid_pts.mean(dim=0)

            scale = torch.tensor(
                [init_scale.item()],
                dtype=torch.float32,
                device=self.device,
                requires_grad=True,
            )
            trans = center.clone().detach().requires_grad_(True)

        optimizer = torch.optim.Adam(
            [pose_params, scale, trans], lr=self.config.learning_rate
        )

        anny_idx_tensor = torch.tensor(
            anny_indices, dtype=torch.long, device=self.device
        )

        for iteration in range(self.config.num_iterations):
            optimizer.zero_grad()

            # Forward pass through ANNY
            output = self.model(
                pose_parameters=pose_params, return_bone_ends=True
            )
            bone_poses = output["bone_poses"][0]  # (163, 4, 4)
            joint_positions = bone_poses[:, :3, 3]  # (163, 3)

            # Select mapped joints
            selected_joints = joint_positions[anny_idx_tensor]  # (K, 3)

            # Project to 2D
            projected_2d = self._project_weak_perspective(
                selected_joints, scale, trans
            )

            # Keypoint reprojection loss (confidence-weighted)
            diff = projected_2d - observed_2d_t
            per_kp_loss = (diff ** 2).sum(dim=1)  # (K,)
            weighted_loss = (per_kp_loss * confidence_t * valid_mask.float()).sum()
            weighted_loss = weighted_loss / (confidence_t[valid_mask].sum() + 1e-8)

            # Temporal regularization
            temporal_loss = torch.tensor(0.0, device=self.device)
            if prev_pose is not None:
                temporal_loss = self.config.temporal_weight * F.mse_loss(
                    pose_params, prev_pose.detach()
                )

            loss = weighted_loss + temporal_loss
            loss.backward()
            optimizer.step()

        # Extract final mesh
        with torch.no_grad():
            final_output = self.model(
                pose_parameters=pose_params.detach(), return_bone_ends=True
            )
            vertices_3d = final_output["vertices"][0]  # (13718, 3)

            # Project all vertices to 2D
            verts_xy = vertices_3d[:, [0, 2]] * torch.tensor(
                [1.0, -1.0], device=self.device
            )
            vertices_2d = (scale.detach() * verts_xy + trans.detach()).cpu().numpy()

        return {
            "vertices_2d": vertices_2d.tolist(),
            "faces": self.triangle_faces.tolist(),
            "params": {
                "scale": scale.detach().cpu().item(),
                "translation": trans.detach().cpu().tolist(),
            },
            "_pose_params": pose_params.detach().clone(),
            "_camera_params": (scale.detach().clone(), trans.detach().clone()),
        }
