import type { CatalogRecord } from '../../data/types';

export const MAX_SELECTED = 3;
export const MIN_TO_COMPARE = 2;

export const LIMIT_MESSAGE = `You can compare up to ${MAX_SELECTED} investigations. Remove one to add another.`;

// "#/compare?ids=PSI-159,PSI-25" keeps the selection in the address, so a copied link restores it.
export function parseSelection(query: URLSearchParams, known: string[]): string[] {
  const ids = (query.get('ids') ?? '').split(',').map((id) => id.trim()).filter((id) => known.includes(id));
  return [...new Set(ids)].slice(0, MAX_SELECTED);
}

export function compareHash(ids: string[]): string {
  return ids.length === 0 ? '#/compare' : `#/compare?ids=${ids.join(',')}`;
}

export type AddResult = { ids: string[]; message: string | null };

export function addToSelection(ids: string[], accession: string): AddResult {
  if (ids.includes(accession)) return { ids, message: null };
  if (ids.length >= MAX_SELECTED) return { ids, message: LIMIT_MESSAGE };
  return { ids: [...ids, accession], message: null };
}

export function removeFromSelection(ids: string[], accession: string): string[] {
  return ids.filter((id) => id !== accession);
}

// Case-insensitive match over accession, acronym and title; no search library.
export function searchInvestigations(records: CatalogRecord[], text: string): CatalogRecord[] {
  const needle = text.trim().toLowerCase();
  if (needle === '') return records;
  return records.filter((record) =>
    [record.accession, record.acronym, record.title].some((field) => field?.toLowerCase().includes(needle)),
  );
}
