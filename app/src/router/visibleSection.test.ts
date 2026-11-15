import { describe, expect, it } from 'vitest';
import { visibleSection } from './visibleSection';

const bands = {
  coverage: { top: 300, bottom: 1900 },
  comparison: { top: 1900, bottom: 3000 },
  ranking: { top: 300, bottom: 2000 },
};

describe('visibleSection', () => {
  it('is the map while the reading line is inside the map', () => {
    expect(visibleSection(bands, 800)).toBe('coverage');
  });

  it('is the comparison once the line passes into it', () => {
    expect(visibleSection(bands, 2500)).toBe('comparison');
  });

  it('is the ranking at the top of the page, above every panel', () => {
    expect(visibleSection(bands, 100)).toBe('ranking');
  });

  it('is the ranking below the main column', () => {
    expect(visibleSection(bands, 3500)).toBe('ranking');
  });

  it('is the ranking when no band is known yet', () => {
    expect(visibleSection({}, 800)).toBe('ranking');
  });
});
