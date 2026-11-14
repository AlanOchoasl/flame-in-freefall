# Design

## Context

26 investigations, each with objectives, approach, earth-benefits text (all 26) and hypothesis (25 of 26; PSI-108 lacks one). Objectives run 236–1,265 characters. The team has Gemini access **through an API key** (confirmed 2026-11-14). The 2026 Terms were read by the team and AI use is allowed; the use must be described on the project page. See proposal.md.

## Goals / Non-Goals

**Goals:** summaries a researcher can trust because each one is checkable against the source.
**Non-Goals:** new science, comparisons, or anything from outside the PSI text.

## Decisions

1. **Precomputed, static JSON.** No keys in the browser, no latency, works offline. Alternative (live calls): fragile demo and an exposed key.
2. **Generation by a script using the API key from `.env`** (ignored by git); drafts go to `data/ai/summaries.draft.json`. Pasting from the Gemini app stays as plan B. The SDK `@google/genai` exists on the registry (3.3.0, Apache-2.0, passes the license policy). **Not verified:** which model to use and how to request structured output. A search on 2026-11-14 found two documented styles (`responseJsonSchema` with `responseMimeType: "application/json"` in `generateContent`, and a newer Interactions API) and examples that disagree on model names, so the script task starts by reading Google's current documentation and picking one.
3. **Prompt kept at `prompts/summary.md`** and the model name in `ai.config.json`, so changing the model is a config edit; the prompt is versioned (`promptVersion`), one investigation per call, English output in plain language for students and engineers.
4. **Numeric guard:** extract numbers from the summary and require each to appear in the source text; strict and cheap, catches the most dangerous invention. It does not catch wrong words, so human review is required.
5. **Review:** a person reads each summary against the source and sets `reviewed: true`; about 26 reviews, a few minutes each.
6. **Check script in Node + TypeScript** (same setup as the other builds), run before every commit of `summaries.json` and in strict mode before submission.

Data flow: `catalog.json` text → prompt → Gemini → draft JSON → check script → human review → `data/processed/summaries.json` → app.

## Risks / Trade-offs

- [AI states something not in the text] → numeric guard, review gate, fallback to PSI text.
- [Review not finished in time] → unreviewed label stays visible; only reviewed ones are promoted in the demo; the rest fall back to PSI text.
- [API limits or model names differ from what the docs imply] → read the docs first; plan B is drafting by hand in the Gemini app.
- [A reviewer approves without reading] → the label says "reviewed", so the team must mean it.
- [Free-tier limits or model names differ from assumptions] → read the docs first; fall back to path (a).

## Open Questions

- Which model and which structured-output style: decided when the script is written, from Google's current documentation. It does not change the specs.
