import { buildDatasets, type DatasetCitations, type DatasetInfo } from './dataset-citations.ts';
import type { FlaggedRecord } from './experiment-record.ts';
import { addFlags } from './flags.ts';
import type { MappedFile } from './map-file.ts';
import { summarizeInvestigations, type InvestigationSummary } from './summarize.ts';

// 1.1.0: added `datasets` (DOI and license of each cited investigation). Nothing was removed or renamed.
export const SCHEMA_VERSION = '1.1.0';

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
  datasets: DatasetInfo[];
  plottableCount: number;
  investigations: InvestigationSummary[];
  records: FlaggedRecord[];
}

export function buildExperiments(files: MappedFile[], now: Date, citations: DatasetCitations): ExperimentsDataset {
  const records = files.flatMap((file) => file.records).map(addFlags);
  return {
    schemaVersion: SCHEMA_VERSION,
    generatedAt: now.toISOString(),
    sources: files.map(({ file, read, kept, skipped }) => ({ file, read, kept, skipped })),
    datasets: buildDatasets(records, citations),
    plottableCount: records.filter((record) => record.isPlottable).length,
    investigations: summarizeInvestigations(records),
    records,
  };
}
