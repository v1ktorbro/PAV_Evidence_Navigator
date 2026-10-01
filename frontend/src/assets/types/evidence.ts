export type ComparabilityStatus = "comparable" | "limited" | "not_comparable";

export interface EvidenceItem {
  id: string;
  formulation: {
    name: string;
    surfactant_class: string;
    concentration_wt_pct: number;
  };
  conditions: {
    temperature_c: number | null;
    salinity_g_l: number | null;
    rock_type: string;
    permeability_md: number | null;
  };
  result: { label: string; value: number; unit: string };
  comparability: { status: ComparabilityStatus; reason: string };
  missing_fields: string[];
  source: {
    document: string;
    location: string;
    excerpt: string;
    url?: string;
  };
}

export interface EvidenceSummary {
  total: number;
  comparable: number;
  limited: number;
  not_comparable: number;
  missing_fields: string[];
  warning: string;
}

export interface EvidenceResponse {
  items: EvidenceItem[];
  summary: EvidenceSummary;
}
export interface AnalysisResponse {
  question: string;
  items: EvidenceItem[];
  summary: EvidenceSummary;
  synapse_prompt: string;
}
export interface SynapseConfig {
  configured: boolean;
  approval_mode: string;
}
export interface SynapseProject {
  status: string;
  awaiting_approval: boolean;
  synapse_url: string;
  result_preview: string;
}

export interface EvidenceFiltersValue {
  minTemperature: string;
  maxTemperature: string;
  maxSalinity: string;
  comparableOnly: boolean;
}
