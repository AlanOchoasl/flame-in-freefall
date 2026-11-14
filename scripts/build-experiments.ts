import type { FlaggedRecord } from './experiment-record.ts';
import { addFlags } from './flags.ts';
import type { MappedFile } from './map-file.ts';
import { summarizeInvestigations, type InvestigationSummary } from './summarize.ts';

export const SCHEMA_VERSION = '1.0.0';

export interface SourceCounts {
  file: string;
  read: number;
  kept: number;
  skipped: number;
}

export interface ExperimentsDataset {
  schemaVersion: string;
  generatedAt: string;
  sources: SourceCounts[];
  plottableCount: number;
  investigations: InvestigationSummary[];
  records: FlaggedRecord[];
}

export function buildExperiments(files: MappedFile[], now: Date): ExperimentsDataset {
  const records = files.flatMap((file) => file.records).map(addFlags);
  return {
    schemaVersion: SCHEMA_VERSION,
    generatedAt: now.toISOString(),
    sources: files.map(({ file, read, kept, skipped }) => ({ file, read, kept, skipped })),
    plottableCount: records.filter((record) => record.isPlottable).length,
    investigations: summarizeInvestigations(records),
    records,
  };
}
