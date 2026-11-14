# AI summaries — working guide

Scope: `ai-summaries` tasks 1.1–1.3, 2.1–2.3 and 3.1. The app never calls an
AI service at runtime; summaries are precomputed, checked and reviewed.

## Files

| File | Purpose |
|---|---|
| `prompts/summary.md` | The exact prompt and its version (required by the spec). |
| `ai.config.json` | Model, prompt version, source fields and word limits. |
| `scripts/generate-summaries.ts` | Drafts one summary per investigation into the draft file. |
| `scripts/check-summaries.ts` | Validates schema, lengths, accessions, the numeric guard and strict mode. |
| `scripts/check-summaries.test.ts` | Unit tests for the checks. |
| `data/ai/summaries.draft.json` | Working drafts; entries start with `reviewed: false`. |
| `data/processed/summaries.json` | Final file consumed by the app (written by task 3.1). |

## Setup

```powershell
npm install
Copy-Item .env.example .env
# put GEMINI_API_KEY in .env; never commit it
npm test
```

`node` and `npm` must be on `PATH`. If PowerShell blocks `npm.ps1`, use
`npm.cmd` or run the commands from Git Bash.

## 1. Draft summaries

```powershell
# First 13 investigations in catalog order (task 2.1)
npm run generate:summaries -- --first 13

# Specific accessions
npm run generate:summaries -- --ids PSI-159,PSI-25

# Every investigation
npm run generate:summaries -- --all

# Inspect without calling the API
npm run generate:summaries -- --first 13 --dry-run

# Print the full prompt to paste into the Gemini app (plan B)
npm run generate:summaries -- --ids PSI-159 --print-prompt
```

The script merges by accession, keeps reviewed entries unless `--force` is
passed, and runs the check at the end. It writes model, date, prompt version,
source fields and `reviewed: false` for every entry.

## 2. Check

```powershell
npm run check:summaries
npm run check:summaries -- --strict
```

The check fails when:

- the schema version is not supported;
- an accession is unknown or duplicated;
- `summary` exceeds 120 words or `fireSafetyRelevance` exceeds 60;
- a text is empty;
- `aiGenerated` is not true, or model/date/prompt version/source fields are missing;
- a number in the text does not appear in that investigation's source text;
- `--strict` is used and any entry has `reviewed: false`.

The numeric guard ignores digits inside notation such as `O2`, `CO2`, `C2H4`
and `1g`. It does not catch numbers written with words; human review covers
that.

## 3. Review (task 2.3)

For each draft:

1. Open the investigation's PSI page and the source fields.
2. Read the summary against the source. No outside facts, no invented numbers,
   no safety claims, no recommendations.
3. Check the fire-safety relevance note: it must name prevention, detection,
   suppression or flame fundamentals only as the source supports it.
4. Fix the wording directly in `data/ai/summaries.draft.json`.
5. Set `reviewed: true` only when satisfied. A person must do this after
   reading; never flip it in bulk.

## 4. Publish (task 3.1)

Before submission, run `npm run check:summaries -- --strict`. Then write
`data/processed/summaries.json` from the reviewed entries only:

```powershell
npm run publish:summaries
```

The script checks the reviewed entries, writes the file and lists the entries
it left out. Unreviewed entries stay out; the app falls back to the PSI
objectives text, which the spec allows and expects. Run it again whenever more
drafts are reviewed, then `npm run sync:data` in `app/`.

## Plan B: no API key

Use `--print-prompt` with the accession, paste the prompt into the Gemini app,
and copy the JSON object into a new entry in
`data/ai/summaries.draft.json` with the same metadata fields. Then run the
check. The spec allows hand drafting; it does not allow skipping the check or
the human review.

## Troubleshooting

| Symptom | Action |
|---|---|
| `GEMINI_API_KEY is not set` | Create `.env` from `.env.example`; run via `npm run`. |
| Model not found / 404 | Change `model` in `ai.config.json` to an available model; re-run `--dry-run` first. |
| 429 / quota | Wait, reduce the selection, or use the Gemini app (plan B). |
| Over word limit | Edit that entry or regenerate it with `--ids` and `--force`. |
| Unknown accession | Use the accession from `data/sample/psi-catalog/investigations.json`. |
