import { OUTCOMES, OUTCOME_LABELS } from './filters';
import { OutcomeMarker } from './OutcomeMarker';
import './coverageMap.css';

// Sits right above the chart. Lists all four outcomes, always: a color or a shape alone never
// carries the meaning.
export function OutcomeLegend() {
  return (
    <ul className="map-legend" aria-label="Legend: how to read the markers">
      {OUTCOMES.map((outcome) => (
        <li key={outcome}>
          <OutcomeMarker outcome={outcome} />
          <span>{OUTCOME_LABELS[outcome]}</span>
        </li>
      ))}
      <li>
        <OutcomeMarker outcome="yes" inZone />
        <span>Thick contrasting outline: inside the expected Moon-base zone</span>
      </li>
    </ul>
  );
}
