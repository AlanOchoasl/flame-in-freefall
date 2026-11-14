import {
  buildDatasets,
  buildExcluded,
  type DatasetCitations,
  type DatasetInfo,
  type ExcludedDatasetInfo,
} from './dataset-citations.ts';
import type { FlaggedRecord } from './experiment-record.ts';
import { addFlags } from './flags.ts';
import type { MappedFile } from './map-file.ts';
import { summarizeInvestigations, type InvestigationSummary } from './summarize.ts';

// 1.1.0 added `datasets` (DOI and license of each cited investigation).
// 1.2.0 added `excluded` (datasets left out for lacking a license). Nothing was removed or renamed.
export const SCHEMA_VERSION = '1.2.0';

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
  excluded: ExcludedDatasetInfo[];
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
    datasets: buildDatasets(records, citations), // throws if a record belongs to an excluded dataset
    excluded: buildExcluded(citations),
    plottableCount: records.filter((record) => record.isPlottable).length,
    investigations: summarizeInvestigations(records),
    records,
  };
}
