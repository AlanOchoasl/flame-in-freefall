// Pure helpers for the paged results table.

export const PAGE_SIZE = 10;

/** How many pages `total` rows take; an empty table still has one (empty) page. */
export const pageCount = (total: number, size: number = PAGE_SIZE): number => Math.max(1, Math.ceil(total / size));

/** `page` is 1-based; a page outside the range is moved to the nearest valid one. */
export const clampPage = (page: number, total: number, size: number = PAGE_SIZE): number =>
  Math.min(Math.max(page, 1), pageCount(total, size));

export const pageSlice = <T>(items: T[], page: number, size: number = PAGE_SIZE): T[] => {
  const current = clampPage(page, items.length, size);
  return items.slice((current - 1) * size, current * size);
};

/** The rows on a page as "first to last" (1-based, inclusive) for the "showing 11–20 of 333" line; zeros when empty. */
export function pageRange(page: number, total: number, size: number = PAGE_SIZE): { from: number; to: number } {
  if (total === 0) return { from: 0, to: 0 };
  const current = clampPage(page, total, size);
  return { from: (current - 1) * size + 1, to: Math.min(current * size, total) };
}

export type PageItem = number | 'gap';

/**
 * The page buttons to show: the first and last page and the pages next to the current one, with a gap
 * between the groups ("1 … 4 5 6 … 34"). A gap that would hide a single page shows that page instead.
 */
export function pageItems(current: number, count: number): PageItem[] {
  if (count <= 7) return Array.from({ length: count }, (_, index) => index + 1);
  const wanted = [...new Set([1, current - 1, current, current + 1, count])].filter((n) => n >= 1 && n <= count).sort((a, b) => a - b);
  const items: PageItem[] = [];
  wanted.forEach((page, index) => {
    const previous = wanted[index - 1];
    if (previous !== undefined) {
      if (page - previous === 2) items.push(previous + 1);
      else if (page - previous > 2) items.push('gap');
    }
    items.push(page);
  });
  return items;
}
