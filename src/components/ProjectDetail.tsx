import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, ArrowRight, ArrowUpRight, LayoutGrid } from "lucide-react";
import ProjectCover from "@/components/ProjectCover";
import {
  type Project,
  PROJECT_TYPES,
  getProjects,
  hasPage,
  stripEmptySections,
} from "@/lib/content";

/** Splits a case study into its "## " sections (plus any intro before them). */
function splitSections(markdown: string): { title?: string; body: string }[] {
  return markdown
    .split(/\n(?=## )/)
    .map((chunk) => {
      const match = chunk.match(/^## (.*)\n?([\s\S]*)$/);
      return match
        ? { title: match[1].trim(), body: match[2].trim() }
        : { body: chunk.trim() };
    })
    .filter((section) => section.body);
}

/**
 * The projects before and after this one, in the order the projects page
 * lists them (wrapping around at both ends).
 */
function neighbours(project: Project): { previous?: Project; next?: Project } {
  const order = PROJECT_TYPES.map((t) => t.type);
  const listed = getProjects()
    .filter((p) => p.type !== "client" && hasPage(p))
    .sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));
  if (listed.length < 2) return {};
  const index = listed.findIndex((p) => p.slug === project.slug);
  return {
    previous: listed[(index - 1 + listed.length) % listed.length],
    next: listed[(index + 1) % listed.length],
  };
}

interface Props {
  project: Project;
  /**
   * How to open the next project: "soft" inside a modal opened from another
   * page (swaps the modal in place), "hard" when the project URL was opened
   * directly (a normal page load).
   */
  linkMode: "soft" | "hard";
}

/**
 * A project's case study, shown inside ProjectModal: facts, title and
 * summary up to 800px, a cover up to 960px, then each section on two
 * columns (heading left, text right) on larger screens.
 */
export default function ProjectDetail({ project, linkMode }: Props) {
  const sections = splitSections(stripEmptySections(project.body));
  const { previous, next } = neighbours(project);
  const typeLabel = PROJECT_TYPES.find((t) => t.type === project.type)?.title;

  const facts = [
    { label: "Company", value: project.company },
    { label: "Role", value: project.role },
    { label: "Year", value: project.year },
    { label: "Type", value: typeLabel },
  ].filter((fact) => fact.value);

  return (
    <article>
      {project.draft && (
        <p className="mb-6 inline-block rounded-full bg-background-inverse/8 px-3 py-1 text-xs text-foreground-secondary">
          Draft: only visible in development
        </p>
      )}

      <h1
        id="project-title"
        className="text-4xl sm:text-6xl font-medium leading-[1.05] tracking-tight"
      >
        {project.name}
      </h1>
      {project.summary && (
        <p className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-foreground-secondary">
          {project.summary}
        </p>
      )}

      {/* Wider than the content: centred on the screen, up to 960px. */}
      <div className="relative left-1/2 -translate-x-1/2 mt-10 sm:mt-14 w-[min(calc(100vw-3rem),60rem)]">
        <ProjectCover
          name={project.name}
          accent={project.accent}
          thumbnail={project.thumbnail}
          priority
          sizes="(min-width: 1008px) 960px, calc(100vw - 3rem)"
          className="aspect-[16/10] sm:aspect-[2/1] rounded-sm"
        />
      </div>

      <dl className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-sm border border-background-inverse/10 bg-background-inverse/10">
        {facts.map((fact) => (
          <div key={fact.label} className="bg-background px-4 py-3">
            <dt className="text-[0.6875rem] uppercase tracking-[0.12em] text-foreground-secondary">
              {fact.label}
            </dt>
            <dd className="mt-1 text-sm">{fact.value}</dd>
          </div>
        ))}
      </dl>

      {(project.tags.length > 0 || project.liveUrl) && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
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
              Visit the live site
              <ArrowUpRight size={14} />
            </a>
          )}
        </div>
      )}

      {sections.length > 0 ? (
        <div className="mt-16 sm:mt-20 space-y-12 sm:space-y-16">
          {sections.map((section, index) => (
            <section
              key={section.title ?? index}
              className="grid gap-3 sm:grid-cols-[10rem_1fr] sm:gap-8 border-t border-background-inverse/10 pt-6"
            >
              {section.title ? (
                <h2 className="text-xs uppercase tracking-[0.12em] text-foreground-secondary">
                  <span className="tabular-nums mr-3">{String(index + 1).padStart(2, "0")}</span>
                  {section.title}
                </h2>
              ) : (
                <span />
              )}
              <div className="case-study">
                <ReactMarkdown>{section.body}</ReactMarkdown>
              </div>
            </section>
          ))}
        </div>
      ) : (
        <p className="mt-16 text-sm text-foreground-secondary">
          The full write-up is on its way.
        </p>
      )}

      <nav
        aria-label="More projects"
        className="mt-20 grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-t border-background-inverse/10 pt-6"
      >
        {previous ? (
          <ProjectLink project={previous} linkMode={linkMode} direction="previous" />
        ) : (
          <span />
        )}
        <Link
          href="/projects"
          aria-label="All projects"
          title="All projects"
          className="flex size-10 items-center justify-center rounded-full border border-background-inverse/10 hover:bg-background-secondary transition-colors duration-200"
        >
          <LayoutGrid size={16} />
        </Link>
        {next ? (
          <ProjectLink project={next} linkMode={linkMode} direction="next" />
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}

function ProjectLink({
  project,
  linkMode,
  direction,
}: {
  project: Project;
  linkMode: "soft" | "hard";
  direction: "previous" | "next";
}) {
  const isNext = direction === "next";
  const Arrow = isNext ? ArrowRight : ArrowLeft;
  const content = (
    <>
      <span
        className={`flex items-center gap-1.5 text-[0.6875rem] uppercase tracking-[0.12em] text-foreground-secondary ${
          isNext ? "justify-end" : ""
        }`}
      >
        {!isNext && (
          <Arrow size={12} className="transition-transform duration-300 group-hover:-translate-x-1" />
        )}
        {isNext ? "Next" : "Previous"}
        {isNext && (
          <Arrow size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
        )}
      </span>
      <span className="mt-1 block truncate text-sm font-medium">{project.name}</span>
    </>
  );
  const className = `group min-w-0 ${isNext ? "justify-self-end text-right" : "justify-self-start"}`;
  const href = `/projects/${project.slug}`;
  return linkMode === "soft" ? (
    // replace: closing the modal still returns to the page underneath.
    <Link href={href} replace scroll={false} className={className}>
      {content}
    </Link>
  ) : (
    <a href={href} className={className}>
      {content}
    </a>
  );
}
