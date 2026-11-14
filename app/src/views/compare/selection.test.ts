import { describe, expect, it } from 'vitest';
import { addToSelection, compareHash, LIMIT_MESSAGE, parseSelection, removeFromSelection, searchInvestigations } from './selection';
import type { CatalogRecord } from '../../data/types';

const known = ['PSI-1', 'PSI-2', 'PSI-3', 'PSI-4'];
const params = (ids: string) => new URLSearchParams({ ids });

describe('parseSelection', () => {
  it('restores the ids from the address and ignores unknown or repeated ones', () => {
    expect(parseSelection(params('PSI-1,PSI-9,PSI-1,PSI-2'), known)).toEqual(['PSI-1', 'PSI-2']);
  });
  it('keeps at most three', () => {
    expect(parseSelection(params('PSI-1,PSI-2,PSI-3,PSI-4'), known)).toEqual(['PSI-1', 'PSI-2', 'PSI-3']);
  });
  it('is empty without ids', () => {
    expect(parseSelection(new URLSearchParams(), known)).toEqual([]);
  });
});

describe('selection changes', () => {
  it('does not add a fourth and explains the limit', () => {
    expect(addToSelection(['PSI-1', 'PSI-2', 'PSI-3'], 'PSI-4')).toEqual({ ids: ['PSI-1', 'PSI-2', 'PSI-3'], message: LIMIT_MESSAGE });
  });
  it('adds and removes', () => {
    expect(addToSelection(['PSI-1'], 'PSI-2').ids).toEqual(['PSI-1', 'PSI-2']);
    expect(removeFromSelection(['PSI-1', 'PSI-2'], 'PSI-1')).toEqual(['PSI-2']);
  });
  it('round-trips through the hash', () => {
    const hash = compareHash(['PSI-1', 'PSI-2']);
    expect(parseSelection(new URLSearchParams(hash.split('?')[1]), known)).toEqual(['PSI-1', 'PSI-2']);
  });
});

describe('searchInvestigations', () => {
  const records = [
    { accession: 'PSI-1', acronym: 'SAFFIRE', title: 'Spacecraft fire' },
    { accession: 'PSI-2', acronym: null, title: 'Flame design' },
  ] as CatalogRecord[];
  it('matches accession, acronym and title case-insensitively', () => {
    expect(searchInvestigations(records, 'saffire').map((r) => r.accession)).toEqual(['PSI-1']);
    expect(searchInvestigations(records, 'psi-2').map((r) => r.accession)).toEqual(['PSI-2']);
    expect(searchInvestigations(records, 'FLAME').map((r) => r.accession)).toEqual(['PSI-2']);
  });
});
