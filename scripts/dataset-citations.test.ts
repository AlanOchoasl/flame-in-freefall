import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { buildDatasets, buildExcluded, parseCitations, type DatasetCitations } from './dataset-citations.ts';
import { readCitations } from './pipeline.ts';

const PSI159_DOI = '10.60555/cyt1-kh64';
const PSI10_DOI = '10.60555/w4zy-bt45';

const citations: DatasetCitations = {
  schemaVersion: '1.1.0',
  checkedOn: '2026-11-14',
  provenance: 'test',
  entries: {
    'PSI-159': { doi: PSI159_DOI, publisher: 'NASA PSI', license: { spdx: 'CC0-1.0', url: 'https://example.org/cc0' }, licenseNote: null },
    'PSI-5': { doi: '10.1234/abc', publisher: 'NASA PSI', license: { spdx: 'MIT', url: 'https://example.org/mit' }, licenseNote: null },
  },
  excluded: {
    'PSI-10': { doi: PSI10_DOI, publisher: 'NASA PSI', reason: 'No license is declared.' },
  },
};

const records = [
  { accession: 'PSI-159', pageUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-159' },
  { accession: 'PSI-159', pageUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-159' },
  { accession: 'PSI-5', pageUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-5' },
];

describe('buildDatasets', () => {
  test('lists each investigation once, in order, with its DOI link and page link', () => {
    const datasets = buildDatasets(records, citations);
    expect(datasets.map((d) => d.accession)).toEqual(['PSI-159', 'PSI-5']);
    expect(datasets[0]).toMatchObject({
      doi: PSI159_DOI,
      doiUrl: `https://doi.org/${PSI159_DOI}`,
      pageUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-159',
      publisher: 'NASA PSI',
      checkedOn: '2026-11-14',
    });
  });

  test('keeps the declared license of each dataset', () => {
    const [psi159, psi5] = buildDatasets(records, citations);
    expect(psi159.license).toEqual({ spdx: 'CC0-1.0', url: 'https://example.org/cc0' });
    expect(psi5.license).toEqual({ spdx: 'MIT', url: 'https://example.org/mit' });
  });

  test('refuses records of an investigation with no citation entry (no verified license)', () => {
    expect(() => buildDatasets([{ accession: 'PSI-999', pageUrl: 'https://psi.nasa.gov/x' }], citations)).toThrow(/no verified license: PSI-999/);
  });

  test('refuses a record of an excluded dataset, so its data cannot reach the output', () => {
    const leaking = [...records, { accession: 'PSI-10', pageUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-10' }];
    expect(() => buildDatasets(leaking, citations)).toThrow(/excluded dataset reached the output: PSI-10/);
  });
});

describe('buildExcluded', () => {
  test('declares each excluded dataset with its DOI link, page link and reason', () => {
    expect(buildExcluded(citations)).toEqual([
      {
        accession: 'PSI-10',
        pageUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-10',
        doi: PSI10_DOI,
        doiUrl: `https://doi.org/${PSI10_DOI}`,
        publisher: 'NASA PSI',
        reason: 'No license is declared.',
        checkedOn: '2026-11-14',
      },
    ]);
  });

  test('is empty when nothing is left out', () => {
    expect(buildExcluded({ ...citations, excluded: {} })).toEqual([]);
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
    ['a missing excluded block', { ...valid, excluded: undefined }],
  ])('rejects %s', (_name, raw) => {
    expect(() => parseCitations(raw)).toThrow(/dataset-citations/);
  });

  test('rejects a DOI that is not a DOI, in a used or an excluded dataset', () => {
    const used = { ...valid, entries: { 'PSI-1': { ...valid.entries['PSI-159'], doi: 'cyt1-kh64' } } };
    expect(() => parseCitations(used)).toThrow(/does not look like a DOI/);
    const left = { ...valid, excluded: { 'PSI-1': { ...valid.excluded['PSI-10'], doi: 'nope' } } };
    expect(() => parseCitations(left)).toThrow(/does not look like a DOI/);
  });

  test('allows a null DOI, as plan B for a dataset whose DOI is unknown', () => {
    const plainB = { ...valid, entries: { 'PSI-1': { ...valid.entries['PSI-159'], doi: null } } };
    expect(parseCitations(plainB).entries['PSI-1'].doi).toBeNull();
  });

  test('rejects an entry with no license: it must go under excluded', () => {
    const bad = { ...valid, entries: { 'PSI-1': { ...valid.entries['PSI-159'], license: null, licenseNote: 'unknown' } } };
    expect(() => parseCitations(bad)).toThrow(/declares no license.*excluded/);
  });

  test('rejects a license without spdx or url', () => {
    const bad = { ...valid, entries: { 'PSI-1': { ...valid.entries['PSI-159'], license: { spdx: 'CC0-1.0' } } } };
    expect(() => parseCitations(bad)).toThrow(/needs "spdx" and "url"/);
  });

  test('rejects an excluded dataset with no reason', () => {
    const bad = { ...valid, excluded: { 'PSI-10': { doi: PSI10_DOI, publisher: 'NASA PSI', reason: '' } } };
    expect(() => parseCitations(bad)).toThrow(/needs a reason/);
  });

  test('rejects a dataset that is both used and excluded', () => {
    const bad = { ...valid, excluded: { 'PSI-159': valid.excluded['PSI-10'] } };
    expect(() => parseCitations(bad)).toThrow(/both used \(entries\) and excluded/);
  });
});

describe('the committed citations', () => {
  const committed = readCitations('');
  const catalog = JSON.parse(readFileSync('data/processed/catalog.json', 'utf8')) as { records: { accession: string; doi: string | null }[] };
  const catalogDoi = (accession: string) => catalog.records.find((r) => r.accession === accession)?.doi;

  test('use PSI-159 with the DOI and the CC0-1.0 license read from its PSI record', () => {
    expect(committed.entries['PSI-159'].doi).toBe(PSI159_DOI);
    expect(committed.entries['PSI-159'].license?.spdx).toBe('CC0-1.0');
  });

  test('leave PSI-10 out, with its DOI and the reason: no license is declared', () => {
    expect(Object.keys(committed.entries)).toEqual(['PSI-159']);
    expect(committed.excluded['PSI-10'].doi).toBe(PSI10_DOI);
    expect(committed.excluded['PSI-10'].reason).toMatch(/No license is declared/);
  });

  test('agree with the DOIs of the catalog, so the two files cannot drift apart', () => {
    const accessions = [...Object.keys(committed.entries), ...Object.keys(committed.excluded)];
    for (const accession of accessions) {
      const doi = committed.entries[accession]?.doi ?? committed.excluded[accession]?.doi;
      expect(doi, accession).toBe(catalogDoi(accession));
    }
  });
});

describe('the committed experiments.json', () => {
  const output = JSON.parse(readFileSync('data/processed/experiments.json', 'utf8')) as {
    schemaVersion: string;
    datasets: { accession: string; doi: string | null; doiUrl: string | null }[];
    excluded: { accession: string; doi: string | null }[];
    records: { accession: string }[];
  };

  test('carries the DOI of the dataset it uses', () => {
    expect(output.datasets.map((d) => d.doi)).toEqual([PSI159_DOI]);
    expect(output.datasets.map((d) => d.doiUrl)).toEqual([`https://doi.org/${PSI159_DOI}`]);
  });

  test('declares PSI-10 as excluded and holds none of its records', () => {
    expect(output.excluded.map((d) => d.accession)).toEqual(['PSI-10']);
    expect(output.excluded[0].doi).toBe(PSI10_DOI);
    expect(output.records.filter((r) => r.accession === 'PSI-10')).toEqual([]);
  });

  test('is at schema 1.2.0 (the app accepts any 1.x)', () => {
    expect(output.schemaVersion).toBe('1.2.0');
  });
});
