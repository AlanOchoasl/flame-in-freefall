import { basename } from 'node:path';
import type { ExperimentRecord } from './experiment-record.ts';
import { findMapper } from './mappers/index.ts';
import { readCsvTable } from './read-csv.ts';

export interface MappedFile {
  file: string;
  read: number;
  kept: number;
  skipped: number;
  records: ExperimentRecord[];
}

export function mapCsvFile(path: string): MappedFile {
  const file = basename(path);
  const mapper = findMapper(file);
  if (!mapper) throw new Error(`No mapper registered for ${file}`);
  const table = readCsvTable(path);
  return {
    file,
    read: table.read,
    kept: table.rows.length,
    skipped: table.skipped,
    records: table.rows.map(mapper.mapRow),
  };
}
