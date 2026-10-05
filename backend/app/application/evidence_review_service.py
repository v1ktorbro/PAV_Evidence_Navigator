from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Protocol
from uuid import uuid4

from backend.app.domain.evidence import traceability_gaps


class EvidenceReviewNotFoundError(Exception):
    """Raised when a submitted evidence record does not exist."""


class EvidenceReviewStateError(Exception):
    """Raised when a record cannot make the requested state transition."""


class EvidenceReviewValidationError(Exception):
    """Raised when a record is missing release prerequisites."""

    def __init__(self, gaps: list[str]) -> None:
        self.gaps = gaps
        super().__init__("Не заполнены обязательные данные для выпуска: " + ", ".join(gaps))


class EvidenceReviewRepository(Protocol):
    def list(self) -> list[dict[str, Any]]: ...

    def add(self, review: dict[str, Any]) -> None: ...

    def replace(self, review: dict[str, Any]) -> None: ...


class EvidenceReviewService:
    """Collects manually extracted facts and releases them after human approval."""

    def __init__(self, repository: EvidenceReviewRepository) -> None:
        self._repository = repository

    def list_reviews(self) -> list[dict[str, Any]]:
        return self._repository.list()

    def submit(self, submission: dict[str, Any]) -> dict[str, Any]:
        submitted_at = self._now()
        source = submission["source"]
        review = {
            "id": f"REVIEW-{uuid4().hex[:8].upper()}",
            "formulation": submission["formulation"],
            "conditions": submission["conditions"],
            "method": submission["method"],
            "result": submission["result"],
            "comparability": {
                "status": "limited",
                "reason": "Новая запись выпущена после ручной проверки; сопоставимость с другими опытами требует отдельной инженерной оценки.",
            },
            "missing_fields": [],
            "source": {
                "document": source["title"],
                "location": submission["citation"]["location"],
                "excerpt": submission["citation"]["excerpt"],
                "url": source["url"],
                "origin_type": "public_source_review",
                "public_source_id": source["id"],
            },
            "quality": {
                "release_status": "pending_review",
                "source_fragment_verified": False,
                "quarantine_reason": "Ожидает подтверждения экспертом-ревьюером.",
            },
            "review": {
                "status": "pending_review",
                "submitted_at": submitted_at,
            },
        }
        self._repository.add(review)
        return review

    def approve(self, review_id: str) -> dict[str, Any]:
        review = self._find(review_id)
        if review["quality"].get("release_status") != "pending_review":
            raise EvidenceReviewStateError("Заявка уже рассмотрена и не может быть подтверждена повторно.")

        gaps = traceability_gaps(review)
        if gaps:
            raise EvidenceReviewValidationError(gaps)

        approved_at = self._now()
        review["quality"] = {
            "release_status": "released",
            "source_fragment_verified": True,
        }
        review["review"] = {
            **review["review"],
            "status": "released",
            "approved_at": approved_at,
        }
        self._repository.replace(review)
        return review

    def _find(self, review_id: str) -> dict[str, Any]:
        for review in self._repository.list():
            if review["id"] == review_id:
                return review
        raise EvidenceReviewNotFoundError

    @staticmethod
    def _now() -> str:
        return datetime.now(timezone.utc).isoformat()
