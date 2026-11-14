import type { CatalogRecord, InvestigationSummary } from '../../data/types';

export type MissingReason = 'not-in-record' | 'no-test-data' | 'not-reviewed';
export type RowMarker = 'same' | 'differs' | 'all-missing';
type Range = [number, number] | [null, null];

export interface Cell {
  /** Display values; empty means missing. */
  values: string[];
  missingReason: MissingReason | null;
  unreviewed: boolean;
}

export interface ComparisonRow {
  id: string;
  label: string;
  /** Long text rows carry no marker. */
  marker: RowMarker | null;
  cells: Cell[];
}

export interface ComparisonModel {
  accessions: string[];
  rows: ComparisonRow[];
}

const present = (values: string[], unreviewed = false): Cell => ({ values, missingReason: null, unreviewed });
const missing = (reason: MissingReason): Cell => ({ values: [], missingReason: reason, unreviewed: false });

function textCell(value: string | null): Cell {
  return value && value.trim() ? present([value.trim()]) : missing('not-in-record');
}

function listCell(values: string[]): Cell {
  return values.length > 0 ? present(values) : missing('not-in-record');
}

function curatedCell(field: { value: string[]; reviewed: boolean }): Cell {
  if (field.value.length > 0) return present(field.value, !field.reviewed);
  return missing(field.reviewed ? 'not-in-record' : 'not-reviewed');
}

function hasTestData(summary: InvestigationSummary | undefined): summary is InvestigationSummary {
  return summary !== undefined && summary.records > 0;
}

const compact = (value: string | null): string[] => (value === null ? [] : [value]);

function rangeText(range: Range, unit: string): string | null {
  const [low, high] = range;
  if (low === null || high === null) return null;
  return low === high ? `${low} ${unit}` : `${low} to ${high} ${unit}`;
}

function testCell(summary: InvestigationSummary | undefined, pick: (s: InvestigationSummary) => string[]): Cell {
  if (!hasTestData(summary)) return missing('no-test-data');
  const values = pick(summary);
  return values.length > 0 ? present(values) : missing('no-test-data');
}

function datesCell(record: CatalogRecord): Cell {
  if (!record.startDate && !record.endDate) return missing('not-in-record');
  return present([`${record.startDate ?? '?'} to ${record.endDate ?? '?'}`]);
}

// Equal normalized values compare equal: lists as sets, text trimmed and lowercased.
function normalizedKey(cell: Cell): string | null {
  if (cell.values.length === 0) return null;
  return [...new Set(cell.values.map((value) => value.trim().toLowerCase()))].sort().join('|');
}

export function markerFor(cells: Cell[]): RowMarker {
  const keys = cells.map(normalizedKey);
  if (keys.every((key) => key === null)) return 'all-missing';
  return keys.every((key) => key === keys[0]) ? 'same' : 'differs';
}

function row(id: string, label: string, cells: Cell[], comparable: boolean): ComparisonRow {
  return { id, label, marker: comparable ? markerFor(cells) : null, cells };
}

export function buildComparison(records: CatalogRecord[], summaries: InvestigationSummary[]): ComparisonModel {
  const summaryOf = (record: CatalogRecord) => summaries.find((s) => s.accession === record.accession);
  const cells = (make: (record: CatalogRecord) => Cell) => records.map(make);
  return {
    accessions: records.map((record) => record.accession),
    rows: [
      row('objectives', 'Objectives', cells((r) => textCell(r.objectives)), false),
      row('platform', 'Flight platform', cells((r) => textCell(r.flightPlatform)), true),
      row('hardware', 'Hardware', cells((r) => listCell(r.hardware.names)), true),
      row('fuelPhase', 'Fuel phase', cells((r) => curatedCell(r.curated.fuelPhase)), true),
      row('topics', 'Topics', cells((r) => curatedCell(r.curated.topics)), true),
      row('measurements', 'Measurements', cells((r) => curatedCell(r.curated.measurements)), true),
      row('o2Range', 'O2 range', cells((r) => testCell(summaryOf(r), (s) => compact(rangeText(s.o2Range, 'fraction')))), true),
      row('pressureRange', 'Pressure range', cells((r) => testCell(summaryOf(r), (s) => compact(rangeText(s.pressureBarRange, 'bar')))), true),
      row('fuels', 'Fuels tested', cells((r) => testCell(summaryOf(r), (s) => s.fuels)), true),
      row('dates', 'Dates', cells(datesCell), true),
      row('related', 'Related investigations', cells((r) => listCell(r.relatedInvestigations)), true),
      row('earthBenefits', 'Earth benefits', cells((r) => textCell(r.earthBenefits)), false),
    ],
  };
}
