from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_reports_local_corpus():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["evidence_records"] == 6


def test_comparable_filter_returns_only_comparable_experiments():
    response = client.get("/api/evidence?comparable_only=true")
    assert response.status_code == 200
    assert response.json()["summary"]["not_comparable"] == 0
    assert all(item["comparability"]["status"] == "comparable" for item in response.json()["items"])


def test_analysis_contains_source_fragments_in_synapse_prompt():
    response = client.post("/api/analysis", json={"question": "Что можно сопоставить?", "experiment_ids": ["LAB-001"]})
    assert response.status_code == 200
    assert "LAB-001" in response.json()["synapse_prompt"]
    assert "стр. 14, табл. 4" in response.json()["synapse_prompt"]
