# Proposal

**Label: Must**

## Why

The console keeps its state (profile, selected investigation, comparison, map filters) only in memory. It is lost on reload, after opening an investigation detail and coming back, and when a navigation link is used. A copied link does not restore what the sender saw. Also, `app-shell` requires offline use after the first load, and `docs/SMOKE.md` lists that as a known gap: there is no service worker.

## What Changes

- The explorer state lives in the address (`#/ranking?profile=...`): profile, selected investigation, comparison ids and map filters. Opening the address restores the page.
- Console panels read and write it through one module; in-page changes replace the history entry instead of adding one.
- A "Show tests on the map" action on a ranking row sets the map's investigation filter (the existing `investigation` parameter, now read when it changes, and clearable).
- Navigation links, the detail "Back to the explorer" link and the console-to-detail links carry the state.
- A small service worker written in the repository caches the app files and the data files after the first load.

## Capabilities

### New Capabilities
- `explorer-state`: shareable address state of the console and the links that keep it.
- `offline-cache`: offline use after the first load.

### Modified Capabilities
none: the affected capabilities are unarchived and edited in their own folders.

## Impact

- `app/src/router/`, `app/src/views/` (console, coverage map, compare, detail), `app/src/App.tsx`, `app/src/main.tsx`, `app/public/sw.js`, `app/vercel.json`, `docs/SMOKE.md`.
- Closes `coverage-map` task 3.6 and the offline gap of `app-shell` 5.1. No new dependency, data or scoring change.
- Data: existing processed JSON from NASA PSI Combustion Science, https://psi.nasa.gov/physci/repo/search?q=combustion.

## Out of scope (No)

A scenario home screen (`scenario-explorer` stays on hold), `localStorage` or server state, accounts, analytics, install prompts, new data, runtime AI, ranking score changes.
