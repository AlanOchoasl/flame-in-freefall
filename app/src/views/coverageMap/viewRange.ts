// The visible part of one chart axis, as [from, to] in data units. Zooming and panning only ever move this
// window inside the full axis; no data is changed.
export type Range = readonly [number, number];

const clamp = (value: number, low: number, high: number): number => Math.min(Math.max(value, low), high);

function placeInside(from: number, span: number, full: Range): Range {
  const start = clamp(from, full[0], full[1] - span);
  return [start, start + span];
}

/**
 * Scales the window by `factor` (below 1 zooms in) keeping the value under the cursor fixed.
 * `anchor` is where the cursor sits in the window: 0 is its start, 1 its end.
 */
export function zoomRange(range: Range, full: Range, anchor: number, factor: number, minSpan: number): Range {
  const span = range[1] - range[0];
  const nextSpan = clamp(span * factor, minSpan, full[1] - full[0]);
  const anchorValue = range[0] + anchor * span;
  return placeInside(anchorValue - anchor * nextSpan, nextSpan, full);
}

/** Moves the window by `delta` data units, stopping at the edges of the full axis. */
export function panRange(range: Range, full: Range, delta: number): Range {
  return placeInside(range[0] + delta, range[1] - range[0], full);
}

export const isZoomed = (range: Range, full: Range): boolean => range[0] > full[0] || range[1] < full[1];

/** Round tick values (1, 2, 2.5 or 5 times a power of ten) inside the window, about `count` of them. */
export function niceTicks(range: Range, count: number): number[] {
  const rawStep = (range[1] - range[0]) / count;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const step = ([1, 2, 2.5, 5, 10].find((factor) => factor * magnitude >= rawStep / 1.5) ?? 10) * magnitude;
  const first = Math.ceil(range[0] / step - 1e-9);
  const ticks: number[] = [];
  for (let i = first; i * step <= range[1] + 1e-9; i += 1) ticks.push(Math.round(i * step * 1e6) / 1e6 + 0); // + 0 turns -0 into 0
  return ticks;
}
