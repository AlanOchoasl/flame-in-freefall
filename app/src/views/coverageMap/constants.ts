// Reference atmospheres drawn on the coverage map. Values and wording come from the challenge
// statement (Recursos/Enunciado oficial - Flame in Freefall.md); the map never recomputes the
// Moon-base flag of a test, it reads `inMoonBaseZone` from experiments.json.

export const BAR_PER_PSI = 0.0689476;

export const psiToBar = (psi: number): number => psi * BAR_PER_PSI;

// Overlay tokens of the design-system change (openspec/changes/design-system).
export const OVERLAY_COLORS = {
  moonFill: '#b7e5bf',
  moonEdge: '#236436',
  earth: '#1c1e22',
  suit: '#513f91',
} as const;

export const O2_AXIS_MAX_PERCENT = 100;
export const PRESSURE_AXIS_MAX_BAR = 3.5;

export interface ReferenceAtmosphere {
  id: 'moon-base' | 'earth-air' | 'spacesuit';
  label: string;
  o2Percent: number;
  pressurePsi: number;
  pressureBar: number;
  source: string;
}

const STATEMENT = 'NASA Space Apps 2026 challenge statement';

function atmosphere(
  id: ReferenceAtmosphere['id'],
  label: string,
  o2Percent: number,
  pressurePsi: number,
  source: string,
): ReferenceAtmosphere {
  return { id, label, o2Percent, pressurePsi, pressureBar: psiToBar(pressurePsi), source };
}

/** Zone: O2 at or above `o2Percent` and pressure at or below `pressurePsi`. Expected, not final. */
export const MOON_BASE_ZONE = atmosphere(
  'moon-base',
  'Expected Moon-base atmosphere',
  30,
  10.2,
  `${STATEMENT} (expected values, not final)`,
);

/** Point: pressure from the statement; about 21 % O2 is the standard composition of air. */
export const EARTH_AIR = atmosphere(
  'earth-air',
  'Earth air at sea level',
  21,
  14.7,
  `${STATEMENT} (pressure); about 21 % O2 is the standard composition of air`,
);

export const SPACESUIT = atmosphere('spacesuit', 'Spacesuit atmosphere', 100, 4.3, STATEMENT);

export const REFERENCE_ATMOSPHERES = [MOON_BASE_ZONE, EARTH_AIR, SPACESUIT];

/** e.g. "10.2 psi ≈ 0.70 bar" */
export function formatPressure(atmosphereValue: ReferenceAtmosphere): string {
  return `${atmosphereValue.pressurePsi} psi ≈ ${atmosphereValue.pressureBar.toFixed(2)} bar`;
}
