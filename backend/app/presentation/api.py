from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from backend.app.application.evidence_service import (
    EvidenceNotFoundError,
    EvidenceService,
)
from backend.app.application.evidence_review_service import (
    EvidenceReviewNotFoundError,
    EvidenceReviewService,
    EvidenceReviewStateError,
    EvidenceReviewValidationError,
)
from backend.app.application.quality_service import QualityService
from backend.app.application.public_source_service import PublicSourceService
from backend.app.application.synapse_service import SynapseService
from backend.app.config import settings
from backend.app.infrastructure.control_question_repository import JsonControlQuestionRepository
from backend.app.infrastructure.evidence_repository import JsonEvidenceRepository
from backend.app.infrastructure.evidence_review_repository import JsonEvidenceReviewRepository
from backend.app.infrastructure.public_source_gateway import HttpPublicSourceGateway
from backend.app.infrastructure.public_source_repository import JsonPublicSourceRepository
from backend.app.infrastructure.synapse_client import SynapseClient, SynapseError

router = APIRouter(prefix="/api")
evidence_repository = JsonEvidenceRepository()
evidence_service = EvidenceService(evidence_repository)
evidence_review_service = EvidenceReviewService(JsonEvidenceReviewRepository())
quality_service = QualityService(
    evidence_repository,
    JsonControlQuestionRepository(),
    evidence_service,
)
public_source_service = PublicSourceService(
    JsonPublicSourceRepository(),
    HttpPublicSourceGateway(),
)


class AnalysisBody(BaseModel):
    question: str = Field(min_length=5, max_length=1200)
    experiment_ids: list[str] = Field(default_factory=list, max_length=30)


class SourceReferenceBody(BaseModel):
    id: str = Field(min_length=1, max_length=200)
    title: str = Field(min_length=1, max_length=1200)
    url: str = Field(min_length=1, max_length=2000)


class FormulationBody(BaseModel):
    name: str = Field(min_length=1, max_length=500)
    surfactant_class: str = Field(min_length=1, max_length=200)
    concentration_wt_pct: float = Field(ge=0)


class ConditionsBody(BaseModel):
    temperature_c: float
    salinity_g_l: float = Field(ge=0)
    rock_type: str = Field(min_length=1, max_length=200)
    permeability_md: float | None = Field(default=None, ge=0)


class ResultBody(BaseModel):
    label: str = Field(min_length=1, max_length=300)
    value: float
    unit: str = Field(min_length=1, max_length=100)


class CitationBody(BaseModel):
    location: str = Field(min_length=1, max_length=1000)
    excerpt: str = Field(min_length=1, max_length=5000)


class EvidenceReviewBody(BaseModel):
    source: SourceReferenceBody
    formulation: FormulationBody
    conditions: ConditionsBody
    method: str = Field(min_length=5, max_length=5000)
    result: ResultBody
    citation: CitationBody


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


@router.get("/quality/report")
def quality_report() -> dict[str, Any]:
    return quality_service.report()


@router.get("/quality/control-questions")
def control_question_report() -> dict[str, Any]:
    return quality_service.control_question_report()


@router.get("/public-sources")
def public_sources() -> dict[str, Any]:
    return public_source_service.list_current_sources()


@router.get("/evidence-reviews")
def evidence_reviews() -> dict[str, Any]:
    return {"items": evidence_review_service.list_reviews()}


@router.post("/evidence-reviews", status_code=status.HTTP_201_CREATED)
def submit_evidence_review(body: EvidenceReviewBody) -> dict[str, Any]:
    return evidence_review_service.submit(body.model_dump())


@router.post("/evidence-reviews/{review_id}/approve")
def approve_evidence_review(review_id: str) -> dict[str, Any]:
    try:
        return evidence_review_service.approve(review_id)
    except EvidenceReviewNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Заявка на проверку не найдена.") from exc
    except EvidenceReviewStateError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except EvidenceReviewValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


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
