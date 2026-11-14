import { useState } from 'react';
import { CartesianGrid, ReferenceArea, ReferenceDot, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, XAxis, YAxis, Legend } from 'recharts';
import { DataState } from '../../components/DataState';
import { getExperiments } from '../../data/dataAccess';
import type { ExperimentRecord } from '../../data/types';
import { useDataResult } from '../../data/useDataResult';
import type { ViewProps } from '../types';
import { EARTH_AIR, MOON_BASE_ZONE, O2_AXIS_MAX_PERCENT, PRESSURE_AXIS_MAX_BAR, SPACESUIT, formatPressure } from './constants';
import { applyFilters, countPlotted, filterOptions, hasActiveFilters, NO_FILTERS, OUTCOME_LABELS, OUTCOMES, type MapFilters } from './filters';
import { computeInsight, describeInsight } from './insight';
import { pointsByOutcome, type PlotPoint } from './plotPoints';
import { downloadCsv, ResultsTable } from './ResultsTable';

// Shape per outcome, so the four outcomes differ without relying on color.
const SHAPES = { yes: 'circle', no: 'triangle', flash: 'diamond', 'not-reported': 'cross' } as const;
// Same values as the --outcome-* tokens in styles.css (SVG fills cannot rely on CSS variables everywhere).
const COLORS = { yes: '#c94e0c', no: '#065da0', flash: '#982f93', 'not-reported': '#7a8089' } as const;

