import { describe, expect, test } from 'vitest';
import { readCsvTable } from '../read-csv.ts';
import { addFlags } from '../flags.ts';
import { findMapper } from './index.ts';
import { psi10InverseMapper, psi10NormalMapper } from './psi10.ts';

const FILE = 'PSI-10_Experimental_table_Flame_Design_Inverse_Flame.csv';
const NORMAL_FILE = 'PSI-10_Experimental_table_Flame_Design_Normal_Flame.csv';
const rows = readCsvTable(`data/sample/psi/${FILE}`).rows;
const records = rows.map(psi10InverseMapper.mapRow);

describe('PSI-10 inverse flames', () => {
  test('maps the first three rows, converting atm to bar', () => {
    expect(records.slice(0, 3)).toMatchObject([
      {
        id: 'PSI-10:21328A1', accession: 'PSI-10', flameType: 'inverse', o2Fraction: 0.37082819,
        pressureBar: 1.017322, pressureIsApproximate: false, tadK: 2595.073097, zst: 0.302316402,
      },
      { id: 'PSI-10:21328A2', o2Fraction: 0.371286026, pressureBar: 1.0211141, tadK: 2594.870605 },
      { id: 'PSI-10:21328D1', o2Fraction: 0.212319452, pressureBar: 1.0621379, zst: 0.211548493 },
    ]);
  });

  test('1.0 atm is 1.01325 bar', () => {
    const row = { ...rows[0], 'pmean (atm)': '1.0' };
    expect(psi10InverseMapper.mapRow(row).pressureBar).toBe(1.01325);
  });

  test('outcome is not-reported, not "no"', () => {
    expect(records.every((r) => r.outcome === 'not-reported')).toBe(true);
  });

  test('ethylene is inferred and flagged on every row', () => {
    expect(records.every((r) => r.fuel.species === 'ethylene' && r.fuel.inferred)).toBe(true);
  });

  test('RAMP and LOW O2 rows are kept with null O2 and a data-quality entry', () => {
    const rowsWithNullO2 = records.filter((r) => r.o2Fraction === null);
    expect(rowsWithNullO2).toHaveLength(11);
    expect(rowsWithNullO2[0].dataQuality.some((q) => q.field === 'o2Fraction')).toBe(true);
    expect(rowsWithNullO2.every((r) => r.pressureBar !== null)).toBe(true);
  });

  test('keeps all 120 rows with unique ids', () => {
    expect(records).toHaveLength(120);
    expect(new Set(records.map((r) => r.id)).size).toBe(120);
  });

  test('is found by file name', () => {
    expect(findMapper(FILE)).toBe(psi10InverseMapper);
  });
});

describe('PSI-10 normal flames', () => {
  const normalRows = readCsvTable(`data/sample/psi/${NORMAL_FILE}`).rows;
  const normal = normalRows.map(psi10NormalMapper.mapRow);
  const flagged = normal.map(addFlags);

  test('keeps all 207 rows, 187 of them plottable, none in the Moon-base zone', () => {
    expect(normal).toHaveLength(207);
    expect(flagged.filter((r) => r.isPlottable)).toHaveLength(187);
    expect(flagged.filter((r) => r.inMoonBaseZone)).toHaveLength(0);
  });

  test('maps the first row: lowercase flame type, the O2 before and after the test, atm to bar', () => {
    expect(normal[0]).toMatchObject({
      id: 'PSI-10:19115A1',
      accession: 'PSI-10',
      flameType: 'normal',
      fuel: { species: 'ethylene', raw: 'C2H4', inferred: false },
      o2Fraction: 0.207128374,
      o2FractionAfterTest: 0.206202891,
      pressureBar: 1.0314562, // 1.01796816 atm x 1.01325
      pressureIsApproximate: false,
      tadK: 2352.144414,
      zst: 0.062716477,
    });
  });

  test('keeps RAMP and RAMPED rows with null Tad and Zst and says so in dataQuality', () => {
    const ramped = normal.filter((r) => r.tadK === null);
    expect(ramped).toHaveLength(60); // 57 RAMP + 3 RAMPED
    expect(ramped.every((r) => r.o2Fraction !== null && r.pressureBar !== null)).toBe(true);
    expect(ramped[0].dataQuality).toEqual(
      expect.arrayContaining([
        { field: 'tadK', raw: 'RAMPED', reason: 'ramped-condition' },
        { field: 'zst', raw: 'RAMPED', reason: 'ramped-condition' },
      ]),
    );
  });

  test('reads the species from the chemical formula, and keeps the formula as the raw label', () => {
    const species = (formula: string) => normal.filter((r) => r.fuel.raw === formula).map((r) => r.fuel.species);
    expect(species('C2H4')).toHaveLength(187);
    expect(new Set(species('C2H4'))).toEqual(new Set(['ethylene']));
    expect(species('C3H8')).toHaveLength(20);
    expect(new Set(species('C3H8'))).toEqual(new Set(['propane']));
  });

  test('the 20 propane rows have no pressure, so they are kept but not plottable', () => {
    const noPressure = flagged.filter((r) => r.pressureBar === null);
    expect(noPressure).toHaveLength(20);
    expect(noPressure.every((r) => r.fuel.species === 'propane' && !r.isPlottable)).toBe(true);
    expect(noPressure[0].dataQuality.map((q) => q.field)).toEqual(expect.arrayContaining(['pressureBar', 'o2FractionAfterTest']));
  });

  test('outcome is not-reported, never no', () => {
    expect(normal.every((r) => r.outcome === 'not-reported')).toBe(true);
  });

  test('ids are unique and do not collide with the inverse table', () => {
    const normalIds = normal.map((r) => r.id);
    expect(new Set(normalIds).size).toBe(207);
    const inverseIds = new Set(records.map((r) => r.id));
    expect(normalIds.filter((id) => inverseIds.has(id))).toEqual([]);
  });

  test('is found by file name, and the inverse mapper does not claim it', () => {
    expect(findMapper(NORMAL_FILE)).toBe(psi10NormalMapper);
    expect(findMapper(FILE)).toBe(psi10InverseMapper);
  });
});
