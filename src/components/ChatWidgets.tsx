import Link from "next/link";
import ProjectCover from "@/components/ProjectCover";
import type { ProjectCardData, TimelineEntry, Widget } from "@/lib/widgets";

function ProjectCard({ project }: { project: ProjectCardData }) {
  const body = (
    <>
      <ProjectCover
        name={project.name}
        accent={project.accent}
        thumbnail={project.thumbnail}
        sizes="(min-width: 640px) 18rem, 100vw"
        className="aspect-[16/9] border-0"
      />
      <div className="p-4 space-y-1.5">
        {project.meta && (
          <p className="text-[0.6875rem] text-foreground-secondary">
            {project.meta}
          </p>
        )}
        <p className="text-sm font-medium">{project.name}</p>
        {project.summary && (
          <p className="text-xs leading-relaxed text-foreground-secondary line-clamp-3">
            {project.summary}
          </p>
        )}
        <p className="pt-1 text-xs">
          {project.href ? (
            <span className="underline underline-offset-2">View project</span>
          ) : (
            <span className="text-foreground-secondary">
              Case study coming soon
            </span>
          )}
        </p>
      </div>
    </>
  );

  const className =
    "group block w-full sm:w-72 overflow-hidden rounded-2xl border border-background-inverse/10 bg-background text-foreground transition-colors duration-200";

  return project.href ? (
    <Link
      href={project.href}
      prefetch={false}
      className={`${className} hover:bg-background-secondary`}
    >
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

function Timeline({ roles }: { roles: TimelineEntry[] }) {
  return (
    <ol className="w-full sm:max-w-md rounded-2xl border border-background-inverse/10 p-5">
      {roles.map((role, index) => {
        const current = role.end === "Present";
        return (
          <li
            key={`${role.company}-${role.start}`}
            className="relative pl-6 pb-4 last:pb-0"
          >
            {/* Connector line + dot */}
            {index < roles.length - 1 && (
              <span className="absolute left-[0.2rem] top-3 bottom-0 w-px bg-background-inverse/15" />
            )}
            <span
              className={`absolute left-0 top-1.5 size-2 rounded-full border border-foreground ${current ? "bg-foreground" : "bg-background"}`}
            />
            <p className="text-sm font-medium">{role.role}</p>
            <p className="text-xs text-foreground-secondary">
              {role.company} · {role.start} – {role.end}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

function ContactCard({
  email,
  links,
}: {
  email: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="w-full sm:max-w-md rounded-2xl border border-background-inverse/10 p-5 space-y-4">
      <a
        href={`mailto:${email}`}
        className="inline-flex items-center rounded-full bg-background-inverse px-5 py-3 text-xs text-background hover:opacity-70 transition-opacity duration-200"
      >
        {email}
      </a>
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-background-inverse/8 px-4 py-2 text-xs text-foreground hover:bg-background-inverse/15 transition-colors duration-200"
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}

/** Rich blocks shown under an AI reply. */
export default function ChatWidgets({ widgets }: { widgets: Widget[] }) {
  return (
    <div className="mt-4 flex flex-wrap gap-3">
      {widgets.map((widget, index) => {
        switch (widget.kind) {
          case "project":
            return <ProjectCard key={index} project={widget.project} />;
          case "timeline":
            return <Timeline key={index} roles={widget.roles} />;
          case "contact":
            return (
              <ContactCard key={index} email={widget.email} links={widget.links} />
            );
        }
      })}
    </div>
  );
}
