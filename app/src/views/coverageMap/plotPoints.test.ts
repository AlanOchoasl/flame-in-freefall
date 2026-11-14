import { describe, expect, it } from 'vitest';
import { pointsByOutcome, toPoint } from './plotPoints';
import type { ExperimentRecord } from '../../data/types';

const record = (overrides: Partial<ExperimentRecord>): ExperimentRecord =>
  ({ id: 'a', outcome: 'yes', o2Fraction: 0.305, pressureBar: 0.5, isPlottable: true, ...overrides }) as ExperimentRecord;

describe('plot points', () => {
  it('converts O2 fraction to percent and keeps bar', () => {
    expect(toPoint(record({}))).toMatchObject({ x: 30.5, y: 0.5 });
  });
  it('has no point without O2 or pressure', () => {
    expect(toPoint(record({ o2Fraction: null }))).toBeNull();
  });
  it('groups plottable tests by outcome and skips the rest', () => {
    const series = pointsByOutcome([record({}), record({ outcome: 'no' }), record({ isPlottable: false })]);
    expect(series.yes).toHaveLength(1);
    expect(series.no).toHaveLength(1);
    expect(series.flash).toHaveLength(0);
  });
});
