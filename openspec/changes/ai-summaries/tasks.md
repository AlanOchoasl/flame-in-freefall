# Tasks

Tasks are **not pre-assigned**. Each person claims a module (a numbered group) in the team channel before starting. Times are Saturday 14 Nov (Sunday where stated), Argentina, and are deadlines for the milestone, not per person; `≤Xh` is a cap per task. Plan B for every task: summaries can be drafted by hand in the Gemini app with no key, and the app falls back to PSI text when a summary is missing.

## 1. Prompt and checks

Depends on: `investigation-catalog` types and stub (task 1.1).

- [x] 1.1 (by 17:00, ≤1h) Write `prompts/summary.md` (grounding rules, length limits, output format, version) and the draft file format; verify by running it by hand on two investigations and reading both against the source.
- [x] 1.2 (by 18:30, ≤2h) Write the check script (schema, word limits, unknown accession, numeric guard, strict mode) with unit tests for an invented number, an over-length text and an unknown accession; verify all tests pass and strict mode fails on an unreviewed entry.

- [x] 1.3 (by 18:30, ≤1.5h) Read Google's current Gemini API documentation, choose the model and the structured-output style, and write the generation script (API key read from the environment, `.env` ignored by git, one investigation per call, output to the draft file, prompt version recorded); verify it produces a valid draft for two investigations and that `node scripts/check-licenses.mjs` still passes with `@google/genai` installed. Plan B: draft by hand in the Gemini app.

## 2. Drafting and review

Depends on: 1.1. Tasks 2.1 and 2.2 are independent; split by accession range.

- [x] 2.1 (Sat by 20:00, ≤2h) Draft summaries for the first 13 investigations with Gemini (app or API, per team decision) into the draft file; verify the check script passes on them.
- [ ] 2.2 (Sat by 20:00, ≤2h) Same for the last 13 investigations; verify the check script passes.
- [ ] 2.3 (Sun by 11:00, ≤3h) Review each draft against its source, fix wording, set `reviewed: true` only when satisfied; verify strict mode lists only the entries not yet reviewed. Plan B: leave unreviewed ones labeled, or drop them so the app falls back to PSI text.

## 3. Output and use

Depends on: 1.2, 2.x and `app-shell` 4.1.

- [ ] 3.1 (Sun by 11:30, ≤30 min) Write `data/processed/summaries.json` from the reviewed drafts; verify the app shows the AI label with model name and review status.
- [ ] 3.2 (Sun by 14:00, ≤30 min) Collect model, dates and prompt version into the AI-use description for the project page; verify the text matches the file.
- [ ] 3.3 (Sun by 14:00, ≤15 min) Confirm no keys are in the repo and `.env` is ignored; verify with a search of the repo.

## Workflow follow-up

- Archive the change after milestone 2 (Sunday 12:00) is met and the strict check passes before submission.
