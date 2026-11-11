"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Download, Eye } from "lucide-react";
import { track } from "@/lib/analytics";
import { CV_FILENAME, CV_PDF } from "@/lib/cv";

/**
 * "CV" with a chevron: a small menu to view the CV over the page or
 * download the PDF. A click outside or Escape closes it (Escape doesn't
 * reach the panel, so it stays open); arrow keys move between the options.
 */
export default function CvMenu({ onView }: { onView: () => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const items = () => [...(root.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])];

  useEffect(() => {
    if (!open) return;
    const focus = setTimeout(() => items()[0]?.focus());
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    // Capture phase, so the panel's own Escape handler never sees it.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      setOpen(false);
      trigger.current?.focus();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey, true);
    return () => {
      clearTimeout(focus);
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  const onMenuKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const list = items();
    const at = list.indexOf(document.activeElement as HTMLElement);
    const next = (at + (e.key === "ArrowDown" ? 1 : -1) + list.length) % list.length;
    list[next]?.focus();
  };

  const item =
    "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-xs text-foreground transition-colors hover:bg-background-inverse/6 focus-visible:bg-background-inverse/6 focus-visible:outline-none cursor-pointer";

  return (
    <div ref={root} className="relative">
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex h-8 items-center gap-1 rounded-md pl-2.5 pr-2 text-xs transition-colors hover:bg-background-inverse/6 hover:text-foreground cursor-pointer ${
          open ? "bg-background-inverse/6 text-foreground" : "text-foreground-secondary"
        }`}
      >
        CV
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          role="menu"
          aria-label="CV"
          onKeyDown={onMenuKey}
          className="animate-dialog-in absolute right-0 top-full z-30 mt-1.5 w-44 rounded-lg border border-background-inverse/15 bg-background p-1 shadow-[0_16px_40px_-12px_rgb(0_0_0/0.25)]"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onView();
            }}
            className={item}
          >
            <Eye size={14} className="text-foreground-secondary" />
            View
          </button>
          <a
            role="menuitem"
            href={CV_PDF}
            download={CV_FILENAME}
            onClick={() => {
              track("CV downloaded", { from: "panel" });
              setOpen(false);
            }}
            className={item}
          >
            <Download size={14} className="text-foreground-secondary" />
            Download PDF
          </a>
        </div>
      )}
    </div>
  );
}
