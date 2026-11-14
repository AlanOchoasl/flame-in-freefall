import { describe, expect, it } from 'vitest';
import { LABEL_GAP, LABEL_LINE_HEIGHT, placeMarginLabel, toLabelBox } from './labelPlacement';

const box = { x: 100, y: 200, width: 300, height: 60 };

describe('toLabelBox', () => {
  it('reads a box with four numbers', () => {
    expect(toLabelBox(box)).toEqual(box);
  });

  it('refuses anything that is not a complete numeric box', () => {
    expect(toLabelBox(undefined)).toBeNull();
    expect(toLabelBox(null)).toBeNull();
    expect(toLabelBox('box')).toBeNull();
    expect(toLabelBox({ x: 1, y: 2, width: 3 })).toBeNull();
    expect(toLabelBox({ x: 1, y: 2, width: 3, height: Number.NaN })).toBeNull();
    expect(toLabelBox({ cx: 1, cy: 2, innerRadius: 3, outerRadius: 4 })).toBeNull();
  });
});

describe('placeMarginLabel', () => {
  it('puts the text to the right of the overlay, never inside it', () => {
    const { edgeX, textX } = placeMarginLabel(box, 'top', 1);
    expect(edgeX).toBe(400);
    expect(textX).toBe(edgeX + LABEL_GAP);
    expect(textX).toBeGreaterThan(box.x + box.width);
  });

  it('aligns a tall area with its top edge and keeps the leader on the text line', () => {
    const placement = placeMarginLabel(box, 'top', 2);
    expect(placement.textY).toBeGreaterThan(box.y);
    expect(placement.textY).toBeLessThan(box.y + box.height);
    expect(placement.leaderY).toBeLessThan(placement.textY);
  });

  it('centers a line or a dot on the overlay', () => {
    const line = { x: 50, y: 300, width: 350, height: 0 };
    const placement = placeMarginLabel(line, 'middle', 1);
    expect(placement.leaderY).toBe(300);
    expect(placement.edgeX).toBe(400);
    expect(Math.abs(placement.textY - 300)).toBeLessThan(LABEL_LINE_HEIGHT / 2);
  });

  it('centers a multi-line label as a block', () => {
    const dot = { x: 390, y: 290, width: 12, height: 12 };
    const one = placeMarginLabel(dot, 'middle', 1);
    const two = placeMarginLabel(dot, 'middle', 2);
    expect(one.textY - two.textY).toBe(LABEL_LINE_HEIGHT / 2);
  });
});
