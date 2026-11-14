import type { SummariesFile } from "./types.ts";

/** Keeps only the entries a person has read against the source (`reviewed: true`). */
export function reviewedOnly(file: SummariesFile): SummariesFile {
  return {
    schemaVersion: file.schemaVersion,
    entries: file.entries.filter((entry) => entry.reviewed === true),
  };
}

/** Accessions left out of the published file because nobody has reviewed them yet. */
export function leftOut(file: SummariesFile): string[] {
  return file.entries.filter((entry) => entry.reviewed !== true).map((entry) => entry.accession);
}
