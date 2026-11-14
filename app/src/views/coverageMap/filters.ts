import type { ExperimentRecord } from '../../data/types';

// Pure helpers behind the map filters and the "N of M tests plotted" line.
// A filter set to null means "all".

export interface MapFilters {
  accession: string | null;
  flameType: string | null;
  fuel: string | null;
  outcome: string | null;
}

export const NO_FILTERS: MapFilters = { accession: null, flameType: null, fuel: null, outcome: null };

export const OUTCOMES = ['yes', 'no', 'flash', 'not-reported'] as const;

// PSI-10 has no outcome column: "not-reported" is a value of its own, never "no".
export const OUTCOME_LABELS: Record<(typeof OUTCOMES)[number], string> = {
  yes: 'Ignition: yes',
  no: 'Ignition: no',
  flash: 'Ignition: flash',
  'not-reported': 'Ignition: not reported',
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
    (filters.outcome === null || record.outcome === filters.outcome)
  );
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
  return Object.values(filters).some((value) => value !== null);
}
