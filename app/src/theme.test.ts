import { afterEach, describe, expect, it, vi } from 'vitest';
import { readStoredTheme, storeTheme } from './theme';

const stubStorage = (storage: Partial<Storage>) => vi.stubGlobal('window', { localStorage: storage });

afterEach(() => vi.unstubAllGlobals());

describe('stored theme', () => {
  it('returns what was stored', () => {
    stubStorage({ getItem: () => 'light' });
    expect(readStoredTheme()).toBe('light');
  });

  it('ignores a value that is not a theme', () => {
    stubStorage({ getItem: () => 'purple' });
    expect(readStoredTheme()).toBeNull();
  });

  it('returns null when storage throws', () => {
    stubStorage({
      getItem: () => {
        throw new Error('blocked');
      },
    });
    expect(readStoredTheme()).toBeNull();
  });

  it('stores the choice and survives blocked storage', () => {
    const setItem = vi.fn();
    stubStorage({ setItem });
    storeTheme('dark');
    expect(setItem).toHaveBeenCalledWith('flame-theme', 'dark');
    stubStorage({
      setItem: () => {
        throw new Error('blocked');
      },
    });
    expect(() => storeTheme('light')).not.toThrow();
  });
});
