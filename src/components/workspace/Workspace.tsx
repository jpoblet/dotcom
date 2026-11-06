"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { ArrowLeft, RotateCcw, X } from "lucide-react";
import { track } from "@/lib/analytics";
import type { Project } from "@/lib/content";
import { useChatSession } from "@/lib/use-chat-session";
import ChatPane from "./ChatPane";
import ConfirmDialog from "./ConfirmDialog";
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
 * The home page: the chat in the middle, opening with the name. "Work" and
 * "AI Notes" open a panel from the right; as it arrives the chat moves
 * over, the tabs cross into the panel's header and the name shrinks into
 * the corner under the logo (a view transition morphs each one; browsers
 * without them just switch). On phones the panel is a sheet.
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
  // Whether the side panel is showing (a sheet over the chat on phones).
  const [panelOpen, setPanelOpenState] = useState(false);
  const panelOpenRef = useRef(false);
  // The project on screen, and whether its panel is slid in. The slug
  // outlives the panel by one transition, so it can slide out with content.
  const [slug, setSlug] = useState<string | null>(null);
  const [projectOpen, setProjectOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const projectScroll = useRef<HTMLDivElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  /**
   * Opens or closes the panel. On desktop the change runs as a view
   * transition: the panel slides in, the chat glides over, and the name,
   * logo and tabs morph to their places in the new layout.
   */
  const setPanelOpen = useCallback((open: boolean, alongside?: () => void) => {
    const apply = () => {
      panelOpenRef.current = open;
      setPanelOpenState(open);
      alongside?.();
    };
    const doc = document as Document & { startViewTransition?: (update: () => void) => unknown };
    const animate =
      open !== panelOpenRef.current &&
      typeof doc.startViewTransition === "function" &&
      window.matchMedia("(min-width: 1024px)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (animate) doc.startViewTransition!(() => flushSync(apply));
    else apply();
  }, []);

  const project = useMemo(
    () => caseStudies.find((p) => p.slug === slug) ?? null,
    [caseStudies, slug],
  );

  const openProject = useCallback(
    (next: string) => {
      if (!caseStudies.some((p) => p.slug === next)) return;
      clearTimeout(closeTimer.current);
      track("Project opened", { project: next });
      setPanelOpen(true, () => {
        setTab("work");
        setSlug(next);
      });
      projectScroll.current?.scrollTo({ top: 0 });
      // Next frame, so a freshly mounted project slides in from the side.
      requestAnimationFrame(() => setProjectOpen(true));
    },
    [caseStudies, setPanelOpen],
  );

  const closeProject = useCallback(() => {
    setProjectOpen(false);
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setSlug(null), SLIDE_MS);
  }, []);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    closeProject();
  }, [setPanelOpen, closeProject]);

  // Escape steps back: project, then the panel.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (projectOpen) closeProject();
      else if (panelOpenRef.current) closePanel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [projectOpen, closeProject, closePanel]);

  const actions = useMemo(() => ({ openProject }), [openProject]);
  const topicCount = session.topics.length;

  // A tab opens the panel on it; on phones, tapping the open one closes it.
  const selectTab = (next: Tab, toggle = false) => {
    if (toggle && panelOpen && tab === next) {
      closePanel();
      return;
    }
    setPanelOpen(true, () => setTab(next));
  };

  // The tabs. Closed panel: quiet links that open it. Open: the current
  // one is underlined.
  const tabs = (
    <div className="flex items-center gap-5">
      {(["work", "notes"] as const).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => selectTab(value)}
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

  const startOver = (
    <button
      type="button"
      onClick={() => setConfirmReset(true)}
      disabled={session.messages.length === 0}
      title="Start over"
      aria-label="Start over"
      className="flex size-8 items-center justify-center rounded-md text-foreground-secondary hover:bg-background-inverse/6 hover:text-foreground cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-default disabled:hover:bg-transparent"
    >
      <RotateCcw size={14} />
    </button>
  );

  // Desktop: one set of controls, in the chat header while the panel is
  // closed and in the panel's header while it's open (the view transition
  // carries it across). Phones: compact buttons in the chat header.
  const desktopControls = (
    <div className="vt-controls hidden items-center gap-4 lg:flex">
      {tabs}
      {startOver}
    </div>
  );
  const phoneControls = (
    <div className="flex items-center gap-1 lg:hidden">
      {(["work", "notes"] as const).map((value) => {
        const active = panelOpen && tab === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => selectTab(value, true)}
            aria-pressed={active}
            className={`rounded-md px-2.5 py-1.5 text-xs cursor-pointer transition-colors ${
              active
                ? "bg-background-inverse/8 text-foreground"
                : "text-foreground-secondary hover:bg-background-inverse/6 hover:text-foreground"
            }`}
          >
            {value === "work" ? "Work" : "AI Notes"}
            {value === "notes" && topicCount > 0 && <span className="ml-1.5 tabular-nums">{topicCount}</span>}
          </button>
        );
      })}
      {startOver}
    </div>
  );

  return (
    <WorkspaceContext.Provider value={actions}>
      <div data-workspace className="h-dvh w-full overflow-hidden lg:flex">
        {/* Chat */}
        <main className="vt-chat h-full min-h-0 min-w-0 lg:flex-1 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
          <ChatPane
            name={name}
            title={title}
            email={email}
            links={links}
            starterQuestions={starterQuestions}
            messages={session.messages}
            isLoading={session.isLoading}
            send={session.send}
            panelOpen={panelOpen}
            headerControls={
              <>
                {!panelOpen && desktopControls}
                {phoneControls}
              </>
            }
          />
        </main>
        {/* Work and notes. Desktop: a column on the right, present only
            while open. Phones: a sheet that slides in from the right. */}
        <aside
          className={`vt-panel fixed inset-0 z-50 flex flex-col overflow-hidden bg-background transition-[translate] duration-[520ms] ${EASE} pt-[env(safe-area-inset-top)] lg:static lg:z-auto lg:h-full lg:w-[clamp(24rem,42%,40rem)] lg:shrink-0 lg:translate-x-0 lg:border-l lg:border-background-inverse/10 lg:pt-0 lg:transition-none ${
            panelOpen ? "translate-x-0 lg:flex" : "translate-x-full lg:hidden"
          }`}
        >
          <div className="flex h-12 shrink-0 items-center justify-between gap-4 px-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={closePanel}
                aria-label="Back to the chat"
                className="-ml-1 flex size-8 items-center justify-center rounded-md hover:bg-background-inverse/6 cursor-pointer lg:hidden"
              >
                <ArrowLeft size={16} />
              </button>
              <div className="lg:hidden">{tabs}</div>
              {/* Desktop: the controls, carried over from the chat header. */}
              {panelOpen && desktopControls}
            </div>
            <div className="hidden items-center gap-1 lg:flex">
              <button
                type="button"
                onClick={closePanel}
                aria-label="Close panel"
                title="Close"
                className="-mr-1 flex size-8 items-center justify-center rounded-md text-foreground-secondary hover:bg-background-inverse/6 hover:text-foreground cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>
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
        </aside>

      </div>
      <ConfirmDialog
        open={confirmReset}
        title="Start over?"
        confirmLabel="Start over"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          setConfirmReset(false);
          session.reset();
          closeProject();
        }}
      >
        This clears our whole conversation and your AI Notes, and there&apos;s no way to get
        them back. If you&apos;d like to keep them, write up the conversation in AI Notes first.
      </ConfirmDialog>
    </WorkspaceContext.Provider>
  );
}
