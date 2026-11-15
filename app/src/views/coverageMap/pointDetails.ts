import type { ExperimentRecord } from '../../data/types';
import { MOON_BASE_ZONE, formatPressure as formatReferencePressure } from './constants';

// What the dialog of one circle says, as plain functions so it can be tested against the committed data.

export const formatPressure = (record: ExperimentRecord): string =>
  record.pressureBar === null
    ? 'Not available'
    : `${record.pressureIsApproximate ? '≈ ' : ''}${Math.round(record.pressureBar * 1000) / 1000} bar${record.pressureIsApproximate ? ' (approximate)' : ''}`;

export const formatO2 = (record: ExperimentRecord): string => (record.o2Fraction === null ? 'Not available' : `${Math.round(record.o2Fraction * 1000) / 10} %`);

export interface ZoneCheck {
  inside: boolean;
  /** One sentence: which side of the zone the circle is on, and why. */
  text: string;
}

/**
 * Whether the circle lies inside the expected Moon-base zone, with the numbers behind it. The verdict is the
 * `inMoonBaseZone` flag of the records (never recomputed); the comparison only explains it.
 */
export function zoneCheck(records: ExperimentRecord[]): ZoneCheck {
  const inside = records.some((record) => record.inMoonBaseZone);
  const [first] = records;
  if (!first || first.o2Fraction === null || first.pressureBar === null) return { inside, text: inside ? 'Inside the expected Moon-base zone.' : 'Outside the expected Moon-base zone.' };
  const o2Ok = first.o2Fraction * 100 >= MOON_BASE_ZONE.o2Percent;
  const pressureOk = first.pressureBar <= MOON_BASE_ZONE.pressureBar;
  const o2 = `oxygen ${formatO2(first)} is ${o2Ok ? 'at least' : 'below'} ${MOON_BASE_ZONE.o2Percent} %`;
  const pressure = `pressure ${Math.round(first.pressureBar * 1000) / 1000} bar is ${pressureOk ? 'at most' : 'above'} ${formatReferencePressure(MOON_BASE_ZONE)}`;
  if (inside) return { inside, text: `Inside the expected Moon-base zone: ${o2} and ${pressure}.` };
  const reasons = [o2Ok ? null : o2, pressureOk ? null : pressure].filter((reason): reason is string => reason !== null);
  return { inside, text: `Outside the expected Moon-base zone: ${reasons.length > 0 ? reasons.join(' and ') : 'it lies beyond the zone'}.` };
}

/** "2,700–2,720 K", or one value when they agree; null when no test has a temperature. */
export function flameTemperature(records: ExperimentRecord[]): string | null {
  const values = records.map((record) => record.tadK).filter((value): value is number => value !== null && Number.isFinite(value));
  if (values.length === 0) return null;
  const format = (value: number): string => Math.round(value).toLocaleString('en-US');
  const low = Math.min(...values);
  const high = Math.max(...values);
  return format(low) === format(high) ? `${format(low)} K` : `${format(low)}–${format(high)} K`;
}

/** The distinct values of a field across the tests, sorted, for "Fuel: butane, ethane". */
export function distinct(records: ExperimentRecord[], pick: (record: ExperimentRecord) => string | null): string[] {
  return [...new Set(records.map(pick).filter((value): value is string => value !== null))].sort();
}
