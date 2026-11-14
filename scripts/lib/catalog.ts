import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { InvestigationSource } from "./types.ts";

interface RawRecord {
  accession?: unknown;
  Accession?: unknown;
  title?: unknown;
  Title?: unknown;
  objectives?: unknown;
  Objectives?: unknown;
  approach?: unknown;
  Approach?: unknown;
  hypothesis?: unknown;
  Hypothesis?: unknown;
  earthBenefits?: unknown;
  "Research Impacts/Earth Benefits"?: unknown;
}

const PROCESSED_CATALOG = join("data", "processed", "catalog.json");
const CACHED_CATALOG = join("data", "sample", "psi-catalog", "investigations.json");

export function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

function recordsOf(value: unknown): RawRecord[] {
  if (Array.isArray(value)) return value as RawRecord[];
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of ["records", "investigations", "data"]) {
      if (Array.isArray(record[key])) return record[key] as RawRecord[];
    }
  }
  throw new Error("Catalog file does not contain an array of investigations.");
}

function toSource(record: RawRecord): InvestigationSource {
  return {
    accession: text(record.accession ?? record.Accession),
    title: text(record.title ?? record.Title),
    objectives: text(record.objectives ?? record.Objectives),
    approach: text(record.approach ?? record.Approach),
    hypothesis: text(record.hypothesis ?? record.Hypothesis),
    earthBenefits: text(
      record.earthBenefits ?? record["Research Impacts/Earth Benefits"],
    ),
  };
}

/**
 * Reads the processed catalog when it exists, otherwise the committed PSI cache.
 * The cache keeps this script usable before the catalog build lands.
 */
export function loadCatalog(path?: string): InvestigationSource[] {
  const chosen = path ?? (existsSync(PROCESSED_CATALOG) ? PROCESSED_CATALOG : CACHED_CATALOG);
  const records = recordsOf(readJson(chosen)).map(toSource);
  const unique = new Map(records.map((record) => [record.accession, record]));
  return [...unique.values()];
}
