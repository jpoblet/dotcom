import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ProjectCover from "@/components/ProjectCover";
import { type Project, getProjects, hasPage, projectMeta } from "@/lib/content";

/** "www.example.com/" -> "example.com" */
const displayUrl = (url: string) =>
  url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

function SectionTitle({ index, title, count }: { index: string; title: string; count: number }) {
  return (
    <div className="flex items-baseline gap-4 text-xs">
      <span className="tabular-nums text-foreground-secondary">{index}</span>
      <h2 className="font-medium uppercase tracking-[0.12em]">{title}</h2>
      <span className="h-px flex-1 translate-y-[-0.2rem] bg-background-inverse/15" />
      <span className="tabular-nums text-foreground-secondary">
        {String(count).padStart(2, "0")}
      </span>
    </div>
  );
}

/** Big card: cover on top, then meta, title, summary and a call to action. */
function FeatureCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.slug}`} className="group block">
      <ProjectCover
        name={project.name}
        accent={project.accent}
        thumbnail={project.thumbnail}
        sizes="(min-width: 848px) 388px, (min-width: 640px) 50vw, calc(100vw - 3rem)"
        className="aspect-[3/2] rounded-sm"
      />
      <div className="mt-4">
        <p className="text-xs text-foreground-secondary">{projectMeta(project)}</p>
        <h3 className="mt-1 text-lg font-medium leading-snug">
          {project.name}
          {project.draft && <DraftBadge />}
        </h3>
        <div>
          <p className="mt-2 text-sm leading-relaxed text-foreground-secondary line-clamp-3">
            {project.summary}
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs">
            Read the case study
            <ArrowRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </p>
        </div>
      </div>
    </Link>
  );
}

/** Grid card: cover, then title and a short summary. */
function GridCard({ project }: { project: Project }) {
  return (
    <div className="flex flex-col">
      <Link href={`/projects/${project.slug}`} className="group block">
        <ProjectCover
          name={project.name}
          accent={project.accent}
          thumbnail={project.thumbnail}
          sizes="(min-width: 848px) 251px, (min-width: 640px) 50vw, calc(100vw - 3rem)"
          className="aspect-[4/3] rounded-sm"
        />
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <h3 className="text-sm font-medium">
            {project.name}
            {project.draft && <DraftBadge />}
          </h3>
          {project.year && (
            <span className="shrink-0 text-xs text-foreground-secondary">{project.year}</span>
          )}
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-foreground-secondary line-clamp-2">
          {project.summary}
        </p>
      </Link>
      {project.liveUrl && (
        <a
          href={project.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex w-fit items-center gap-1 text-xs underline underline-offset-2 hover:opacity-70 transition-opacity"
        >
          {displayUrl(project.liveUrl)}
          <ArrowUpRight size={12} />
        </a>
      )}
    </div>
  );
}

/** Compact row for client websites: they link straight to the live site. */
function WebsiteRow({ project }: { project: Project }) {
  const content = (
    <>
      <span className="min-w-0">
        <span className="block text-sm font-medium">{project.name}</span>
        <span className="block text-xs text-foreground-secondary truncate">
          {project.role}
        </span>
      </span>
      <span className="hidden sm:block text-xs text-foreground-secondary">
        {project.year}
      </span>
      <span className="justify-self-end inline-flex items-center gap-1 text-xs text-foreground-secondary group-hover:text-foreground transition-colors">
        {project.liveUrl ? (
          <>
            <span className="hidden sm:inline">{displayUrl(project.liveUrl)}</span>
            <ArrowUpRight
              size={14}
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </>
        ) : (
          "Coming soon"
        )}
      </span>
    </>
  );
  const className =
    "group grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_8rem_13rem] items-center gap-4 py-4 border-b border-background-inverse/10";
  return (
    <li>
      {project.liveUrl ? (
        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className={className}>
          {content}
        </a>
      ) : (
        <div className={className}>{content}</div>
      )}
    </li>
  );
}

function DraftBadge() {
  return (
    <span className="ml-2 align-middle rounded-full bg-background-inverse/8 px-2 py-0.5 text-[0.6875rem] font-normal text-foreground-secondary">
      Draft
    </span>
  );
}

/** The /projects page body. Same 800px content width as the case studies. */
export default function ProjectsIndex() {
  const projects = getProjects();
  const work = projects.filter((p) => p.type === "work" && hasPage(p));
  const personal = projects.filter((p) => p.type === "personal" && hasPage(p));
  // Client websites have no case study; they're listed with their live link.
  const websites = projects.filter((p) => p.type === "client");

  let section = 0;
  const nextIndex = () => String(++section).padStart(2, "0");

  return (
    <div className="min-h-dvh flex flex-col">
      <PageHeader />

      <main className="flex-1 w-full max-w-[calc(50rem+3rem)] mx-auto px-6 pt-12 sm:pt-20 pb-40 sm:pb-48">
        <h1 className="text-4xl sm:text-6xl font-medium leading-[1.05] tracking-tight">
          Projects
        </h1>
        <p className="mt-6 max-w-xl text-sm sm:text-base leading-relaxed text-foreground-secondary">
          Case studies from my jobs, products I&apos;ve designed and built
          myself, and websites for people I like working with.
        </p>

        {work.length > 0 && (
          <section className="mt-16 sm:mt-24">
            <SectionTitle index={nextIndex()} title="Work" count={work.length} />
            <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2">
              {work.map((project) => (
                <FeatureCard key={project.slug} project={project} />
              ))}
            </div>
          </section>
        )}

        {personal.length > 0 && (
          <section className="mt-20 sm:mt-28">
            <SectionTitle index={nextIndex()} title="Built by me" count={personal.length} />
            <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {personal.map((project) => (
                <GridCard key={project.slug} project={project} />
              ))}
            </div>
          </section>
        )}

        {websites.length > 0 && (
          <section className="mt-20 sm:mt-28">
            <SectionTitle index={nextIndex()} title="Websites" count={websites.length} />
            <ul className="mt-4 border-t border-background-inverse/10">
              {websites.map((project) => (
                <WebsiteRow key={project.slug} project={project} />
              ))}
            </ul>
          </section>
        )}

        {work.length + personal.length + websites.length === 0 && (
          <p className="mt-10 text-sm leading-relaxed text-foreground-secondary">
            Case studies are on their way. In the meantime,{" "}
            <Link href="/" className="underline underline-offset-2 text-foreground">
              ask me about my work
            </Link>
            .
          </p>
        )}
      </main>
    </div>
  );
}
