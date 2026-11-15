// The console routes #/ranking, #/compare and #/map share one page; each names the section it scrolls to.
// "ranking" is the top of the page.
const SECTION_IDS: Record<string, string> = { compare: 'comparison', map: 'coverage' };

const prefersReducedMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Smoothly scrolls to a console section (instantly when the user prefers reduced motion). */
export function scrollToSection(section: string | undefined): void {
  const behavior: ScrollBehavior = prefersReducedMotion() ? 'auto' : 'smooth';
  const target = section ? document.getElementById(SECTION_IDS[section] ?? '') : null;
  if (target) target.scrollIntoView({ behavior, block: 'start' });
  else window.scrollTo({ top: 0, behavior });
}
