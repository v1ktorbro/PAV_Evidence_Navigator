import scss from "./analysisPanel.module.scss";

import type { ChangeEvent, FC } from "react";

import Button from "../ui/Button/Button";
import IconRenderer from "../ui/IconRenderer/IconRenderer";
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
  const isContinueDisabled = isLoading || selectedCount === 0;
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
        <Button
          className={scss.continueButton}
          onClick={onContinue}
          disabled={isContinueDisabled}
        >
          Проверить полноту данных
          <span className={scss.buttonIcon} aria-hidden="true">
            <IconRenderer icon="arrowRight" />
          </span>
        </Button>
      </div>
      <p className={scss.selectionHint} aria-live="polite">
        {selectedCount === 0
          ? "Выберите хотя бы один опыт для анализа."
          : String.fromCharCode(160)}
      </p>
    </section>
  );
};

export default AnalysisPanel;
