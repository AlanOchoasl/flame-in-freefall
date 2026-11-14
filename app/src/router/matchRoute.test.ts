import { describe, expect, it } from 'vitest';
import { matchRoute } from './matchRoute';

const views = [{ path: '/ranking' }, { path: '/compare' }, { path: '/investigation/:accession' }];

describe('matchRoute', () => {
  it('matches a plain path', () => {
    expect(matchRoute('#/ranking', views)?.view).toBe(views[0]);
  });

  it('extracts a path parameter', () => {
    expect(matchRoute('#/investigation/PSI-159', views)?.params).toEqual({ accession: 'PSI-159' });
  });

  it('reads the query string without affecting the match', () => {
    const match = matchRoute('#/compare?ids=PSI-159,PSI-25', views);
    expect(match?.view).toBe(views[1]);
    expect(match?.query.get('ids')).toBe('PSI-159,PSI-25');
  });

  it('returns null for an unknown path', () => {
    expect(matchRoute('#/nothing-here', views)).toBeNull();
  });

  it('returns null when a parameter is missing', () => {
    expect(matchRoute('#/investigation/', views)).toBeNull();
  });
});
