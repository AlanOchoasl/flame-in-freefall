import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { ExperimentRecord, ExperimentsFile } from '../../data/types';
import { distinct, flameTemperature, zoneCheck } from './pointDetails';

const record = (overrides: Partial<ExperimentRecord> = {}): ExperimentRecord =>
  ({ id: 'a', accession: 'PSI-159', flameType: 'normal', fuel: { species: 'ethane', raw: 'ethane', inferred: false }, o2Fraction: 0.4, pressureBar: 0.5, pressureIsApproximate: true, tadK: 2700, outcome: 'yes', isPlottable: true, inMoonBaseZone: true, ...overrides }) as ExperimentRecord;

describe('zoneCheck', () => {
  it('explains a circle inside the zone with both numbers', () => {
    const check = zoneCheck([record()]);
    expect(check.inside).toBe(true);
    expect(check.text).toBe('Inside the expected Moon-base zone: oxygen 40 % is at least 30 % and pressure 0.5 bar is at most 10.2 psi ≈ 0.70 bar.');
  });

  it('names what is wrong outside the zone: the pressure, the oxygen or both', () => {
    expect(zoneCheck([record({ o2Fraction: 0.85, pressureBar: 2.207, inMoonBaseZone: false })]).text).toBe(
      'Outside the expected Moon-base zone: pressure 2.207 bar is above 10.2 psi ≈ 0.70 bar.',
    );
    expect(zoneCheck([record({ o2Fraction: 0.2, pressureBar: 0.5, inMoonBaseZone: false })]).text).toBe('Outside the expected Moon-base zone: oxygen 20 % is below 30 %.');
    expect(zoneCheck([record({ o2Fraction: 0.2, pressureBar: 1, inMoonBaseZone: false })]).text).toContain(' and pressure 1 bar is above');
  });

  it('agrees with the inMoonBaseZone flag of every committed test', () => {
    const file = JSON.parse(readFileSync(new URL('../../../../data/processed/experiments.json', import.meta.url), 'utf8')) as ExperimentsFile;
    for (const test of file.records.filter((item) => item.isPlottable)) {
      const check = zoneCheck([test]);
      expect(check.inside).toBe(test.inMoonBaseZone);
      expect(check.text.startsWith(test.inMoonBaseZone ? 'Inside' : 'Outside')).toBe(true);
      if (!test.inMoonBaseZone) expect(check.text).not.toContain('beyond the zone');
    }
  });
});

describe('flameTemperature', () => {
  it('gives a range, one value when they agree, and null without a temperature', () => {
    expect(flameTemperature([record({ tadK: 2719.3 }), record({ tadK: 2703.6 })])).toBe('2,704–2,719 K');
    expect(flameTemperature([record({ tadK: 2700.2 }), record({ tadK: 2699.8 })])).toBe('2,700 K');
    expect(flameTemperature([record({ tadK: null })])).toBeNull();
  });
});

describe('distinct', () => {
  it('lists each value once, sorted', () => {
    expect(distinct([record(), record({ fuel: { species: 'butane', raw: 'butane', inferred: false } }), record()], (item) => item.fuel.species)).toEqual(['butane', 'ethane']);
  });
});
