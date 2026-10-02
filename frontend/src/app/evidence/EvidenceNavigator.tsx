import { useEffect, useState } from "react";

import {
  getEvidence,
  getSynapseConfig,
} from "../../api/evidence";
import type {
  EvidenceFiltersValue,
  EvidenceResponse,
  SynapseConfig,
} from "../../assets/types/evidence";
import AnalysisPanel from "../../components/AnalysisPanel/AnalysisPanel";
import EvidenceFilters from "../../components/EvidenceFilters/EvidenceFilters";
import EvidenceTable from "../../components/EvidenceTable/EvidenceTable";
import IconRenderer from "../../components/ui/IconRenderer/IconRenderer";
import Tooltip from "../../components/ui/Tooltip/Tooltip";
import { getAnalysisFlow, saveAnalysisFlow } from "./analysisFlow";
import scss from "./evidenceNavigator.module.scss";

const INITIAL_FILTERS: EvidenceFiltersValue = {
  minTemperature: "",
  maxTemperature: "",
  maxSalinity: "",
  comparableOnly: false,
};
const hasFilterValues = (filters: EvidenceFiltersValue) =>
  filters.minTemperature.trim().length > 0 ||
  filters.maxTemperature.trim().length > 0 ||
  filters.maxSalinity.trim().length > 0 ||
  filters.comparableOnly;
type EvidenceFilterKey = keyof EvidenceFiltersValue;

interface IAppliedFilter {
  key: EvidenceFilterKey;
  label: string;
}

const getAppliedFilters = (filters: EvidenceFiltersValue): IAppliedFilter[] =>
  [
    filters.minTemperature.trim() && {
      key: "minTemperature" as const,
      label: `Температура от: ${filters.minTemperature} °C`,
    },
    filters.maxTemperature.trim() && {
      key: "maxTemperature" as const,
      label: `Температура до: ${filters.maxTemperature} °C`,
    },
    filters.maxSalinity.trim() && {
      key: "maxSalinity" as const,
      label: `Минерализация до: ${filters.maxSalinity} г/л`,
    },
    filters.comparableOnly && {
      key: "comparableOnly" as const,
      label: "Только сопоставимые",
    },
  ].filter((filter): filter is IAppliedFilter => Boolean(filter));
const COMPARABILITY_DESCRIPTIONS = [
  undefined,
  "Условия опыта соответствуют выбранным параметрам и его можно использовать для прямого сравнения.",
  "Опыт близок к выбранным условиям, но имеет отличия или неполные данные. Учитывайте это при выводах.",
  "Условия опыта не соответствуют выбранным параметрам либо отсутствуют критически важные данные.",
];
const DEFAULT_QUESTION =
  "Какие результаты по карбонатному керну при 70–90 °C можно корректно сопоставить и каких условий не хватает?";
const getRestoredFlow = () =>
  new URLSearchParams(window.location.search).has("restore-analysis")
    ? getAnalysisFlow()
    : undefined;

