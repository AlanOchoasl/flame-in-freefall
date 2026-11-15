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

// How many ranked investigations the side panel lists; "See all" and "Show all" open the full list in a dialog.
export const TOP_ROWS = 5;

export function topRows<T>(rows: T[]): T[] {
  return rows.slice(0, TOP_ROWS);
}

// How many investigations a page of the full list in the dialog holds (3 pages for 26).
export const DIALOG_PAGE_SIZE = 10;

// One line under the profile buttons: why this environment ranks the way it does, from the profiles file.
export function profileDescription(profile: RankingProfile): string {
  return profile.factors.topicMatch?.rationale ?? '';
}
