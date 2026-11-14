import { AiLabel, PsiTextLabel } from '../components/AiLabel';
import { DataState } from '../components/DataState';
import { NotAvailable } from '../components/NotAvailable';
import { PsiLink } from '../components/PsiLink';
import { getCatalog, getExperiments, getRankingProfiles, getSummaries } from '../data/dataAccess';
import type { CatalogRecord } from '../data/types';
import { useDataResult } from '../data/useDataResult';
import { findSummary, formatO2Range, formatPressureRange, relatedLinks } from './detailModel';
import { NotFound } from './placeholders';
import { rankingPositions } from './rankingPosition';
import type { ViewProps } from './types';

function PsiText({ value }: { value: string | null }) {
  return value ? <>{value}</> : <NotAvailable reason="not-in-psi-record" />;
}

interface CuratedItem {
  value: string | string[] | null;
  reviewed: boolean;
}

function CuratedValue({ item }: { item: CuratedItem }) {
  const values = Array.isArray(item.value) ? item.value : item.value ? [item.value] : [];
  if (values.length === 0) return <NotAvailable reason="not-reviewed" />;
  return (
    <>
      {values.join(', ')}
      {item.reviewed ? '' : ' (unreviewed)'}
    </>
  );
}

function Summary({ record }: { record: CatalogRecord }) {
  const summaries = useDataResult(getSummaries);
  if (summaries.status === 'loading') return <p role="status">Loading the summary…</p>;

  const entry = summaries.status === 'ok' ? findSummary(summaries.data.entries, record.accession) : undefined;
  if (!entry) {
    return (
      <>
        <PsiTextLabel />
        <p>
          <PsiText value={record.objectives} />
        </p>
      </>
    );
  }
  return (
    <>
      <AiLabel model={entry.model} reviewed={entry.reviewed} />
      <p>{entry.summary}</p>
      <h3>Fire-safety relevance</h3>
      <p>{entry.fireSafetyRelevance}</p>
    </>
  );
}

function TestConditions({ record }: { record: CatalogRecord }) {
  const experiments = useDataResult(getExperiments);

  return (
    <DataState state={experiments} label="The test conditions">
      {(file) => {
        const summary = file.investigations.find((item) => item.accession === record.accession);
        if (!summary || summary.records === 0) {
          return (
            <p>
              <NotAvailable reason="no-normalized-test-data" /> <PsiLink accession={record.accession} />
            </p>
          );
        }
        const o2 = formatO2Range(summary.o2Range);
        const pressure = formatPressureRange(summary.pressureBarRange);
        return (
          <ul>
            <li>
              Tests: {summary.records} ({summary.plottable} with both O2 and pressure)
            </li>
            <li>Oxygen: {o2 ?? <NotAvailable reason="no-normalized-test-data" />}</li>
            <li>Pressure: {pressure ?? <NotAvailable reason="no-normalized-test-data" />}</li>
            <li>
              Fuels: {summary.fuels.length > 0 ? summary.fuels.join(', ') : <NotAvailable reason="not-in-psi-record" />}
            </li>
            <li>In the expected Moon-base zone: {summary.inMoonBaseZone}</li>
          </ul>
        );
      }}
    </DataState>
  );
}

function RankingPositions({ record, records }: { record: CatalogRecord; records: CatalogRecord[] }) {
  const profiles = useDataResult(getRankingProfiles);
  const experiments = useDataResult(getExperiments);

  return (
    <DataState state={profiles} label="The ranking profiles">
      {(profilesFile) => (
        <DataState state={experiments} label="The test conditions">
          {(experimentsFile) => (
            <>
              <ul>
                {rankingPositions(record.accession, profilesFile.profiles, records, experimentsFile.investigations).map(
                  (item) => (
                    <li key={item.profileId}>
                      {item.label}: #{item.position} of {item.total} ({item.score} of {item.maximumScore} points)
                      {item.notAssessedFactors > 0 ? `, ${item.notAssessedFactors} factor(s) not assessed` : ''}
                      {item.basedOnUnreviewedTags ? ', based on unreviewed tags' : ''}
                      {item.note ? `. ${item.note}` : ''}
                    </li>
                  ),
                )}
              </ul>
              <p>
                A rule-based heuristic made by this team, not an assessment by NASA. <a href="#/ranking">See the full ranking</a>.
              </p>
            </>
          )}
        </DataState>
      )}
    </DataState>
  );
}

