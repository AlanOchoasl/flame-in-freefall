import { matchRoute } from './router/matchRoute';
import { useHashLocation } from './router/useHashLocation';
import { views } from './views';
import { NotFound } from './views/placeholders';

export function App() {
  const hash = useHashLocation();
  const match = matchRoute(hash, views);
  const currentPath = match?.view.path;

  return (
    <>
      <header>
        <strong>Flame in Freefall</strong>
        <nav aria-label="Main">
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
      <main>
        {match ? <match.view.component params={match.params} query={match.query} /> : <NotFound requested={hash} />}
      </main>
    </>
  );
}
