import { useState } from 'react';
import { CartesianGrid, ReferenceArea, ReferenceDot, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, XAxis, YAxis } from 'recharts';
import { DataState } from '../../components/DataState';
import { getExperiments } from '../../data/dataAccess';
import type { ExperimentRecord } from '../../data/types';
import { useDataResult } from '../../data/useDataResult';
import { cleanExplorerState, parseExplorerQuery, replaceExplorerState } from '../../router/explorerQuery';
import type { ViewProps } from '../types';
import { EARTH_AIR, MOON_BASE_ZONE, O2_AXIS_MAX_PERCENT, OVERLAY_COLORS, PRESSURE_AXIS_MAX_BAR, SPACESUIT } from './constants';
import {
  applyFilters,
  countPlotted,
  explorerPatchFromFilters,
  filterOptions,
  filtersFromExplorer,
  hasActiveFilters,
  NO_FILTERS,
  OUTCOME_LABELS,
  OUTCOMES,
  type MapFilters,
} from './filters';
import { computeInsight, describeInsight } from './insight';
import { marginLabel } from './OverlayLabel';
import { scatterShapeFor } from './OutcomeMarker';
import { OutcomeLegend } from './OutcomeLegend';
import { OverlayList } from './OverlayList';
import { pointsByOutcome, type PlotPoint } from './plotPoints';
import { downloadCsv, ResultsTable } from './ResultsTable';
import './coverageMap.css';

// One shape component per outcome (own color and own shape, see outcomeStyle.ts), created once so
// recharts does not remount the markers on every render.
const SHAPE_OF = Object.fromEntries(OUTCOMES.map((outcome) => [outcome, scatterShapeFor(outcome)]));

// Overlay labels live in the right margin of the plot (see labelPlacement.ts), never over the points.
const ZONE_LABEL = marginLabel(['Expected', 'Moon-base zone'], 'top', OVERLAY_COLORS.moonEdge);
const EARTH_LABEL = marginLabel(['Earth air'], 'middle', OVERLAY_COLORS.earth);
const SUIT_LABEL = marginLabel(['Spacesuit'], 'middle', OVERLAY_COLORS.suit);

// Round ticks (at most six per axis); the zone edge at 0.70 bar is labeled on the chart itself.
const O2_TICKS = [0, 20, 40, 60, 80, 100];
const PRESSURE_TICKS = [0, 1, 2, 3];
const PLOT_HEIGHT = 480;

