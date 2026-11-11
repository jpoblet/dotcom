"use client";

import { useEffect, useRef, useState } from "react";
import { Download, X } from "lucide-react";
import { track } from "@/lib/analytics";
import { CV_FILENAME, CV_HTML, CV_PDF } from "@/lib/cv";

const EXIT_MS = 180;

/**
 * The CV in a viewer over the page, the rest of the site blurred behind it.
 * The sheets are the same HTML the PDF is printed from. Escape, the close
 * button or a click outside closes it; focus returns where it was.
 */
export default function CvModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Stay mounted for the exit animation.
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => {
        setMounted(true);
        setClosing(false);
      });
      return () => clearTimeout(t);
    }
    if (!mounted) return;
    const start = setTimeout(() => setClosing(true));
    const end = setTimeout(() => setMounted(false), EXIT_MS);
    return () => {
      clearTimeout(start);
      clearTimeout(end);
    };
  }, [open, mounted]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCloseRef.current();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [open]);

  // Focus starts on the close button once the viewer is on screen.
  useEffect(() => {
    if (open && mounted) closeRef.current?.focus();
  }, [open, mounted]);

  if (!mounted) return null;

  // Floating buttons over the blurred page: solid ground so they read on
  // anything behind them.
  const action =
    "flex h-9 items-center justify-center gap-1.5 rounded-full border border-background-inverse/12 bg-background/90 text-xs text-foreground-secondary shadow-[0_8px_24px_-8px_rgb(0_0_0/0.3)] backdrop-blur transition-colors hover:text-foreground cursor-pointer";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Jordi Poblet's CV"
      className={`fixed inset-0 z-[90] transition-opacity duration-200 ${closing ? "opacity-0" : "opacity-100"}`}
    >
      <div aria-hidden="true" className="animate-fade-in absolute inset-0 bg-background-inverse/30 backdrop-blur-md" />
      {/* The sheets themselves, scrolling over the blur with no frame. The
          frame is transparent (same colour scheme on both sides, or the
          browser paints it opaque). Same origin, so Escape inside it and
          clicks on the space around the sheets close the viewer too. */}
      <iframe
        src={`${CV_HTML}?embed`}
        title="Jordi Poblet's CV"
        className={`absolute inset-0 size-full bg-transparent [color-scheme:light] transition-[translate] duration-200 ${
          closing ? "translate-y-2" : "animate-slide-up"
        }`}
        onLoad={(e) => {
          const frame = e.currentTarget.contentWindow;
          frame?.addEventListener("keydown", (event) => {
            if (event.key === "Escape") onCloseRef.current();
          });
          frame?.document.addEventListener("click", (event) => {
            if (!(event.target as Element).closest?.(".page")) onCloseRef.current();
          });
        }}
      />
      <div className="absolute right-3 top-3 flex items-center gap-2 sm:right-5 sm:top-4">
        <a
          href={CV_PDF}
          download={CV_FILENAME}
          onClick={() => track("CV downloaded", { from: "viewer" })}
          aria-label="Download PDF"
          className={`${action} px-3.5`}
        >
          <Download size={14} />
          <span className="hidden sm:inline">Download PDF</span>
        </a>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close the CV"
          title="Close"
          className={`${action} w-9`}
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
