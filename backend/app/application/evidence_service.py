from __future__ import annotations

from typing import Any, Protocol

from fastapi import HTTPException

from backend.app.domain.evidence import brief_for_synapse, explain_selection, filter_evidence


class EvidenceNotFoundError(Exception):
    """Raised when an evidence record cannot be found in the corpus."""


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
        rows = self._selected_rows(experiment_ids)
        return {"question": question, "items": rows, "summary": explain_selection(rows), "synapse_prompt": brief_for_synapse(question, rows)}

    def selected_rows(self, experiment_ids: list[str]) -> list[dict[str, Any]]:
        return self._selected_rows(experiment_ids)

    def get_evidence(self, evidence_id: str) -> dict[str, object]:
        """Return one evidence record for its source-fragment viewer."""
        for row in self._repository.list():
            if row["id"] == evidence_id:
                return row
        raise EvidenceNotFoundError

    def _selected_rows(self, experiment_ids: list[str]) -> list[dict[str, Any]]:
        rows = self._repository.list()
        if not experiment_ids:
            return rows
        selected = [row for row in rows if row["id"] in set(experiment_ids)]
        if not selected:
            raise HTTPException(status_code=404, detail="Не найдены выбранные опыты.")
        return selected
