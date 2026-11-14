// Experiments follow the contract in openspec/changes/data-pipeline/design.md.
// Summaries are typed minimally until ai-summaries publishes its record type; replace it then.

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

export interface SummariesFile extends VersionedFile {
  summaries: unknown[];
}
