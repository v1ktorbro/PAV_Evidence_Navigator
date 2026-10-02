import type { ChangeEvent, FC } from "react";

import Button from "../ui/Button/Button";
import scss from "./analysisPanel.module.scss";

interface IAnalysisPanel {
  question: string;
  selectedCount: number;
  isLoading: boolean;
  onQuestionChange: (question: string) => void;
  onContinue: () => void;
}

const AnalysisPanel: FC<IAnalysisPanel> = ({
  question,
  selectedCount,
  isLoading,
  onQuestionChange,
  onContinue,
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
        Выбрано: {selectedCount}. На следующем шаге можно проверить, хватает ли
        сведений для этого вопроса.
      </p>
      <div className={scss.actions}>
        <Button onClick={onContinue} disabled={isLoading}>
          Проверить полноту данных
        </Button>
      </div>
    </section>
  );
};

export default AnalysisPanel;
