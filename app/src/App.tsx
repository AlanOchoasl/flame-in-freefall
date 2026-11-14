import { useRef, useState } from 'react';
import type { MouseEvent } from 'react';
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
  const [menuOpen, setMenuOpen] = useState(false);

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
      <header>
        <strong>Flame in Freefall</strong>
        <button type="button" className="menu-button" aria-expanded={menuOpen} aria-controls="main-nav" onClick={() => setMenuOpen(!menuOpen)}>
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
      </header>
      <main id="main-content" ref={mainRef} tabIndex={-1}>
        {match ? <match.view.component params={match.params} query={match.query} /> : <NotFound requested={hash} />}
      </main>
      <footer>
        <DataSourceNote />
        <p>AI-generated text is always labeled.</p>
      </footer>
    </>
  );
}
