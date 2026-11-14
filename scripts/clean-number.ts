export interface DataQualityEntry {
  field: string;
  raw: string;
  reason: string;
}

export interface CleanNumber {
  value: number | null;
  issue: DataQualityEntry | null;
}

const KNOWN_REASONS: Record<string, string> = {
  '#DIV/0!': 'spreadsheet-error',
  '#VALUE!': 'spreadsheet-error',
  RAMP: 'ramped-condition',
  RAMPED: 'ramped-condition',
  'LOW O2': 'low-o2-note',
  '-': 'no-value',
  '': 'empty',
};

export function cleanNumber(raw: string | undefined, field: string): CleanNumber {
  const text = (raw ?? '').trim();
  const value = Number(text);
  if (text !== '' && Number.isFinite(value)) {
    return { value, issue: null };
  }
  const reason = KNOWN_REASONS[text] ?? 'not-numeric';
  return { value: null, issue: { field, raw: text, reason } };
}
