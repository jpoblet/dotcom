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

/**
 * The default view, laid out like a product catalogue: cells divided by
 * hairlines. Case studies in two columns with their logo, details and a
 * short summary; websites in three smaller columns linking to the sites.
 */
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
      <p className="text-sm text-foreground-secondary">
        {caseStudies.length} case studies and {websites.length} websites, most recent first.
      </p>

      <h2 className="mt-10 text-xs font-medium text-foreground-secondary">Case studies</h2>
      {/* Hairline grid: the gap shows the background-inverse layer beneath. */}
      <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-px overflow-hidden rounded-sm border border-background-inverse/10 bg-background-inverse/10">
        {caseStudies.map((project, index) => (
          <li
            key={project.slug}
            className="animate-suggestion-in bg-background"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <button
              type="button"
              onClick={() => onOpen(project.slug)}
              className="group relative flex h-full w-full flex-col p-5 text-left cursor-pointer transition-colors duration-300 hover:bg-background-secondary"
            >
              <span className="flex items-center justify-between text-xs tabular-nums text-foreground-secondary">
                {String(index + 1).padStart(2, "0")}
                <ArrowRight
                  size={15}
                  className="-translate-x-1 text-foreground opacity-0 transition-[opacity,translate] duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                />
              </span>
              <span className="flex h-24 items-center">
                <LogoMark
                  logo={project.logoMark}
                  name={project.name}
                  className="h-8 w-2/5 text-foreground/80 transition-[translate,color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-1 group-hover:text-foreground"
                />
              </span>
              <span className="font-mono text-sm font-bold">{project.name}</span>
              <span className="mt-1 font-mono text-xs text-foreground-secondary">{meta(project)}</span>
              {project.summary && (
                <span className="mt-3 line-clamp-2 text-xs leading-[1.6] text-foreground-secondary">
                  {project.summary}
                </span>
              )}
            </button>
          </li>
        ))}
        {/* An odd count leaves a gap: fill it so the hairline grid stays even. */}
        {caseStudies.length % 2 === 1 && (
          <li aria-hidden="true" className="hidden bg-background sm:block" />
        )}
      </ul>

      {websites.length > 0 && (
        <>
          <h2 className="mt-12 text-xs font-medium text-foreground-secondary">Websites</h2>
          <ul className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-px overflow-hidden rounded-sm border border-background-inverse/10 bg-background-inverse/10">
            {websites.map((site, index) => {
              const cell = (
                <>
                  <span className="flex h-5 items-center justify-end text-foreground-secondary">
                    {site.liveUrl ? (
                      <ArrowUpRight
                        size={14}
                        className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      />
                    ) : (
                      <span className="text-xs">Soon</span>
                    )}
                  </span>
                  <span className="flex h-16 items-center">
                    <LogoMark
                      logo={site.logoMark}
                      name={site.name}
                      className="h-5 w-3/5 text-foreground/75 transition-colors duration-300 group-hover:text-foreground"
                    />
                  </span>
                  <span className="truncate font-mono text-sm">{site.name}</span>
                  <span className="mt-0.5 font-mono text-xs text-foreground-secondary">{site.year}</span>
                </>
              );
              const className =
                "group flex h-full flex-col p-4 transition-colors duration-300 hover:bg-background-secondary";
              return (
                <li
                  key={site.slug}
                  className="animate-suggestion-in bg-background"
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
            {/* Fill the last row so the hairline grid stays even. */}
            {Array.from({ length: (3 - (websites.length % 3)) % 3 }, (_, i) => (
              <li key={`filler-${i}`} aria-hidden="true" className="hidden bg-background sm:block" />
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
      <BrowserFrame src={firstShot} tint={project.screenColors[firstShot]} url={url} alt={`${project.name}: a section of the website`} sizes="(min-width: 1024px) 760px, 100vw" />,
    );
  }
  if (url && project.mobileGallery.length) {
    media.push(
      <div className="grid grid-cols-3 gap-[5%] px-[8%]">
        {project.mobileGallery.slice(0, 3).map((src) => (
          <PhoneFrame key={src} src={src} tint={project.screenColors[src]} url={url} alt={`${project.name} on a phone`} sizes="200px" />
        ))}
      </div>,
    );
  }
  if (url && otherShots.length) {
    media.push(
      <div className="grid gap-4 sm:grid-cols-2">
        {otherShots.map((src) => (
          <BrowserFrame key={src} src={src} tint={project.screenColors[src]} url={url} alt={`${project.name}: a section of the website`} sizes="(min-width: 1024px) 380px, 100vw" />
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
            />
          ) : (
            <div className="flex aspect-[2/1] items-center justify-center rounded-sm bg-background-inverse/[0.03]">
              <LogoMark logo={project.logoMark} name={project.name} align="center" className="h-14 w-1/2" />
            </div>
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
