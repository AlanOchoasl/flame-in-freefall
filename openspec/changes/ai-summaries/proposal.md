# Proposal

**Label: Must**

## Why

The challenge asks the dashboard to "interpret" findings, and the PSI text is dense. A plain-language summary per investigation makes it usable for students and engineers, but AI text can invent facts. The summaries must be grounded, checkable, reviewed and labeled.

## What Changes

- Generate a short plain-language summary and a fire-safety relevance note for each investigation, **before** the demo, from that investigation's own PSI text only.
- Store them in `data/processed/summaries.json` with model, date, prompt version and a `reviewed` flag; keep the prompt in the repo.
- A check script rejects summaries that contain numbers not present in the source text, are too long, or name unknown accessions.
- The app never calls AI at runtime; when a summary is missing it shows the PSI text instead.

## Capabilities

### New Capabilities
- `ai-summaries`: grounded, reviewed, labeled plain-language summaries of PSI investigations.

### Modified Capabilities
<!-- none -->

## Impact

- New prompt file, draft/review workflow, check script, `summaries.json`; used by Ranking cards, Compare and Detail.
- Source text: the catalog fields objectives, approach, hypothesis and earth benefits from PSI (https://psi.nasa.gov/physci/repo/search?q=combustion).
- The team has Gemini access (app or API: unconfirmed). Model and API details must be checked in Google's documentation before any script is written.

## Out of scope (No)

Runtime AI calls, AI-generated numbers or charts, summaries of test rows, ranking by AI, translation.
