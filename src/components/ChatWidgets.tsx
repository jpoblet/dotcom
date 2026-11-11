"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Download, FileText } from "lucide-react";
import CursorPeek from "@/components/CursorPeek";
import LogoMark from "@/components/LogoMark";
import { useWorkspace } from "@/components/workspace/WorkspaceContext";
import { track } from "@/lib/analytics";
import { CV_FILENAME, CV_HTML, CV_PDF } from "@/lib/cv";
import type { MusicData, ProjectCardData, TimelineEntry, Widget } from "@/lib/widgets";

/**
 * Projects as a list, like a contents page: the mark, the name, what I
 * did and when, one line on what it is. Each row sits on a faint grey
 * ground that darkens on hover, and floats its screenshot by the pointer.
 */
function ProjectList({ projects }: { projects: ProjectCardData[] }) {
  const workspace = useWorkspace();
  const [hovered, setHovered] = useState<ProjectCardData | null>(null);
  const [list, setList] = useState<HTMLUListElement | null>(null);
  const [canHover, setCanHover] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => setCanHover(window.matchMedia("(hover: hover)").matches));
    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <ul ref={setList} className="w-full space-y-1.5">
        {projects.map((project, index) => {
          const row = (
            <>
              {/* The mark, centred both ways in its slot beside the text. */}
              <span className="flex w-14 shrink-0 items-center justify-center self-stretch text-foreground">
                <LogoMark logo={project.logoMark} name={project.name} align="center" className="h-6 w-full" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                  <span className="font-mono text-base font-bold">{project.name}</span>
                  {project.meta && (
                    <span className="font-mono text-xs text-foreground-secondary">{project.meta}</span>
                  )}
                </span>
                {project.summary && (
                  <span className="mt-1 block truncate text-sm text-foreground-secondary">
                    {project.summary}
                  </span>
                )}
              </span>
              <span className="self-center text-foreground-secondary transition-[translate,color] duration-300 group-hover:translate-x-1 group-hover:text-foreground">
                {project.href ? <ArrowRight size={16} /> : <span className="text-xs">Soon</span>}
              </span>
            </>
          );
          // The whole row is the link: a faint grey ground that darkens on hover.
          const className = "group relative flex w-full items-start gap-4 rounded-md bg-background-inverse/[0.04] px-4 py-3.5 text-left transition-colors duration-300 hover:bg-background-inverse/[0.09]";
          const handlers = {
            onPointerEnter: () => canHover && setHovered(project),
            onPointerLeave: () => setHovered(null),
          };
          return (
            <li
              key={project.slug}
              className="animate-suggestion-in"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {workspace && project.href ? (
                <button
                  type="button"
                  onClick={() => {
                    setHovered(null);
                    workspace.openProject(project.slug);
                  }}
                  className={`${className} cursor-pointer`}
                  {...handlers}
                >
                  {row}
                </button>
              ) : project.href ? (
                <Link href={project.href} prefetch={false} className={className} {...handlers}>
                  {row}
                </Link>
              ) : (
                <div className={className}>{row}</div>
              )}
            </li>
          );
        })}
      </ul>
      {canHover && <CursorPeek project={hovered} anchor={list} />}
    </>
  );
}

/** Delay between one timeline row and the next, in ms. */
const TIMELINE_STEP = 90;

/**
 * Roles on a vertical rail, newest first. The rail draws downwards and each
 * dot pops in as it gets there; the current role's dot is filled and pulses.
 * Company names link to their websites.
 */
