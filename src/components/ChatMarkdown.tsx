"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import { projectSlugFromHref, useWorkspace } from "@/components/workspace/WorkspaceContext";

function MarkdownLink({ href = "", children }: { href?: string; children?: ReactNode }) {
  const workspace = useWorkspace();
  const slug = projectSlugFromHref(href);
  // In the split workspace, project links open beside the chat.
  if (workspace && slug) {
    return (
      <a
        href={href}
        onClick={(event) => {
          event.preventDefault();
          workspace.openProject(slug);
        }}
        onPointerEnter={() => workspace.peekProject(slug)}
        onPointerLeave={() => workspace.peekProject(null)}
      >
        {children}
      </a>
    );
  }
  // Site pages (e.g. /work/athleteid) navigate in-app; everything else
  // opens in a new tab. No prefetch: answers can mention many pages.
  if (href.startsWith("/")) {
    return (
      <Link href={href} prefetch={false}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

const components: Components = {
  a: ({ href, children }) => <MarkdownLink href={href}>{children}</MarkdownLink>,
};

/**
 * Renders an AI reply. react-markdown never renders raw HTML, so model
 * output can't inject markup or scripts into the page.
 */
export default function ChatMarkdown({ text }: { text: string }) {
  return <ReactMarkdown components={components}>{text}</ReactMarkdown>;
}
