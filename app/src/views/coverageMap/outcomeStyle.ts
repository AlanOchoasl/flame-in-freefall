import { OUTCOMES } from './filters';

export type Outcome = (typeof OUTCOMES)[number];
export type MarkerShape = 'circle' | 'triangle' | 'diamond' | 'cross';

export interface OutcomeStyle {
  color: string;
  shape: MarkerShape;
  /** Filled shapes are drawn with a fill; the cross is drawn as two strokes. */
  filled: boolean;
}

// Each outcome has its own color AND its own shape, so the map reads in grayscale.
// Colors are the map outcome tokens of the design-system change (openspec/changes/design-system).
// "not-reported" (a table with no outcome column) is a mark of its own, never drawn as "no".
export const OUTCOME_STYLE: Record<Outcome, OutcomeStyle> = {
  yes: { color: '#c94e0c', shape: 'circle', filled: true },
  no: { color: '#065da0', shape: 'triangle', filled: true },
  flash: { color: '#982f93', shape: 'diamond', filled: true },
  'not-reported': { color: '#7a8089', shape: 'cross', filled: false },
};

export function isOutcome(value: string): value is Outcome {
  return (OUTCOMES as readonly string[]).includes(value);
}

/** SVG path of a marker centered on (0, 0), `r` being its half-size in pixels. */
export function markerPath(shape: MarkerShape, r: number): string {
  const round = (value: number): number => Math.round(value * 100) / 100;
  const low = round(0.8 * r);
  const wide = round(1.15 * r);
  switch (shape) {
    case 'circle':
      return `M ${-r} 0 a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
    case 'triangle':
      return `M 0 ${-r} L ${r} ${low} L ${-r} ${low} Z`;
    case 'diamond':
      return `M 0 ${-wide} L ${wide} 0 L 0 ${wide} L ${-wide} 0 Z`;
    case 'cross':
      return `M ${-r} ${-r} L ${r} ${r} M ${r} ${-r} L ${-r} ${r}`;
  }
}
