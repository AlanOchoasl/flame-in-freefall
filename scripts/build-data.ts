// Usage: npm run build:data
// Reads only local files (no network). Writes data/processed/experiments.json.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildExperiments } from './build-experiments.ts';
import { mapCsvFile } from './map-file.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const SAMPLE_DIR = `${root}data/sample/psi/`;
const OUTPUT = `${root}data/processed/experiments.json`;

// Must set. PSI-10 normal flames (Nice-to-have, task 3.3) is not included yet.
const MUST_FILES = [
  'PSI-159_Experimental_table_CFI-G_Normal_Flames.csv',
  'PSI-159_Experimental_table_CFI-G_Inverse_Flames.csv',
  'PSI-10_Experimental_table_Flame_Design_Inverse_Flame.csv',
];

try {
  const dataset = buildExperiments(
    MUST_FILES.map((file) => mapCsvFile(`${SAMPLE_DIR}${file}`)),
    new Date(),
  );
  writeFileSync(OUTPUT, `${JSON.stringify(dataset, null, 2)}\n`);
  const inZone = dataset.records.filter((record) => record.inMoonBaseZone).length;
  console.log(
    `Wrote data/processed/experiments.json: ${dataset.records.length} records, ${dataset.plottableCount} plottable, ${inZone} in the Moon-base zone.`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
