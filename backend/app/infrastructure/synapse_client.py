from __future__ import annotations

from typing import Any

import httpx

from backend.app.config import Settings


class SynapseError(RuntimeError):
    pass


def normalize_url(value: str) -> str:
    value = value.strip().rstrip("/")
    if value and "://" not in value:
        value = f"https://{value}"
    return value.removesuffix("/api")


class SynapseClient:
    def __init__(self, config: Settings) -> None:
        self.config = config
        self.base_url = normalize_url(config.synapse_url)
        self._access_token: str | None = None

    @property
    def configured(self) -> bool:
        return self.config.synapse_configured

    def _request(self, method: str, path: str, **kwargs: Any) -> httpx.Response:
        if not self.configured:
            raise SynapseError("Synapse не настроен: заполните SYNAPSE_URL, SYNAPSE_USER, SYNAPSE_PASSWORD и SYNAPSE_WORKFLOW_ID.")
        with httpx.Client(base_url=self.base_url, timeout=self.config.synapse_timeout, follow_redirects=True) as client:
            if not self._access_token:
                login = client.post("/api/auth/login", json={"email": self.config.synapse_user, "password": self.config.synapse_password})
                if login.status_code != 200:
                    raise SynapseError(f"Вход в Synapse не выполнен: HTTP {login.status_code}.")
                self._access_token = login.json().get("access_token")
                if not self._access_token:
                    raise SynapseError("Synapse не вернул access_token.")
            response = client.request(method, path, headers={"Authorization": f"Bearer {self._access_token}"}, **kwargs)
        if response.status_code >= 400:
            raise SynapseError(f"Synapse {method} {path}: HTTP {response.status_code}.")
        return response

    def create_project(self, prompt: str) -> dict[str, Any]:
        return self._request("POST", "/api/projects", json={"user_prompt": prompt, "workflow_id": self.config.synapse_workflow_id, "approval_mode": self.config.synapse_approval_mode or "human"}).json()

    def get_project(self, project_id: str) -> dict[str, Any]:
        return self._request("GET", f"/api/projects/{project_id}").json()

    def project_url(self, project_id: str) -> str:
        base = normalize_url(self.config.synapse_ui_url) or self.base_url
        return f"{base}/monitor/{project_id}" if base else ""

