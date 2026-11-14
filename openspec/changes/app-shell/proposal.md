# Proposal

**Label: Must**

## Why

The four views (ranking, comparator, coverage map, summaries) need one web app that loads the data, navigates between views, labels AI text, cites NASA, and runs from a public URL. Without a shared shell each view would reinvent these.

## What Changes

- A static React + TypeScript + Vite app in `app/`, with hash-based navigation between four views and an About section.
- Loads `catalog.json`, `experiments.json` and `summaries.json` as static files; one failed file must not break the other views.
- Shared pieces: AI-generated label, PSI citation/link, and a "not available" display that always says why.
- Works offline and is deployed to a public URL.

## Capabilities

### New Capabilities
- `dashboard-app`: the web app frame: navigation, data loading, shared labels and citations, offline behavior and public deployment.

### Modified Capabilities
<!-- none -->

## Impact

- New `app/` directory, `package.json` dependencies (React, Vite, TypeScript, Recharts), a public hosting target.
- Consumes: `investigation-catalog`, `data-pipeline`, `ai-summaries` outputs.
- Terms: third-party licenses must pass `scripts/check-licenses.mjs`; see Design for one dependency needing a team decision.

## Out of scope (No)

The content of each view, a backend, user accounts, analytics, remote fonts or CDN scripts, runtime calls to any AI service.
