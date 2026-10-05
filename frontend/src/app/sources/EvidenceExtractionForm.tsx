import scss from "./evidenceExtractionForm.module.scss";

import { useState } from "react";
import type { FormEvent } from "react";

import { createEvidenceReview } from "../../api/evidence";
import type { EvidenceReviewSubmission } from "../../assets/types/evidence";
import Button from "../../components/ui/Button/Button";

interface IExtractionSource {
  id: string;
  title: string;
  url: string;
}

interface IExtractionFormValue {
  formulationName: string;
  surfactantClass: string;
  concentration: string;
  temperature: string;
  salinity: string;
  rockType: string;
  permeability: string;
  method: string;
  resultLabel: string;
  resultValue: string;
  resultUnit: string;
  location: string;
  excerpt: string;
}

const INITIAL_FORM: IExtractionFormValue = {
  formulationName: "",
  surfactantClass: "",
  concentration: "",
  temperature: "",
  salinity: "",
  rockType: "",
  permeability: "",
  method: "",
  resultLabel: "",
  resultValue: "",
  resultUnit: "",
  location: "",
  excerpt: "",
};

const getSourceFromSearch = (): IExtractionSource | undefined => {
  const search = new URLSearchParams(window.location.search);
  const id = search.get("sourceId")?.trim();
  const title = search.get("sourceTitle")?.trim();
  const url = search.get("sourceUrl")?.trim();

  if (!id || !title || !url) return undefined;
  return { id, title, url };
};

