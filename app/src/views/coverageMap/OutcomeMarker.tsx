import { OUTCOME_STYLE, markerPath, type Outcome } from './outcomeStyle';

interface MarkerPathProps {
  outcome: Outcome;
  /** Half-size of the marker in pixels. */
  radius: number;
  /** Heavier outline: the test lies inside the expected Moon-base zone. */
  inZone?: boolean;
  /** Markers overlap heavily, so they are semi-transparent. */
  opacity?: number;
}

// The one drawing of an outcome marker, used by the chart and by the legend so they always match.
export function MarkerPath({ outcome, radius, inZone = false, opacity = 1 }: MarkerPathProps) {
  const { color, shape, filled } = OUTCOME_STYLE[outcome];
  const outline = inZone ? 2.5 : 1;
  return (
    <g>
      {/* Concentric halo (design.md 4.3): faint, so overlapping tests stay readable. */}
      <circle r={radius * 1.9} fill={color} fillOpacity={0.12} stroke={color} strokeOpacity={0.35} strokeWidth={1} />
      <path
        d={markerPath(shape, radius)}
        fill={filled ? color : 'none'}
        fillOpacity={filled ? opacity : undefined}
        stroke={filled ? (inZone ? 'var(--canvas-mark)' : color) : color}
        strokeOpacity={filled && !inZone ? 0.9 : 1}
        strokeWidth={filled ? outline : inZone ? 3.5 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

const MARKER_RADIUS = 4.5;
const MARKER_OPACITY = 0.55; // many tests share conditions, so markers must show what lies behind them

interface ScatterShapeProps {
  cx?: number;
  cy?: number;
  payload?: { record: { inMoonBaseZone: boolean }; selected?: boolean };
}

/**
 * The `shape` of a recharts Scatter series: the same drawing as the legend, with a heavier outline
 * when the test lies in the expected Moon-base zone (read from the flag, never recomputed).
 */
export function scatterShapeFor(outcome: Outcome) {
  return function OutcomeScatterShape({ cx, cy, payload }: ScatterShapeProps) {
    if (cx === undefined || cy === undefined || !payload) return <g />;
    return (
      <g transform={`translate(${cx}, ${cy})`}>
        {payload.selected ? <circle r={MARKER_RADIUS * 2.8} fill="none" stroke="var(--text-primary)" strokeWidth={2} /> : null}
        <MarkerPath outcome={outcome} radius={MARKER_RADIUS} inZone={payload.record.inMoonBaseZone} opacity={MARKER_OPACITY} />
      </g>
    );
  };
}

/** A standalone marker for text, e.g. in the legend. The word beside it carries the meaning. */
export function OutcomeMarker({ outcome, inZone = false }: { outcome: Outcome; inZone?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="-10 -10 20 20" aria-hidden="true" focusable="false">
      <MarkerPath outcome={outcome} radius={5.5} inZone={inZone} />
    </svg>
  );
}
