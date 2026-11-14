import { EARTH_AIR, MOON_BASE_ZONE, SPACESUIT, formatPressure, type ReferenceAtmosphere } from './constants';

export interface OverlayDescription {
  title: string;
  /** The conditions, in both pressure units. */
  values: string;
  source: string;
}

/** The text listed under the chart for each reference drawn on it, built from the reference values. */
export function describeReference(reference: ReferenceAtmosphere): OverlayDescription {
  const pressure = formatPressure(reference);
  const values =
    reference.id === 'moon-base'
      ? `O2 ≥ ${reference.o2Percent} %, pressure ≤ ${pressure}`
      : reference.id === 'earth-air'
        ? `about ${reference.o2Percent} % O2, ${pressure}`
        : `${reference.o2Percent} % O2, ${pressure}`;
  return { title: reference.label, values, source: `Source: ${reference.source}.` };
}

export const OVERLAY_DESCRIPTIONS = [MOON_BASE_ZONE, EARTH_AIR, SPACESUIT].map(describeReference);
