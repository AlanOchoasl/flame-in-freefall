# Tasks

Tasks are **not pre-assigned**. Each person claims a module (a numbered group) in the team channel before starting. Times are Argentina (Saturday 14 Nov, or Sunday where stated), and are deadlines for the milestone, not per person; `≤Xh` is a cap per task. Tests that run in Node (no browser) cover the pure modules; behaviour in the page is checked in a browser, as in `docs/SMOKE.md`. Profile ids used below come from `data/ranking/profiles.json`: `crew-cabin`, `lunar-base-rover`, `detection`, `suppression`.

## 1. Address state module

Depends on: nothing.

- [x] 1.1 (Sat by 18:30, ≤1.5h) Write the pure module `app/src/router/explorerQuery.ts` that parses `profile`, `selected`, `ids`, `investigation`, `flame`, `fuel` and `outcome`, serializes them (defaults omitted, stable key order), merges a patch, and builds a hash for a path carrying only those keys; verify unit tests pass for a round trip, for default omission, for the 3-id cap, for older addresses (`#/compare?ids=PSI-159,PSI-25`, `#/map?investigation=PSI-159`) and for unrelated parameters being dropped by the link builder.
- [x] 1.2 (Sat by 19:30, ≤1h) Add the validation step that cleans a parsed state against the loaded data (profile ids, catalog accessions, the map's filter options), falling back to the default; verify unit tests for an unknown profile, an unknown accession, a fuel no test has, and 5 comparison ids.
- [x] 1.3 (Sat by 20:00, ≤1h) Add the writer that changes the address with `history.replaceState` and dispatches `explorer-query-change`, and make `useHashLocation` re-render on that event as well as on `hashchange`; verify in a browser that changing the profile five times leaves `history.length` unchanged and that Back leaves the console. Plan B: if the event approach misbehaves, write with `location.hash` and accept the extra history entries, and say so in `docs/SMOKE.md`.

## 2. Console and panels

Depends on: 1.1–1.3.

- [x] 2.1 (Sat by 21:00, ≤2h) Make `Console` derive the profile and the selected investigation from the address and drop their `useState`; verify in a browser that selecting Fire detection and reloading keeps it, that the default profile and the first ranked investigation leave the address clean, and that `#/ranking?selected=PSI-9999` shows the first ranked investigation with no error.
- [x] 2.2 (Sun by 09:00, ≤2h) Turn the map's filters (`investigation`, `flame`, `fuel`, `outcome`) into controlled props written to the address, add "Show tests on the map" to each ranking row and make the existing clear action remove the filter; verify in a browser that the action on PSI-25 leaves only PSI-25's tests on the map with `investigation=PSI-25` in the address, that clearing restores 660 tests (or the current total of `experiments.json`), and that an investigation with no test rows (for example PSI-69) says so instead of showing an empty map silently. This closes `coverage-map` 3.6.
- [x] 2.3 (Sun by 09:30, ≤1h) Make Compare and the ranking rows' "Add compare" write `ids` through the writer without dropping the other parameters and without adding history entries; verify that adding two investigations with the Fire detection profile selected keeps the profile in the address, and that the fourth is still refused with the existing message.

## 3. Links that keep the state

Depends on: 1.1, 2.1.

- [x] 3.1 (Sun by 10:30, ≤1.5h) Route the navigation links, the console section links, the console-to-detail links and the detail's back link through the link builder, and let the detail screen return the query unchanged; verify the round trip from the spec (Fire detection profile, PSI-47 in the comparison, open the detail of PSI-47, "Back to the explorer" shows both again) and that the Compare link of the navigation keeps a comparison and a profile.

## 4. Offline use

Depends on: nothing; independent of groups 1–3 and can be done in parallel.

- [x] 4.1 (Sun by 10:00, ≤2h) Write `app/public/sw.js` (store the page and the four data files on install; network-first for the page and data with the stored copy as fallback; cache-first for `assets/`; store only successful same-origin GET responses; remove its own old caches on activate; answer a status question from the page) and register it from `main.tsx` in production builds only, relative to `import.meta.env.BASE_URL`, with the page sending its own same-origin resource list to the worker once active; verify with `npm run build` and `vite preview` that the worker becomes active, that the stored entries are all same-origin, and that a build with registration failing (service workers disabled) still loads every screen.
- [x] 4.2 (Sun by 11:00, ≤1h) Show "Available offline" in the footer only after the worker reports that the page, the scripts, the styles and the four data files are stored; verify it does not appear on the first paint, appears after caching, and does not appear when service workers are unavailable.
- [ ] 4.3 (Sun by 11:30, ≤1h) Check offline use in a browser against `vite preview`, then against the public URL: wait for the footer text, disconnect, reload `#/map`, `#/about` and `#/investigation/PSI-159`; verify all three render with data and styling, then reconnect and verify a change to a data file shows after one reload. Decide with the Vercel documentation whether `sw.js` needs a `Cache-Control: no-cache` header in `app/vercel.json`. Plan B: if offline is not reliable by Sun 11:30, remove the registration from `main.tsx`, keep the known gap in `docs/SMOKE.md` and demo from the recorded video.

## 5. Check and document

Depends on: 2.1–2.3, 3.1, 4.1–4.3.

- [ ] 5.1 (Sun by 12:00, ≤1h) Add smoke items for the address state and for offline to `docs/SMOKE.md`, remove the offline known gap if 4.3 passed, add a short recipe to `docs/EXTENDING.md` for adding a new explorer parameter, and run the checklist once on the public URL; verify the items are ticked with the deploy commit named.

## Workflow follow-up

- `console-single-page` and `coverage-map` are edited by their own owners: tell them that their requirement "moving between routes keeps the state" is now also kept in the address, and that `coverage-map` 3.6 is covered by 2.2 here.
- Archive this change after milestone 2 (Sunday 12:00) is met and the smoke run of 5.1 passes.
