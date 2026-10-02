import type { ChangeEvent, FC } from "react";

import Button from "../ui/Button/Button";
import scss from "./analysisPanel.module.scss";

interface IAnalysisPanel {
  question: string;
  selectedCount: number;
  isLoading: boolean;
  onQuestionChange: (question: string) => void;
  onAnalyse: () => void;
  onSynapse: () => void;
}

const AnalysisPanel: FC<IAnalysisPanel> = ({
  question,
  selectedCount,
  isLoading,
  onQuestionChange,
  onAnalyse,
  onSynapse,
}) => {
  const handleQuestionChange = (event: ChangeEvent<HTMLTextAreaElement>) =>
    onQuestionChange(event.target.value);
  return (
    <section className={scss.root}>
      <div>
        <p className={scss.eyebrow}>Анализ запроса</p>
        <h2>Сформулируйте вопрос к выбранным опытам</h2>
      </div>
      <textarea
        value={question}
        rows={5}
        onChange={handleQuestionChange}
        aria-label="Вопрос к выбранным опытам"
      />
      <p className={scss.hint}>
        Выбрано: {selectedCount}. Synapse получит только выбранные записи,
        условия и ссылки на фрагменты корпуса.
      </p>
      <div className={scss.actions}>
        <Button variant="secondary" onClick={onAnalyse} disabled={isLoading}>
          Собрать доказательства
        </Button>
        <Button onClick={onSynapse} disabled={isLoading}>
          Исследовать в Synapse
        </Button>
      </div>
    </section>
  );
};

export default AnalysisPanel;
