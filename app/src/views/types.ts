import type { ComponentType } from 'react';

export interface ViewProps {
  params: Record<string, string>;
  query: URLSearchParams;
}

export interface View {
  path: string;
  title: string;
  component: ComponentType<ViewProps>;
  inNav: boolean;
}
