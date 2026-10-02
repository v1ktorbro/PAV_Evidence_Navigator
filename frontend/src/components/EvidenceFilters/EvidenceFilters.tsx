import type { ChangeEvent, FC } from "react";

import type { EvidenceFiltersValue } from "../../assets/types/evidence";
import Button from "../ui/Button/Button";
import IconRenderer from "../ui/IconRenderer/IconRenderer";
import Tooltip from "../ui/Tooltip/Tooltip";
import scss from "./evidenceFilters.module.scss";

interface IEvidenceFilters {
  value: EvidenceFiltersValue;
  onChange: (value: EvidenceFiltersValue) => void;
  onSubmit: () => void;
  hasAppliedFilters: boolean;
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
  hasAppliedFilters,
  isLoading,
}) => {
  const hasFilterValues =
    value.minTemperature.trim().length > 0 ||
    value.maxTemperature.trim().length > 0 ||
    value.maxSalinity.trim().length > 0 ||
    value.comparableOnly;
  const isSubmitDisabled =
    isLoading || (!hasFilterValues && !hasAppliedFilters);
  const submitLabel =
    !hasFilterValues && hasAppliedFilters
      ? "Сбросить фильтры"
      : "Применить фильтр";

  const handleValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...value,
      [event.target.name]:
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value,
    });
  };

  return (
    <section className={scss.root} aria-label="Фильтры опытов">
      <div className={scss.field}>
        <div className={scss.labelRow}>
          <label htmlFor="minTemperature">Температура от, °C</label>
          <InfoTooltip label="Температура от">
            Исключает опыты, в которых температура ниже указанного значения.
          </InfoTooltip>
        </div>
        <input
          id="minTemperature"
          name="minTemperature"
          type="number"
          value={value.minTemperature}
          onChange={handleValueChange}
          placeholder="70"
        />
      </div>
      <div className={scss.field}>
        <div className={scss.labelRow}>
          <label htmlFor="maxTemperature">Температура до, °C</label>
          <InfoTooltip label="Температура до">
            Исключает опыты, в которых температура выше указанного значения.
          </InfoTooltip>
        </div>
        <input
          id="maxTemperature"
          name="maxTemperature"
          type="number"
          value={value.maxTemperature}
          onChange={handleValueChange}
          placeholder="90"
        />
      </div>
      <div className={scss.field}>
        <div className={scss.labelRow}>
          <label htmlFor="maxSalinity">Минерализация до, г/л</label>
          <InfoTooltip label="Минерализация до">
            Оставляет опыты с минерализацией не выше указанного значения.
          </InfoTooltip>
        </div>
        <input
          id="maxSalinity"
          name="maxSalinity"
          type="number"
          value={value.maxSalinity}
          onChange={handleValueChange}
          placeholder="60"
        />
      </div>
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
          {isLoading ? "Загрузка…" : submitLabel}
        </span>
        <span className={scss.submitLabelPlaceholder} aria-hidden="true">
          Применить фильтр
        </span>
      </Button>
    </section>
  );
};

export default EvidenceFilters;
