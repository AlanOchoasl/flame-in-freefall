# Design

## Context

No app code exists yet. Inputs are static JSON files produced by other changes. The team has React, Angular, .NET and Nest experience. On 2026-11-14 the team chose React + TypeScript; Vite is the build tool. The team also asked about a Nest backend: the Must work stays **static with no backend**, and a Nest service is only considered for `ask-the-data` (runtime AI proxy), after milestone 2. See proposal.md.

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

8. **Extension points, kept deliberately small** (the team asked on 2026-11-14 for something that can grow): (a) all data goes through one data-access module (`getCatalog`, `getExperiments`, `getSummaries`); today it fetches static files and a future API would replace only that module; (b) views are declared in one list (path, title, component), so adding a view is one entry plus a component; (c) every data file carries a `schemaVersion`, checked at load; (d) lists that vary (ranking profiles, curation vocabularies, outcome labels) come from data files, not code. Not added on purpose: plugin systems, state libraries, a database, microservices; the rule against speculative abstractions still applies.
9. **`docs/EXTENDING.md`** explains how to add an investigation, a table mapper, a ranking profile, a view, or a backend.

Data flow: `data/processed/*.json` → `app/public/data/` → data-access module → views.

## Risks / Trade-offs

- [Vite 8 depends on `lightningcss` (MPL-2.0)] → **approved by the team on 2026-11-14** as a build-time-only exception, recorded in `scripts/license-policy.json` (`lightningcss*` also covers its per-platform binaries). Only a person edits `approvedExceptions`.
- [Node's TypeScript stripping vs Vite] → app code is compiled by Vite; build scripts use Node directly.
- [Sub-path hosting breaks absolute URLs] → relative URLs and hash routing.

## Open Questions

- Which host and URL (deferrable, but needed by Sun 12:00).
