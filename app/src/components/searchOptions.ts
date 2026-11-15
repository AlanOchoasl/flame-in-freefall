// Pure helpers behind the searchable menu (SearchSelect): which options match, and where the arrow keys go.

export interface SearchOption {
  value: string;
  /** What the menu shows once the option is chosen, e.g. "PSI-25 · BASS-II". */
  label: string;
  /** A second, smaller line in the list. */
  detail?: string;
  /** The text the search looks in (accession, acronym, title). */
  search: string;
}

/** Every word typed must appear somewhere in the option's text, in any order; case does not matter. */
export function filterOptions(options: SearchOption[], query: string): SearchOption[] {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return options;
  return options.filter((option) => {
    const text = option.search.toLowerCase();
    return words.every((word) => text.includes(word));
  });
}

/** The highlighted row after an arrow key; it wraps around at both ends. */
export function moveActive(current: number, count: number, direction: 'down' | 'up'): number {
  if (count === 0) return 0;
  return direction === 'down' ? (current + 1) % count : (current - 1 + count) % count;
}