function Facts({ record }: { record: CatalogRecord }) {
  const { curated } = record;
  return (
    <dl className="facts">
      <dt>Research area</dt>
      <dd>
        <PsiText value={record.researchArea} />
      </dd>
      <dt>Project type</dt>
      <dd>
        <PsiText value={record.projectType} />
      </dd>
      <dt>Flight platform</dt>
      <dd>
        <PsiText value={record.flightPlatform} />
      </dd>
      <dt>Hardware</dt>
      <dd>{record.hardware.names.length > 0 ? record.hardware.names.join(', ') : <NotAvailable reason="not-in-psi-record" />}</dd>
      <dt>Hardware group</dt>
      <dd>
        <CuratedValue item={curated.hardwareGroup} />
      </dd>
      <dt>Fuel phase</dt>
      <dd>
        <CuratedValue item={curated.fuelPhase} />
      </dd>
      <dt>Topics</dt>
      <dd>
        <CuratedValue item={curated.topics} />
      </dd>
      <dt>Measurements</dt>
      <dd>
        <CuratedValue item={curated.measurements} />
      </dd>
    </dl>
  );
}

function Related({ record, known }: { record: CatalogRecord; known: ReadonlySet<string> }) {
  const links = relatedLinks(record, known);
  if (links.length === 0) return <NotAvailable reason="not-in-psi-record" />;
  return (
    <ul>
      {links.map(({ accession, inCatalog }) => (
        <li key={accession}>{inCatalog ? <a href={`#/investigation/${accession}`}>{accession}</a> : accession}</li>
      ))}
    </ul>
  );
}

function DetailBody({ record, records }: { record: CatalogRecord; records: CatalogRecord[] }) {
  const known = new Set(records.map((item) => item.accession));
  return (
    <>
      <p className="detail-title">
        <strong>{record.title ?? record.accession}</strong>
        {record.acronym ? ` (${record.acronym})` : ''}
      </p>

      <section className="research-panel"><h2>Summary</h2><Summary record={record} /></section>

      <section className="research-panel"><h2>Facts</h2><Facts record={record} /></section>

      <section className="research-panel"><h2>Test conditions</h2><TestConditions record={record} /></section>

      <section className="research-panel"><h2>Ranking position</h2><RankingPositions record={record} records={records} /></section>

      <section className="research-panel"><h2>Text from NASA PSI</h2><PsiTextLabel />
      <h3>Objectives</h3>
      <p>
        <PsiText value={record.objectives} />
      </p>
      <h3>Approach</h3>
      <p>
        <PsiText value={record.approach} />
      </p>
      <h3>Hypothesis</h3>
      <p>
        <PsiText value={record.hypothesis} />
      </p>
      <h3>Earth benefits</h3>
      <p>
        <PsiText value={record.earthBenefits} />
      </p>
      </section>

      <section className="research-panel"><h2>Related investigations</h2><Related record={record} known={known} /></section>

      <section className="research-panel"><h2>Cite this investigation</h2>
      <p>
        <PsiLink accession={record.accession} doi={record.doi} />
      </p>
      </section>
    </>
  );
}

export function InvestigationDetail({ params }: ViewProps) {
  const { accession } = params;
  const catalog = useDataResult(getCatalog);

  const record = catalog.status === 'ok' ? catalog.data.records.find((item) => item.accession === accession) : undefined;
  if (catalog.status === 'ok' && !record) {
    return <NotFound requested={`#/investigation/${accession}`} message={`The catalog has no investigation ${accession}.`} />;
  }

  return (
    <>
      <h1>Investigation {accession}</h1>
      <p className="back-link">
        <a href="#/ranking">← Back to the explorer</a>
      </p>
      <DataState state={catalog} label="The catalog">
        {(file) => <DetailBody record={record as CatalogRecord} records={file.records} />}
      </DataState>
    </>
  );
}
