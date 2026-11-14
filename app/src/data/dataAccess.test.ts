import { afterEach, describe, expect, it, vi } from 'vitest';
import { getCatalog, getExperiments } from './dataAccess';

function stubFetch(response: Partial<Response> | Error) {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => (response instanceof Error ? Promise.reject(response) : Promise.resolve(response))),
  );
}

afterEach(() => vi.unstubAllGlobals());

describe('data access', () => {
  it('returns the data when the file loads and the version is supported', async () => {
    stubFetch({ ok: true, json: async () => ({ schemaVersion: 1, records: [] }) });
    expect(await getCatalog()).toEqual({ status: 'ok', data: { schemaVersion: 1, records: [] } });
  });

  it('names the file when it cannot be loaded', async () => {
    stubFetch({ ok: false, status: 404 });
    const result = await getExperiments();
    expect(result).toMatchObject({ status: 'error', file: 'experiments.json' });
    expect(result.status === 'error' && result.message).toContain('experiments.json');
  });

  it('names the file when the network fails', async () => {
    stubFetch(new Error('offline'));
    expect(await getCatalog()).toMatchObject({ status: 'error', file: 'catalog.json' });
  });

  it('names the file and both versions when the version is unsupported', async () => {
    stubFetch({ ok: true, json: async () => ({ schemaVersion: 2 }) });
    const result = await getCatalog();
    expect(result.status === 'error' && result.message).toMatch(/catalog\.json.*2.*1/);
  });

  it('reports invalid JSON for the right file', async () => {
    stubFetch({
      ok: true,
      json: async () => {
        throw new SyntaxError('bad');
      },
    });
    expect(await getExperiments()).toMatchObject({ status: 'error', file: 'experiments.json' });
  });
});
