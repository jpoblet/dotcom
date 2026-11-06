"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, RotateCcw, X } from "lucide-react";
import { track } from "@/lib/analytics";
import type { Project } from "@/lib/content";
import { useChatSession } from "@/lib/use-chat-session";
import Logo from "@/components/Logo";
import ChatPane from "./ChatPane";
import ConfirmDialog from "./ConfirmDialog";
import NotesPanel from "./NotesPanel";
import ProfileCard, { Online } from "./ProfileCard";
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
  /** "Lead Product Designer at Veriff", if there's a current role. */
  now?: string;
  timeZone: string;
  city: string;
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
  now,
  timeZone,
  city,
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

  const [confirmReset, setConfirmReset] = useState(false);
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
        {/* The left column: who's answering, by default; Work or AI Notes
            in the same place when asked for. One width either way, so
            nothing on screen moves but the content. Phones: the column is
            only the panel's sheet. */}
        <div
          className={`contents lg:relative lg:flex lg:h-full lg:w-[clamp(24rem,46%,44rem)] lg:shrink-0 lg:flex-col lg:overflow-hidden lg:border-r lg:transition-[border-color] lg:duration-[520ms] ${EASE} ${
            panelOpen ? "lg:border-background-inverse/10" : "lg:border-transparent"
          }`}
        >
          {/* The controls stay put here, open or closed: the logo on the left;
              the two tabs, "start over" and (when open) "close" on the right. */}
          <div className="hidden h-12 shrink-0 items-center justify-between gap-6 px-4 lg:flex">
            <div className="flex min-w-0 items-center gap-3">
              <Logo className="h-6 fill-current shrink-0" />
              {/* The card's name, carried up here while the panel covers it. */}
              <span
                aria-hidden={!panelOpen}
                className={`flex min-w-0 items-center gap-2 transition-[opacity,translate,filter] duration-500 ${EASE} ${
                  panelOpen
                    ? "translate-y-0 opacity-100 blur-0 delay-200"
                    : "pointer-events-none translate-y-3 opacity-0 blur-[3px]"
                }`}
              >
                <span className="truncate text-sm">
                  <span className="font-heading font-bold">{name}</span>
                  <span className="text-foreground-secondary"> · {title}</span>
                </span>
                <Online />
              </span>
            </div>
            {/* Right end of the column. "Close" always keeps its slot, so
                nothing shifts when it appears. */}
            <div className="flex items-center gap-5">
              {tabs}
              <div className="flex items-center gap-1">
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
                <button
                  type="button"
                  onClick={closePanel}
                  aria-label="Close panel"
                  title="Close"
                  tabIndex={panelOpen ? 0 : -1}
                  aria-hidden={!panelOpen}
                  className={`-mr-1 flex size-8 items-center justify-center rounded-md text-foreground-secondary hover:bg-background-inverse/6 hover:text-foreground cursor-pointer transition-opacity duration-300 ${
                    panelOpen ? "opacity-100" : "pointer-events-none opacity-0"
                  }`}
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          </div>
          {/* The card steps back as the panel arrives. */}
          <div
            aria-hidden={panelOpen}
            className={`relative hidden min-h-0 flex-1 origin-top-left transition-[opacity,scale,filter] duration-[520ms] lg:block ${EASE} ${
              panelOpen ? "pointer-events-none scale-[0.96] opacity-0 blur-[2px]" : "scale-100 opacity-100 blur-0"
            }`}
          >
            <div className="absolute inset-0">
              <ProfileCard
                name={name}
                title={title}
                now={now}
                timeZone={timeZone}
                city={city}
                email={email}
                links={links}
              />
            </div>
          </div>

          {/* Work and notes. Desktop: takes the card's place, under the
              column's header. Phones: a sheet over the chat. */}
          <div
            className={`fixed inset-0 z-50 flex flex-col overflow-hidden bg-background transition-[translate,opacity] duration-[520ms] ${EASE} pt-[env(safe-area-inset-top)] lg:absolute lg:inset-x-0 lg:top-12 lg:bottom-0 lg:z-auto lg:pt-0 ${
              panelOpen
                ? "translate-x-0 lg:opacity-100 lg:delay-100"
                : "translate-x-full lg:pointer-events-none lg:-translate-x-6 lg:opacity-0"
            }`}
          >
          {/* Keeps the content from squeezing while the panel closes. */}
          <div className="flex h-full min-h-0 flex-col lg:min-w-[24rem]">
          <div className="flex h-12 shrink-0 items-center justify-between gap-4 px-6 lg:hidden">
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

        {/* Chat */}
        <div className="h-full min-h-0 min-w-0 lg:flex-1 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
          <ChatPane
            name={name}
            email={email}
            links={links}
            starterQuestions={starterQuestions}
            messages={session.messages}
            isLoading={session.isLoading}
            send={session.send}
            onStartOver={() => setConfirmReset(true)}
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
