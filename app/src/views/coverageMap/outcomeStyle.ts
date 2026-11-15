import { OUTCOMES } from './filters';

export type Outcome = (typeof OUTCOMES)[number];

// One theme-aware color token per outcome (see styles.css). The legend, the tooltip and the table state the
// outcome in words too, so color is never the only way to read a result.
// "not-reported" (a table with no outcome column) is a color of its own, never drawn as "no".
export const OUTCOME_COLOR: Record<Outcome, string> = {
  yes: 'var(--outcome-yes)',
  no: 'var(--outcome-no)',
  flash: 'var(--outcome-flash)',
  'not-reported': 'var(--outcome-nr)',
};

export function isOutcome(value: string): value is Outcome {
  return (OUTCOMES as readonly string[]).includes(value);
}

const round = (value: number): number => Math.round(value * 100) / 100;

/** SVG path of a pie slice centered on (0, 0) that starts at 12 o'clock; angles are in turns (0 to 1). */
export function slicePath(radius: number, startTurn: number, endTurn: number): string {
  const point = (turn: number): string => `${round(radius * Math.sin(2 * Math.PI * turn))} ${round(-radius * Math.cos(2 * Math.PI * turn))}`;
  const largeArc = endTurn - startTurn > 0.5 ? 1 : 0;
  return `M 0 0 L ${point(startTurn)} A ${radius} ${radius} 0 ${largeArc} 1 ${point(endTurn)} Z`;
}
