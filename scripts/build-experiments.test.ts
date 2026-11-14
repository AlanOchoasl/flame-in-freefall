import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { buildExperiments, SCHEMA_VERSION } from './build-experiments.ts';
import { mapCsvFile } from './map-file.ts';

const DIR = 'data/sample/psi';
const MUST_FILES = [
  'PSI-159_Experimental_table_CFI-G_Normal_Flames.csv',
  'PSI-159_Experimental_table_CFI-G_Inverse_Flames.csv',
  'PSI-10_Experimental_table_Flame_Design_Inverse_Flame.csv',
];
const build = (now: Date) => buildExperiments(MUST_FILES.map((f) => mapCsvFile(`${DIR}/${f}`)), now);
const dataset = build(new Date('2026-11-14T12:00:00Z'));

describe('buildExperiments', () => {
  test('declares the schema version and generation date at the top level', () => {
    expect(dataset.schemaVersion).toBe(SCHEMA_VERSION);
    expect(SCHEMA_VERSION).toBe('1.0.0');
    expect(dataset.generatedAt).toBe('2026-11-14T12:00:00.000Z');
  });

  test('has 453 records, 442 plottable', () => {
    expect(dataset.records).toHaveLength(453);
    expect(dataset.plottableCount).toBe(442);
  });

  test('reports read, kept and skipped rows per source file', () => {
    expect(dataset.sources).toEqual([
      { file: MUST_FILES[0], read: 179, kept: 179, skipped: 0 },
      { file: MUST_FILES[1], read: 1015, kept: 154, skipped: 861 },
      { file: MUST_FILES[2], read: 120, kept: 120, skipped: 0 },
    ]);
  });

  test('every record has the same field names, whatever its source', () => {
    const fieldNames = (record: object) => Object.keys(record).sort().join();
    const first = fieldNames(dataset.records[0]);
    expect(dataset.records.every((record) => fieldNames(record) === first)).toBe(true);
  });

  test('every record carries its PSI page link and a unique id', () => {
    expect(dataset.records.every((r) => r.pageUrl.startsWith('https://psi.nasa.gov/physci/repo/data/investigations/PSI-'))).toBe(true);
    expect(new Set(dataset.records.map((r) => r.id)).size).toBe(453);
  });

  test('summary lists the fuels of each investigation', () => {
    const fuels = Object.fromEntries(dataset.investigations.map((i) => [i.accession, i.fuels]));
    expect(fuels).toEqual({ 'PSI-159': ['butane', 'ethane', 'propane'], 'PSI-10': ['ethylene'] });
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
