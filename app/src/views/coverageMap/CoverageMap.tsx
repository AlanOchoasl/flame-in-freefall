import { useEffect, useRef, useState } from 'react';
import { CartesianGrid, ReferenceArea, ReferenceDot, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts';
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
  NO_FILTERS, ZONE_ONLY,
  OUTCOME_LABELS,
  OUTCOMES,
  type MapFilters,
} from './filters';
import { computeInsight, describeInsight } from './insight';
import { marginLabel } from './OverlayLabel';
import { PointShape } from './OutcomeMarker';
import { isOutcome, type Outcome } from './outcomeStyle';
import { OutcomeLegend } from './OutcomeLegend';
import { OverlayList } from './OverlayList';
import { outcomeCounts, pointsByCondition, type OutcomeCounts, type PlotPoint } from './plotPoints';
import { downloadCsv, ResultsTable } from './ResultsTable';
import { isZoomed, niceTicks, panRange, zoomRange, type Range } from './viewRange';
import './coverageMap.css';

// Overlay labels live in the right margin of the plot (see labelPlacement.ts), never over the points.
const ZONE_LABEL = marginLabel(['Expected', 'Moon-base zone'], 'top', OVERLAY_COLORS.moonEdge);
const EARTH_LABEL = marginLabel(['Earth air'], 'middle', OVERLAY_COLORS.earth);
const SUIT_LABEL = marginLabel(['Spacesuit'], 'middle', OVERLAY_COLORS.suit);

// Round ticks (at most six per axis); the zone edge at 0.70 bar is labeled on the chart itself.
const O2_TICKS = [0, 20, 40, 60, 80, 100];
const PRESSURE_TICKS = [0, 1, 2, 3];
const PLOT_HEIGHT = 520;

// The full axes; zooming moves a window inside them.
const FULL_X: Range = [0, O2_AXIS_MAX_PERCENT];
const FULL_Y: Range = [0, PRESSURE_AXIS_MAX_BAR];
const MIN_X_SPAN = 2; // percent of O2
const MIN_Y_SPAN = 0.1; // bar
const WHEEL_ZOOM_STEP = 1.25;
const DRAG_THRESHOLD_PX = 4;

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

const formatPressure = (record: ExperimentRecord): string =>
  record.pressureBar === null
    ? 'Not available'
    : `${record.pressureIsApproximate ? '≈ ' : ''}${Math.round(record.pressureBar * 1000) / 1000} bar${record.pressureIsApproximate ? ' (approximate)' : ''}`;

const formatO2 = (record: ExperimentRecord): string => (record.o2Fraction === null ? 'Not available' : `${Math.round(record.o2Fraction * 1000) / 10} %`);

const outcomeLabel = (record: ExperimentRecord): string => OUTCOME_LABELS[record.outcome as keyof typeof OUTCOME_LABELS] ?? record.outcome;

// "Ignition: yes 18 · no 2": how the tests at one point ended, in words.
const describeOutcomes = (counts: OutcomeCounts): string =>
  OUTCOMES.filter((outcome) => counts[outcome] > 0)
    .map((outcome) => `${OUTCOME_LABELS[outcome].replace('Ignition: ', '')} ${counts[outcome]}`)
    .join(' · ');

