import scss from "./sourcesCatalog.module.scss";

import { useEffect, useState } from "react";

import { getPublicSources } from "../../api/evidence";
import type {
  PublicSource,
  PublicSourcesResponse,
} from "../../assets/types/evidence";
import IconRenderer from "../../components/ui/IconRenderer/IconRenderer";
import Loader from "../../components/ui/Loader/Loader";
import Tooltip from "../../components/ui/Tooltip/Tooltip";

const reviewLabel = {
  context_only: "Справочный источник",
  candidate_for_extraction: "Есть данные для проверки",
  needs_full_text: "Нужен полный текст",
  needs_review: "Найдена автоматически — нужна проверка",
};

const accessLabel = {
  open: "Открыт",
  partial: "Частичный доступ",
  metadata_only: "Только карточка публикации",
  request: "По запросу",
};

const scopeLabel = {
  general_evidence: "Общая доказательная база",
  tatneft_case: "Кейс Татнефти",
};

const roleLabel = {
  laboratory_data: "Лабораторные данные",
  methodology: "Методика",
  review: "Обзор",
  case_context: "Контекст кейса",
  needs_classification: "Требуется классификация",
};

const getExtractionHref = (source: PublicSource) => {
  const query = new URLSearchParams({
    sourceId: source.id,
    sourceTitle: source.title,
    sourceUrl: source.url,
  });
  return `/sources/extract?${query}`;
};

const canExtractExperiment = (source: PublicSource) =>
  source.evidence_role === "laboratory_data" &&
  source.review_status === "candidate_for_extraction";

const SourcesCatalog = () => {
  const [response, setResponse] = useState<PublicSourcesResponse>();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  const loadSources = async () => {
    setIsLoading(true);
    setError(undefined);

    try {
      setResponse(await getPublicSources());
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Неизвестная ошибка поиска.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSources();
  }, []);

  if (isLoading && !response && !error) {
    return (
      <main className={scss.root}>
        <Loader variant="page" label="Ищем публикации и проверяем ссылки…" />
      </main>
    );
  }

  return (
    <main className={scss.root}>
      <header className={scss.header}>
        <div>
          <h1>
            Открытые источники по{" "}
            <span className={scss.term}>
              <span>ПАВ</span>
              <Tooltip
                contentProps={{ side: "top", sideOffset: 8 }}
                target={
                  <button
                    className={scss.termInfoButton}
                    type="button"
                    aria-label="Пояснение: ПАВ"
                  >
                    <IconRenderer icon="question" />
                  </button>
                }
              >
                ПАВ — поверхностно-активные вещества: соединения, молекулы
                которых взаимодействуют и с водой, и с нефтью.
              </Tooltip>
            </span>{" "}
            и{" "}
            <span className={scss.term}>
              <span>МУН</span>
              <Tooltip
                contentProps={{ side: "top", sideOffset: 8 }}
                target={
                  <button
                    className={scss.termInfoButton}
                    type="button"
                    aria-label="Пояснение: МУН"
                  >
                    <IconRenderer icon="question" />
                  </button>
                }
              >
                МУН — методы увеличения нефтеотдачи: технологии, которые
                помогают извлечь из пласта больше нефти после первичной и
                вторичной добычи.
              </Tooltip>
            </span>
          </h1>
          <p className={scss.lead}>
            Здесь собраны публикации, патенты и методики. Каталог обновляется
            при каждом открытии страницы, но найденные материалы не становятся
            инженерными фактами без проверки.
          </p>
        </div>
      </header>

      {error && (
        <section className={scss.panel}>
          <h2>Не удалось обновить каталог</h2>
          <p className={scss.error}>{error}</p>
        </section>
      )}

      {response && (
        <>
          <section className={scss.notice}>
            <div className={scss.noticeContent}>
              <strong>Найдено источников: {response.items.length}.</strong>
              <span>{response.discovery_mode}</span>
            </div>
            <button
              className={scss.reloadButton}
              type="button"
              aria-label="Обновить каталог источников"
              title="Обновить каталог"
              onClick={() => void loadSources()}
              disabled={isLoading}
            >
              <IconRenderer className={scss.reloadIcon} icon="reload" />
            </button>
          </section>

          <section className={scss.list} aria-label="Открытые источники">
            {response.items.map((source) => (
              <article key={source.id} className={scss.card}>
                <div className={scss.cardHeader}>
                  <span className={scss.role}>
                    {roleLabel[source.evidence_role]}
                  </span>
                  <span className={scss.review}>
                    {reviewLabel[source.review_status]}
                  </span>
                  <span className={scss.access}>
                    {accessLabel[source.access_level]}
                  </span>
                  <span className={scss.scope}>
                    {scopeLabel[source.source_scope]}
                  </span>
                  {source.availability === "unavailable" && (
                    <span className={scss.unavailable}>Ссылка недоступна</span>
                  )}
                </div>
                <h2 title={source.title}>{source.title}</h2>
                <p className={scss.publisher}>
                  {source.publisher} · {source.source_type}
                  {source.published ? ` · ${source.published}` : ""}
                </p>
                <p className={scss.relevance} title={source.relevance}>
                  {source.relevance}
                </p>
                <div className={scss.actions}>
                  {canExtractExperiment(source) && (
                    <a
                      className={scss.extractionLink}
                      href={getExtractionHref(source)}
                    >
                      <span>Добавить опыт</span>
                      <IconRenderer
                        className={scss.actionIcon}
                        icon="arrowRight"
                      />
                    </a>
                  )}
                  <a
                    className={scss.sourceLink}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    title="Открыть источник"
                    aria-label={`Открыть источник в новой вкладке: ${source.title}`}
                  >
                    <span>Открыть источник</span>
                    <IconRenderer
                      className={scss.actionIcon}
                      icon="externalLink"
                    />
                  </a>
                </div>
              </article>
            ))}
          </section>

          <p className={scss.safetyNotice}>{response.safety_notice}</p>
        </>
      )}
      {isLoading && response && (
        <Loader variant="overlay" label="Обновляем каталог источников…" />
      )}
    </main>
  );
};

export default SourcesCatalog;
