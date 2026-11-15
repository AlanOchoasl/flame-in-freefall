import { describe, expect, it } from 'vitest';
import { isZoomed, niceTicks, panRange, zoomRange } from './viewRange';

const FULL = [0, 100] as const;

describe('zoomRange', () => {
  it('zooms in around the anchor and keeps the value under the cursor fixed', () => {
    const [from, to] = zoomRange(FULL, FULL, 0.5, 0.5, 1);
    expect([from, to]).toEqual([25, 75]);
  });

  it('keeps the anchor value in place when it is not the center', () => {
    const range = zoomRange(FULL, FULL, 0.2, 0.5, 1); // value 20 sits 20% in
    expect(range[0] + 0.2 * (range[1] - range[0])).toBeCloseTo(20);
  });

  it('never zooms in past the minimum span nor out past the full axis', () => {
    expect(zoomRange([40, 41], FULL, 0.5, 0.1, 1)).toEqual([40, 41]);
    expect(zoomRange([20, 60], FULL, 0.5, 10, 1)).toEqual([0, 100]);
  });

  it('stays inside the full axis', () => {
    const [from, to] = zoomRange([0, 100], FULL, 0, 0.5, 1);
    expect(from).toBe(0);
    expect(to).toBe(50);
  });
});

describe('panRange', () => {
  it('moves the window and stops at the edges', () => {
    expect(panRange([20, 40], FULL, 10)).toEqual([30, 50]);
    expect(panRange([20, 40], FULL, -50)).toEqual([0, 20]);
    expect(panRange([60, 80], FULL, 50)).toEqual([80, 100]);
  });
});

describe('isZoomed', () => {
  it('is false only for the full axis', () => {
    expect(isZoomed(FULL, FULL)).toBe(false);
    expect(isZoomed([10, 100], FULL)).toBe(true);
    expect(isZoomed([0, 90], FULL)).toBe(true);
  });
});

describe('niceTicks', () => {
  it('gives round values inside the window', () => {
    expect(niceTicks([0, 100], 5)).toEqual([0, 20, 40, 60, 80, 100]);
    expect(niceTicks([33.85, 59.6], 5)).toEqual([35, 40, 45, 50, 55]);
    expect(niceTicks([0.84, 1.74], 5)).toEqual([1, 1.2, 1.4, 1.6]);
  });

  it('uses steps small enough for a tight window', () => {
    const ticks = niceTicks([30, 32], 5);
    expect(ticks.length).toBeGreaterThanOrEqual(3);
    expect(ticks.every((tick) => tick >= 30 && tick <= 32)).toBe(true);
  });
});
