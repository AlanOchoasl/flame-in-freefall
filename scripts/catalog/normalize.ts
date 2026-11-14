// Small, pure normalizers for the messy text PSI returns.

/** Collapses runs of spaces/tabs, keeps line breaks (paragraphs), at most one blank line. Empty -> null. */
export function cleanText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const text = value
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t ]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return text === '' ? null : text;
}

/** PSI joins list items with runs of two or more spaces (or a line break). Single spaces stay inside an item. */
export function splitList(value: unknown): string[] {
  if (typeof value !== 'string') return [];
  return value
    .split(/\n|[ \t]{2,}/)
    .map((item) => item.replace(/\s+/g, ' ').trim())
    .filter((item) => item !== '');
}

/** Related investigations are accessions separated by whitespace, e.g. "PSI-69     PSI-142". */
export function splitAccessions(value: unknown): string[] {
  if (typeof value !== 'string') return [];
  return value.split(/\s+/).filter((token) => token !== '');
}

export interface DateResult {
  value: string | null;
  warning: string | null;
}

/** "MM-DD-YYYY" -> "YYYY-MM-DD". Empty -> null. A date that does not exist -> null plus a warning. */
export function parseUsDate(value: unknown): DateResult {
  if (typeof value !== 'string' || value.trim() === '') return { value: null, warning: null };
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value.trim());
  if (!match) return { value: null, warning: `unrecognized date "${value}"` };
  const [month, day, year] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  const exists = date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  if (!exists) return { value: null, warning: `date does not exist "${value}"` };
  return { value: date.toISOString().slice(0, 10), warning: null };
}

/** Epoch seconds -> "YYYY-MM-DD" in UTC. */
export function epochToIsoDate(value: unknown): string | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return new Date(value * 1000).toISOString().slice(0, 10);
}
