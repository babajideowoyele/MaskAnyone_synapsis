import os
import requests

# Shared secret for worker-to-backend authentication
WORKER_API_KEY = os.getenv("WORKER_API_KEY", "")


class BackendClient:
    _worker_id: str
    _base_path: str
    _auth_headers: dict

    def __init__(self, worker_id: str, base_path: str):
        self._worker_id = worker_id
        self._base_path = base_path
        self._auth_headers = {}
        if WORKER_API_KEY:
            self._auth_headers["X-Worker-API-Key"] = WORKER_API_KEY
        else:
            import warnings
            warnings.warn(
                "WORKER_API_KEY not set. Requests to backend may fail.",
                RuntimeWarning
            )

    def _get_headers(self, extra_headers: dict = None) -> dict:
        """Merge auth headers with any extra headers."""
        headers = self._auth_headers.copy()
        if extra_headers:
            headers.update(extra_headers)
        return headers

    def register_worker(self):
        requests.post(
            self._make_url("register"),
            json={"capabilities": ["media_pipe"]},
            headers=self._get_headers()
        )

    def ping_backend(self):
        requests.post(
            self._make_url("ping"),
            headers=self._get_headers()
        )

    def fetch_next_job(self):
        response = requests.get(
            self._make_url('jobs/next'),
            headers=self._get_headers()
        )

        return response.json()["job"]

    def fetch_video(self, video_id: str):
        response = requests.get(
            self._make_url("videos/" + video_id),
            headers=self._get_headers()
        )

        return response.content

    def mark_job_as_finished(self, job_id: str):
        requests.post(
            self._make_url("jobs/" + job_id + "/finish"),
            headers=self._get_headers()
        )

    def mark_job_as_failed(self, job_id: str):
        requests.post(
            self._make_url("jobs/" + job_id + "/fail"),
            headers=self._get_headers()
        )

    def upload_result_video(self, video_id: str, result_video_id: str, content):
        requests.post(
            self._make_url("videos/" + video_id + "/results/" + result_video_id),
            data=content,
            headers=self._get_headers({"Content-Type": "application/octet-stream"}),
        )

    def upload_result_video_preview_image(self, video_id: str, result_video_id: str, content):
        requests.post(
            self._make_url("videos/" + video_id + "/results/" + result_video_id + "/preview"),
            data=content,
            headers=self._get_headers({"Content-Type": "image/png"}),
        )

    def upload_result_mp_kinematics(
        self, video_id: str, result_video_id: str, data: dict
    ):
        requests.post(
            self._make_url("videos/" + video_id + "/results/" + result_video_id + "/mp_kinematics/body"),
            json=data,
            headers=self._get_headers(),
        )

    def upload_result_data(
        self, video_id: str, result_video_id: str, data_type: str, content
    ):
        if data_type == 'poses':
            requests.post(
                self._make_url("videos/" + video_id + "/results/" + result_video_id + "/data/" + data_type),
                json=content,
                headers=self._get_headers(),
            )
        else:
            requests.post(
                self._make_url("videos/" + video_id + "/results/" + result_video_id + "/data/" + data_type),
                data=content,
                headers=self._get_headers({"Content-Type": "application/octet-stream"}),
            )

    def update_progress(self, job_id: str, progress: int):
        requests.post(
            self._make_url("jobs/" + job_id + "/progress"),
            json={"progress": progress},
            headers=self._get_headers(),
        )

    def _make_url(self, path: str) -> str:
        return self._base_path + self._worker_id + "/" + path
