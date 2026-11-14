# Roadmap — Flame in Freefall (NASA Space Apps 2026, San Luis)

Times are Argentina (UTC-3). Based on `docs/PLAYBOOK.md`.
**Verify dates, rules and judging criteria against the official 2026 guides** (spaceappschallenge.org): the playbook follows the 2025 guide.

Challenge: **Flame in Freefall** — already chosen. Phase 1 becomes "choose the solution", not "choose the challenge".
Main data source: NASA PSI Combustion Science repository (format, size and API availability **not yet verified**).

## Timeline

| When | Phase | Deliverable | Gate |
|---|---|---|---|
| Sat 14 — before 09:00 | 0. Prep | Team registered, San Luis venue, repo, channel, shared folder; skills & hours per member | Checklist done |
| Sat 09:00–11:00 | 1. Solution | Problem sentence, solution sentence, target user, concrete datasets (official links), scoring matrix | Decision by 11:00 |
| Sat 11:00–13:00 | 2. Scope | MVP (1–3 features: Must / Nice / No), stack, data-flow diagram, task split, OpenSpec changes | Specs ready |
| Sat 13:00–20:00 | 3a. Build | **Milestone 1 (Sat 20:00):** data pipeline end to end, even if ugly | Pipeline runs on `data/sample/` |
| Sun 08:00–12:00 | 3b. Build | **Milestone 2 (Sun 12:00):** all Must features done and deployed at a public URL | Public URL works |
| Sun 12:00–16:00 | 3c. Polish | Nice-to-haves only if Must is solid | **Feature freeze 16:00** |
| Sun 16:00–21:00 | 4. Demo | 30 s video (or ≤ 7 slides), subtitles, README, license | Demo link works in incognito |
| Sun 21:00–23:00 | 5. Submit | Project page in English, T&C ticked, **Submit** | Submitted **before 23:00** (deadline 23:59) |

Risk review every 4 hours. Blocked > 45 min → plan B (cached sample, mock, reduced scope).

## Phase 1 — Solution discovery (next step)
1. Read the resources in `Recursos/` and explore the PSI repository: what experiments, formats, sizes, units, terms.
2. Brainstorm 5+ ideas; shortlist 3–4.
3. Score each 1–5: team skills fit · data accessibility · MVP in ~30 h · impact/relevance (local angle: San Luis/Cuyo/Argentina) · visual potential for the 30 s demo.
4. Pick one; write: problem sentence, solution sentence, target user, datasets (with links).
5. Align with judging criteria from the 2026 Judging & Awards Guide (commonly impact, creativity, validity, relevance, presentation — confirm).

Candidate angles to start the discussion (not validated, need data check):
- Fire behavior in microgravity vs. on Earth — visual explorer of PSI experiments.
- Fire safety for spacecraft/habitats — risk or lessons-learned tool from Apollo 1, Apollo 13, Mir.
- Space-tech → Earth spinoffs (smoke detectors, firefighter gear) — education/outreach angle, wildfire relevance for Argentina.

## Phase 2 — Scope & architecture (template)
- MVP: Must / Nice to have / No.
- Stack: simplest the team already knows, free fast deploy (static site + notebook or light backend). One-line justification per piece.
- Data flow: source → processing → visualization/output.
- OpenSpec: one change per Must feature (`/openspec-propose`).
- Tasks per person with times.

## Open items
- [ ] Team members, skills, availability Sat/Sun
- [ ] Verify 2026 rules: demo limits, judging criteria, AI/logos policy in T&C
- [ ] Check Global Offers (free partner tools)
- [ ] Inspect PSI repository (formats, access, terms)
- [ ] Choose license
