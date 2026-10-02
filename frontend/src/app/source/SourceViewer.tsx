import scss from "./sourceViewer.module.scss";

import { useEffect, useState } from "react";

import { getEvidenceItem } from "../../api/evidence";
import type { EvidenceItem } from "../../assets/types/evidence";
interface ISourceViewer {
  evidenceId: string;
}

const SourceViewer = ({ evidenceId }: ISourceViewer) => {
  const [item, setItem] = useState<EvidenceItem>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    const loadSource = async () => {
      try {
        setItem(await getEvidenceItem(evidenceId));
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Не удалось открыть фрагмент источника.",
        );
      }
    };

    void loadSource();
  }, [evidenceId]);

  if (error) {
    return (
      <main className={scss.root}>
        <article className={scss.panel}>
          <p className={scss.eyebrow}>Источник</p>
          <h1>Фрагмент недоступен</h1>
          <p className={scss.muted}>{error}</p>
        </article>
      </main>
    );
  }

  if (!item) {
    return (
      <main className={scss.root} aria-busy="true">
        <p className={scss.muted}>Открываем фрагмент источника…</p>
      </main>
    );
  }

  return (
    <main className={scss.root}>
      <article className={scss.panel}>
        <p className={scss.eyebrow}>Первоисточник · {item.id}</p>
        <h1>{item.source.document}</h1>
        <p className={scss.location}>{item.source.location}</p>
        <blockquote className={scss.excerpt}>{item.source.excerpt}</blockquote>
        <dl className={scss.details}>
          <div>
            <dt>Рецептура</dt>
            <dd>{item.formulation.name}</dd>
          </div>
          <div>
            <dt>Результат</dt>
            <dd>
              {item.result.value} {item.result.unit}
            </dd>
          </div>
        </dl>
      </article>
    </main>
  );
};

export default SourceViewer;
