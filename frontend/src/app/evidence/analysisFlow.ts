import type { EvidenceFiltersValue } from "../../assets/types/evidence";

const ANALYSIS_FLOW_STORAGE_KEY = "pav-evidence-navigator-analysis-flow";

export interface AnalysisFlow {
  question: string;
  selectedIds: string[];
  filters: EvidenceFiltersValue;
}

const isFiltersValue = (value: unknown): value is EvidenceFiltersValue => {
  if (typeof value !== "object" || value === null) return false;

  const filters = value as Record<string, unknown>;
  return (
    typeof filters.minTemperature === "string" &&
    typeof filters.maxTemperature === "string" &&
    typeof filters.maxSalinity === "string" &&
    typeof filters.comparableOnly === "boolean"
  );
};

export const saveAnalysisFlow = (flow: AnalysisFlow) => {
  try {
    window.sessionStorage.setItem(
      ANALYSIS_FLOW_STORAGE_KEY,
      JSON.stringify(flow),
    );
  } catch {
    // The page still works when browser storage is unavailable.
  }
};

export const getAnalysisFlow = (): AnalysisFlow | undefined => {
  try {
    const savedFlow = window.sessionStorage.getItem(ANALYSIS_FLOW_STORAGE_KEY);
    if (!savedFlow) return undefined;

    const value: unknown = JSON.parse(savedFlow);
    if (typeof value !== "object" || value === null) return undefined;

    const flow = value as Record<string, unknown>;
    if (
      typeof flow.question !== "string" ||
      !Array.isArray(flow.selectedIds) ||
      !flow.selectedIds.every((id) => typeof id === "string") ||
      !isFiltersValue(flow.filters)
    ) {
      return undefined;
    }

    return {
      question: flow.question,
      selectedIds: flow.selectedIds,
      filters: flow.filters,
    };
  } catch {
    return undefined;
  }
};
