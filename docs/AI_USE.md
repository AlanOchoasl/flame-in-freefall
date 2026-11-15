# How AI was used in this project

Text for the project page of the NASA Space Apps Challenge 2026 submission ("Flame in Freefall"). The figures in the table come from `data/processed/summaries.json` and are the same ones the About screen shows; update them whenever that file changes (`npm run publish:summaries`).

## In the product: plain-language summaries

| | |
|---|---|
| What AI wrote | A plain-language summary (at most 120 words) and a fire-safety note (at most 60 words) for each investigation |
| Model | Gemini `gemini-3.6-flash`, through the Gemini API |
| Prompt | `prompts/summary.md`, version 1.0.0 (`ai.config.json`) |
| Generated on | 2026-11-14 and 2026-11-15 |
| Summaries published | 25 of 26 investigations |
| Reviewed by a person | 25 of 25 |
| Not summarized | PSI-10 (it declares no license and is not used); it shows NASA's own text, labeled "NASA PSI text" |

How the text is produced and kept honest:

1. **Only NASA's text goes in.** The prompt receives the investigation's own objectives, approach, hypothesis and earth-benefits text from NASA PSI, and forbids facts from anywhere else.
2. **A script checks the output** (`npm run check:summaries`): word limits, known accession, required metadata, and a numeric guard that rejects any number in the summary that is not in the source text.
3. **A person reads every summary against the source** before it is marked `reviewed: true`. Only reviewed summaries are published to the app.
4. **It is always labeled.** The app shows "AI-generated (model), reviewed by a person" next to every summary, and "NASA PSI text" where it shows NASA's words instead.
5. **No AI runs in the app.** The summaries are precomputed static data; the app calls no AI service, makes no request outside its own origin and stores no API key.

## What AI did not do

- The test data, the dataset totals and the coverage map come from NASA PSI tables and are computed by ordinary code.
- The ranking is a rule-based heuristic written by the team (weights and rationale are on screen). It is not an AI output and not a NASA rating.
- The curated tags (fuel phase, topics, measurements) were read from the PSI text and reviewed by team members.

## In the development process

- **Claude Code (by Anthropic)** helped the team write code, tests, the OpenSpec change documents and the project documentation. The team directed the work, ran the tests and the license checks, and reviewed and merged every change. The commits carry a "Co-Authored-By" line that records it.
- The same assistant produced a Spanish reading aid used only inside the team to review the summaries (`docs/review-summaries-es.html`). It is not part of the app and was not reviewed by a person as a translation.
- The project logos in `app/public/branding/` were made with an AI tool; their C2PA metadata says so. They are project marks, not NASA insignia.

## Known limits

- A summary repeats what NASA's text says, including its inconsistencies. Example: the PSI-39 record gives a pressure range of 0.25–5 atm in its objectives and 0.25–0.5 atm in its approach, and calls one diluent "atomic nitrogen"; the summary follows the record. Checked against the live PSI record on 2026-11-15.
- The numeric guard does not catch a wrong word. Human review reduces that risk and does not remove it. Treat the NASA text and the DOI of each investigation as the reference.
