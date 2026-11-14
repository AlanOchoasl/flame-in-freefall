# UI mockup (reference only)

`mockup.dc.html` is the clickable UI/UX mockup of the six screens, made with Claude Design from `docs/DESIGN_PROMPT.md` (2026-11-14). `COMPONENTS.md` lists the shared components it defines.

- It is a **visual reference**, not product code. The app is built in `app/` (React + TypeScript + Vite); the OpenSpec change `design-system` says what to take from the mockup.
- All numbers, DOIs and texts in it are **sample placeholders**. The only real data are the totals and the PSI titles copied from `data/processed/`.
- The "MOCKUP STATES" bar at the top is mockup scaffolding and is never built.
- To open it you need `support.js` (the Claude Design runtime, which also loads React and Babel from unpkg at runtime). `support.js` is **not committed**: its license is not verified (see `AGENTS.md`, dependency rules). Ask the person who generated the mockup for the original zip.
- Known gaps found in review (fixed in the specs, not in the mockup): the coverage-map axes have no tick values, overlay labels overlap data points, the plot is unreadable at 360 px, and the 2-selected Compare table rendered empty in one test environment (unconfirmed). `--border-strong` fails the 3:1 contrast for control borders; the spec uses a darker value.
