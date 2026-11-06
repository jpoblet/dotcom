import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import ProjectIndexList, { type IndexItem } from "@/components/ProjectIndexList";
import { type Project, getProjects, hasPage } from "@/lib/content";

function toItem(project: Project, href?: string, external = false): IndexItem {
  return {
    key: project.slug,
    name: project.name,
    href,
    external,
    role: project.company ? `${project.company} · ${project.role}` : project.role,
    year: project.year,
    accent: project.accent,
    logo: project.logo,
    brandBackground: project.brandBackground,
  };
}

function SectionTitle({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-baseline justify-between text-xs uppercase tracking-[0.12em]">
      <h2 className="font-medium">{title}</h2>
      <span className="tabular-nums text-foreground-secondary">
        {String(count).padStart(2, "0")}
      </span>
    </div>
  );
}

/**
 * The /projects page: a giant typographic index, most recent first. Case
 * studies are set huge; websites follow, smaller, linking to the live site.
 */
export default function ProjectsIndex() {
  const projects = getProjects();
  const caseStudies = projects.filter((p) => p.type !== "client" && hasPage(p));
  const websites = projects.filter((p) => p.type === "client");
  const years = projects
    .flatMap((p) => p.year.match(/\d{4}/g) ?? [])
    .map(Number);
  const span = years.length ? `${Math.min(...years)}–${new Date().getFullYear()}` : "";

  return (
    <div className="min-h-dvh flex flex-col">
      <PageHeader />

      <main className="flex-1 w-full max-w-[90rem] mx-auto px-6 sm:px-10 pt-10 sm:pt-16 pb-40 sm:pb-48">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h1 className="text-[clamp(3.5rem,13vw,12rem)] font-medium leading-[0.85] tracking-[-0.05em]">
            Projects
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-foreground-secondary sm:pb-4">
            {caseStudies.length} case studies and {websites.length} websites
            {span && <>, {span}</>}. Case studies from my jobs and from products
            I&apos;ve built myself.
          </p>
        </div>

        {caseStudies.length > 0 && (
          <section className="mt-16 sm:mt-24">
            <SectionTitle title="Case studies" count={caseStudies.length} />
            <div className="mt-4">
              <ProjectIndexList
                size="large"
                items={caseStudies.map((p) => toItem(p, `/projects/${p.slug}`))}
              />
            </div>
          </section>
        )}

        {websites.length > 0 && (
          <section className="mt-24 sm:mt-32">
            <SectionTitle title="Websites" count={websites.length} />
            <div className="mt-4">
              <ProjectIndexList
                size="small"
                items={websites.map((p) => toItem(p, p.liveUrl || undefined, true))}
              />
            </div>
          </section>
        )}

        {caseStudies.length + websites.length === 0 && (
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
