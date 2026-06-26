// Shared types for the deal memo. Mirrors the strict JSON schema the model
// is instructed to return.

export type Verdict = "GO" | "CAUTION" | "PASS";
export type LicenseStatus = "GREEN" | "YELLOW" | "RED";

export interface ExtractedMetrics {
  asking_price: string;
  revenue_ttm: string;
  ebitda_or_sde: string;
  asking_multiple: string;
  business_type: string;
  employee_count: string;
  years_in_operation: string;
}

export interface DimensionScore {
  score: number;
  notes: string;
}

export type DimensionKey =
  | "financials"
  | "operations"
  | "market"
  | "risk"
  | "ai_durability";

export type DimensionScores = Record<DimensionKey, DimensionScore>;

export interface Flags {
  red: string[];
  yellow: string[];
  green: string[];
}

export interface LicenseRisk {
  status: LicenseStatus;
  detail: string;
  mitigation: string;
}

export interface DealMemo {
  verdict: Verdict;
  verdict_rationale: string;
  extracted_metrics: ExtractedMetrics;
  dimension_scores: DimensionScores;
  flags: Flags;
  license_risk: LicenseRisk;
  diligence_priorities: string[];
  regional_notes: string;
}

// A document uploaded post-NDA, carried as base64 so it can be re-sent to the
// model for follow-up Q&A while keeping full deal context.
export interface DealDocument {
  name: string;
  // "application/pdf" | "image/png" | "image/jpeg" | "image/gif" | "image/webp"
  mediaType: string;
  // base64-encoded bytes, no data: prefix, no newlines
  data: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
