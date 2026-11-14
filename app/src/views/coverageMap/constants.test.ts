import { describe, expect, it } from 'vitest';
import { MOON_BASE_MAX_PRESSURE_BAR, MOON_BASE_MIN_O2_FRACTION } from '../../../../scripts/moon-base-zone.ts';
import {
  EARTH_AIR,
  MOON_BASE_ZONE,
  REFERENCE_ATMOSPHERES,
  SPACESUIT,
  formatPressure,
  psiToBar,
} from './constants';

describe('psiToBar', () => {
  it('converts with 1 psi = 0.0689476 bar', () => {
    expect(psiToBar(1)).toBeCloseTo(0.0689476, 7);
    expect(psiToBar(10.2)).toBeCloseTo(0.7033, 4);
    expect(psiToBar(14.7)).toBeCloseTo(1.0135, 4);
    expect(psiToBar(4.3)).toBeCloseTo(0.2965, 4);
  });
});

describe('reference atmospheres', () => {
  it('use the values of the challenge statement', () => {
    expect([MOON_BASE_ZONE.o2Percent, MOON_BASE_ZONE.pressurePsi]).toEqual([30, 10.2]);
    expect([EARTH_AIR.o2Percent, EARTH_AIR.pressurePsi]).toEqual([21, 14.7]);
    expect([SPACESUIT.o2Percent, SPACESUIT.pressurePsi]).toEqual([100, 4.3]);
  });

  it('keep the pressure in bar consistent with the pressure in psi', () => {
    for (const reference of REFERENCE_ATMOSPHERES) {
      expect(reference.pressureBar).toBeCloseTo(psiToBar(reference.pressurePsi), 10);
    }
  });

  it('draw the same Moon-base zone that the pipeline uses for its inMoonBaseZone flag', () => {
    expect(MOON_BASE_ZONE.o2Percent / 100).toBe(MOON_BASE_MIN_O2_FRACTION);
    expect(MOON_BASE_ZONE.pressureBar).toBeCloseTo(MOON_BASE_MAX_PRESSURE_BAR, 3);
  });

  it('each carry a label and a source, and the zone is called expected', () => {
    for (const reference of REFERENCE_ATMOSPHERES) {
      expect(reference.label).not.toBe('');
      expect(reference.source).toContain('challenge statement');
    }
    expect(MOON_BASE_ZONE.label).toContain('Expected');
    expect(MOON_BASE_ZONE.source).toContain('not final');
  });

  it('do not present the 21 % of Earth air as a NASA figure', () => {
    expect(EARTH_AIR.source).toContain('standard composition of air');
  });
});

describe('formatPressure', () => {
  it('shows both units', () => {
    expect(formatPressure(MOON_BASE_ZONE)).toBe('10.2 psi ≈ 0.70 bar');
    expect(formatPressure(EARTH_AIR)).toBe('14.7 psi ≈ 1.01 bar');
    expect(formatPressure(SPACESUIT)).toBe('4.3 psi ≈ 0.30 bar');
  });
});
