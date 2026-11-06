/**
 * Content loader. Everything the site and the AI know about Jordi lives in
 * /content: short structured facts in YAML, longer writing in Markdown.
 * Server-only (uses the filesystem): import it from server components and
 * route handlers, never from "use client" files.
 */
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import type { ProjectCardData } from "./widgets";

const CONTENT_DIR = path.join(process.cwd(), "content");

export interface Profile {
  name: string;
  title: string;
  location: string;
  /** IANA time zone, for the local time on the home page. */
  timezone?: string;
  email: string;
  links: { label: string; href: string }[];
  languages: { language: string; level: string }[];
  skills: string[];
  /** Personal stories the chat can suggest asking about. */
  conversation_starters?: string[];
  /** Questions suggested on the empty chat. */
  starter_questions?: string[];
}

export interface Role {
  company: string;
  role: string;
  start: string;
  end: string;
  location: string;
  website?: string;
  summary?: string;
}

export interface Education {
  institution: string;
  degree: string;
  years: string;
  location: string;
  description?: string;
}

export interface AboutSection {
  slug: string;
  title: string;
  body: string;
}

export type ProjectType = "work" | "personal" | "client";

/** Section titles, in the order projects are listed. */
export const PROJECT_TYPES: { type: ProjectType; title: string }[] = [
  { type: "work", title: "Work" },
  { type: "personal", title: "Personal projects" },
  { type: "client", title: "Other websites" },
];

export interface Project {
  slug: string;
  name: string;
  /** work: a case study from a job; personal: something Jordi made; client: a site made for someone else. */
  type: ProjectType;
  summary: string;
  company: string;
  role: string;
  year: string;
  tags: string[];
  thumbnail: string;
  /** Phone-sized screenshot of the live site, shown with the desktop one. */
  mobileImage: string;
  /** More screenshots of the live site, for the case study. */
  gallery: string[];
  mobileGallery: string[];
  /** Background colour of each screenshot (see npm run screen-colors). */
  screenColors: Record<string, string>;
  /** Cover colour (CSS colour) used while there is no thumbnail. */
  accent: string;
  /** Brand logo and the background it sits on, for the projects page. */
  logo: string;
  /** Transparent version of the logo, drawn in the text colour. */
  logoMark: string;
  brandBackground: string;
  /** Public URL when the project itself is live (website, app). */
  liveUrl: string;
  draft: boolean;
  body: string;
}

function readFile(...segments: string[]): string {
  return fs.readFileSync(path.join(CONTENT_DIR, ...segments), "utf8");
}

function readYaml<T>(file: string): T {
  return parseYaml(readFile(file)) as T;
}

// Dates and durations. Everything that depends on today is computed here so
// figures like "10 years of experience" stay current on their own.

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

/** Months since year 0 for "2016-11", "2011" (January), "October 2024", "now" or "Present". */
function toMonthIndex(value: string): number | undefined {
  const text = value.trim().toLowerCase();
  if (text === "now" || text === "present") {
    const now = new Date();
    return now.getFullYear() * 12 + now.getMonth();
  }
  const numeric = text.match(/^(\d{4})(?:-(\d{1,2}))?$/);
  if (numeric) return Number(numeric[1]) * 12 + (Number(numeric[2] ?? 1) - 1);
  const named = text.match(/^([a-z]+)\s+(\d{4})$/);
  if (named && MONTHS.includes(named[1])) {
    return Number(named[2]) * 12 + MONTHS.indexOf(named[1]);
  }
  return undefined;
}

const NUMBER_WORDS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
  "nine", "ten", "eleven", "twelve",
];
const say = (n: number) => NUMBER_WORDS[n] ?? String(n);
const plural = (n: number, unit: string) =>
  n === 1 ? `a ${unit}` : `${say(n)} ${unit}s`;

/**
 * A length of time the way a person would say it: "two years", "just over
 * a year", "about seven and a half years", "close to two years".
 */
export function describeDuration(months: number): string {
  if (months < 1) return "less than a month";
  if (months < 12) return plural(months, "month");
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (rest === 0) return plural(years, "year");
  if (rest <= 2) return `just over ${plural(years, "year")}`;
  if (rest >= 10) return `close to ${plural(years + 1, "year")}`;
  if (rest >= 5 && rest <= 7) {
    return years === 1 ? "about a year and a half" : `about ${say(years)} and a half years`;
  }
  return `${plural(years, "year")} and ${plural(rest, "month")}`;
}

/** Duration between two dates in any format toMonthIndex accepts. */
export function durationBetween(start: string, end: string): string | undefined {
  const from = toMonthIndex(start);
  const to = toMonthIndex(end);
  if (from === undefined || to === undefined || to < from) return undefined;
  // Inclusive of both months: April 2020 - November 2021 is 20 months.
  return describeDuration(to - from + 1);
}

