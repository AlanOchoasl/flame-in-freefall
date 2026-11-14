# Roadmap — Flame in Freefall (NASA Space Apps 2026, San Luis)

Times are Argentina (UTC-3). Based on `docs/PLAYBOOK.md`.
**Verify dates, rules and judging criteria against the official 2026 guides** (spaceappschallenge.org): the playbook follows the 2025 guide.
Official challenge statement: `Recursos/Enunciado oficial - Flame in Freefall.md`.

## Product (decided 2026-11-14)

An **SI-powered, web-based fire-safety dashboard** over the PSI combustion investigations, built for professors, students and aerospace engineers. The unit is the *investigation* (26 in PSI), not the individual test row.

Four views (Must):
1. **Ranking**: investigations ranked by relevance to a chosen environment (spacecraft cabin, Moon base / pressurized rover, detection, suppression, Earth applications). The score is rule-based and explainable; its basis is documented on screen.
2. **Comparator**: 2–3 investigations side by side (objectives, fuels, test conditions, hardware, measurements).
3. **Coverage map**: O2 fraction × pressure of real tests, with the expected Moon-base zone (O2 ≥ 30 %, ≤ 10.2 psi ≈ 0.70 bar, per the challenge statement) and the data gaps visible.
4. **Plain-language summaries**: AI-written, grounded only in the PSI text, labeled as AI-generated, reviewed by a human, precomputed into static JSON.

Extra, with caution: **ask-the-data** (Nice-to-have). A natural-language question is translated by AI into a *constrained* query over our JSON; charts are drawn by normal code, numbers always come from the data, never from the model. Demo works offline with precomputed example questions. Only attempted after the four views are stable.
Nice-to-have: Earth-applications panel (PSI's "Research Impacts/Earth Benefits" field is present in all 26 investigations).

Principles: no invented numbers; every point cites PSI + DOI; AI output always labeled; the app works without any live AI call or network.

## Data facts (verified 2026-11-14, see `Recursos/PSI Combustion Science - catalogo de datos.md`)
- 26 investigations; the catalog JSON (cached in `data/sample/psi-catalog/`) has objectives, approach, hypothesis and earth-benefits text for all 26. It has **no field for sensors/measurements**; that needs extraction from the approach text.
- Test tables (cached in `data/sample/psi/`): 660 real rows in PSI-159 + PSI-10; 629 have both O2 and pressure; **66** of those fall in the Moon-base zone, all gaseous fuels. PSI-10 has no outcome columns.
- No partial-gravity data in PSI (per the statement).

## Timeline

| When | Phase | Deliverable | Gate |
|---|---|---|---|
| Sat 14 — before 09:00 | 0. Prep | Team registered, venue San Luis, repo, roles named | Checklist done |
| Sat 09:00–11:00 | 1. Confirm | Product (above) confirmed, roles assigned, stack confirmed | Decision by 11:00 |
| Sat 11:00–13:00 | 2. Specs | OpenSpec changes below ready; JSON contracts fixed | Specs reviewed |
| Sat 13:00–20:00 | 3a. Build | **Milestone 1 (Sat 20:00):** `catalog.json` + `experiments.json` + app shell listing investigations | Pipeline end to end |
| Sun 08:00–12:00 | 3b. Build | **Milestone 2 (Sun 12:00):** the 4 Must views deployed at a public URL | URL works |
| Sun 12:00–16:00 | 3c. Polish | Extras only if Must is solid | **Feature freeze 16:00** |
| Sun 16:00–21:00 | 4. Demo | 30 s video (or ≤ 7 slides), subtitles, README, license, third-party licenses | Demo link works in incognito |
| Sun 21:00–23:00 | 5. Submit | Project page in English (incl. AI-use description), T&C ticked, **Submit** | Submitted **before 23:00** |

Risk review every 4 hours. Blocked > 45 min → plan B (cached sample, mock, reduced scope).

## OpenSpec changes (one per Must feature; order = dependency)
| # | Change | Label | Size* | Notes |
|---|---|---|---|---|
| 1 | `investigation-catalog` | Must | M | 26 investigations: metadata + hand-reviewed curation tags → `catalog.json` |
| 2 | `data-pipeline` | Must | M | Revised: PSI-159 + PSI-10 inverse are Must, PSI-10 normal is Nice; review items fixed |
| 3 | `app-shell` | Must | S | React + TypeScript + Vite static app, loads the JSON files |
| 4 | `investigation-ranking` | Must | M | Scoring rules; basis taken from the statement (solids, detection, suppression, Moon-base atmosphere) |
| 5 | `investigation-comparator` | Must | S | Side-by-side view |
| 6 | `coverage-map` | Must | M | O2 × pressure, Moon-base zone, gaps |
| 7 | `ai-summaries` | Must | M | Precomputed, grounded, labeled, human-reviewed |
| 8 | `ask-the-data` | Nice | L | Constrained NL → query; precomputed Q&A first |

*Rough size guess, not an estimate.

**Status (2026-11-14):** specs written and validated for changes 1–7 (`openspec validate --all --strict`); `ask-the-data` (8) is not specced yet. Tasks are in each change's `tasks.md` (59 tasks). The sum of the per-task **caps** is about 74 h for Must work (caps are upper bounds, not estimates). It probably does not fit with every investigation curated and summarized; see the scope levers below.

### Scope levers if time runs short (apply in this order)
1. Curate tags and write AI summaries only for a **core set** (the investigations the statement names); the rest keep the PSI-text fallback, which the specs already support.
2. Keep PSI-10 normal flames and the data download out (already Nice).
3. Defer `ask-the-data` entirely.
4. Cut the comparator's secondary rows before cutting a view.

## Open items
- [x] No pre-assigned owners: tasks come from the specs and each person claims the module they want (decided 2026-11-14)
- [x] Stack: React + TypeScript + Vite (team, 2026-11-14). Architecture: static only (option A). Nest backend deferred; only for `ask-the-data` after milestone 2
- [x] Extensibility (team request, 2026-11-14): data-access module, view list, data-driven profiles and vocabularies, `schemaVersion` on every data file, mapper list, `docs/EXTENDING.md`. About +2 h of task caps (measured: tasks 2.1, 3.1 and the new 5.3 in `app-shell`); no plugin systems or extra infrastructure
- [ ] Verify 2026 judging criteria (Judging & Awards Guide)
- [ ] Choose license (recommended Apache-2.0; see `AGENTS.md`)
- [ ] Capture DOI of each investigation used ("Cite this Investigation" on its PSI page)
- [ ] Decide who curates the tags for the 26 investigations (needs science reading)
- [x] AI access: Gemini via API key (team, 2026-11-14). Still to verify: model, limits, structured-output style (in Google's docs)
- [ ] Verify the meaning of `SE`, `FT`, `TFP`, `Zst` in the PSI-159 Read Me
