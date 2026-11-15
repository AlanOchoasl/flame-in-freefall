import { ConsoleDialog } from '../../components/Dialog';
import { INSIGHT_LIMITS } from './insight';
import { OUTCOME_LABELS } from './filters';
import { describeOutcomeCounts, type PlotPoint } from './plotPoints';
import { distinct, flameTemperature, formatO2, formatPressure, zoneCheck } from './pointDetails';

const outcomeLabel = (outcome: string): string => OUTCOME_LABELS[outcome as keyof typeof OUTCOME_LABELS] ?? outcome;

// The tests behind one circle share O2 and pressure; they differ in the test and may differ in outcome.
export function PointDialog({ point, open, onClose }: { point: PlotPoint | null; open: boolean; onClose: () => void }) {
  if (!point) return null;
  const { records } = point;
  const [first] = records;
  const zone = zoneCheck(records);
  const temperature = flameTemperature(records);
  const fuels = distinct(records, (record) => record.fuel.species);
  const flames = distinct(records, (record) => record.flameType);
  return (
    <ConsoleDialog open={open} onClose={onClose} titleId="point-dialog-title" className="point-dialog">
      <div className="ranking-dialog-body">
        <div className="ranking-dialog-head">
          <div>
            <h2 id="point-dialog-title">{records.length === 1 ? `Test ${first.id}` : `${records.length} tests at the same conditions`}</h2>
            <p className="ranking-dialog-sub">
              {formatO2(first)} O2 · {formatPressure(first)}
            </p>
          </div>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <p className={zone.inside ? 'zone-check is-inside' : 'zone-check'}>{zone.text}</p>

        <dl className="facts">
          <dt>How it ended</dt>
          <dd>{records.length === 1 ? outcomeLabel(first.outcome) : describeOutcomeCounts(point.counts)}</dd>
          <dt>Fuel</dt>
          <dd>
            {fuels.length > 0 ? fuels.join(', ') : 'Not available'}
            {records.length === 1 && first.fuel.inferred ? ' (inferred)' : ''}
          </dd>
          <dt>Flame type</dt>
          <dd>{flames.join(', ')}</dd>
          {temperature ? (
            <>
              <dt>Flame temperature</dt>
              <dd>{temperature} (Tad, as listed by PSI)</dd>
            </>
          ) : null}
          <dt>Source</dt>
          <dd>
            <a href={first.pageUrl} target="_blank" rel="noopener noreferrer">
              {first.accession} on NASA PSI
            </a>
          </dd>
        </dl>

        {records.length > 1 ? (
          <ul className="map-point-tests" aria-label="Tests at these conditions">
            {records.map((record) => (
              <li key={record.id}>
                {record.id} · {record.fuel.species ?? 'fuel not available'} · {record.flameType} flame · {outcomeLabel(record.outcome)}
              </li>
            ))}
          </ul>
        ) : null}

        <p className="map-caution">
          <strong>Read with care.</strong> {INSIGHT_LIMITS[0]} {INSIGHT_LIMITS[1]}
        </p>
      </div>
    </ConsoleDialog>
  );
}
