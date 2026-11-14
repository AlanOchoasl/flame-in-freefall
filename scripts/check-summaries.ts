#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { loadCatalog } from "./lib/catalog.ts";
import { checkSummaries, formatIssues } from "./lib/check-summaries.ts";
import type { CheckOptions } from "./lib/types.ts";

const USAGE = `Usage: node scripts/check-summaries.ts [file] [options]

Arguments:
  file                 summaries JSON file (default: data/ai/summaries.draft.json)

Options:
  --strict             fail while any entry has reviewed: false
  --catalog <path>     catalog JSON file (default: processed catalog, else PSI cache)
  --help               show this message

Exit code 1 when any check fails.`;

interface CliOptions {
  file: string;
  catalog?: string;
  strict: boolean;
}

function parseArgs(argv: string[]): CliOptions | null {
  const options: CliOptions = {
    file: "data/ai/summaries.draft.json",
    strict: false,
  };
  let positionalSeen = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") return null;
    if (arg === "--strict") {
      options.strict = true;
      continue;
    }
    if (arg === "--catalog") {
      const value = argv[index + 1];
      if (!value) throw new Error("--catalog requires a path");
      options.catalog = value;
      index += 1;
      continue;
    }
    if (arg.startsWith("--")) throw new Error(`unknown option: ${arg}`);
    if (!positionalSeen) {
      options.file = arg;
      positionalSeen = true;
    } else {
      throw new Error(`unexpected argument: ${arg}`);
    }
  }

  return options;
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
    console.error("Generate a draft first with: npm run generate:summaries -- --first 13");
    return 1;
  }

  let file: unknown;
  try {
    file = JSON.parse(readFileSync(options.file, "utf8"));
  } catch (error) {
    console.error(`Cannot read ${options.file}: ${(error as Error).message}`);
    return 1;
  }

  const catalog = loadCatalog(options.catalog);
  const checkOptions: CheckOptions = {
    strict: options.strict,
    maxWords: JSON.parse(readFileSync("ai.config.json", "utf8")).maxWords,
  };
  const result = checkSummaries(file, catalog, checkOptions);

  console.log(`Checked ${result.checked} summaries against ${catalog.length} investigations.`);

  if (result.issues.length > 0) {
    console.error(`\n${result.issues.length} issue(s):`);
    console.error(formatIssues(result.issues));
    return 1;
  }

  console.log(options.strict ? "OK: every summary is reviewed." : "OK: no issues found.");
  return 0;
}

process.exitCode = main();
