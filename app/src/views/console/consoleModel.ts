import type { ExperimentsFile } from '../../data/types';

export interface ConsoleMetrics {
  investigations: number;
  tests: number;
  plotted: number;
  inZone: number;
}

// The four tiles are computed from the loaded files; nothing here is typed in by hand.
export function consoleMetrics(
  investigations: number,
  experiments: Pick<ExperimentsFile, 'records' | 'plottableCount'>,
): ConsoleMetrics {
  return {
    investigations,
    tests: experiments.records.length,
    plotted: experiments.plottableCount,
    inZone: experiments.records.filter((record) => record.inMoonBaseZone).length,
  };
}

// How many ranked investigations the side panel shows before "Show all".
export const COLLAPSED_ROWS = 5;

export function visibleRows<T>(rows: T[], expanded: boolean): T[] {
  return expanded ? rows : rows.slice(0, COLLAPSED_ROWS);
}
