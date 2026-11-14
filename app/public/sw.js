// Service worker: lets the app work offline after its first load.
// Written by hand, no library. See openspec/changes/explorer-state/design.md (decision 6).
//
// - The page and the data files: network first, the stored copy only when the network fails,
//   so an online visit always shows the current version.
// - Files under assets/ have content-hashed names and never change: stored copy first.
// - Only successful GET responses from the app's own origin and folder are stored.

const PREFIX = 'flame-in-freefall-';
const CACHE = `${PREFIX}v1`;
const SCOPE = self.registration.scope; // the folder this worker serves, e.g. https://host/ or https://host/sub/
const DATA_FILES = ['catalog.json', 'experiments.json', 'summaries.json', 'profiles.json'];
const DATA_URLS = DATA_FILES.map((name) => `${SCOPE}data/${name}`);

// Servers may answer with `Vary: Origin`, and module scripts (crossorigin) send an Origin header that the
// stored request did not have. These files are the same either way, so Vary is ignored when matching.
const MATCH = { ignoreVary: true };

const isStorable = (url) => url.origin === self.location.origin && url.href.startsWith(SCOPE) && !url.pathname.endsWith('/sw.js');

async function store(cache, url) {
  const response = await fetch(new Request(url, { cache: 'reload' }));
  if (!response.ok) throw new Error(`${url} answered ${response.status}`);
  await cache.put(url, response);
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => Promise.all([SCOPE, ...DATA_URLS].map((url) => store(cache, url))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((name) => name.startsWith(PREFIX) && name !== CACHE).map((name) => caches.delete(name))))
      .then(() => self.clients.claim()),
  );
});

async function networkFirst(request, key) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(key, response.clone());
    return response;
  } catch (error) {
    const stored = await cache.match(key, MATCH);
    if (stored) return stored;
    throw error;
  }
}

async function storedFirst(request) {
  const cache = await caches.open(CACHE);
  const stored = await cache.match(request, MATCH);
  if (stored) return stored;
  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (!isStorable(url)) return;

  if (request.mode === 'navigate') {
    // Every address of the app is the same page: the route is in the hash.
    event.respondWith(networkFirst(request, SCOPE));
  } else if (url.href.startsWith(`${SCOPE}assets/`)) {
    event.respondWith(storedFirst(request));
  } else {
    event.respondWith(networkFirst(request, request));
  }
});

// The page sends the files it loaded (their names carry a hash, so only the page knows them).
// The worker stores the ones it does not have yet, then says whether the app is ready offline.
async function storeReported(urls) {
  const cache = await caches.open(CACHE);
  const wanted = [...new Set(urls)].filter((href) => isStorable(new URL(href)));
  const missing = [];
  for (const href of wanted) {
    if (!(await cache.match(href, MATCH))) missing.push(href);
  }
  await Promise.all(missing.map((href) => store(cache, href)));
  // Ready means: the page, the four data files and everything the page reported are stored.
  return Boolean(await cache.match(SCOPE, MATCH)) && (await Promise.all(DATA_URLS.map((url) => cache.match(url, MATCH)))).every(Boolean);
}

self.addEventListener('message', (event) => {
  const message = event.data;
  if (!message || !event.source) return;
  if (message.type === 'cache-urls' && Array.isArray(message.urls)) {
    event.waitUntil(
      storeReported(message.urls.filter((href) => typeof href === 'string'))
        .catch(() => false)
        .then((ready) => event.source.postMessage({ type: 'offline-status', ready })),
    );
  }
});
