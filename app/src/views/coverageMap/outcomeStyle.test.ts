import { describe, expect, it } from 'vitest';
import { OUTCOMES } from './filters';
import { OUTCOME_COLOR, isOutcome, slicePath } from './outcomeStyle';

describe('OUTCOME_COLOR', () => {
  it('has a color for every outcome and no other', () => {
    expect(Object.keys(OUTCOME_COLOR).sort()).toEqual([...OUTCOMES].sort());
  });

  it('uses one distinct theme-aware color token per outcome', () => {
    const colors = OUTCOMES.map((outcome) => OUTCOME_COLOR[outcome]);
    expect(new Set(colors).size).toBe(4);
    expect(colors).toEqual(OUTCOMES.map((outcome) => `var(--outcome-${outcome === 'not-reported' ? 'nr' : outcome})`));
  });
});

describe('slicePath', () => {
  it('draws a quarter slice from 12 to 3 o clock', () => {
    expect(slicePath(10, 0, 0.25)).toBe('M 0 0 L 0 -10 A 10 10 0 0 1 10 0 Z');
  });

  it('flags slices over half a turn as large arcs', () => {
    expect(slicePath(10, 0, 0.75)).toContain('A 10 10 0 1 1');
  });

  it('is deterministic', () => {
    expect(slicePath(7, 0.1, 0.6)).toBe(slicePath(7, 0.1, 0.6));
  });
});

describe('isOutcome', () => {
  it('accepts the four outcomes and nothing else', () => {
    expect(OUTCOMES.every(isOutcome)).toBe(true);
    expect(isOutcome('maybe')).toBe(false);
    expect(isOutcome('')).toBe(false);
  });
});
