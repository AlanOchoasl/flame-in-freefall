// Usage: node scripts/catalog/cli.ts [--strict]
// Reads only local files (no network). Writes data/processed/catalog.json.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { accessionsWithUnreviewed, buildCatalog } from './build.ts';
import type { CurationFile, SourceCatalog, Vocabularies } from './types.ts';

const root = fileURLToPath(new URL('../../', import.meta.url));
const path = (relative: string): string => `${root}${relative}`;
const readJson = <T>(relative: string): T => JSON.parse(readFileSync(path(relative), 'utf8')) as T;

const strict = process.argv.includes('--strict');

try {
  const { dataset, warnings } = buildCatalog({
    source: readJson<SourceCatalog>('data/sample/psi-catalog/investigations.json'),
    vocabularies: readJson<Vocabularies>('data/curation/vocabularies.json'),
    curation: readJson<CurationFile>('data/curation/investigations.curation.json'),
    tableFiles: readdirSync(path('data/sample/psi')),
    now: new Date(),
  });

  for (const warning of warnings) console.warn(`warning: ${warning}`);
  writeFileSync(path('data/processed/catalog.json'), `${JSON.stringify(dataset, null, 2)}\n`);
  const withoutDoi = dataset.records.filter((r) => r.doi === null).length;
  console.log(`Wrote data/processed/catalog.json: ${dataset.recordCount} records, ${dataset.unreviewedCount} unreviewed curated values, ${withoutDoi} without DOI.`);

  const pending = accessionsWithUnreviewed(dataset);
  if (strict && pending.length > 0) {
    console.error(`Strict mode: ${pending.length} investigation(s) have unreviewed values:\n  ${pending.join(', ')}`);
    process.exit(1);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
