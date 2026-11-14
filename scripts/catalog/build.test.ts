import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { accessionsWithUnreviewed, buildCatalog, testTablesFor } from './build.ts';
import type { BuildInput } from './build.ts';
import type { CurationFile, SourceCatalog, Vocabularies } from './types.ts';

const root = fileURLToPath(new URL('../../', import.meta.url));
const readJson = <T>(relative: string): T => JSON.parse(readFileSync(`${root}${relative}`, 'utf8')) as T;

function realInput(overrides: Partial<BuildInput> = {}): BuildInput {
  return {
    source: readJson<SourceCatalog>('data/sample/psi-catalog/investigations.json'),
    vocabularies: readJson<Vocabularies>('data/curation/vocabularies.json'),
    curation: readJson<CurationFile>('data/curation/investigations.curation.json'),
    tableFiles: readdirSync(`${root}data/sample/psi`),
    now: new Date('2026-11-14T12:00:00Z'),
    ...overrides,
  };
}

describe('buildCatalog on the cached PSI data', () => {
  const { dataset, warnings } = buildCatalog(realInput());
  const byId = Object.fromEntries(dataset.records.map((r) => [r.accession, r]));

  it('outputs one record per investigation with unique accessions', () => {
    expect(dataset.recordCount).toBe(26);
    expect(new Set(dataset.records.map((r) => r.accession)).size).toBe(26);
  });
  it('declares the schema version and the source retrieval date', () => {
    expect(dataset.schemaVersion).toBe('1.0.0');
    expect(dataset.sourceRetrieved).toBe('2026-11-14');
  });
  it('orders records by ascending accession number so the first 13 / last 13 split is stable', () => {
    const numbers = dataset.records.map((r) => Number(r.accession.split('-')[1]));
    expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
    expect(dataset.records[0].accession).toBe('PSI-10');
    expect(dataset.records[12].accession).toBe('PSI-69');
    expect(dataset.records[13].accession).toBe('PSI-98');
  });
  it('keeps missing values as null (PSI-159 has no dates)', () => {
    expect(byId['PSI-159'].startDate).toBeNull();
    expect(byId['PSI-159'].endDate).toBeNull();
    expect(byId['PSI-108'].hypothesis).toBeNull();
  });
  it('splits lists and formats dates', () => {
    expect(byId['PSI-25'].relatedInvestigations).toEqual(['PSI-26']);
    expect(byId['PSI-159'].hardware.names).toEqual(['ACME', 'Combustion Integrated Rack (CIR)']);
    expect(byId['PSI-159'].releaseDate).toBe('2025-11-20');
  });
  it('unifies the gaseous-fuel sub-area spellings and keeps the raw text', () => {
    expect(byId['PSI-159'].subResearchArea).toEqual({ raw: 'Flames of Gaseous Fuels', normalized: 'flames of gaseous fuels' });
  });
  it('flags records outside Combustion Science but keeps them', () => {
    const outside = dataset.records.filter((r) => !r.isCombustionScience).map((r) => r.accession);
    expect(outside).toEqual(['PSI-108', 'PSI-181']);
  });
  it('links cached test tables without mixing PSI-10 and PSI-100', () => {
    expect(byId['PSI-10'].testTables).toEqual([
      'PSI-10_Experimental_table_Flame_Design_Inverse_Flame.csv',
      'PSI-10_Experimental_table_Flame_Design_Normal_Flame.csv',
    ]);
    expect(byId['PSI-100'].testTables).toEqual(['PSI-100_Experimental_table_SAFFIRE-3.csv']);
  });
  it('gives every record its PSI page link and the DOI captured from PSI', () => {
    expect(byId['PSI-98'].pageUrl).toBe('https://psi.nasa.gov/physci/repo/data/investigations/PSI-98');
    expect(byId['PSI-98'].doi).toBe('10.60555/0t15-1z43');
    expect(dataset.records.every((r) => r.doi !== null && /^10\.\d{4,9}\/\S+$/.test(r.doi))).toBe(true);
    expect(new Set(dataset.records.map((r) => r.doi)).size).toBe(26);
  });
  it('leaves the DOI null when the curation file has none', () => {
    const curation: CurationFile = { schemaVersion: '1.0.0', entries: {} };
    const { dataset: bare } = buildCatalog(realInput({ curation }));
    expect(bare.records.every((r) => r.doi === null)).toBe(true);
  });
  it('has the reviewed hardware group from the statement and the PSI record', () => {
    expect(byId['PSI-159'].curated.hardwareGroup.value).toBe('acme-cir');
    expect(byId['PSI-69'].curated.hardwareGroup.value).toBe('mdca-cir');
    expect(byId['PSI-26'].curated.hardwareGroup.value).toBe('msg-flow-duct');
    expect(dataset.records.every((r) => r.curated.hardwareGroup.reviewed)).toBe(true);
  });
  it('counts unreviewed values and lists the accessions that still have some', () => {
    // hardwareGroup is reviewed for all 26; fuelPhase, topics and measurements are reviewed for
    // PSI-10, PSI-39, PSI-60 and PSI-62 only and are still being curated for the other 22.
    expect(dataset.unreviewedCount).toBe(22 * 3);
    expect(accessionsWithUnreviewed(dataset)).toHaveLength(22);
  });
  it('reports no warnings on the real data', () => {
    expect(warnings).toEqual([]);
  });
  it('does not copy people or funding fields', () => {
    const text = JSON.stringify(dataset);
    expect(text).not.toContain('Farouk');
    expect(text).not.toContain('NNX17AF97A');
  });
});

describe('determinism and failures', () => {
  it('produces identical records on two runs (generatedAt aside)', () => {
    const a = buildCatalog(realInput({ now: new Date('2026-01-01T00:00:00Z') })).dataset;
    const b = buildCatalog(realInput({ now: new Date('2027-01-01T00:00:00Z') })).dataset;
    expect(a.records).toEqual(b.records);
    expect(a.generatedAt).not.toBe(b.generatedAt);
  });
  it('fails the whole build on a curation typo and names the accession', () => {
    const curation: CurationFile = {
      schemaVersion: '1.0.0',
      entries: { 'PSI-1599': { hardwareGroup: { value: 'acme-cir', source: 'x', reviewed: true } } },
    };
    expect(() => buildCatalog(realInput({ curation }))).toThrow(/PSI-1599/);
  });
  it('fails on a duplicate accession in the source', () => {
    const input = realInput();
    input.source.investigations.push({ ...input.source.investigations[0] });
    expect(() => buildCatalog(input)).toThrow(/Duplicate accession/);
  });
  it('shows a reviewed value as reviewed and an unreviewed one as unreviewed', () => {
    const curation: CurationFile = {
      schemaVersion: '1.0.0',
      entries: { 'PSI-159': { hardwareGroup: { value: 'acme-cir', source: 'Challenge statement', reviewed: true } } },
    };
    const { dataset } = buildCatalog(realInput({ curation }));
    const record = dataset.records.find((r) => r.accession === 'PSI-159');
    expect(record?.curated.hardwareGroup.reviewed).toBe(true);
    expect(dataset.unreviewedCount).toBe(26 * 4 - 1);
  });
});

describe('testTablesFor', () => {
  it('uses the underscore as the boundary', () => {
    expect(testTablesFor('PSI-10', ['PSI-100_a.csv', 'PSI-10_b.csv', 'PSI-1_c.csv'])).toEqual(['PSI-10_b.csv']);
  });
});
