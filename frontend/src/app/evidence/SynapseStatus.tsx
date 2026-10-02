import scss from "./synapseStatus.module.scss";

import type { SynapseConfig } from "../../assets/types/evidence";
import Tooltip from "../../components/ui/Tooltip/Tooltip";

interface ISynapseStatus {
  config?: SynapseConfig;
}

const SynapseStatus = ({ config }: ISynapseStatus) => {
  if (config?.configured) {
    return (
      <span className={`${scss.root} ${scss.ready}`}>
        {`Synapse · ${config.approval_mode}`}
      </span>
    );
  }

  return (
    <Tooltip
      contentProps={{ side: "bottom", sideOffset: 8 }}
      target={
        <span
          className={`${scss.root} ${scss.unconfigured}`}
          tabIndex={0}
          aria-label="Предупреждение: Synapse не настроен. Наведите или сфокусируйте, чтобы узнать подробности."
        >
          <span className={scss.unconfiguredLabel}>Synapse не настроен</span>
        </span>
      }
    >
      <div className={scss.tooltipContent}>
        <strong>Исследование в Synapse недоступно</strong>
        <span>
          Интеграция запускает внешнее исследование по выбранным опытам. Пока
          она не настроена, этот шаг выполнить нельзя.
        </span>
        <span className={scss.tooltipSetup}>
          На сервере скопируйте <code>.env.example</code> в <code>.env</code>,
          заполните <code>SYNAPSE_URL</code>, <code>SYNAPSE_USER</code>,{" "}
          <code>SYNAPSE_PASSWORD</code> и <code>SYNAPSE_WORKFLOW_ID</code>,
          затем перезапустите backend.
        </span>
      </div>
    </Tooltip>
  );
};

export default SynapseStatus;
