import type { FlaggedRecord } from './experiment-record.ts';

export type Range = [number, number] | [null, null];

export interface InvestigationSummary {
  accession: string;
  records: number;
  plottable: number;
  inMoonBaseZone: number;
  o2Range: Range;
  pressureBarRange: Range;
}

function rangeOf(values: (number | null)[]): Range {
  const numbers = values.filter((value): value is number => value !== null);
  if (numbers.length === 0) return [null, null];
  return [Math.min(...numbers), Math.max(...numbers)];
}

export function summarizeInvestigations(records: FlaggedRecord[]): InvestigationSummary[] {
  const byAccession = new Map<string, FlaggedRecord[]>();
  for (const record of records) {
    byAccession.set(record.accession, [...(byAccession.get(record.accession) ?? []), record]);
  }
  return [...byAccession].map(([accession, group]) => ({
    accession,
    records: group.length,
    plottable: group.filter((r) => r.isPlottable).length,
    inMoonBaseZone: group.filter((r) => r.inMoonBaseZone).length,
    o2Range: rangeOf(group.map((r) => r.o2Fraction)),
    pressureBarRange: rangeOf(group.map((r) => r.pressureBar)),
  }));
}
