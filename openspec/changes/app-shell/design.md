# Design

## Context

No app code exists yet. Inputs are static JSON files produced by other changes. The team has React, Angular, .NET and Nest experience; React + TypeScript + Vite is the default proposed on 2026-11-14 and has **not been explicitly confirmed** by the team. See proposal.md.

## Goals / Non-Goals

**Goals:** a small, boring static app that all three people can edit; offline; public URL.
**Non-Goals:** the view content, SSR, a backend, state libraries.

## Decisions

1. **React 19.3.1 + TypeScript 7.0.2 + Vite 8.3.8** (versions seen on the registry 2026-11-14; licenses MIT / Apache-2.0 / MIT, checked with `scripts/check-licenses.mjs`). Largest chart and help ecosystem. Alternative: Angular, if the team prefers it; the specs are framework-independent.
2. **Charts: Recharts 3.10.1 (MIT).** Verified in the installed package: `ScatterChart`, `Scatter`, `ReferenceArea`, `ReferenceLine`, `ResponsiveContainer`, `Tooltip`, and marker shapes `circle/cross/diamond/square/star/triangle/wye`. Alternative: hand-written SVG; more control, more time.
3. **Hash routing with a tiny custom router** (`#/ranking`, `#/compare?ids=…`, `#/map`, `#/investigation/PSI-159`). Works on any static host without rewrite rules; avoids a routing dependency.
4. **Data copied into `app/public/data/` by a sync script** from the committed `data/processed/`; fetched with relative URLs so it works under a sub-path.
5. **Shared components:** `AiLabel`, `PsiLink`, `NotAvailable` (dash + reason), `DataSourceNote`. All views must use them; specs depend on them.
6. **Testing:** Vitest for pure logic only; UI verified with a manual smoke checklist. Alternative (browser tests): heavier setup than the time allows.
7. **Hosting:** GitHub Pages, Netlify or Vercel, chosen by the team after checking that the free tier and base-path settings fit. Not verified here.

Data flow: `data/processed/*.json` → `app/public/data/` → fetch at runtime → views.

## Risks / Trade-offs

- [Vite 8 depends on `lightningcss` (MPL-2.0), which `check-licenses` rejects under the current policy] → **team decision needed before scaffolding**: approve it as an exception (build-time only, not in the shipped bundle; MPL-2.0 is OSI-approved, so within the 2026 Terms) or pick another Vite major / build tool. Nobody but a person edits `approvedExceptions`.
- [Node's TypeScript stripping vs Vite] → app code is compiled by Vite; build scripts use Node directly.
- [Sub-path hosting breaks absolute URLs] → relative URLs and hash routing.
- [React not confirmed by the team] → decide before 13:00; switching later costs rework.

## Open Questions

- Which host and URL (deferrable, but needed by Sun 12:00).
