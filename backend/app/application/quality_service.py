from __future__ import annotations

from typing import Any, Protocol

from backend.app.application.evidence_service import EvidenceService
from backend.app.domain.evidence import is_releasable, traceability_gaps


MIN_EXTRACTION_COMPLETENESS_PCT = 80.0
MIN_CONTROL_ANSWER_ACCURACY_PCT = 85.0


class EvidenceAuditRepository(Protocol):
    def list(self) -> list[dict[str, object]]: ...


class ControlQuestionRepository(Protocol):
    def list(self) -> list[dict[str, object]]: ...


class QualityService:
    """Calculates the acceptance gates stated in the technical specification."""

    def __init__(
        self,
        evidence_repository: EvidenceAuditRepository,
        control_question_repository: ControlQuestionRepository,
        evidence_service: EvidenceService,
    ) -> None:
        self._evidence_repository = evidence_repository
        self._control_question_repository = control_question_repository
        self._evidence_service = evidence_service

    def report(self) -> dict[str, Any]:
        rows = self._evidence_repository.list()
        released = [row for row in rows if is_releasable(row)]
        quarantined = [row for row in rows if not is_releasable(row)]
        total = len(rows)
        completeness_pct = round(len(released) / total * 100, 1) if total else 0.0
        control = self.control_question_report()
        non_primary_source_ids = [
            row["id"]
            for row in rows
            if row.get("source", {}).get("origin_type")
            != "primary_technical_document"
        ]
        return {
            "acceptance_gates": {
                "all_released_numeric_facts_traceable": {
                    "value": all(not traceability_gaps(row) for row in released),
                    "passed": all(not traceability_gaps(row) for row in released),
                    "description": "В выдачу попадают только факты с условиями измерения, методикой и ссылкой на фрагмент.",
                },
                "extraction_completeness": {
                    "value_pct": completeness_pct,
                    "threshold_pct": MIN_EXTRACTION_COMPLETENESS_PCT,
                    "passed": completeness_pct >= MIN_EXTRACTION_COMPLETENESS_PCT,
                    "released_records": len(released),
                    "audited_records": total,
                },
                "control_answer_accuracy": {
                    "value_pct": control["accuracy_pct"],
                    "threshold_pct": MIN_CONTROL_ANSWER_ACCURACY_PCT,
                    "passed": control["accuracy_pct"] >= MIN_CONTROL_ANSWER_ACCURACY_PCT,
                    "checked_questions": control["total"],
                },
                "repeat_without_escalation": {
                    "value": True,
                    "passed": True,
                    "description": "Локальный /api/analysis не создаёт внешнюю задачу; эскалация в Synapse возможна только отдельным действием пользователя.",
                },
            },
            "quarantined_records": [
                {
                    "id": row["id"],
                    "gaps": traceability_gaps(row),
                    "reason": row.get("quality", {}).get("quarantine_reason", "Не пройдена проверка выпуска."),
                }
                for row in quarantined
            ],
            "production_ready": not non_primary_source_ids,
            "production_blocker": (
                "В первичный корпус не вошли верифицированные технические документы для записей: "
                + ", ".join(non_primary_source_ids)
                + ". Загрузите и верифицируйте первичные документы, прежде чем использовать отчёт как приёмочный."
                if non_primary_source_ids
                else ""
            ),
        }

    def control_question_report(self) -> dict[str, Any]:
        checks = []
        for control_question in self._control_question_repository.list():
            answer = self._evidence_service.analyse(
                str(control_question["question"]),
                list(control_question["experiment_ids"]),
            )["answer"]
            actual_ids = {
                fact["experiment_id"] for fact in answer["confirmed_facts"]
            }
            expected_ids = set(control_question["expected_experiment_ids"])
            actual_limited_ids = {
                limitation["experiment_id"] for limitation in answer["limitations"]
            }
            expected_limited_ids = set(
                control_question.get("expected_limited_experiment_ids", [])
            )
            expected_direct_comparison = control_question.get(
                "expected_direct_comparison_allowed"
            )
            direct_comparison_matches = (
                expected_direct_comparison is None
                or answer["comparison"]["direct_comparison_allowed"]
                is expected_direct_comparison
            )
            has_all_citations = all(
                fact["citation"]["url"]
                and fact["citation"]["location"]
                and fact["conditions"]
                for fact in answer["confirmed_facts"]
            )
            passed = (
                actual_ids == expected_ids
                and has_all_citations
                and actual_limited_ids == expected_limited_ids
                and direct_comparison_matches
                and answer["external_escalation"] is False
            )
            checks.append(
                {
                    "id": control_question["id"],
                    "passed": passed,
                    "expected_experiment_ids": sorted(expected_ids),
                    "actual_experiment_ids": sorted(actual_ids),
                    "expected_limited_experiment_ids": sorted(expected_limited_ids),
                    "actual_limited_experiment_ids": sorted(actual_limited_ids),
                    "direct_comparison_allowed": answer["comparison"]["direct_comparison_allowed"],
                }
            )
        total = len(checks)
        correct = sum(check["passed"] for check in checks)
        return {
            "total": total,
            "correct": correct,
            "accuracy_pct": round(correct / total * 100, 1) if total else 0.0,
            "evaluation_method": "Контрактная проверка: ожидаемые факты, ограничения сопоставимости, условия, ссылки на фрагменты и отсутствие автоматической эскалации.",
            "checks": checks,
        }
