import Workspace from "@/components/workspace/Workspace";
import { getCurrentRole, getProfile, getProjects, hasPage } from "@/lib/content";

export default function Home() {
  const { name, title, email, links, starter_questions } = getProfile();
  const projects = getProjects();
  const current = getCurrentRole();
  const building = projects.find((p) => p.type === "personal" && hasPage(p));
  // A few live facts under the intro, all from /content.
  const facts = [
    { label: "Based in", value: getProfile().location },
    current && { label: "Now", value: `${current.role}, ${current.company}` },
    building && { label: "Building", value: building.name },
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact));
  return (
    <Workspace
      name={name}
      title={title}
      email={email}
      links={links}
      starterQuestions={starter_questions ?? []}
      facts={facts}
      caseStudies={projects.filter((p) => p.type !== "client" && hasPage(p))}
      websites={projects.filter((p) => p.type === "client")}
    />
  );
}
