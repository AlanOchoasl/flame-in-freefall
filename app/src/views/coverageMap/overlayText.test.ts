import { describe, expect, it } from 'vitest';
import { EARTH_AIR, MOON_BASE_ZONE, SPACESUIT } from './constants';
import { OVERLAY_DESCRIPTIONS, describeReference } from './overlayText';

describe('describeReference', () => {
  it('describes the Moon-base zone as expected, with both pressure units and its source', () => {
    expect(describeReference(MOON_BASE_ZONE)).toEqual({
      title: 'Expected Moon-base atmosphere',
      values: 'O2 ≥ 30 %, pressure ≤ 10.2 psi ≈ 0.70 bar',
      source: 'Source: NASA Space Apps 2026 challenge statement (expected values, not final).',
    });
  });

  it('describes Earth air with "about" 21 % O2, which the statement does not give', () => {
    const earth = describeReference(EARTH_AIR);
    expect(earth.values).toBe('about 21 % O2, 14.7 psi ≈ 1.01 bar');
    expect(earth.source).toContain('standard composition of air');
  });

  it('describes the spacesuit atmosphere', () => {
    expect(describeReference(SPACESUIT)).toMatchObject({
      title: 'Spacesuit atmosphere',
      values: '100 % O2, 4.3 psi ≈ 0.30 bar',
    });
  });
});

describe('OVERLAY_DESCRIPTIONS', () => {
  it('lists the three references drawn on the map, each with a source', () => {
    expect(OVERLAY_DESCRIPTIONS.map((d) => d.title)).toEqual([
      'Expected Moon-base atmosphere',
      'Earth air at sea level',
      'Spacesuit atmosphere',
    ]);
    expect(OVERLAY_DESCRIPTIONS.every((d) => d.source.startsWith('Source: '))).toBe(true);
  });
});
