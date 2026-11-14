import { describe, expect, it } from 'vitest';
import { documentTitle } from './documentTitle';

describe('documentTitle', () => {
  it('names the screen and the app', () => {
    expect(documentTitle('Compare')).toBe('Compare · Flame in Freefall');
  });

  it('is distinct for every screen', () => {
    expect(documentTitle('Ranking')).not.toBe(documentTitle('About'));
  });
});
