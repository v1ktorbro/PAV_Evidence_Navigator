import scss from "./evidenceExtractionForm.module.scss";

import { useState } from "react";
import type { FormEvent } from "react";

import { createEvidenceReview } from "../../api/evidence";
import type { EvidenceReviewSubmission } from "../../assets/types/evidence";
import Button from "../../components/ui/Button/Button";
import Field from "../../components/ui/Field/Field";
import Input from "../../components/ui/Input/Input";
import Loader from "../../components/ui/Loader/Loader";
import NumberInput from "../../components/ui/NumberInput/NumberInput";
import Textarea from "../../components/ui/Textarea/Textarea";

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
            : "Не удалось отправить запись на проверку.",
        ),
      )
      .finally(() => setIsSaving(false));
  };

  if (!source) {
    return (
      <main className={scss.root}>
        <section className={scss.panel}>
          <p className={scss.eyebrow}>Создание записи</p>
          <h1>Источник не выбран</h1>
          <p className={scss.muted}>
            Вернитесь в каталог и выберите материал, из которого нужно
            создать запись опыта.
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
        <p className={scss.eyebrow}>Новая запись · шаг 1 из 2</p>
        <h1>Создать запись опыта</h1>
        <p className={scss.lead}>
          Перенесите сведения только из проверяемого фрагмента первоисточника.
          До подтверждения ревьюером запись не попадёт в инженерный анализ.
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
          <h2>Запись {submittedReviewId} ожидает проверки</h2>
          <p>
            Запись не участвует в анализе, пока ревьюер не проверит фрагмент,
            условия и методику.
          </p>
          <a className={scss.backLink} href="/reviews">
            Открыть очередь проверки
          </a>
        </section>
      ) : (
        <form className={scss.form} onSubmit={handleSubmit}>
          <fieldset disabled={isSaving}>
            <legend>Рецептура и условия опыта</legend>
            <div className={scss.fieldGrid}>
              <Field
                className={scss.fullField}
                htmlFor="formulationName"
                label="Название рецептуры"
                required
              >
                <Input
                  id="formulationName"
                  required
                  value={value.formulationName}
                  onChange={(event) =>
                    handleFieldChange("formulationName", event.target.value)
                  }
                />
              </Field>
              <Field htmlFor="surfactantClass" label="Класс ПАВ" required>
                <Input
                  id="surfactantClass"
                  required
                  value={value.surfactantClass}
                  onChange={(event) =>
                    handleFieldChange("surfactantClass", event.target.value)
                  }
                />
              </Field>
              <Field
                htmlFor="concentration"
                label="Концентрация, масс. %"
                required
              >
                <NumberInput
                  id="concentration"
                  required
                  min="0"
                  step="any"
                  increment={0.1}
                  value={value.concentration}
                  onValueChange={(nextValue) =>
                    handleFieldChange("concentration", nextValue)
                  }
                />
              </Field>
              <Field htmlFor="temperature" label="Температура, °C" required>
                <NumberInput
                  id="temperature"
                  required
                  step="any"
                  increment={1}
                  value={value.temperature}
                  onValueChange={(nextValue) =>
                    handleFieldChange("temperature", nextValue)
                  }
                />
              </Field>
              <Field
                htmlFor="salinity"
                label="Минерализация, г/л"
                required
              >
                <NumberInput
                  id="salinity"
                  required
                  min="0"
                  step="any"
                  increment={1}
                  value={value.salinity}
                  onValueChange={(nextValue) =>
                    handleFieldChange("salinity", nextValue)
                  }
                />
              </Field>
              <Field htmlFor="rockType" label="Тип керна" required>
                <Input
                  id="rockType"
                  required
                  value={value.rockType}
                  onChange={(event) =>
                    handleFieldChange("rockType", event.target.value)
                  }
                />
              </Field>
              <Field htmlFor="permeability" label="Проницаемость, мД">
                <NumberInput
                  id="permeability"
                  min="0"
                  step="any"
                  increment={1}
                  value={value.permeability}
                  onValueChange={(nextValue) =>
                    handleFieldChange("permeability", nextValue)
                  }
                />
              </Field>
            </div>
          </fieldset>

          <fieldset disabled={isSaving}>
            <legend>Методика и измеренный результат</legend>
            <Field htmlFor="method" label="Методика опыта" required>
              <Textarea
                id="method"
                required
                minLength={5}
                rows={4}
                value={value.method}
                onChange={(event) =>
                  handleFieldChange("method", event.target.value)
                }
              />
            </Field>
            <div className={scss.fieldGrid}>
              <Field
                className={scss.fullField}
                htmlFor="resultLabel"
                label="Измеренный показатель"
                required
              >
                <Input
                  id="resultLabel"
                  required
                  value={value.resultLabel}
                  onChange={(event) =>
                    handleFieldChange("resultLabel", event.target.value)
                  }
                />
              </Field>
              <Field htmlFor="resultValue" label="Значение" required>
                <NumberInput
                  id="resultValue"
                  required
                  step="any"
                  increment={0.1}
                  value={value.resultValue}
                  onValueChange={(nextValue) =>
                    handleFieldChange("resultValue", nextValue)
                  }
                />
              </Field>
              <Field htmlFor="resultUnit" label="Единица измерения" required>
                <Input
                  id="resultUnit"
                  required
                  value={value.resultUnit}
                  onChange={(event) =>
                    handleFieldChange("resultUnit", event.target.value)
                  }
                />
              </Field>
            </div>
          </fieldset>

          <fieldset disabled={isSaving}>
            <legend>Проверяемый фрагмент источника</legend>
            <Field
              htmlFor="location"
              label="Где расположен фрагмент (страница, таблица, рисунок)"
              required
            >
              <Input
                id="location"
                required
                value={value.location}
                onChange={(event) =>
                  handleFieldChange("location", event.target.value)
                }
              />
            </Field>
            <Field
              htmlFor="excerpt"
              label="Цитата или точное описание фрагмента"
              required
            >
              <Textarea
                id="excerpt"
                required
                rows={5}
                value={value.excerpt}
                onChange={(event) =>
                  handleFieldChange("excerpt", event.target.value)
                }
              />
            </Field>
          </fieldset>

          {error && <p className={scss.error}>{error}</p>}
          <div className={scss.formActions}>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Отправляем…" : "Отправить запись на проверку"}
            </Button>
            <a href="/sources">Отменить</a>
          </div>
        </form>
      )}
      {isSaving && (
        <Loader variant="overlay" label="Отправляем опыт на проверку…" />
      )}
    </main>
  );
};

export default EvidenceExtractionForm;
