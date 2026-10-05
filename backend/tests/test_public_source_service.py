from backend.app.application.public_source_service import PublicSourceService


class FakeRepository:
    def list(self):
        return [
            {
                "id": "curated",
                "url": "https://example.test/curated",
                "title": "Curated source",
            }
        ]


class FakeGateway:
    def __init__(self):
        self.refresh_calls = 0
        self.discovery_calls = 0

    def refresh_sources(self, sources):
        self.refresh_calls += 1
        return [{**source, "availability": "available"} for source in sources]

    def discover_sources(self):
        self.discovery_calls += 1
        return [
            {
                "id": "discovered",
                "url": "https://doi.org/10.1000/example",
                "title": "Discovered source",
                "review_status": "needs_review",
            }
        ]


def test_public_source_catalog_refreshes_and_discovers_on_each_request():
    gateway = FakeGateway()
    service = PublicSourceService(FakeRepository(), gateway)

    result = service.list_current_sources()

    assert gateway.refresh_calls == 1
    assert gateway.discovery_calls == 1
    assert [item["id"] for item in result["items"]] == ["curated", "discovered"]
    assert result["items"][1]["review_status"] == "needs_review"