/**
 * Fills placeholders in Markdown bodies:
 * - {{years_since:2016-11}} (or {{years_since:2011}}): whole years since
 *   then, as a number ("10").
 * - {{duration:2011-11/2019-04}}: the time between two dates in words
 *   ("about seven and a half years"); use "now" as the end for something
 *   still going on.
 */
function fillPlaceholders(text: string): string {
  return text
    .replace(/\{\{\s*years_since:([\d-]+)\s*\}\}/g, (match, start: string) => {
      const from = toMonthIndex(start);
      const now = toMonthIndex("now");
      if (from === undefined || now === undefined) return match;
      return String(Math.floor((now - from) / 12));
    })
    .replace(
      /\{\{\s*duration:([^/}]+)\/([^}]+?)\s*\}\}/g,
      (match, start: string, end: string) => durationBetween(start, end) ?? match,
    );
}

/** Splits a Markdown file into YAML front matter and body. */
function readMarkdown(...segments: string[]): {
  data: Record<string, unknown>;
  body: string;
} {
  const raw = readFile(...segments);
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: fillPlaceholders(raw.trim()) };
  return {
    data: (parseYaml(match[1]) as Record<string, unknown>) ?? {},
    body: fillPlaceholders(match[2].trim()),
  };
}

function listMarkdown(dir: string): string[] {
  return fs
    .readdirSync(path.join(CONTENT_DIR, dir))
    .filter((file) => file.endsWith(".md"))
    .sort();
}

const str = (value: unknown): string =>
  value === undefined || value === null ? "" : String(value);

export function getProfile(): Profile {
  return readYaml<Profile>("profile.yaml");
}

export function getExperience(): Role[] {
  return readYaml<Role[]>("experience.yaml");
}

export function getEducation(): Education[] {
  return readYaml<Education[]>("education.yaml");
}

export function getAboutSections(): AboutSection[] {
  return listMarkdown("about").map((file) => {
    const { data, body } = readMarkdown("about", file);
    const slug = file.replace(/\.md$/, "").replace(/^\d+-/, "");
    return { slug, title: str(data.title) || slug, body };
  });
}

/**
 * How recent a project is, from its `year` ("2026", "2020 - 2021",
 * "2024 - Present"): [end year, start year]. Ongoing projects count as the
 * most recent; projects without a year come last.
 */
function recency(project: Project): [number, number] {
  const years = project.year.match(/\d{4}/g)?.map(Number) ?? [];
  const ongoing = /present/i.test(project.year);
  const start = years[0] ?? -1;
  const end = ongoing ? Infinity : (years.at(-1) ?? -1);
  return [end, start];
}

/** All projects, most recent first. */
export function getProjects(): Project[] {
  return readProjects().sort((a, b) => {
    const [aEnd, aStart] = recency(a);
    const [bEnd, bStart] = recency(b);
    return bEnd - aEnd || bStart - aStart || a.name.localeCompare(b.name);
  });
}

/** content/screen-colors.json, written by scripts/screen-colors.mjs. */
function readScreenColors(): Record<string, string> {
  try {
    return JSON.parse(readFile("screen-colors.json")) as Record<string, string>;
  } catch {
    return {};
  }
}

function readProjects(): Project[] {
  const allColors = readScreenColors();
  return listMarkdown("projects").map((file) => {
    const { data, body } = readMarkdown("projects", file);
    const images = [
      str(data.thumbnail),
      str(data.mobile_image),
      ...(Array.isArray(data.gallery) ? data.gallery.map(str) : []),
      ...(Array.isArray(data.mobile_gallery) ? data.mobile_gallery.map(str) : []),
    ].filter(Boolean);
    return {
      screenColors: Object.fromEntries(
        images.filter((src) => allColors[src]).map((src) => [src, allColors[src]]),
      ),
      slug: file.replace(/\.md$/, ""),
      name: str(data.name),
      type: (PROJECT_TYPES.some((t) => t.type === data.type)
        ? data.type
        : "work") as ProjectType,
      summary: str(data.summary),
      company: str(data.company),
      role: str(data.role),
      year: str(data.year),
      tags: Array.isArray(data.tags) ? data.tags.map(str) : [],
      thumbnail: str(data.thumbnail),
      mobileImage: str(data.mobile_image),
      gallery: Array.isArray(data.gallery) ? data.gallery.map(str) : [],
      mobileGallery: Array.isArray(data.mobile_gallery) ? data.mobile_gallery.map(str) : [],
      accent: str(data.accent) || "#64748B",
      logo: str(data.logo),
      logoMark: str(data.logo_mark) || str(data.logo),
      brandBackground: str(data.brand_background) || "#FFFFFF",
      liveUrl: str(data.live_url),
      draft: data.draft !== false,
      body,
    };
  });
}

export function getProject(slug: string): Project | undefined {
  return getProjects().find((project) => project.slug === slug);
}

