import requests
import io
import pickle
import json


class Mesh3dClient:
    _base_path: str

    def __init__(self, base_path: str):
        self._base_path = base_path

    def fit_mesh(self, keypoints_json: str, options: dict):
        data = {
            'keypoints': keypoints_json,
            'options': json.dumps(options),
        }

        response = requests.post(
            self._make_url("fit-mesh"),
            data=data,
            timeout=600,
        )

        buffer = io.BytesIO(response.content)
        mesh_data = pickle.load(buffer)

        return mesh_data

    def _make_url(self, path: str) -> str:
        return self._base_path + "/" + path
