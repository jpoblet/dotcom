"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import Logo from "@/components/Logo";

/** Matches .animate-modal-out / .animate-modal-content-out in globals.css. */
const CLOSE_MS = 250;

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
 * Full-screen modal over a frosted view of the page underneath. The case
 * study fades in while rising slightly, and does the reverse when closing
 * (X button or Escape). Locks the page's own scrolling while open.
 */
export default function ProjectModal({ children, closeTo }: Props) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);
  const closingRef = useRef(false);

  // Play the closing animation, then leave.
  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    setTimeout(() => {
      if (closeTo === "back") router.back();
      else router.push(closeTo, { scroll: false });
    }, CLOSE_MS);
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

  // Three layers: the frosted backdrop, the scrolling case study, and the
  // logo and close button on top. The blur lives on its own layer because
  // backdrop-filter would otherwise make the "fixed" controls scroll with
  // the text. The controls don't animate: they stay put while the case
  // study fades and moves.
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="project-title" className="fixed inset-0 z-[60]">
      <div
        aria-hidden="true"
        className={`absolute inset-0 bg-background/60 backdrop-blur-md ${
          closing ? "animate-modal-out" : "animate-modal-in"
        }`}
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        className="absolute inset-0 overflow-y-auto overflow-x-hidden overscroll-contain focus:outline-none"
      >
        <div
          className={`w-full max-w-[75rem] mx-auto px-6 pt-[calc(5rem+env(safe-area-inset-top))] pb-[calc(4rem+env(safe-area-inset-bottom))] ${
            closing ? "animate-modal-content-out" : "animate-modal-content-in"
          }`}
        >
          {children}
        </div>
      </div>

      {/* Keeps the controls legible over text scrolling underneath. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-0 h-[calc(5rem+env(safe-area-inset-top))] bg-gradient-to-b from-background via-background/80 to-transparent ${
          closing ? "animate-modal-out" : "animate-modal-in"
        }`}
      />

      {/* Same place as the site header's logo, so it never jumps. */}
      <Link
        href="/"
        aria-label="Home"
        className="absolute top-[calc(1rem+env(safe-area-inset-top))] left-6 text-foreground hover:opacity-70 transition-opacity duration-200"
      >
        <Logo className="h-9 fill-current" />
      </Link>
      <button
        onClick={close}
        aria-label="Close"
        className="absolute top-[calc(1rem+env(safe-area-inset-top))] right-6 flex items-center justify-center w-10 h-10 rounded-full border border-background-inverse/10 bg-background hover:bg-background-secondary transition-colors duration-200"
      >
        <X size={18} />
      </button>
    </div>
  );
}
