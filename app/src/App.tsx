import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { DataSourceNote } from './components/DataSourceNote';
import { AmbientGlow } from './components/AmbientGlow';
import { carryExplorerState } from './router/explorerQuery';
import { SECTION_CHANGE, SECTION_PATHS, type ConsoleSectionId } from './router/visibleSection';
import { readStoredTheme, storeTheme, type Theme } from './theme';
import { useOfflineReady } from './offline';
import { matchRoute } from './router/matchRoute';
import { scrollToSection } from './router/sectionScroll';
import { useHashLocation } from './router/useHashLocation';
import { useRouteChrome } from './router/useRouteChrome';
import { views } from './views';
import { NotFound } from './views/placeholders';

export function App() {
  const hash = useHashLocation();
  const offlineReady = useOfflineReady();
  const match = matchRoute(hash, views);
  const currentPath = match?.view.path;
  // Links in the header keep the explorer choices of the current address.
  const query = match?.query ?? new URLSearchParams();
  const mainRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme | null>(readStoredTheme);
  // The console routes are sections of one page: the menu follows the one being read.
  const [readingPath, setReadingPath] = useState<string | null>(null);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() =>
    window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark',
  );

  useEffect(() => {
    const preference = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = () => setSystemTheme(preference.matches ? 'light' : 'dark');
    preference.addEventListener('change', onChange);
    return () => preference.removeEventListener('change', onChange);
  }, []);

  const chooseTheme = (choice: Theme) => {
    setTheme(choice);
    storeTheme(choice);
  };

  useEffect(() => {
    const onSection = (event: Event) => setReadingPath(SECTION_PATHS[(event as CustomEvent<ConsoleSectionId>).detail]);
    window.addEventListener(SECTION_CHANGE, onSection);
    return () => window.removeEventListener(SECTION_CHANGE, onSection);
  }, []);

  useEffect(() => {
    if (theme) document.documentElement.dataset.theme = theme;
    else delete document.documentElement.dataset.theme;
  }, [theme]);

  // The route is the hash without its parameters: a change of profile, filter or comparison does not
  // count as a new screen, so it must not close the menu or move focus.
  const route = hash.split('?')[0];

  // Any route change closes the menu, including the browser's Back button.
  useEffect(() => setMenuOpen(false), [route]);

  // A new route starts from its own section until the page is scrolled again.
  useEffect(() => setReadingPath(null), [route]);

  const closeMenuOnEscape = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || !menuOpen) return;
    setMenuOpen(false);
    menuButtonRef.current?.focus();
  };

  // Clicking the link of the section you are already on changes no address, so scroll there directly.
  const onNavClick = (event: MouseEvent<HTMLElement>) => {
    setMenuOpen(false);
    const link = (event.target as HTMLElement).closest('a');
    const clicked = link ? matchRoute(link.getAttribute('href') ?? '', views) : null;
    if (clicked && clicked.view.path === currentPath && clicked.view.section) scrollToSection(clicked.view.section);
  };

  const accession = match?.params.accession;
  const screenTitle = match ? [match.view.title, accession].filter(Boolean).join(' ') : 'Not found';
  useRouteChrome(screenTitle, route);

  // A plain #anchor would change the hash and the router would see an unknown route.
  const skipToContent = (event: MouseEvent) => {
    event.preventDefault();
    mainRef.current?.focus();
  };

  return (
    <>
      <AmbientGlow />
      <a className="skip-link" href="#main-content" onClick={skipToContent}>
        Skip to content
      </a>
      <header className="console-header" onKeyDown={closeMenuOnEscape}>
        <a className="console-brand" href={carryExplorerState('/ranking', query)} aria-label="Flame in Freefall — Ranking">
          <span className="console-mark" aria-hidden="true" />
          <strong>FLAME IN FREEFALL</strong>
          <span className="console-tag">PSI RESEARCH CONSOLE</span>
        </a>
        <button
          ref={menuButtonRef}
          type="button"
          className="menu-button"
          aria-expanded={menuOpen}
          aria-controls="main-nav"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="action-icon" aria-hidden="true" /> : <Menu className="action-icon" aria-hidden="true" />}
          Menu
        </button>
        <nav id="main-nav" aria-label="Main" className={menuOpen ? 'open' : undefined} onClick={onNavClick}>
          <ul>
            {views
              .filter((view) => view.inNav)
              .map((view) => (
                <li key={view.path}>
                  <a href={carryExplorerState(view.path, query)} aria-current={view.path === (match?.view.section ? (readingPath ?? currentPath) : currentPath) ? 'page' : undefined}>
                    {view.title}
                  </a>
                </li>
              ))}
          </ul>
        </nav>
        <div className="theme-switch" role="group" aria-label="Color theme">
          {(['light', 'dark'] as const).map((choice) => (
            <button key={choice} type="button" aria-pressed={(theme ?? systemTheme) === choice} onClick={() => chooseTheme(choice)}>
              {choice === 'light' ? <Sun className="action-icon" aria-hidden="true" /> : <Moon className="action-icon" aria-hidden="true" />}
              {choice === 'light' ? 'Light' : 'Dark'}
            </button>
          ))}
        </div>
        <span className="dataset-state">CACHED PSI DATA</span>
      </header>
      <main id="main-content" ref={mainRef} tabIndex={-1}>
        {match ? <match.view.component params={match.params} query={match.query} section={match.view.section} /> : <NotFound requested={hash} />}
      </main>
      <footer>
        <DataSourceNote />
        <p>
          Experimental data explorer, not a spacecraft monitor or an operational fire-risk predictor. AI-generated text is always labeled.{' '}
          <a href={carryExplorerState('/about', query)}>About, sources and licenses</a>
        </p>
        <p role="status" className="offline-state">
          {offlineReady ? 'Available offline' : ''}
        </p>
      </footer>
    </>
  );
}
