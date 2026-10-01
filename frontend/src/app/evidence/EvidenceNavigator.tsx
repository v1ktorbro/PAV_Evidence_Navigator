import { useEffect, useState } from "react";

import { createAnalysis, createSynapseProject, getEvidence, getSynapseConfig } from "../../api/evidence";
import type { EvidenceFiltersValue, EvidenceResponse, SynapseConfig } from "../../assets/types/evidence";
import AnalysisPanel from "../../components/AnalysisPanel/AnalysisPanel";
import EvidenceFilters from "../../components/EvidenceFilters/EvidenceFilters";
import EvidenceTable from "../../components/EvidenceTable/EvidenceTable";
import scss from "./evidenceNavigator.module.scss";

const INITIAL_FILTERS: EvidenceFiltersValue = { minTemperature: "", maxTemperature: "", maxSalinity: "", comparableOnly: false };
const DEFAULT_QUESTION = "Какие результаты по карбонатному керну при 70–90 °C можно корректно сопоставить и каких условий не хватает?";

const EvidenceNavigator = () => {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [evidence, setEvidence] = useState<EvidenceResponse>();
  const [synapseConfig, setSynapseConfig] = useState<SynapseConfig>();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [question, setQuestion] = useState(DEFAULT_QUESTION);
  const [result, setResult] = useState<{ title: string; value: unknown }>();
  const [isLoading, setIsLoading] = useState(true);

  const loadEvidence = async (nextFilters = filters) => {
    setIsLoading(true);
    try {
      const response = await getEvidence(nextFilters);
      setEvidence(response);
      setSelectedIds(response.items.map((item) => item.id));
    } catch (error) {
      setResult({ title: "Ошибка загрузки", value: error instanceof Error ? error.message : "Неизвестная ошибка." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initialise = async () => {
      try {
        const response = await getEvidence(INITIAL_FILTERS);
        setEvidence(response);
        setSelectedIds(response.items.map((item) => item.id));
      } catch (error) {
        setResult({ title: "Ошибка загрузки", value: error instanceof Error ? error.message : "Неизвестная ошибка." });
      } finally {
        setIsLoading(false);
      }
    };

    void initialise();
    void getSynapseConfig().then(setSynapseConfig).catch(() => undefined);
  }, []);

  const ensureQuestion = () => {
    if (question.trim().length >= 5) return true;
    setResult({ title: "Нужен вопрос", value: "Сформулируйте инженерный вопрос длиннее пяти символов." });
    return false;
  };

  const handleSelectionChange = (id: string, selected: boolean) => setSelectedIds((current) => selected ? [...current, id] : current.filter((currentId) => currentId !== id));
  const handleAnalyse = async () => {
    if (!ensureQuestion()) return;
    setIsLoading(true);
    try {
      const response = await createAnalysis(question.trim(), selectedIds);
      setResult({ title: "Проверяемая подборка", value: { summary: response.summary, source_fragments: response.items.map((item) => ({ experiment: item.id, excerpt: item.source.excerpt })) } });
    } catch (error) { setResult({ title: "Ошибка анализа", value: error instanceof Error ? error.message : "Неизвестная ошибка." }); } finally { setIsLoading(false); }
  };
  const handleSynapse = async () => {
    if (!ensureQuestion()) return;
    setIsLoading(true);
    try { const project = await createSynapseProject(question.trim(), selectedIds); setResult({ title: "Проект Synapse", value: project }); }
    catch (error) { setResult({ title: "Synapse недоступен", value: error instanceof Error ? error.message : "Неизвестная ошибка." }); } finally { setIsLoading(false); }
  };

  return <main className={scss.root}>
    <header className={scss.header}><div><p className={scss.eyebrow}>EOR · лабораторные доказательства</p><h1>ПАВ Evidence Navigator</h1><p className={scss.lead}>Сопоставляет лабораторные опыты по ПАВ и сохраняет связь с первоисточником.</p></div><span className={`${scss.synapseState} ${synapseConfig?.configured ? scss.ready : ""}`}>{synapseConfig?.configured ? `Synapse · ${synapseConfig.approval_mode}` : "Synapse не настроен"}</span></header>
    <section className={scss.notice}><strong>Что такое ПАВ?</strong> Молекула взаимодействует и с водой, и с нефтью. Стенд помогает инженеру проверить лабораторные доказательства, а не выбрать химию для закачки.</section>
    <EvidenceFilters value={filters} onChange={setFilters} onSubmit={() => void loadEvidence()} isLoading={isLoading} />
    {evidence && <><section className={scss.stats}>{[[evidence.summary.total, "опытов в выборке"], [evidence.summary.comparable, "сопоставимы"], [evidence.summary.limited, "с ограничениями"], [evidence.summary.not_comparable, "не сопоставимы"]].map(([value, label]) => <div key={label as string}><strong>{value}</strong><span>{label}</span></div>)}</section>
    <section className={scss.panel}><div className={scss.sectionHeading}><div><p className={scss.eyebrow}>Корпус опытов</p><h2>Матрица доказательств</h2></div><span>Выбрано: {selectedIds.length}</span></div><EvidenceTable items={evidence.items} selectedIds={selectedIds} onSelectionChange={handleSelectionChange} /></section>
    <section className={scss.grid}><AnalysisPanel question={question} selectedCount={selectedIds.length} isLoading={isLoading} onQuestionChange={setQuestion} onAnalyse={() => void handleAnalyse()} onSynapse={() => void handleSynapse()} /><article className={scss.panel}><p className={scss.eyebrow}>Проверка качества</p><h2>Что нельзя скрывать</h2><ul className={scss.gaps}>{evidence.summary.missing_fields.length ? evidence.summary.missing_fields.map((field) => <li key={field}>{field}</li>) : <li>В текущей выборке обязательные поля заполнены.</li>}</ul></article></section></>}
    {result && <section className={scss.result}><p className={scss.eyebrow}>Результат</p><h2>{result.title}</h2><pre>{typeof result.value === "string" ? result.value : JSON.stringify(result.value, null, 2)}</pre></section>}
  </main>;
};

export default EvidenceNavigator;
