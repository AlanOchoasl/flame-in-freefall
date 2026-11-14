import { readFileSync } from 'node:fs';
import { buildExperiments, type ExperimentsDataset } from './build-experiments.ts';
import { parseCitations, type DatasetCitations } from './dataset-citations.ts';
import { mapCsvFile } from './map-file.ts';

// The tables that go into experiments.json. Only datasets with a verified license are listed: PSI-10
// is left out because it declares none (see "excluded" in data/curation/dataset-citations.json).
// A registered mapper alone does not include its file; it has to be listed here too.
export const MUST_FILES = [
  'PSI-159_Experimental_table_CFI-G_Normal_Flames.csv',
  'PSI-159_Experimental_table_CFI-G_Inverse_Flames.csv',
];

export const CITATIONS_FILE = 'data/curation/dataset-citations.json';

export function readCitations(root: string): DatasetCitations {
  return parseCitations(JSON.parse(readFileSync(`${root}${CITATIONS_FILE}`, 'utf8')));
}

export function runPipeline(sampleDir: string, now: Date, citations: DatasetCitations): ExperimentsDataset {
  return buildExperiments(
    MUST_FILES.map((file) => mapCsvFile(`${sampleDir}${file}`)),
    now,
    citations,
  );
}
