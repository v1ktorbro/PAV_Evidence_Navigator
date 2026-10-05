from __future__ import annotations

from collections import Counter
from itertools import combinations
from typing import Any


REQUIRED_TRACEABILITY_FIELDS = (
    "document",
    "location",
    "excerpt",
    "url",
)
REQUIRED_MEASUREMENT_CONDITIONS = (
    "temperature_c",
    "salinity_g_l",
    "rock_type",
)


def traceability_gaps(row: dict[str, Any]) -> list[str]:
    """Return every missing prerequisite for releasing a numeric fact."""
    gaps = [
        f"источник.{field}"
        for field in REQUIRED_TRACEABILITY_FIELDS
        if not row.get("source", {}).get(field)
    ]
    gaps.extend(
        f"условия.{field}"
        for field in REQUIRED_MEASUREMENT_CONDITIONS
        if row.get("conditions", {}).get(field) is None
    )
    method = str(row.get("method", "")).lower()
    if not method or "без методики" in method or "только «успешный опыт»" in method:
        gaps.append("методика")
    if row.get("result", {}).get("value") is None:
        gaps.append("числовой результат")
    return gaps


def is_releasable(row: dict[str, Any]) -> bool:
    """Only verified, fully traceable numeric facts can reach the evidence API."""
    quality = row.get("quality", {})
    return (
        quality.get("release_status") == "released"
        and quality.get("source_fragment_verified") is True
        and not traceability_gaps(row)
    )


def filter_evidence(
    rows: list[dict[str, Any]],
    *,
    min_temperature: float | None = None,
    max_temperature: float | None = None,
    max_salinity: float | None = None,
    rock_type: str | None = None,
    comparable_only: bool = False,
) -> list[dict[str, Any]]:
    result = []
    for row in rows:
        if not is_releasable(row):
            continue
        conditions = row["conditions"]
        temperature = conditions.get("temperature_c")
        salinity = conditions.get("salinity_g_l")
        if min_temperature is not None and (temperature is None or temperature < min_temperature):
            continue
        if max_temperature is not None and (temperature is None or temperature > max_temperature):
            continue
        if max_salinity is not None and (salinity is None or salinity > max_salinity):
            continue
        if rock_type and conditions.get("rock_type", "").lower() != rock_type.lower():
            continue
        if comparable_only and row["comparability"]["status"] != "comparable":
            continue
        result.append(row)
    return result


def explain_selection(rows: list[dict[str, Any]]) -> dict[str, Any]:
    statuses = Counter(row["comparability"]["status"] for row in rows)
    missing = sorted({field for row in rows for field in row.get("missing_fields", [])})
    return {
        "total": len(rows),
        "comparable": statuses["comparable"],
        "limited": statuses["limited"],
        "not_comparable": statuses["not_comparable"],
        "missing_fields": missing,
        "warning": "Числовые факты в этой подборке выпущены только после проверки условий измерения и фрагмента источника. Инженерное решение требует проверки первичных документов.",
    }


def _method_family(row: dict[str, Any]) -> str:
    method = row.get("method", "").lower()
    if "core flood" in method:
        return "core_flood"
    if "межфаз" in method:
        return "ift"
    if "реолог" in method:
        return "rheology"
    return "other"


def comparison_assessment(rows: list[dict[str, Any]]) -> dict[str, Any]:
    """State explicitly which selected facts may be compared directly."""
    direct_pairs: list[list[str]] = []
    restricted_pairs: list[dict[str, str]] = []
    for left, right in combinations(rows, 2):
        same_metric = left["result"]["label"] == right["result"]["label"]
        same_method = _method_family(left) == _method_family(right)
        same_rock = left["conditions"]["rock_type"] == right["conditions"]["rock_type"]
        temperature_gap = abs(left["conditions"]["temperature_c"] - right["conditions"]["temperature_c"])
        salinity_gap = abs(left["conditions"]["salinity_g_l"] - right["conditions"]["salinity_g_l"])
        statuses_ok = (
            left["comparability"]["status"] == "comparable"
            and right["comparability"]["status"] == "comparable"
        )
        if same_metric and same_method and same_rock and temperature_gap <= 15 and salinity_gap <= 15 and statuses_ok:
            direct_pairs.append([left["id"], right["id"]])
            continue
        restricted_pairs.append(
            {
                "left": left["id"],
                "right": right["id"],
                "reason": "Прямое ранжирование запрещено: различаются метрика, методика, порода, диапазон условий или статус сопоставимости.",
            }
        )
    return {
        "direct_pairs": direct_pairs,
        "restricted_pairs": restricted_pairs,
        "direct_comparison_allowed": bool(direct_pairs),
    }


def evidence_answer(question: str, selected: list[dict[str, Any]]) -> dict[str, Any]:
    """Build a local, repeatable answer with a citation on every numeric fact."""
    facts = [
        {
            "experiment_id": row["id"],
            "metric": row["result"]["label"],
            "value": row["result"]["value"],
            "unit": row["result"]["unit"],
            "conditions": row["conditions"],
            "citation": {
                "document": row["source"]["document"],
                "location": row["source"]["location"],
                "url": row["source"]["url"],
            },
        }
        for row in selected
    ]
    limitations = [
        {"experiment_id": row["id"], "reason": row["comparability"]["reason"]}
        for row in selected
        if row["comparability"]["status"] != "comparable"
    ]
    return {
        "question": question,
        "confirmed_facts": facts,
        "limitations": limitations,
        "comparison": comparison_assessment(selected),
        "external_escalation": False,
        "retry_policy": "Повторный идентичный запрос выполняется локально и возвращает те же проверяемые факты и ссылки.",
    }


def brief_for_synapse(question: str, selected: list[dict[str, Any]]) -> str:
    evidence = "\n".join(
        f"- {row['id']}: {row['formulation']['name']}; {row['conditions']['temperature_c']} °C; {row['conditions']['salinity_g_l']} г/л; {row['conditions']['rock_type']}; результат: {row['result']['label']} = {row['result']['value']} {row['result']['unit']}; источник: {row['source']['document']}, {row['source']['location']} ({row['source']['url']})."
        for row in selected
    )
    return f"""Ты инженер-эксперт по химическим методам увеличения нефтеотдачи (EOR).

Нужно ответить на вопрос по ограниченному корпусу лабораторных опытов ПАВ:
{question}

Записи корпуса:
{evidence}

Правила:
1. Не выбирай рецептуру для промышленного внедрения и не обещай прирост добычи.
2. Раздели подтверждённые факты, ограниченно сопоставимые результаты и пробелы данных.
3. Любой числовой вывод сопровождай идентификатором опыта и ссылкой на фрагмент источника.
4. Сформируй краткое инженерное досье: таблица сравнений, ограничения и 3 вопроса для эксперта.
5. Если сведений не хватает, прямо скажи «недостаточно данных».
"""
