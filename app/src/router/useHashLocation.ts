import { useEffect, useState } from 'react';

export const HOME_HASH = '#/ranking';

// Returns the current location.hash and re-renders on change. The bare root redirects to Ranking.
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
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  return hash;
}
