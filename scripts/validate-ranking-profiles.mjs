import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { validateRankingProfiles } from '../app/src/lib/ranking.ts';

const profilesPath = fileURLToPath(new URL('../data/ranking/profiles.json', import.meta.url));
const profiles = JSON.parse(readFileSync(profilesPath, 'utf8'));
validateRankingProfiles(profiles);
console.log(`Validated ${profiles.profiles.length} ranking profiles.`);
