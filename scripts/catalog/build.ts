import { cleanText, epochToIsoDate, parseUsDate, splitAccessions, splitList } from './normalize.ts';
import { normalizeSubArea } from './subarea.ts';
import { countUnreviewed, curatedBlock, validateCuration } from './curation.ts';
import { PSI_PAGE_BASE, SCHEMA_VERSION } from './types.ts';
import type {
  CatalogDataset,
  CatalogRecord,
  CurationEntry,
  CurationFile,
  SourceCatalog,
  SourceInvestigation,
  Vocabularies,
} from './types.ts';

export interface BuildInput {
  source: SourceCatalog;
  vocabularies: Vocabularies;
  curation: CurationFile;
  /** File names found in data/sample/psi/, used to link test tables by accession. */
  tableFiles: string[];
  now: Date;
}

export interface BuildResult {
  dataset: CatalogDataset;
  warnings: string[];
}

const ACCESSION_PATTERN = /^PSI-(\d+)$/;

function accessionNumber(accession: string): number {
  const match = ACCESSION_PATTERN.exec(accession);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

/** "PSI-10_..." belongs to PSI-10 but "PSI-100_..." does not: the underscore marks the boundary. */
export function testTablesFor(accession: string, tableFiles: string[]): string[] {
  return tableFiles.filter((name) => name.startsWith(`${accession}_`)).sort();
}

function toRecord(src: SourceInvestigation, entry: CurationEntry | undefined, tableFiles: string[], warnings: string[]): CatalogRecord {
  const accession = src.Accession;
  const start = parseUsDate(src['Investigation Start Date']);
  const end = parseUsDate(src['Investigation End Date']);
  for (const result of [start, end]) if (result.warning) warnings.push(`${accession}: ${result.warning}`);

  const subArea = normalizeSubArea(src['SubResearch Area']);
  if (!subArea.known) warnings.push(`${accession}: sub-area "${subArea.raw}" is not in the observed list`);

  const researchArea = cleanText(src['Research Area']);
  return {
    accession,
    title: cleanText(src.Title),
    acronym: cleanText(src.Acronym),
    researchArea,
    isCombustionScience: researchArea?.toLowerCase() === 'combustion science',
    projectType: cleanText(src['Project Type']),
    flightPlatform: cleanText(src['Flight Platform']),
    subResearchArea: { raw: subArea.raw, normalized: subArea.normalized },
    hardware: { names: splitList(src['Experiment Hardware']?.Name), links: splitList(src['Experiment Hardware']?.Link) },
    keywords: splitList(src.Keywords),
    relatedInvestigations: splitAccessions(src['Related Investigations']),
    startDate: start.value,
    endDate: end.value,
    releaseDate: epochToIsoDate(src['Public Release Date']),
    objectives: cleanText(src.Objectives),
    approach: cleanText(src.Approach),
    hypothesis: cleanText(src.Hypothesis),
    earthBenefits: cleanText(src['Research Impacts/Earth Benefits']),
    publicationTitles: splitList(src['Publication Title']),
    curated: curatedBlock(entry),
    testTables: testTablesFor(accession, tableFiles),
    pageUrl: `${PSI_PAGE_BASE}${accession}`,
    doi: entry?.doi ?? null,
  };
}

/** Merges the cached PSI catalog with the curation file. Throws one error listing every problem found. */
export function buildCatalog(input: BuildInput): BuildResult {
  const { source, vocabularies, curation, tableFiles, now } = input;
  const accessions = source.investigations.map((i) => i.Accession);

  const problems = validateCuration(curation, vocabularies, accessions);
  const seen = new Set<string>();
  for (const accession of accessions) {
    if (seen.has(accession)) problems.push(`Duplicate accession "${accession}" in the source catalog`);
    seen.add(accession);
  }
  if (problems.length > 0) throw new Error(`Catalog build failed:\n- ${problems.join('\n- ')}`);

  const warnings: string[] = [];
  const records = source.investigations
    .map((src) => toRecord(src, curation.entries[src.Accession], tableFiles, warnings))
    .sort((a, b) => accessionNumber(a.accession) - accessionNumber(b.accession));

  const dataset: CatalogDataset = {
    schemaVersion: SCHEMA_VERSION,
    generatedAt: now.toISOString(),
    sourceRetrieved: source._provenance?.retrieved ?? null,
    recordCount: records.length,
    unreviewedCount: records.reduce((sum, r) => sum + countUnreviewed(r.curated), 0),
    records,
  };
  return { dataset, warnings };
}

/** Accessions that still have at least one unreviewed curated value (used by --strict). */
export function accessionsWithUnreviewed(dataset: CatalogDataset): string[] {
  return dataset.records.filter((r) => countUnreviewed(r.curated) > 0).map((r) => r.accession);
}
