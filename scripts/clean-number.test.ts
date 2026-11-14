import { describe, expect, test } from 'vitest';
import { cleanNumber } from './clean-number.ts';
import { readCsvTable } from './read-csv.ts';

const NORMAL = 'data/sample/psi/PSI-159_Experimental_table_CFI-G_Normal_Flames.csv';

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
  // RAMP, RAMPED and LOW O2 only appeared in the PSI-10 tables, which are no longer in the repo (no
  // license declared); their handling stays covered by the synthetic cases above.
});
