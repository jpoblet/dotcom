/**
 * Custom events for Umami (loaded in layout.tsx, live domain only). Calls
 * are no-ops when the script isn't there: locally, or blocked by the browser.
 */
type EventData = Record<string, string | number | boolean>;

declare global {
  interface Window {
    umami?: { track: (event: string, data?: EventData) => void };
  }
}

export function track(event: string, data?: EventData) {
  try {
    window.umami?.track(event, data);
  } catch {
    // Analytics must never break the page.
  }
}