// The tests behind one chart point share O2 and pressure; they differ in the test and may differ in outcome.
function PointDetails({ point }: { point: PlotPoint | null }) {
  if (!point) return <p>Select a point on the map to see its test.</p>;
  const { records } = point;
  const [first] = records;
  return (
    <>
      <dl className="facts">
        <dt>{records.length === 1 ? 'Test' : 'Tests at this point'}</dt>
        <dd>{records.length === 1 ? `${first.id} (${first.accession}, ${first.flameType} flame)` : `${records.length} with the same O2 and pressure`}</dd>
        <dt>O2</dt>
        <dd>{formatO2(first)}</dd>
        <dt>Pressure</dt>
        <dd>{formatPressure(first)}</dd>
        <dt>Ignition</dt>
        <dd>{records.length === 1 ? outcomeLabel(first) : describeOutcomes(point.counts)}</dd>
        <dt>In expected Moon-base zone</dt>
        <dd>{records.some((record) => record.inMoonBaseZone) ? 'yes' : 'no'}</dd>
        {records.length === 1 ? (
          <>
            <dt>Fuel</dt>
            <dd>
              {first.fuel.species ?? 'Not available'}
              {first.fuel.inferred ? ' (inferred)' : ''}
            </dd>
            <dt>Source</dt>
            <dd>
              <a href={first.pageUrl} target="_blank" rel="noopener noreferrer">
                {first.accession} on NASA PSI
              </a>
            </dd>
          </>
        ) : null}
      </dl>
      {records.length > 1 ? (
        <ul className="map-point-tests" aria-label="Tests at this point">
          {records.map((record) => (
            <li key={record.id}>
              <span>
                {record.id} · {record.accession} · {record.fuel.species ?? 'fuel not available'} · {outcomeLabel(record)}
              </span>{' '}
              <a href={record.pageUrl} target="_blank" rel="noopener noreferrer">
                PSI
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

// Shown while hovering a marker; the same facts the details panel gives, without having to click.
function PointTooltip({ active, payload }: { active?: boolean; payload?: ReadonlyArray<{ payload?: PlotPoint }> }) {
  const point = active ? payload?.[0]?.payload : undefined;
  if (!point) return null;
  const [first] = point.records;
  return (
    <div className="map-tooltip">
      <strong>{point.records.length === 1 ? `${first.id} · ${first.accession}` : `${point.records.length} tests`}</strong>
      <span>{describeOutcomes(point.counts)}</span>
      <span>
        O2 {formatO2(first)} · {formatPressure(first)}
      </span>
      {point.records.some((record) => record.inMoonBaseZone) ? <span>Inside the expected Moon-base zone</span> : null}
      <em>Click for details</em>
    </div>
  );
}

interface ChartProps {
  points: PlotPoint[];
  /** The point whose tests the details panel shows, found by its coordinates. */
  selected: PlotPoint | null;
  onSelect: (point: PlotPoint) => void;
}

function Chart({ points, selected, onSelect }: ChartProps) {
  const data = points.map((point) => ({ ...point, selected: selected !== null && point.x === selected.x && point.y === selected.y }));
  const regionRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<{ x: Range; y: Range }>({ x: FULL_X, y: FULL_Y });
  const viewRef = useRef(view);
  viewRef.current = view;
  const dragged = useRef(false);
  const zoomed = isZoomed(view.x, FULL_X) || isZoomed(view.y, FULL_Y);

  const zoomBy = (factor: number, anchorX = 0.5, anchorY = 0.5) =>
    setView((current) => ({
      x: zoomRange(current.x, FULL_X, anchorX, factor, MIN_X_SPAN),
      y: zoomRange(current.y, FULL_Y, anchorY, factor, MIN_Y_SPAN),
    }));

  // The plotting area on screen, found from the grid recharts draws, to turn the cursor into data positions.
  const plotBox = (): DOMRect | null => regionRef.current?.querySelector('.recharts-cartesian-grid')?.getBoundingClientRect() ?? null;

  // The mouse wheel zooms around the cursor and a drag pans. The wheel listener is not passive so the page
  // does not scroll at the same time; touch keeps its normal scrolling.
  useEffect(() => {
    const region = regionRef.current;
    if (!region) return;
    const onWheel = (event: WheelEvent) => {
      const box = plotBox();
      if (!box || box.width === 0 || box.height === 0) return;
      event.preventDefault();
      const anchorX = Math.min(Math.max((event.clientX - box.left) / box.width, 0), 1);
      const anchorY = Math.min(Math.max(1 - (event.clientY - box.top) / box.height, 0), 1);
      zoomBy(event.deltaY > 0 ? WHEEL_ZOOM_STEP : 1 / WHEEL_ZOOM_STEP, anchorX, anchorY);
    };
    const onPointerDown = (event: PointerEvent) => {
      const box = plotBox();
      if (event.pointerType !== 'mouse' || event.button !== 0 || !box) return;
      const start = { x: event.clientX, y: event.clientY, view: viewRef.current };
      dragged.current = false;
      const onMove = (move: PointerEvent) => {
        const dx = move.clientX - start.x;
        const dy = move.clientY - start.y;
        if (!dragged.current && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
        dragged.current = true;
        const xSpan = start.view.x[1] - start.view.x[0];
        const ySpan = start.view.y[1] - start.view.y[0];
        setView({ x: panRange(start.view.x, FULL_X, (-dx / box.width) * xSpan), y: panRange(start.view.y, FULL_Y, (dy / box.height) * ySpan) });
      };
      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    };
    region.addEventListener('wheel', onWheel, { passive: false });
    region.addEventListener('pointerdown', onPointerDown);
    return () => {
      region.removeEventListener('wheel', onWheel);
      region.removeEventListener('pointerdown', onPointerDown);
    };
  }, []);

  return (
    <>
      <div className="map-zoom-controls">
        <span className="map-zoom-hint">Scroll to zoom, drag to move.</span>
        <button type="button" aria-label="Zoom in" onClick={() => zoomBy(1 / WHEEL_ZOOM_STEP)}>
          +
        </button>
        <button type="button" aria-label="Zoom out" onClick={() => zoomBy(WHEEL_ZOOM_STEP)} disabled={!zoomed}>
          −
        </button>
        <button type="button" onClick={() => setView({ x: FULL_X, y: FULL_Y })} disabled={!zoomed}>
          Reset zoom
        </button>
      </div>
      <div ref={regionRef} className={zoomed ? 'map-plot-region is-zoomed' : 'map-plot-region'} tabIndex={0} role="region" aria-label="Coverage map, scrolls sideways on narrow screens. Scroll the wheel over it to zoom.">
        <div style={{ width: '100%', minWidth: 480, height: PLOT_HEIGHT }}>
          <ResponsiveContainer>
            <ScatterChart margin={{ top: 24, right: 128, bottom: 40, left: 12 }}>
              <CartesianGrid stroke="var(--plot-grid)" strokeOpacity={0.5} strokeDasharray="2 6" />
              <XAxis
                type="number"
                dataKey="x"
                name="O2"
                domain={view.x}
                allowDataOverflow
                ticks={zoomed ? niceTicks(view.x, 5) : O2_TICKS}
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
                domain={view.y}
                allowDataOverflow
                ticks={zoomed ? niceTicks(view.y, 5) : PRESSURE_TICKS}
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
              <Tooltip cursor={false} isAnimationActive={false} content={<PointTooltip />} />
              <Scatter
                name="Tests"
                data={data}
                shape={PointShape}
                isAnimationActive={false}
                onClick={(item) => {
                  const point = item.payload as PlotPoint | undefined;
                  if (point && !dragged.current) onSelect(point);
                }}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
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
  const [selected, setSelected] = useState<PlotPoint | null>(null);
  const [hidden, setHidden] = useState<ReadonlySet<Outcome>>(new Set());
  const [asTable, setAsTable] = useState(false);
  const options = filterOptions(records);
  const matching = applyFilters(records, filters);
  const counts = countPlotted(matching);
  const legendCounts = outcomeCounts(matching);
  const points = pointsByCondition(matching.filter((record) => !isOutcome(record.outcome) || !hidden.has(record.outcome)));
  const toggleOutcome = (outcome: Outcome) => setHidden((current) => new Set(current.has(outcome) ? [...current].filter((o) => o !== outcome) : [...current, outcome]));
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
        <label className="map-field">
          <span>Moon-base zone</span>
          <select value={filters.zone ?? ''} onChange={(event) => set('zone')(event.target.value || null)}>
            <option value="">All tests</option>
            <option value={ZONE_ONLY}>Only inside the expected zone</option>
          </select>
        </label>
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
              <OutcomeLegend counts={legendCounts} hidden={hidden} onToggle={toggleOutcome} />
              <Chart points={points} selected={selected} onSelect={setSelected} />
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
            <PointDetails point={selected} />
          </section>
        </aside>
      </div>
    </>
  );
}

/** The map's filters taken from the address and cleaned against the data: unknown values are ignored. */
export function mapFiltersFromQuery(query: URLSearchParams, records: ExperimentRecord[]): MapFilters {
  const options = filterOptions(records);
  const known = { accessionsWithTests: options.accessions, flames: options.flameTypes, fuels: options.fuels, outcomes: options.outcomes, zones: [ZONE_ONLY] };
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
