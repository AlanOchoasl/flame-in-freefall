import { About } from './About';
import { InvestigationDetail } from './InvestigationDetail';
import { Console } from './console/Console';
import type { View } from './types';

// The single list of screens. Adding an entry adds the route and, with inNav, the menu item.
// The three console routes share one component, so moving between them keeps the page and its state;
// `section` says where to scroll.
export const views: View[] = [
  { path: '/ranking', title: 'Ranking', component: Console, section: 'ranking', inNav: true },
  { path: '/compare', title: 'Compare', component: Console, section: 'compare', inNav: true },
  { path: '/map', title: 'Coverage map', component: Console, section: 'map', inNav: true },
  { path: '/investigation/:accession', title: 'Investigation', component: InvestigationDetail, inNav: false },
  { path: '/about', title: 'About', component: About, inNav: true },
];
