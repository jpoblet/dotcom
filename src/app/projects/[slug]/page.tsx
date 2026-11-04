import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import PageHeader from "@/components/PageHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  getProfile,
  getProject,
  getProjects,
  hasPage,
  projectMeta,
  stripEmptySections,
} from "@/lib/content";

// Only projects with a page are built; any other slug is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects()
    .filter(hasPage)
    .map((project) => ({ slug: project.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};
  const { name } = getProfile();
  const title = `${project.name} | ${name}`;
  const description = project.summary || undefined;
  // The preview image comes from ./opengraph-image.tsx (which uses the
  // thumbnail when there is one). openGraph/twitter replace the root layout's
  // objects wholesale, so restate the fields here.
  return {
    title,
    description,
    openGraph: {
      type: "article",
      url: `/projects/${project.slug}`,
      siteName: name,
      title,
      description,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ProjectPage({ params }: Props) {
  const project = getProject((await params).slug);
  if (!project || !hasPage(project)) notFound();

  const { email, links } = getProfile();
  const meta = projectMeta(project);
  const body = stripEmptySections(project.body);
  const ask = `/?ask=${encodeURIComponent(`Tell me more about ${project.name}`)}`;

  return (
    <div className="min-h-dvh flex flex-col">
      <PageHeader />

      <main className="flex-1 w-full max-w-3xl mx-auto px-6 pt-10 sm:pt-16 pb-24">
        {project.draft && (
          <p className="mb-6 inline-block rounded-full bg-background-inverse/8 px-3 py-1 text-xs text-foreground-secondary">
            Draft: only visible in development
          </p>
        )}

        {meta && <p className="text-xs text-foreground-secondary">{meta}</p>}
        <h1 className="mt-2 text-2xl sm:text-3xl leading-snug font-medium">
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
              <li
                key={tag}
                className="rounded-full bg-background-inverse/8 px-4 py-2 text-xs"
              >
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
          <article className="case-study mt-12">
            <ReactMarkdown>{body}</ReactMarkdown>
          </article>
        ) : (
          <p className="mt-12 text-sm text-foreground-secondary">
            The full write-up is on its way.
          </p>
        )}

        <div className="mt-16 rounded-3xl border border-background-inverse/10 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-sm">Curious about the details? Ask me anything about it.</p>
          <Link
            href={ask}
            className="self-start sm:self-auto shrink-0 rounded-full bg-background-inverse px-5 py-3 text-xs text-background hover:opacity-70 transition-opacity duration-200"
          >
            Ask me about this project
          </Link>
        </div>
      </main>

      <SiteFooter
        email={email}
        links={links}
        className="pt-5 sm:pt-10 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:pb-[calc(2.5rem+env(safe-area-inset-bottom))]"
      />
    </div>
  );
}
