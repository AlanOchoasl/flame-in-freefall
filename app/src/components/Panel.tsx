import type { ReactNode } from 'react';

interface PanelProps {
  id: string;
  title: string;
  subtitle?: string;
  /** Short status text on the right of the title, e.g. "26 studies". */
  tag?: string;
  /** Marks the heading as the focus target when this panel is the route's section. */
  routeFocus?: boolean;
  children: ReactNode;
}

// A bordered console panel: title, optional subtitle and status tag, then the content.
export function Panel({ id, title, subtitle, tag, routeFocus, children }: PanelProps) {
  const headingId = `${id}-title`;
  return (
    <section id={id} className="panel" aria-labelledby={headingId}>
      <div className="panel-head">
        <div>
          <h2 id={headingId} className="panel-title" tabIndex={-1} data-route-focus={routeFocus ? '' : undefined}>
            {title}
          </h2>
          {subtitle ? <p className="panel-sub">{subtitle}</p> : null}
        </div>
        {tag ? <span className="count-tag">{tag}</span> : null}
      </div>
      <div className="panel-body">{children}</div>
    </section>
  );
}

export function MetricTile({ value, label }: { value: number; label: string }) {
  return (
    <article className="metric-card">
      <p className="metric">{value}</p>
      <p className="metric-label">{label}</p>
    </article>
  );
}
