import type { ExperimentRecord } from '../../data/types';
import type { ExplorerState } from '../../router/explorerQuery';

// Pure helpers behind the map filters and the "N of M tests plotted" line.
// A filter set to null means "all".

export interface MapFilters {
  accession: string | null;
  flameType: string | null;
  fuel: string | null;
  /** Ignition results left out (the legend entries that are switched off). */
  hidden: string[];
  /** "in" keeps only the tests inside the expected Moon-base zone. */
  zone: string | null;
}

export const NO_FILTERS: MapFilters = { accession: null, flameType: null, fuel: null, hidden: [], zone: null };

export const ZONE_ONLY = 'in';

export const OUTCOMES = ['yes', 'no', 'flash', 'not-reported'] as const;

// A table with no outcome column is "not-reported", a value of its own and never "no". No table in use has that today.
export const OUTCOME_LABELS: Record<(typeof OUTCOMES)[number], string> = {
  yes: 'Ignited',
  no: 'No ignition',
  flash: 'Flash only',
  'not-reported': 'Ignition not reported',
};

/** Lower-case words for places that already say the numbers are ignition results (the legend, the tooltip, the table). */
export const OUTCOME_SHORT_LABELS: Record<(typeof OUTCOMES)[number], string> = {
  yes: 'ignited',
  no: 'no ignition',
  flash: 'flash only',
  'not-reported': 'not reported',
};

export interface PlotCounts {
  /** Tests that match the filters, plotted or not. */
  total: number;
  plotted: number;
  notPlotted: number;
}

export interface FilterOptions {
  accessions: string[];
  flameTypes: string[];
  fuels: string[];
  outcomes: string[];
}

export function matchesFilters(record: ExperimentRecord, filters: MapFilters): boolean {
  return (
    (filters.accession === null || record.accession === filters.accession) &&
    (filters.flameType === null || record.flameType === filters.flameType) &&
    (filters.fuel === null || record.fuel.species === filters.fuel) &&
    !filters.hidden.includes(record.outcome) &&
    (filters.zone === null || record.inMoonBaseZone)
  );
}

/** A filter with a single choice filters nothing, so it is hidden unless it is already set (an address can set it). */
export function isFilterUseful(options: string[], current: string | null): boolean {
  return options.length > 1 || current !== null;
}

/** Every test that matches the filters, including the ones that cannot be plotted. */
export function applyFilters(records: ExperimentRecord[], filters: MapFilters): ExperimentRecord[] {
  return records.filter((record) => matchesFilters(record, filters));
}

export const plottedOnly = (records: ExperimentRecord[]): ExperimentRecord[] =>
  records.filter((record) => record.isPlottable);

export function countPlotted(matching: ExperimentRecord[]): PlotCounts {
  const plotted = plottedOnly(matching).length;
  return { total: matching.length, plotted, notPlotted: matching.length - plotted };
}

const sortedUnique = (values: string[]): string[] => [...new Set(values)].sort();

/** The choices each filter offers, taken from the data so a new investigation or fuel shows up by itself. */
export function filterOptions(records: ExperimentRecord[]): FilterOptions {
  const fuels = records.map((record) => record.fuel.species).filter((species): species is string => species !== null);
  const present = new Set(records.map((record) => record.outcome));
  return {
    accessions: sortedUnique(records.map((record) => record.accession)),
    flameTypes: sortedUnique(records.map((record) => record.flameType)),
    fuels: sortedUnique(fuels),
    outcomes: OUTCOMES.filter((outcome) => present.has(outcome)),
  };
}

export function hasActiveFilters(filters: MapFilters): boolean {
  return Object.values(filters).some((value) => (Array.isArray(value) ? value.length > 0 : value !== null));
}

/** The map's filters as the explorer reads them from the address (`investigation`, `flame`, `fuel`, `hide`, `zone`). */
export const filtersFromExplorer = (state: ExplorerState): MapFilters => ({
  accession: state.investigation,
  flameType: state.flame,
  fuel: state.fuel,
  hidden: state.hide,
  zone: state.zone,
});

/** The address change that makes the map show `filters`. */
export const explorerPatchFromFilters = (filters: MapFilters): Partial<ExplorerState> => ({
  investigation: filters.accession,
  flame: filters.flameType,
  fuel: filters.fuel,
  hide: filters.hidden,
  zone: filters.zone,
});
