import scss from "./dataCompleteness.module.scss";

import { useEffect, useMemo, useState } from "react";

import {
  createAnalysis,
  createSynapseProject,
  getEvidence,
  getSynapseConfig,
} from "../../api/evidence";
import type {
  EvidenceResponse,
  EvidenceSummary,
  SynapseConfig,
} from "../../assets/types/evidence";
import Button from "../../components/ui/Button/Button";
import IconRenderer from "../../components/ui/IconRenderer/IconRenderer";
import { getAnalysisFlow } from "./analysisFlow";
import SynapseStatus from "./SynapseStatus";

interface AnalysisResultValue {
  summary: EvidenceSummary;
  source_fragments: Array<{ experiment: string; excerpt: string }>;
}

type Result =
  | { title: string; value: AnalysisResultValue; kind: "analysis" }
  | { title: string; value: unknown; kind: "generic" };

const DataCompleteness = () => {
  const [flow] = useState(getAnalysisFlow);
  const [evidence, setEvidence] = useState<EvidenceResponse>();
  const [synapseConfig, setSynapseConfig] = useState<SynapseConfig>();
  const [result, setResult] = useState<Result>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!flow) {
      setIsLoading(false);
      return;
    }

    const loadDataCompleteness = async () => {
      try {
        const response = await getEvidence(flow.filters);
        setEvidence(response);
      } catch (error) {
        setResult({
          title: "Ошибка загрузки",
          value:
            error instanceof Error ? error.message : "Неизвестная ошибка.",
          kind: "generic",
        });
      } finally {
        setIsLoading(false);
      }
    };

    void loadDataCompleteness();
    void getSynapseConfig().then(setSynapseConfig).catch(() => undefined);
  }, [flow]);

  const selectedItems = useMemo(() => {
    if (!evidence || !flow) return [];

    const selectedIds = new Set(flow.selectedIds);
    return evidence.items.filter((item) => selectedIds.has(item.id));
  }, [evidence, flow]);
  const missingFields = useMemo(
    () =>
      Array.from(
        new Set(selectedItems.flatMap((item) => item.missing_fields)),
      ),
    [selectedItems],
  );

  const handleBack = () => window.location.assign("/?restore-analysis=1");
  const handleAnalyse = async () => {
    if (!flow) return;

    setIsLoading(true);
    try {
      const response = await createAnalysis(flow.question, flow.selectedIds);
      setResult({
        title: "Проверяемая подборка",
        kind: "analysis",
        value: {
          summary: response.summary,
          source_fragments: response.items.map((item) => ({
            experiment: item.id,
            excerpt: item.source.excerpt,
          })),
        },
      });
    } catch (error) {
      setResult({
        title: "Ошибка анализа",
        value:
          error instanceof Error ? error.message : "Неизвестная ошибка.",
        kind: "generic",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleSynapse = async () => {
    if (!flow) return;

    setIsLoading(true);
    try {
      const project = await createSynapseProject(flow.question, flow.selectedIds);
      setResult({
        title: "Проект Synapse",
        value: project,
        kind: "generic",
      });
    } catch (error) {
      setResult({
        title: "Synapse недоступен",
        value:
          error instanceof Error ? error.message : "Неизвестная ошибка.",
        kind: "generic",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadJson = (value: AnalysisResultValue) => {
    const json = JSON.stringify(value, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = "pav-evidence-collection.json";
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(downloadUrl);
  };

  if (!flow) {
    return (
      <main className={scss.root}>
        <article className={scss.panel}>
          <p className={scss.eyebrow}>Полнота данных</p>
          <h1>Сначала сформулируйте вопрос</h1>
          <p className={scss.muted}>
            Для проверки полноты нужны выбранные опыты и вопрос к ним.
          </p>
          <Button onClick={handleBack}>Вернуться к выбору опытов</Button>
        </article>
      </main>
    );
  }

  return (
    <main className={scss.root}>
      <header className={scss.header}>
        <div>
          <p className={scss.eyebrow}>Шаг 2 из 2 · полнота данных</p>
          <h1>Какие сведения отсутствуют</h1>
          <p className={scss.lead}>
            Проверяем {selectedItems.length} из {flow.selectedIds.length}{" "}
            выбранных опытов перед подготовкой вывода.
          </p>
        </div>
        <div
          className={`${scss.headerActions} ${
            synapseConfig?.configured ? "" : scss.synapseUnavailable
          }`}
        >
          <SynapseStatus config={synapseConfig} />
          <Button
            className={scss.changeQuestionButton}
            variant="secondary"
            onClick={handleBack}
          >
            <span className={scss.buttonIcon} aria-hidden="true">
              <IconRenderer icon="arrowLeft" />
            </span>
            Вернуться к настройке запроса
          </Button>
        </div>
      </header>

      <section className={scss.panel} aria-busy={isLoading}>
        <p className={scss.eyebrow}>Выбранные опыты</p>
        <h2>Полнота данных для вопроса</h2>
        <p className={scss.question}>{flow.question}</p>
        {isLoading && !evidence ? (
          <p className={scss.muted}>Проверяем сведения в выбранных опытах…</p>
        ) : (
          <ul className={scss.gaps}>
            {missingFields.length ? (
              missingFields.map((field) => <li key={field}>{field}</li>)
            ) : (
              <li>В выбранных опытах обязательные поля заполнены.</li>
            )}
          </ul>
        )}
      </section>

      <section className={scss.actions} aria-label="Следующие действия">
        <Button
          className={scss.collectEvidenceButton}
          variant="secondary"
          onClick={() => void handleAnalyse()}
          disabled={isLoading}
        >
          Собрать доказательства
          <span className={scss.buttonIcon} aria-hidden="true">
            <IconRenderer icon="analyticsReport" />
          </span>
        </Button>
        <Button
          className={scss.synapseButton}
          onClick={() => void handleSynapse()}
          disabled={isLoading}
        >
          Исследовать в Synapse
          <span className={scss.buttonIcon} aria-hidden="true">
            <IconRenderer icon="synapseResearch" />
          </span>
        </Button>
      </section>

      {result && (
        <section className={scss.result}>
          <p className={scss.eyebrow}>Результат</p>
          <div className={scss.resultHeader}>
            <h2>{result.title}</h2>
            {result.kind === "analysis" && (
              <button
                className={scss.downloadButton}
                type="button"
                aria-label="Скачать в JSON"
                title="Скачать в JSON"
                onClick={() => handleDownloadJson(result.value)}
              >
                <IconRenderer icon="download" />
              </button>
            )}
          </div>
          {result.kind === "analysis" ? (
            <div className={scss.analysisResult}>
              <dl className={scss.summary}>
                <div>
                  <dt>Всего опытов</dt>
                  <dd>{result.value.summary.total}</dd>
                </div>
                <div>
                  <dt>Сопоставимы</dt>
                  <dd>{result.value.summary.comparable}</dd>
                </div>
                <div>
                  <dt>Ограниченно сопоставимы</dt>
                  <dd>{result.value.summary.limited}</dd>
                </div>
                <div>
                  <dt>Не сопоставимы</dt>
                  <dd>{result.value.summary.not_comparable}</dd>
                </div>
              </dl>

              {result.value.summary.missing_fields.length > 0 && (
                <div>
                  <h3>Отсутствующие сведения</h3>
                  <ul className={scss.fieldList}>
                    {result.value.summary.missing_fields.map((field) => (
                      <li key={field}>{field}</li>
                    ))}
                  </ul>
                </div>
              )}

              <p className={scss.warning}>{result.value.summary.warning}</p>

              <div>
                <h3>Фрагменты источников</h3>
                <ul className={scss.sourceList}>
                  {result.value.source_fragments.map((fragment) => (
                    <li key={fragment.experiment} className={scss.sourceCard}>
                      <strong>{fragment.experiment}</strong>
                      <p>{fragment.excerpt}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <pre>
              {typeof result.value === "string"
                ? result.value
                : JSON.stringify(result.value, null, 2)}
            </pre>
          )}
        </section>
      )}
    </main>
  );
};

export default DataCompleteness;
