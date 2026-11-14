import type { ExperimentRecord, FlaggedRecord } from './experiment-record.ts';
import { MOON_BASE_MAX_PRESSURE_BAR, MOON_BASE_MIN_O2_FRACTION } from './moon-base-zone.ts';

export function addFlags(record: ExperimentRecord): FlaggedRecord {
  const { o2Fraction, pressureBar } = record;
  if (o2Fraction === null || pressureBar === null) {
    return { ...record, isPlottable: false, inMoonBaseZone: false };
  }
  const inMoonBaseZone =
    o2Fraction >= MOON_BASE_MIN_O2_FRACTION && pressureBar <= MOON_BASE_MAX_PRESSURE_BAR;
  return { ...record, isPlottable: true, inMoonBaseZone };
}
