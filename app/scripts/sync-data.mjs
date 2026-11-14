// Copies the committed data files into app/public/data/ so the app can fetch them:
// data/processed/*.json (catalog, experiments, summaries) and data/ranking/*.json (ranking profiles).
import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const sources = [join(appDir, '..', 'data', 'processed'), join(appDir, '..', 'data', 'ranking')];
const target = join(appDir, 'public', 'data');

const missing = sources.filter((source) => !existsSync(source));
if (missing.length > 0) {
  console.error(`Nothing to sync: ${missing.join(', ')} does not exist yet.`);
  process.exit(1);
}

mkdirSync(target, { recursive: true });
let copied = 0;
for (const source of sources) {
  const files = readdirSync(source).filter((name) => name.endsWith('.json'));
  for (const name of files) cpSync(join(source, name), join(target, name));
  copied += files.length;
}
console.log(`Synced ${copied} file(s) to ${target}`);
