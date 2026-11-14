import type { ComponentType } from 'react';

export interface ViewProps {
  params: Record<string, string>;
  query: URLSearchParams;
  /** Set by a route that is a section of a longer page, e.g. "map" on the console. */
  section?: string;
}

export interface View {
  path: string;
  title: string;
  component: ComponentType<ViewProps>;
  inNav: boolean;
  section?: string;
}
