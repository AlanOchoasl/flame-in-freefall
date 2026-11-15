import { describe, expect, it } from 'vitest';
import { MAX_MARKER_RADIUS, MIN_MARKER_RADIUS, describeOutcomeCounts, exampleCircle, markerRadius, outcomeCounts, pointsByCondition, toCoordinates } from './plotPoints';
import type { ExperimentRecord } from '../../data/types';

const record = (overrides: Partial<ExperimentRecord>): ExperimentRecord =>
  ({ id: 'a', outcome: 'yes', o2Fraction: 0.305, pressureBar: 0.5, isPlottable: true, ...overrides }) as ExperimentRecord;

describe('plot points', () => {
  it('converts O2 fraction to percent and keeps bar', () => {
    expect(toCoordinates(record({}))).toEqual({ x: 30.5, y: 0.5 });
  });
  it('has no coordinates without O2 or pressure', () => {
    expect(toCoordinates(record({ o2Fraction: null }))).toBeNull();
  });
  it('skips tests that cannot be plotted', () => {
    expect(pointsByCondition([record({ isPlottable: false }), record({ o2Fraction: null })])).toHaveLength(0);
  });
  it('merges tests with the same O2 and pressure into one point and counts how each ended', () => {
    const points = pointsByCondition([record({ id: 'a' }), record({ id: 'b' }), record({ id: 'c', outcome: 'no' }), record({ id: 'd', pressureBar: 1 })]);
    expect(points).toHaveLength(2);
    expect(points[0].records.map((r) => r.id)).toEqual(['a', 'b', 'c']);
    expect(points[0].counts).toEqual({ yes: 2, no: 1, flash: 0, 'not-reported': 0 });
  });
  it('never drops a plottable test', () => {
    const records = [record({ id: 'a' }), record({ id: 'b' }), record({ id: 'c', outcome: 'flash' }), record({ id: 'd', o2Fraction: 0.2 })];
    expect(pointsByCondition(records).reduce((sum, point) => sum + point.records.length, 0)).toBe(4);
  });
});

describe('outcomeCounts', () => {
  it('counts plottable tests per outcome', () => {
    const counts = outcomeCounts([record({}), record({}), record({ outcome: 'no' }), record({ outcome: 'flash', isPlottable: false })]);
    expect(counts).toEqual({ yes: 2, no: 1, flash: 0, 'not-reported': 0 });
  });
});

describe('markerRadius', () => {
  it('starts at the minimum for a single test', () => {
    expect(markerRadius(1)).toBe(MIN_MARKER_RADIUS);
  });
  it('grows with the number of tests and stops at the cap', () => {
    expect(markerRadius(5)).toBeGreaterThan(markerRadius(2));
    expect(markerRadius(1000)).toBe(MAX_MARKER_RADIUS);
  });
});

describe('describeOutcomeCounts', () => {
  it('names each outcome in words with its count, skipping the ones with none', () => {
    const counts = { yes: 25, no: 1, flash: 0, 'not-reported': 0 };
    expect(describeOutcomeCounts(counts)).toBe('ignited 25 · no ignition 1');
  });
});

describe('exampleCircle', () => {
  const circles = pointsByCondition([
    record({ id: '1', o2Fraction: 0.2, pressureBar: 1, outcome: 'yes' }),
    record({ id: '2', o2Fraction: 0.2, pressureBar: 1, outcome: 'yes' }),
    record({ id: '3', o2Fraction: 0.2, pressureBar: 1, outcome: 'yes' }),
    record({ id: '4', o2Fraction: 0.5, pressureBar: 2, outcome: 'yes' }),
    record({ id: '5', o2Fraction: 0.5, pressureBar: 2, outcome: 'no' }),
  ]);

  it('prefers the biggest circle whose tests ended in more than one way', () => {
    expect(exampleCircle(circles)?.x).toBe(50);
  });

  it('falls back to the biggest circle, and to nothing for an empty chart', () => {
    expect(exampleCircle(circles.slice(0, 1))?.records).toHaveLength(3);
    expect(exampleCircle([])).toBeNull();
  });
});
