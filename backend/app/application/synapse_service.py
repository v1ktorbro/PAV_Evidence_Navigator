from __future__ import annotations

from typing import Any, Protocol

from backend.app.application.evidence_service import EvidenceService
from backend.app.domain.evidence import brief_for_synapse


class SynapseGateway(Protocol):
    def create_project(self, prompt: str) -> dict[str, Any]: ...
    def get_project(self, project_id: str) -> dict[str, Any]: ...
    def project_url(self, project_id: str) -> str: ...


class SynapseService:
    def __init__(self, client: SynapseGateway, evidence_service: EvidenceService) -> None:
        self._client = client
        self._evidence_service = evidence_service

    def start_research(self, question: str, experiment_ids: list[str]) -> dict[str, Any]:
        rows = self._evidence_service.selected_rows(experiment_ids)
        return self._public_project(self._client.create_project(brief_for_synapse(question, rows)))

    def get_project(self, project_id: str) -> dict[str, Any]:
        return self._public_project(self._client.get_project(project_id))

    def _public_project(self, project: dict[str, Any]) -> dict[str, Any]:
        pending = project.get("pending_approvals") or []
        result = project.get("final_output") or project.get("result") or project.get("summary") or ""
        project_id = str(project.get("project_id") or project.get("id") or "")
        return {"project_id": project_id, "status": project.get("status") or "started", "phase": project.get("current_phase") or "", "title": project.get("title") or "Исследование ПАВ", "awaiting_approval": bool(pending), "result_preview": str(result)[:1200], "synapse_url": self._client.project_url(project_id)}
