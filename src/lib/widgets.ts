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

export type Widget =
  | { kind: "project"; project: ProjectCardData }
  | { kind: "timeline"; roles: TimelineEntry[] }
  | { kind: "contact"; email: string; links: { label: string; href: string }[] };
