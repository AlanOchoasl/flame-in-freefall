import { describe, expect, it } from 'vitest';
import { normalizeSubArea } from './subarea.ts';

describe('normalizeSubArea', () => {
  it('gives the three gaseous-fuel spellings one normalized value and keeps each raw text', () => {
    const variants = ['Flames of Gaseous Fuels', 'Flames of gaseous fuel', 'Flames of gaseous fuels'].map(normalizeSubArea);
    expect(new Set(variants.map((v) => v.normalized))).toEqual(new Set(['flames of gaseous fuels']));
    expect(variants.map((v) => v.raw)).toEqual(['Flames of Gaseous Fuels', 'Flames of gaseous fuel', 'Flames of gaseous fuels']);
  });
  it('unifies Droplet and Droplets', () => {
    expect(normalizeSubArea('Droplets').normalized).toBe(normalizeSubArea('Droplet').normalized);
  });
  it('ignores case and surrounding space', () => {
    expect(normalizeSubArea('  SPACECRAFT   Fire Safety ').normalized).toBe('spacecraft fire safety');
  });
  it('turns an empty value into null and is not reported', () => {
    expect(normalizeSubArea('')).toEqual({ raw: null, normalized: null, known: true });
  });
  it('flags a value it has never seen, but still passes it through lowercased', () => {
    const result = normalizeSubArea('Plasma Physics');
    expect(result.normalized).toBe('plasma physics');
    expect(result.known).toBe(false);
  });
});
