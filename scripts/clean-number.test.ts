import { describe, expect, test } from 'vitest';
import { cleanNumber } from './clean-number.ts';
import { readCsvTable } from './read-csv.ts';

const NORMAL = 'data/sample/psi/PSI-159_Experimental_table_CFI-G_Normal_Flames.csv';
const PSI10 = 'data/sample/psi/PSI-10_Experimental_table_Flame_Design_Inverse_Flame.csv';

describe('cleanNumber', () => {
  test('parses a plain number without an issue', () => {
    expect(cleanNumber('0.3939', 'o2Fraction')).toEqual({ value: 0.3939, issue: null });
  });

  test('parses scientific notation and trims spaces', () => {
    expect(cleanNumber(' 1.5e-3 ', 'zst').value).toBe(0.0015);
  });

  test.each([
    ['#DIV/0!', 'spreadsheet-error'],
    ['#VALUE!', 'spreadsheet-error'],
    ['RAMP', 'ramped-condition'],
    ['RAMPED', 'ramped-condition'],
    ['LOW O2', 'low-o2-note'],
    ['-', 'no-value'],
    ['', 'empty'],
  ])('turns %j into null with reason %s', (raw, reason) => {
    expect(cleanNumber(raw, 'tadK')).toEqual({
      value: null,
      issue: { field: 'tadK', raw, reason },
    });
  });

  test('treats missing input as empty', () => {
    expect(cleanNumber(undefined, 'tadK').issue?.reason).toBe('empty');
  });

  test('flags unknown text as not-numeric instead of guessing', () => {
    expect(cleanNumber('about 1', 'p').issue?.reason).toBe('not-numeric');
  });
});

describe('cleanNumber on real PSI cells', () => {
  test('keeps a PSI-159 row with #DIV/0! as null Tad but numeric O2', () => {
    const row = readCsvTable(NORMAL).rows.find((r) => r['Tad (K)'] === '#DIV/0!');
    expect(row).toBeDefined();
    expect(cleanNumber(row!['Tad (K)'], 'tadK').value).toBeNull();
    expect(cleanNumber(row!['XO2 before test'], 'o2Fraction').value).not.toBeNull();
  });

  test('turns the 9 RAMP and 2 LOW O2 O2 cells of PSI-10 inverse into null', () => {
    const issues = readCsvTable(PSI10)
      .rows.map((r) => cleanNumber(r.XO2, 'o2Fraction').issue)
      .filter((i) => i !== null);
    expect(issues).toHaveLength(11);
    expect(issues.filter((i) => i.raw === 'RAMP')).toHaveLength(9);
    expect(issues.filter((i) => i.raw === 'LOW O2')).toHaveLength(2);
  });
});
