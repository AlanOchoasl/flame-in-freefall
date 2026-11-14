import { describe, expect, it } from 'vitest';
import {
  carryExplorerState,
  cleanExplorerState,
  explorerHash,
  mergeExplorerState,
  NO_EXPLORER_STATE,
  parseExplorerQuery,
  patchHash,
  serializeExplorerQuery,
} from './explorerQuery';

const parse = (search: string) => parseExplorerQuery(new URLSearchParams(search));

describe('explorerQuery', () => {
  it('round-trips every choice', () => {
    const state = {
      profile: 'detection',
      selected: 'PSI-47',
      ids: ['PSI-47', 'PSI-25'],
      investigation: 'PSI-159',
      flame: 'normal',
      fuel: 'propane',
      outcome: 'yes',
    };
    expect(parse(serializeExplorerQuery(state))).toEqual(state);
  });

  it('leaves defaults out of the address', () => {
    expect(serializeExplorerQuery(NO_EXPLORER_STATE)).toBe('');
    expect(explorerHash('/ranking', NO_EXPLORER_STATE)).toBe('#/ranking');
    expect(explorerHash('/ranking', { ...NO_EXPLORER_STATE, profile: 'detection' })).toBe('#/ranking?profile=detection');
  });

  it('writes the parameters in a stable order and keeps the comparison commas readable', () => {
    const state = { ...NO_EXPLORER_STATE, fuel: 'propane', ids: ['PSI-47', 'PSI-25'], profile: 'suppression' };
    expect(serializeExplorerQuery(state)).toBe('profile=suppression&ids=PSI-47,PSI-25&fuel=propane');
  });

  it('keeps at most 3 comparison ids and drops repeats and blanks', () => {
    expect(parse('ids=A,B,C,D,E').ids).toEqual(['A', 'B', 'C']);
    expect(parse('ids=A, A ,,B').ids).toEqual(['A', 'B']);
  });

  it('still reads the older addresses', () => {
    expect(parse('ids=PSI-159,PSI-25').ids).toEqual(['PSI-159', 'PSI-25']);
    expect(parse('investigation=PSI-159').investigation).toBe('PSI-159');
  });

  it('treats empty values as not set', () => {
    expect(parse('profile=&selected=%20')).toEqual(NO_EXPLORER_STATE);
  });

  it('merges a patch without touching the other choices', () => {
    const merged = mergeExplorerState({ ...NO_EXPLORER_STATE, profile: 'detection' }, { ids: ['PSI-47'] });
    expect(merged.profile).toBe('detection');
    expect(merged.ids).toEqual(['PSI-47']);
  });

  it('carries only the explorer choices in a link', () => {
    const query = new URLSearchParams('profile=detection&utm=spam&ids=PSI-47&junk');
    expect(carryExplorerState('/about', query)).toBe('#/about?profile=detection&ids=PSI-47');
    expect(carryExplorerState('/about', new URLSearchParams('utm=spam'))).toBe('#/about');
  });

  it('patches the current hash and keeps the route', () => {
    expect(patchHash('#/map?profile=detection', { fuel: 'propane' })).toBe('#/map?profile=detection&fuel=propane');
    expect(patchHash('#/map?profile=detection', { profile: null })).toBe('#/map');
    expect(patchHash('', { profile: 'detection' })).toBe('#/?profile=detection');
  });
});

describe('cleanExplorerState', () => {
  const known = {
    profiles: ['crew-cabin', 'detection'],
    accessions: ['PSI-159', 'PSI-47', 'PSI-25'],
    accessionsWithTests: ['PSI-159'],
    flames: ['normal', 'inverse'],
    fuels: ['propane'],
    outcomes: ['yes', 'no'],
  };

  it('keeps values the data knows', () => {
    const state = { ...NO_EXPLORER_STATE, profile: 'detection', selected: 'PSI-47', ids: ['PSI-47'], fuel: 'propane' };
    expect(cleanExplorerState(state, known)).toEqual(state);
  });

  it('drops an unknown profile', () => {
    expect(cleanExplorerState({ ...NO_EXPLORER_STATE, profile: 'nope' }, known).profile).toBeNull();
  });

  it('drops an unknown accession from selected and from the comparison', () => {
    const state = { ...NO_EXPLORER_STATE, selected: 'PSI-9999', ids: ['PSI-9999', 'PSI-47'] };
    const cleaned = cleanExplorerState(state, known);
    expect(cleaned.selected).toBeNull();
    expect(cleaned.ids).toEqual(['PSI-47']);
  });

  it('drops a fuel and a flame type that no test has', () => {
    const cleaned = cleanExplorerState({ ...NO_EXPLORER_STATE, fuel: 'unobtainium', flame: 'sideways' }, known);
    expect(cleaned.fuel).toBeNull();
    expect(cleaned.flame).toBeNull();
  });

  it('accepts the map investigation filter only for investigations with test rows', () => {
    expect(cleanExplorerState({ ...NO_EXPLORER_STATE, investigation: 'PSI-47' }, known).investigation).toBeNull();
    expect(cleanExplorerState({ ...NO_EXPLORER_STATE, investigation: 'PSI-159' }, known).investigation).toBe('PSI-159');
  });

  it('caps a comparison of 5 known ids at 3', () => {
    const many = { ...known, accessions: ['A', 'B', 'C', 'D', 'E'] };
    const cleaned = cleanExplorerState({ ...NO_EXPLORER_STATE, ids: ['A', 'B', 'C', 'D', 'E'] }, many);
    expect(cleaned.ids).toEqual(['A', 'B', 'C']);
  });

  it('does not check a choice whose known list is left out', () => {
    expect(cleanExplorerState({ ...NO_EXPLORER_STATE, profile: 'anything' }, {}).profile).toBe('anything');
  });
});
