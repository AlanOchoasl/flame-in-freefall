import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getCatalog, getExperiments, parseMajorVersion } from './dataAccess';

function stubFetch(response: Partial<Response> | Error) {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => (response instanceof Error ? Promise.reject(response) : Promise.resolve(response))),
  );
}

afterEach(() => vi.unstubAllGlobals());

describe('committed data files', () => {
  const readCommitted = (file: string) =>
    JSON.parse(readFileSync(new URL(`../../../data/processed/${file}`, import.meta.url), 'utf8'));

  it('loads the real catalog and experiments through the loader', async () => {
    stubFetch({ ok: true, json: async () => readCommitted('catalog.json') });
    const catalog = await getCatalog();
    expect(catalog.status).toBe('ok');
    if (catalog.status === 'ok') expect(catalog.data.records).toHaveLength(catalog.data.recordCount);

    stubFetch({ ok: true, json: async () => readCommitted('experiments.json') });
    expect((await getExperiments()).status).toBe('ok');
  });
});

describe('parseMajorVersion', () => {
  it('reads the major from numbers and semantic strings', () => {
    expect(parseMajorVersion(1)).toBe(1);
    expect(parseMajorVersion('1.0.0')).toBe(1);
    expect(parseMajorVersion('12.3.4')).toBe(12);
    expect(parseMajorVersion('2')).toBe(2);
  });

  it('returns null when there is no major version', () => {
    expect(parseMajorVersion(undefined)).toBeNull();
    expect(parseMajorVersion('v1')).toBeNull();
    expect(parseMajorVersion('abc')).toBeNull();
  });
});

describe('data access', () => {
  it('returns the data when the file loads and the version is supported', async () => {
    stubFetch({ ok: true, json: async () => ({ schemaVersion: 1, records: [] }) });
    expect(await getCatalog()).toEqual({ status: 'ok', data: { schemaVersion: 1, records: [] } });
  });

  it('accepts a semantic schemaVersion as declared by the data specs', async () => {
    stubFetch({ ok: true, json: async () => ({ schemaVersion: '1.0.0', records: [] }) });
    expect((await getCatalog()).status).toBe('ok');
  });

  it('rejects a semantic schemaVersion with an unsupported major', async () => {
    stubFetch({ ok: true, json: async () => ({ schemaVersion: '2.0.0' }) });
    const result = await getCatalog();
    expect(result.status === 'error' && result.message).toMatch(/catalog\.json.*2\.0\.0.*1/);
  });

  it('rejects a file with a missing or malformed schemaVersion', async () => {
    stubFetch({ ok: true, json: async () => ({ records: [] }) });
    expect((await getCatalog()).status).toBe('error');
    stubFetch({ ok: true, json: async () => ({ schemaVersion: 'abc' }) });
    expect((await getCatalog()).status).toBe('error');
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
