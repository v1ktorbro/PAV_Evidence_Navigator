from __future__ import annotations

import json

from backend.app.config import DATA_FILE, EVIDENCE_REVIEWS_FILE


class JsonEvidenceRepository:
    """File-system adapter for the local demonstration evidence corpus."""

    def list(self) -> list[dict[str, object]]:
        evidence = json.loads(DATA_FILE.read_text(encoding="utf-8"))
        reviews = json.loads(EVIDENCE_REVIEWS_FILE.read_text(encoding="utf-8"))
        return evidence + reviews
