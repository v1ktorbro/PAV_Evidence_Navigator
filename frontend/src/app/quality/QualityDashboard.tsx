import scss from "./qualityDashboard.module.scss";

import { useEffect, useState } from "react";

import { getQualityReport } from "../../api/evidence";
import type { QualityGate, QualityReport } from "../../assets/types/evidence";

const gateLabel: Record<keyof QualityReport["acceptance_gates"], string> = {
  all_released_numeric_facts_traceable:
    "Числовые факты с условиями и фрагментами",
  extraction_completeness: "Полнота извлечения",
  control_answer_accuracy: "Контрольные вопросы",
  repeat_without_escalation: "Повторный вопрос без эскалации",
};

const formatGateValue = (gate: QualityGate) => {
  if (typeof gate.value_pct === "number") {
    const threshold =
      typeof gate.threshold_pct === "number" ? ` / ≥ ${gate.threshold_pct}%` : "";
    return `${gate.value_pct}%${threshold}`;
  }
  return gate.value ? "Да" : "Нет";
};

const QualityDashboard = () => {
  const [report, setReport] = useState<QualityReport>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    void getQualityReport()
      .then(setReport)
      .catch((loadError) =>
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Не удалось загрузить отчёт качества.",
        ),
      );
  }, []);

  if (error) {
    return (
      <main className={scss.root}>
        <article className={scss.panel}>
          <p className={scss.eyebrow}>Контроль качества</p>
          <h1>Отчёт недоступен</h1>
          <p className={scss.muted}>{error}</p>
        </article>
      </main>
    );
  }

  if (!report) {
    return (
      <main className={scss.root} aria-busy="true">
        <p className={scss.muted}>Проверяем критерии ТЗ…</p>
      </main>
    );
  }

  return (
    <main className={scss.root}>
      <header className={scss.header}>
        <div>
          <p className={scss.eyebrow}>Приёмочный контроль</p>
          <h1>Соответствие критериям ТЗ</h1>
          <p className={scss.lead}>
            Метрики рассчитываются из текущего корпуса и набора контрольных
            вопросов при каждом открытии страницы.
          </p>
        </div>
        <a className={scss.backLink} href="/">
          К доказательной базе
        </a>
      </header>

      {report.production_blocker && (
        <section className={scss.blocker}>
          <strong>Пока нельзя использовать как производственную приёмку.</strong>
          <span>{report.production_blocker}</span>
        </section>
      )}

      <section className={scss.gates} aria-label="Критерии ТЗ">
        {Object.entries(report.acceptance_gates).map(([key, gate]) => (
          <article key={key} className={scss.gate}>
            <span className={gate.passed ? scss.passed : scss.failed}>
              {gate.passed ? "Пройдено" : "Не пройдено"}
            </span>
            <h2>{gateLabel[key as keyof QualityReport["acceptance_gates"]]}</h2>
            <strong>{formatGateValue(gate)}</strong>
            {gate.released_records !== undefined && (
              <p>
                Проверено записей: {gate.released_records} из {gate.audited_records}.
              </p>
            )}
            {gate.checked_questions !== undefined && (
              <p>Проверено вопросов: {gate.checked_questions}.</p>
            )}
            {gate.description && <p>{gate.description}</p>}
          </article>
        ))}
      </section>

      <section className={scss.panel}>
        <p className={scss.eyebrow}>Карантин данных</p>
        <h2>Записи, исключённые из доказательной базы</h2>
        {report.quarantined_records.length ? (
          <ul className={scss.quarantineList}>
            {report.quarantined_records.map((record) => (
              <li key={record.id}>
                <strong>{record.id}</strong>
                <p>{record.reason}</p>
                <p className={scss.muted}>
                  Не хватает: {record.gaps.join(", ")}.
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Невыпущенных числовых фактов нет.</p>
        )}
      </section>
    </main>
  );
};

export default QualityDashboard;
