// Experiments follow the contract in openspec/changes/data-pipeline/design.md.
// Summaries are typed provisionally (see SummaryEntry) until ai-summaries publishes its record type.

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
  records: ExperimentRecord[];
}

// The catalog types are owned by the build script; importing them keeps one source of truth.
export type { CatalogDataset as CatalogFile, CatalogRecord } from '../../../scripts/catalog/types';

// PROVISIONAL: field names follow the wording of the ai-summaries spec (model, generation date,
// prompt version, reviewed flag). Align them with the real summaries.json when it is published.
export interface SummaryEntry {
  accession: string;
  model: string;
  generatedAt: string;
  promptVersion: string;
  reviewed: boolean;
}

export interface SummariesFile extends VersionedFile {
  summaries: SummaryEntry[];
}
