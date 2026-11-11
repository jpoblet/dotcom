/**
 * Umami analytics (cookieless). The website id is public by design: the
 * tracking script in layout.tsx needs it. Reading stats back (for the
 * content-update signals) needs UMAMI_API_KEY, a Umami Cloud API key, which
 * is optional: without it the signals just skip analytics.
 */
export const UMAMI_WEBSITE_ID = "c9feed1a-4c35-42a6-96df-97d07e0bf709";

const API = "https://api.umami.is/v1";

type Metric = { x: string | null; y: number };

export interface AnalyticsSummary {
  pageviews: number;
  visitors: number;
  visits: number;
  /** Custom events (see lib/analytics.ts), most frequent first. */
  events: Metric[];
  paths: Metric[];
  countries: Metric[];
}

/** Site stats between two dates, or null without a key or on any failure. */
export async function getAnalytics(
  from: Date,
  to: Date,
): Promise<AnalyticsSummary | null> {
  const key = process.env.UMAMI_API_KEY;
  if (!key) return null;
  const range = `startAt=${from.getTime()}&endAt=${to.getTime()}`;
  const get = async <T>(path: string): Promise<T> => {
    const response = await fetch(`${API}/websites/${UMAMI_WEBSITE_ID}${path}`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Umami ${path}: ${response.status}`);
    return (await response.json()) as T;
  };
  try {
    const [stats, events, paths, countries] = await Promise.all([
      get<{ pageviews: number; visitors: number; visits: number }>(
        `/stats?${range}`,
      ),
      get<Metric[]>(`/metrics?type=event&limit=20&${range}`),
      get<Metric[]>(`/metrics?type=path&limit=20&${range}`),
      get<Metric[]>(`/metrics?type=country&limit=15&${range}`),
    ]);
    return {
      pageviews: Number(stats.pageviews) || 0,
      visitors: Number(stats.visitors) || 0,
      visits: Number(stats.visits) || 0,
      events,
      paths,
      countries,
    };
  } catch (error) {
    console.error("[umami] Couldn't read analytics:", error);
    return null;
  }
}
