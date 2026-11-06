"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, X } from "lucide-react";
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
  /** Short facts shown under the intro ("Based in", "Now", "Building"). */
  facts: { label: string; value: string }[];
  caseStudies: Project[];
  websites: Project[];
}

/**
 * The home page. The chat starts on its own; "Work" and "AI Notes" open a
 * panel beside it, and the two then share the screen half and half. Each side scrolls on its own. On phones the panel
 * is a sheet that slides over the chat.
 */
export default function Workspace({
  name,
  title,
  email,
  links,
  starterQuestions,
  facts,
  caseStudies,
  websites,
}: Props) {
  const session = useChatSession(email);
  const [tab, setTab] = useState<Tab>("work");
  // Whether the side panel is showing (a sheet over the chat on phones).
  const [panelOpen, setPanelOpen] = useState(false);
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
      setPanelOpen(true);
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
      else setPanelOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [projectOpen, closeProject]);

  const actions = useMemo(() => ({ openProject }), [openProject]);

  // Desktop: the tabs float over both headers and glide between them. With
  // the panel closed they sit at the chat header's right (left of the "new
  // conversation" button); open, at the start of the panel's header. The
  // panel's widths here mirror its classes below.
  const navRef = useRef<HTMLDivElement>(null);
  const [navLeft, setNavLeft] = useState<number | null>(null);
  useEffect(() => {
    const place = () => {
      const width = window.innerWidth;
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const navWidth = navRef.current?.offsetWidth ?? 0;
      const panelWidth = width / 2;
      setNavLeft(
        panelOpen
          ? width - panelWidth + 1.5 * rem
          : width - 1 * rem - 2 * rem - 0.75 * rem - navWidth,
      );
    };
    place();
    const observer = new ResizeObserver(place);
    if (navRef.current) observer.observe(navRef.current);
    window.addEventListener("resize", place);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", place);
    };
  }, [panelOpen]);
  const topicCount = session.topics.length;

  // The header buttons open the panel on a tab, or close it if that tab
  // is already showing.
  const togglePanel = (next: Tab) => {
    if (panelOpen && tab === next) {
      setPanelOpen(false);
      closeProject();
      return;
    }
    setTab(next);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    closeProject();
  };

  // The one set of tabs. Closed panel: both are quiet links that open it.
  // Open panel: the current tab is underlined.
  const tabs = (
    <div className="flex items-center gap-5">
      {(["work", "notes"] as const).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => {
            setTab(value);
            setPanelOpen(true);
          }}
          aria-pressed={panelOpen && tab === value}
          className={`relative h-12 text-xs cursor-pointer transition-colors ${
            panelOpen && tab === value
              ? "text-foreground"
              : "text-foreground-secondary hover:text-foreground"
          }`}
        >
          {value === "work" ? "Work" : "AI Notes"}
          {value === "notes" && topicCount > 0 && (
            <span className="ml-1.5 tabular-nums text-foreground-secondary">{topicCount}</span>
          )}
          <span
            className={`absolute inset-x-0 bottom-0 h-px origin-left bg-foreground transition-transform duration-500 ${EASE} ${
              panelOpen && tab === value ? "scale-x-100" : "scale-x-0"
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <WorkspaceContext.Provider value={actions}>
      <div data-workspace className="h-dvh w-full overflow-hidden lg:flex">
        <div
          ref={navRef}
          style={{ left: navLeft ?? undefined }}
          className={`fixed top-0 z-[55] hidden lg:block transition-[left,opacity] duration-[520ms] ${EASE} ${
            navLeft === null ? "opacity-0" : "opacity-100"
          }`}
        >
          {tabs}
        </div>
        {/* Chat */}
        <div className="h-full min-h-0 min-w-0 lg:flex-1 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
          <ChatPane
            name={name}
            title={title}
            email={email}
            links={links}
            starterQuestions={starterQuestions}
            facts={facts}
            messages={session.messages}
            isLoading={session.isLoading}
            send={session.send}
            reset={() => {
              session.reset();
              closeProject();
            }}
            panelButtons={
              <div className="flex items-center gap-1 lg:hidden">
                {(["work", "notes"] as const).map((value) => {
                  const active = panelOpen && tab === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => togglePanel(value)}
                      aria-pressed={active}
                      className={`rounded-md px-2.5 py-1.5 text-xs cursor-pointer transition-colors ${
                        active
                          ? "bg-background-inverse/8 text-foreground"
                          : "text-foreground-secondary hover:bg-background-inverse/6 hover:text-foreground"
                      }`}
                    >
                      {value === "work" ? "Work" : "AI Notes"}
                      {value === "notes" && topicCount > 0 && (
                        <span className="ml-1.5 tabular-nums">{topicCount}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            }
          />
        </div>

        {/* Work and notes. Desktop: half the screen beside the chat.
            Phones: a sheet over the chat. */}
        <div
          className={`fixed inset-0 z-50 flex flex-col overflow-hidden bg-background transition-[translate,width] duration-[520ms] ${EASE} pt-[env(safe-area-inset-top)] lg:relative lg:inset-auto lg:z-auto lg:shrink-0 lg:translate-x-0 lg:pt-0 lg:border-background-inverse/10 ${
            panelOpen ? "translate-x-0 lg:border-l" : "translate-x-full lg:border-l-0"
          } ${panelOpen ? "lg:w-1/2" : "lg:w-0"}`}
        >
          {/* Keeps the content from squeezing while the panel closes. */}
          <div className="flex h-full min-h-0 flex-col lg:min-w-[24rem]">
          <div className="flex h-12 shrink-0 items-center justify-between gap-4 border-b border-background-inverse/10 px-6">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={closePanel}
                aria-label="Back to the chat"
                className="-ml-2 flex size-8 items-center justify-center rounded-md hover:bg-background-inverse/6 cursor-pointer lg:hidden"
              >
                <ArrowLeft size={16} />
              </button>
              <div className="lg:hidden">{tabs}</div>
            </div>
            <button
              type="button"
              onClick={closePanel}
              aria-label="Close panel"
              title="Close"
              className="-mr-2 hidden size-8 items-center justify-center rounded-md text-foreground-secondary hover:bg-background-inverse/6 hover:text-foreground cursor-pointer lg:flex"
            >
              <X size={15} />
            </button>
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
      </div>
    </WorkspaceContext.Provider>
  );
}
