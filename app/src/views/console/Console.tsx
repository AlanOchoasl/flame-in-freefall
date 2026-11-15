import { useEffect, useState } from 'react';
import { DataState } from '../../components/DataState';
import { MetricTile, Panel } from '../../components/Panel';
import { getCatalog, getExperiments, getRankingProfiles, getSummaries } from '../../data/dataAccess';
import { useDataResult } from '../../data/useDataResult';
import { rankInvestigations } from '../../lib/ranking';
import { explorerHash, parseExplorerQuery, replaceExplorerState } from '../../router/explorerQuery';
import { scrollToSection } from '../../router/sectionScroll';
import { SECTION_CHANGE, visibleSection, type Band, type ConsoleSectionId } from '../../router/visibleSection';
import { CompareBody } from '../compare/Compare';
import { parseSelection } from '../compare/selection';
import { CoverageMapBody, mapFiltersFromQuery, writeMapFilters } from '../coverageMap/CoverageMap';
import { findSummary } from '../detailModel';
import { testCoverageByAccession } from '../rankingPosition';
import type { ViewProps } from '../types';
import { consoleMetrics } from './consoleModel';
import { ConsoleFootnote, InterpretationDialog, RankingPanel } from './SidePanels';

// The routes #/ranking, #/compare and #/map open this one page and scroll to their section.
export function Console({ query, section = 'ranking' }: ViewProps) {
  const catalog = useDataResult(getCatalog);
  const experiments = useDataResult(getExperiments);
  const profiles = useDataResult(getRankingProfiles);
  const summaries = useDataResult(getSummaries);
  // The profile, the selected investigation, the comparison and the map filters live in the address.
  const explorer = parseExplorerQuery(query);
  // "Interpret" on a ranking row opens the plain-language summary in a dialog.
  const [interpretOpen, setInterpretOpen] = useState(false);

  // While the page scrolls, tell the header which section is being read so its menu follows.
  useEffect(() => {
    const ids: ConsoleSectionId[] = ['ranking', 'comparison', 'coverage'];
    let frame = 0;
    const report = () => {
      frame = 0;
      const bands: Partial<Record<ConsoleSectionId, Band>> = {};
      for (const id of ids) {
        const rect = document.getElementById(id)?.getBoundingClientRect();
        if (rect) bands[id] = { top: rect.top, bottom: rect.bottom };
      }
      window.dispatchEvent(new CustomEvent(SECTION_CHANGE, { detail: visibleSection(bands, window.innerHeight * 0.35) }));
    };
    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(report);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, []);

  // Opening the page on a section, or moving to another one from the menu, scrolls there smoothly.
  useEffect(() => scrollToSection(section), [section]);

  return (
    <div className="console-page">
      <section className="page-heading" aria-labelledby="console-title">
        <div>
          <p className="eyebrow">EXPLORATION CONTEXT / COMBUSTION INVESTIGATIONS</p>
          <h1 id="console-title">Investigation explorer</h1>
        </div>
      </section>

      <DataState state={catalog} label="The dataset totals">
        {(catalogFile) => (
          <DataState state={experiments} label="The dataset totals">
            {(experimentsFile) => {
              const metrics = consoleMetrics(catalogFile.records.length, experimentsFile);
              return (
                <section className="metrics" aria-label="Dataset totals">
                  <MetricTile value={metrics.investigations} label="investigations in catalog" />
                  <MetricTile value={metrics.tests} label="normalized test records" />
                  <MetricTile
                    value={metrics.withTests}
                    label={`of ${metrics.investigations} investigations have test data`}
                    hint="The map shows only these"
                  />
                  <MetricTile
                    value={metrics.inZone}
                    label="inside expected lunar zone"
                    hint="Show them on the map"
                    href={explorerHash('/map', { ...explorer, zone: 'in' })}
                  />
                </section>
              );
            }}
          </DataState>
        )}
      </DataState>

      <div className="workspace">
        <div className="main-column">
          <Panel id="coverage" title="Test conditions · O₂ × pressure" subtitle="The quantitative coverage map · one point per plottable test" routeFocus={section === 'map'}>
            <DataState state={experiments} label="The test data">
              {(file) => (
                <CoverageMapBody records={file.records} filters={mapFiltersFromQuery(query, file.records)} onFiltersChange={writeMapFilters} />
              )}
            </DataState>
          </Panel>
          <Panel id="comparison" title="Compare investigations" subtitle="Shared and different evidence · PSI source-linked" routeFocus={section === 'compare'}>
            <CompareBody query={query} />
          </Panel>
        </div>

        <div className="side-column">
          <DataState state={catalog} label="The list of investigations">
            {(catalogFile) => (
              <DataState state={experiments} label="The test data">
                {(experimentsFile) => (
                  <DataState state={profiles} label="The ranking profiles">
                    {(profilesFile) => {
                      const profile = profilesFile.profiles.find((p) => p.id === explorer.profile) ?? profilesFile.profiles[0];
                      const coverage = testCoverageByAccession(experimentsFile.investigations);
                      const ranked = rankInvestigations(catalogFile.records, profile, coverage);
                      const interpreted = catalogFile.records.find((r) => r.accession === explorer.selected) ?? null;
                      const entries = summaries.status === 'ok' ? summaries.data.entries : [];
                      return (
                        <>
                          <RankingPanel
                            id="ranking"
                            ranked={ranked}
                            records={catalogFile.records}
                            profile={profile}
                            profiles={profilesFile.profiles}
                            sourceUrl={profilesFile.source.url}
                            coverage={coverage}
                            selected={interpreted?.accession ?? null}
                            compareIds={parseSelection(query, catalogFile.records.map((r) => r.accession))}
                            query={query}
                            onSelect={(accession) => {
                              replaceExplorerState({ selected: accession });
                              setInterpretOpen(true);
                            }}
                            onProfileChange={(id) => replaceExplorerState({ profile: id === profilesFile.profiles[0].id ? null : id })}
                          />
                          {interpreted ? (
                            <InterpretationDialog
                              open={interpretOpen}
                              onClose={() => setInterpretOpen(false)}
                              record={interpreted}
                              entry={findSummary(entries, interpreted.accession)}
                              query={query}
                            />
                          ) : null}
                        </>
                      );
                    }}
                  </DataState>
                )}
              </DataState>
            )}
          </DataState>
        </div>
      </div>

      <ConsoleFootnote query={query} />
    </div>
  );
}
