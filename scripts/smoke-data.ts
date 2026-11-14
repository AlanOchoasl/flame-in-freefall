// Usage: npm run smoke:data
// Runs the experiments pipeline twice with the network blocked and checks that:
//  - it completes offline, on the cached samples only;
//  - both runs give the same output, apart from generatedAt;
//  - the output has the expected counts and equals the committed file.
import { deepStrictEqual, strictEqual } from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import net from 'node:net';
import { fileURLToPath } from 'node:url';
import type { ExperimentsDataset } from './build-experiments.ts';
import { runPipeline } from './pipeline.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const EXPECTED = { records: 453, plottable: 442, inMoonBaseZone: 66 };

function blockNetwork(): void {
  const refuse = (): never => {
    throw new Error('Network access attempted: the pipeline must run offline.');
  };
  globalThis.fetch = refuse;
  net.Socket.prototype.connect = refuse;
}

const withoutDate = (dataset: ExperimentsDataset) => ({ ...dataset, generatedAt: '' });

try {
  blockNetwork();
  const sampleDir = `${root}data/sample/psi/`;
  const first = runPipeline(sampleDir, new Date('2026-01-01T00:00:00Z'));
  const second = runPipeline(sampleDir, new Date('2030-01-01T00:00:00Z'));

  deepStrictEqual(withoutDate(first), withoutDate(second), 'two runs gave different output');
  strictEqual(first.records.length, EXPECTED.records, 'record count');
  strictEqual(first.plottableCount, EXPECTED.plottable, 'plottable count');
  strictEqual(first.records.filter((r) => r.inMoonBaseZone).length, EXPECTED.inMoonBaseZone, 'Moon-base zone count');

  const committed = JSON.parse(readFileSync(`${root}data/processed/experiments.json`, 'utf8'));
  deepStrictEqual(committed, JSON.parse(JSON.stringify({ ...first, generatedAt: committed.generatedAt })), 'committed experiments.json is out of date: run npm run build:data');

  console.log(`Smoke check passed offline: ${EXPECTED.records} records, ${EXPECTED.plottable} plottable, ${EXPECTED.inMoonBaseZone} in the Moon-base zone, two runs identical.`);
} catch (error) {
  console.error(`Smoke check FAILED: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
}
