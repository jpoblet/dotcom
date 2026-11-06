import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, ArrowRight, ArrowUpRight, LayoutGrid } from "lucide-react";
import { BrowserFrame, PhoneFrame } from "@/components/DeviceFrames";
import DeviceShowcase from "@/components/DeviceShowcase";
import ProjectLogoTile from "@/components/ProjectLogoTile";
import SectionNav from "@/components/SectionNav";
import { readableOn } from "@/lib/color";
import { type Project, getProjects, hasPage, stripEmptySections } from "@/lib/content";

/** Splits a case study into its "## " sections (plus any intro before them). */
function splitSections(markdown: string): { id: string; title: string; body: string }[] {
  return markdown
    .split(/\n(?=## )/)
    .map((chunk, index) => {
      const match = chunk.match(/^## (.*)\n?([\s\S]*)$/);
      const title = match ? match[1].trim() : "Overview";
      return {
        id: `section-${index + 1}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        title,
        body: (match ? match[2] : chunk).trim(),
      };
    })
    .filter((section) => section.body);
}

/** Case studies in the order the projects page lists them. */
function caseStudies(): Project[] {
  return getProjects().filter((p) => p.type !== "client" && hasPage(p));
}

/** "https://www.example.com/" -> "example.com" */
const displayUrl = (url: string) =>
  url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

/**
 * Screenshot blocks for the case study, from the project's gallery: a wide
 * desktop shot, a row of phones, then the remaining desktop shots side by
 * side.
 */
function mediaBlocks(project: Project): ReactNode[] {
  const url = project.liveUrl;
  if (!url) return [];
  const [first, ...rest] = project.gallery;
  const blocks: ReactNode[] = [];
  const caption = (text: string) => (
    <p className="mt-4 text-xs text-foreground-secondary">{text}</p>
  );
  if (first) {
    blocks.push(
      <figure>
        <BrowserFrame src={first} url={url} alt={`${project.name}: a section of the website`} sizes="(min-width: 1008px) 960px, 100vw" />
      </figure>,
    );
  }
  if (project.mobileGallery.length) {
    blocks.push(
      <figure>
        <div className="grid grid-cols-3 gap-[4%] px-[6%]">
          {project.mobileGallery.slice(0, 3).map((src) => (
            <PhoneFrame key={src} src={src} alt={`${project.name} on a phone`} sizes="(min-width: 1008px) 260px, 28vw" />
          ))}
        </div>
        {caption("The same site on a phone.")}
      </figure>,
    );
  }
  if (rest.length) {
    blocks.push(
      <figure className="grid gap-6 sm:grid-cols-2">
        {rest.map((src) => (
          <BrowserFrame key={src} src={src} url={url} alt={`${project.name}: a section of the website`} sizes="(min-width: 1008px) 470px, 100vw" />
        ))}
      </figure>,
    );
  }
  return blocks;
}

interface Props {
  project: Project;
  /**
   * How to open other projects: "soft" inside a modal opened from another
   * page (swaps the modal in place), "hard" when the project URL was opened
   * directly (a normal page load).
   */
  linkMode: "soft" | "hard";
}

/**
 * A case study, shown inside ProjectModal:
 * - a hero with the name set huge and the brand tile in its top row;
 * - the live site in a browser and a phone;
 * - the write-up with a sticky table of contents, with more screenshots of
 *   the site between its sections;
 * - a full-bleed "next case study" band in the next brand's colour.
 */
export default function ProjectDetail({ project, linkMode }: Props) {
  const sections = splitSections(stripEmptySections(project.body));
  const media = mediaBlocks(project);
  const list = caseStudies();
  const position = list.findIndex((p) => p.slug === project.slug);
  const previous =
    list.length > 1 ? list[(position - 1 + list.length) % list.length] : undefined;
  const next = list.length > 1 ? list[(position + 1) % list.length] : undefined;

  const showcase = Boolean(project.liveUrl && project.thumbnail);
  const facts = [
    { label: "Company", value: project.company },
    { label: "Role", value: project.role },
    { label: "Year", value: project.year },
  ].filter((fact) => fact.value);

  return (
    <article>
      {/* Hero */}
      <header className="relative px-6 sm:px-10 pt-[calc(6.5rem+env(safe-area-inset-top))] pb-12 sm:pb-16">
        <div className="relative mx-auto max-w-[90rem]">
          <div className="flex items-center justify-between gap-6">
            <p className="text-xs font-medium text-foreground-secondary">
              {position >= 0 && (
                <>
                  Case study {String(position + 1).padStart(2, "0")} /{" "}
                  {String(list.length).padStart(2, "0")}
                </>
              )}
              {project.draft && " · Draft (development only)"}
            </p>
            {project.logo && (
              <ProjectLogoTile
                project={project}
                sizes="8rem"
                compact
                className="w-24 sm:w-32 aspect-[16/10] rounded-sm"
              />
            )}
          </div>
          <h1
            id="project-title"
            className="mt-6 text-[clamp(3rem,10vw,9.5rem)] font-medium leading-[0.88] tracking-[-0.05em]"
          >
            {project.name}
          </h1>

          <div className="mt-10 sm:mt-14 grid gap-8 sm:grid-cols-[1.5fr_1fr] sm:items-end">
            {project.summary && (
              <p className="max-w-2xl text-base sm:text-xl leading-relaxed text-foreground-secondary">
                {project.summary}
              </p>
            )}
            <dl className="grid grid-cols-3 gap-4 text-xs">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="font-medium text-foreground-secondary">{fact.label}</dt>
                  <dd className="mt-1.5 leading-snug">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>

        </div>
      </header>

      {/* The live site, on desktop and on a phone. */}
      {showcase && (
        <div className="relative px-6 sm:px-10">
          <div className="mx-auto max-w-[60rem]">
            <DeviceShowcase
              name={project.name}
              url={project.liveUrl}
              desktopImage={project.thumbnail}
              mobileImage={project.mobileImage || undefined}
            />
          </div>
        </div>
      )}

      {/* Write-up */}
      <div className="mx-auto max-w-[60rem] px-6 mt-16 sm:mt-24">
        {(project.tags.length > 0 || project.liveUrl) && (
          <div className="flex flex-wrap items-center gap-2">
            {project.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-background-inverse/8 px-4 py-2 text-xs">
                {tag}
              </span>
            ))}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-background-inverse px-4 py-2 text-xs text-background hover:opacity-70 transition-opacity"
              >
                {displayUrl(project.liveUrl)}
                <ArrowUpRight size={14} />
              </a>
            )}
          </div>
        )}

        {sections.length > 0 ? (
          <div className="mt-14 sm:mt-20 grid gap-10 sm:grid-cols-[11rem_1fr]">
            <div>
              <SectionNav sections={sections.map(({ id, title }) => ({ id, title }))} />
            </div>
            <div className="space-y-16 sm:space-y-24">
              {sections.map((section, index) => (
                <div key={section.id} className="space-y-16 sm:space-y-24">
                  <section id={section.id} className="scroll-mt-24">
                    <h2 className="text-xs font-medium text-foreground-secondary">
                      <span className="tabular-nums mr-3">{String(index + 1).padStart(2, "0")}</span>
                      {section.title}
                    </h2>
                    <div className="case-study case-study-lead mt-5">
                      <ReactMarkdown>{section.body}</ReactMarkdown>
                    </div>
                  </section>
                  {/* One block of screenshots after each section; any left
                      over follow the last one. */}
                  {(index < sections.length - 1 ? media.slice(index, index + 1) : media.slice(index)).map(
                    (block, i) => (
                      <div key={i} className="relative z-10 sm:-ml-[13.5rem]">
                        {block}
                      </div>
                    ),
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-16 text-sm text-foreground-secondary">
            The full write-up is on its way.
          </p>
        )}

        <nav
          aria-label="More projects"
          className="mt-24 flex items-center justify-between gap-4 border-t border-background-inverse/10 pt-6"
        >
          {previous ? (
            <ProjectLink
              project={previous}
              linkMode={linkMode}
              className="group inline-flex min-w-0 items-center gap-2 text-xs"
            >
              <ArrowLeft
                size={14}
                className="shrink-0 transition-transform duration-300 group-hover:-translate-x-1"
              />
              <span className="truncate">Previous: {previous.name}</span>
            </ProjectLink>
          ) : (
            <span />
          )}
          <Link
            href="/projects"
            aria-label="All projects"
            title="All projects"
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-background-inverse/10 hover:bg-background-secondary transition-colors duration-200"
          >
            <LayoutGrid size={16} />
          </Link>
        </nav>
      </div>

      {/* Next case study: a full-bleed band in the next brand's colour. */}
      {next && (
        <ProjectLink
          project={next}
          linkMode={linkMode}
          className="group mt-10 block overflow-hidden"
          style={{ background: next.brandBackground, color: readableOn(next.brandBackground) }}
        >
          <span className="mx-auto flex max-w-[90rem] flex-col gap-4 px-6 sm:px-10 py-16 sm:py-24">
            <span className="text-xs font-medium text-foreground-secondary">
              Next case study
            </span>
            <span className="flex items-end justify-between gap-6">
              <span className="text-[clamp(2.5rem,8vw,7.5rem)] font-medium leading-[0.9] tracking-[-0.05em] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-4">
                {next.name}
              </span>
              <ArrowRight className="mb-[0.6em] size-[clamp(2rem,5vw,4.5rem)] shrink-0 transition-transform duration-500 group-hover:translate-x-3" />
            </span>
          </span>
        </ProjectLink>
      )}
    </article>
  );
}

function ProjectLink({
  project,
  linkMode,
  className,
  style,
  children,
}: {
  project: Project;
  linkMode: "soft" | "hard";
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const href = `/projects/${project.slug}`;
  return linkMode === "soft" ? (
    // replace: closing the modal still returns to the page underneath.
    <Link href={href} replace scroll={false} className={className} style={style}>
      {children}
    </Link>
  ) : (
    <a href={href} className={className} style={style}>
      {children}
    </a>
  );
}
