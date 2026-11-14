import { useEffect, useState } from 'react';
import { EXPLORER_QUERY_CHANGE } from './explorerQuery';

export const HOME_HASH = '#/ranking';

// Returns the current location.hash and re-renders on change, including changes made with replaceState. The bare root redirects to Ranking.
export function useHashLocation(): string {
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const sync = () => {
      if (window.location.hash === '' || window.location.hash === '#/') {
        window.location.replace(HOME_HASH);
        return;
      }
      setHash(window.location.hash);
    };
    sync();
    window.addEventListener('hashchange', sync);
    // replaceState does not fire hashchange; the explorer writer announces its changes with this event.
    window.addEventListener(EXPLORER_QUERY_CHANGE, sync);
    return () => {
      window.removeEventListener('hashchange', sync);
      window.removeEventListener(EXPLORER_QUERY_CHANGE, sync);
    };
  }, []);

  return hash;
}
