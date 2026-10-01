from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from backend.app.application.evidence_service import (
    EvidenceNotFoundError,
    EvidenceService,
)
from backend.app.application.synapse_service import SynapseService
from backend.app.config import settings
from backend.app.infrastructure.evidence_repository import JsonEvidenceRepository
from backend.app.infrastructure.synapse_client import SynapseClient, SynapseError

router = APIRouter(prefix="/api")
evidence_service = EvidenceService(JsonEvidenceRepository())


class AnalysisBody(BaseModel):
    question: str = Field(min_length=5, max_length=1200)
    experiment_ids: list[str] = Field(default_factory=list, max_length=30)


def synapse_service() -> SynapseService:
    return SynapseService(SynapseClient(settings()), evidence_service)


@router.get("/health")
def health() -> dict[str, Any]:
    config = settings()
    return {"ok": True, "evidence_records": evidence_service.list_evidence()["summary"]["total"], "synapse_configured": config.synapse_configured}


@router.get("/evidence")
def evidence(min_temperature: float | None = None, max_temperature: float | None = None, max_salinity: float | None = None, rock_type: str | None = None, comparable_only: bool = False) -> dict[str, Any]:
    return evidence_service.list_evidence(min_temperature=min_temperature, max_temperature=max_temperature, max_salinity=max_salinity, rock_type=rock_type, comparable_only=comparable_only)


@router.get("/evidence/{evidence_id}")
def evidence_by_id(evidence_id: str) -> dict[str, object]:
    try:
        return evidence_service.get_evidence(evidence_id)
    except EvidenceNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Опыт не найден.") from exc


@router.post("/analysis")
def analysis(body: AnalysisBody) -> dict[str, Any]:
    return evidence_service.analyse(body.question, body.experiment_ids)


@router.get("/synapse/config")
def synapse_config() -> dict[str, Any]:
    config = settings()
    return {"configured": config.synapse_configured, "approval_mode": config.synapse_approval_mode}


@router.post("/synapse/projects")
def start_synapse_research(body: AnalysisBody) -> dict[str, Any]:
    try:
        return synapse_service().start_research(body.question, body.experiment_ids)
    except SynapseError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.get("/synapse/projects/{project_id}")
def synapse_project(project_id: str) -> dict[str, Any]:
    try:
        return synapse_service().get_project(project_id)
    except SynapseError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
