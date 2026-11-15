export const MAX_SELECTED = 3;
export const MIN_TO_COMPARE = 2;

export const LIMIT_MESSAGE = `You can compare up to ${MAX_SELECTED} investigations. Remove one to add another.`;

// "?ids=PSI-159,PSI-25" keeps the selection in the address, so a copied link restores it. The address is
// written by `replaceExplorerState` (router/explorerQuery.ts).
export function parseSelection(query: URLSearchParams, known: string[]): string[] {
  const ids = (query.get('ids') ?? '').split(',').map((id) => id.trim()).filter((id) => known.includes(id));
  return [...new Set(ids)].slice(0, MAX_SELECTED);
}

export type AddResult = { ids: string[]; message: string | null };

export function addToSelection(ids: string[], accession: string): AddResult {
  if (ids.includes(accession)) return { ids, message: null };
  if (ids.length >= MAX_SELECTED) return { ids, message: LIMIT_MESSAGE };
  return { ids: [...ids, accession], message: null };
}

export const SLOT_COUNT = MAX_SELECTED;

/** The investigation chosen in each menu, '' when empty. The comparison fills the menus from the first. */
export const slotsFromIds = (ids: string[]): string[] => Array.from({ length: SLOT_COUNT }, (_, index) => ids[index] ?? '');

/** The comparison after menu `slot` (0 to 2) is set to `accession` ('' empties it): empty menus close up and repeats are dropped. */
export function chooseInSlot(ids: string[], slot: number, accession: string): string[] {
  const slots = slotsFromIds(ids);
  slots[slot] = accession;
  return [...new Set(slots.filter((id) => id !== ''))];
}
