import { notFound } from "next/navigation";
import ProjectDetail from "@/components/ProjectDetail";
import ProjectModal from "@/components/ProjectModal";
import { getProject, getProjects, hasPage } from "@/lib/content";

// Intercepts links to /projects/<slug> from inside the site, so the case
// study opens as a modal over the current page (the chat stays as it was).
export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects()
    .filter(hasPage)
    .map((project) => ({ slug: project.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export default async function ProjectModalPage({ params }: Props) {
  const project = getProject((await params).slug);
  if (!project || !hasPage(project)) notFound();

  return (
    <ProjectModal closeTo="back">
      <ProjectDetail project={project} />
    </ProjectModal>
  );
}
