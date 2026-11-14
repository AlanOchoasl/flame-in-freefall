// Shapes for the investigation catalog. See openspec/changes/investigation-catalog/design.md.

export const SCHEMA_VERSION = '1.0.0';
export const PSI_PAGE_BASE = 'https://psi.nasa.gov/physci/repo/data/investigations/';

/** Fields read from the cached PSI catalog JSON (all optional: PSI leaves many empty). */
export interface SourceInvestigation {
  Accession: string;
  Title?: string;
  Acronym?: string;
  'Research Area'?: string;
  'SubResearch Area'?: string;
  'Project Type'?: string;
  'Flight Platform'?: string;
  'Experiment Hardware'?: { Name?: string; Link?: string };
  Keywords?: string;
  'Related Investigations'?: string;
  'Investigation Start Date'?: string;
  'Investigation End Date'?: string;
  'Public Release Date'?: number;
  Objectives?: string;
  Approach?: string;
  Hypothesis?: string;
  'Research Impacts/Earth Benefits'?: string;
  'Publication Title'?: string;
}

export interface SourceCatalog {
  _provenance?: { retrieved?: string };
  investigations: SourceInvestigation[];
}

/** A hand-curated value with where it came from and whether a person reviewed it. */
export interface Reviewed<T> {
  value: T;
  source: string | null;
  reviewed: boolean;
}

export interface CuratedBlock {
  hardwareGroup: Reviewed<string | null>;
  fuelPhase: Reviewed<string[]>;
  topics: Reviewed<string[]>;
  measurements: Reviewed<string[]>;
}

export type CuratedFieldName = keyof CuratedBlock;

export interface CurationEntry extends Partial<CuratedBlock> {
  doi?: string | null;
}

export interface CurationFile {
  schemaVersion: string;
  entries: Record<string, CurationEntry>;
}

/** Allowed values for the curated fields; lives in data/curation/vocabularies.json. */
export interface Vocabularies {
  schemaVersion: string;
  hardwareGroup: string[];
  fuelPhase: string[];
  topics: string[];
}

export interface CatalogRecord {
  accession: string;
  title: string | null;
  acronym: string | null;
  researchArea: string | null;
  isCombustionScience: boolean;
  projectType: string | null;
  flightPlatform: string | null;
  subResearchArea: { raw: string | null; normalized: string | null };
  hardware: { names: string[]; links: string[] };
  keywords: string[];
  relatedInvestigations: string[];
  startDate: string | null;
  endDate: string | null;
  releaseDate: string | null;
  objectives: string | null;
  approach: string | null;
  hypothesis: string | null;
  earthBenefits: string | null;
  publicationTitles: string[];
  curated: CuratedBlock;
  testTables: string[];
  pageUrl: string;
  doi: string | null;
}

export interface CatalogDataset {
  schemaVersion: string;
  generatedAt: string;
  sourceRetrieved: string | null;
  recordCount: number;
  unreviewedCount: number;
  records: CatalogRecord[];
}
