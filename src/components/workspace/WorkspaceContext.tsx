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
}

/**
 * Present only inside the split workspace. Links and cards in the chat use
 * it to open projects beside the conversation instead of navigating away.
 */
export const WorkspaceContext = createContext<WorkspaceActions | null>(null);

export const useWorkspace = () => useContext(WorkspaceContext);

/** "/projects/okasewa" -> "okasewa" */
export function projectSlugFromHref(href: string): string | undefined {
  return href.match(/^\/projects\/([a-z0-9-]+)\/?$/)?.[1];
}
