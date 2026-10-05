import scss from "./synapseStatus.module.scss";

import { useState } from "react";

import type { SynapseConfig } from "../../assets/types/evidence";

interface ISynapseStatus {
  config?: SynapseConfig;
  isLoading: boolean;
  hasError: boolean;
  onRefresh: () => void;
}

const getApprovalModeLabel = (approvalMode: string) => {
  if (approvalMode === "human") return "с подтверждением оператора";
  if (approvalMode === "auto") return "автоматический";
  return approvalMode;
};

const SynapseStatus = ({
  config,
  isLoading,
  hasError,
  onRefresh,
}: ISynapseStatus) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isConfigured = Boolean(config?.configured);
  const state = isLoading
    ? "loading"
    : hasError
      ? "error"
      : isConfigured
        ? "ready"
        : "warning";
  const title = isLoading
    ? "Проверяем Synapse"
    : hasError
      ? "Статус Synapse неизвестен"
      : isConfigured
        ? "Synapse настроен"
        : "Synapse не настроен";
  const description = isLoading
    ? "Запрашиваем состояние интеграции."
    : hasError
      ? "Не удалось получить состояние интеграции."
      : isConfigured
        ? "Внешнее исследование можно запустить после выбора опытов."
        : "Внешнее исследование пока недоступно.";

  return (
    <aside
      className={`${scss.root} ${scss[state]} ${
        isExpanded ? scss.expanded : ""
      }`}
      aria-label="Статус интеграции Synapse"
    >
      <button
        className={scss.trigger}
        type="button"
        aria-expanded={isExpanded}
        aria-controls="synapse-status-details"
        onClick={() => setIsExpanded((current) => !current)}
      >
        <span className={scss.triggerContent}>
          <span className={scss.indicator} aria-hidden="true" />
          <span className={scss.summary}>
            <strong>{title}</strong>
            <span>
              {isConfigured && !isLoading && !hasError
                ? `Режим: ${getApprovalModeLabel(
                    config?.approval_mode ?? "",
                  )}`
                : description}
            </span>
          </span>
          <span className={scss.expandIcon} aria-hidden="true" />
        </span>
      </button>
      <div
        className={scss.details}
        id="synapse-status-details"
        aria-hidden={!isExpanded}
      >
        <div className={scss.detailsContent}>
          <div className={scss.detailsBody}>
            <p>{description}</p>
            {isConfigured && !isLoading && !hasError && (
              <dl>
                <div>
                  <dt>Режим запуска</dt>
                  <dd>{getApprovalModeLabel(config?.approval_mode ?? "")}</dd>
                </div>
                <div>
                  <dt>Действие</dt>
                  <dd>Выберите опыты и перейдите к анализу.</dd>
                </div>
              </dl>
            )}
            {!isConfigured && !isLoading && !hasError && (
              <p className={scss.setupHint}>
                Для подключения заполните параметры Synapse в <code>.env</code>{" "}
                на сервере и перезапустите backend.
              </p>
            )}
            {hasError && (
              <button
                className={scss.refreshButton}
                type="button"
                onClick={onRefresh}
                disabled={isLoading}
              >
                Проверить ещё раз
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SynapseStatus;
