import type { ChangeEvent, FC } from "react";

import type { EvidenceFiltersValue } from "../../assets/types/evidence";
import Button from "../ui/Button/Button";
import scss from "./evidenceFilters.module.scss";

interface IEvidenceFilters {
  value: EvidenceFiltersValue;
  onChange: (value: EvidenceFiltersValue) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const EvidenceFilters: FC<IEvidenceFilters> = ({ value, onChange, onSubmit, isLoading }) => {
  const handleValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, [event.target.name]: event.target.type === "checkbox" ? event.target.checked : event.target.value });
  };

  return <section className={scss.root} aria-label="Фильтры опытов">
    <label>Температура от, °C<input name="minTemperature" type="number" value={value.minTemperature} onChange={handleValueChange} placeholder="70" /></label>
    <label>Температура до, °C<input name="maxTemperature" type="number" value={value.maxTemperature} onChange={handleValueChange} placeholder="90" /></label>
    <label>Минерализация до, г/л<input name="maxSalinity" type="number" value={value.maxSalinity} onChange={handleValueChange} placeholder="60" /></label>
    <label className={scss.checkbox}><input name="comparableOnly" type="checkbox" checked={value.comparableOnly} onChange={handleValueChange} />Только сопоставимые</label>
    <Button onClick={onSubmit} disabled={isLoading}>{isLoading ? "Загрузка…" : "Применить фильтр"}</Button>
  </section>;
};

export default EvidenceFilters;
