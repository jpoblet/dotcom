import Workspace from "@/components/workspace/Workspace";
import { getCurrentRole, getProfile, getProjects, hasPage } from "@/lib/content";

export default function Home() {
  const { name, title, email, links, location, timezone, starter_questions } = getProfile();
  const projects = getProjects();
  const current = getCurrentRole();
  return (
    <Workspace
      name={name}
      title={title}
      email={email}
      links={links}
      now={current ? `${current.role} at ${current.company}` : undefined}
      timeZone={timezone ?? "Europe/Madrid"}
      city={location.split(",")[0]}
      starterQuestions={starter_questions ?? []}
      caseStudies={projects.filter((p) => p.type !== "client" && hasPage(p))}
      websites={projects.filter((p) => p.type === "client")}
    />
  );
}
