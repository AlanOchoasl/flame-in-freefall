import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { CatalogFile, ExperimentsFile } from '../data/types';
import { rankInvestigations, type RankingProfilesFile } from '../lib/ranking';
import { rankingPositions, testCoverageByAccession } from './rankingPosition';

const readJson = <T>(path: string): T =>
  JSON.parse(readFileSync(new URL(`../../../data/${path}`, import.meta.url), 'utf8')) as T;

const catalog = readJson<CatalogFile>('processed/catalog.json');
const experiments = readJson<ExperimentsFile>('processed/experiments.json');
const profiles = readJson<RankingProfilesFile>('ranking/profiles.json').profiles;

describe('rankingPositions', () => {
  it('gives one position per profile, within the size of the catalog', () => {
    const positions = rankingPositions('PSI-159', profiles, catalog.records, experiments.investigations);
    expect(positions.map((p) => p.profileId)).toEqual(profiles.map((p) => p.id));
    for (const position of positions) {
      expect(position.total).toBe(catalog.records.length);
      expect(position.position).toBeGreaterThanOrEqual(1);
      expect(position.position).toBeLessThanOrEqual(position.total);
      expect(position.score).toBeLessThanOrEqual(position.maximumScore);
    }
  });

  it('matches the order produced by the ranking function itself', () => {
    const coverage = testCoverageByAccession(experiments.investigations);
    const [position] = rankingPositions('PSI-26', [profiles[0]], catalog.records, experiments.investigations);
    const ranked = rankInvestigations(catalog.records, profiles[0], coverage);
    expect(ranked[position.position - 1].investigation.accession).toBe('PSI-26');
  });

  it('returns nothing for an accession that is not in the catalog', () => {
    expect(rankingPositions('PSI-9999', profiles, catalog.records, experiments.investigations)).toEqual([]);
  });
});

describe('testCoverageByAccession', () => {
  it('maps the experiment summary to the shape the scoring function reads', () => {
    expect(
      testCoverageByAccession([{ accession: 'PSI-10', records: 5, plottable: 4, inMoonBaseZone: 2, o2Range: [null, null], pressureBarRange: [null, null], fuels: [] }]),
    ).toEqual({ 'PSI-10': { rowCount: 5, moonBaseZoneCount: 2 } });
  });
});
