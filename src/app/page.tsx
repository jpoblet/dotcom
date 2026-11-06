import Workspace from "@/components/workspace/Workspace";
import { getProfile, getProjects, hasPage } from "@/lib/content";

export default function Home() {
  const { name, title, email, links, starter_questions } = getProfile();
  const projects = getProjects();
  return (
    <Workspace
      name={name}
      title={title}
      email={email}
      links={links}
      starterQuestions={starter_questions ?? []}
      caseStudies={projects.filter((p) => p.type !== "client" && hasPage(p))}
      websites={projects.filter((p) => p.type === "client")}
    />
  );
}
