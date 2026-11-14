import type { CatalogRecord, InvestigationSummary, SummaryEntry } from '../data/types';

type Range = InvestigationSummary['o2Range'];

function formatRange(range: Range, format: (value: number) => string): string | null {
  const [min, max] = range;
  if (min === null || max === null) return null;
  return min === max ? format(min) : `${format(min)}–${format(max)}`;
}

const percent = (fraction: number) => `${Number((fraction * 100).toFixed(1))}`;

// O2 is stored as a mole fraction; the screen shows percent.
export function formatO2Range(range: Range): string | null {
  const text = formatRange(range, percent);
  return text === null ? null : `${text} % O2`;
}

export function formatPressureRange(range: Range): string | null {
  const text = formatRange(range, (bar) => bar.toFixed(2));
  return text === null ? null : `${text} bar`;
}

export function findSummary(entries: SummaryEntry[], accession: string): SummaryEntry | undefined {
  return entries.find((entry) => entry.accession === accession);
}

export interface RelatedLink {
  accession: string;
  inCatalog: boolean;
}

// A related accession links to its Detail screen only when the catalog has it.
export function relatedLinks(record: CatalogRecord, knownAccessions: ReadonlySet<string>): RelatedLink[] {
  return record.relatedInvestigations.map((accession) => ({ accession, inCatalog: knownAccessions.has(accession) }));
}
