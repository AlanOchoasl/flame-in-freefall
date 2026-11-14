import type { CatalogRecord, ExperimentsFile } from '../data/types';
import type { InvestigationTestCoverage, RankedInvestigation } from './ranking';

/** Count normalized tests by investigation for the lunar atmosphere factor. */
export function testCoverageByAccession(file: ExperimentsFile): Record<string, InvestigationTestCoverage> {
  const coverage: Record<string, InvestigationTestCoverage> = {};
  for (const record of file.records) {
    const counts = coverage[record.accession] ?? { rowCount: 0, moonBaseZoneCount: 0 };
    counts.rowCount += 1;
    if (record.inMoonBaseZone) counts.moonBaseZoneCount += 1;
    coverage[record.accession] = counts;
  }
  return coverage;
}

/** Discover filter values from the catalog instead of hard-coding its vocabulary. */
export function rankingFilterOptions(records: CatalogRecord[]): { fuelPhases: string[]; topics: string[] } {
  return {
    fuelPhases: [...new Set(records.flatMap((record) => record.curated.fuelPhase.value))].sort(),
    topics: [...new Set(records.flatMap((record) => record.curated.topics.value))].sort(),
  };
}

/** Keep the score order while applying both optional investigation filters. */
export function filterRanking(
  ranking: RankedInvestigation[],
  fuelPhase: string,
  topic: string,
): RankedInvestigation[] {
  return ranking.filter(({ investigation }) =>
    (!fuelPhase || investigation.curated.fuelPhase.value.includes(fuelPhase)) &&
    (!topic || investigation.curated.topics.value.includes(topic)),
  );
}
