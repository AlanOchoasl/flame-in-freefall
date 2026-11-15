import { describe, expect, it } from 'vitest';
import { addToSelection, chooseInSlot, LIMIT_MESSAGE, parseSelection, slotsFromIds } from './selection';

const known = ['PSI-1', 'PSI-2', 'PSI-3', 'PSI-4'];
const params = (ids: string) => new URLSearchParams({ ids });

describe('parseSelection', () => {
  it('restores the ids from the address and ignores unknown or repeated ones', () => {
    expect(parseSelection(params('PSI-1,PSI-9,PSI-1,PSI-2'), known)).toEqual(['PSI-1', 'PSI-2']);
  });
  it('keeps at most three', () => {
    expect(parseSelection(params('PSI-1,PSI-2,PSI-3,PSI-4'), known)).toEqual(['PSI-1', 'PSI-2', 'PSI-3']);
  });
  it('is empty without ids', () => {
    expect(parseSelection(new URLSearchParams(), known)).toEqual([]);
  });
});

describe('selection changes', () => {
  it('does not add a fourth and explains the limit', () => {
    expect(addToSelection(['PSI-1', 'PSI-2', 'PSI-3'], 'PSI-4')).toEqual({ ids: ['PSI-1', 'PSI-2', 'PSI-3'], message: LIMIT_MESSAGE });
  });
  it('adds one more', () => {
    expect(addToSelection(['PSI-1'], 'PSI-2').ids).toEqual(['PSI-1', 'PSI-2']);
  });
});

describe('menus', () => {
  it('fills the menus from the first and leaves the rest empty', () => {
    expect(slotsFromIds(['PSI-1', 'PSI-2'])).toEqual(['PSI-1', 'PSI-2', '']);
    expect(slotsFromIds([])).toEqual(['', '', '']);
  });
  it('sets a menu and keeps the others', () => {
    expect(chooseInSlot([], 0, 'PSI-1')).toEqual(['PSI-1']);
    expect(chooseInSlot(['PSI-1'], 1, 'PSI-2')).toEqual(['PSI-1', 'PSI-2']);
    expect(chooseInSlot(['PSI-1', 'PSI-2'], 2, 'PSI-3')).toEqual(['PSI-1', 'PSI-2', 'PSI-3']);
  });
  it('replaces the choice of a menu', () => {
    expect(chooseInSlot(['PSI-1', 'PSI-2'], 1, 'PSI-4')).toEqual(['PSI-1', 'PSI-4']);
  });
  it('closes the gap when a menu is emptied', () => {
    expect(chooseInSlot(['PSI-1', 'PSI-2', 'PSI-3'], 0, '')).toEqual(['PSI-2', 'PSI-3']);
    expect(chooseInSlot(['PSI-1', 'PSI-2'], 1, '')).toEqual(['PSI-1']);
  });
  it('never repeats an investigation', () => {
    expect(chooseInSlot(['PSI-1', 'PSI-2'], 1, 'PSI-1')).toEqual(['PSI-1']);
  });
});
