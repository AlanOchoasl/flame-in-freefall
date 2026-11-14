import { describe, expect, it } from 'vitest';
import { OUTCOMES } from './filters';
import { OUTCOME_STYLE, isOutcome, markerPath } from './outcomeStyle';

const styles = OUTCOMES.map((outcome) => OUTCOME_STYLE[outcome]);

describe('OUTCOME_STYLE', () => {
  it('has a style for every outcome and no other', () => {
    expect(Object.keys(OUTCOME_STYLE).sort()).toEqual([...OUTCOMES].sort());
  });

  it('gives each outcome its own shape (readable without color)', () => {
    expect(new Set(styles.map((s) => s.shape)).size).toBe(4);
    expect(new Set(styles.map((s) => markerPath(s.shape, 5))).size).toBe(4);
  });

  it('keeps not-reported apart from no by shape', () => {
    expect(OUTCOME_STYLE['not-reported'].shape).not.toBe(OUTCOME_STYLE.no.shape);
  });

  it('uses theme-aware data color tokens instead of encoding outcomes in color', () => {
    expect(styles.map((style) => style.color)).toEqual(OUTCOMES.map((outcome) => `var(--outcome-${outcome === 'not-reported' ? 'nr' : outcome})`));
  });

  it('draws the cross as strokes and the other shapes filled', () => {
    expect(OUTCOME_STYLE['not-reported'].filled).toBe(false);
    expect([OUTCOME_STYLE.yes, OUTCOME_STYLE.no, OUTCOME_STYLE.flash].every((s) => s.filled)).toBe(true);
  });
});

describe('markerPath', () => {
  it('draws every shape around (0, 0), growing with the radius', () => {
    expect(markerPath('triangle', 4)).toBe('M 0 -4 L 4 3.2 L -4 3.2 Z');
    expect(markerPath('diamond', 4)).toBe('M 0 -4.6 L 4.6 0 L 0 4.6 L -4.6 0 Z');
    expect(markerPath('cross', 3)).toBe('M -3 -3 L 3 3 M 3 -3 L -3 3');
    expect(markerPath('circle', 3)).toContain('a 3 3');
  });

  it('is deterministic', () => {
    expect(markerPath('circle', 5)).toBe(markerPath('circle', 5));
  });
});

describe('isOutcome', () => {
  it('accepts the four outcomes and nothing else', () => {
    expect(OUTCOMES.every(isOutcome)).toBe(true);
    expect(isOutcome('maybe')).toBe(false);
    expect(isOutcome('')).toBe(false);
  });
});
