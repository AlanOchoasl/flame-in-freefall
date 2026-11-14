import { describe, expect, it } from 'vitest';
import { cleanText, epochToIsoDate, parseUsDate, splitAccessions, splitList } from './normalize.ts';

describe('cleanText', () => {
  it('collapses repeated spaces inside a sentence (real PSI-60 text)', () => {
    expect(cleanText('This ground investigation  sought to increase')).toBe('This ground investigation sought to increase');
  });
  it('keeps paragraphs and line breaks but never more than one blank line', () => {
    expect(cleanText('Line one\nLine two\n\n\n\nNew paragraph')).toBe('Line one\nLine two\n\nNew paragraph');
  });
  it('trims every line and the whole text', () => {
    expect(cleanText('  a  \n   b  ')).toBe('a\nb');
  });
  it('turns empty or non-string values into null', () => {
    expect(cleanText('')).toBeNull();
    expect(cleanText('   \n  ')).toBeNull();
    expect(cleanText(undefined)).toBeNull();
    expect(cleanText(42)).toBeNull();
  });
});

describe('splitList', () => {
  it('splits keywords joined by runs of spaces and keeps single spaces inside an item', () => {
    expect(splitList('chemical kinetics     ethane     heat loss')).toEqual(['chemical kinetics', 'ethane', 'heat loss']);
  });
  it('splits two-space hardware names', () => {
    expect(splitList('ACME  Combustion Integrated Rack (CIR)')).toEqual(['ACME', 'Combustion Integrated Rack (CIR)']);
  });
  it('also splits on a line break', () => {
    expect(splitList('First title\nSecond title')).toEqual(['First title', 'Second title']);
  });
  it('returns an empty list for empty or missing input', () => {
    expect(splitList('')).toEqual([]);
    expect(splitList(undefined)).toEqual([]);
  });
});

describe('splitAccessions', () => {
  it('splits the related-investigations string (real PSI value)', () => {
    expect(splitAccessions('PSI-69     PSI-142')).toEqual(['PSI-69', 'PSI-142']);
  });
  it('handles one item and empty', () => {
    expect(splitAccessions('PSI-107')).toEqual(['PSI-107']);
    expect(splitAccessions('')).toEqual([]);
  });
});

describe('parseUsDate', () => {
  it('converts MM-DD-YYYY to ISO', () => {
    expect(parseUsDate('02-15-2017')).toEqual({ value: '2017-02-15', warning: null });
  });
  it('returns null without a warning for empty dates (PSI-159 has none)', () => {
    expect(parseUsDate('')).toEqual({ value: null, warning: null });
  });
  it('rejects a date that does not exist', () => {
    expect(parseUsDate('02-30-2020').value).toBeNull();
    expect(parseUsDate('02-30-2020').warning).toContain('does not exist');
  });
  it('warns on an unrecognized format', () => {
    expect(parseUsDate('2017-02-15').warning).toContain('unrecognized');
  });
});

describe('epochToIsoDate', () => {
  it('converts the PSI release date (epoch seconds, UTC)', () => {
    expect(epochToIsoDate(1781049600)).toBe('2026-06-10');
  });
  it('returns null for non-numbers', () => {
    expect(epochToIsoDate(undefined)).toBeNull();
    expect(epochToIsoDate('1781049600')).toBeNull();
  });
});
