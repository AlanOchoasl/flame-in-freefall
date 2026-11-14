import { describe, expect, it } from 'vitest';
import { summariseAiUse } from './aiUse';

const entry = (overrides: Partial<Parameters<typeof summariseAiUse>[0][number]> = {}) => ({
  accession: 'PSI-159',
  model: 'model-a',
  generatedAt: '2026-11-14',
  promptVersion: 'v1',
  reviewed: false,
  ...overrides,
});

describe('summariseAiUse', () => {
  it('summarises models, prompt versions, dates and review counts', () => {
    const facts = summariseAiUse([
      entry({ reviewed: true }),
      entry({ accession: 'PSI-10', model: 'model-b', generatedAt: '2026-11-15', promptVersion: 'v2' }),
      entry({ accession: 'PSI-25' }),
    ]);
    expect(facts).toEqual({
      total: 3,
      reviewed: 1,
      models: ['model-a', 'model-b'],
      promptVersions: ['v1', 'v2'],
      firstGenerated: '2026-11-14',
      lastGenerated: '2026-11-15',
    });
  });

  it('returns empty facts when there are no summaries', () => {
    expect(summariseAiUse([])).toEqual({
      total: 0,
      reviewed: 0,
      models: [],
      promptVersions: [],
      firstGenerated: null,
      lastGenerated: null,
    });
  });
});
