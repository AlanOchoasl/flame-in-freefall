---
name: dependency-policy
description: License rules for adding dependencies, fonts, assets or datasets. Use BEFORE running npm install/add, adding a CDN script, font, image, icon or any third-party code or data.
---

# Dependency policy

Why: the 2026 Space Apps Terms & Conditions require third-party (non-NASA) materials to be freely available or OSI open source, require their licenses to be identified in the submitted documentation, and require citing every source. NASA may reject a solution or remove awards otherwise.

## Before adding anything
1. Is it needed? Prefer the standard library or code we already have.
2. Find its license (its `package.json` `license` field and `LICENSE` file). Do not guess from memory.
3. Allowed list: `scripts/license-policy.json`. Permissive only (MIT, ISC, BSD-2/3-Clause, Apache-2.0, 0BSD, CC0-1.0, Unlicense, BlueOak-1.0.0).
4. **Not allowed without explicit team approval:** GPL/AGPL/LGPL; no license / "UNLICENSED" / "SEE LICENSE IN…"; proprietary or paid SDKs; anything needing a paid/private API key at runtime; assets or code of unknown origin.
5. Install, then run `node scripts/check-licenses.mjs`. Exit code 1 = remove the package or ask the team.

## Rules for agents
- Never edit `approvedExceptions` in `scripts/license-policy.json` yourself: ask the team and state the package, its license and why it is needed.
- Don't load scripts, styles or fonts from a CDN without verifying their license; prefer local npm packages so the demo works offline.
- Don't use NASA logos or imagery before checking the 2026 T&C and NASA usage guidelines.
- If you cannot verify a license, say so and stop; do not install "just to try".
- Mention every new third-party package, with its license and a one-line reason, in the commit message body.

## Before submission
- `node scripts/check-licenses.mjs --write` → commit `THIRD_PARTY_LICENSES.md`.
- Add the cited sources (PSI investigations + DOI, libraries) to the references field.
- Limitation: the script reads `node_modules` only. Fonts, images, CDN files and data are checked by hand.
