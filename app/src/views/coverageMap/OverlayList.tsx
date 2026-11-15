import { OVERLAY_COLORS } from './constants';
import { OVERLAY_DESCRIPTIONS } from './overlayText';
import './coverageMap.css';

// Same drawings as on the chart: a shaded area for the zone, a cross for each single atmosphere.
function Swatch({ index }: { index: number }) {
  return (
    <svg width="28" height="20" viewBox="0 0 28 20" aria-hidden="true" focusable="false">
      {index === 0 ? (
        <rect x="2" y="3" width="24" height="14" fill={OVERLAY_COLORS.moonFill} fillOpacity="0.12" stroke={OVERLAY_COLORS.moonEdge} strokeDasharray="4 3" strokeWidth="1.5" />
      ) : (
        <path d="M 9 5 L 19 15 M 9 15 L 19 5" fill="none" stroke={index === 1 ? OVERLAY_COLORS.earth : OVERLAY_COLORS.suit} strokeWidth="3" strokeLinecap="round" />
      )}
    </svg>
  );
}

// The references stay listed with their values and sources below the chart, whatever the labels on it.
// Folded by default: the chart already labels them, and the full text is one click away.
export function OverlayList() {
  return (
    <details className="map-overlays-details">
      <summary>Reference atmospheres drawn on the map, with their sources</summary>
      <ul className="map-overlays">
        {OVERLAY_DESCRIPTIONS.map((description, index) => (
          <li key={description.title}>
            <Swatch index={index} />
            <span>
              <strong>{description.title}</strong>: {description.values}. <span className="map-overlay-source">{description.source}</span>
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}
