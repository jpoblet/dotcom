"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useCallback, useEffect, useRef } from "react";
import { X } from "lucide-react";

interface Props {
  children: ReactNode;
  /**
   * "back": opened over another page (the chat, the projects list), so
   * closing goes back to it. A path: the project URL was opened directly,
   * so closing goes there instead.
   */
  closeTo: "back" | string;
}

/**
 * Full-screen modal over a frosted view of the page underneath. Closes with
 * the X button or Escape. Locks the page's own scrolling while open.
 */
export default function ProjectModal({ children, closeTo }: Props) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    if (closeTo === "back") router.back();
    else router.push(closeTo, { scroll: false });
  }, [closeTo, router]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    // Tells the chat underneath not to grab keystrokes.
    body.dataset.modal = "open";
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      body.style.overflow = previousOverflow;
      delete body.dataset.modal;
    };
  }, [close]);

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-title"
      tabIndex={-1}
      className="fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-background/60 backdrop-blur-md animate-fade-in focus:outline-none"
    >
      <button
        onClick={close}
        aria-label="Close"
        className="fixed z-10 top-[calc(1rem+env(safe-area-inset-top))] right-6 flex items-center justify-center w-10 h-10 rounded-full border border-background-inverse/10 bg-background hover:bg-background-secondary transition-colors duration-200"
      >
        <X size={18} />
      </button>
      <div className="w-full max-w-3xl mx-auto px-6 pt-[calc(5rem+env(safe-area-inset-top))] pb-[calc(4rem+env(safe-area-inset-bottom))]">
        {children}
      </div>
    </div>
  );
}
