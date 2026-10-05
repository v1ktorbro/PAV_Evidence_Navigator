import scss from "./publicSources.module.scss";

import type { PublicSourcesResponse } from "../../assets/types/evidence";

interface IPublicSources {
  response?: PublicSourcesResponse;
  error?: string;
}

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

const PublicSources = ({ response, error }: IPublicSources) => {
  return (
    <section className={scss.root} aria-live="polite">
      <div className={scss.heading}>
        <div>
          <p className={scss.eyebrow}>Доказательная база</p>
          <h2>Открытые источники по ПАВ и химическому МУН</h2>
        </div>
        {response && <span>Найдено: {response.items.length}</span>}
      </div>

      {!response && !error && (
        <p className={scss.muted}>Ищем свежие публикации и проверяем ссылки…</p>
      )}

      {error && (
        <p className={scss.error}>
          Не удалось обновить открытые источники: {error}
        </p>
      )}

      {response && (
        <>
          <p className={scss.notice}>{response.discovery_mode}</p>
          <ul className={scss.list}>
            {response.items.map((source) => (
              <li key={source.id}>
                <div className={scss.cardHeader}>
                  <span className={scss.review}>{reviewLabel[source.review_status]}</span>
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
                <h3>{source.title}</h3>
                <p className={scss.publisher}>
                  {source.publisher} · {source.source_type}
                  {source.published ? ` · ${source.published}` : ""}
                </p>
                <p>{source.relevance}</p>
                <a href={source.url} target="_blank" rel="noreferrer">
                  Открыть источник
                </a>
              </li>
            ))}
          </ul>
          <p className={scss.safetyNotice}>{response.safety_notice}</p>
        </>
      )}
    </section>
  );
};

export default PublicSources;
