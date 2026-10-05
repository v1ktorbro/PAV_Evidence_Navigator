from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from backend.app.config import EVIDENCE_REVIEWS_FILE


class JsonEvidenceReviewRepository:
    """File-system adapter for submitted evidence records awaiting review."""

    def __init__(self, file_path: Path = EVIDENCE_REVIEWS_FILE) -> None:
        self._file_path = file_path

    def list(self) -> list[dict[str, Any]]:
        if not self._file_path.exists():
            return []
        return json.loads(self._file_path.read_text(encoding="utf-8"))

    def add(self, review: dict[str, Any]) -> None:
        reviews = self.list()
        reviews.append(review)
        self._write(reviews)

    def replace(self, review: dict[str, Any]) -> None:
        reviews = self.list()
        for index, current in enumerate(reviews):
            if current["id"] == review["id"]:
                reviews[index] = review
                self._write(reviews)
                return
        raise KeyError(review["id"])

    def _write(self, reviews: list[dict[str, Any]]) -> None:
        temporary_path = self._file_path.with_suffix(".tmp")
        temporary_path.write_text(
            json.dumps(reviews, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        temporary_path.replace(self._file_path)
