import scss from "./evidenceTable.module.scss";

import { useEffect, useRef } from "react";
import type { FC } from "react";

import type {
  ComparabilityStatus,
  EvidenceItem,
} from "../../assets/types/evidence";
import IconRenderer from "../ui/IconRenderer/IconRenderer";
interface IEvidenceTable {
  items: EvidenceItem[];
  selectedIds: string[];
  onSelectionChange: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
}

const statusLabel: Record<ComparabilityStatus, string> = {
  comparable: "сопоставимо",
  limited: "ограниченно",
  not_comparable: "нельзя сравнить",
};

const EvidenceTable: FC<IEvidenceTable> = ({
  items,
  selectedIds,
  onSelectionChange,
  onSelectAll,
}) => {
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);
  const isAllSelected =
    items.length > 0 && items.every((item) => selectedIds.includes(item.id));
  const isPartiallySelected = selectedIds.length > 0 && !isAllSelected;

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = isPartiallySelected;
    }
  }, [isPartiallySelected]);

  return (
    <div className={scss.wrapper}>
      <table className={scss.root}>
        <thead>
          <tr>
            <th>
              <input
                ref={selectAllCheckboxRef}
                aria-label="Выбрать все опыты"
                type="checkbox"
                checked={isAllSelected}
                onChange={(event) => onSelectAll(event.target.checked)}
              />
            </th>
            <th>Рецептура</th>
            <th>Условия</th>
            <th>Результат</th>
            <th>Сопоставимость</th>
            <th>Источник</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <input
                  aria-label={`Выбрать ${item.id}`}
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={(event) =>
                    onSelectionChange(item.id, event.target.checked)
                  }
                />
              </td>
              <td>
                <strong>{item.formulation.name}</strong>
                <small>
                  {item.formulation.surfactant_class},{" "}
                  {item.formulation.concentration_wt_pct}%
                </small>
              </td>
              <td>
                {item.conditions.temperature_c ?? "—"} °C ·{" "}
                {item.conditions.salinity_g_l ?? "—"} г/л
                <small>
                  {item.conditions.rock_type};{" "}
                  {item.conditions.permeability_md ?? "—"} мД
                </small>
              </td>
              <td>
                <strong>
                  {item.result.value} {item.result.unit}
                </strong>
                <small>{item.result.label}</small>
              </td>
              <td>
                <span
                  className={`${scss.badge} ${scss[item.comparability.status]}`}
                >
                  {statusLabel[item.comparability.status]}
                </span>
                <small>{item.comparability.reason}</small>
              </td>
              <td>
                <div className={scss.sourceContent}>
                  <div>
                    <strong>{item.source.document}</strong>
                    <small>{item.source.location}</small>
                  </div>
                  {item.source.url && (
                    <a
                      className={scss.sourceLink}
                      href={item.source.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Открыть фрагмент: ${item.source.document}, ${item.source.location}`}
                      title="Открыть фрагмент источника в новой вкладке"
                    >
                      <IconRenderer icon="externalLink" />
                    </a>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EvidenceTable;
