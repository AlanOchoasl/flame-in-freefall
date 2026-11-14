#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { loadCatalog } from "./lib/catalog.ts";

const USAGE = `Usage: node scripts/check-curation.ts [options]

Validates data/curation/investigations.curation.json against the catalog and
data/curation/vocabularies.json. This is the pre-build check for task 4.1.

Options:
  --strict   fail while any curated value has reviewed: false
  --help     show this message`;

interface CuratedValue {
  value: string[];
  source: string;
  reviewed: boolean;
}

interface CurationFile {
  schemaVersion?: string;
  entries?: Record<string, Record<string, CuratedValue>>;
}

interface Vocabularies {
  hardwareGroup: string[];
  fuelPhase: string[];
  topics: string[];
}

const SINGLE_VALUE_FIELDS = new Set(["hardwareGroup"]);
const LIST_VALUE_FIELDS = new Set(["fuelPhase", "topics"]);
const OPTIONAL_FIELDS = new Set(["hardwareGroup"]);

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function main(): number {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(USAGE);
    return 0;
  }
  const strict = process.argv.includes("--strict");
  const curationPath = "data/curation/investigations.curation.json";
  const vocabulariesPath = "data/curation/vocabularies.json";

  if (!existsSync(curationPath) || !existsSync(vocabulariesPath)) {
    console.error(`Missing ${curationPath} or ${vocabulariesPath}.`);
    return 1;
  }

  const catalog = loadCatalog();
  const accessions = new Set(catalog.map((item) => item.accession));
  const curation = readJson<CurationFile>(curationPath);
  const vocabularies = readJson<Vocabularies>(vocabulariesPath);
  const errors: string[] = [];
  let values = 0;
  let reviewed = 0;
  let unreviewed = 0;

  if (!curation.entries || typeof curation.entries !== "object") {
    console.error("Curation file must contain an entries object.");
    return 1;
  }

  for (const [accession, fields] of Object.entries(curation.entries)) {
    if (!accessions.has(accession)) {
      errors.push(`${accession}: accession is not in the catalog`);
      continue;
    }

    if (fields === null || typeof fields !== "object") {
      errors.push(`${accession}: entry must be an object`);
      continue;
    }

    for (const [field, curated] of Object.entries(fields)) {
      if (!SINGLE_VALUE_FIELDS.has(field) && !LIST_VALUE_FIELDS.has(field) && field !== "measurements") {
        errors.push(`${accession}: unknown field "${field}"`);
        continue;
      }

      const label = `${accession}.${field}`;
      if (curated === null || typeof curated !== "object") {
        errors.push(`${label}: must be an object with value, source and reviewed`);
        continue;
      }

      values += 1;
      if (curated.reviewed === true) reviewed += 1;
      else unreviewed += 1;

      if (typeof curated.reviewed !== "boolean") {
        errors.push(`${label}: reviewed must be a boolean`);
      }
      if (typeof curated.source !== "string" || curated.source.trim().length === 0) {
        errors.push(`${label}: source must say which text the value came from`);
      }
      if (!Array.isArray(curated.value)) {
        errors.push(`${label}: value must be an array`);
        continue;
      }

      if (field === "measurements") {
        if (curated.value.some((item) => typeof item !== "string" || item.trim().length === 0)) {
          errors.push(`${label}: every measurement must be a non-empty string`);
        }
        continue;
      }

      if (field === "hardwareGroup" && curated.value.length !== 1) {
        errors.push(`${label}: hardwareGroup must have exactly one value`);
      }

      const allowed = new Set(vocabularies[field as keyof Vocabularies]);
      for (const item of curated.value) {
        if (typeof item !== "string" || !allowed.has(item)) {
          errors.push(`${label}: "${String(item)}" is not in the vocabulary`);
        }
      }

      if (curated.value.length === 0 && !OPTIONAL_FIELDS.has(field)) {
        errors.push(`${label}: value must not be empty`);
      }
    }
  }

  console.log(`Curation: ${Object.keys(curation.entries).length} investigations, ${values} values.`);
  console.log(`Reviewed: ${reviewed}; unreviewed: ${unreviewed}.`);

  if (errors.length > 0) {
    console.error(`\n${errors.length} error(s):`);
    for (const error of errors) console.error(`  ${error}`);
    return 1;
  }

  if (strict && unreviewed > 0) {
    console.error(`\nStrict mode: ${unreviewed} value(s) are still unreviewed.`);
    return 1;
  }

  console.log("OK: curation matches the catalog and vocabularies.");
  return 0;
}

process.exitCode = main();
