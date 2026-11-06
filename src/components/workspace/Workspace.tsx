"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { track } from "@/lib/analytics";
import type { Project } from "@/lib/content";
import { useChatSession } from "@/lib/use-chat-session";
import ChatPane from "./ChatPane";
import NotesPanel from "./NotesPanel";
import { ProjectView, WorkOverview } from "./WorkPanel";
import { WorkspaceContext } from "./WorkspaceContext";

type Tab = "work" | "notes";

/** Matches the panel transitions' duration. */
const SLIDE_MS = 520;
/** Sharp start, long soft landing. */
const EASE = "ease-[cubic-bezier(0.32,0.72,0,1)]";

interface Props {
  name: string;
  title: string;
  email: string;
  links: { label: string; href: string }[];
  starterQuestions: string[];
  caseStudies: Project[];
  websites: Project[];
}

/**
 * The home page: the chat on the left and the work beside it, each
 * scrolling on its own. Projects opened from the chat slide in on the
 * right. On phones the right side becomes a sheet that slides over the
 * chat.
 */
export default function Workspace({
  name,
  title,
  email,
  links,
  starterQuestions,
  caseStudies,
  websites,
}: Props) {
  const session = useChatSession(email);
  const [tab, setTab] = useState<Tab>("work");
  const [sheetOpen, setSheetOpen] = useState(false);
  // The project on screen, and whether its panel is slid in. The slug
  // outlives the panel by one transition, so it can slide out with content.
  const [slug, setSlug] = useState<string | null>(null);
  const [projectOpen, setProjectOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const projectScroll = useRef<HTMLDivElement>(null);

  const project = useMemo(
    () => caseStudies.find((p) => p.slug === slug) ?? null,
    [caseStudies, slug],
  );

  const openProject = useCallback(
    (next: string) => {
      if (!caseStudies.some((p) => p.slug === next)) return;
      clearTimeout(closeTimer.current);
      track("Project opened", { project: next });
      setTab("work");
      setSheetOpen(true);
      setSlug(next);
      projectScroll.current?.scrollTo({ top: 0 });
      // Next frame, so a freshly mounted panel animates in from the side.
      requestAnimationFrame(() => setProjectOpen(true));
    },
    [caseStudies],
  );

  const closeProject = useCallback(() => {
    setProjectOpen(false);
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setSlug(null), SLIDE_MS);
  }, []);

  // Escape steps back: project, then the mobile sheet.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (projectOpen) closeProject();
      else setSheetOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [projectOpen, closeProject]);

  const actions = useMemo(() => ({ openProject }), [openProject]);
  const topicCount = session.topics.length;

  const openSheet = (next: Tab) => {
    setTab(next);
    setSheetOpen(true);
  };

  const tabs = (
    <div className="flex items-center gap-5">
      {(["work", "notes"] as const).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => setTab(value)}
          aria-pressed={tab === value}
          className={`relative h-12 text-xs cursor-pointer transition-colors ${
            tab === value ? "text-foreground" : "text-foreground-secondary hover:text-foreground"
          }`}
        >
          {value === "work" ? "Work" : "Notes"}
          {value === "notes" && topicCount > 0 && (
            <span className="ml-1.5 tabular-nums text-foreground-secondary">{topicCount}</span>
          )}
          <span
            className={`absolute inset-x-0 bottom-0 h-px origin-left bg-foreground transition-transform duration-500 ${EASE} ${
              tab === value ? "scale-x-100" : "scale-x-0"
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <WorkspaceContext.Provider value={actions}>
      <div data-workspace className="h-dvh w-full overflow-hidden lg:grid lg:grid-cols-[minmax(22rem,30rem)_1fr]">
        {/* Chat */}
        <div className="h-full min-h-0 lg:border-r lg:border-background-inverse/10 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
          <ChatPane
            name={name}
            title={title}
            email={email}
            links={links}
            starterQuestions={starterQuestions}
            messages={session.messages}
            isLoading={session.isLoading}
            send={session.send}
            reset={() => {
              session.reset();
              closeProject();
            }}
            mobileNav={
              <div className="flex items-center gap-1 lg:hidden">
                <button
                  type="button"
                  onClick={() => openSheet("work")}
                  className="rounded-md px-2.5 py-1.5 text-xs hover:bg-background-inverse/6 cursor-pointer"
                >
                  Work
                </button>
                <button
                  type="button"
                  onClick={() => openSheet("notes")}
                  className="rounded-md px-2.5 py-1.5 text-xs hover:bg-background-inverse/6 cursor-pointer"
                >
                  Notes
                  {topicCount > 0 && (
                    <span className="ml-1 tabular-nums text-foreground-secondary">{topicCount}</span>
                  )}
                </button>
              </div>
            }
          />
        </div>

        {/* Work and notes. Phones: a sheet that slides over the chat. */}
        <div
          className={`fixed inset-0 z-50 flex flex-col bg-background transition-transform duration-[520ms] ${EASE} pt-[env(safe-area-inset-top)] lg:static lg:z-auto lg:translate-x-0 lg:pt-0 ${
            sheetOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex h-12 shrink-0 items-center gap-4 border-b border-background-inverse/10 px-6 sm:px-10">
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              aria-label="Back to the chat"
              className="-ml-2 flex size-8 items-center justify-center rounded-md hover:bg-background-inverse/6 cursor-pointer lg:hidden"
            >
              <ArrowLeft size={16} />
            </button>
            {tabs}
          </div>

          {/* Tabs slide side by side. */}
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <div
              className={`absolute inset-0 overflow-hidden transition-[translate,opacity] duration-[520ms] ${EASE} ${
                tab === "work" ? "translate-x-0 opacity-100" : "-translate-x-[12%] opacity-0 pointer-events-none"
              }`}
              aria-hidden={tab !== "work"}
            >
              {/* Overview, nudged back while a project covers it. */}
              <div
                className={`absolute inset-0 overflow-y-auto transition-[translate,opacity] duration-[520ms] ${EASE} ${
                  projectOpen ? "-translate-x-[8%] opacity-40" : "translate-x-0 opacity-100"
                }`}
              >
                <WorkOverview caseStudies={caseStudies} websites={websites} onOpen={openProject} />
              </div>

              {/* Project, sliding in from the right. */}
              <div
                ref={projectScroll}
                className={`absolute inset-0 overflow-y-auto bg-background transition-[translate,box-shadow] duration-[520ms] ${EASE} ${
                  projectOpen
                    ? "translate-x-0 shadow-[-24px_0_48px_-24px_rgb(0_0_0/0.18)]"
                    : "translate-x-full shadow-none"
                }`}
                aria-hidden={!projectOpen}
              >
                {project && (
                  <ProjectView
                    key={project.slug}
                    project={project}
                    caseStudies={caseStudies}
                    onOpen={openProject}
                    onBack={closeProject}
                  />
                )}
              </div>
            </div>

            <div
              className={`absolute inset-0 overflow-y-auto transition-[translate,opacity] duration-[520ms] ${EASE} ${
                tab === "notes" ? "translate-x-0 opacity-100" : "translate-x-[12%] opacity-0 pointer-events-none"
              }`}
              aria-hidden={tab !== "notes"}
            >
              <NotesPanel
                topics={session.topics}
                messages={session.messages}
                name={name}
                onOpenProject={openProject}
              />
            </div>
          </div>
        </div>
      </div>
    </WorkspaceContext.Provider>
  );
}
