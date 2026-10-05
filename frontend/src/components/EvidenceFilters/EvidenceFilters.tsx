import scss from "./evidenceFilters.module.scss";

import type { ChangeEvent, FC } from "react";

import type { EvidenceFiltersValue } from "../../assets/types/evidence";
import Button from "../ui/Button/Button";
import Field from "../ui/Field/Field";
import IconRenderer from "../ui/IconRenderer/IconRenderer";
import NumberInput from "../ui/NumberInput/NumberInput";
import Tooltip from "../ui/Tooltip/Tooltip";
interface IEvidenceFilters {
  value: EvidenceFiltersValue;
  onChange: (value: EvidenceFiltersValue) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

interface IInfoTooltip {
  label: string;
  children: string;
}

const InfoTooltip: FC<IInfoTooltip> = ({ label, children }) => (
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
    {children}
  </Tooltip>
);

const EvidenceFilters: FC<IEvidenceFilters> = ({
  value,
  onChange,
  onSubmit,
  isLoading,
}) => {
  const hasFilterValues =
    value.minTemperature.trim().length > 0 ||
    value.maxTemperature.trim().length > 0 ||
    value.maxSalinity.trim().length > 0 ||
    value.comparableOnly;
  const isSubmitDisabled = isLoading || !hasFilterValues;

  const handleValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...value,
      [event.target.name]:
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value,
    });
  };

  const handleNumberValueChange = (
    field: "minTemperature" | "maxTemperature" | "maxSalinity",
    nextValue: string,
  ) => {
    onChange({ ...value, [field]: nextValue });
  };

  return (
    <section className={scss.root} aria-label="Фильтры опытов">
      <Field
        htmlFor="minTemperature"
        label="Температура от, °C"
        action={
          <InfoTooltip label="Температура от">
            Исключает опыты, в которых температура ниже указанного значения.
          </InfoTooltip>
        }
      >
        <NumberInput
          id="minTemperature"
          name="minTemperature"
          value={value.minTemperature}
          increment={1}
          onValueChange={(nextValue) =>
            handleNumberValueChange("minTemperature", nextValue)
          }
          placeholder="70"
        />
      </Field>
      <Field
        htmlFor="maxTemperature"
        label="Температура до, °C"
        action={
          <InfoTooltip label="Температура до">
            Исключает опыты, в которых температура выше указанного значения.
          </InfoTooltip>
        }
      >
        <NumberInput
          id="maxTemperature"
          name="maxTemperature"
          value={value.maxTemperature}
          increment={1}
          onValueChange={(nextValue) =>
            handleNumberValueChange("maxTemperature", nextValue)
          }
          placeholder="90"
        />
      </Field>
      <Field
        htmlFor="maxSalinity"
        label="Минерализация до, г/л"
        action={
          <InfoTooltip label="Минерализация до">
            Оставляет опыты с минерализацией не выше указанного значения.
          </InfoTooltip>
        }
      >
        <NumberInput
          id="maxSalinity"
          name="maxSalinity"
          value={value.maxSalinity}
          min="0"
          increment={1}
          onValueChange={(nextValue) =>
            handleNumberValueChange("maxSalinity", nextValue)
          }
          placeholder="60"
        />
      </Field>
      <div className={scss.checkbox}>
        <input
          id="comparableOnly"
          name="comparableOnly"
          type="checkbox"
          checked={value.comparableOnly}
          onChange={handleValueChange}
        />
        <label htmlFor="comparableOnly">Только сопоставимые</label>
        <InfoTooltip label="Только сопоставимые">
          Оставляет только опыты без ограничений сопоставимости; записи с
          ограничениями и несопоставимые скрываются.
        </InfoTooltip>
      </div>
      <Button
        className={scss.submitButton}
        onClick={onSubmit}
        disabled={isSubmitDisabled}
      >
        <span className={scss.submitLabel}>
          {isLoading ? "Загрузка…" : "Применить фильтры"}
        </span>
        <span className={scss.submitLabelPlaceholder} aria-hidden="true">
          Применить фильтры
        </span>
      </Button>
    </section>
  );
};

export default EvidenceFilters;
