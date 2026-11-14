import type { ExperimentRecord } from '../../data/types';
import { OUTCOMES, plottedOnly } from './filters';

// Converts tests into chart points: x is O2 in percent, y is pressure in bar.
export interface PlotPoint {
  x: number;
  y: number;
  record: ExperimentRecord;
}

export function toPoint(record: ExperimentRecord): PlotPoint | null {
  if (record.o2Fraction === null || record.pressureBar === null) return null;
  return { x: Math.round(record.o2Fraction * 1000) / 10, y: record.pressureBar, record };
}

/** One series per outcome, so each outcome gets its own shape and legend entry. */
export function pointsByOutcome(records: ExperimentRecord[]): Record<string, PlotPoint[]> {
  const series: Record<string, PlotPoint[]> = Object.fromEntries(OUTCOMES.map((outcome) => [outcome, []]));
  for (const record of plottedOnly(records)) {
    const point = toPoint(record);
    if (point && record.outcome in series) series[record.outcome].push(point);
  }
  return series;
}
