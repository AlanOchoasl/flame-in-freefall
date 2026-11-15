import { describe, expect, it } from 'vitest';
import { clampPage, pageCount, pageItems, pageRange, pageSlice, PAGE_SIZE } from './pagination';

describe('pageCount', () => {
  it('takes 10 rows per page', () => {
    expect(PAGE_SIZE).toBe(10);
    expect(pageCount(333)).toBe(34);
    expect(pageCount(10)).toBe(1);
    expect(pageCount(11)).toBe(2);
  });
  it('has one empty page when there are no rows', () => {
    expect(pageCount(0)).toBe(1);
  });
});

describe('pageSlice and pageRange', () => {
  const rows = Array.from({ length: 23 }, (_, index) => index + 1);
  it('returns the rows of each page', () => {
    expect(pageSlice(rows, 1)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(pageSlice(rows, 2)).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    expect(pageSlice(rows, 3)).toEqual([21, 22, 23]);
  });
  it('moves a page outside the range to the nearest one', () => {
    expect(clampPage(0, 23)).toBe(1);
    expect(clampPage(99, 23)).toBe(3);
    expect(pageSlice(rows, 99)).toEqual([21, 22, 23]);
  });
  it('says which rows are on the page', () => {
    expect(pageRange(1, 333)).toEqual({ from: 1, to: 10 });
    expect(pageRange(2, 333)).toEqual({ from: 11, to: 20 });
    expect(pageRange(34, 333)).toEqual({ from: 331, to: 333 });
    expect(pageRange(1, 0)).toEqual({ from: 0, to: 0 });
  });
});

describe('pageItems', () => {
  it('shows every page when there are few', () => {
    expect(pageItems(1, 1)).toEqual([1]);
    expect(pageItems(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
  it('shows the first page, a window around the current one and the last page', () => {
    expect(pageItems(1, 34)).toEqual([1, 2, 'gap', 34]);
    expect(pageItems(5, 34)).toEqual([1, 'gap', 4, 5, 6, 'gap', 34]);
    expect(pageItems(34, 34)).toEqual([1, 'gap', 33, 34]);
  });
  it('shows a page instead of a gap that would hide just one', () => {
    expect(pageItems(3, 34)).toEqual([1, 2, 3, 4, 'gap', 34]);
    expect(pageItems(32, 34)).toEqual([1, 'gap', 31, 32, 33, 34]);
  });
  it('never repeats a page and keeps them in order', () => {
    for (let current = 1; current <= 12; current += 1) {
      const numbers = pageItems(current, 12).filter((item): item is number => item !== 'gap');
      expect(numbers).toEqual([...new Set(numbers)].sort((a, b) => a - b));
      expect(numbers).toContain(current);
      expect(numbers[0]).toBe(1);
      expect(numbers[numbers.length - 1]).toBe(12);
    }
  });
});
