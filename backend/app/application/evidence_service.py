from __future__ import annotations

from typing import Any, Protocol

from backend.app.domain.evidence import (
    brief_for_synapse,
    evidence_answer,
    explain_selection,
    filter_evidence,
    is_releasable,
    select_relevant_evidence,
)


class EvidenceNotFoundError(Exception):
    """Raised when an evidence record cannot be found in the corpus."""


class EvidenceSelectionNotFoundError(Exception):
    """Raised when explicitly requested evidence records are unavailable."""


class EvidenceRepository(Protocol):
    def list(self) -> list[dict[str, object]]: ...


class EvidenceService:
    """Application use cases for browsing and analysing the evidence corpus."""

    def __init__(self, repository: EvidenceRepository) -> None:
        self._repository = repository

    def list_evidence(self, *, min_temperature: float | None = None, max_temperature: float | None = None, max_salinity: float | None = None, rock_type: str | None = None, comparable_only: bool = False) -> dict[str, Any]:
        rows = filter_evidence(self._repository.list(), min_temperature=min_temperature, max_temperature=max_temperature, max_salinity=max_salinity, rock_type=rock_type, comparable_only=comparable_only)
        return {"items": rows, "summary": explain_selection(rows)}

    def analyse(self, question: str, experiment_ids: list[str]) -> dict[str, Any]:
        rows = self._selected_rows(question, experiment_ids)
        return {
            "question": question,
            "items": rows,
            "summary": explain_selection(rows),
            "answer": evidence_answer(question, rows),
            "synapse_prompt": brief_for_synapse(question, rows),
        }

    def selected_rows(
        self, question: str, experiment_ids: list[str]
    ) -> list[dict[str, Any]]:
        return self._selected_rows(question, experiment_ids)

    def get_evidence(self, evidence_id: str) -> dict[str, object]:
        """Return one evidence record for its source-fragment viewer."""
        for row in self._repository.list():
            if row["id"] == evidence_id and is_releasable(row):
                return row
        raise EvidenceNotFoundError

    def _selected_rows(
        self, question: str, experiment_ids: list[str]
    ) -> list[dict[str, Any]]:
        rows = [row for row in self._repository.list() if is_releasable(row)]
        if not experiment_ids:
            return select_relevant_evidence(question, rows)
        selected = [row for row in rows if row["id"] in set(experiment_ids)]
        if not selected:
            raise EvidenceSelectionNotFoundError
        return selected
