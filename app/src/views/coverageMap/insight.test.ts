import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { ExperimentRecord, ExperimentsFile } from '../../data/types';
import { INSIGHT_LIMITS, computeInsight, describeInsight } from './insight';

const record = (overrides: Partial<ExperimentRecord> = {}): ExperimentRecord => ({
  id: 'PSI-159:1',
  accession: 'PSI-159',
  pageUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-159',
  dataQuality: [],
  flameType: 'normal',
  fuel: { species: 'ethane', raw: 'ethane', inferred: false },
  o2Fraction: 0.35,
  pressureBar: 0.6,
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
const outside = (overrides: Partial<ExperimentRecord> = {}) =>
  record({ o2Fraction: 0.21, pressureBar: 1.01, inMoonBaseZone: false, ...overrides });

describe('computeInsight', () => {
  it('counts plotted tests in the zone and their share, from the records', () => {
    const insight = computeInsight([record(), outside(), outside()]);
    expect(insight).toMatchObject({ plotted: 3, inZone: 1, sharePercent: 33.3 });
  });

  it('ignores tests that cannot be plotted, even if flagged', () => {
    const unplottable = record({ isPlottable: false, o2Fraction: null, inMoonBaseZone: true });
    expect(computeInsight([record(), unplottable])).toMatchObject({ plotted: 1, inZone: 1, sharePercent: 100 });
  });

  it('groups the zone tests by investigation and fuel, most frequent first, ties alphabetical', () => {
    const insight = computeInsight([
      record({ accession: 'PSI-10', fuel: { species: 'ethylene', raw: 'XC2H4', inferred: true } }),
      record({ accession: 'PSI-159', fuel: { species: 'propane', raw: 'propane', inferred: false } }),
      record({ accession: 'PSI-159', fuel: { species: 'butane', raw: '30% butane', inferred: false } }),
      record({ accession: 'PSI-159', fuel: { species: 'butane', raw: '50% butane', inferred: false } }),
    ]);
    expect(insight.investigations).toEqual([
      { label: 'PSI-159', count: 3 },
      { label: 'PSI-10', count: 1 },
    ]);
    expect(insight.fuels).toEqual([
      { label: 'butane', count: 2 },
      { label: 'ethylene', count: 1 },
      { label: 'propane', count: 1 },
    ]);
  });

  it('only counts the fuels and investigations of tests inside the zone', () => {
    const insight = computeInsight([record(), outside({ accession: 'PSI-10', fuel: { species: 'ethylene', raw: 'XC2H4', inferred: true } })]);
    expect(insight.investigations).toEqual([{ label: 'PSI-159', count: 1 }]);
    expect(insight.fuels).toEqual([{ label: 'ethane', count: 1 }]);
  });

  it('falls back to the raw label when the species is unknown', () => {
    expect(computeInsight([record({ fuel: { species: null, raw: 'mystery', inferred: false } })]).fuels).toEqual([
      { label: 'mystery', count: 1 },
    ]);
  });

  it('has no share when nothing is plotted', () => {
    expect(computeInsight([])).toEqual({ plotted: 0, inZone: 0, sharePercent: null, investigations: [], fuels: [] });
  });
});

describe('describeInsight', () => {
  it('writes the numbers it was given and the zone from the reference values', () => {
    const text = describeInsight(computeInsight([record(), outside(), outside()]));
    expect(text.headline).toBe(
      'Tests in the expected Moon-base zone (O2 ≥ 30 %, pressure ≤ 10.2 psi ≈ 0.70 bar): 1 of 3 plotted (33.3 %).',
    );
    expect(text.details).toEqual(['Investigations: PSI-159 (1).', 'Fuels: ethane (1).']);
  });

  it('says so when no test is in the zone, with no details', () => {
    const text = describeInsight(computeInsight([outside(), outside()]));
    expect(text.headline).toContain('0 of 2 plotted (0 %)');
    expect(text.details).toEqual([]);
  });

  it('says so when nothing is plotted', () => {
    expect(describeInsight(computeInsight([])).headline).toBe('No test is plotted with the current filters.');
  });

  it('always carries the limits: gaseous fuels, no partial gravity, coverage not safety', () => {
    const joined = describeInsight(computeInsight([record()])).limits.join(' ');
    expect(joined).toContain('gaseous fuels');
    expect(joined).toContain('no partial-gravity');
    expect(joined).toContain('not whether a condition is safe');
    expect(describeInsight(computeInsight([])).limits).toBe(INSIGHT_LIMITS);
  });
});

describe('the committed Must dataset', () => {
  const file = JSON.parse(
    readFileSync(new URL('../../../../data/processed/experiments.json', import.meta.url), 'utf8'),
  ) as ExperimentsFile;
  const insight = computeInsight(file.records);

  it('has 66 of 442 plotted tests in the zone', () => {
    expect(insight).toMatchObject({ plotted: 442, inZone: 66, sharePercent: 14.9 });
  });

  it('comes from PSI-159 (48) and PSI-10 (18), with the fuels it burns', () => {
    expect(insight.investigations).toEqual([
      { label: 'PSI-159', count: 48 },
      { label: 'PSI-10', count: 18 },
    ]);
    expect(insight.fuels).toEqual([
      { label: 'butane', count: 26 },
      { label: 'ethylene', count: 18 },
      { label: 'ethane', count: 17 },
      { label: 'propane', count: 5 },
    ]);
  });

  it('reads as the spec asks', () => {
    const text = describeInsight(insight);
    expect(text.headline).toContain('66 of 442 plotted (14.9 %)');
    expect(text.limits).toHaveLength(3);
  });
});
