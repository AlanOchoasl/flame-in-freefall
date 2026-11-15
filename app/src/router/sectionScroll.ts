// The console routes #/ranking, #/compare and #/map share one page; each names the section it scrolls to.
// "ranking" is the top of the page, but its panel is the one that gets highlighted.
const SCROLL_TARGET_IDS: Record<string, string> = { compare: 'comparison', map: 'coverage' };
const PANEL_IDS: Record<string, string> = { ranking: 'ranking', compare: 'comparison', map: 'coverage' };

export const HIGHLIGHT_CLASS = 'is-highlighted';
export const HIGHLIGHT_MS = 2000;

const prefersReducedMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const timers = new WeakMap<object, ReturnType<typeof setTimeout>>();

/** Shows the highlight ring on an element for two seconds; highlighting it again restarts the two seconds. */
export function highlightElement(element: Pick<Element, 'classList'>): void {
  clearTimeout(timers.get(element));
  element.classList.add(HIGHLIGHT_CLASS);
  timers.set(
    element,
    setTimeout(() => element.classList.remove(HIGHLIGHT_CLASS), HIGHLIGHT_MS),
  );
}

export const panelIdOf = (section: string | undefined): string | null => (section ? (PANEL_IDS[section] ?? null) : null);

/**
 * Smoothly scrolls to a console section (instantly when the user prefers reduced motion) and, unless
 * `highlight` is false, rings its panel for two seconds so the eye finds where the page went.
 */
export function scrollToSection(section: string | undefined, { highlight = true }: { highlight?: boolean } = {}): void {
  const behavior: ScrollBehavior = prefersReducedMotion() ? 'auto' : 'smooth';
  const target = section ? document.getElementById(SCROLL_TARGET_IDS[section] ?? '') : null;
  if (target) target.scrollIntoView({ behavior, block: 'start' });
  else window.scrollTo({ top: 0, behavior });
  const panelId = panelIdOf(section);
  const panel = highlight && panelId ? document.getElementById(panelId) : null;
  if (panel) highlightElement(panel);
}