function Timeline({ roles }: { roles: TimelineEntry[] }) {
  return (
    <ol className="relative w-full space-y-4">
      {/* The rail: from the first dot's centre to the last one's. */}
      {roles.length > 1 && (
        <span
          aria-hidden="true"
          className="animate-timeline-rail absolute top-[0.8rem] bottom-[0.8rem] left-[5px] w-px bg-background-inverse/20"
          style={{ animationDuration: `${Math.max(600, roles.length * TIMELINE_STEP + 200)}ms` }}
        />
      )}
      {roles.map((role, index) => {
        const current = role.end === "Present";
        const delay = `${index * TIMELINE_STEP}ms`;
        return (
          <li
            key={`${role.company}-${role.start}`}
            className="relative grid grid-cols-[7.5rem_1fr] gap-4 pl-7 text-sm"
          >
            {/* The dot, centred on the rail and on the first line of text. */}
            <span
              aria-hidden="true"
              className="absolute top-[0.8rem] left-0 size-[11px] -translate-y-1/2"
            >
              {current && (
                <span className="animate-timeline-pulse absolute inset-0 rounded-full bg-foreground" />
              )}
              <span
                className={`animate-timeline-dot absolute inset-0 rounded-full border-2 ${
                  current ? "border-foreground bg-foreground" : "border-foreground-secondary bg-background"
                }`}
                style={{ animationDelay: delay }}
              />
            </span>
            <span
              className="animate-suggestion-in font-mono text-xs leading-[1.6rem] tabular-nums text-foreground-secondary"
              style={{ animationDelay: delay }}
            >
              {role.start} – {current ? "Now" : role.end}
            </span>
            <span className="animate-suggestion-in leading-[1.6rem]" style={{ animationDelay: delay }}>
              <span className="font-bold">{role.role}</span>
              <span className="text-foreground-secondary"> · </span>
              {role.website ? (
                <a
                  href={role.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-0.5 text-foreground-secondary underline decoration-background-inverse/20 decoration-1 underline-offset-2 transition-colors hover:text-foreground hover:decoration-foreground"
                >
                  {role.company}
                  <ArrowUpRight
                    size={12}
                    className="transition-transform duration-300 group-hover:-translate-y-px group-hover:translate-x-px"
                  />
                </a>
              ) : (
                <span className="text-foreground-secondary">{role.company}</span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** The email as a big link, the profiles as a line of small ones. */
function Contact({ email, links }: { email: string; links: { label: string; href: string }[] }) {
  return (
    <div className="animate-suggestion-in space-y-3">
      <a
        href={`mailto:${email}`}
        className="group inline-flex items-center gap-2 font-mono text-xl sm:text-2xl font-bold tracking-tight underline decoration-background-inverse/20 decoration-1 underline-offset-[0.2em] transition-[text-decoration-color] hover:decoration-foreground"
      >
        {email}
        <ArrowUpRight size={20} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </a>
      <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-foreground-secondary">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            {link.label} ↗
          </a>
        ))}
      </p>
    </div>
  );
}

const quietLink =
  "underline decoration-background-inverse/20 decoration-1 underline-offset-2 transition-colors hover:decoration-foreground";

/**
 * What I've been listening to, live from Last.fm: what's on right now,
 * then the most played artists, genres and recent tracks as plain text. Text only (Last.fm's licence excludes images); artists and
 * tracks link to their Last.fm pages, and the card credits Last.fm.
 */
function Music({ music }: { music: MusicData }) {
  const label = "font-mono text-xs text-foreground-secondary";
  return (
    <div className="animate-suggestion-in w-full space-y-6 text-sm">
      {music.nowPlaying && (
        <p className="flex items-center gap-3">
          {/* Three bars bouncing: something's playing. */}
          <span aria-hidden="true" className="flex h-3.5 items-end gap-[2px]">
            {[0, 1, 2].map((bar) => (
              <span
                key={bar}
                className="animate-eq w-[3px] rounded-full bg-foreground"
                style={{ animationDelay: `${bar * -0.35}s` }}
              />
            ))}
          </span>
          <span className={label}>Now playing</span>
          <span className="min-w-0 truncate">
            <a href={music.nowPlaying.url} target="_blank" rel="noopener noreferrer" className={quietLink}>
              {music.nowPlaying.name}
            </a>
            <span className="text-foreground-secondary"> · {music.nowPlaying.artist}</span>
          </span>
        </p>
      )}

      {/* The rest as plain lines of text: a label, then the names. */}
      <dl className="space-y-3">
        {music.topArtists.length > 0 && (
          <div>
            <dt className={label}>Most played, last 3 months</dt>
            <dd className="mt-1 leading-relaxed">
              {music.topArtists.map((artist, index) => (
                <span key={artist.url}>
                  {index > 0 && <span className="text-foreground-secondary">, </span>}
                  <a href={artist.url} target="_blank" rel="noopener noreferrer" className={quietLink}>
                    {artist.name}
                  </a>
                </span>
              ))}
            </dd>
          </div>
        )}
        {music.genres.length > 0 && (
          <div>
            <dt className={label}>Genres</dt>
            <dd className="mt-1 leading-relaxed text-foreground-secondary">{music.genres.join(", ")}</dd>
          </div>
        )}
        {music.recent.length > 0 && (
          <div>
            <dt className={label}>Recently played</dt>
            <dd className="mt-1 leading-relaxed">
              {music.recent.map((track, index) => (
                <span key={`${track.url}-${track.playedAt}`}>
                  {index > 0 && <span className="text-foreground-secondary">, </span>}
                  <a href={track.url} target="_blank" rel="noopener noreferrer" className={quietLink}>
                    {track.name}
                  </a>
                  <span className="text-foreground-secondary"> by {track.artist}</span>
                </span>
              ))}
            </dd>
          </div>
        )}
      </dl>

      {/* Credit, as Last.fm's API terms ask: the profile and Last.fm itself. */}
      <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground-secondary">
        <a href={music.profileUrl} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
          {music.user} on Last.fm ↗
        </a>
        <a href="https://www.last.fm" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
          Powered by AudioScrobbler
        </a>
      </p>
    </div>
  );
}

/**
 * The CV, as a row like the project list: open it again in the viewer (or
 * in a new tab outside the workspace), or download the PDF.
 */
function Cv() {
  const workspace = useWorkspace();
  const button =
    "flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs transition-colors cursor-pointer";
  return (
    <div className="animate-suggestion-in flex w-full items-center gap-4 rounded-md bg-background-inverse/[0.04] px-4 py-3.5">
      <span className="flex w-14 shrink-0 items-center justify-center text-foreground">
        <FileText size={22} strokeWidth={1.5} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-mono text-base font-bold">Curriculum Vitae</span>
        <span className="mt-0.5 block font-mono text-xs text-foreground-secondary">2 pages · A4 · PDF</span>
      </span>
      <span className="flex shrink-0 items-center gap-1">
        {workspace ? (
          <button
            type="button"
            onClick={workspace.openCv}
            className={`${button} bg-background-inverse text-background hover:opacity-85`}
          >
            View
          </button>
        ) : (
          <a href={CV_HTML} target="_blank" rel="noopener noreferrer" className={`${button} bg-background-inverse text-background hover:opacity-85`}>
            View
          </a>
        )}
        <a
          href={CV_PDF}
          download={CV_FILENAME}
          onClick={() => track("CV downloaded", { from: "chat card" })}
          aria-label="Download CV (PDF)"
          className={`${button} text-foreground-secondary hover:bg-background-inverse/6 hover:text-foreground`}
        >
          <Download size={14} />
          <span className="hidden sm:inline">Download PDF</span>
        </a>
      </span>
    </div>
  );
}

/**
 * Rich blocks under an AI reply. Projects shown in the same reply are
 * gathered into one list.
 */
export default function ChatWidgets({ widgets }: { widgets: Widget[] }) {
  const projects = widgets.flatMap((w) => (w.kind === "project" ? [w.project] : []));
  const others = widgets.filter((w) => w.kind !== "project");
  return (
    // Room above and below, so the list stands apart from the text around it.
    <div className="py-5 space-y-6">
      {projects.length > 0 && <ProjectList projects={projects} />}
      {others.map((widget, index) => {
        switch (widget.kind) {
          case "timeline":
            return <Timeline key={index} roles={widget.roles} />;
          case "contact":
            return <Contact key={index} email={widget.email} links={widget.links} />;
          case "music":
            return <Music key={index} music={widget.music} />;
          case "cv":
            return <Cv key={index} />;
        }
      })}
    </div>
  );
}
