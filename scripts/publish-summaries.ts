#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { loadCatalog } from "./lib/catalog.ts";
import { checkSummaries, formatIssues } from "./lib/check-summaries.ts";
import { leftOut, reviewedOnly } from "./lib/publish-summaries.ts";
import type { SummariesFile } from "./lib/types.ts";

const DRAFT = "data/ai/summaries.draft.json";
const OUT = "data/processed/summaries.json";

const USAGE = `Usage: node scripts/publish-summaries.ts

Writes ${OUT} from the reviewed entries of ${DRAFT}.
Unreviewed entries stay out; the app falls back to the PSI text for them.
Fails if a reviewed entry does not pass the summary checks.`;

function main(): number {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(USAGE);
    return 0;
  }

  const draft = JSON.parse(readFileSync(DRAFT, "utf8")) as SummariesFile;
  const published = reviewedOnly(draft);
  if (published.entries.length === 0) {
    console.error(`No reviewed entries in ${DRAFT}; nothing to publish.`);
    return 1;
  }

  const maxWords = JSON.parse(readFileSync("ai.config.json", "utf8")).maxWords;
  const result = checkSummaries(published, loadCatalog(), { strict: true, maxWords });
  if (result.issues.length > 0) {
    console.error(`${result.issues.length} issue(s):\n${formatIssues(result.issues)}`);
    return 1;
  }

  writeFileSync(OUT, `${JSON.stringify(published, null, 2)}\n`);
  const skipped = leftOut(draft);
  console.log(`Wrote ${OUT}: ${published.entries.length} reviewed summaries.`);
  if (skipped.length > 0) console.log(`Left out (unreviewed): ${skipped.join(", ")}`);
  return 0;
}

process.exitCode = main();
