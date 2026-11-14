// Copies the committed data/processed/*.json files into app/public/data/ so the app can fetch them.
import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(appDir, '..', 'data', 'processed');
const target = join(appDir, 'public', 'data');

if (!existsSync(source)) {
  console.error(`Nothing to sync: ${source} does not exist yet.`);
  process.exit(1);
}

mkdirSync(target, { recursive: true });
const files = readdirSync(source).filter((name) => name.endsWith('.json'));
for (const name of files) cpSync(join(source, name), join(target, name));
console.log(`Synced ${files.length} file(s) to ${target}`);
