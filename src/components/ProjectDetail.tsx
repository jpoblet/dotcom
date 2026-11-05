import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { type Project, projectMeta, stripEmptySections } from "@/lib/content";

/** A project's case study. Shown inside ProjectModal. */
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
        <p className="mt-4 text-sm sm:text-base leading-relaxed text-foreground-secondary">
          {project.summary}
        </p>
      )}

      {project.tags.length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <li key={tag} className="rounded-full bg-background-inverse/8 px-4 py-2 text-xs">
              {tag}
            </li>
          ))}
        </ul>
      )}

      {project.thumbnail && (
        <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-3xl border border-background-inverse/10 bg-background-secondary">
          <Image
            src={project.thumbnail}
            alt={project.name}
            fill
            priority
            sizes="(min-width: 768px) 48rem, 100vw"
            className="object-cover"
          />
        </div>
      )}

      {body ? (
        <div className="case-study mt-12">
          <ReactMarkdown>{body}</ReactMarkdown>
        </div>
      ) : (
        <p className="mt-12 text-sm text-foreground-secondary">
          The full write-up is on its way.
        </p>
      )}

      <div className="mt-16 rounded-3xl border border-background-inverse/10 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
