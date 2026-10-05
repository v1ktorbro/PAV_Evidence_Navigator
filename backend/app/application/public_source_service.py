from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Protocol


class PublicSourceRepository(Protocol):
    def list(self) -> list[dict[str, object]]: ...


class PublicSourceGateway(Protocol):
    def refresh_sources(self, sources: list[dict[str, Any]]) -> list[dict[str, Any]]: ...

    def discover_sources(self) -> list[dict[str, Any]]: ...


class PublicSourceService:
    """Provides a live catalogue while keeping unreviewed web data out of evidence."""

    def __init__(
        self,
        repository: PublicSourceRepository,
        gateway: PublicSourceGateway,
    ) -> None:
        self._repository = repository
        self._gateway = gateway

    def list_current_sources(self) -> dict[str, Any]:
        curated = self._gateway.refresh_sources(self._repository.list())
        discovered = self._gateway.discover_sources()
        items = self._deduplicate(curated + discovered)
        return {
            "items": items,
            "refreshed_at": datetime.now(timezone.utc).isoformat(),
            "discovery_mode": "Ссылки проверены и открытый каталог публикаций опрошен при загрузке страницы.",
            "safety_notice": "Автоматически найденные источники не участвуют в инженерных выводах, пока эксперт не проверит условия опыта и фрагмент первоисточника.",
        }

    @staticmethod
    def _deduplicate(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
        seen_urls: set[str] = set()
        seen_titles: set[str] = set()
        unique: list[dict[str, Any]] = []
        for item in items:
            url = str(item["url"])
            title = str(item.get("title", "")).strip().casefold()
            if url in seen_urls or title in seen_titles:
                continue
            seen_urls.add(url)
            seen_titles.add(title)
            unique.append(item)
        return unique
