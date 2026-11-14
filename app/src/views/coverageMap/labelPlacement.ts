// Where the label of an overlay (zone, Earth air, spacesuit) goes. Labels never sit inside the plot:
// they go in the right margin, next to the overlay's right edge, so they cannot cover a point.

export interface LabelBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** `top`: level with the top of the overlay (a tall area). `middle`: centered on it (a line or a dot). */
export type LabelAnchor = 'top' | 'middle';

export interface LabelPlacement {
  /** Where the overlay ends, on the right. */
  edgeX: number;
  textX: number;
  /** Baseline of the first line of text. */
  textY: number;
  /** Height of the short leader line that ties the text to the overlay. */
  leaderY: number;
}

export const LABEL_GAP = 10;
export const LABEL_LINE_HEIGHT = 13;
const TEXT_ASCENT = 4; // half the x-height of the 11 px text, so a `middle` label is centered on the overlay
const TOP_INSET = 12;

/** Reads the box recharts passes to a label; anything that is not a box with numbers gives `null`. */
export function toLabelBox(viewBox: unknown): LabelBox | null {
  if (typeof viewBox !== 'object' || viewBox === null) return null;
  const { x, y, width, height } = viewBox as Record<string, unknown>;
  const numbers = [x, y, width, height];
  if (!numbers.every((value) => typeof value === 'number' && Number.isFinite(value))) return null;
  return { x: x as number, y: y as number, width: width as number, height: height as number };
}

export function placeMarginLabel(box: LabelBox, anchor: LabelAnchor, lineCount: number): LabelPlacement {
  const edgeX = box.x + box.width;
  if (anchor === 'top') {
    return { edgeX, textX: edgeX + LABEL_GAP, textY: box.y + TOP_INSET, leaderY: box.y + TOP_INSET - TEXT_ASCENT };
  }
  const center = box.y + box.height / 2;
  // A multi-line label is centered as a block.
  const firstLine = center + TEXT_ASCENT - ((lineCount - 1) * LABEL_LINE_HEIGHT) / 2;
  return { edgeX, textX: edgeX + LABEL_GAP, textY: firstLine, leaderY: center };
}
