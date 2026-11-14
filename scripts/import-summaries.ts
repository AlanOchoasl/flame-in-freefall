#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { loadCatalog } from "./lib/catalog.ts";
import { checkSummaries, formatIssues } from "./lib/check-summaries.ts";
import { mergeEntries } from "./lib/summaries-generation.ts";
import type { SummaryEntry, SummariesFile } from "./lib/types.ts";

const USAGE = `Usage: node scripts/import-summaries.ts <file> --model <name> [options]

Imports summaries drafted by hand in the Gemini app (plan B). <file> must be a
JSON object, an array, or { "entries": [...] } with:
  { "accession": "PSI-159", "summary": "...", "fireSafetyRelevance": "..." }

Options:
  --model <name>    model used in the app (required, so the label is honest)
  --out <path>      draft file (default: data/ai/summaries.draft.json)
  --force           replace entries that are already reviewed: true
  --help            show this message

Metadata (date, prompt version, source fields) comes from ai.config.json.
Every imported entry starts with reviewed: false.`;

interface Config {
  promptVersion: string;
  sourceFields: string[];
  maxWords: { summary: number; fireSafetyRelevance: number };
}

interface ImportedText {
  accession: string;
  summary: string;
  fireSafetyRelevance: string;
}

interface CliOptions {
  file: string;
  model: string;
  out: string;
  force: boolean;
}

function parseArgs(argv: string[]): CliOptions | null {
  const options: Partial<CliOptions> = {
    out: "data/ai/summaries.draft.json",
    force: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") return null;
    if (arg === "--force") {
      options.force = true;
      continue;
    }
    if (arg === "--model" || arg === "--out") {
      const value = argv[index + 1];
      if (!value) throw new Error(`${arg} requires a value`);
      index += 1;
      if (arg === "--model") options.model = value;
      if (arg === "--out") options.out = value;
      continue;
    }
    if (arg.startsWith("--")) throw new Error(`unknown option: ${arg}`);
    if (options.file) throw new Error(`unexpected argument: ${arg}`);
    options.file = arg;
  }

  if (!options.file) throw new Error("missing input file");
  if (!options.model) throw new Error("--model is required");

  return options as CliOptions;
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function importedTexts(value: unknown): ImportedText[] {
  const items = Array.isArray(value)
    ? value
    : value && typeof value === "object" && Array.isArray((value as { entries?: unknown }).entries)
      ? ((value as { entries: unknown[] }).entries)
      : [value];

  return items.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`entry ${index + 1} is not an object`);
    }
    const record = item as Record<string, unknown>;
    for (const field of ["accession", "summary", "fireSafetyRelevance"] as const) {
      if (typeof record[field] !== "string" || record[field].trim().length === 0) {
        throw new Error(`entry ${index + 1} is missing a non-empty "${field}"`);
      }
    }
    return {
      accession: String(record.accession).trim(),
      summary: String(record.summary).trim(),
      fireSafetyRelevance: String(record.fireSafetyRelevance).trim(),
    };
  });
}

function main(): number {
  let options: CliOptions | null;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error((error as Error).message);
    console.error(USAGE);
    return 1;
  }

  if (!options) {
    console.log(USAGE);
    return 0;
  }

  if (!existsSync(options.file)) {
    console.error(`File not found: ${options.file}`);
    return 1;
  }

  const config = readJson<Config>("ai.config.json");
  const imported = importedTexts(readJson<unknown>(options.file));
  const today = new Date().toISOString().slice(0, 10);

  const entries: SummaryEntry[] = imported.map((item) => ({
    accession: item.accession,
    summary: item.summary,
    fireSafetyRelevance: item.fireSafetyRelevance,
    aiGenerated: true,
    model: options.model,
    generatedAt: today,
    promptVersion: config.promptVersion,
    sourceFields: config.sourceFields as SummaryEntry["sourceFields"],
    reviewed: false,
  }));

  const existing: SummariesFile = existsSync(options.out)
    ? readJson<SummariesFile>(options.out)
    : { schemaVersion: "1.0.0", entries: [] };

  const sources = loadCatalog();
  const merged = mergeEntries(existing, entries, sources, options.force);
  for (const accession of merged.keptReviewed) {
    console.log(`  ${accession}: kept reviewed entry; use --force to replace it`);
  }

  writeFileSync(options.out, `${JSON.stringify(merged.file, null, 2)}\n`);
  console.log(`Imported ${entries.length} entries; ${merged.file.entries.length} in ${options.out}`);

  const check = checkSummaries(merged.file, sources, { maxWords: config.maxWords });
  if (check.issues.length > 0) {
    console.error(`\n${check.issues.length} issue(s):`);
    console.error(formatIssues(check.issues));
    return 1;
  }

  console.log("Check passed. Review each entry before setting reviewed: true.");
  return 0;
}

process.exitCode = main();
