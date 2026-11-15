import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { CatalogFile, ExperimentsFile } from '../../data/types';
import type { RankingProfile } from '../../lib/ranking';
import { consoleMetrics, profileDescription, TOP_ROWS, topRows } from './consoleModel';

const read = <T>(name: string): T =>
  JSON.parse(readFileSync(new URL(`../../../../data/processed/${name}`, import.meta.url), 'utf8')) as T;

describe('consoleMetrics', () => {
  it('counts what the loaded files contain', () => {
    const metrics = consoleMetrics(26, {
      investigations: [{ records: 3 }, { records: 0 }] as ExperimentsFile['investigations'],
      records: [{ inMoonBaseZone: true }, { inMoonBaseZone: false }, { inMoonBaseZone: false }] as ExperimentsFile['records'],
    });
    expect(metrics).toEqual({ investigations: 26, tests: 3, withTests: 1, inZone: 1 });
  });

  it('matches the committed data files', () => {
    const catalog = read<CatalogFile>('catalog.json');
    const experiments = read<ExperimentsFile>('experiments.json');
    const metrics = consoleMetrics(catalog.records.length, experiments);
    expect(metrics.investigations).toBe(catalog.recordCount);
    expect(metrics.tests).toBe(experiments.records.length);
    expect(metrics.withTests).toBeLessThanOrEqual(metrics.investigations);
    expect(metrics.inZone).toBeLessThanOrEqual(metrics.tests);
  });
});

describe('profileDescription', () => {
  it('is the rationale of the topic factor, taken from the profiles file', () => {
    const profile = { id: 'x', label: 'X', factors: { topicMatch: { rationale: 'Because of the topic.' } } } as unknown as RankingProfile;
    expect(profileDescription(profile)).toBe('Because of the topic.');
  });

  it('is empty when the profile has no topic factor', () => {
    expect(profileDescription({ id: 'x', label: 'X', factors: {} })).toBe('');
  });
});

describe('topRows', () => {
  it('keeps the first rows, in order', () => {
    const rows = Array.from({ length: 12 }, (_, i) => i);
    expect(topRows(rows)).toEqual(rows.slice(0, TOP_ROWS));
  });

  it('keeps a short list whole', () => {
    expect(topRows([1, 2])).toEqual([1, 2]);
  });
});
