# Design

## Context

Observed in the code today (`app/src`):

- `Console.tsx` keeps `profileId` and `selected` in `useState`. They survive moves between `#/ranking`, `#/compare` and `#/map` (one component) but not a reload or a visit to the detail screen, which is another component.
- The comparison lives in the address as `?ids=` (`compare/selection.ts`), written with `window.location.hash = ...`, which adds a history entry and rewrites the whole hash.
- The map reads `?investigation=` only to initialise `useState` in `CoverageMapBody`; its other filters are local state.
- The navigation links (`App.tsx`) and the detail's "Back to the explorer" link (`InvestigationDetail.tsx`) point to bare routes, so the query is dropped.
- There is no service worker; `app/public/` holds only `data/`, which is copied by `sync:data`. `vite.config.ts` uses `base: './'` and the app uses hash routing, so there is one document URL.

See proposal.md for the motivation.

## Goals / Non-Goals

**Goals:**
- One place that defines which choices are in the address and how they are parsed and written.
- The address is the only source of truth for those choices.
- Offline use after the first load, with no dependency added.

**Non-Goals:**
- Storing state outside the address (`localStorage`, server).
- Putting UI-only state in the address (table or chart view, open panels, the selected test point).
- A general router rewrite: `matchRoute` stays as it is.

## Decisions

1. **The address is the single source of truth.** The console derives `profile`, `selected`, `ids`, `investigation`, `flame`, `fuel` and `outcome` from `query` (already passed to every view as `ViewProps.query`) and writes changes back to the address. Alternative: keep `useState` and mirror it to the address. Rejected: two copies drift, and a reload or a pasted link would need a third code path.

2. **One pure module, `app/src/router/explorerQuery.ts`.** It parses a `URLSearchParams` into a typed state, serializes a state (omitting defaults, stable key order), merges a patch, and builds a hash for a path while carrying only the explorer keys. It does not know the data; validation against the loaded profiles, accessions and filter options happens in the console after the data loads, in a second small function that returns the cleaned state. Pure functions get unit tests, which is where the risk is.

3. **Writing uses `history.replaceState` plus a small event.** `hashchange` does not fire on `replaceState`, so the writer dispatches a custom `explorer-query-change` event that `useHashLocation` also listens to. Route changes (links) still use normal navigation and add a history entry. Alternative: assign `location.hash` for every change. Rejected: each filter click adds a history entry and the Back button becomes unusable.

4. **Links go through one helper.** `App.tsx` nav links, the console-to-detail links and the detail back link call the helper from decision 2. Only the explorer keys are carried, so an unrelated or malformed parameter does not spread. The detail screen receives the query in `ViewProps` and passes it back unchanged.

5. **The map becomes a controlled component for its filters.** `CoverageMapBody` takes `filters` and `onFiltersChange` instead of owning them with `useState(initialAccession)`. The investigation filter is a normal filter, so "Show tests on the map" on a ranking row is just a change of `investigation`, and the existing "clear" in the filter row removes it. Alternative: a separate "highlighted investigation". Rejected: the spec already treats `investigation` as the map filter and two concepts would confuse the legend and counts.

6. **Offline: a service worker written in the repository, no library.** `app/public/sw.js` is copied as is to the site root by Vite. Strategy: the page and the four data files are network-first with the stored copy as fallback; files under `assets/` have content-hashed names, so they are cache-first. On install the worker stores the page and the four data files by their known names. Because the hashed asset names are only known after the build, the page sends the list of its own same-origin resources (`performance.getEntriesByType('resource')`) to the worker once it is active, and the worker stores them. This uses only standard Web APIs: Service Worker, Cache Storage and Resource Timing. Alternatives: `vite-plugin-pwa` (a dependency with its own license check, and a build step we do not control), or a Vite plugin that emits a file list (relies on build-tool plugin APIs that this project has not used and I have not verified for the installed Vite version). Registration is skipped in development (`import.meta.env.PROD`) so it never caches the dev server.

7. **Readiness signal.** Once the worker has stored the page and the data, it tells the page; the footer then shows "Available offline" in plain text. This is both the signal the spec needs ("waits until it reports being ready") and useful in the demo. Alternative: no visible signal. Rejected: the check cannot be done by a person or by a script without a fixed sleep.

## Risks / Trade-offs

- [A stale or broken cache after a deploy] → page and data are network-first; hashed assets never change under the same name; the worker removes caches with its own prefix that it does not use anymore when it activates.
- [The first offline reload happens before the worker finished storing assets] → readiness is signalled only after storing; the smoke check waits for it.
- [`replaceState` is not seen by other code listening to `hashchange`] → the only listener is `useHashLocation`; the custom event is dispatched in the one writer function.
- [A malformed address crashes the page] → unknown values are ignored by the validation step; covered by unit tests with invalid input.
- [Service workers need a secure context] → the deployed site is HTTPS and `localhost` is allowed; the manual check runs on the public URL.
- [The state in the address makes ranking default selection implicit] → the selected investigation is omitted when it is the first ranked, so changing the profile changes the default, which matches the current behaviour.

## Migration Plan

No data migration. Existing `?ids=` and `?investigation=` addresses keep their meaning. Rollback: remove the registration call in `main.tsx`; an installed worker removes its caches when the page unregisters it (the unregistration is done by a one-line change that calls `unregister()`), otherwise it simply keeps serving the stored copy only when the network fails.

## Open Questions

- Whether Vercel needs an explicit `Cache-Control: no-cache` header for `sw.js` (browsers already revalidate the worker script on their own). Check in Vercel's documentation before adding it; the app works either way.