/**
 * Whether a project's page is built. Drafts are previewable with `npm run
 * dev` but never published, linked or shown to the AI as a page.
 */
export function hasPage(project: Project): boolean {
  return !project.draft || process.env.NODE_ENV === "development";
}

export function projectMeta(project: Project): string {
  return [project.company, project.role, project.year]
    .filter(Boolean)
    .join(" · ");
}

/** Projects the AI may show as a card: published, or a draft with a summary. */
export function getCardProjects(): Project[] {
  return getProjects().filter((p) => !p.draft || p.summary);
}

export function toProjectCard(project: Project): ProjectCardData {
  return {
    slug: project.slug,
    name: project.name,
    summary: project.summary,
    meta: projectMeta(project),
    thumbnail: project.thumbnail,
    accent: project.accent,
    logo: project.logo,
    logoMark: project.logoMark,
    brandBackground: project.brandBackground,
    href: project.draft ? undefined : `/projects/${project.slug}`,
  };
}

/** Uniform random pick of up to `count` items (Fisher-Yates shuffle). */
function sample<T>(items: T[], count: number): T[] {
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

/** Up to `count` random projects that are live, as Markdown-ready links. */
export function pickLiveProjects(count = 2): { name: string; url: string }[] {
  const live = getProjects().filter((p) => p.liveUrl);
  return sample(live, count).map((p) => ({ name: p.name, url: p.liveUrl }));
}

/** A random personal story to suggest asking about, if any are listed. */
export function pickConversationStarter(): string | undefined {
  return sample(getProfile().conversation_starters ?? [], 1)[0];
}

export function getCurrentRole(): Role | undefined {
  return getExperience().find((role) => role.end === "Present");
}

/** Markdown headings with no text under them (unfilled template sections). */
export function stripEmptySections(markdown: string): string {
  return markdown
    .split(/\n(?=#{1,6} )/)
    .filter((chunk) => chunk.replace(/^#{1,6} .*$/m, "").trim() !== "")
    .join("\n")
    .trim();
}

/**
 * All content as one Markdown document, used as the AI's knowledge base.
 * Deterministic output (no random ordering; the only date-dependent parts
 * are {{years_since}} figures, which change once a year) so it can be
 * prompt-cached.
 */
export function buildKnowledgeBase(): string {
  const profile = getProfile();
  const parts: string[] = [];

  parts.push(
    `# ${profile.name}`,
    `- Title: ${profile.title}`,
    `- Location: ${profile.location}`,
    `- Email: ${profile.email}`,
    ...profile.links.map((link) => `- ${link.label}: ${link.href}`),
  );

  for (const section of getAboutSections()) {
    // Subheadings sit one level below the section's own heading.
    const body = section.body.replace(/^(#{2,5}) /gm, "#$1 ");
    parts.push(`\n## ${section.title}\n\n${body}`);
  }

  parts.push("\n## Work experience (newest first)");
  for (const role of getExperience()) {
    parts.push(
      `\n### ${role.role}, ${role.company}`,
      [
        `${role.start} - ${role.end}`,
        durationBetween(role.start, role.end),
        role.location,
      ]
        .filter(Boolean)
        .join(" · "),
    );
    if (role.summary) parts.push(role.summary);
  }

  parts.push("\n## Education");
  for (const item of getEducation()) {
    parts.push(
      `\n### ${item.degree}, ${item.institution}`,
      `${item.years} · ${item.location}`,
    );
    if (item.description) parts.push(item.description);
  }

  parts.push(
    "\n## Languages",
    ...profile.languages.map((l) => `- ${l.language}: ${l.level}`),
    "\n## Skills",
    ...profile.skills.map((skill) => `- ${skill}`),
  );

  const projects = getProjects();
  const intro: Record<ProjectType, string> = {
    work: "Case studies from my jobs.",
    personal: "Products I designed and built myself.",
    client: "Websites I designed and built: for clients, for people close to me and for my own ventures. They have no case-study page.",
  };
  for (const { type, title } of PROJECT_TYPES) {
    const group = projects.filter((p) => p.type === type);
    if (group.length === 0) continue;
    parts.push(`\n## Projects: ${title}\n\n${intro[type]}`);
    for (const project of group) {
      const meta = projectMeta(project);
      parts.push(`\n### ${project.name}`);
      if (meta) parts.push(meta);
      parts.push(
        project.draft
          ? "Page: none (no case-study page, do not link to one)"
          : `Page: /projects/${project.slug}`,
      );
      if (project.liveUrl) parts.push(`Live at: ${project.liveUrl}`);
      if (project.summary) parts.push(project.summary);
      // Drafts only lack a page; their write-up is still useful to the AI.
      const body = stripEmptySections(project.body).replace(/^## /gm, "#### ");
      if (body) parts.push(body);
    }
  }

  return parts.join("\n");
}
