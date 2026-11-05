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
  /** Cover colour used while there is no thumbnail. */
  accent: string;
  /** Set only when the case-study page is published. */
  href?: string;
}

export interface TimelineEntry {
  company: string;
  role: string;
  start: string;
  end: string;
}

export type Widget =
  | { kind: "project"; project: ProjectCardData }
  | { kind: "timeline"; roles: TimelineEntry[] }
  | { kind: "contact"; email: string; links: { label: string; href: string }[] };
