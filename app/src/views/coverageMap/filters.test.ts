import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { ExperimentRecord, ExperimentsFile } from '../../data/types';
import {
  NO_FILTERS,
  OUTCOME_LABELS,
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

  it('plots 629 of 660 tests and reports 31 as not plotted', () => {
    // 453 of the Must set + 207 of PSI-10 normal flames; 11 + 20 lack O2 or pressure.
    expect(countPlotted(applyFilters(records, NO_FILTERS))).toEqual({ total: 660, plotted: 629, notPlotted: 31 });
  });

  it('updates the counts when filtering by inverse flames', () => {
    const inverse = applyFilters(records, filters({ flameType: 'inverse' }));
    expect(inverse.every((r) => r.flameType === 'inverse')).toBe(true);
    expect(countPlotted(inverse)).toEqual({ total: 274, plotted: 263, notPlotted: 11 });
  });

  it('counts the normal flames of both investigations', () => {
    const normal = applyFilters(records, filters({ flameType: 'normal' }));
    expect(countPlotted(normal)).toEqual({ total: 386, plotted: 366, notPlotted: 20 }); // 179 PSI-159 + 207 PSI-10
  });

  it('PSI-10 has 327 tests (120 inverse + 207 normal), 296 plotted, all with outcome not-reported', () => {
    expect(countPlotted(applyFilters(records, filters({ accession: 'PSI-10' })))).toEqual({ total: 327, plotted: 296, notPlotted: 31 });
    expect(applyFilters(records, filters({ outcome: 'not-reported' }))).toHaveLength(327);
  });

  it('offers the investigations, fuels and outcomes that exist', () => {
    expect(filterOptions(records)).toEqual({
      accessions: ['PSI-10', 'PSI-159'],
      flameTypes: ['inverse', 'normal'],
      fuels: ['butane', 'ethane', 'ethylene', 'propane'],
      outcomes: ['yes', 'no', 'flash', 'not-reported'],
    });
  });
});
