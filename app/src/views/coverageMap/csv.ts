import type { ExperimentRecord } from '../../data/types';

// CSV of the filtered tests for the "download" button. Pure: the browser part (Blob and link)
// lives in the view. Values are the ones of experiments.json, nothing is recomputed.

export const CSV_FILE_NAME = 'psi-test-conditions.csv';
export const CSV_MIME_TYPE = 'text/csv;charset=utf-8';

type Cell = string | number | boolean | null;

interface Column {
  header: string;
  value: (record: ExperimentRecord) => Cell;
}

// "field:reason" for each cell that was not a valid number, e.g. "tadK:spreadsheet-error".
function dataQualityOf(record: ExperimentRecord): string {
  return record.dataQuality
    .map((entry) => {
      const { field, reason } = entry as { field?: unknown; reason?: unknown };
      return typeof field === 'string' && typeof reason === 'string' ? `${field}:${reason}` : JSON.stringify(entry);
    })
    .join(';');
}

export const CSV_COLUMNS: Column[] = [
  { header: 'id', value: (r) => r.id },
  { header: 'investigation', value: (r) => r.accession },
  { header: 'flame_type', value: (r) => r.flameType },
  { header: 'fuel_species', value: (r) => r.fuel.species },
  { header: 'fuel_label', value: (r) => r.fuel.raw },
  { header: 'fuel_inferred', value: (r) => r.fuel.inferred },
  { header: 'o2_fraction', value: (r) => r.o2Fraction },
  { header: 'pressure_bar', value: (r) => r.pressureBar },
  { header: 'pressure_is_approximate', value: (r) => r.pressureIsApproximate },
  { header: 'tad_k', value: (r) => r.tadK },
  { header: 'zst', value: (r) => r.zst },
  { header: 'outcome', value: (r) => r.outcome },
  { header: 'cool_flame', value: (r) => r.coolFlame.value },
  { header: 'cool_flame_raw', value: (r) => r.coolFlame.raw },
  { header: 'self_ext_or_flow_term_raw', value: (r) => r.selfExtOrFlowTermRaw },
  { header: 'tfp_raw', value: (r) => r.tfpRaw },
  { header: 'is_plottable', value: (r) => r.isPlottable },
  { header: 'in_moon_base_zone', value: (r) => r.inMoonBaseZone },
  { header: 'data_quality', value: dataQualityOf },
  { header: 'psi_page_url', value: (r) => r.pageUrl },
];

// RFC 4180: quote a cell that has a comma, a quote or a line break, and double its quotes.
function escapeCell(cell: Cell): string {
  const text = cell === null ? '' : String(cell);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/** Header row plus one row per record, in the order given. Empty cells are `null` values. */
export function buildCsv(records: ExperimentRecord[]): string {
  const header = CSV_COLUMNS.map((column) => escapeCell(column.header)).join(',');
  const rows = records.map((record) => CSV_COLUMNS.map((column) => escapeCell(column.value(record))).join(','));
  return `${[header, ...rows].join('\r\n')}\r\n`;
}
