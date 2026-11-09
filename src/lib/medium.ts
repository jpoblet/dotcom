/**
 * Articles from Jordi's Medium profile, read from its public RSS feed.
 * Server-only. The feed is cached and refreshed every few hours, so new
 * posts appear without a redeploy. If Medium can't be reached, the list is
 * simply empty and the Articles section doesn't show.
 */

export interface Article {
  title: string;
  url: string;
  /** ISO date the article was published. */
  date: string;
  /** The start of the article, as plain text. */
  excerpt: string;
}

/** How often the feed is fetched again, in seconds. */
const REVALIDATE = 6 * 60 * 60;
const EXCERPT_CHARS = 220;

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

function decode(text: string): string {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&([a-z]+);/gi, (match, name) => ENTITIES[name.toLowerCase()] ?? match);
}

const plain = (html: string) => decode(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

/** Text of an RSS tag, with or without CDATA. */
function tag(xml: string, name: string): string {
  const match = xml.match(new RegExp(`<${name}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${name}>`));
  return match ? match[1].trim() : "";
}

/** The first real paragraph, cut at a word boundary. */
function excerptOf(html: string): string {
  const paragraphs = [...html.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => plain(m[1]));
  const text = paragraphs.find((p) => p.length > 40) ?? plain(html);
  if (text.length <= EXCERPT_CHARS) return text;
  return text.slice(0, EXCERPT_CHARS).replace(/\s+\S*$/, "") + "…";
}

export async function getArticles(feedUrl: string): Promise<Article[]> {
  try {
    const response = await fetch(feedUrl, { next: { revalidate: REVALIDATE } });
    if (!response.ok) return [];
    const xml = await response.text();
    return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
      .map(([, item]) => {
        const link = tag(item, "link");
        const published = new Date(tag(item, "pubDate"));
        return {
          title: plain(tag(item, "title")),
          // Without Medium's tracking parameters.
          url: link.split("?")[0],
          date: Number.isNaN(published.getTime()) ? "" : published.toISOString(),
          excerpt: excerptOf(tag(item, "content:encoded")),
        };
      })
      .filter((article) => article.title && article.url.startsWith("https://"));
  } catch {
    return [];
  }
}

/** "https://medium.com/@name" -> its RSS feed, "https://medium.com/feed/@name". */
export function mediumFeedUrl(profileUrl: string): string | undefined {
  const handle = profileUrl.match(/medium\.com\/(@[\w.-]+)/)?.[1];
  return handle ? `https://medium.com/feed/${handle}` : undefined;
}
