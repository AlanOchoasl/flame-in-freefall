export type ConsoleSectionId = 'ranking' | 'comparison' | 'coverage';

export interface Band {
  top: number;
  bottom: number;
}

// The navigation items of the console routes, keyed by the section they scroll to.
export const SECTION_PATHS: Record<ConsoleSectionId, string> = {
  ranking: '/ranking',
  comparison: '/compare',
  coverage: '/map',
};

export const SECTION_CHANGE = 'console-section-change';

/**
 * Which section the reader is looking at: the one whose band holds the reading line. The map and the
 * comparison share the main column, so they are checked first; anywhere else, including the top of the
 * page and the ranking column, it is the ranking.
 */
export function visibleSection(bands: Partial<Record<ConsoleSectionId, Band>>, line: number): ConsoleSectionId {
  for (const id of ['coverage', 'comparison'] as const) {
    const band = bands[id];
    if (band && band.top <= line && line < band.bottom) return id;
  }
  return 'ranking';
}
