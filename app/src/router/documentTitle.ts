export const APP_NAME = 'Flame in Freefall';

// Each screen gets a distinct document title so assistive technology announces a route change.
export function documentTitle(screenTitle: string): string {
  return `${screenTitle} · ${APP_NAME}`;
}
