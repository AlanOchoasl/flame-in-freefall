export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'flame-theme';

// The visitor's choice survives a reload. Storage can be blocked (private window), so every access is guarded.
export function readStoredTheme(): Theme | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

export function storeTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // The choice then lasts for this visit only.
  }
}
