from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


def test_health_reports_local_corpus():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["evidence_records"] == 5


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


def test_evidence_by_id_returns_source_fragment():
    response = client.get("/api/evidence/LAB-001")
    assert response.status_code == 200
    assert response.json()["source"]["location"] == "стр. 14, табл. 4"


def test_unknown_evidence_returns_not_found():
    response = client.get("/api/evidence/UNKNOWN")
    assert response.status_code == 404


def test_untraceable_numeric_fact_is_quarantined_from_evidence_api():
    response = client.get("/api/evidence/LAB-005")
    assert response.status_code == 404


def test_quality_report_enforces_the_acceptance_thresholds():
    response = client.get("/api/quality/report")
    assert response.status_code == 200

    gates = response.json()["acceptance_gates"]
    assert gates["all_released_numeric_facts_traceable"]["passed"] is True
    assert gates["extraction_completeness"]["value_pct"] >= 80
    assert gates["control_answer_accuracy"]["value_pct"] >= 85
    assert gates["repeat_without_escalation"]["passed"] is True
    assert response.json()["quarantined_records"][0]["id"] == "LAB-005"


def test_control_questions_measure_answer_accuracy():
    response = client.get("/api/quality/control-questions")
    assert response.status_code == 200
    report = response.json()
    assert report["accuracy_pct"] >= 85
    assert all(check["passed"] for check in report["checks"])


def test_repeated_question_is_local_repeatable_and_has_citations():
    body = {"question": "Что подтверждено в опыте?", "experiment_ids": ["LAB-001"]}
    first = client.post("/api/analysis", json=body)
    second = client.post("/api/analysis", json=body)

    assert first.status_code == 200
    assert second.status_code == 200
    assert first.json()["answer"] == second.json()["answer"]
    assert first.json()["answer"]["external_escalation"] is False
    fact = first.json()["answer"]["confirmed_facts"][0]
    assert fact["conditions"]["temperature_c"] == 75
    assert fact["citation"]["url"] == "/source/LAB-001"
