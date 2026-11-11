"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { BrowserFrame, PhoneFrame, displayUrl } from "@/components/DeviceFrames";
import CursorPeek from "@/components/CursorPeek";
import DeviceShowcase from "@/components/DeviceShowcase";
import LogoMark from "@/components/LogoMark";
import ProjectLogoTile from "@/components/ProjectLogoTile";
import type { Project } from "@/lib/content";
import type { Article } from "@/lib/medium";

const meta = (p: Project) => [p.company, p.role, p.year].filter(Boolean).join(" · ");

/** Splits a case study into its "## " sections. */
function sections(markdown: string) {
  return markdown
    .split(/\n(?=## )/)
    .map((chunk) => {
      const match = chunk.match(/^## (.*)\n?([\s\S]*)$/);
      return { title: match ? match[1].trim() : "", body: (match ? match[2] : chunk).trim() };
    })
    .filter((s) => s.body);
}

/** "6 case studies, 6 websites and 4 articles": skips empty ones, singular for one. */
function countLine(counts: [number, string, string][]) {
  const parts = counts
    .filter(([n]) => n > 0)
    .map(([n, one, many]) => `${n} ${n === 1 ? one : many}`);
  return parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}` : parts.join("");
}

/** A section title over a hairline, with its count on the right. */
function SectionHead({ title, count, className = "" }: { title: string; count: number; className?: string }) {
  return (
    <h2 className={`flex items-baseline justify-between border-b border-background-inverse/15 pb-3 text-xs font-medium ${className}`}>
      {title}
      <span className="font-mono tabular-nums text-foreground-secondary">
        {String(count).padStart(2, "0")}
      </span>
    </h2>
  );
}

/**
 * The default view, as an open index rather than boxes, in the same
 * language as the projects page: hairlines between rows, type doing the
 * work. Case studies are rows with their mark in a margin column; hovering
 * one slides it in, draws a line under it and floats a screenshot of the
 * project beside the pointer. Websites sit below as a quiet wall of marks,
 * and articles last, as plain links. Logos always show at full strength.
 */
export function WorkOverview({
  caseStudies,
  websites,
  articles = [],
  onOpen,
}: {
  caseStudies: Project[];
  websites: Project[];
  articles?: Article[];
  onOpen: (slug: string) => void;
}) {
  const [hovered, setHovered] = useState<Project | null>(null);
  const [list, setList] = useState<HTMLOListElement | null>(null);
  // Only pointers that hover get the floating preview; touch skips it.
  const [canHover, setCanHover] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => setCanHover(window.matchMedia("(hover: hover)").matches));
    return () => clearTimeout(timeout);
  }, []);
  return (
    <div className="px-6 sm:px-8 py-8">
      {/* The overview's title, in the same face as a case study's. */}
      <h1 className="text-balance font-mono text-lg sm:text-xl font-bold tracking-tight">
        {countLine([
          [caseStudies.length, "case study", "case studies"],
          [websites.length, "website", "websites"],
          [articles.length, "article", "articles"],
        ])}
        , most recent first.
      </h1>

      <SectionHead title="Case studies" count={caseStudies.length} className="mt-10" />
      <ol ref={setList}>
        {caseStudies.map((project, index) => {
          return (
            <li
              key={project.slug}
              onPointerEnter={() => canHover && setHovered(project)}
              onPointerLeave={() => setHovered(null)}
            >
              <button
                type="button"
                onClick={() => {
                  setHovered(null);
                  onOpen(project.slug);
                }}
                className="animate-suggestion-in group relative grid w-full cursor-pointer grid-cols-[2.75rem_1fr_auto] items-start gap-x-4 border-b border-background-inverse/10 py-5 text-left"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                {/* A line that draws across the row on hover. */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-foreground transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
                />
                <span className="flex h-11 items-center">
                  <LogoMark
                    logo={project.logoMark}
                    name={project.name}
                    className="h-6 w-full text-foreground"
                  />
                </span>
                <span className="min-w-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5">
                  <span className="flex items-baseline gap-3">
                    <span className="font-mono text-xs tabular-nums text-foreground-secondary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-mono text-base font-bold">{project.name}</span>
                  </span>
                  <span className="mt-1 block font-mono text-xs text-foreground-secondary">{meta(project)}</span>
                  {project.summary && (
                    <span className="mt-2.5 line-clamp-2 text-xs leading-[1.6] text-foreground-secondary">
                      {project.summary}
                    </span>
                  )}
                </span>
                <ArrowRight
                  size={15}
                  className="mt-1 -translate-x-1 opacity-0 transition-[opacity,translate] duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                />
              </button>
            </li>
          );
        })}
      </ol>
      {canHover && (
        <CursorPeek
          anchor={list}
          project={
            hovered && {
              name: hovered.name,
              thumbnail: hovered.thumbnail,
              thumbnailDark: hovered.darkScreens[hovered.thumbnail],
              accent: hovered.accent,
              logo: hovered.logo,
              logoMark: hovered.logoMark,
              brandBackground: hovered.brandBackground,
            }
          }
        />
      )}

      {websites.length > 0 && (
        <>
          <SectionHead title="Websites" count={websites.length} className="mt-14" />
          {/* A wall of marks: no frames, just the logo and a caption. */}
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-6">
            {websites.map((site, index) => {
              const cell = (
                <>
                  <span className="flex h-20 items-center">
                    <LogoMark
                      logo={site.logoMark}
                      name={site.name}
                      className="h-6 w-3/5 text-foreground transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-1"
                    />
                  </span>
                  <span className="flex items-baseline justify-between gap-2 border-t border-background-inverse/10 pt-2.5">
                    <span className="truncate font-mono text-xs">{site.name}</span>
                    {site.liveUrl ? (
                      <ArrowUpRight
                        size={12}
                        className="shrink-0 text-foreground-secondary transition-[translate,color] duration-300 group-hover:-translate-y-px group-hover:translate-x-px group-hover:text-foreground"
                      />
                    ) : (
                      <span className="shrink-0 font-mono text-xs text-foreground-secondary">Soon</span>
                    )}
                  </span>
                  <span className="mt-0.5 block font-mono text-xs text-foreground-secondary">{site.year}</span>
                </>
              );
              const className = "group block pt-2 pb-5";
              return (
                <li
                  key={site.slug}
                  className="animate-suggestion-in"
                  style={{ animationDelay: `${(caseStudies.length + index) * 50}ms` }}
                >
                  {site.liveUrl ? (
                    <a href={site.liveUrl} target="_blank" rel="noopener noreferrer" className={className}>
                      {cell}
                    </a>
                  ) : (
                    <div className={className}>{cell}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}

      {articles.length > 0 && (
        <>
          <SectionHead title="Articles" count={articles.length} className="mt-14" />
          {/* Quieter than the rest: plain links, no logos or frames. */}
          <ul className="mt-2">
            {articles.map((article, index) => (
              <li
                key={article.url}
                className="animate-suggestion-in"
                style={{ animationDelay: `${(caseStudies.length + websites.length + index) * 50}ms` }}
              >
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block py-3"
                >
                  <span className="flex items-baseline justify-between gap-4">
                    <span className="text-sm underline decoration-background-inverse/20 decoration-1 underline-offset-[3px] transition-[text-decoration-color] duration-300 group-hover:decoration-foreground">
                      {article.title}
                      <ArrowUpRight
                        size={12}
                        className="ml-1 inline-block align-[-1px] text-foreground-secondary transition-[translate,color] duration-300 group-hover:-translate-y-px group-hover:translate-x-px group-hover:text-foreground"
                      />
                    </span>
                    {article.date && (
                      <time dateTime={article.date} className="shrink-0 font-mono text-xs tabular-nums text-foreground-secondary">
                        {new Date(article.date).toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" })}
                      </time>
                    )}
                  </span>
                  {article.excerpt && (
                    <span className="mt-1 block truncate text-xs leading-[1.6] text-foreground-secondary">
                      {article.excerpt}
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/** A case study, shown beside the chat. */
export function ProjectView({
  project,
  caseStudies,
  onOpen,
  onBack,
}: {
  project: Project;
  caseStudies: Project[];
  onOpen: (slug: string) => void;
  onBack: () => void;
}) {
  const index = caseStudies.findIndex((p) => p.slug === project.slug);
  const next = caseStudies.length > 1 ? caseStudies[(index + 1) % caseStudies.length] : undefined;
  const parts = sections(project.body);
  const [firstShot, ...otherShots] = project.gallery;
  const url = project.liveUrl;

  // Screenshots between sections: a wide shot, a row of phones, then the rest.
  const media: React.ReactNode[] = [];
  if (url && firstShot) {
    media.push(
      <BrowserFrame src={firstShot} darkSrc={project.darkScreens[firstShot]} tint={project.screenColors[firstShot]} url={url} alt={`${project.name}: a section of the website`} sizes="(min-width: 1024px) 760px, 100vw" />,
    );
  }
  if (url && project.mobileGallery.length) {
    media.push(
      <div className="grid grid-cols-3 gap-[5%] px-[8%]">
        {project.mobileGallery.slice(0, 3).map((src) => (
          <PhoneFrame key={src} src={src} darkSrc={project.darkScreens[src]} tint={project.screenColors[src]} url={url} alt={`${project.name} on a phone`} sizes="200px" />
        ))}
      </div>,
    );
  }
  if (url && otherShots.length) {
    media.push(
      <div className="grid gap-4 sm:grid-cols-2">
        {otherShots.map((src) => (
          <BrowserFrame key={src} src={src} darkSrc={project.darkScreens[src]} tint={project.screenColors[src]} url={url} alt={`${project.name}: a section of the website`} sizes="(min-width: 1024px) 380px, 100vw" />
        ))}
      </div>,
    );
  }

  return (
    <div>
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-background-inverse/10 bg-background/90 backdrop-blur px-6 sm:px-10 h-12">
        <button
          type="button"
          onClick={onBack}
          className="group inline-flex items-center gap-2 text-xs cursor-pointer"
        >
          <ArrowLeft size={14} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
          All work
        </button>
        <span className="text-xs tabular-nums text-foreground-secondary">
          {String(index + 1).padStart(2, "0")} / {String(caseStudies.length).padStart(2, "0")}
        </span>
      </div>

      <article className="mx-auto max-w-[52rem] px-6 sm:px-10 py-10">
        <p className="font-mono text-xs text-foreground-secondary">{meta(project)}</p>
        <h1 className="mt-2 font-mono text-2xl sm:text-3xl font-bold tracking-tight">{project.name}</h1>
        {/* The live site, right under the name. */}
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 font-mono text-xs underline underline-offset-2 hover:opacity-70"
          >
            {displayUrl(url)}
            <ArrowUpRight size={12} />
          </a>
        )}
        {project.summary && (
          <p className="mt-4 max-w-2xl text-sm leading-[1.75] text-foreground-secondary">
            {project.summary}
          </p>
        )}

        <div className="mt-10">
          {url && project.thumbnail ? (
            <DeviceShowcase
              name={project.name}
              url={url}
              desktopImage={project.thumbnail}
              mobileImage={project.mobileImage || undefined}
              colors={project.screenColors}
              dark={project.darkScreens}
            />
          ) : (
            // No screenshots yet: the brand's logo on its brand colour.
            <ProjectLogoTile project={project} sizes="(min-width: 1024px) 760px, 100vw" className="aspect-[2/1] rounded-sm" />
          )}
        </div>

        {project.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center gap-1.5">
            {project.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-background-inverse/6 px-3 py-1.5 text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-12 space-y-12">
          {parts.map((part, i) => (
            <div key={part.title || i} className="space-y-12">
              <section>
                {part.title && (
                  <h2 className="text-xs font-medium text-foreground-secondary">
                    {part.title}
                  </h2>
                )}
                <div className="case-study mt-4">
                  <ReactMarkdown>{part.body}</ReactMarkdown>
                </div>
              </section>
              {(i < parts.length - 1 ? media.slice(i, i + 1) : media.slice(i)).map((block, k) => (
                <div key={k}>{block}</div>
              ))}
            </div>
          ))}
        </div>

        {next && next.slug !== project.slug && (
          <button
            type="button"
            onClick={() => onOpen(next.slug)}
            className="group mt-16 flex w-full items-center justify-between gap-4 border-t border-background-inverse/10 pt-6 text-left cursor-pointer"
          >
            <span>
              <span className="font-label block text-xs text-foreground-secondary">
                Next
              </span>
              <span className="mt-1 block font-mono text-base font-bold">{next.name}</span>
            </span>
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        )}
      </article>
    </div>
  );
}
