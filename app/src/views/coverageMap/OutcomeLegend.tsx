import { OUTCOMES, OUTCOME_LABELS } from './filters';
import { OutcomeDot, ZoneRingSample } from './OutcomeMarker';
import type { Outcome } from './outcomeStyle';
import type { OutcomeCounts } from './plotPoints';
import './coverageMap.css';

interface OutcomeLegendProps {
  /** Plottable tests per outcome, so the legend also tells how many tests each color stands for. */
  counts: OutcomeCounts;
  hidden: ReadonlySet<Outcome>;
  onToggle: (outcome: Outcome) => void;
}

// Sits right above the chart. Lists all four outcomes, always. Each entry is a button that shows or hides
// that outcome on the chart.
export function OutcomeLegend({ counts, hidden, onToggle }: OutcomeLegendProps) {
  return (
    <div className="map-legend-block">
      <ul className="map-legend" aria-label="Legend: what the colors mean. Select an entry to show or hide it.">
        {OUTCOMES.map((outcome) => (
          <li key={outcome}>
            <button type="button" className="map-legend-item" aria-pressed={!hidden.has(outcome)} onClick={() => onToggle(outcome)}>
              <OutcomeDot outcome={outcome} />
              <span>{OUTCOME_LABELS[outcome]}</span>
              <span className="map-legend-count">{counts[outcome]}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="map-legend-note">
        Each circle is one set of conditions (O2 and pressure). Its size is the number of tests there, and its colors show how they ended.
        <span className="map-legend-ring">
          <ZoneRingSample /> A contrasting ring marks the expected Moon-base zone.
        </span>
      </p>
    </div>
  );
}
