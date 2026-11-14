import type { RankedInvestigation } from '../../lib/ranking';

export interface RankingFilters {
  fuelPhase: string | null;
  topic: string | null;
}

export const NO_RANKING_FILTERS: RankingFilters = { fuelPhase: null, topic: null };

export function matchesRankingFilters(item: RankedInvestigation, filters: RankingFilters): boolean {
  const { fuelPhase, topics } = item.investigation.curated;
  return (
    (filters.fuelPhase === null || fuelPhase.value.includes(filters.fuelPhase)) &&
    (filters.topic === null || topics.value.includes(filters.topic))
  );
}

// Filtering keeps the ranked order and the original rank number of each item.
export function filterRanked(ranked: RankedInvestigation[], filters: RankingFilters) {
  return ranked
    .map((item, index) => ({ item, rank: index + 1 }))
    .filter(({ item }) => matchesRankingFilters(item, filters));
}

/** The filter choices come from the data, so a new tag in the catalog shows up by itself. */
export function rankingFilterOptions(ranked: RankedInvestigation[]): { fuelPhases: string[]; topics: string[] } {
  const unique = (values: string[]) => [...new Set(values)].sort();
  return {
    fuelPhases: unique(ranked.flatMap((item) => item.investigation.curated.fuelPhase.value)),
    topics: unique(ranked.flatMap((item) => item.investigation.curated.topics.value)),
  };
}
