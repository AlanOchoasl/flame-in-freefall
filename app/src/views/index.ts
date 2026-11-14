import { About } from './About';
import { InvestigationDetail } from './InvestigationDetail';
import { Compare } from './compare/Compare';
import { CoverageMap, Ranking } from './placeholders';
import type { View } from './types';

// The single list of screens. Adding an entry adds the route and, with inNav, the menu item.
export const views: View[] = [
  { path: '/ranking', title: 'Ranking', component: Ranking, inNav: true },
  { path: '/compare', title: 'Compare', component: Compare, inNav: true },
  { path: '/map', title: 'Coverage map', component: CoverageMap, inNav: true },
  { path: '/investigation/:accession', title: 'Investigation', component: InvestigationDetail, inNav: false },
  { path: '/about', title: 'About', component: About, inNav: true },
];
