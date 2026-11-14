import type { ReactNode } from 'react';
import type { LoadState } from '../data/useDataResult';

interface DataStateProps<T> {
  state: LoadState<T>;
  /** What the data is called in messages, e.g. "The list of investigations". */
  label: string;
  /** When it returns true the empty message is shown instead of the children. */
  isEmpty?: (data: T) => boolean;
  emptyMessage?: string;
  /** If given, the empty state offers a button that clears the active filters. */
  onClearFilters?: () => void;
  children: (data: T) => ReactNode;
}

// The four states every data-backed screen shares: loading, failed (naming the file), empty, normal.
// Loading shows no placeholder numbers.
export function DataState<T>({ state, label, isEmpty, emptyMessage, onClearFilters, children }: DataStateProps<T>) {
  if (state.status === 'loading') return <p role="status">Loading {label.toLowerCase()}…</p>;
  if (state.status === 'error') {
    return (
      <p role="alert">
        {label} could not be loaded. {state.message}
      </p>
    );
  }
  if (isEmpty?.(state.data)) {
    return (
      <div role="status">
        <p>{emptyMessage ?? 'Nothing matches.'}</p>
        {onClearFilters ? (
          <button type="button" onClick={onClearFilters}>
            Clear filters
          </button>
        ) : null}
      </div>
    );
  }
  return <>{children(state.data)}</>;
}
