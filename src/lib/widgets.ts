/**
 * Rich blocks the AI can show under a reply (via its display tools).
 * Built on the server from /content and sent to the browser as data, so the
 * browser never needs filesystem access.
 */

export interface ProjectCardData {
  slug: string;
  name: string;
  summary: string;
  /** "Company · Role · Year", whichever parts exist. */
  meta: string;
  thumbnail: string;
  /** The same screen in dark mode, when the site has one. */
  thumbnailDark?: string;
  /** Cover colour used while there is no thumbnail. */
  accent: string;
  /** Brand logo and its background (empty logo: use the cover). */
  logo: string;
  /** The compact mark (symbol where there is one), drawn in text colour. */
  logoMark: string;
  brandBackground: string;
  /** Set only when the case-study page is published. */
  href?: string;
}

export interface TimelineEntry {
  company: string;
  role: string;
  start: string;
  end: string;
  /** The company's website, when there is one. */
  website?: string;
}

export interface MusicTrack {
  artist: string;
  name: string;
  /** The track's Last.fm page. */
  url: string;
  /** When it was played (ms); absent while it's playing. */
  playedAt?: number;
  nowPlaying?: boolean;
}

/** Jordi's listening, from Last.fm (see lib/lastfm.ts). */
export interface MusicData {
  user: string;
  profileUrl: string;
  totalPlays: number;
  /** When the Last.fm account started (ms). */
  since: number;
  /** Most played artists over the last three months. */
  topArtists: { name: string; plays: number; url: string }[];
  /** Genres, from the top artists' tags weighted by plays. */
  genres: string[];
  recent: MusicTrack[];
  nowPlaying?: MusicTrack;
}

export type Widget =
  | { kind: "project"; project: ProjectCardData }
  | { kind: "timeline"; roles: TimelineEntry[] }
  | { kind: "contact"; email: string; links: { label: string; href: string }[] }
  | { kind: "music"; music: MusicData };
