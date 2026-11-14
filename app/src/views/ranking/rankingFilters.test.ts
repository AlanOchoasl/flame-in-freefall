import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { filterRanked, NO_RANKING_FILTERS, rankingFilterOptions } from './rankingFilters';
import { rankInvestigations, type RankedInvestigation, type RankingProfilesFile } from '../../lib/ranking';
import type { CatalogFile, ExperimentsFile } from '../../data/types';
import { testCoverageByAccession } from '../rankingPosition';

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

describe('ranking demo path with committed data', () => {
  const readJson = <T>(path: string): T =>
    JSON.parse(readFileSync(new URL(`../../../../data/${path}`, import.meta.url), 'utf8')) as T;

  const catalog = readJson<CatalogFile>('processed/catalog.json');
  const experiments = readJson<ExperimentsFile>('processed/experiments.json');
  const profiles = readJson<RankingProfilesFile>('ranking/profiles.json').profiles;
  const coverage = testCoverageByAccession(experiments.investigations);

  it('changes the investigation order when the environment profile changes', () => {
    const cabin = rankInvestigations(catalog.records, profiles.find((profile) => profile.id === 'crew-cabin')!, coverage);
    const detection = rankInvestigations(catalog.records, profiles.find((profile) => profile.id === 'detection')!, coverage);

    expect(cabin).toHaveLength(catalog.recordCount);
    expect(cabin.map((entry) => entry.investigation.accession)).not.toEqual(
      detection.map((entry) => entry.investigation.accession),
    );
  });

  it('filters the real ranking by fuel phase and topic without losing rank positions', () => {
    const ranked = rankInvestigations(catalog.records, profiles[0], coverage);
    expect(rankingFilterOptions(ranked).fuelPhases).toContain('solid');

    const solid = filterRanked(ranked, { fuelPhase: 'solid', topic: null });
    expect(solid).toHaveLength(4);
    expect(solid.every(({ item, rank }) =>
      item.investigation.curated.fuelPhase.value.includes('solid') && ranked[rank - 1] === item,
    )).toBe(true);

    const solidDetection = filterRanked(ranked, { fuelPhase: 'solid', topic: 'detection' });
    expect(solidDetection).toEqual(solid.filter(({ item }) => item.investigation.curated.topics.value.includes('detection')));
  });
});
