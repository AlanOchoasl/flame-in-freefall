// DOI and license of the PSI datasets used by experiments.json, and the datasets left out because they
// have no license. Pure on purpose: it must not import node:fs, because the app type-checks files that
// import this one and Vercel installs only app/.

export interface DatasetLicense {
  spdx: string;
  url: string;
}

export interface CitationEntry {
  doi: string | null;
  publisher: string;
  license: DatasetLicense | null;
  /** Why the license is missing, when it is. */
  licenseNote: string | null;
}

/** A dataset that is NOT used, with the reason. Its test tables must not appear in experiments.json. */
export interface ExcludedEntry {
  doi: string | null;
  publisher: string;
  reason: string;
}

export interface DatasetCitations {
  schemaVersion: string;
  checkedOn: string;
  provenance: string;
  entries: Record<string, CitationEntry>;
  excluded: Record<string, ExcludedEntry>;
}

/** One cited dataset in experiments.json. */
export interface DatasetInfo {
  accession: string;
  pageUrl: string;
  doi: string | null;
  doiUrl: string | null;
  publisher: string | null;
  license: DatasetLicense | null;
  licenseNote: string | null;
  checkedOn: string;
}

/** One dataset left out of experiments.json, so the exclusion is declared in the data itself. */
export interface ExcludedDatasetInfo {
  accession: string;
  pageUrl: string;
  doi: string | null;
  doiUrl: string | null;
  publisher: string;
  reason: string;
  checkedOn: string;
}

const DOI_PATTERN = /^10\.\d{4,9}\/\S+$/;
const PSI_PAGE = 'https://psi.nasa.gov/physci/repo/data/investigations/';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function parseDoi(where: string, doi: unknown): string | null {
  if (doi !== null && (typeof doi !== 'string' || !DOI_PATTERN.test(doi))) {
    throw new Error(`dataset-citations: ${where}.doi "${String(doi)}" does not look like a DOI (10.xxxx/...)`);
  }
  return doi ?? null;
}

function parseEntry(accession: string, raw: unknown): CitationEntry {
  if (!isRecord(raw)) throw new Error(`dataset-citations: ${accession} is not an object`);
  const { doi, publisher, license, licenseNote } = raw;
  const parsedDoi = parseDoi(accession, doi);
  if (typeof publisher !== 'string' || publisher === '') throw new Error(`dataset-citations: ${accession}.publisher is missing`);
  if (licenseNote !== null && typeof licenseNote !== 'string') throw new Error(`dataset-citations: ${accession}.licenseNote must be text or null`);
  let parsedLicense: DatasetLicense | null = null;
  if (license !== null) {
    if (!isRecord(license) || typeof license.spdx !== 'string' || typeof license.url !== 'string') {
      throw new Error(`dataset-citations: ${accession}.license needs "spdx" and "url" (or null)`);
    }
    parsedLicense = { spdx: license.spdx, url: license.url };
  }
  if (parsedLicense === null) {
    throw new Error(`dataset-citations: ${accession} declares no license, so it cannot be under "entries". Move it to "excluded" with the reason.`);
  }
  return { doi: parsedDoi, publisher, license: parsedLicense, licenseNote: licenseNote ?? null };
}

function parseExcluded(accession: string, raw: unknown): ExcludedEntry {
  if (!isRecord(raw)) throw new Error(`dataset-citations: excluded.${accession} is not an object`);
  const { doi, publisher, reason } = raw;
  if (typeof publisher !== 'string' || publisher === '') throw new Error(`dataset-citations: excluded.${accession}.publisher is missing`);
  if (typeof reason !== 'string' || reason === '') throw new Error(`dataset-citations: excluded.${accession} needs a reason`);
  return { doi: parseDoi(`excluded.${accession}`, doi), publisher, reason };
}

/** Validates the parsed JSON of data/curation/dataset-citations.json. */
export function parseCitations(raw: unknown): DatasetCitations {
  if (!isRecord(raw)) throw new Error('dataset-citations: the file is not an object');
  const { schemaVersion, checkedOn, provenance, entries, excluded } = raw;
  if (typeof schemaVersion !== 'string') throw new Error('dataset-citations: schemaVersion is missing');
  if (typeof checkedOn !== 'string') throw new Error('dataset-citations: checkedOn is missing');
  if (typeof provenance !== 'string') throw new Error('dataset-citations: provenance is missing');
  if (!isRecord(entries)) throw new Error('dataset-citations: entries is missing');
  if (!isRecord(excluded)) throw new Error('dataset-citations: excluded is missing (use {} when nothing is left out)');
  const parsedEntries = Object.fromEntries(Object.entries(entries).map(([accession, entry]) => [accession, parseEntry(accession, entry)]));
  const parsedExcluded = Object.fromEntries(Object.entries(excluded).map(([accession, entry]) => [accession, parseExcluded(accession, entry)]));
  const both = Object.keys(parsedEntries).filter((accession) => accession in parsedExcluded);
  if (both.length > 0) throw new Error(`dataset-citations: ${both.join(', ')} is both used (entries) and excluded`);
  return { schemaVersion, checkedOn, provenance, entries: parsedEntries, excluded: parsedExcluded };
}

/**
 * One entry per investigation present in the records, in order of first appearance.
 * A record of an excluded dataset, or of one with no citation entry, is an error: no dataset is used
 * without a verified license.
 */
export function buildDatasets(records: { accession: string; pageUrl: string }[], citations: DatasetCitations): DatasetInfo[] {
  const pageUrls = new Map<string, string>();
  for (const { accession, pageUrl } of records) if (!pageUrls.has(accession)) pageUrls.set(accession, pageUrl);
  const leaked = [...pageUrls.keys()].filter((accession) => accession in citations.excluded);
  if (leaked.length > 0) {
    throw new Error(`Records of an excluded dataset reached the output: ${leaked.join(', ')}. See "excluded" in data/curation/dataset-citations.json.`);
  }
  const uncited = [...pageUrls.keys()].filter((accession) => !(accession in citations.entries));
  if (uncited.length > 0) {
    throw new Error(`Records of a dataset with no verified license: ${uncited.join(", ")}. Add it under "entries" (with its license) or "excluded" in data/curation/dataset-citations.json.`);
  }
  return [...pageUrls].map(([accession, pageUrl]) => {
    const entry = citations.entries[accession];
    return {
      accession,
      pageUrl,
      doi: entry?.doi ?? null,
      doiUrl: entry?.doi ? `https://doi.org/${entry.doi}` : null,
      publisher: entry?.publisher ?? null,
      license: entry?.license ?? null,
      licenseNote: entry ? entry.licenseNote : 'No citation entry for this investigation in data/curation/dataset-citations.json.',
      checkedOn: citations.checkedOn,
    };
  });
}

export function buildExcluded(citations: DatasetCitations): ExcludedDatasetInfo[] {
  return Object.entries(citations.excluded).map(([accession, entry]) => ({
    accession,
    pageUrl: `${PSI_PAGE}${accession}`,
    doi: entry.doi,
    doiUrl: entry.doi ? `https://doi.org/${entry.doi}` : null,
    publisher: entry.publisher,
    reason: entry.reason,
    checkedOn: citations.checkedOn,
  }));
}
