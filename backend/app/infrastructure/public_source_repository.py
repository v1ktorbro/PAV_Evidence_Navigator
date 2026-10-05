from __future__ import annotations

import json

from backend.app.config import PUBLIC_SOURCES_FILE


class JsonPublicSourceRepository:
    """Curated seed sources; their availability is checked live on each request."""

    def list(self) -> list[dict[str, object]]:
        return json.loads(PUBLIC_SOURCES_FILE.read_text(encoding="utf-8"))
