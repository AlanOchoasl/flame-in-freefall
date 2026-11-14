import type { CatalogFile, ExperimentsFile, SummariesFile } from './types';

// The only place that knows where data comes from. A future API replaces this module only.

export const SUPPORTED_SCHEMA_MAJOR = 1;

export type DataResult<T> =
  | { status: 'ok'; data: T }
  | { status: 'error'; file: string; message: string };

async function loadDataFile<T extends { schemaVersion: number }>(file: string): Promise<DataResult<T>> {
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

  const major = Math.floor(data.schemaVersion);
  if (major !== SUPPORTED_SCHEMA_MAJOR) {
    return {
      status: 'error',
      file,
      message: `${file} has schemaVersion ${data.schemaVersion}, but this app supports major version ${SUPPORTED_SCHEMA_MAJOR}.`,
    };
  }
  return { status: 'ok', data };
}

export const getCatalog = () => loadDataFile<CatalogFile>('catalog.json');
export const getExperiments = () => loadDataFile<ExperimentsFile>('experiments.json');
export const getSummaries = () => loadDataFile<SummariesFile>('summaries.json');
