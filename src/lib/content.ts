/**
 * Content loader. Everything the site and the AI know about Jordi lives in
 * /content: short structured facts in YAML, longer writing in Markdown.
 * Server-only (uses the filesystem): import it from server components and
 * route handlers, never from "use client" files.
 */
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";

const CONTENT_DIR = path.join(process.cwd(), "content");

export interface Profile {
  name: string;
  title: string;
  location: string;
  email: string;
  links: { label: string; href: string }[];
  languages: { language: string; level: string }[];
  skills: string[];
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

export interface Project {
  slug: string;
  name: string;
  summary: string;
  company: string;
  role: string;
  year: string;
  tags: string[];
  thumbnail: string;
  draft: boolean;
  body: string;
}

function readFile(...segments: string[]): string {
  return fs.readFileSync(path.join(CONTENT_DIR, ...segments), "utf8");
}

function readYaml<T>(file: string): T {
  return parseYaml(readFile(file)) as T;
}

/** Splits a Markdown file into YAML front matter and body. */
function readMarkdown(...segments: string[]): {
  data: Record<string, unknown>;
  body: string;
} {
  const raw = readFile(...segments);
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw.trim() };
  return {
    data: (parseYaml(match[1]) as Record<string, unknown>) ?? {},
    body: match[2].trim(),
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

export function getProjects(): Project[] {
  return listMarkdown("projects").map((file) => {
    const { data, body } = readMarkdown("projects", file);
    return {
      slug: file.replace(/\.md$/, ""),
      name: str(data.name),
      summary: str(data.summary),
      company: str(data.company),
      role: str(data.role),
      year: str(data.year),
      tags: Array.isArray(data.tags) ? data.tags.map(str) : [],
      thumbnail: str(data.thumbnail),
      draft: data.draft !== false,
      body,
    };
  });
}

export function getCurrentRole(): Role | undefined {
  return getExperience().find((role) => role.end === "Present");
}

/** Markdown headings with no text under them (unfilled template sections). */
function stripEmptySections(markdown: string): string {
  return markdown
    .split(/\n(?=#{1,6} )/)
    .filter((chunk) => chunk.replace(/^#{1,6} .*$/m, "").trim() !== "")
    .join("\n")
    .trim();
}

/**
 * All content as one Markdown document, used as the AI's knowledge base.
 * Deterministic output (no dates or random ordering) so it can be
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
    parts.push(`\n## ${section.title}\n\n${section.body}`);
  }

  parts.push("\n## Work experience (newest first)");
  for (const role of getExperience()) {
    parts.push(
      `\n### ${role.role}, ${role.company}`,
      `${role.start} - ${role.end} · ${role.location}`,
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

  parts.push("\n## Projects");
  for (const project of getProjects()) {
    const meta = [project.company, project.role, project.year]
      .filter(Boolean)
      .join(" · ");
    parts.push(`\n### ${project.name}`);
    if (meta) parts.push(meta);
    parts.push(
      project.draft
        ? "Page: none yet (case study not published, do not link to it)"
        : `Page: /projects/${project.slug}`,
    );
    if (project.summary) parts.push(project.summary);
    if (!project.draft) {
      const body = stripEmptySections(project.body);
      if (body) parts.push(body);
    }
  }

  return parts.join("\n");
}
