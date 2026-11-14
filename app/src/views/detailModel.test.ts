import { describe, expect, it } from 'vitest';
import type { CatalogRecord, SummaryEntry } from '../data/types';
import { findSummary, formatO2Range, formatPressureRange, relatedLinks } from './detailModel';

describe('formatO2Range', () => {
  it('shows the mole fraction as a percent range', () => {
    expect(formatO2Range([0.12, 0.85])).toBe('12–85 % O2');
  });

  it('rounds to one decimal and drops trailing zeros', () => {
    expect(formatO2Range([0.2123, 0.8499])).toBe('21.2–85 % O2');
  });

  it('shows a single value when min and max are equal', () => {
    expect(formatO2Range([0.21, 0.21])).toBe('21 % O2');
  });

  it('returns null when there is no range', () => {
    expect(formatO2Range([null, null])).toBeNull();
  });
});

describe('formatPressureRange', () => {
  it('shows bar with two decimals', () => {
    expect(formatPressureRange([0.4953817, 3.3099])).toBe('0.50–3.31 bar');
  });

  it('returns null when there is no range', () => {
    expect(formatPressureRange([null, null])).toBeNull();
  });
});

describe('findSummary', () => {
  const entry = { accession: 'PSI-159' } as SummaryEntry;

  it('finds the entry for an accession', () => {
    expect(findSummary([entry], 'PSI-159')).toBe(entry);
  });

  it('returns undefined when there is none', () => {
    expect(findSummary([entry], 'PSI-10')).toBeUndefined();
  });
});

describe('relatedLinks', () => {
  it('marks which related accessions exist in the catalog', () => {
    const record = { relatedInvestigations: ['PSI-69', 'PSI-9999'] } as CatalogRecord;
    expect(relatedLinks(record, new Set(['PSI-69']))).toEqual([
      { accession: 'PSI-69', inCatalog: true },
      { accession: 'PSI-9999', inCatalog: false },
    ]);
  });
});
