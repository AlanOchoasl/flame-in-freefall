export const SOURCE_FIELDS = [
  "objectives",
  "approach",
  "hypothesis",
  "earthBenefits",
] as const;

export type SourceField = (typeof SOURCE_FIELDS)[number];

export interface InvestigationSource {
  accession: string;
  title: string;
  objectives: string;
  approach: string;
  hypothesis: string;
  earthBenefits: string;
}

export interface SummaryEntry {
  accession: string;
  summary: string;
  fireSafetyRelevance: string;
  aiGenerated: boolean;
  model: string;
  generatedAt: string;
  promptVersion: string;
  sourceFields: SourceField[];
  reviewed: boolean;
}

export interface SummariesFile {
  schemaVersion: string;
  entries: SummaryEntry[];
}

export interface CheckOptions {
  strict?: boolean;
  maxWords?: {
    summary: number;
    fireSafetyRelevance: number;
  };
}

export interface CheckIssue {
  accession: string;
  field?: string;
  message: string;
}

export interface CheckResult {
  checked: number;
  issues: CheckIssue[];
}
