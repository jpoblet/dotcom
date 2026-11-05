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

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-title"
      tabIndex={-1}
      className={`fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-background/60 backdrop-blur-md focus:outline-none ${
        closing ? "animate-modal-out" : "animate-modal-in"
      }`}
    >
      {/* Same place as the site header's logo, so it never jumps. */}
      <Link
        href="/"
        aria-label="Home"
        className="fixed z-10 top-[calc(1rem+env(safe-area-inset-top))] left-6 text-foreground hover:opacity-70 transition-opacity duration-200"
      >
        <Logo className="h-9 fill-current" />
      </Link>
      <button
        onClick={close}
        aria-label="Close"
        className="fixed z-10 top-[calc(1rem+env(safe-area-inset-top))] right-6 flex items-center justify-center w-10 h-10 rounded-full border border-background-inverse/10 bg-background hover:bg-background-secondary transition-colors duration-200"
      >
        <X size={18} />
      </button>
      <div
        className={`w-full max-w-3xl mx-auto px-6 pt-[calc(5rem+env(safe-area-inset-top))] pb-[calc(4rem+env(safe-area-inset-bottom))] ${
          closing ? "animate-modal-content-out" : "animate-modal-content-in"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
