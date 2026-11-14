import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { CatalogFile, ExperimentsFile } from '../../data/types';
import { COLLAPSED_ROWS, consoleMetrics, visibleRows } from './consoleModel';

const read = <T>(name: string): T =>
  JSON.parse(readFileSync(new URL(`../../../../data/processed/${name}`, import.meta.url), 'utf8')) as T;

describe('consoleMetrics', () => {
  it('counts what the loaded files contain', () => {
    const metrics = consoleMetrics(26, {
      plottableCount: 2,
      records: [{ inMoonBaseZone: true }, { inMoonBaseZone: false }, { inMoonBaseZone: false }] as ExperimentsFile['records'],
    });
    expect(metrics).toEqual({ investigations: 26, tests: 3, plotted: 2, inZone: 1 });
  });

  it('matches the committed data files', () => {
    const catalog = read<CatalogFile>('catalog.json');
    const experiments = read<ExperimentsFile>('experiments.json');
    const metrics = consoleMetrics(catalog.records.length, experiments);
    expect(metrics.investigations).toBe(catalog.recordCount);
    expect(metrics.tests).toBe(experiments.records.length);
    expect(metrics.plotted).toBeLessThanOrEqual(metrics.tests);
    expect(metrics.inZone).toBeLessThanOrEqual(metrics.plotted);
  });
});

describe('visibleRows', () => {
  const rows = Array.from({ length: 12 }, (_, i) => i);

  it('shows the first rows when collapsed', () => {
    expect(visibleRows(rows, false)).toHaveLength(COLLAPSED_ROWS);
  });

  it('shows every row when expanded', () => {
    expect(visibleRows(rows, true)).toHaveLength(12);
  });
});