function FilterSelect({ label, value, options, onChange }: { label: string; value: string | null; options: string[]; onChange: (v: string | null) => void }) {
  return (
    <label className="map-field">
      <span>{label}</span>
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
    <dl className="facts">
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
    <div className="map-plot-region" tabIndex={0} role="region" aria-label="Coverage map, scrolls sideways on narrow screens">
      <div style={{ width: '100%', minWidth: 480, height: PLOT_HEIGHT }}>
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 24, right: 128, bottom: 40, left: 12 }}>
            <CartesianGrid stroke="var(--plot-grid)" strokeOpacity={0.55} />
            <XAxis
              type="number"
              dataKey="x"
              name="O2"
              domain={[0, O2_AXIS_MAX_PERCENT]}
              ticks={O2_TICKS}
              tick={{ fill: 'var(--text-secondary)' }}
              axisLine={{ stroke: 'var(--line-strong)' }}
              tickLine={{ stroke: 'var(--line-strong)' }}
              tickFormatter={(value: number) => `${value} %`}
              label={{ value: 'O2 (% of the atmosphere)', position: 'insideBottom', offset: -22, fill: 'var(--text-primary)' }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Pressure"
              domain={[0, PRESSURE_AXIS_MAX_BAR]}
              ticks={PRESSURE_TICKS}
              tick={{ fill: 'var(--text-secondary)' }}
              axisLine={{ stroke: 'var(--line-strong)' }}
              tickLine={{ stroke: 'var(--line-strong)' }}
              label={{ value: 'Pressure (bar)', angle: -90, position: 'insideLeft', fill: 'var(--text-primary)' }}
            />
            <ReferenceArea
              x1={MOON_BASE_ZONE.o2Percent}
              x2={O2_AXIS_MAX_PERCENT}
              y1={0}
              y2={MOON_BASE_ZONE.pressureBar}
              fill={OVERLAY_COLORS.moonFill}
              fillOpacity={0.12}
              stroke={OVERLAY_COLORS.moonEdge}
              strokeWidth={1.5}
              strokeDasharray="6 4"
              label={{ content: ZONE_LABEL }}
            />
            {/* Guide from the Earth-air ring to its label in the margin; it is drawn behind the points. */}
            <ReferenceLine
              segment={[{ x: EARTH_AIR.o2Percent, y: EARTH_AIR.pressureBar }, { x: O2_AXIS_MAX_PERCENT, y: EARTH_AIR.pressureBar }]}
              stroke={OVERLAY_COLORS.earth}
              strokeOpacity={0.55}
              strokeDasharray="2 4"
              label={{ content: EARTH_LABEL }}
            />
            <ReferenceDot x={EARTH_AIR.o2Percent} y={EARTH_AIR.pressureBar} r={6} fill="none" stroke={OVERLAY_COLORS.earth} strokeWidth={2.5} />
            <ReferenceDot
              x={SPACESUIT.o2Percent}
              y={SPACESUIT.pressureBar}
              r={6}
              fill="none"
              stroke={OVERLAY_COLORS.suit}
              strokeWidth={2.5}
              label={{ content: SUIT_LABEL }}
            />
            {OUTCOMES.map((outcome) => (
              <Scatter
                key={outcome}
                name={OUTCOME_LABELS[outcome]}
                data={series[outcome]}
                shape={SHAPE_OF[outcome]}
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

interface CoverageMapBodyProps {
  records: ExperimentRecord[];
  /** The map's filters; the page keeps them in the address, so the map does not own them. */
  filters: MapFilters;
  onFiltersChange: (filters: MapFilters) => void;
}

export function CoverageMapBody({ records, filters, onFiltersChange }: CoverageMapBodyProps) {
  const setFilters = onFiltersChange;
  const [selected, setSelected] = useState<ExperimentRecord | null>(null);
  const [asTable, setAsTable] = useState(false);
  const options = filterOptions(records);
  const matching = applyFilters(records, filters);
  const counts = countPlotted(matching);
  const insightData = computeInsight(matching);
  const insight = describeInsight(insightData);
  const set = (key: keyof MapFilters) => (value: string | null) => setFilters({ ...filters, [key]: value });

  return (
    <>
      <p className="map-lead">Each dot is one real test from NASA PSI, placed by its O2 (%) and its pressure (bar).</p>
      <fieldset className="map-filters">
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

      <div className="map-layout">
        <div className="map-primary">
          <div className="map-toolbar">
            <p role="status" className="map-count">
              <strong>
                {counts.plotted} of {counts.total} tests plotted
              </strong>
              {counts.notPlotted > 0 ? <span> · {counts.notPlotted} not plotted: O2 or pressure missing</span> : null}
            </p>
            <div className="map-actions">
              <button type="button" aria-pressed={asTable} onClick={() => setAsTable(!asTable)}>
                {asTable ? 'Show as chart' : 'Show as table'}
              </button>
              <button type="button" onClick={() => downloadCsv(matching)} disabled={matching.length === 0}>
                Download filtered data (CSV)
              </button>
            </div>
          </div>

          {counts.total === 0 ? (
            <div role="status" className="map-card">
              <p>No test matches the filters.</p>
              <button type="button" onClick={() => setFilters(NO_FILTERS)}>
                Clear filters
              </button>
            </div>
          ) : asTable ? (
            <ResultsTable key={JSON.stringify(filters)} records={matching} />
          ) : (
            <div className="map-card">
              <OutcomeLegend />
              <Chart records={matching} onSelect={setSelected} />
            </div>
          )}

          <OverlayList />
        </div>

        <aside className="map-side" aria-label="What the map shows">
          <section className="map-card" aria-labelledby="insight-title">
            <h2 id="insight-title">What the data shows</h2>
            {insightData.sharePercent !== null ? (
              <p className="map-stat" aria-hidden="true">
                <strong>{insightData.inZone}</strong>
                <span> of {insightData.plotted} plotted tests</span>
              </p>
            ) : null}
            <p>{insight.headline}</p>
            {insight.details.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <ul className="map-limits">
              {insight.limits.map((limit) => (
                <li key={limit}>{limit}</li>
              ))}
            </ul>
          </section>
          <section className="map-card" aria-labelledby="details-title">
            <h2 id="details-title">Selected test</h2>
            <PointDetails record={selected} />
          </section>
        </aside>
      </div>
    </>
  );
}

/** The map's filters taken from the address and cleaned against the data: unknown values are ignored. */
export function mapFiltersFromQuery(query: URLSearchParams, records: ExperimentRecord[]): MapFilters {
  const options = filterOptions(records);
  const known = { accessionsWithTests: options.accessions, flames: options.flameTypes, fuels: options.fuels, outcomes: options.outcomes };
  return filtersFromExplorer(cleanExplorerState(parseExplorerQuery(query), known));
}

export const writeMapFilters = (filters: MapFilters): void => replaceExplorerState(explorerPatchFromFilters(filters));

export function CoverageMap({ query }: ViewProps) {
  const experiments = useDataResult(getExperiments);
  return (
    <>
      <h1>Coverage map</h1>
      <DataState state={experiments} label="The test data">
        {(file) => <CoverageMapBody records={file.records} filters={mapFiltersFromQuery(query, file.records)} onFiltersChange={writeMapFilters} />}
      </DataState>
    </>
  );
}
