import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { ExperimentRecord, ExperimentsFile } from '../../data/types';
import {
  isFilterUseful,
  NO_FILTERS,
  OUTCOME_LABELS,
  OUTCOME_SHORT_LABELS,
  OUTCOMES,
  applyFilters,
  countPlotted,
  filterOptions,
  hasActiveFilters,
  matchesFilters,
  plottedOnly,
  type MapFilters,
} from './filters';

const record = (overrides: Partial<ExperimentRecord> = {}): ExperimentRecord => ({
  id: 'PSI-159:1',
  accession: 'PSI-159',
  pageUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-159',
  dataQuality: [],
  flameType: 'normal',
  fuel: { species: 'ethane', raw: 'ethane', inferred: false },
  o2Fraction: 0.3,
  pressureBar: 0.7,
  pressureIsApproximate: true,
  tadK: 2000,
  zst: 0.1,
  outcome: 'yes',
  coolFlame: { value: null, raw: null },
  selfExtOrFlowTermRaw: null,
  tfpRaw: null,
  isPlottable: true,
  inMoonBaseZone: true,
  ...overrides,
});

const filters = (overrides: Partial<MapFilters>): MapFilters => ({ ...NO_FILTERS, ...overrides });

describe('matchesFilters / applyFilters', () => {
  const records = [
    record({ id: 'a', flameType: 'normal', outcome: 'yes' }),
    record({ id: 'b', flameType: 'inverse', outcome: 'no' }),
    record({ id: 'c', accession: 'PSI-10', flameType: 'inverse', outcome: 'not-reported', fuel: { species: 'ethylene', raw: 'XC2H4', inferred: true } }),
  ];
  const ids = (selected: ExperimentRecord[]) => selected.map((r) => r.id);

  it('keeps everything when no filter is set', () => {
    expect(ids(applyFilters(records, NO_FILTERS))).toEqual(['a', 'b', 'c']);
  });

  it('filters by flame type', () => {
    expect(ids(applyFilters(records, filters({ flameType: 'inverse' })))).toEqual(['b', 'c']);
  });

  it('filters by investigation, fuel species and outcome', () => {
    expect(ids(applyFilters(records, filters({ accession: 'PSI-10' })))).toEqual(['c']);
    expect(ids(applyFilters(records, filters({ fuel: 'ethylene' })))).toEqual(['c']);
    expect(ids(applyFilters(records, filters({ outcome: 'no' })))).toEqual(['b']);
  });

  it('combines filters with AND', () => {
    expect(ids(applyFilters(records, filters({ flameType: 'inverse', accession: 'PSI-159' })))).toEqual(['b']);
    expect(applyFilters(records, filters({ flameType: 'normal', outcome: 'no' }))).toEqual([]);
  });

  it('never matches a test with an unknown fuel species when a fuel is chosen', () => {
    const unknown = record({ fuel: { species: null, raw: 'mystery', inferred: false } });
    expect(matchesFilters(unknown, filters({ fuel: 'ethane' }))).toBe(false);
    expect(matchesFilters(unknown, NO_FILTERS)).toBe(true);
  });

  it('does not mutate its input', () => {
    const copy = [...records];
    applyFilters(records, filters({ outcome: 'yes' }));
    expect(records).toEqual(copy);
  });
});

describe('countPlotted', () => {
  it('splits matching tests into plotted and not plotted', () => {
    const matching = [
      record({ id: 'a' }),
      record({ id: 'b', isPlottable: false, o2Fraction: null }),
      record({ id: 'c', isPlottable: false, pressureBar: null }),
    ];
    expect(countPlotted(matching)).toEqual({ total: 3, plotted: 1, notPlotted: 2 });
    expect(plottedOnly(matching).map((r) => r.id)).toEqual(['a']);
  });

  it('handles an empty selection', () => {
    expect(countPlotted([])).toEqual({ total: 0, plotted: 0, notPlotted: 0 });
  });
});

