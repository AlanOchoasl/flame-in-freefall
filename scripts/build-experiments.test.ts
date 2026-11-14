import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { buildExperiments, SCHEMA_VERSION } from './build-experiments.ts';
import { mapCsvFile } from './map-file.ts';
import { MUST_FILES, readCitations } from './pipeline.ts';

// The file list is the pipeline's own, so this test cannot drift from what build:data reads.
const DIR = 'data/sample/psi';
const citations = readCitations('');
const build = (now: Date) => buildExperiments(MUST_FILES.map((f) => mapCsvFile(`${DIR}/${f}`)), now, citations);
const dataset = build(new Date('2026-11-14T12:00:00Z'));

describe('buildExperiments', () => {
  test('declares the schema version and generation date at the top level', () => {
    expect(dataset.schemaVersion).toBe(SCHEMA_VERSION);
    expect(SCHEMA_VERSION).toBe('1.2.0');
    expect(dataset.generatedAt).toBe('2026-11-14T12:00:00.000Z');
  });

  test('has 333 records, 333 plottable', () => {
    expect(dataset.records).toHaveLength(333); // 179 + 154, both PSI-159
    expect(dataset.plottableCount).toBe(333);
  });

  test('reports read, kept and skipped rows per source file', () => {
    expect(dataset.sources).toEqual([
      { file: MUST_FILES[0], read: 179, kept: 179, skipped: 0 },
      { file: MUST_FILES[1], read: 1015, kept: 154, skipped: 861 },
    ]);
  });

  test('reads only the two PSI-159 tables: PSI-10 is excluded for having no license', () => {
    expect(MUST_FILES).toHaveLength(2);
    expect(MUST_FILES.every((file) => file.startsWith('PSI-159_'))).toBe(true);
  });

  test('declares the exclusion of PSI-10 in the output, with its DOI and the reason', () => {
    expect(dataset.excluded).toHaveLength(1);
    expect(dataset.excluded[0]).toMatchObject({ accession: 'PSI-10', doi: '10.60555/w4zy-bt45', doiUrl: 'https://doi.org/10.60555/w4zy-bt45' });
    expect(dataset.excluded[0].reason).toMatch(/No license is declared/);
  });

  test('has no record of an excluded dataset', () => {
    expect(dataset.records.filter((r) => dataset.excluded.some((e) => e.accession === r.accession))).toEqual([]);
  });

  test('refuses to build when a record belongs to an excluded dataset', () => {
    const psi159 = MUST_FILES.map((f) => mapCsvFile(`${DIR}/${f}`));
    const leaking = [{ ...psi159[0], records: [{ ...psi159[0].records[0], accession: 'PSI-10' }] }];
    expect(() => buildExperiments(leaking, new Date(), citations)).toThrow(/excluded dataset reached the output: PSI-10/);
  });

  test('every record has the same field names, whatever its source', () => {
    const fieldNames = (record: object) => Object.keys(record).sort().join();
    const first = fieldNames(dataset.records[0]);
    expect(dataset.records.every((record) => fieldNames(record) === first)).toBe(true);
  });

  test('every record carries its PSI page link and a unique id', () => {
    expect(dataset.records.every((r) => r.pageUrl.startsWith('https://psi.nasa.gov/physci/repo/data/investigations/PSI-'))).toBe(true);
    expect(new Set(dataset.records.map((r) => r.id)).size).toBe(333);
  });

  test('summary lists the fuels of each investigation', () => {
    const fuels = Object.fromEntries(dataset.investigations.map((i) => [i.accession, i.fuels]));
    expect(fuels).toEqual({ 'PSI-159': ['butane', 'ethane', 'propane'] });
  });

  test('summary counts match the records', () => {
    for (const summary of dataset.investigations) {
      const own = dataset.records.filter((r) => r.accession === summary.accession);
      expect(summary.records).toBe(own.length);
      expect(summary.plottable).toBe(own.filter((r) => r.isPlottable).length);
      expect(summary.inMoonBaseZone).toBe(own.filter((r) => r.inMoonBaseZone).length);
    }
  });

  test('two builds differ only by the generation date', () => {
    const again = build(new Date('2030-01-01T00:00:00Z'));
    expect({ ...again, generatedAt: '' }).toEqual({ ...dataset, generatedAt: '' });
  });
});

describe('committed data/processed/experiments.json', () => {
  test('is the real dataset, not the stub, and matches a fresh build', () => {
    const committed = JSON.parse(readFileSync('data/processed/experiments.json', 'utf8'));
    expect(committed.stub).toBeUndefined();
    expect({ ...committed, generatedAt: '' }).toEqual(JSON.parse(JSON.stringify({ ...dataset, generatedAt: '' })));
  });
});
