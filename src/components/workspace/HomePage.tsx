import Workspace from "@/components/workspace/Workspace";
import type { View } from "@/components/workspace/WorkspaceContext";
import { getCaseStudies, getProfile, getProjects } from "@/lib/content";
import { getArticles, mediumFeedUrl } from "@/lib/medium";

/**
 * The home page, server side: loads everything the workspace shows. Used by
 * "/", "/work", "/notes" and "/work/<slug>", each opening the side panel
 * where the address says.
 */
export default async function HomePage({ initialView }: { initialView?: View }) {
  const { name, title, email, links, starter_questions } = getProfile();
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
      caseStudies={getCaseStudies()}
      websites={getProjects().filter((p) => p.type === "client")}
      articles={articles}
      initialView={initialView}
    />
  );
}
