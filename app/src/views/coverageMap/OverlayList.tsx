import { OVERLAY_COLORS } from './constants';
import { OVERLAY_DESCRIPTIONS } from './overlayText';
import './coverageMap.css';

// Same drawings as on the chart: a shaded area for the zone, a ring for each single atmosphere.
function Swatch({ index }: { index: number }) {
  return (
    <svg width="28" height="20" viewBox="0 0 28 20" aria-hidden="true" focusable="false">
      {index === 0 ? (
        <rect x="2" y="3" width="24" height="14" fill={OVERLAY_COLORS.moonFill} fillOpacity="0.4" stroke={OVERLAY_COLORS.moonEdge} strokeWidth="1.5" />
      ) : (
        <circle cx="14" cy="10" r="7" fill="none" stroke={index === 1 ? OVERLAY_COLORS.earth : OVERLAY_COLORS.suit} strokeWidth="2.5" />
      )}
    </svg>
  );
}

// The references stay listed with their values and sources below the chart, whatever the labels on it.
export function OverlayList() {
  return (
    <section aria-labelledby="map-overlays-title">
      <h2 id="map-overlays-title">Reference atmospheres drawn on the map</h2>
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
    </section>
  );
}
