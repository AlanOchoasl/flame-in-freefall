import { cleanText } from './normalize.ts';

// PSI spells the research sub-area in 13 different ways (observed 2026-11-14). Variants that differ
// only by plural are mapped explicitly; no general stemming.
const ALIASES: Record<string, string> = {
  'flames of gaseous fuel': 'flames of gaseous fuels',
  droplets: 'droplet',
};

const KNOWN = new Set([
  'spacecraft fire safety',
  'fire safety',
  'spacecraft fire, smoke distribution',
  'flames of gaseous fuels',
  'laminar flames',
  'gaseous',
  'droplet',
  'surface combustion',
  'smoke aerosol, combustion simulation',
  'microstructural characterization, terrestrial vs microgravity effects, solder joints',
]);

export interface SubArea {
  raw: string | null;
  normalized: string | null;
  /** false when the value is not in the observed list: the build reports it for a person to look at. */
  known: boolean;
}

export function normalizeSubArea(value: unknown): SubArea {
  const raw = cleanText(value);
  if (raw === null) return { raw: null, normalized: null, known: true };
  const lower = raw.toLowerCase();
  const normalized = ALIASES[lower] ?? lower;
  return { raw, normalized, known: KNOWN.has(normalized) };
}
