// Usage: npm run build:data
// Reads only local files (no network). Writes data/processed/experiments.json.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { runPipeline } from './pipeline.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const OUTPUT = `${root}data/processed/experiments.json`;

try {
  const dataset = runPipeline(`${root}data/sample/psi/`, new Date());
  writeFileSync(OUTPUT, `${JSON.stringify(dataset, null, 2)}\n`);
  const inZone = dataset.records.filter((record) => record.inMoonBaseZone).length;
  console.log(
    `Wrote data/processed/experiments.json: ${dataset.records.length} records, ${dataset.plottableCount} plottable, ${inZone} in the Moon-base zone.`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
