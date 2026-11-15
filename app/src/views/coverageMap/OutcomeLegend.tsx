import { OUTCOMES, OUTCOME_SHORT_LABELS } from './filters';
import { CrossSample, OutcomeDot, PieMarker, ZoneRingSample } from './OutcomeMarker';
import type { Outcome } from './outcomeStyle';
import { describeOutcomeCounts, markerRadius, type OutcomeCounts, type PlotPoint } from './plotPoints';
import './coverageMap.css';

interface OutcomeLegendProps {
  /** Plottable tests per outcome, so the legend also tells how many tests each color stands for. */
  counts: OutcomeCounts;
  hidden: ReadonlySet<Outcome>;
  onToggle: (outcome: Outcome) => void;
  /** A real circle of the chart, drawn and described to show how to read one. */
  example: PlotPoint | null;
  /** Shows "how to read a circle" and the notes; off where there is no chart (table, empty result). */
  help?: boolean;
}

// A real circle of the chart, drawn and spelled out, so the reader does not have to guess what size and slices mean.
function ReadingExample({ point }: { point: PlotPoint }) {
  const [first] = point.records;
  const o2 = first.o2Fraction === null ? '' : `${Math.round(first.o2Fraction * 1000) / 10} % O2`;
  const pressure = first.pressureBar === null ? '' : `${first.pressureIsApproximate ? '≈ ' : ''}${Math.round(first.pressureBar * 1000) / 1000} bar`;
  const radius = Math.min(markerRadius(point.records.length), 16);
  return (
    <p className="map-legend-example">
      <svg width="40" height="40" viewBox="-20 -20 40 40" aria-hidden="true" focusable="false">
        <PieMarker counts={point.counts} radius={radius} inZone={point.records.some((record) => record.inMoonBaseZone)} showCount={point.records.length >= 6} />
      </svg>
      <span>
        <strong>How to read a circle.</strong> This one is {point.records.length} {point.records.length === 1 ? 'test' : 'tests'} at {o2} and {pressure}: {describeOutcomeCounts(point.counts)}.
      </span>
    </p>
  );
}

// Sits right above the chart or the table. Lists all four outcomes, always. Each entry is a button that shows or hides
// that ignition result everywhere: the chart, the counts, the table, the CSV and the summary.
export function OutcomeLegend({ counts, hidden, onToggle, example, help = true }: OutcomeLegendProps) {
  return (
    <div className="map-legend-block">
      <ul className="map-legend" aria-label="Ignition result. Select an entry to show or hide it.">
        <li className="map-legend-title" aria-hidden="true">
          Ignition
        </li>
        {OUTCOMES.map((outcome) => (
          <li key={outcome}>
            <button type="button" className="map-legend-item" aria-pressed={!hidden.has(outcome)} onClick={() => onToggle(outcome)}>
              <OutcomeDot outcome={outcome} />
              <span>{OUTCOME_SHORT_LABELS[outcome]}</span>
              <span className="map-legend-count">{counts[outcome]}</span>
            </button>
          </li>
        ))}
      </ul>
      {help && example ? <ReadingExample point={example} /> : null}
      {help ? (
      <p className="map-legend-note">
        Each circle is one combination of oxygen and pressure. Its size and the number inside are how many tests were run there; its colors are how they ended.
        <span className="map-legend-ring">
          <ZoneRingSample /> A white ring marks circles inside the expected Moon-base zone.
        </span>
        <span className="map-legend-ring">
          <CrossSample /> A cross marks a reference atmosphere (Earth air, spacesuit), not a test.
        </span>
      </p>
      ) : null}
    </div>
  );
}
