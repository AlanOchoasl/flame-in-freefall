import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { buildDatasets, parseCitations, type DatasetCitations } from './dataset-citations.ts';
import { readCitations } from './pipeline.ts';

const PSI159_DOI = '10.60555/cyt1-kh64';
const PSI10_DOI = '10.60555/w4zy-bt45';

const citations: DatasetCitations = {
  schemaVersion: '1.0.0',
  checkedOn: '2026-11-14',
  provenance: 'test',
  entries: {
    'PSI-159': { doi: PSI159_DOI, publisher: 'NASA PSI', license: { spdx: 'CC0-1.0', url: 'https://example.org/cc0' }, licenseNote: null },
    'PSI-10': { doi: PSI10_DOI, publisher: 'NASA PSI', license: null, licenseNote: 'No license declared.' },
  },
};

const records = [
  { accession: 'PSI-159', pageUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-159' },
  { accession: 'PSI-159', pageUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-159' },
  { accession: 'PSI-10', pageUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-10' },
];

describe('buildDatasets', () => {
  test('lists each investigation once, in order, with its DOI link and page link', () => {
    const datasets = buildDatasets(records, citations);
    expect(datasets.map((d) => d.accession)).toEqual(['PSI-159', 'PSI-10']);
    expect(datasets[0]).toMatchObject({
      doi: PSI159_DOI,
      doiUrl: `https://doi.org/${PSI159_DOI}`,
      pageUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-159',
      publisher: 'NASA PSI',
      checkedOn: '2026-11-14',
    });
  });

  test('keeps a declared license and never invents one that is missing', () => {
    const [psi159, psi10] = buildDatasets(records, citations);
    expect(psi159.license).toEqual({ spdx: 'CC0-1.0', url: 'https://example.org/cc0' });
    expect(psi159.licenseNote).toBeNull();
    expect(psi10.license).toBeNull();
    expect(psi10.licenseNote).toBe('No license declared.');
  });

  test('an investigation with no entry keeps its page link, with null DOI and a note', () => {
    const [dataset] = buildDatasets([{ accession: 'PSI-999', pageUrl: 'https://psi.nasa.gov/x' }], citations);
    expect(dataset).toMatchObject({ doi: null, doiUrl: null, publisher: null, license: null, pageUrl: 'https://psi.nasa.gov/x' });
    expect(dataset.licenseNote).toContain('No citation entry');
  });
});

describe('parseCitations', () => {
  const valid = JSON.parse(JSON.stringify(citations));

  test('accepts a valid file', () => {
    expect(parseCitations(valid)).toEqual(citations);
  });

  test.each([
    ['a non-object', 'text'],
    ['a missing schemaVersion', { ...valid, schemaVersion: undefined }],
    ['a missing checkedOn', { ...valid, checkedOn: undefined }],
    ['missing entries', { ...valid, entries: undefined }],
  ])('rejects %s', (_name, raw) => {
    expect(() => parseCitations(raw)).toThrow(/dataset-citations/);
  });

  test('rejects a DOI that is not a DOI', () => {
    const bad = { ...valid, entries: { 'PSI-1': { ...valid.entries['PSI-159'], doi: 'cyt1-kh64' } } };
    expect(() => parseCitations(bad)).toThrow(/does not look like a DOI/);
  });

  test('allows a null DOI, as plan B for a dataset whose DOI is unknown', () => {
    const plainB = { ...valid, entries: { 'PSI-1': { ...valid.entries['PSI-159'], doi: null } } };
    expect(parseCitations(plainB).entries['PSI-1'].doi).toBeNull();
  });

  test('rejects a missing license that does not say why', () => {
    const bad = { ...valid, entries: { 'PSI-1': { ...valid.entries['PSI-159'], license: null, licenseNote: null } } };
    expect(() => parseCitations(bad)).toThrow(/no licenseNote/);
  });

  test('rejects a license without spdx or url', () => {
    const bad = { ...valid, entries: { 'PSI-1': { ...valid.entries['PSI-159'], license: { spdx: 'CC0-1.0' } } } };
    expect(() => parseCitations(bad)).toThrow(/needs "spdx" and "url"/);
  });
});

describe('the committed citations', () => {
  const committed = readCitations('');
  const catalog = JSON.parse(readFileSync('data/processed/catalog.json', 'utf8')) as { records: { accession: string; doi: string | null }[] };
  const catalogDoi = (accession: string) => catalog.records.find((r) => r.accession === accession)?.doi;

  test('cover PSI-159 and PSI-10 with the DOIs read from their PSI records', () => {
    expect(committed.entries['PSI-159'].doi).toBe(PSI159_DOI);
    expect(committed.entries['PSI-10'].doi).toBe(PSI10_DOI);
  });

  test('agree with the DOIs of the catalog, so the two files cannot drift apart', () => {
    for (const accession of Object.keys(committed.entries)) {
      expect(committed.entries[accession].doi, accession).toBe(catalogDoi(accession));
    }
  });

  test('declare CC0-1.0 for PSI-159 and no license for PSI-10, with the reason', () => {
    expect(committed.entries['PSI-159'].license?.spdx).toBe('CC0-1.0');
    expect(committed.entries['PSI-10'].license).toBeNull();
    expect(committed.entries['PSI-10'].licenseNote).toMatch(/Confirm with PSI/);
  });
});

describe('the committed experiments.json', () => {
  const output = JSON.parse(readFileSync('data/processed/experiments.json', 'utf8')) as {
    schemaVersion: string;
    datasets: { accession: string; doi: string | null; doiUrl: string | null; license: unknown }[];
  };

  test('carries both DOIs', () => {
    expect(output.datasets.map((d) => d.doi).sort()).toEqual([PSI159_DOI, PSI10_DOI].sort());
    expect(output.datasets.map((d) => d.doiUrl).sort()).toEqual([`https://doi.org/${PSI159_DOI}`, `https://doi.org/${PSI10_DOI}`].sort());
  });

  test('is at schema 1.1.0 (the app accepts any 1.x)', () => {
    expect(output.schemaVersion).toBe('1.1.0');
  });
});
