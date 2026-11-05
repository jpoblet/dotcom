import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectDetail from "@/components/ProjectDetail";
import ProjectModal from "@/components/ProjectModal";
import ProjectsIndex from "@/components/ProjectsIndex";
import { getProfile, getProject, getProjects, hasPage } from "@/lib/content";

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

// Opened directly (or reloaded): the case study opens as a modal over the
// projects list. Navigating from inside the site uses the intercepting route
// in app/@modal instead, which keeps the previous page underneath.
export default async function ProjectPage({ params }: Props) {
  const project = getProject((await params).slug);
  if (!project || !hasPage(project)) notFound();

  return (
    <>
      <ProjectsIndex />
      <ProjectModal closeTo="/projects">
        <ProjectDetail project={project} />
      </ProjectModal>
    </>
  );
}
