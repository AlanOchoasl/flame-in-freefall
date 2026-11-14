import { describe, expect, test } from 'vitest';
import { readCsvTable } from '../read-csv.ts';
import { findMapper } from './index.ts';
import { psi10InverseMapper } from './psi10.ts';

const FILE = 'PSI-10_Experimental_table_Flame_Design_Inverse_Flame.csv';
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
