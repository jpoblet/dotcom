"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import LogoMark from "@/components/LogoMark";
import { useWorkspace } from "@/components/workspace/WorkspaceContext";
import type { ProjectCardData, TimelineEntry, Widget } from "@/lib/widgets";

const EASE = "ease-[cubic-bezier(0.32,0.72,0,1)]";

/**
 * A screenshot that floats beside the pointer while it rests on a project,
 * trailing it slightly. Pointers that hover only; touch screens skip it.
 */
function Peek({ project, anchor }: { project: ProjectCardData | null; anchor: HTMLElement | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState<ProjectCardData | null>(null);

  // Keep the last project while fading out, so the image doesn't vanish.
  useEffect(() => {
    if (!project) return;
    const timeout = setTimeout(() => setShown(project));
    return () => clearTimeout(timeout);
  }, [project]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !anchor) return;
    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let frame = 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onMove = (e: PointerEvent) => {
      // Up and to the right of the pointer, clear of the line being read.
      tx = e.clientX + 20;
      ty = e.clientY - 172;
      if (!x && !y) [x, y] = [tx, ty];
    };
    const loop = () => {
      x += (tx - x) * (reduce ? 1 : 0.18);
      y += (ty - y) * (reduce ? 1 : 0.18);
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      frame = requestAnimationFrame(loop);
    };
    anchor.addEventListener("pointermove", onMove);
    frame = requestAnimationFrame(loop);
    return () => {
      anchor.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, [anchor]);

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none fixed top-0 left-0 z-[60]">
      <div
        className={`w-56 overflow-hidden rounded-md shadow-[0_24px_48px_-20px_rgb(0_0_0/0.35),0_0_0_1px_rgb(0_0_0/0.04)] transition-[opacity,scale,rotate] duration-300 ${EASE} ${
          project ? "scale-100 rotate-[-2deg] opacity-100" : "scale-90 rotate-0 opacity-0"
        }`}
        style={{ background: shown?.brandBackground || shown?.accent }}
      >
        {shown?.thumbnail ? (
          <Image src={shown.thumbnail} alt="" width={448} height={280} className="block aspect-[16/10] w-full object-cover" />
        ) : (
          shown && (
            <div className="flex aspect-[16/10] items-center justify-center text-white/90">
              <LogoMark logo={shown.logoMark} name={shown.name} align="center" className="h-8 w-1/2" />
            </div>
          )
        )}
      </div>
    </div>
  );
}

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
              <span className="flex w-14 shrink-0 items-center justify-center self-stretch text-foreground/70 transition-colors duration-300 group-hover:text-foreground">
                <LogoMark logo={project.logoMark} name={project.name} align="center" className="h-6 w-full" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                  <span className="font-heading text-base font-bold">{project.name}</span>
                  {project.meta && (
                    <span className="text-xs text-foreground-secondary">{project.meta}</span>
                  )}
                </span>
                {project.summary && (
                  <span className="font-body mt-1 block truncate text-sm text-foreground-secondary">
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
      {canHover && <Peek project={hovered} anchor={list} />}
    </>
  );
}

/** Roles as a quiet table: years in the label face, then role and company. */
function Timeline({ roles }: { roles: TimelineEntry[] }) {
  return (
    <ol className="w-full space-y-3">
      {roles.map((role, index) => (
        <li
          key={`${role.company}-${role.start}`}
          className="animate-suggestion-in grid grid-cols-[7.5rem_1fr] gap-4 text-sm"
          style={{ animationDelay: `${index * 60}ms` }}
        >
          <span className="font-label text-xs leading-[1.6rem] tabular-nums text-foreground-secondary">
            {role.start} – {role.end === "Present" ? "Now" : role.end}
          </span>
          <span className="leading-[1.6rem]">
            <span className="font-bold">{role.role}</span>
            <span className="text-foreground-secondary"> · {role.company}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

/** The email as a big link, the profiles as a line of small ones. */
function Contact({ email, links }: { email: string; links: { label: string; href: string }[] }) {
  return (
    <div className="animate-suggestion-in space-y-3">
      <a
        href={`mailto:${email}`}
        className="group inline-flex items-center gap-2 font-heading text-xl sm:text-2xl font-bold tracking-tight underline decoration-background-inverse/20 decoration-1 underline-offset-[0.2em] transition-[text-decoration-color] hover:decoration-foreground"
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
        }
      })}
    </div>
  );
}
