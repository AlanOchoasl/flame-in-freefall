#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { GoogleGenAI } from "@google/genai";
import { loadCatalog } from "./lib/catalog.ts";
import { checkSummaries, formatIssues, wordCount } from "./lib/check-summaries.ts";
import {
  fillPrompt,
  mergeEntries,
  parseModelOutput,
  RESPONSE_SCHEMA,
} from "./lib/summaries-generation.ts";
import type { GeneratedText } from "./lib/summaries-generation.ts";
import { SOURCE_FIELDS } from "./lib/types.ts";
import type { InvestigationSource, SummaryEntry, SummariesFile } from "./lib/types.ts";

const USAGE = `Usage: npm run generate:summaries -- <selection> [options]

Selection (choose one):
  --ids PSI-159,PSI-25   generate exactly these accessions
  --first 13             first N investigations in catalog order
  --all                  every investigation in the catalog

Options:
  --out <path>           draft file (default: data/ai/summaries.draft.json)
  --catalog <path>       catalog JSON file (default: processed catalog, else PSI cache)
  --force                regenerate entries even if reviewed: true
  --dry-run              print what would be sent, do not call the API
  --print-prompt         print the full prompt for pasting into the Gemini app
  --help                 show this message

Environment:
  GEMINI_API_KEY         required unless --dry-run; put it in .env (ignored by git)`;

interface Config {
  model: string;
  promptFile: string;
  promptVersion: string;
  sourceFields: string[];
  maxWords: { summary: number; fireSafetyRelevance: number };
}

interface CliOptions {
  ids?: string[];
  first?: number;
  all?: boolean;
  out: string;
  catalog?: string;
  force: boolean;
  dryRun: boolean;
  printPrompt: boolean;
}

function parseArgs(argv: string[]): CliOptions | null {
  const options: CliOptions = {
    out: "data/ai/summaries.draft.json",
    force: false,
    dryRun: false,
    printPrompt: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") return null;
    if (arg === "--force") {
      options.force = true;
      continue;
    }
    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }
    if (arg === "--print-prompt") {
      options.printPrompt = true;
      continue;
    }
    if (arg === "--all") {
      options.all = true;
      continue;
    }
    if (arg === "--ids" || arg === "--first" || arg === "--out" || arg === "--catalog") {
      const value = argv[index + 1];
      if (!value) throw new Error(`${arg} requires a value`);
      index += 1;
      if (arg === "--ids") options.ids = value.split(",").map((id) => id.trim()).filter(Boolean);
      if (arg === "--first") options.first = Number(value);
      if (arg === "--out") options.out = value;
      if (arg === "--catalog") options.catalog = value;
      continue;
    }
    throw new Error(`unknown argument: ${arg}`);
  }

  const selections = [options.ids ? 1 : 0, options.first !== undefined ? 1 : 0, options.all ? 1 : 0];
  if (selections.reduce((sum, value) => sum + value, 0) !== 1) {
    throw new Error("choose exactly one of --ids, --first or --all");
  }
  if (options.first !== undefined && (!Number.isInteger(options.first) || options.first < 1)) {
    throw new Error("--first must be a positive integer");
  }

  return options;
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

async function generateOne(
  client: GoogleGenAI,
  model: string,
  prompt: string,
): Promise<GeneratedText> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const response = await client.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: 0.2,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
          responseJsonSchema: RESPONSE_SCHEMA,
        },
      });
      return parseModelOutput(response.text);
    } catch (error) {
      lastError = error;
      if (attempt === 1) {
        console.warn(`  attempt 1 failed, retrying: ${(error as Error).message}`);
      }
    }
  }

  throw lastError;
}

function selectInvestigations(
  catalog: InvestigationSource[],
  options: CliOptions,
): InvestigationSource[] {
  if (options.ids) {
    const byAccession = new Map(catalog.map((item) => [item.accession, item]));
    const missing = options.ids.filter((id) => !byAccession.has(id));
    if (missing.length > 0) {
      throw new Error(`accessions not in the catalog: ${missing.join(", ")}`);
    }
    return options.ids.map((id) => byAccession.get(id)!);
  }

  if (options.all) return catalog;
  return catalog.slice(0, options.first);
}