function FilterSelect({ label, value, options, onChange }: { label: string; value: string | null; options: string[]; onChange: (v: string | null) => void }) {
  return (
    <label>
      {label}{' '}
      <select value={value ?? ''} onChange={(event) => onChange(event.target.value || null)}>
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function PointDetails({ record }: { record: ExperimentRecord | null }) {
  if (!record) return <p>Select a point on the map to see its test.</p>;
  return (
    <dl>
      <dt>Test</dt>
      <dd>
        {record.id} ({record.accession}, {record.flameType} flame)
      </dd>
      <dt>Fuel</dt>
      <dd>{record.fuel.species ?? '—'}{record.fuel.inferred ? ' (inferred)' : ''}</dd>
      <dt>O2</dt>
      <dd>{record.o2Fraction === null ? '—' : `${Math.round(record.o2Fraction * 1000) / 10} %`}</dd>
      <dt>Pressure</dt>
      <dd>{record.pressureBar === null ? '—' : `${record.pressureIsApproximate ? '≈ ' : ''}${Math.round(record.pressureBar * 1000) / 1000} bar${record.pressureIsApproximate ? ' (approximate)' : ''}`}</dd>
      <dt>Ignition</dt>
      <dd>{OUTCOME_LABELS[record.outcome as keyof typeof OUTCOME_LABELS] ?? record.outcome}</dd>
      <dt>In expected Moon-base zone</dt>
      <dd>{record.inMoonBaseZone ? 'yes' : 'no'}</dd>
      <dt>Source</dt>
      <dd>
        <a href={record.pageUrl} target="_blank" rel="noopener noreferrer">
          {record.accession} on NASA PSI
        </a>
      </dd>
    </dl>
  );
}

function Chart({ records, onSelect }: { records: ExperimentRecord[]; onSelect: (record: ExperimentRecord) => void }) {
  const series = pointsByOutcome(records);
  return (
    <div className="table-scroll" tabIndex={0} role="region" aria-label="Coverage map, scrolls sideways on narrow screens">
      <div style={{ width: '100%', minWidth: 480, height: 420 }}>
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 24, right: 72, bottom: 36, left: 12 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="x" name="O2" domain={[0, O2_AXIS_MAX_PERCENT]} ticks={[0, 20, 40, 60, 80, 100]} label={{ value: 'O2 (%)', position: 'insideBottom', offset: -20 }} />
            <YAxis type="number" dataKey="y" name="Pressure" domain={[0, PRESSURE_AXIS_MAX_BAR]} tickCount={6} label={{ value: 'Pressure (bar)', angle: -90, position: 'insideLeft' }} />
            <ReferenceArea
              x1={MOON_BASE_ZONE.o2Percent}
              x2={O2_AXIS_MAX_PERCENT}
              y1={0}
              y2={MOON_BASE_ZONE.pressureBar}
              fill="#b7e5bf"
              fillOpacity={0.4}
              stroke="#236436"
              label={{ value: 'Expected Moon-base zone', position: 'insideTopRight', fontSize: 11 }}
            />
            <ReferenceLine
              segment={[{ x: 0, y: EARTH_AIR.pressureBar }, { x: EARTH_AIR.o2Percent, y: EARTH_AIR.pressureBar }]}
              stroke="#000"
              strokeDasharray="4 2"
              label={{ value: 'Earth air', position: 'insideTopLeft', fontSize: 11 }}
            />
            <ReferenceDot x={EARTH_AIR.o2Percent} y={EARTH_AIR.pressureBar} r={6} fill="none" stroke="#000" />
            <ReferenceDot x={SPACESUIT.o2Percent} y={SPACESUIT.pressureBar} r={6} fill="none" stroke="#000" label={{ value: 'Spacesuit', position: 'right', fontSize: 11 }} />
            <Legend verticalAlign="top" />
            {OUTCOMES.map((outcome) => (
              <Scatter
                key={outcome}
                name={OUTCOME_LABELS[outcome]}
                data={series[outcome]}
                shape={SHAPES[outcome]}
                fill={COLORS[outcome]}
                fillOpacity={0.55}
                isAnimationActive={false}
                onClick={(item) => {
                  const point = item.payload as PlotPoint | undefined;
                  if (point) onSelect(point.record);
                }}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Map({ records, initialAccession }: { records: ExperimentRecord[]; initialAccession: string | null }) {
  const [filters, setFilters] = useState<MapFilters>({ ...NO_FILTERS, accession: initialAccession });
  const [selected, setSelected] = useState<ExperimentRecord | null>(null);
  const [asTable, setAsTable] = useState(false);
  const options = filterOptions(records);
  const matching = applyFilters(records, filters);
  const counts = countPlotted(matching);
  const insight = describeInsight(computeInsight(matching));
  const set = (key: keyof MapFilters) => (value: string | null) => setFilters({ ...filters, [key]: value });

  return (
    <>
      <p>Each point is one PSI test: O2 fraction on the x axis, pressure on the y axis.</p>
      <fieldset>
        <legend>Filters</legend>
        <FilterSelect label="Investigation" value={filters.accession} options={options.accessions} onChange={set('accession')} />
        <FilterSelect label="Flame type" value={filters.flameType} options={options.flameTypes} onChange={set('flameType')} />
        <FilterSelect label="Fuel" value={filters.fuel} options={options.fuels} onChange={set('fuel')} />
        <FilterSelect label="Ignition" value={filters.outcome} options={options.outcomes} onChange={set('outcome')} />
        {hasActiveFilters(filters) ? (
          <button type="button" onClick={() => setFilters(NO_FILTERS)}>
            Clear filters
          </button>
        ) : null}
      </fieldset>
      <p role="status">
        {counts.plotted} of {counts.total} tests plotted
        {counts.notPlotted > 0 ? ` (${counts.notPlotted} not plotted: O2 or pressure missing)` : ''}
      </p>
      <div>
        <button type="button" aria-pressed={asTable} onClick={() => setAsTable(!asTable)}>
          {asTable ? 'Show as chart' : 'Show as table'}
        </button>{' '}
        <button type="button" onClick={() => downloadCsv(matching)} disabled={matching.length === 0}>
          Download filtered data (CSV)
        </button>
      </div>
      {counts.total === 0 ? (
        <div role="status">
          <p>No test matches the filters.</p>
          <button type="button" onClick={() => setFilters(NO_FILTERS)}>
            Clear filters
          </button>
        </div>
      ) : asTable ? (
        <ResultsTable key={JSON.stringify(filters)} records={matching} />
      ) : (
        <Chart records={matching} onSelect={setSelected} />
      )}
      <p>
        Overlays: {MOON_BASE_ZONE.label} (O2 ≥ {MOON_BASE_ZONE.o2Percent} %, ≤ {formatPressure(MOON_BASE_ZONE)}), {EARTH_AIR.label} (
        {formatPressure(EARTH_AIR)}), {SPACESUIT.label} ({SPACESUIT.o2Percent} % O2, {formatPressure(SPACESUIT)}). Source: NASA Space Apps 2026
        challenge statement; expected values, not final.
      </p>
      <section aria-labelledby="insight-title">
        <h2 id="insight-title">What the data shows</h2>
        <p>{insight.headline}</p>
        {insight.details.map((line) => (
          <p key={line}>{line}</p>
        ))}
        <ul>
          {insight.limits.map((limit) => (
            <li key={limit}>{limit}</li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="details-title">
        <h2 id="details-title">Selected test</h2>
        <PointDetails record={selected} />
      </section>
    </>
  );
}

export function CoverageMap({ query }: ViewProps) {
  const experiments = useDataResult(getExperiments);
  return (
    <>
      <h1>Coverage map</h1>
      <DataState state={experiments} label="The test data">
        {(file) => <Map records={file.records} initialAccession={query.get('investigation')} />}
      </DataState>
    </>
  );
}
