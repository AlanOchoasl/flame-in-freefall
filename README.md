# Flame in Freefall

> NASA Space Apps Challenge 2026 · San Luis, Argentina · Challenge: **Flame in Freefall**

**Live demo:** https://alanochoasl.github.io/flame-in-freefall/ · **Not an official NASA product.**

## Problem
NASA's microgravity combustion results are public in the PSI repository, but they are hard to find, compare and interpret for fire safety in crewed spacecraft and Moon bases.

## Solution
A static web dashboard that ranks, compares and maps the 26 PSI combustion investigations by relevance to crew environments, with plain-language summaries that are always labeled as AI-generated.

## What it does
- **Console** (`#/ranking`, `#/compare` and `#/map` open it and scroll to a section): one research-console page in the style of `docs/design/direction-concept.html`. Four dataset tiles computed from the data; environment profiles (crew cabin, lunar base or pressurized rover, fire detection, fire suppression); the coverage map of oxygen and pressure for every real test from PSI-159 against the expected Moon-base atmosphere (30 % O2 or more, 10.2 psi or less), Earth air and the spacesuit atmosphere, with filters, a table view and a CSV download; a comparison of two or three investigations with same and differs marks; and a side column with the relevance ranking (every score with its breakdown, labeled as a team heuristic, not a NASA assessment), and a plain-language interpretation that opens in a dialog from each ranking row; the map card "What the data shows" gives the coverage gaps. It states that the mapped tests burn gaseous fuels and that PSI has no partial-gravity data.
- **Investigation detail** (`#/investigation/PSI-159`): summary, curated facts, test-condition ranges, ranking position in each profile, related investigations and the citation with its DOI.
- **About** (`#/about`): data sources, how AI was used, known limits and licenses.

The app runs from static files, makes no request outside its own origin and calls no AI service at runtime.

## Typography
The app bundles three Google Fonts locally so the demo works offline: [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) for page and section headings, [Inter](https://fonts.google.com/specimen/Inter) for interface text, and [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) for data and identifiers. All three use the SIL Open Font License 1.1; their copyright notices and full licenses ship alongside the font files in `app/public/fonts/`. The team approved this font license exception on 2026-11-14. See `THIRD_PARTY_LICENSES.md`.

Action icons use [Lucide React](https://lucide.dev/) (ISC license; some icons also carry Feather's MIT attribution). Named imports bundle only the icons used, with no runtime CDN request. See `THIRD_PARTY_LICENSES.md`.

## NASA data used
All data comes from the NASA Physical Sciences Informatics (PSI) Combustion Science repository: https://psi.nasa.gov/physci/repo/search?q=combustion

- **Catalog:** the 26 investigations returned by PSI's search, cached in `data/sample/psi-catalog/`. Each one links to its PSI page and DOI.
- **Test tables:** the experimental tables of PSI-159, cached in `data/sample/psi/` and normalized into `data/processed/experiments.json` (see `data/processed/README.md`).
- **Licenses of the cited datasets** (checked 2026-11-14, recorded in `experiments.json`): PSI-159 is CC0-1.0. **PSI-10 declares no license**, so its tables are excluded: the app uses no dataset without a verified license (see `data/processed/README.md`, "Excluded datasets").

## How AI was used
Plain-language summaries are written beforehand by a Gemini model from each investigation's own PSI text, checked by a script (no invented numbers, length limits), reviewed by a person and shown with the label "AI-generated", the model and the review status. When no summary exists, the app shows NASA's own text, labeled as PSI text. The prompt and scripts are in the repository (`prompts/`, `scripts/`, `docs/AI_SUMMARIES.md`); no API key is stored.

The team-provided project logos in `app/public/branding/` contain C2PA metadata identifying Claude as a creation tool. Dark and light SVG variants are provided for the full logo and icon; the icon is used in the favicon, header and footer according to the selected theme. These are project marks, not the official NASA insignia.

## Run locally
Needs Node 22 or newer.

```bash
npm ci
cd app
npm ci
npm run sync:data   # copies data/processed and data/ranking into app/public/data
npm run dev         # http://localhost:5173
```

Tests and checks, from the repository root:

```bash
npm test
npm run typecheck
cd app && npm run build
```

Rebuilding the data (offline, from the cached samples):

```bash
node scripts/catalog/cli.ts   # data/processed/catalog.json
npm run build:data            # data/processed/experiments.json
```

The public site is published to GitHub Pages from `main` by `.github/workflows/pages.yml` (https://alanochoasl.github.io/flame-in-freefall/; Settings > Pages > Source: "GitHub Actions"). The app uses relative paths, so the same build also works from the root of another host: `app/vercel.json` deploys it to Vercel (https://flame-in-freefall-indol.vercel.app), which stopped deploying on 2026-11-15 because of its build limit and may show an older version.

## More documentation
- `docs/EXTENDING.md`: add a screen, a ranking profile, a table mapper or an investigation.
- `docs/SMOKE.md`: manual checklist to run on the public URL.
- `docs/SUBMISSION.md`: the text for the Space Apps project page and the submission checklist.
- `docs/CURATION.md` and `docs/AI_SUMMARIES.md`: how tags and summaries are produced and reviewed.
- `openspec/`: the specifications behind each feature.

## License
Apache-2.0, see `LICENSE`. Third-party packages and their licenses: `THIRD_PARTY_LICENSES.md`.
