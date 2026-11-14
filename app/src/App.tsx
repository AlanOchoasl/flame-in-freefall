import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import { DataSourceNote } from './components/DataSourceNote';
import { matchRoute } from './router/matchRoute';
import { useHashLocation } from './router/useHashLocation';
import { useRouteChrome } from './router/useRouteChrome';
import { views } from './views';
import { NotFound } from './views/placeholders';

export function App() {
  const hash = useHashLocation();
  const match = matchRoute(hash, views);
  const currentPath = match?.view.path;
  const mainRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() =>
    window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark',
  );

  useEffect(() => {
    const preference = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = () => setSystemTheme(preference.matches ? 'light' : 'dark');
    preference.addEventListener('change', onChange);
    return () => preference.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (theme) document.documentElement.dataset.theme = theme;
    else delete document.documentElement.dataset.theme;
  }, [theme]);

  // Any route change closes the menu, including the browser's Back button.
  useEffect(() => setMenuOpen(false), [hash]);

  const closeMenuOnEscape = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || !menuOpen) return;
    setMenuOpen(false);
    menuButtonRef.current?.focus();
  };

  const accession = match?.params.accession;
  const screenTitle = match ? [match.view.title, accession].filter(Boolean).join(' ') : 'Not found';
  useRouteChrome(screenTitle, hash);

  // A plain #anchor would change the hash and the router would see an unknown route.
  const skipToContent = (event: MouseEvent) => {
    event.preventDefault();
    mainRef.current?.focus();
  };

  return (
    <>
      <a className="skip-link" href="#main-content" onClick={skipToContent}>
        Skip to content
      </a>
      <header className="console-header" onKeyDown={closeMenuOnEscape}>
        <a className="console-brand" href="#/ranking" aria-label="Flame in Freefall — Ranking">
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
          Menu
        </button>
        <nav id="main-nav" aria-label="Main" className={menuOpen ? 'open' : undefined} onClick={() => setMenuOpen(false)}>
          <ul>
            {views
              .filter((view) => view.inNav)
              .map((view) => (
                <li key={view.path}>
                  <a href={`#${view.path}`} aria-current={view.path === currentPath ? 'page' : undefined}>
                    {view.title}
                  </a>
                </li>
              ))}
          </ul>
        </nav>
        <div className="theme-switch" role="group" aria-label="Color theme">
          {(['light', 'dark'] as const).map((choice) => (
            <button key={choice} type="button" aria-pressed={(theme ?? systemTheme) === choice} onClick={() => setTheme(choice)}>
              {choice === 'light' ? 'Light' : 'Dark'}
            </button>
          ))}
        </div>
        <span className="dataset-state">CACHED PSI DATA</span>
      </header>
      <div className="console-notice">
        <strong>EXPERIMENTAL DATA EXPLORER</strong>
        <span>Not a spacecraft monitor or operational fire-risk predictor.</span>
      </div>
      <main id="main-content" ref={mainRef} tabIndex={-1}>
        {match ? <match.view.component params={match.params} query={match.query} section={match.view.section} /> : <NotFound requested={hash} />}
      </main>
      <footer>
        <DataSourceNote />
        <p>Independent research exploration · AI-generated text is always labeled.</p>
      </footer>
    </>
  );
}