async function main(): Promise<number> {
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

  const config = readJson<Config>("ai.config.json");
  const validSourceFields =
    Array.isArray(config.sourceFields) &&
    config.sourceFields.length === SOURCE_FIELDS.length &&
    SOURCE_FIELDS.every((field) => config.sourceFields.includes(field));
  if (!config.model || !config.promptVersion || !validSourceFields) {
    console.error(
      `ai.config.json must define model, promptVersion and exactly: ${SOURCE_FIELDS.join(", ")}`,
    );
    return 1;
  }

  const template = readFileSync(config.promptFile, "utf8");
  const promptVersion = /^---[\s\S]*?^version:\s*(\S+)\s*$/m.exec(template)?.[1];
  if (promptVersion !== config.promptVersion) {
    console.error(
      `Prompt version mismatch: ${config.promptFile} says ${promptVersion ?? "none"}, ai.config.json says ${config.promptVersion}.`,
    );
    return 1;
  }
  const promptBody = template.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");

  const catalog = loadCatalog(options.catalog);
  const selected = selectInvestigations(catalog, options);

  if (options.printPrompt) {
    for (const investigation of selected) {
      console.log(`\n===== ${investigation.accession} =====\n`);
      console.log(fillPrompt(promptBody, investigation));
    }
    return 0;
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!options.dryRun && !apiKey) {
    console.error(
      "GEMINI_API_KEY is not set. Copy .env.example to .env, fill the key, and run again.",
    );
    return 1;
  }

  console.log(
    `Model: ${config.model} | prompt ${config.promptVersion} | ${selected.length} investigation(s)`,
  );

  const client = options.dryRun ? null : new GoogleGenAI({ apiKey });
  const generated: SummaryEntry[] = [];
  const failures: string[] = [];
  const today = new Date().toISOString().slice(0, 10);

  for (const investigation of selected) {
    const prompt = fillPrompt(promptBody, investigation);

    if (options.dryRun) {
      console.log(
        `  ${investigation.accession}: ${prompt.length} prompt chars; source fields ${config.sourceFields.join(", ")}`,
      );
      continue;
    }

    console.log(`  ${investigation.accession}: generating...`);
    try {
      const output = await generateOne(client!, config.model, prompt);
      const summaryWords = wordCount(output.summary);
      const relevanceWords = wordCount(output.fireSafetyRelevance);
      const overLimit =
        summaryWords > config.maxWords.summary ||
        relevanceWords > config.maxWords.fireSafetyRelevance;

      generated.push({
        accession: investigation.accession,
        summary: output.summary,
        fireSafetyRelevance: output.fireSafetyRelevance,
        aiGenerated: true,
        model: config.model,
        generatedAt: today,
        promptVersion: config.promptVersion,
        sourceFields: config.sourceFields as SummaryEntry["sourceFields"],
        reviewed: false,
      });

      console.log(
        `    summary ${summaryWords}/${config.maxWords.summary} words, relevance ${relevanceWords}/${config.maxWords.fireSafetyRelevance} words${overLimit ? " (OVER LIMIT: edit or regenerate)" : ""}`,
      );
    } catch (error) {
      failures.push(`${investigation.accession}: ${(error as Error).message}`);
      console.error(`    failed: ${(error as Error).message}`);
    }
  }

  if (options.dryRun) {
    console.log("Dry run: no API calls, no files written.");
    return 0;
  }

  const existing: SummariesFile = existsSync(options.out)
    ? readJson<SummariesFile>(options.out)
    : { schemaVersion: "1.0.0", entries: [] };

  const merged = mergeEntries(existing, generated, catalog, options.force);
  for (const accession of merged.keptReviewed) {
    console.log(`  ${accession}: kept reviewed entry; use --force to regenerate`);
  }
  writeFileSync(options.out, `${JSON.stringify(merged.file, null, 2)}\n`);
  console.log(`Wrote ${merged.file.entries.length} entries to ${options.out}`);

  const check = checkSummaries(merged.file, catalog, {
    maxWords: config.maxWords,
  });
  if (check.issues.length > 0) {
    console.error(`\n${check.issues.length} issue(s) remain:`);
    console.error(formatIssues(check.issues));
  } else {
    console.log("Check passed.");
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} generation failure(s):`);
    for (const failure of failures) console.error(`  ${failure}`);
  }

  return failures.length > 0 || check.issues.length > 0 ? 1 : 0;
}

process.exitCode = await main();
