from __future__ import annotations

import json
from collections import Counter
from pathlib import Path
from typing import Any

from app.config import DATA_FILE


def load_evidence(path: Path = DATA_FILE) -> list[dict[str, Any]]:
    return json.loads(path.read_text(encoding="utf-8"))


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
        "warning": (
            "Стенд демонстрационный: записи синтетические и не являются инженерной рекомендацией. "
            "Перед применением рецептуры требуется проверка инженером и первичных документов."
        ),
    }


def brief_for_synapse(question: str, selected: list[dict[str, Any]]) -> str:
    evidence = "\n".join(
        f"- {row['id']}: {row['formulation']['name']}; {row['conditions']['temperature_c']} °C; "
        f"{row['conditions']['salinity_g_l']} г/л; {row['conditions']['rock_type']}; "
        f"результат: {row['result']['label']} = {row['result']['value']} {row['result']['unit']}; "
        f"источник: {row['source']['document']}, {row['source']['location']}."
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
4. Сформируй короткое инженерное досье: таблица сравнений, ограничения и 3 вопроса для эксперта.
5. Если сведений не хватает, прямо скажи «недостаточно данных».
"""
