import { useEffect, useRef } from 'react';
import { documentTitle } from './documentTitle';

// On every route change: set the document title and move focus to the screen heading, so keyboard
// and screen-reader users land on the new screen. The first load keeps the browser's default focus.
export function useRouteChrome(screenTitle: string, hash: string): void {
  const isFirstRender = useRef(true);

  useEffect(() => {
    document.title = documentTitle(screenTitle);
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // A screen made of sections can name its own focus target; otherwise the screen heading.
    const heading = document.querySelector<HTMLElement>('main [data-route-focus]') ?? document.querySelector<HTMLElement>('main h1');
    if (heading) {
      heading.tabIndex = -1;
      heading.focus();
    }
  }, [screenTitle, hash]);
}
