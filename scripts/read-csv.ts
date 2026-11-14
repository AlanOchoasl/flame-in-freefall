import { readFileSync } from 'node:fs';
import { parse } from 'csv-parse/sync';
import type { CsvRow } from './csv-row.ts';

export type { CsvRow };

export interface CsvTable {
  rows: CsvRow[];
  read: number;
  skipped: number;
}

const TEST_ID_COLUMN = 'Test';

function normalizeHeader(header: string): string {
  return header.replace(/\s+/g, ' ').trim();
}

export function readCsvTable(path: string): CsvTable {
  const text = readFileSync(path, 'utf8');
  const all: CsvRow[] = parse(text, {
    columns: (headers: string[]) => headers.map(normalizeHeader),
    skip_empty_lines: true,
    relax_column_count: true,
  });
  const rows = all.filter((row) => (row[TEST_ID_COLUMN] ?? '').trim() !== '');
  return { rows, read: all.length, skipped: all.length - rows.length };
}
