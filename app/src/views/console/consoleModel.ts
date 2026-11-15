import type { ExperimentsFile } from '../../data/types';
import type { RankingProfile } from '../../lib/ranking';

export interface ConsoleMetrics {
  investigations: number;
  tests: number;
  /** Investigations that have at least one normalized test row. */
  withTests: number;
  inZone: number;
}

// The four tiles are computed from the loaded files; nothing here is typed in by hand.
export function consoleMetrics(
  investigations: number,
  experiments: Pick<ExperimentsFile, 'records' | 'investigations'>,
): ConsoleMetrics {
  return {
    investigations,
    tests: experiments.records.length,
    withTests: experiments.investigations.filter((summary) => summary.records > 0).length,
    inZone: experiments.records.filter((record) => record.inMoonBaseZone).length,
  };
}

// How many ranked investigations the side panel shows before "Show all".
export const COLLAPSED_ROWS = 5;

export function visibleRows<T>(rows: T[], expanded: boolean): T[] {
  return expanded ? rows : rows.slice(0, COLLAPSED_ROWS);
}

// One line under the profile buttons: why this environment ranks the way it does, from the profiles file.
export function profileDescription(profile: RankingProfile): string {
  return profile.factors.topicMatch?.rationale ?? '';
}
