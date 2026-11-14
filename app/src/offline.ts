import { useEffect, useState } from 'react';

// Offline use: registers the service worker (app/public/sw.js) and reports when it has stored the app.
// Production builds only, so the worker never caches the development server.

const sameOriginResources = (): string[] =>
  performance
    .getEntriesByType('resource')
    .map((entry) => entry.name)
    .filter((href) => new URL(href).origin === window.location.origin);

async function startOffline(onReady: () => void): Promise<void> {
  const registration = await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`);
  const worker = (await navigator.serviceWorker.ready).active ?? registration.active;
  if (!worker) return;

  navigator.serviceWorker.addEventListener('message', (event: MessageEvent) => {
    if (event.data?.type === 'offline-status' && event.data.ready === true) onReady();
  });
  // The page's own files are known only now that it has loaded them.
  worker.postMessage({ type: 'cache-urls', urls: [window.location.href.split('#')[0], ...sameOriginResources()] });
}

/** True once the app is stored for offline use. Stays false when service workers are unavailable. */
export function useOfflineReady(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
    // A failure (private window, blocked registration) leaves the app working online, as before.
    startOffline(() => setReady(true)).catch(() => undefined);
  }, []);

  return ready;
}
