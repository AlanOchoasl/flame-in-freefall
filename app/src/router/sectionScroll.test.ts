import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HIGHLIGHT_CLASS, HIGHLIGHT_MS, highlightElement, panelIdOf } from './sectionScroll';

const fakeElement = () => {
  const classes = new Set<string>();
  return { classList: { add: (name: string) => classes.add(name), remove: (name: string) => classes.delete(name) } as unknown as DOMTokenList, has: (name: string) => classes.has(name) };
};

describe('panelIdOf', () => {
  it('names the panel each console section highlights, ranking included', () => {
    expect(panelIdOf('ranking')).toBe('ranking');
    expect(panelIdOf('compare')).toBe('comparison');
    expect(panelIdOf('map')).toBe('coverage');
  });

  it('has no panel for an unknown or missing section', () => {
    expect(panelIdOf('about')).toBeNull();
    expect(panelIdOf(undefined)).toBeNull();
  });
});

describe('highlightElement', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('rings the element for two seconds and then removes the ring', () => {
    const element = fakeElement();
    highlightElement(element);
    expect(element.has(HIGHLIGHT_CLASS)).toBe(true);
    vi.advanceTimersByTime(HIGHLIGHT_MS - 1);
    expect(element.has(HIGHLIGHT_CLASS)).toBe(true);
    vi.advanceTimersByTime(1);
    expect(element.has(HIGHLIGHT_CLASS)).toBe(false);
  });

  it('restarts the two seconds when highlighted again', () => {
    const element = fakeElement();
    highlightElement(element);
    vi.advanceTimersByTime(1500);
    highlightElement(element);
    vi.advanceTimersByTime(1500);
    expect(element.has(HIGHLIGHT_CLASS)).toBe(true);
    vi.advanceTimersByTime(500);
    expect(element.has(HIGHLIGHT_CLASS)).toBe(false);
  });
});
