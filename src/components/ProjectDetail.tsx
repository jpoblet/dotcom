import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { type Project, projectMeta, stripEmptySections } from "@/lib/content";

/**
 * A project's case study, shown inside ProjectModal (about 1200px wide).
 * Text keeps a readable column; the hero image breaks out wider, up to
 * 1440px. Projects without a thumbnail get a plain placeholder.
 */
export default function ProjectDetail({ project }: { project: Project }) {
  const meta = projectMeta(project);
  const body = stripEmptySections(project.body);
  const ask = `/?ask=${encodeURIComponent(`Tell me more about ${project.name}`)}`;

  return (
    <article>
      {project.draft && (
        <p className="mb-6 inline-block rounded-full bg-background-inverse/8 px-3 py-1 text-xs text-foreground-secondary">
          Draft: only visible in development
        </p>
      )}

      {meta && <p className="text-xs text-foreground-secondary">{meta}</p>}
      <h1 id="project-title" className="mt-2 text-2xl sm:text-3xl leading-snug font-medium">
        {project.name}
      </h1>
      {project.summary && (
        <p className="mt-4 max-w-3xl text-sm sm:text-base leading-relaxed text-foreground-secondary">
          {project.summary}
        </p>
      )}

      {/* Wider than the content: centred on the screen, up to 1440px. */}
      <div className="relative left-1/2 -translate-x-1/2 mt-10 w-[min(calc(100vw-3rem),90rem)] aspect-[16/9] sm:aspect-[2/1] overflow-hidden rounded-3xl border border-background-inverse/10 bg-background-secondary">
        {project.thumbnail ? (
          <Image
            src={project.thumbnail}
            alt={project.name}
            fill
            priority
            sizes="(min-width: 1488px) 1440px, calc(100vw - 3rem)"
            className="object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center p-8 text-center text-xl sm:text-4xl font-medium text-foreground-secondary/40"
          >
            {project.name}
          </div>
        )}
      </div>

      {project.tags.length > 0 && (
        <ul className="mt-10 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <li key={tag} className="rounded-full bg-background-inverse/8 px-4 py-2 text-xs">
              {tag}
            </li>
          ))}
        </ul>
      )}

      {body ? (
        <div className="case-study mt-12 max-w-3xl">
          <ReactMarkdown>{body}</ReactMarkdown>
        </div>
      ) : (
        <p className="mt-12 text-sm text-foreground-secondary">
          The full write-up is on its way.
        </p>
      )}

      <div className="mt-16 max-w-3xl rounded-3xl border border-background-inverse/10 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-sm">Curious about the details? Ask me anything about it.</p>
        {/* A full page load, so the chat reads ?ask= even when it was
            already open underneath the modal. */}
        <a
          href={ask}
          className="self-start sm:self-auto shrink-0 rounded-full bg-background-inverse px-5 py-3 text-xs text-background hover:opacity-70 transition-opacity duration-200"
        >
          Ask me about this project
        </a>
      </div>
    </article>
  );
}
