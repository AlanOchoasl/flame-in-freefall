import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getRankingProfiles } from '../data/dataAccess';
import type { CatalogFile, ExperimentsFile } from '../data/types';
import { rankInvestigations } from './ranking';
import { filterRanking, rankingFilterOptions, testCoverageByAccession } from './rankingViewData';

const readProcessed = <T>(name: string): T =>
  JSON.parse(readFileSync(new URL(`../../../data/processed/${name}`, import.meta.url), 'utf8')) as T;

const catalog = readProcessed<CatalogFile>('catalog.json');
const experiments = readProcessed<ExperimentsFile>('experiments.json');
const profiles = getRankingProfiles().profiles;

describe('ranking view with committed data', () => {
  it('re-ranks investigations when the environment profile changes', () => {
    const coverage = testCoverageByAccession(experiments);
    const cabin = rankInvestigations(catalog.records, profiles.find((item) => item.id === 'crew-cabin')!, coverage);
    const detection = rankInvestigations(catalog.records, profiles.find((item) => item.id === 'detection')!, coverage);

    expect(cabin).toHaveLength(catalog.records.length);
    expect(cabin.map((item) => item.investigation.accession)).not.toEqual(
      detection.map((item) => item.investigation.accession),
    );
  });

  it('counts tests per accession, including those in the lunar zone', () => {
    const coverage = testCoverageByAccession(experiments);
    expect(coverage['PSI-159']).toEqual({ rowCount: 333, moonBaseZoneCount: 48 });
    expect(coverage['PSI-10']).toEqual({ rowCount: 120, moonBaseZoneCount: 18 });
  });

  it('filters by the actual catalog tags and reports the match count', () => {
    const ranking = rankInvestigations(catalog.records, profiles[0], testCoverageByAccession(experiments));
    const options = rankingFilterOptions(catalog.records);
    expect(options.fuelPhases).toContain('solid');

    const solid = filterRanking(ranking, 'solid', '');
    expect(solid.length).toBeGreaterThan(0);
    expect(solid.length).toBeLessThan(ranking.length);
    expect(solid.every((item) => item.investigation.curated.fuelPhase.value.includes('solid'))).toBe(true);

    const topic = options.topics[0];
    const both = filterRanking(ranking, 'solid', topic);
    expect(both.length).toBe(
      solid.filter((item) => item.investigation.curated.topics.value.includes(topic)).length,
    );
    expect(filterRanking(ranking, '', '')).toHaveLength(catalog.records.length);
  });
});
