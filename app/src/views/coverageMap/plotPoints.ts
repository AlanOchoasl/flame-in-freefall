import type { ExperimentRecord } from '../../data/types';
import { OUTCOMES, OUTCOME_SHORT_LABELS, plottedOnly } from './filters';
import { isOutcome, type Outcome } from './outcomeStyle';

// Converts tests into chart points: x is O2 in percent, y is pressure in bar.
// Tests with the same O2 and pressure share one point, so a stack of identical conditions is one marker
// whose size is the number of tests and whose slices are how they ended; `records` keeps every test.
export type OutcomeCounts = Record<Outcome, number>;

export interface PlotPoint {
  x: number;
  y: number;
  records: ExperimentRecord[];
  counts: OutcomeCounts;
}

export const MIN_MARKER_RADIUS = 5;
export const MAX_MARKER_RADIUS = 16;

/** Marker radius in pixels: grows with the square root of the tests it stands for, up to a cap. */
export function markerRadius(testCount: number): number {
  return Math.min(MAX_MARKER_RADIUS, MIN_MARKER_RADIUS + 2 * Math.sqrt(Math.max(testCount, 1) - 1));
}

/** "ignited 25 · no ignition 1": how the tests at one point ended, in words. */
export function describeOutcomeCounts(counts: OutcomeCounts): string {
  return OUTCOMES.filter((outcome) => counts[outcome] > 0)
    .map((outcome) => `${OUTCOME_SHORT_LABELS[outcome]} ${counts[outcome]}`)
    .join(' · ');
}

/** The circle that best teaches how to read one: the biggest whose tests ended in more than one way, else the biggest. */
export function exampleCircle(points: PlotPoint[]): PlotPoint | null {
  const mixed = (point: PlotPoint) => OUTCOMES.filter((outcome) => point.counts[outcome] > 0).length > 1;
  const biggest = (list: PlotPoint[]) => list.reduce<PlotPoint | null>((best, point) => (best === null || point.records.length > best.records.length ? point : best), null);
  return biggest(points.filter(mixed)) ?? biggest(points);
}

const emptyCounts = (): OutcomeCounts => Object.fromEntries(OUTCOMES.map((outcome) => [outcome, 0])) as OutcomeCounts;

export function toCoordinates(record: ExperimentRecord): { x: number; y: number } | null {
  if (record.o2Fraction === null || record.pressureBar === null) return null;
  return { x: Math.round(record.o2Fraction * 1000) / 10, y: record.pressureBar };
}

/** Plottable tests per outcome, the numbers the legend shows. */
export function outcomeCounts(records: ExperimentRecord[]): OutcomeCounts {
  const counts = emptyCounts();
  for (const record of plottedOnly(records)) if (isOutcome(record.outcome)) counts[record.outcome] += 1;
  return counts;
}

/** One point per distinct O2 and pressure; each keeps its tests and how many ended each way. */
export function pointsByCondition(records: ExperimentRecord[]): PlotPoint[] {
  const points = new Map<string, PlotPoint>();
  for (const record of plottedOnly(records)) {
    const coordinates = toCoordinates(record);
    if (!coordinates || !isOutcome(record.outcome)) continue;
    const key = `${coordinates.x}|${coordinates.y}`;
    const point = points.get(key) ?? { ...coordinates, records: [], counts: emptyCounts() };
    point.records.push(record);
    point.counts[record.outcome] += 1;
    points.set(key, point);
  }
  return [...points.values()];
}
