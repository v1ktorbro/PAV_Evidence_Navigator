from __future__ import annotations

import json

from backend.app.config import CONTROL_QUESTIONS_FILE


class JsonControlQuestionRepository:
    """File-system adapter for the expert-approved control-question set."""

    def list(self) -> list[dict[str, object]]:
        return json.loads(CONTROL_QUESTIONS_FILE.read_text(encoding="utf-8"))
