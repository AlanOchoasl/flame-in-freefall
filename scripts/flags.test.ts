import { describe, expect, test } from 'vitest';
import type { ExperimentRecord } from './experiment-record.ts';
import { addFlags } from './flags.ts';
import { mapCsvFile } from './map-file.ts';
import { summarizeInvestigations } from './summarize.ts';

const DIR = 'data/sample/psi';
const FILES = [
  'PSI-159_Experimental_table_CFI-G_Normal_Flames.csv',
  'PSI-159_Experimental_table_CFI-G_Inverse_Flames.csv',
];

const base: ExperimentRecord = mapCsvFile(`${DIR}/${FILES[0]}`).records[0];
const withValues = (o2Fraction: number | null, pressureBar: number | null) =>
  addFlags({ ...base, o2Fraction, pressureBar });

describe('addFlags: boundaries', () => {
  test('O2 exactly 0.30 and 0.7033 bar is in the Moon-base zone', () => {
    expect(withValues(0.3, 0.7033)).toMatchObject({ isPlottable: true, inMoonBaseZone: true });
  });

  test('O2 just below 0.30 is outside the zone', () => {
    expect(withValues(0.2999, 0.5).inMoonBaseZone).toBe(false);
  });

  test('pressure just above 0.7033 bar is outside the zone', () => {
    expect(withValues(0.4, 0.7034).inMoonBaseZone).toBe(false);
  });

  test('null O2 or null pressure is not plottable and not in the zone', () => {
    expect(withValues(null, 0.5)).toMatchObject({ isPlottable: false, inMoonBaseZone: false });
    expect(withValues(0.4, null)).toMatchObject({ isPlottable: false, inMoonBaseZone: false });
  });

  test('keeps every other field of the record', () => {
    expect(withValues(0.4, 1)).toMatchObject({ id: base.id, fuel: base.fuel, tadK: base.tadK });
  });
});

describe('Dataset in use (PSI-159 normal + inverse; PSI-10 is excluded for having no license)', () => {
  const mapped = FILES.map((file) => mapCsvFile(`${DIR}/${file}`));
  const records = mapped.flatMap((m) => m.records).map(addFlags);

  test('has 333 records, 333 plottable and 48 in the Moon-base zone', () => {
    expect(records).toHaveLength(333); // 179 + 154
    expect(records.filter((r) => r.isPlottable)).toHaveLength(333);
    expect(records.filter((r) => r.inMoonBaseZone)).toHaveLength(48);
  });

  test('per file: 20 / 28 tests in the zone', () => {
    const perFile = mapped.map((m) => m.records.map(addFlags).filter((r) => r.inMoonBaseZone).length);
    expect(perFile).toEqual([20, 28]);
  });

  test('summary groups by investigation with counts and ranges', () => {
    const summary = summarizeInvestigations(records);
    expect(summary.map((s) => s.accession)).toEqual(['PSI-159']);
    expect(summary[0]).toMatchObject({ records: 333, plottable: 333, inMoonBaseZone: 48 });
  });

  test('summary ranges ignore null values', () => {
    const [psi159] = summarizeInvestigations(records);
    expect(psi159.o2Range[0]).toBeGreaterThan(0);
    expect(psi159.o2Range[1]).toBeLessThanOrEqual(1);
    expect(psi159.pressureBarRange[0]).toBeLessThan(psi159.pressureBarRange[1] as number);
  });
});

describe('summarizeInvestigations', () => {
  test('returns null ranges when a group has no values', () => {
    const [summary] = summarizeInvestigations([withValues(null, null)]);
    expect(summary).toMatchObject({ o2Range: [null, null], pressureBarRange: [null, null], plottable: 0 });
  });

  test('returns nothing for no records', () => {
    expect(summarizeInvestigations([])).toEqual([]);
  });
});

describe('mapCsvFile', () => {
  test('reports read, kept and skipped counts', () => {
    const inverse = mapCsvFile(`${DIR}/${FILES[1]}`);
    expect([inverse.read, inverse.kept, inverse.skipped]).toEqual([1015, 154, 861]);
  });

  test('refuses a file with no registered mapper', () => {
    expect(() => mapCsvFile(`${DIR}/PSI-108_Experimental_table_STDCE-1.csv`)).toThrow(/No mapper/);
  });

  test('has no mapper for PSI-10, whose data is not used (no license declared)', () => {
    expect(() => mapCsvFile(`${DIR}/PSI-10_Experimental_table_Flame_Design_Inverse_Flame.csv`)).toThrow(/No mapper/);
    expect(() => mapCsvFile(`${DIR}/PSI-10_Experimental_table_Flame_Design_Normal_Flame.csv`)).toThrow(/No mapper/);
  });
});
