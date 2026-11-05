import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  getProfile,
  getProjects,
  hasPage,
  PROJECT_TYPES,
  projectMeta,
} from "@/lib/content";

export function generateMetadata(): Metadata {
  return { title: `Projects | ${getProfile().name}` };
}

export default function ProjectsPage() {
  const { email, links } = getProfile();
  const projects = getProjects().filter(hasPage);

  return (
    <div className="min-h-dvh flex flex-col">
      <PageHeader />

      <main className="flex-1 w-full max-w-3xl mx-auto px-6 pt-10 sm:pt-16 pb-24">
        <h1 className="text-2xl sm:text-3xl leading-snug font-medium">Projects</h1>

        {projects.length === 0 ? (
          <p className="mt-6 text-sm leading-relaxed text-foreground-secondary">
            Case studies are on their way. In the meantime,{" "}
            <Link href="/" className="underline underline-offset-2 text-foreground">
              ask me about my work
            </Link>
            .
          </p>
        ) : (
          PROJECT_TYPES.map(({ type, title }) => {
            const group = projects.filter((p) => p.type === type);
            if (group.length === 0) return null;
            return (
              <section key={type} className="mt-10">
                <h2 className="text-sm text-foreground-secondary">{title}</h2>
                <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                  {group.map((project) => {
                    const meta = projectMeta(project);
                    return (
                      <li key={project.slug}>
                        <Link
                          href={`/projects/${project.slug}`}
                          className="block h-full overflow-hidden rounded-3xl border border-background-inverse/10 hover:bg-background-secondary transition-colors duration-200"
                        >
                          {project.thumbnail && (
                            <div className="relative aspect-[16/9] bg-background-secondary">
                              <Image
                                src={project.thumbnail}
                                alt=""
                                fill
                                sizes="(min-width: 640px) 24rem, 100vw"
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="p-6 space-y-2">
                            {meta && (
                              <p className="text-xs text-foreground-secondary">{meta}</p>
                            )}
                            <h3 className="text-base font-medium">
                              {project.name}
                              {project.draft && (
                                <span className="ml-2 align-middle rounded-full bg-background-inverse/8 px-2 py-0.5 text-[0.6875rem] font-normal text-foreground-secondary">
                                  Draft
                                </span>
                              )}
                            </h3>
                            {project.summary && (
                              <p className="text-sm leading-relaxed text-foreground-secondary line-clamp-3">
                                {project.summary}
                              </p>
                            )}
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })
        )}
      </main>

      <SiteFooter
        email={email}
        links={links}
        className="pt-5 sm:pt-10 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:pb-[calc(2.5rem+env(safe-area-inset-bottom))]"
      />
    </div>
  );
}
