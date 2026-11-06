import Workspace from "@/components/workspace/Workspace";
import { getCurrentRole, getProfile, getProjects, hasPage } from "@/lib/content";

export default function Home() {
  const { name, title, email, links, hero_prompts } = getProfile();
  const projects = getProjects();
  const current = getCurrentRole();
  // One line beside the name: what I do, where, and what now. All from /content.
  const tagline = [
    `${title}, based in ${getProfile().location}.`,
    current && `Now ${current.role} at ${current.company}.`,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <Workspace
      name={name}
      title={title}
      email={email}
      links={links}
      heroPrompts={hero_prompts ?? []}
      tagline={tagline}
      caseStudies={projects.filter((p) => p.type !== "client" && hasPage(p))}
      websites={projects.filter((p) => p.type === "client")}
    />
  );
}
