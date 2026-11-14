import { readFileSync } from 'node:fs';
import { buildExperiments, type ExperimentsDataset } from './build-experiments.ts';
import { parseCitations, type DatasetCitations } from './dataset-citations.ts';
import { mapCsvFile } from './map-file.ts';

// The tables that go into experiments.json: the Must set plus PSI-10 normal flames (Nice, task 3.3).
// A registered mapper alone does not include its file; it has to be listed here too.
export const MUST_FILES = [
  'PSI-159_Experimental_table_CFI-G_Normal_Flames.csv',
  'PSI-159_Experimental_table_CFI-G_Inverse_Flames.csv',
  'PSI-10_Experimental_table_Flame_Design_Inverse_Flame.csv',
  'PSI-10_Experimental_table_Flame_Design_Normal_Flame.csv',
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
