import { rankInvestigations, type InvestigationTestCoverage, type RankingProfile } from '../lib/ranking';
import type { CatalogRecord, InvestigationSummary } from '../data/types';

export interface ProfilePosition {
  profileId: string;
  label: string;
  position: number;
  total: number;
  score: number;
  maximumScore: number;
  notAssessedFactors: number;
  basedOnUnreviewedTags: boolean;
  note: string | null;
}

/** The profile where the investigation ranks highest (the first one on a tie); null when it is in none. */
export function bestPosition(positions: ProfilePosition[]): ProfilePosition | null {
  return positions.reduce<ProfilePosition | null>((best, item) => (best === null || item.position < best.position ? item : best), null);
}

export function testCoverageByAccession(summaries: InvestigationSummary[]): Record<string, InvestigationTestCoverage> {
  return Object.fromEntries(
    summaries.map((summary) => [summary.accession, { rowCount: summary.records, moonBaseZoneCount: summary.inMoonBaseZone }]),
  );
}

// Where one investigation lands in each profile's ranking, using Pipo's scoring function unchanged.
export function rankingPositions(
  accession: string,
  profiles: RankingProfile[],
  records: CatalogRecord[],
  summaries: InvestigationSummary[],
): ProfilePosition[] {
  const coverage = testCoverageByAccession(summaries);
  return profiles.flatMap((profile) => {
    const ranked = rankInvestigations(records, profile, coverage);
    const index = ranked.findIndex((item) => item.investigation.accession === accession);
    if (index === -1) return [];
    const item = ranked[index];
    return [
      {
        profileId: profile.id,
        label: profile.label,
        position: index + 1,
        total: ranked.length,
        score: item.score,
        maximumScore: item.maximumScore,
        notAssessedFactors: item.breakdown.filter((factor) => factor.status === 'not-assessed').length,
        basedOnUnreviewedTags: item.basedOnUnreviewedTags,
        note: item.note,
      },
    ];
  });
}
