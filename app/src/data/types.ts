// Experiments follow the contract in openspec/changes/data-pipeline/design.md.
// Catalog and summaries are typed minimally until their owners publish the record types
// (investigation-catalog task 1.1, ai-summaries); replace these two when they exist.

export interface VersionedFile {
  schemaVersion: number;
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

export interface CatalogFile extends VersionedFile {
  records: unknown[];
}

export interface SummariesFile extends VersionedFile {
  summaries: unknown[];
}
