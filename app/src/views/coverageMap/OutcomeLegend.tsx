import { OUTCOMES, OUTCOME_LABELS } from './filters';
import { OutcomeMarker } from './OutcomeMarker';
import './coverageMap.css';

// Lists all four outcomes, always: a color or a shape alone never carries the meaning.
export function OutcomeLegend() {
  return (
    <section aria-labelledby="map-legend-title">
      <h2 id="map-legend-title">Legend</h2>
      <ul className="map-legend">
        {OUTCOMES.map((outcome) => (
          <li key={outcome}>
            <OutcomeMarker outcome={outcome} />
            <span>{OUTCOME_LABELS[outcome]}</span>
          </li>
        ))}
        <li>
          <OutcomeMarker outcome="yes" inZone />
          <span>Thick dark outline: inside the expected Moon-base zone</span>
        </li>
      </ul>
    </section>
  );
}
