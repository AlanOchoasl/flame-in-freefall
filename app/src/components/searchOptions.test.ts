import { describe, expect, it } from 'vitest';
import { filterOptions, moveActive, type SearchOption } from './searchOptions';

const options: SearchOption[] = [
  { value: 'PSI-25', label: 'PSI-25 · BASS-II', search: 'PSI-25 BASS-II Burning and Suppression of Solids - II' },
  { value: 'PSI-26', label: 'PSI-26 · BASS', search: 'PSI-26 BASS Burning and Suppression of Solids' },
  { value: 'PSI-47', label: 'PSI-47 · DAFT / DAFT-2', search: 'PSI-47 DAFT / DAFT-2 Dust and Aerosol Measurement Feasibility Test' },
];

const values = (found: SearchOption[]) => found.map((option) => option.value);

describe('filterOptions', () => {
  it('lists everything for an empty or blank query', () => {
    expect(values(filterOptions(options, ''))).toEqual(['PSI-25', 'PSI-26', 'PSI-47']);
    expect(values(filterOptions(options, '   '))).toEqual(['PSI-25', 'PSI-26', 'PSI-47']);
  });
  it('matches the accession, the acronym and the title, ignoring case', () => {
    expect(values(filterOptions(options, 'psi-47'))).toEqual(['PSI-47']);
    expect(values(filterOptions(options, 'daft'))).toEqual(['PSI-47']);
    expect(values(filterOptions(options, 'aerosol'))).toEqual(['PSI-47']);
    expect(values(filterOptions(options, 'BASS'))).toEqual(['PSI-25', 'PSI-26']);
  });
  it('needs every word, in any order', () => {
    expect(values(filterOptions(options, 'bass 26'))).toEqual(['PSI-26']);
    expect(values(filterOptions(options, '26 bass'))).toEqual(['PSI-26']);
  });
  it('finds nothing when a word is missing', () => {
    expect(filterOptions(options, 'bass nonsense')).toEqual([]);
  });
  it('keeps the order of the options', () => {
    expect(values(filterOptions(options, 'solids'))).toEqual(['PSI-25', 'PSI-26']);
  });
});

describe('moveActive', () => {
  it('moves down and up', () => {
    expect(moveActive(0, 3, 'down')).toBe(1);
    expect(moveActive(2, 3, 'up')).toBe(1);
  });
  it('wraps around at both ends', () => {
    expect(moveActive(2, 3, 'down')).toBe(0);
    expect(moveActive(0, 3, 'up')).toBe(2);
  });
  it('stays at 0 with no options', () => {
    expect(moveActive(0, 0, 'down')).toBe(0);
  });
});