const EvidenceExtractionForm = () => {
  const [source] = useState(getSourceFromSearch);
  const [value, setValue] = useState(INITIAL_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [submittedReviewId, setSubmittedReviewId] = useState<string>();

  const handleFieldChange = (field: keyof IExtractionFormValue, next: string) => {
    setValue((current) => ({ ...current, [field]: next }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!source) return;

    const submission: EvidenceReviewSubmission = {
      source,
      formulation: {
        name: value.formulationName.trim(),
        surfactant_class: value.surfactantClass.trim(),
        concentration_wt_pct: Number(value.concentration),
      },
      conditions: {
        temperature_c: Number(value.temperature),
        salinity_g_l: Number(value.salinity),
        rock_type: value.rockType.trim(),
        permeability_md: value.permeability.trim()
          ? Number(value.permeability)
          : null,
      },
      method: value.method.trim(),
      result: {
        label: value.resultLabel.trim(),
        value: Number(value.resultValue),
        unit: value.resultUnit.trim(),
      },
      citation: {
        location: value.location.trim(),
        excerpt: value.excerpt.trim(),
      },
    };

    setError(undefined);
    setIsSaving(true);
    void createEvidenceReview(submission)
      .then((review) => setSubmittedReviewId(review.id))
      .catch((submitError) =>
        setError(
          submitError instanceof Error
            ? submitError.message
            : "Не удалось отправить опыт на проверку.",
        ),
      )
      .finally(() => setIsSaving(false));
  };

  if (!source) {
    return (
      <main className={scss.root}>
        <section className={scss.panel}>
          <p className={scss.eyebrow}>Извлечение опыта</p>
          <h1>Источник не выбран</h1>
          <p className={scss.muted}>
            Вернитесь в каталог и выберите материал, из которого нужно
            извлечь лабораторный опыт.
          </p>
          <a className={scss.backLink} href="/sources">
            К каталогу источников
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className={scss.root}>
      <header className={scss.header}>
        <p className={scss.eyebrow}>Новый опыт · шаг 1 из 2</p>
        <h1>Извлечь лабораторный опыт</h1>
        <p className={scss.lead}>
          Заполните факт только по проверенному фрагменту первоисточника. До
          подтверждения ревьюером он не попадёт в инженерный анализ.
        </p>
      </header>

      <section className={scss.source} aria-label="Выбранный источник">
        <span>Источник</span>
        <strong>{source.title}</strong>
        <a href={source.url} target="_blank" rel="noreferrer">
          Открыть публикацию
        </a>
      </section>

      {submittedReviewId ? (
        <section className={scss.success}>
          <p className={scss.eyebrow}>Отправлено</p>
          <h2>Опыт {submittedReviewId} ожидает подтверждения</h2>
          <p>
            Он не участвует в анализе, пока ревьюер не проверит фрагмент,
            условия и методику.
          </p>
          <a className={scss.backLink} href="/reviews">
            Открыть очередь проверки
          </a>
        </section>
      ) : (
        <form className={scss.form} onSubmit={handleSubmit}>
          <fieldset disabled={isSaving}>
            <legend>Рецептура и условия</legend>
            <div className={scss.fieldGrid}>
              <label className={scss.fullField}>
                Название рецептуры
                <input
                  required
                  value={value.formulationName}
                  onChange={(event) =>
                    handleFieldChange("formulationName", event.target.value)
                  }
                />
              </label>
              <label>
                Класс ПАВ
                <input
                  required
                  value={value.surfactantClass}
                  onChange={(event) =>
                    handleFieldChange("surfactantClass", event.target.value)
                  }
                />
              </label>
              <label>
                Концентрация, масс. %
                <input
                  required
                  min="0"
                  step="any"
                  type="number"
                  value={value.concentration}
                  onChange={(event) =>
                    handleFieldChange("concentration", event.target.value)
                  }
                />
              </label>
              <label>
                Температура, °C
                <input
                  required
                  step="any"
                  type="number"
                  value={value.temperature}
                  onChange={(event) =>
                    handleFieldChange("temperature", event.target.value)
                  }
                />
              </label>
              <label>
                Минерализация, г/л
                <input
                  required
                  min="0"
                  step="any"
                  type="number"
                  value={value.salinity}
                  onChange={(event) =>
                    handleFieldChange("salinity", event.target.value)
                  }
                />
              </label>
              <label>
                Тип керна
                <input
                  required
                  value={value.rockType}
                  onChange={(event) =>
                    handleFieldChange("rockType", event.target.value)
                  }
                />
              </label>
              <label>
                Проницаемость, мД
                <input
                  min="0"
                  step="any"
                  type="number"
                  value={value.permeability}
                  onChange={(event) =>
                    handleFieldChange("permeability", event.target.value)
                  }
                />
              </label>
            </div>
          </fieldset>

          <fieldset disabled={isSaving}>
            <legend>Методика и результат</legend>
            <label>
              Методика опыта
              <textarea
                required
                minLength={5}
                rows={4}
                value={value.method}
                onChange={(event) => handleFieldChange("method", event.target.value)}
              />
            </label>
            <div className={scss.fieldGrid}>
              <label className={scss.fullField}>
                Измеренный показатель
                <input
                  required
                  value={value.resultLabel}
                  onChange={(event) =>
                    handleFieldChange("resultLabel", event.target.value)
                  }
                />
              </label>
              <label>
                Значение
                <input
                  required
                  step="any"
                  type="number"
                  value={value.resultValue}
                  onChange={(event) =>
                    handleFieldChange("resultValue", event.target.value)
                  }
                />
              </label>
              <label>
                Единица измерения
                <input
                  required
                  value={value.resultUnit}
                  onChange={(event) =>
                    handleFieldChange("resultUnit", event.target.value)
                  }
                />
              </label>
            </div>
          </fieldset>

          <fieldset disabled={isSaving}>
            <legend>Проверяемый фрагмент</legend>
            <label>
              Где расположен фрагмент (страница, таблица, рисунок)
              <input
                required
                value={value.location}
                onChange={(event) => handleFieldChange("location", event.target.value)}
              />
            </label>
            <label>
              Цитата или точное описание фрагмента
              <textarea
                required
                rows={5}
                value={value.excerpt}
                onChange={(event) => handleFieldChange("excerpt", event.target.value)}
              />
            </label>
          </fieldset>

          {error && <p className={scss.error}>{error}</p>}
          <div className={scss.formActions}>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Отправляем…" : "Отправить на проверку"}
            </Button>
            <a href="/sources">Отменить</a>
          </div>
        </form>
      )}
    </main>
  );
};

export default EvidenceExtractionForm;
