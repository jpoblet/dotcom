"use client";

import Link from "next/link";
import ProjectLogoTile from "@/components/ProjectLogoTile";
import { useWorkspace } from "@/components/workspace/WorkspaceContext";
import type { ProjectCardData, TimelineEntry, Widget } from "@/lib/widgets";

/** Horizontal card: brand tile on the left, details on the right. */
function ProjectCard({ project }: { project: ProjectCardData }) {
  const workspace = useWorkspace();
  const body = (
    <>
      <ProjectLogoTile
        project={project}
        sizes="8rem"
        compact
        className="w-24 sm:w-32 shrink-0 self-stretch min-h-24 border-0 border-r"
      />
      <div className="min-w-0 flex-1 p-4 space-y-1">
        {project.meta && (
          <p className="text-xs text-foreground-secondary truncate">
            {project.meta}
          </p>
        )}
        <p className="text-sm font-medium">{project.name}</p>
        {project.summary && (
          <p className="text-xs leading-relaxed text-foreground-secondary line-clamp-2">
            {project.summary}
          </p>
        )}
        <p className="pt-1 text-xs">
          {project.href ? (
            <span className="inline-flex items-center gap-1 underline underline-offset-2">
              View project
            </span>
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
    "group flex w-full sm:w-[28rem] overflow-hidden rounded-sm border border-background-inverse/10 bg-background text-foreground transition-colors duration-200";

  // In the split workspace, cards open the project beside the chat.
  if (workspace && project.href) {
    return (
      <button
        type="button"
        onClick={() => workspace.openProject(project.slug)}
        className={`${className} text-left cursor-pointer hover:bg-background-secondary`}
      >
        {body}
      </button>
    );
  }

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
    <ol className="w-full sm:max-w-md rounded-sm border border-background-inverse/10 p-5">
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
    <div className="w-full sm:max-w-md rounded-sm border border-background-inverse/10 p-5 space-y-4">
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
