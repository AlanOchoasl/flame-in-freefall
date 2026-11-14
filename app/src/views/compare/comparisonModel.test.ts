import { describe, expect, it } from 'vitest';
import { buildComparison, markerFor, type Cell } from './comparisonModel';
import type { CatalogRecord, InvestigationSummary } from '../../data/types';

const reviewed = <T,>(value: T) => ({ value, source: 'test', reviewed: true });

function record(accession: string, overrides: Partial<CatalogRecord> = {}): CatalogRecord {
  return {
    accession, title: accession, acronym: null, researchArea: null, isCombustionScience: true, projectType: null,
    flightPlatform: 'ISS', subResearchArea: { raw: null, normalized: null }, hardware: { names: [], links: [] },
    keywords: [], relatedInvestigations: [], startDate: null, endDate: null, releaseDate: null, objectives: null,
    approach: null, hypothesis: null, earthBenefits: null, publicationTitles: [],
    curated: {
      hardwareGroup: reviewed(null), fuelPhase: reviewed(['gas']), topics: reviewed([]), measurements: reviewed([]),
    },
    testTables: [], pageUrl: `https://example.test/${accession}`, doi: null, ...overrides,
  };
}

const summary = (accession: string, o2: [number, number], fuels: string[]): InvestigationSummary => ({
  accession, records: 10, plottable: 10, inMoonBaseZone: 0, o2Range: o2, pressureBarRange: [1, 2], fuels,
});

const rowOf = (model: ReturnType<typeof buildComparison>, id: string) => model.rows.find((r) => r.id === id)!;

describe('markerFor', () => {
  const cell = (...values: string[]): Cell => ({ values, missingReason: values.length ? null : 'not-in-psi-record', unreviewed: false });

  it('marks equal sets as same regardless of order and case', () => {
    expect(markerFor([cell('Gas', 'Solid'), cell('solid', 'gas')])).toBe('same');
  });
  it('marks one missing value as differs', () => {
    expect(markerFor([cell('a'), cell()])).toBe('differs');
  });
  it('marks all missing as all-missing, never same', () => {
    expect(markerFor([cell(), cell()])).toBe('all-missing');
  });
});

describe('buildComparison', () => {
  it('marks same platform as same and different fuel phase as differs', () => {
    const a = record('PSI-1');
    const b = record('PSI-2', { curated: { ...a.curated, fuelPhase: reviewed(['solid']) } });
    const model = buildComparison([a, b], []);
    expect(rowOf(model, 'platform').marker).toBe('same');
    expect(rowOf(model, 'fuelPhase').marker).toBe('differs');
  });

  it('shows a range and marks differing ranges', () => {
    const model = buildComparison(
      [record('PSI-1'), record('PSI-2')],
      [summary('PSI-1', [0.21, 0.5], ['methane']), summary('PSI-2', [0.21, 0.21], ['methane'])],
    );
    expect(rowOf(model, 'o2Range').cells[0].values).toEqual(['21–50 % O2']);
    expect(rowOf(model, 'o2Range').cells[1].values).toEqual(['21 % O2']);
    expect(rowOf(model, 'o2Range').marker).toBe('differs');
    expect(rowOf(model, 'fuels').marker).toBe('same');
  });

  it('marks one investigation without test data as differs with a reason', () => {
    const model = buildComparison([record('PSI-1'), record('PSI-2')], [summary('PSI-1', [0.21, 0.5], ['methane'])]);
    const o2 = rowOf(model, 'o2Range');
    expect(o2.marker).toBe('differs');
    expect(o2.cells[1]).toMatchObject({ values: [], missingReason: 'no-normalized-test-data' });
  });

  it('marks dates missing in both as all-missing', () => {
    const model = buildComparison([record('PSI-1'), record('PSI-2')], []);
    expect(rowOf(model, 'dates').marker).toBe('all-missing');
  });

  it('keeps long text rows without a marker', () => {
    const model = buildComparison([record('PSI-1', { objectives: 'x' }), record('PSI-2')], []);
    expect(rowOf(model, 'objectives').marker).toBeNull();
    expect(rowOf(model, 'objectives').cells[1].missingReason).toBe('not-in-psi-record');
  });

  it('flags unreviewed curated values and explains empty unreviewed ones', () => {
    const a = record('PSI-1', { curated: { ...record('x').curated, fuelPhase: { value: ['gas'], source: null, reviewed: false }, topics: { value: [], source: null, reviewed: false } } });
    const model = buildComparison([a, record('PSI-2')], []);
    expect(rowOf(model, 'fuelPhase').cells[0]).toMatchObject({ values: ['gas'], unreviewed: true });
    expect(rowOf(model, 'topics').cells[0].missingReason).toBe('not-reviewed');
    expect(rowOf(model, 'topics').cells[1].missingReason).toBe('not-in-psi-record');
  });
});
