import { describe, expect, test } from 'vitest';
import { readCsvTable } from './read-csv.ts';

const SAMPLE_DIR = 'data/sample/psi';
const NORMAL = `${SAMPLE_DIR}/PSI-159_Experimental_table_CFI-G_Normal_Flames.csv`;
const INVERSE = `${SAMPLE_DIR}/PSI-159_Experimental_table_CFI-G_Inverse_Flames.csv`;
const PSI10_INVERSE = `${SAMPLE_DIR}/PSI-10_Experimental_table_Flame_Design_Inverse_Flame.csv`;

describe('readCsvTable', () => {
  test('keeps 179 rows of PSI-159 normal flames', () => {
    expect(readCsvTable(NORMAL).rows).toHaveLength(179);
  });

  test('keeps 154 rows of PSI-159 inverse flames and skips 861 blank ones', () => {
    const table = readCsvTable(INVERSE);
    expect(table.rows).toHaveLength(154);
    expect(table.skipped).toBe(861);
  });

  test('keeps 120 rows of PSI-10 inverse flames', () => {
    expect(readCsvTable(PSI10_INVERSE).rows).toHaveLength(120);
  });

  test('normalizes header whitespace', () => {
    const [first] = readCsvTable(NORMAL).rows;
    expect(first).toHaveProperty('XO2 before test');
    expect(first).toHaveProperty('XO2 after test');
  });

  test('reads the inverse header with its inner space collapsed', () => {
    const [first] = readCsvTable(INVERSE).rows;
    expect(first).toHaveProperty('Self -ext or flow term');
  });
});
