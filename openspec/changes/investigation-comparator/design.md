# Design

## Context

Depends on `investigation-catalog` (text, hardware, fuel phase, topics, measurements), `data-pipeline` (per-investigation O2/pressure ranges and fuels, only PSI-159 and PSI-10) and `app-shell` (shared labels). Test-condition rows will therefore be empty for most investigations; that is expected and must be explained, not hidden. See proposal.md.

## Goals / Non-Goals

**Goals:** make differences visible fast; never fake a value.
**Non-Goals:** statistics, test-level comparison, new data extraction.

## Decisions

1. **One pure function builds the comparison model** (rows, values, marker, reason for missing), tested without the UI. The view only renders it.
2. **"Same/differs" compares normalized values** (arrays as sets, ranges by min and max, text excluded). Alternative (compare raw strings): false differences from spacing and case.
3. **Selection stored in the hash** (`#/compare?ids=PSI-159,PSI-25`), consistent with the app's router.
4. **Layout:** a table with a sticky first column, inside its own horizontal scroll on narrow screens.
5. **Menus, not search.** Three native `<select>` menus choose the investigations (changed on 2026-11-15 at the team's request); with 26 investigations a menu is enough, needs no search code and works with the keyboard and screen readers. A choice is written to `ids` in the address like before.

Data flow: `catalog.json` + `experiments.json` (+ `summaries.json`) → comparison model → Compare view.

## Risks / Trade-offs

- [Condition rows mostly empty] → clear reasons; link to the PSI page.
- [Long objectives make the table unreadable] → truncated with expand.
- [Curation incomplete] → unreviewed markers, never silently trusted.