const EvidenceNavigator = () => {
  const [restoredFlow] = useState(getRestoredFlow);
  const [filters, setFilters] = useState(
    restoredFlow?.filters ?? INITIAL_FILTERS,
  );
  const [appliedFilters, setAppliedFilters] = useState(
    restoredFlow?.filters ?? INITIAL_FILTERS,
  );
  const [evidence, setEvidence] = useState<EvidenceResponse>();
  const [synapseConfig, setSynapseConfig] = useState<SynapseConfig>();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [question, setQuestion] = useState(
    restoredFlow?.question ?? DEFAULT_QUESTION,
  );
  const [result, setResult] = useState<{ title: string; value: unknown }>();
  const [isLoading, setIsLoading] = useState(true);

  const loadEvidence = async (nextFilters = filters) => {
    setIsLoading(true);
    try {
      const response = await getEvidence(nextFilters);
      setEvidence(response);
      setSelectedIds(response.items.map((item) => item.id));
      setFilters(nextFilters);
      setAppliedFilters(nextFilters);
    } catch (error) {
      setResult({
        title: "Ошибка загрузки",
        value: error instanceof Error ? error.message : "Неизвестная ошибка.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initialise = async () => {
      try {
        const response = await getEvidence(restoredFlow?.filters ?? INITIAL_FILTERS);
        setEvidence(response);
        setSelectedIds(
          restoredFlow
            ? response.items
                .filter((item) => restoredFlow.selectedIds.includes(item.id))
                .map((item) => item.id)
            : response.items.map((item) => item.id),
        );
      } catch (error) {
        setResult({
          title: "Ошибка загрузки",
          value: error instanceof Error ? error.message : "Неизвестная ошибка.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    void initialise();
    void getSynapseConfig()
      .then(setSynapseConfig)
      .catch(() => undefined);
  }, [restoredFlow]);

  const ensureQuestion = () => {
    if (question.trim().length >= 5) return true;
    setResult({
      title: "Нужен вопрос",
      value: "Сформулируйте инженерный вопрос длиннее пяти символов.",
    });
    return false;
  };

  const handleSelectionChange = (id: string, selected: boolean) =>
    setSelectedIds((current) =>
      selected
        ? [...current, id]
        : current.filter((currentId) => currentId !== id),
    );

  const handleSelectAll = (selected: boolean) => {
    setSelectedIds(
      selected && evidence ? evidence.items.map((item) => item.id) : [],
    );
  };

  const handleAppliedFilterRemove = (key: EvidenceFilterKey) => {
    const nextFilters = {
      ...filters,
      [key]: INITIAL_FILTERS[key],
    };

    void loadEvidence(nextFilters);
  };

  const handleContinue = () => {
    if (!ensureQuestion()) return;

    saveAnalysisFlow({ question: question.trim(), selectedIds, filters });
    window.location.assign("/completeness");
  };

  return (
    <main className={scss.root}>
      <header className={scss.header}>
        <div>
          <p className={scss.eyebrow}>EOR · лабораторные доказательства</p>
          <img
            className={scss.logo}
            src="/pav-evidence-navigator-logo.svg"
            alt="ПАВ Evidence Navigator"
          />
          <h1 className={scss.visuallyHidden}>ПАВ Evidence Navigator</h1>
          <p className={scss.lead}>
            Сопоставляет лабораторные опыты по ПАВ и сохраняет связь с
            первоисточником.
          </p>
        </div>
        <span
          className={`${scss.synapseState} ${synapseConfig?.configured ? scss.ready : ""}`}
        >
          {synapseConfig?.configured
            ? `Synapse · ${synapseConfig.approval_mode}`
            : "Synapse не настроен"}
        </span>
      </header>
      <section className={scss.notice}>
        <strong>Что такое ПАВ?</strong> Молекула взаимодействует и с водой, и с
        нефтью. Стенд помогает инженеру проверить лабораторные доказательства, а
        не выбрать химию для закачки.
      </section>
      <EvidenceFilters
        value={filters}
        onChange={setFilters}
        onSubmit={() => void loadEvidence()}
        isLoading={isLoading}
      />
      {evidence && (
        <>
          <section className={scss.stats}>
            {[
              [evidence.summary.total, "опытов в выборке"],
              [evidence.summary.comparable, "сопоставимы"],
              [evidence.summary.limited, "с ограничениями"],
              [evidence.summary.not_comparable, "не сопоставимы"],
            ].map(([value, label], index) => (
              <div key={label as string}>
                <strong>{value}</strong>
                <div className={scss.statLabel}>
                  <span>{label}</span>
                  {COMPARABILITY_DESCRIPTIONS[index] && (
                    <Tooltip
                      contentProps={{ side: "top", sideOffset: 8 }}
                      target={
                        <button
                          className={scss.infoButton}
                          type="button"
                          aria-label={`Пояснение: ${label}`}
                        >
                          <IconRenderer icon="question" />
                        </button>
                      }
                    >
                      {COMPARABILITY_DESCRIPTIONS[index]}
                    </Tooltip>
                  )}
                </div>
              </div>
            ))}
          </section>
          <section className={scss.panel}>
            <div className={scss.sectionHeading}>
              <div>
                <p className={scss.eyebrow}>Доказательная база</p>
                <h2>Выберите опыты для анализа</h2>
                {hasFilterValues(appliedFilters) && (
                  <ul className={scss.appliedFilters} aria-label="Применённые фильтры">
                    {getAppliedFilters(appliedFilters).map((filter) => (
                      <li key={filter.key}>
                        <span>{filter.label}</span>
                        <button
                          type="button"
                          className={scss.removeFilterButton}
                          aria-label={`Удалить фильтр «${filter.label}»`}
                          onClick={() => handleAppliedFilterRemove(filter.key)}
                          disabled={isLoading}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <span>Выбрано: {selectedIds.length}</span>
            </div>
            <EvidenceTable
              items={evidence.items}
              selectedIds={selectedIds}
              onSelectionChange={handleSelectionChange}
              onSelectAll={handleSelectAll}
            />
          </section>
          <section className={scss.analysis}>
            <AnalysisPanel
              question={question}
              selectedCount={selectedIds.length}
              isLoading={isLoading}
              onQuestionChange={setQuestion}
              onContinue={handleContinue}
            />
          </section>
        </>
      )}
      {result && (
        <section className={scss.result}>
          <p className={scss.eyebrow}>Результат</p>
          <h2>{result.title}</h2>
          <pre>
            {typeof result.value === "string"
              ? result.value
              : JSON.stringify(result.value, null, 2)}
          </pre>
        </section>
      )}
    </main>
  );
};

export default EvidenceNavigator;
