import Workspace from "@/components/workspace/Workspace";
import { getProfile, getProjects, hasPage } from "@/lib/content";
import { getArticles, mediumFeedUrl } from "@/lib/medium";

export default async function Home() {
  const { name, title, email, links, starter_questions } = getProfile();
  const projects = getProjects();
  // Articles from the Medium profile listed in profile.yaml, if there is one.
  const medium = links.map((link) => mediumFeedUrl(link.href)).find(Boolean);
  const articles = medium ? await getArticles(medium) : [];
  return (
    <Workspace
      name={name}
      title={title}
      email={email}
      links={links}
      starterQuestions={starter_questions ?? []}
      caseStudies={projects.filter((p) => p.type !== "client" && hasPage(p))}
      websites={projects.filter((p) => p.type === "client")}
      articles={articles}
    />
  );
}
