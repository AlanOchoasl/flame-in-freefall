import { readFileSync } from 'node:fs';
import { parse } from 'csv-parse/sync';
import { describe, expect, it } from 'vitest';
import type { ExperimentRecord, ExperimentsFile } from '../../data/types';
import { CSV_COLUMNS, buildCsv } from './csv';
import { NO_FILTERS, applyFilters } from './filters';

const record = (overrides: Partial<ExperimentRecord> = {}): ExperimentRecord => ({
  id: 'PSI-159:21088A1',
  accession: 'PSI-159',
  pageUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-159',
  dataQuality: [],
  flameType: 'normal',
  fuel: { species: 'ethane', raw: 'ethane', inferred: false },
  o2Fraction: 0.3939,
  pressureBar: 0.9443956,
  pressureIsApproximate: true,
  tadK: 2719.323211,
  zst: 0.102651783,
  outcome: 'yes',
  coolFlame: { value: null, raw: null },
  selfExtOrFlowTermRaw: 'SE',
  tfpRaw: 'No',
  isPlottable: true,
  inMoonBaseZone: false,
  ...overrides,
});

const parseCsv = (text: string): Record<string, string>[] =>
  parse(text, { columns: true, skip_empty_lines: true });

describe('buildCsv', () => {
  it('writes a header and one row per record, with CRLF line endings', () => {
    const lines = buildCsv([record(), record({ id: 'PSI-159:2' })]).split('\r\n');
    expect(lines[0]).toBe(CSV_COLUMNS.map((c) => c.header).join(','));
    expect(lines).toHaveLength(4); // header, 2 rows, trailing empty after the last CRLF
    expect(lines[3]).toBe('');
  });

  it('writes only the header when there are no records', () => {
    expect(buildCsv([]).split('\r\n')).toEqual([CSV_COLUMNS.map((c) => c.header).join(','), '']);
  });

  it('writes the source link of every record', () => {
    const [row] = parseCsv(buildCsv([record()]));
    expect(row.psi_page_url).toBe('https://psi.nasa.gov/physci/repo/data/investigations/PSI-159');
    expect(row.investigation).toBe('PSI-159');
  });

  it('writes null as an empty cell and booleans as true or false', () => {
    const [row] = parseCsv(buildCsv([record({ tadK: null, isPlottable: false, coolFlame: { value: false, raw: 'no, PCI-hot' } })]));
    expect(row.tad_k).toBe('');
    expect(row.is_plottable).toBe('false');
    expect(row.cool_flame).toBe('false');
    expect(row.cool_flame_raw).toBe('no, PCI-hot');
  });

  it('keeps full numeric precision', () => {
    const [row] = parseCsv(buildCsv([record()]));
    expect(row.o2_fraction).toBe('0.3939');
    expect(row.pressure_bar).toBe('0.9443956');
    expect(row.tad_k).toBe('2719.323211');
  });

  it('quotes cells with commas, quotes and line breaks and reads them back unchanged', () => {
    const tricky = record({ fuel: { species: 'butane', raw: 'a "30%" butane, mix\nline', inferred: false } });
    const text = buildCsv([tricky]);
    expect(text).toContain('"a ""30%"" butane, mix\nline"');
    expect(parseCsv(text)[0].fuel_label).toBe('a "30%" butane, mix\nline');
  });

  it('lists the data-quality entries as field:reason', () => {
    const entries = [
      { field: 'tadK', raw: '#DIV/0!', reason: 'spreadsheet-error' },
      { field: 'zst', raw: '#DIV/0!', reason: 'spreadsheet-error' },
    ];
    const [row] = parseCsv(buildCsv([record({ dataQuality: entries })]));
    expect(row.data_quality).toBe('tadK:spreadsheet-error;zst:spreadsheet-error');
  });

  it('does not fail on a data-quality entry it does not know', () => {
    const [row] = parseCsv(buildCsv([record({ dataQuality: ['odd'] })]));
    expect(row.data_quality).toBe('"odd"');
  });

  it('keeps the outcome not-reported apart from no', () => {
    const rows = parseCsv(buildCsv([record({ outcome: 'not-reported' }), record({ outcome: 'no' })]));
    expect(rows.map((r) => r.outcome)).toEqual(['not-reported', 'no']);
  });
});

describe('the committed dataset', () => {
  const file = JSON.parse(
    readFileSync(new URL('../../../../data/processed/experiments.json', import.meta.url), 'utf8'),
  ) as ExperimentsFile;

  it('reads back as exactly the filtered records', () => {
    const filtered = applyFilters(file.records, { ...NO_FILTERS, flameType: 'inverse' });
    const rows = parseCsv(buildCsv(filtered));
    expect(rows).toHaveLength(154);
    expect(rows.map((r) => r.id)).toEqual(filtered.map((r) => r.id));
    expect(rows.every((r) => r.flame_type === 'inverse')).toBe(true);
  });

  it('has a source link and a value-for-value match on every one of the 333 records', () => {
    const rows = parseCsv(buildCsv(file.records));
    expect(rows).toHaveLength(333);
    file.records.forEach((r, index) => {
      expect(rows[index].psi_page_url).toBe(r.pageUrl);
      expect(rows[index].fuel_label).toBe(r.fuel.raw ?? '');
      expect(rows[index].pressure_bar).toBe(r.pressureBar === null ? '' : String(r.pressureBar));
      expect(rows[index].in_moon_base_zone).toBe(String(r.inMoonBaseZone));
    });
    expect(rows.filter((r) => r.in_moon_base_zone === 'true')).toHaveLength(48);
  });
});
