import { LABEL_FONT_SIZE, LABEL_LINE_HEIGHT, placeMarginLabel, toLabelBox, type LabelAnchor } from './labelPlacement';

interface LabelContentProps {
  viewBox?: unknown;
}

/**
 * Content for a recharts `label` of a reference overlay: its text in the right margin, tied to the
 * overlay by a short leader line. Nothing is drawn inside the plot, so no point can be covered.
 */
export function marginLabel(lines: string[], anchor: LabelAnchor, color: string) {
  return function MarginLabel({ viewBox }: LabelContentProps) {
    const box = toLabelBox(viewBox);
    if (!box) return null;
    const { edgeX, textX, textY, leaderY } = placeMarginLabel(box, anchor, lines.length);
    return (
      <g className="map-overlay-label">
        <line x1={edgeX} x2={textX - 3} y1={leaderY} y2={leaderY} stroke={color} strokeWidth={1.5} />
        <text x={textX} y={textY} fontSize={LABEL_FONT_SIZE} fill="var(--text)">
          {lines.map((line, index) => (
            <tspan key={line} x={textX} dy={index === 0 ? 0 : LABEL_LINE_HEIGHT}>
              {line}
            </tspan>
          ))}
        </text>
      </g>
    );
  };
}
