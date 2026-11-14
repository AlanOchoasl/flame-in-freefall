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
    expect(SCHEMA_VERSION).toBe('1.1.0');
    expect(dataset.generatedAt).toBe('2026-11-14T12:00:00.000Z');
  });

  test('has 660 records, 629 plottable', () => {
    expect(dataset.records).toHaveLength(660); // 453 of the Must set + 207 of PSI-10 normal flames
    expect(dataset.plottableCount).toBe(629); // 442 + 187
  });

  test('reports read, kept and skipped rows per source file', () => {
    expect(dataset.sources).toEqual([
      { file: MUST_FILES[0], read: 179, kept: 179, skipped: 0 },
      { file: MUST_FILES[1], read: 1015, kept: 154, skipped: 861 },
      { file: MUST_FILES[2], read: 120, kept: 120, skipped: 0 },
      { file: MUST_FILES[3], read: 207, kept: 207, skipped: 0 },
    ]);
  });

  test('reads the four tables of PSI-159 and PSI-10', () => {
    expect(MUST_FILES).toHaveLength(4);
    expect(MUST_FILES.filter((file) => file.startsWith('PSI-10_'))).toHaveLength(2);
  });

  test('every record has the same field names, whatever its source', () => {
    const fieldNames = (record: object) => Object.keys(record).sort().join();
    const first = fieldNames(dataset.records[0]);
    expect(dataset.records.every((record) => fieldNames(record) === first)).toBe(true);
  });

  test('every record carries its PSI page link and a unique id', () => {
    expect(dataset.records.every((r) => r.pageUrl.startsWith('https://psi.nasa.gov/physci/repo/data/investigations/PSI-'))).toBe(true);
    expect(new Set(dataset.records.map((r) => r.id)).size).toBe(660);
  });

  test('summary lists the fuels of each investigation', () => {
    const fuels = Object.fromEntries(dataset.investigations.map((i) => [i.accession, i.fuels]));
    expect(fuels).toEqual({ 'PSI-159': ['butane', 'ethane', 'propane'], 'PSI-10': ['ethylene', 'propane'] });
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
