import { buildExperiments, type ExperimentsDataset } from './build-experiments.ts';
import { mapCsvFile } from './map-file.ts';

// Must set. PSI-10 normal flames (Nice-to-have, task 3.3) is not included yet.
export const MUST_FILES = [
  'PSI-159_Experimental_table_CFI-G_Normal_Flames.csv',
  'PSI-159_Experimental_table_CFI-G_Inverse_Flames.csv',
  'PSI-10_Experimental_table_Flame_Design_Inverse_Flame.csv',
];

export function runPipeline(sampleDir: string, now: Date): ExperimentsDataset {
  return buildExperiments(
    MUST_FILES.map((file) => mapCsvFile(`${sampleDir}${file}`)),
    now,
  );
}
