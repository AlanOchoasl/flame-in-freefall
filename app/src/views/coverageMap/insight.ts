import type { ExperimentRecord } from '../../data/types';
import { MOON_BASE_ZONE, formatPressure } from './constants';
import { plottedOnly } from './filters';
import { pointsByCondition } from './plotPoints';

// The insight panel text. Every number is computed from the records; only the wording of the
// limits is fixed. The zone membership comes from the `inMoonBaseZone` flag of experiments.json.

export interface InsightCount {
  label: string;
  count: number;
}

export interface Insight {
  plotted: number;
  inZone: number;
  /** Share of plotted tests in the zone, 0 to 100, one decimal. `null` when nothing is plotted. */
  sharePercent: number | null;
  investigations: InsightCount[];
  fuels: InsightCount[];
}

export interface InsightText {
  headline: string;
  details: string[];
  limits: string[];
}

// Limits stated by the challenge statement and by PSI ("Flames of Gaseous Fuels" for PSI-159).
export const INSIGHT_LIMITS = [
  'These tests burn gaseous fuels, not spacecraft materials such as fabrics and plastics.',
  'PSI holds no partial-gravity combustion data (challenge statement), so none of these points is a Moon-gravity test.',
  'The map shows where PSI has test data, not whether a condition is safe.',
];

function countBy(records: ExperimentRecord[], labelOf: (record: ExperimentRecord) => string): InsightCount[] {
  const counts = new Map<string, number>();
  for (const record of records) counts.set(labelOf(record), (counts.get(labelOf(record)) ?? 0) + 1);
  return [...counts]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

/** Pass the tests that match the current filters; tests that cannot be plotted are ignored. */
export function computeInsight(records: ExperimentRecord[]): Insight {
  const plotted = plottedOnly(records);
  const inZone = plotted.filter((record) => record.inMoonBaseZone);
  return {
    plotted: plotted.length,
    inZone: inZone.length,
    sharePercent: plotted.length === 0 ? null : Math.round((inZone.length / plotted.length) * 1000) / 10,
    investigations: countBy(inZone, (record) => record.accession),
    fuels: countBy(inZone, (record) => record.fuel.species ?? record.fuel.raw ?? 'unknown fuel'),
  };
}

/** The one-sentence answer above the chart, from the tests that match the filters. */
export function describeCoverage(records: ExperimentRecord[]): string {
  const plotted = plottedOnly(records);
  if (plotted.length === 0) return 'No test is plotted with the current filters.';
  const conditions = pointsByCondition(plotted).length;
  const zone = plotted.filter((record) => record.inMoonBaseZone);
  const ignited = zone.filter((record) => record.outcome === 'yes').length;
  const tests = `${plotted.length} ${plotted.length === 1 ? 'test' : 'tests'} at ${conditions} ${conditions === 1 ? 'combination' : 'combinations'} of oxygen and pressure.`;
  const inZone =
    zone.length === 0
      ? 'None falls inside the expected Moon-base zone.'
      : `${zone.length} ${zone.length === 1 ? 'falls' : 'fall'} inside the expected Moon-base zone; the flame ignited in ${ignited} of them.`;
  return `${tests} ${inZone}`;
}

const formatCounts = (counts: InsightCount[]): string =>
  counts.map(({ label, count }) => `${label} (${count})`).join(', ');

export function describeInsight(insight: Insight): InsightText {
  if (insight.sharePercent === null) {
    return { headline: 'No test is plotted with the current filters.', details: [], limits: INSIGHT_LIMITS };
  }
  const zone = `O2 ≥ ${MOON_BASE_ZONE.o2Percent} %, pressure ≤ ${formatPressure(MOON_BASE_ZONE)}`;
  const headline = `Tests in the expected Moon-base zone (${zone}): ${insight.inZone} of ${insight.plotted} plotted (${insight.sharePercent} %).`;
  const details =
    insight.inZone === 0
      ? []
      : [`Investigations: ${formatCounts(insight.investigations)}.`, `Fuels: ${formatCounts(insight.fuels)}.`];
  return { headline, details, limits: INSIGHT_LIMITS };
}
