"use client";

import ReactMarkdown from "react-markdown";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { BrowserFrame, PhoneFrame, displayUrl } from "@/components/DeviceFrames";
import DeviceShowcase from "@/components/DeviceShowcase";
import LogoMark from "@/components/LogoMark";
import type { Project } from "@/lib/content";

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

/** The default view: case studies and websites, quietly listed. */
export function WorkOverview({
  caseStudies,
  websites,
  onOpen,
}: {
  caseStudies: Project[];
  websites: Project[];
  onOpen: (slug: string) => void;
}) {
  return (
    <div className="px-6 py-8">
      <h2 className="text-xs font-medium text-foreground-secondary">
        Case studies
      </h2>
      <ul className="mt-2">
        {caseStudies.map((project, index) => (
          <li key={project.slug} className="animate-suggestion-in" style={{ animationDelay: `${index * 50}ms` }}>
            <button
              type="button"
              onClick={() => onOpen(project.slug)}
              className="group grid w-full grid-cols-[4.5rem_1fr_auto] items-center gap-4 rounded-md px-2 py-4 -mx-2 text-left cursor-pointer hover:bg-background-inverse/[0.04] transition-colors"
            >
              <LogoMark
                logo={project.logoMark}
                name={project.name}
                className="h-6 w-full text-foreground/70 transition-colors group-hover:text-foreground"
              />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{project.name}</span>
                <span className="mt-0.5 block truncate text-xs text-foreground-secondary">
                  {meta(project)}
                </span>
              </span>
              <ArrowRight
                size={14}
                className="-translate-x-1 opacity-0 transition-[opacity,translate] duration-300 group-hover:translate-x-0 group-hover:opacity-100"
              />
            </button>
          </li>
        ))}
      </ul>

      {websites.length > 0 && (
        <>
          <h2 className="mt-10 text-xs font-medium text-foreground-secondary">
            Websites
          </h2>
          <ul className="mt-2">
            {websites.map((site) => {
              const row = (
                <>
                  <LogoMark
                    logo={site.logoMark}
                    name={site.name}
                    className="h-5 w-full text-foreground/60 transition-colors group-hover:text-foreground"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm">{site.name}</span>
                    <span className="mt-0.5 block truncate text-xs text-foreground-secondary">
                      {site.year}
                    </span>
                  </span>
                  {site.liveUrl ? (
                    <ArrowUpRight size={14} className="text-foreground-secondary group-hover:text-foreground" />
                  ) : (
                    <span />
                  )}
                </>
              );
              const className =
                "group grid grid-cols-[4.5rem_1fr_auto] items-center gap-4 rounded-md px-2 py-3 -mx-2 hover:bg-background-inverse/[0.04] transition-colors";
              return (
                <li key={site.slug}>
                  {site.liveUrl ? (
                    <a href={site.liveUrl} target="_blank" rel="noopener noreferrer" className={className}>
                      {row}
                    </a>
                  ) : (
                    <div className={className}>{row}</div>
                  )}
                </li>
              );
            })}
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
      <BrowserFrame src={firstShot} url={url} alt={`${project.name}: a section of the website`} sizes="(min-width: 1024px) 760px, 100vw" />,
    );
  }
  if (url && project.mobileGallery.length) {
    media.push(
      <div className="grid grid-cols-3 gap-[5%] px-[8%]">
        {project.mobileGallery.slice(0, 3).map((src) => (
          <PhoneFrame key={src} src={src} alt={`${project.name} on a phone`} sizes="200px" />
        ))}
      </div>,
    );
  }
  if (url && otherShots.length) {
    media.push(
      <div className="grid gap-4 sm:grid-cols-2">
        {otherShots.map((src) => (
          <BrowserFrame key={src} src={src} url={url} alt={`${project.name}: a section of the website`} sizes="(min-width: 1024px) 380px, 100vw" />
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
        <p className="text-xs text-foreground-secondary">{meta(project)}</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-medium tracking-tight">{project.name}</h1>
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
            />
          ) : (
            <div className="flex aspect-[2/1] items-center justify-center rounded-sm bg-background-inverse/[0.03]">
              <LogoMark logo={project.logoMark} name={project.name} align="center" className="h-14 w-1/2" />
            </div>
          )}
        </div>

        {(project.tags.length > 0 || url) && (
          <div className="mt-8 flex flex-wrap items-center gap-1.5">
            {project.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-background-inverse/6 px-3 py-1.5 text-xs">
                {tag}
              </span>
            ))}
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto inline-flex items-center gap-1 text-xs underline underline-offset-2 hover:opacity-70"
              >
                {displayUrl(url)}
                <ArrowUpRight size={12} />
              </a>
            )}
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
              <span className="block text-xs font-medium text-foreground-secondary">
                Next
              </span>
              <span className="mt-1 block text-base font-medium">{next.name}</span>
            </span>
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        )}
      </article>
    </div>
  );
}
