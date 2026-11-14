// DOI and license of the PSI datasets used by experiments.json. Pure on purpose: it must not
// import node:fs, because the app type-checks files that import this one and Vercel installs only app/.

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

export interface DatasetCitations {
  schemaVersion: string;
  checkedOn: string;
  provenance: string;
  entries: Record<string, CitationEntry>;
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

const DOI_PATTERN = /^10\.\d{4,9}\/\S+$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function parseEntry(accession: string, raw: unknown): CitationEntry {
  if (!isRecord(raw)) throw new Error(`dataset-citations: ${accession} is not an object`);
  const { doi, publisher, license, licenseNote } = raw;
  if (doi !== null && (typeof doi !== 'string' || !DOI_PATTERN.test(doi))) {
    throw new Error(`dataset-citations: ${accession}.doi "${String(doi)}" does not look like a DOI (10.xxxx/...)`);
  }
  if (typeof publisher !== 'string' || publisher === '') throw new Error(`dataset-citations: ${accession}.publisher is missing`);
  if (licenseNote !== null && typeof licenseNote !== 'string') throw new Error(`dataset-citations: ${accession}.licenseNote must be text or null`);
  let parsedLicense: DatasetLicense | null = null;
  if (license !== null) {
    if (!isRecord(license) || typeof license.spdx !== 'string' || typeof license.url !== 'string') {
      throw new Error(`dataset-citations: ${accession}.license needs "spdx" and "url" (or null)`);
    }
    parsedLicense = { spdx: license.spdx, url: license.url };
  }
  if (parsedLicense === null && licenseNote === null) {
    throw new Error(`dataset-citations: ${accession} has no license and no licenseNote saying why`);
  }
  return { doi: doi ?? null, publisher, license: parsedLicense, licenseNote: licenseNote ?? null };
}

/** Validates the parsed JSON of data/curation/dataset-citations.json. */
export function parseCitations(raw: unknown): DatasetCitations {
  if (!isRecord(raw)) throw new Error('dataset-citations: the file is not an object');
  const { schemaVersion, checkedOn, provenance, entries } = raw;
  if (typeof schemaVersion !== 'string') throw new Error('dataset-citations: schemaVersion is missing');
  if (typeof checkedOn !== 'string') throw new Error('dataset-citations: checkedOn is missing');
  if (typeof provenance !== 'string') throw new Error('dataset-citations: provenance is missing');
  if (!isRecord(entries)) throw new Error('dataset-citations: entries is missing');
  return {
    schemaVersion,
    checkedOn,
    provenance,
    entries: Object.fromEntries(Object.entries(entries).map(([accession, entry]) => [accession, parseEntry(accession, entry)])),
  };
}

/**
 * One entry per investigation present in the records, in order of first appearance. An investigation
 * with no citation entry keeps its page link and says so, so a missing DOI is visible and never invented.
 */
export function buildDatasets(records: { accession: string; pageUrl: string }[], citations: DatasetCitations): DatasetInfo[] {
  const pageUrls = new Map<string, string>();
  for (const { accession, pageUrl } of records) if (!pageUrls.has(accession)) pageUrls.set(accession, pageUrl);
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
