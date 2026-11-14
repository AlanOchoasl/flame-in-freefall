import type { InvestigationSummary } from '../../../scripts/summarize';

// Experiment records follow the contract in openspec/changes/data-pipeline/design.md.

export interface VersionedFile {
  schemaVersion: number | string;
}

export interface ExperimentRecord {
  id: string;
  accession: string;
  pageUrl: string;
  dataQuality: unknown[];
  flameType: string;
  fuel: { species: string | null; raw: string | null; inferred: boolean };
  o2Fraction: number | null;
  pressureBar: number | null;
  pressureIsApproximate: boolean;
  tadK: number | null;
  zst: number | null;
  outcome: string;
  coolFlame: { value: boolean | null; raw: string | null };
  selfExtOrFlowTermRaw: string | null;
  tfpRaw: string | null;
  isPlottable: boolean;
  inMoonBaseZone: boolean;
}

export interface ExperimentsFile extends VersionedFile {
  stub?: boolean;
  generatedAt: string;
  plottableCount: number;
  investigations: InvestigationSummary[];
  records: ExperimentRecord[];
}

// Catalog, summaries and the per-investigation experiment summary are owned by their build scripts;
// importing their types keeps one source of truth, and a format change fails the app build loudly.
export type { CatalogDataset as CatalogFile, CatalogRecord } from '../../../scripts/catalog/types';
export type { SummariesFile, SummaryEntry } from '../../../scripts/lib/types';
export type { InvestigationSummary } from '../../../scripts/summarize';
export type { RankingProfilesFile } from '../lib/ranking';
