"use client";

import { createContext, useContext } from "react";

export interface WorkspaceActions {
  /** Shows a project's case study in the side panel. */
  openProject: (slug: string) => void;
  /**
   * Floats a preview of a case study beside the pointer (null hides it).
   * Ignored for slugs without a case study and on touch screens.
   */
  peekProject: (slug: string | null) => void;
  /** Opens the CV in a viewer over the page. */
  openCv: () => void;
}

/**
 * Present only inside the split workspace. Links and cards in the chat use
 * it to open projects beside the conversation instead of navigating away.
 */
export const WorkspaceContext = createContext<WorkspaceActions | null>(null);

export const useWorkspace = () => useContext(WorkspaceContext);

/**
 * "/work/athleteid" -> "athleteid". Also reads the older "/projects/..." and
 * "/project/..." forms, still found in conversations saved before the change.
 */
export function projectSlugFromHref(href: string): string | undefined {
  return href.match(/^\/(?:work|projects?)\/([a-z0-9-]+)\/?$/)?.[1];
}

/** The address of a case study open in the side panel. */
export const projectHref = (slug: string) => `/work/${slug}`;

export type Tab = "work" | "notes";

/**
 * What the address says the screen shows: "/" the chat alone, "/work" and
 * "/notes" the panel open on that tab, "/work/<slug>" a case study in it.
 */
export type View = { tab: Tab | null; slug?: string };

export function viewFromPath(path: string): View {
  const slug = projectSlugFromHref(path);
  if (slug) return { tab: "work", slug };
  if (/^\/work\/?$/.test(path)) return { tab: "work" };
  if (/^\/notes\/?$/.test(path)) return { tab: "notes" };
  return { tab: null };
}

export function pathFromView({ tab, slug }: View): string {
  if (!tab) return "/";
  if (tab === "notes") return "/notes";
  return slug ? projectHref(slug) : "/work";
}
