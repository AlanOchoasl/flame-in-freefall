import { describe, expect, it } from 'vitest';
import { filterRanked, NO_RANKING_FILTERS, rankingFilterOptions } from './rankingFilters';
import type { RankedInvestigation } from '../../lib/ranking';

const item = (accession: string, fuelPhase: string[], topics: string[]) =>
  ({
    investigation: { accession, curated: { fuelPhase: { value: fuelPhase }, topics: { value: topics } } },
  }) as unknown as RankedInvestigation;

const ranked = [item('PSI-1', ['solid'], ['detection']), item('PSI-2', ['gas'], ['modeling']), item('PSI-3', ['solid', 'gas'], [])];

describe('ranking filters', () => {
  it('lists everything without filters', () => {
    expect(filterRanked(ranked, NO_RANKING_FILTERS)).toHaveLength(3);
  });
  it('keeps the original rank when filtering by fuel phase', () => {
    const result = filterRanked(ranked, { fuelPhase: 'gas', topic: null });
    expect(result.map(({ item: i, rank }) => [i.investigation.accession, rank])).toEqual([['PSI-2', 2], ['PSI-3', 3]]);
  });
  it('combines both filters', () => {
    expect(filterRanked(ranked, { fuelPhase: 'solid', topic: 'detection' })).toHaveLength(1);
  });
  it('builds options from the data', () => {
    expect(rankingFilterOptions(ranked)).toEqual({ fuelPhases: ['gas', 'solid'], topics: ['detection', 'modeling'] });
  });
});
