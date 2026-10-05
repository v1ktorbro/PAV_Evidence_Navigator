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
  answer: {
    confirmed_facts: Array<{
      experiment_id: string;
      metric: string;
      value: number;
      unit: string;
      conditions: Record<string, string | number | null>;
      citation: { document: string; location: string; url: string };
    }>;
    limitations: Array<{ experiment_id: string; reason: string }>;
    external_escalation: boolean;
    retry_policy: string;
  };
  synapse_prompt: string;
}

export interface QualityGate {
  value?: boolean;
  value_pct?: number;
  threshold_pct?: number;
  passed: boolean;
  description?: string;
  released_records?: number;
  audited_records?: number;
  checked_questions?: number;
}

export interface QualityReport {
  acceptance_gates: {
    all_released_numeric_facts_traceable: QualityGate;
    extraction_completeness: QualityGate;
    control_answer_accuracy: QualityGate;
    repeat_without_escalation: QualityGate;
  };
  quarantined_records: Array<{
    id: string;
    gaps: string[];
    reason: string;
  }>;
  production_ready: boolean;
  production_blocker: string;
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
