/**
 * Jordi's listening on Last.fm, for the chat's music card. Server-only.
 *
 * Needs LASTFM_API_KEY (and LASTFM_USER, default "jpobletp"); without it
 * the music tool isn't offered. Read-only methods only, so the shared
 * secret isn't used. Responses go through Next's data cache, so the API is
 * hit at most every few minutes (recent tracks) or hours (top artists and
 * tags), never once per chat question. Per Last.fm's terms the card
 * credits Last.fm and links artists and tracks to their Last.fm pages; no
 * images (they're excluded from the API licence).
 */
import type { MusicData } from "./widgets";

const API = "https://ws.audioscrobbler.com/2.0/";
const USER = process.env.LASTFM_USER ?? "jpobletp";

export const isLastfmConfigured = () => Boolean(process.env.LASTFM_API_KEY);

const RECENT_SECONDS = 5 * 60;
const TOP_SECONDS = 6 * 60 * 60;

async function call<T>(params: Record<string, string>, revalidate: number): Promise<T> {
  const query = new URLSearchParams({
    ...params,
    api_key: process.env.LASTFM_API_KEY ?? "",
    format: "json",
  });
  const response = await fetch(`${API}?${query}`, {
    headers: { "User-Agent": "jordipoblet.com" },
    next: { revalidate },
  });
  if (!response.ok) throw new Error(`Last.fm ${params.method}: ${response.status}`);
  const data = (await response.json()) as T & { error?: number; message?: string };
  if (data.error) throw new Error(`Last.fm ${params.method}: ${data.message}`);
  return data;
}

// Tags that describe something other than the music's genre.
const NOT_GENRES =
  /^(seen live|favou?rites?|favou?rite|love|loved|awesome|beautiful|male vocalists?|female vocalists?|\d{2}s|all|spotify|my music|under \d+.*)$|^(american|british|english|uk|usa|canadian|australian|irish|scottish|swedish|spanish|french|german|italian|brazilian|jamaican|norwegian|danish|dutch|icelandic|catalan)$/i;

type LfmArtist = { name: string; playcount: string; url: string };
type LfmTrack = {
  name: string;
  url: string;
  artist: { "#text"?: string; name?: string };
  date?: { uts: string };
  "@attr"?: { nowplaying?: string };
};

/** The data behind the music card, or null if Last.fm can't be reached. */
export async function getMusic(): Promise<MusicData | null> {
  if (!isLastfmConfigured()) return null;
  try {
    const [info, top, recent] = await Promise.all([
      call<{ user: { playcount: string; registered: { unixtime: string }; url: string } }>(
        { method: "user.getinfo", user: USER },
        TOP_SECONDS,
      ),
      call<{ topartists: { artist: LfmArtist[] } }>(
        { method: "user.gettopartists", user: USER, period: "3month", limit: "8" },
        TOP_SECONDS,
      ),
      call<{ recenttracks: { track: LfmTrack[] } }>(
        { method: "user.getrecenttracks", user: USER, limit: "6" },
        RECENT_SECONDS,
      ),
    ]);

    const topArtists = top.topartists.artist.map((artist) => ({
      name: artist.name,
      plays: Number(artist.playcount) || 0,
      url: artist.url,
    }));

    // Genres: the top artists' tags, weighted by how much each is played.
    const tagged = await Promise.all(
      topArtists.slice(0, 6).map(async (artist) => {
        try {
          const data = await call<{ toptags: { tag: { name: string; count: number }[] } }>(
            { method: "artist.gettoptags", artist: artist.name },
            TOP_SECONDS,
          );
          return data.toptags.tag.slice(0, 6).map((tag) => ({
            name: tag.name.toLowerCase(),
            weight: (artist.plays * Number(tag.count)) / 100,
          }));
        } catch {
          return [];
        }
      }),
    );
    const weights = new Map<string, number>();
    for (const { name, weight } of tagged.flat()) {
      if (NOT_GENRES.test(name)) continue;
      weights.set(name, (weights.get(name) ?? 0) + weight);
    }
    const genres = [...weights.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name]) => name);

    const tracks = recent.recenttracks.track.map((track) => ({
      artist: track.artist["#text"] ?? track.artist.name ?? "",
      name: track.name,
      url: track.url,
      playedAt: track.date ? Number(track.date.uts) * 1000 : undefined,
      nowPlaying: track["@attr"]?.nowplaying === "true",
    }));

    return {
      user: USER,
      profileUrl: info.user.url,
      totalPlays: Number(info.user.playcount) || 0,
      since: Number(info.user.registered.unixtime) * 1000,
      topArtists,
      genres,
      recent: tracks.filter((t) => !t.nowPlaying).slice(0, 4),
      nowPlaying: tracks.find((t) => t.nowPlaying),
    };
  } catch (error) {
    console.error("[lastfm]", error);
    return null;
  }
}
