# AGENTS.md — Flame in Freefall (NASA Space Apps 2026, San Luis)

Hackathon project for the NASA Space Apps Challenge 2026, challenge **"Flame in Freefall"**
(combustion science in microgravity). Data source: NASA PSI Combustion Science repository
(https://psi.nasa.gov/physci/repo/search?q=combustion). Event: Nov 14–15, 2026. Argentina time (UTC-3).

Full event rules, phases and response format: `docs/PLAYBOOK.md` (read it first).
Timeline and milestones: `docs/ROADMAP.md`. Resources: `Recursos/`.

## Operating rules
1. Talk to the team in **Spanish**; write **code, README, commits, specs and project page in English**.
2. Priority: a working, well-presented MVP over an ambitious half-built one.
3. **Never invent** datasets, endpoints, URLs, functions or API parameters. If unsure, say so and
   check the official docs. Mark uncertain numbers as "approximately".
4. If information is missing, ask — but propose a default and keep moving.
5. Every reply starts with: **Phase | Time to next milestone | Main risk**, and ends with **Next step** (one action, one owner).
6. Blocked > 45 min → propose plan B (cached sample data, mock, reduced scope).
7. **Feature freeze: Sunday 16:00.** After that, bug fixes only. Submit before **Sunday 23:00** (deadline 23:59).

## Workflow (spec-driven, OpenSpec)
- Plan with OpenSpec before coding: `/openspec-explore` → `/openspec-propose "<idea>"` → `/openspec-apply-change` → `/openspec-archive-change`.
- Keep changes small (1 change = 1 Must feature). Specs live in `openspec/`.
- Don't start implementing from a proposal without explicit go-ahead from the team.

## Code standards (details in `.claude/skills/`)
- Simplest stack the team already knows. No new dependency without a one-line justification.
- Clean code: small functions, intention-revealing names, no dead code, no speculative abstractions.
- Small, frequent commits (Conventional Commits). No big refactors during the event.
- Built to grow, cheaply: lists that vary (profiles, vocabularies, outcomes) live in data files; all data goes through one data-access module; every data file has a `schemaVersion`. No plugin systems, no speculative abstractions (see `docs/EXTENDING.md` once written).
- Tests only where they protect the demo path (data parsing, core calculation).
- Cache small data samples in `data/sample/` so the demo never depends on live network.
- No secrets in the repo. Use `.env` (ignored) and `.env.example`.

## Data & compliance
- Cite the official source (with link) for every NASA/partner dataset used. Show it in the demo.
- Before using generative AI output, NASA logos/images, or minors' data, check the 2026 Terms & Conditions.
- NASA does not endorse non-US sites; respect each data site's usage terms.
- 2026 Terms & Conditions (https://www.spaceappschallenge.org/legal/, updated 2026-08-07), minimum obligations:
  - Original content must be open source (OSI) or freely available; if no license is declared NASA applies Apache 2.0. Declare one in the repo.
  - Third-party non-NASA materials (npm packages, fonts, etc.) must be free/open; **list their licenses in the submitted documentation**.
  - Cite every source used (the submission form asks for references), even open ones: PSI investigation + DOI.
  - Video: original work, no third-party music/images, no names/voices/likeness of anyone under 18, written consent from any adult shown.
  - No personal data, no commercial promotion.
  - The team confirmed AI/SI use is allowed. Still describe how AI was used in the project page; label AI-generated text in the UI.

## Dependencies & third-party materials (hard rules for humans and agents)
Full procedure: `.claude/skills/dependency-policy/`.
1. **Never add a dependency, font, icon, image or dataset without checking its license first.** Allowed list: `scripts/license-policy.json` (MIT, ISC, BSD-2/3-Clause, Apache-2.0, 0BSD, CC0-1.0, Unlicense, BlueOak-1.0.0).
2. **Forbidden without explicit team approval:** GPL/AGPL/LGPL, any package with no license, "UNLICENSED", "SEE LICENSE IN…", proprietary or paid SDKs, anything needing a paid or private API key at runtime.
3. Run `node scripts/check-licenses.mjs` after every `npm install`/`npm add`. If it fails, remove the package or ask the team. An agent MUST NOT edit `approvedExceptions` on its own.
4. Before submission run `node scripts/check-licenses.mjs --write` and commit `THIRD_PARTY_LICENSES.md`.
5. No assets (images, fonts, audio, NASA logos) without a verified license; no code copied from sources with unknown license; cite everything in README.
6. Prefer fewer dependencies. One-line justification per new package in the PR/commit.

## Skills available
`clean-code`, `git-workflow`, `testing-basics`, `nasa-data-sources`, `submission-check`, `dependency-policy`, plus the OpenSpec skills.
