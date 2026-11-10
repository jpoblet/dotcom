import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HomePage from "@/components/workspace/HomePage";
import { getCaseStudies, getProfile, getProject, projectPath } from "@/lib/content";

// Only case studies get an address; any other slug is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getCaseStudies().map((project) => ({ slug: project.slug }));
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
      url: projectPath(project),
      siteName: name,
      title,
      description,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

// The home page, with this case study open in the side panel.
export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  if (!getCaseStudies().some((p) => p.slug === slug)) notFound();
  return <HomePage initialView={{ tab: "work", slug }} />;
}