describe('filterOptions', () => {
  it('lists each choice once, sorted, with outcomes in a fixed order', () => {
    const options = filterOptions([
      record({ accession: 'PSI-159', outcome: 'no', fuel: { species: 'propane', raw: 'propane', inferred: false } }),
      record({ accession: 'PSI-10', outcome: 'yes', fuel: { species: 'ethane', raw: 'ethane', inferred: false } }),
      record({ accession: 'PSI-10', outcome: 'yes', fuel: { species: null, raw: '?', inferred: false } }),
    ]);
    expect(options).toEqual({
      accessions: ['PSI-10', 'PSI-159'],
      flameTypes: ['normal'],
      fuels: ['ethane', 'propane'],
      outcomes: ['yes', 'no'],
    });
  });

  it('only offers outcomes that exist in the data', () => {
    expect(filterOptions([record({ outcome: 'flash' })]).outcomes).toEqual(['flash']);
  });
});

describe('hasActiveFilters and labels', () => {
  it('detects any active filter', () => {
    expect(hasActiveFilters(NO_FILTERS)).toBe(false);
    expect(hasActiveFilters(filters({ fuel: 'ethane' }))).toBe(true);
  });

  it('labels every outcome, keeping not-reported apart from no', () => {
    for (const outcome of OUTCOMES) expect(OUTCOME_LABELS[outcome]).not.toBe('');
    expect(OUTCOME_LABELS['not-reported']).not.toBe(OUTCOME_LABELS.no);
  });
});

describe('the committed dataset', () => {
  const file = JSON.parse(
    readFileSync(new URL('../../../../data/processed/experiments.json', import.meta.url), 'utf8'),
  ) as ExperimentsFile;
  const records = file.records;

  it('plots 333 of 333 tests: every test of PSI-159 has O2 and pressure', () => {
    expect(countPlotted(applyFilters(records, NO_FILTERS))).toEqual({ total: 333, plotted: 333, notPlotted: 0 });
  });

  it('updates the counts when filtering by inverse flames', () => {
    const inverse = applyFilters(records, filters({ flameType: 'inverse' }));
    expect(inverse.every((r) => r.flameType === 'inverse')).toBe(true);
    expect(countPlotted(inverse)).toEqual({ total: 154, plotted: 154, notPlotted: 0 });
  });

  it('counts the normal flames', () => {
    const normal = applyFilters(records, filters({ flameType: 'normal' }));
    expect(countPlotted(normal)).toEqual({ total: 179, plotted: 179, notPlotted: 0 });
  });

  it('has no test of PSI-10, which is excluded for having no license, and so no not-reported outcome', () => {
    expect(applyFilters(records, filters({ accession: 'PSI-10' }))).toEqual([]);
    expect(applyFilters(records, filters({ outcome: 'not-reported' }))).toEqual([]);
  });

  it('offers the investigations, fuels and outcomes that exist', () => {
    expect(filterOptions(records)).toEqual({
      accessions: ['PSI-159'],
      flameTypes: ['inverse', 'normal'],
      fuels: ['butane', 'ethane', 'propane'],
      outcomes: ['yes', 'no', 'flash'],
    });
  });
});

describe('OUTCOME_SHORT_LABELS', () => {
  it('names every outcome in words, each different, and never as a bare yes or no', () => {
    const words = OUTCOMES.map((outcome) => OUTCOME_SHORT_LABELS[outcome]);
    expect(new Set(words).size).toBe(OUTCOMES.length);
    for (const word of words) expect(['yes', 'no', '']).not.toContain(word);
  });
});

describe('isFilterUseful', () => {
  it('hides a filter with a single choice', () => {
    expect(isFilterUseful(['PSI-159'], null)).toBe(false);
    expect(isFilterUseful([], null)).toBe(false);
  });
  it('shows a filter with several choices', () => {
    expect(isFilterUseful(['a', 'b'], null)).toBe(true);
  });
  it('keeps a filter that is already set, so it can be cleared', () => {
    expect(isFilterUseful(['PSI-159'], 'PSI-159')).toBe(true);
  });
});
