import { OUTCOMES } from './filters';
import { OUTCOME_COLOR, slicePath, type Outcome } from './outcomeStyle';
import { markerRadius, type OutcomeCounts, type PlotPoint } from './plotPoints';

// A count is written inside the marker once it is big enough to hold it.
const LABEL_MIN_TESTS = 6;

interface PieMarkerProps {
  counts: OutcomeCounts;
  radius: number;
  /** A contrasting ring: the tests lie inside the expected Moon-base zone. */
  inZone?: boolean;
  /** A heavier outer ring: the tests shown in the details panel. */
  selected?: boolean;
  /** Writes the number of tests in the center. */
  showCount?: boolean;
}

// One marker: a pie whose slices are how many tests ended each way. A single outcome is a plain disc.
export function PieMarker({ counts, radius, inZone = false, selected = false, showCount = false }: PieMarkerProps) {
  const present = OUTCOMES.filter((outcome) => counts[outcome] > 0);
  const total = present.reduce((sum, outcome) => sum + counts[outcome], 0);
  let start = 0;
  return (
    <g>
      {selected ? <circle r={radius + 6} fill="none" stroke="var(--action)" strokeWidth={3} /> : null}
      {present.length === 1 ? (
        <circle r={radius} fill={OUTCOME_COLOR[present[0]]} />
      ) : (
        present.map((outcome) => {
          const end = start + counts[outcome] / total;
          const slice = <path key={outcome} d={slicePath(radius, start, end)} fill={OUTCOME_COLOR[outcome]} stroke="var(--surface-1)" strokeWidth={1} />;
          start = end;
          return slice;
        })
      )}
      <circle r={radius} fill="none" stroke={inZone ? 'var(--text-primary)' : 'var(--surface-1)'} strokeWidth={inZone ? 2.25 : 1.25} />
      {showCount ? (
        <text textAnchor="middle" dominantBaseline="central" fontSize={radius >= 12 ? 12 : 10} fontWeight={700} fill="#ffffff" stroke="rgba(0,0,0,0.55)" strokeWidth={2.5} paintOrder="stroke">
          {total}
        </text>
      ) : null}
    </g>
  );
}

interface ScatterShapeProps {
  cx?: number;
  cy?: number;
  payload?: PlotPoint & { selected?: boolean };
}

/**
 * The `shape` of the recharts Scatter series: one pie per distinct O2 and pressure. Its size follows the
 * number of tests there, and its contrasting ring marks the expected Moon-base zone (read from the records'
 * flag, never recomputed).
 */
export function PointShape({ cx, cy, payload }: ScatterShapeProps) {
  if (cx === undefined || cy === undefined || !payload) return <g />;
  const testCount = payload.records.length;
  return (
    <g transform={`translate(${cx}, ${cy})`} style={{ cursor: 'pointer' }}>
      <PieMarker
        counts={payload.counts}
        radius={markerRadius(testCount)}
        inZone={payload.records.some((record) => record.inMoonBaseZone)}
        selected={payload.selected}
        showCount={testCount >= LABEL_MIN_TESTS}
      />
    </g>
  );
}

/** A standalone disc in an outcome's color for the legend; the word beside it carries the meaning. */
export function OutcomeDot({ outcome }: { outcome: Outcome }) {
  return (
    <svg width="16" height="16" viewBox="-8 -8 16 16" aria-hidden="true" focusable="false">
      <circle r={6} fill={OUTCOME_COLOR[outcome]} />
    </svg>
  );
}

/** An X for a reference atmosphere (Earth air, spacesuit): it marks a condition, not a set of tests. */
export function ReferenceCross({ cx, cy, color }: { cx?: number; cy?: number; color: string }) {
  if (cx === undefined || cy === undefined) return <g />;
  return (
    <g transform={`translate(${cx}, ${cy})`}>
      <path d="M -6 -6 L 6 6 M -6 6 L 6 -6" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" />
    </g>
  );
}

/** A sample of the reference cross for the legend note. */
export function CrossSample() {
  return (
    <svg width="20" height="20" viewBox="-10 -10 20 20" aria-hidden="true" focusable="false">
      <path d="M -5 -5 L 5 5 M -5 5 L 5 -5" fill="none" stroke="var(--text-secondary)" strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  );
}

/** A sample of the zone ring for the legend note. */
export function ZoneRingSample() {
  return (
    <svg width="20" height="20" viewBox="-10 -10 20 20" aria-hidden="true" focusable="false">
      <circle r={6} fill="var(--surface-2)" stroke="var(--text-primary)" strokeWidth={2.25} />
    </svg>
  );
}
