import scss from "./evidenceReviewQueue.module.scss";

import { useEffect, useState } from "react";

import {
  approveEvidenceReview,
  getEvidenceReviews,
} from "../../api/evidence";
import type { EvidenceReview } from "../../assets/types/evidence";
import Button from "../../components/ui/Button/Button";
import Loader from "../../components/ui/Loader/Loader";

const EvidenceReviewQueue = () => {
  const [reviews, setReviews] = useState<EvidenceReview[]>();
  const [error, setError] = useState<string>();
  const [approvingId, setApprovingId] = useState<string>();

  const loadReviews = async () => {
    try {
      setError(undefined);
      const response = await getEvidenceReviews();
      setReviews(response.items);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Не удалось загрузить очередь проверки.",
      );
    }
  };

  useEffect(() => {
    void loadReviews();
  }, []);

  if (!reviews && !error) {
    return (
      <main className={scss.root}>
        <Loader variant="page" label="Загружаем заявки на проверку…" />
      </main>
    );
  }

  const handleApproval = (reviewId: string) => {
    setApprovingId(reviewId);
    setError(undefined);
    void approveEvidenceReview(reviewId)
      .then((approvedReview) =>
        setReviews((current) =>
          current?.map((review) =>
            review.id === approvedReview.id ? approvedReview : review,
          ),
        ),
      )
      .catch((approvalError) =>
        setError(
          approvalError instanceof Error
            ? approvalError.message
            : "Не удалось подтвердить опыт.",
        ),
      )
      .finally(() => setApprovingId(undefined));
  };

  return (
    <main className={scss.root}>
      <header className={scss.header}>
        <div>
          <p className={scss.eyebrow}>Новый опыт · шаг 2 из 2</p>
          <h1>Очередь проверки опытов</h1>
          <p className={scss.lead}>
            Подтверждайте только записи, в которых можно проверить источник,
            цитату, условия измерения и методику. Подтверждённый опыт сразу
            появится в доказательной базе.
          </p>
        </div>
        <a className={scss.catalogLink} href="/sources">
          К каталогу источников
        </a>
      </header>

      {error && <p className={scss.error}>{error}</p>}

      {reviews?.length === 0 && (
        <section className={scss.panel}>
          <h2>Очередь пуста</h2>
          <p className={scss.muted}>
            Выберите источник в каталоге и извлеките из него лабораторный опыт.
          </p>
        </section>
      )}

      {reviews && reviews.length > 0 && (
        <section className={scss.list} aria-label="Заявки на проверку">
          {reviews.map((review) => {
            const isPending = review.review.status === "pending_review";
            return (
              <article key={review.id} className={scss.card}>
                <div className={scss.cardHeader}>
                  <span
                    className={
                      isPending ? scss.pendingStatus : scss.releasedStatus
                    }
                  >
                    {isPending ? "Ожидает проверки" : "Выпущено"}
                  </span>
                  <span className={scss.id}>{review.id}</span>
                </div>

                <div className={scss.heading}>
                  <div>
                    <h2>{review.formulation.name}</h2>
                    <p>
                      {review.formulation.surfactant_class}, {" "}
                      {review.formulation.concentration_wt_pct} масс. %
                    </p>
                  </div>
                  <strong>
                    {review.result.value} {review.result.unit}
                  </strong>
                </div>

                <dl className={scss.details}>
                  <div>
                    <dt>Условия</dt>
                    <dd>
                      {review.conditions.temperature_c} °C · {" "}
                      {review.conditions.salinity_g_l} г/л · {" "}
                      {review.conditions.rock_type}
                      {review.conditions.permeability_md !== null &&
                        ` · ${review.conditions.permeability_md} мД`}
                    </dd>
                  </div>
                  <div>
                    <dt>Методика</dt>
                    <dd>{review.method}</dd>
                  </div>
                  <div>
                    <dt>Результат</dt>
                    <dd>{review.result.label}</dd>
                  </div>
                  <div>
                    <dt>Фрагмент</dt>
                    <dd>
                      <a href={review.source.url} target="_blank" rel="noreferrer">
                        {review.source.document}
                      </a>
                      <span>{review.source.location}</span>
                      <q>{review.source.excerpt}</q>
                    </dd>
                  </div>
                </dl>

                {isPending ? (
                  <div className={scss.actions}>
                    <Button
                      type="button"
                      disabled={approvingId === review.id}
                      onClick={() => handleApproval(review.id)}
                    >
                      {approvingId === review.id
                        ? "Подтверждаем…"
                        : "Подтвердить и выпустить"}
                    </Button>
                    <p>После выпуска опыт станет доступен в анализе.</p>
                  </div>
                ) : (
                  <a className={scss.evidenceLink} href="/">
                    Открыть в доказательной базе
                  </a>
                )}
              </article>
            );
          })}
        </section>
      )}
      {approvingId && (
        <Loader variant="overlay" label="Выпускаем проверенный опыт…" />
      )}
    </main>
  );
};

export default EvidenceReviewQueue;
