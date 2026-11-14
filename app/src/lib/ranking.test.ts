import { describe, expect, it } from 'vitest';
import profileFile from '../../../data/ranking/profiles.json';
import {
  rankInvestigations,
  validateRankingProfiles,
  type RankingInvestigation,
  type RankingProfile,
  type RankingProfilesFile,
} from './ranking';

const profiles = profileFile as RankingProfilesFile;
const lunarProfile = profiles.profiles.find((profile) => profile.id === 'lunar-base-rover')!;

function investigation(
  accession: string,
  overrides: Partial<RankingInvestigation> = {},
): RankingInvestigation {
  return {
    accession,
    researchArea: 'Combustion Science',
    projectType: 'Microgravity Investigation',
    subResearchArea: { normalized: 'spacecraft fire safety' },
    curated: {
      fuelPhase: { value: ['solid'], source: 'Approach text', reviewed: true },
      topics: { value: ['material-flammability'], source: 'Objectives text', reviewed: true },
    },
    ...overrides,
  };
}

describe('ranking profiles', () => {
  it('validates the four complete profiles', () => {
    expect(() => validateRankingProfiles(profiles)).not.toThrow();
  });

  it('rejects a removed factor weight', () => {
    const incomplete = structuredClone(profiles);
    delete incomplete.profiles[0].factors.topicMatch;
    expect(() => validateRankingProfiles(incomplete)).toThrow('missing factor weight: topicMatch');
  });
});

describe('rankInvestigations', () => {
  it('scores topic, fuel phase, PSI label, Moon-zone coverage, and project type', () => {
    const ranked = rankInvestigations(
      [investigation('PSI-26')],
      lunarProfile,
      { 'PSI-26': { rowCount: 10, moonBaseZoneCount: 10 } },
    )[0];

    expect(ranked.breakdown.map(({ points }) => points)).toEqual([3, 2, 2, 3, 1]);
    expect(ranked.score).toBe(11);
    expect(ranked.maximumScore).toBe(11);
  });

  it('reports atmosphere as not assessed when no normalized test rows exist', () => {
    const ranked = rankInvestigations([investigation('PSI-26')], lunarProfile, {})[0];
    const atmosphere = ranked.breakdown.find((factor) => factor.id === 'moonBaseAtmosphere');
    expect(atmosphere).toMatchObject({ status: 'not-assessed', points: null });
    expect(atmosphere?.evidence).toContain('No normalized test data');
  });

  it('flags unreviewed curated tags and places non-combustion investigations last', () => {
    const unreviewed = investigation('PSI-10', {
      curated: {
        fuelPhase: { value: ['solid'], source: 'Approach text', reviewed: false },
        topics: { value: ['material-flammability'], source: 'Objectives text', reviewed: false },
      },
    });
    const outsideArea = investigation('PSI-2', { researchArea: 'Materials Science' });
    const ranked = rankInvestigations([outsideArea, unreviewed], lunarProfile, {});

    expect(ranked[0].basedOnUnreviewedTags).toBe(true);
    expect(ranked[1]).toMatchObject({ nonCombustion: true, score: 8 });
    expect(ranked[1].note).toContain('Outside PSI Combustion Science');
  });

  it('breaks equal-score ties by ascending accession number', () => {
    const ranked = rankInvestigations(
      [investigation('PSI-69'), investigation('PSI-26')],
      lunarProfile,
      {},
    );
    expect(ranked.map(({ investigation: item }) => item.accession)).toEqual(['PSI-26', 'PSI-69']);
  });

  it('uses a changed factor weight without changing the scoring code', () => {
    const changedProfile: RankingProfile = {
      ...lunarProfile,
      factors: {
        ...lunarProfile.factors,
        topicMatch: { ...lunarProfile.factors.topicMatch!, primaryPoints: 1, maxPoints: 1 },
      },
    };
    const ranked = rankInvestigations([investigation('PSI-26')], changedProfile, {});
    expect(ranked[0].score).toBe(6);
  });

  it('assigns the configured secondary-topic score', () => {
    const item = investigation('PSI-102', {
      curated: {
        fuelPhase: { value: ['aerosol-dust'], source: 'Approach text', reviewed: true },
        topics: { value: ['detection'], source: 'Objectives text', reviewed: true },
      },
    });
    const detectionProfile = profiles.profiles.find((profile) => profile.id === 'detection')!;
    const ranked = rankInvestigations([item], detectionProfile, {})[0];
    expect(ranked.breakdown.find((factor) => factor.id === 'topicMatch')?.points).toBe(3);
    expect(ranked.breakdown.find((factor) => factor.id === 'solidFuelFlammability')?.points).toBe(1);
  });
});
