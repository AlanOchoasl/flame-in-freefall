import { useEffect, useState } from 'react';
import type { DataResult } from './dataAccess';

export type LoadState<T> = { status: 'loading' } | DataResult<T>;

// Runs a data-access loader once and reports loading, ok or error (which names the file).
export function useDataResult<T>(load: () => Promise<DataResult<T>>): LoadState<T> {
  const [state, setState] = useState<LoadState<T>>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    load().then((result) => {
      if (!cancelled) setState(result);
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  return state;
}
