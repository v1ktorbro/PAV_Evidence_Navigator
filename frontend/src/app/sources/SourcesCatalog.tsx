import scss from "./sourcesCatalog.module.scss";

import { useEffect, useState } from "react";

import { getPublicSources } from "../../api/evidence";
import type { PublicSourcesResponse } from "../../assets/types/evidence";

const reviewLabel = {
  context_only: "Справочный источник",
  candidate_for_extraction: "Можно проверить для извлечения",
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

const SourcesCatalog = () => {
  const [response, setResponse] = useState<PublicSourcesResponse>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    void getPublicSources()
      .then(setResponse)
      .catch((loadError) =>
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Неизвестная ошибка поиска.",
        ),
      );
  }, []);

  return (
    <main className={scss.root}>
      <header className={scss.header}>
        <div>
          <p className={scss.eyebrow}>Каталог источников</p>
          <h1>Открытые источники по ПАВ и МУН</h1>
          <p className={scss.lead}>
            Здесь собраны публикации, патенты и методики. Каталог обновляется
            при каждом открытии страницы, но найденные материалы не становятся
            инженерными фактами без проверки.
          </p>
        </div>
      </header>

      {!response && !error && (
        <section className={scss.panel} aria-busy="true">
          <p className={scss.muted}>Ищем свежие публикации и проверяем ссылки…</p>
        </section>
      )}

      {error && (
        <section className={scss.panel}>
          <h2>Не удалось обновить каталог</h2>
          <p className={scss.error}>{error}</p>
        </section>
      )}

      {response && (
        <>
          <section className={scss.notice}>
            <strong>Найдено источников: {response.items.length}.</strong>
            <span>{response.discovery_mode}</span>
          </section>

          <section className={scss.list} aria-label="Открытые источники">
            {response.items.map((source) => (
              <article key={source.id} className={scss.card}>
                <div className={scss.cardHeader}>
                  <span className={scss.review}>
                    {reviewLabel[source.review_status]}
                  </span>
                  <span className={scss.access}>
                    {accessLabel[source.access_level]}
                  </span>
                  <span className={scss.scope}>
                    {scopeLabel[source.source_scope]}
                  </span>
                  <span className={scss.role}>
                    {roleLabel[source.evidence_role]}
                  </span>
                  {source.availability === "unavailable" && (
                    <span className={scss.unavailable}>Ссылка недоступна</span>
                  )}
                </div>
                <h2>{source.title}</h2>
                <p className={scss.publisher}>
                  {source.publisher} · {source.source_type}
                  {source.published ? ` · ${source.published}` : ""}
                </p>
                <p>{source.relevance}</p>
                <a href={source.url} target="_blank" rel="noreferrer">
                  Открыть источник
                </a>
              </article>
            ))}
          </section>

          <p className={scss.safetyNotice}>{response.safety_notice}</p>
        </>
      )}
    </main>
  );
};

export default SourcesCatalog;
