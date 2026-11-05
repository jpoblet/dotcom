import type { Metadata } from "next";
import ProjectsIndex from "@/components/ProjectsIndex";
import { getProfile } from "@/lib/content";

export function generateMetadata(): Metadata {
  return { title: `Projects | ${getProfile().name}` };
}

export default function ProjectsPage() {
  return <ProjectsIndex />;
}
