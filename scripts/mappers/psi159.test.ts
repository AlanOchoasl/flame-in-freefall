import { describe, expect, test } from 'vitest';
import { readCsvTable } from '../read-csv.ts';
import { findMapper, MAPPERS } from './index.ts';
import { psi159InverseMapper, psi159NormalMapper } from './psi159.ts';

const DIR = 'data/sample/psi';
const NORMAL_FILE = 'PSI-159_Experimental_table_CFI-G_Normal_Flames.csv';
const INVERSE_FILE = 'PSI-159_Experimental_table_CFI-G_Inverse_Flames.csv';

const normal = readCsvTable(`${DIR}/${NORMAL_FILE}`).rows.map(psi159NormalMapper.mapRow);
const inverse = readCsvTable(`${DIR}/${INVERSE_FILE}`).rows.map(psi159InverseMapper.mapRow);

describe('PSI-159 normal flames', () => {
  test('maps the first three rows', () => {
    expect(normal.slice(0, 3)).toMatchObject([
      {
        id: 'PSI-159:21088A1', flameType: 'normal', fuel: { species: 'ethane', raw: 'ethane', inferred: false },
        o2Fraction: 0.3939, o2FractionAfterTest: 0.389822946, pressureBar: 0.9443956, pressureIsApproximate: true,
        tadK: 2719.323211, zst: 0.102651783, outcome: 'yes', selfExtOrFlowTermRaw: 'SE', tfpRaw: 'No',
      },
      { id: 'PSI-159:21088B1', o2Fraction: 0.389822946, tadK: 2713.594987, outcome: 'yes', tfpRaw: 'Yes' },
      { id: 'PSI-159:21088C1', o2Fraction: 0.386321188, zst: 0.100968644, selfExtOrFlowTermRaw: 'SE' },
    ]);
  });

  test('reads the species out of mixture labels and keeps the raw label', () => {
    const mixture = normal.find((r) => r.fuel.raw === '30% butane');
    expect(mixture?.fuel).toEqual({ species: 'butane', raw: '30% butane', inferred: false });
  });

  test('cool flame is three-valued and keeps the raw text', () => {
    const no = normal.find((r) => r.coolFlame.raw === 'no, PCI-hot');
    const yes = normal.find((r) => r.coolFlame.raw === 'yes, PCI-D');
    const empty = normal[0];
    expect(no?.coolFlame).toEqual({ value: false, raw: 'no, PCI-hot' });
    expect(yes?.coolFlame).toEqual({ value: true, raw: 'yes, PCI-D' });
    expect(empty.coolFlame).toEqual({ value: null, raw: null });
  });

  test('keeps a #DIV/0! row with null Tad and a data-quality entry', () => {
    const row = normal.find((r) => r.tadK === null);
    expect(row?.o2Fraction).not.toBeNull();
    expect(row?.dataQuality).toContainEqual({ field: 'tadK', raw: '#DIV/0!', reason: 'spreadsheet-error' });
  });
});

describe('PSI-159 inverse flames', () => {
  test('maps the first three rows', () => {
    expect(inverse.slice(0, 3)).toMatchObject([
      {
        id: 'PSI-159:21196A1', flameType: 'inverse', fuel: { species: 'ethane' }, o2Fraction: 0.21,
        pressureBar: 1.1, pressureIsApproximate: true, tadK: 2120, zst: 0.1665, outcome: 'no',
        selfExtOrFlowTermRaw: '-', tfpRaw: 'No',
      },
      { id: 'PSI-159:21196A2', outcome: 'yes', selfExtOrFlowTermRaw: 'FT' },
      { id: 'PSI-159:21196F1', o2Fraction: 0.15, pressureBar: 1.1033, tadK: 1786.994366, outcome: 'yes' },
    ]);
  });

  test('lowercases flame type and outcome variants (Inverse/inverse, Yes/yes/flash)', () => {
    expect(inverse.every((r) => r.flameType === 'inverse')).toBe(true);
    expect(new Set(inverse.map((r) => r.outcome))).toEqual(new Set(['yes', 'no', 'flash']));
  });

  test('has no cool-flame column, so the value is unknown', () => {
    expect(inverse.every((r) => r.coolFlame.value === null && r.coolFlame.raw === null)).toBe(true);
  });

  test('does not carry the after-test O2 field', () => {
    expect(inverse[0]).not.toHaveProperty('o2FractionAfterTest');
  });
});

describe('mapper registry', () => {
  test('ids are unique across both PSI-159 files', () => {
    const ids = [...normal, ...inverse].map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('finds the mapper by file name', () => {
    expect(findMapper(NORMAL_FILE)).toBe(psi159NormalMapper);
    expect(findMapper(INVERSE_FILE)).toBe(psi159InverseMapper);
    expect(findMapper('PSI-108_Experimental_table_STDCE-1.csv')).toBeUndefined();
  });

  test('registers each mapper once', () => {
    expect(MAPPERS).toHaveLength(2);
  });
});
