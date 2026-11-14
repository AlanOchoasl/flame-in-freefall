import type { CatalogFile, ExperimentsFile, SummariesFile, VersionedFile } from './types';

// The only place that knows where data comes from. A future API replaces this module only.

export const SUPPORTED_SCHEMA_MAJOR = 1;

export type DataResult<T> =
  | { status: 'ok'; data: T }
  | { status: 'error'; file: string; message: string };

// Data specs declare "1.0.0"; a bare number (e.g. 1) is accepted too. Anything else has no major version.
export function parseMajorVersion(schemaVersion: unknown): number | null {
  if (typeof schemaVersion === 'number') return Math.floor(schemaVersion);
  if (typeof schemaVersion === 'string') {
    const match = /^(\d+)(\.|$)/.exec(schemaVersion);
    if (match) return Number(match[1]);
  }
  return null;
}

async function loadDataFile<T extends VersionedFile>(file: string): Promise<DataResult<T>> {
  const url = `${import.meta.env.BASE_URL}data/${file}`;
  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    return { status: 'error', file, message: `${file} could not be loaded (network error).` };
  }
  if (!response.ok) {
    return { status: 'error', file, message: `${file} could not be loaded (HTTP ${response.status}).` };
  }

  let data: T;
  try {
    data = (await response.json()) as T;
  } catch {
    return { status: 'error', file, message: `${file} is not valid JSON.` };
  }

  const major = parseMajorVersion(data.schemaVersion);
  if (major !== SUPPORTED_SCHEMA_MAJOR) {
    return {
      status: 'error',
      file,
      message: `${file} has schemaVersion ${String(data.schemaVersion)}, but this app supports major version ${SUPPORTED_SCHEMA_MAJOR}.`,
    };
  }
  return { status: 'ok', data };
}

export const getCatalog = () => loadDataFile<CatalogFile>('catalog.json');
export const getExperiments = () => loadDataFile<ExperimentsFile>('experiments.json');
export const getSummaries = () => loadDataFile<SummariesFile>('summaries.json');
