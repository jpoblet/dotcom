"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  open: boolean;
  title: string;
  children: React.ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const EXIT_MS = 160;

/**
 * A small confirmation dialog. Escape or a click outside cancels; focus
 * starts on Cancel, the safe choice. Fades and settles in, and out.
 */
export default function ConfirmDialog({ open, title, children, confirmLabel, onConfirm, onCancel }: Props) {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

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
    const focus = setTimeout(() => cancelRef.current?.focus(), 0);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(focus);
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [open, onCancel]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[80] flex items-center justify-center p-6 transition-opacity duration-150 ${
        closing ? "opacity-0" : "opacity-100"
      }`}
    >
      <div
        aria-hidden="true"
        onClick={onCancel}
        className="animate-fade-in absolute inset-0 bg-background-inverse/25 backdrop-blur-[2px]"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-body"
        className={`relative w-full max-w-sm rounded-lg border border-background-inverse/15 bg-background p-6 shadow-[0_24px_60px_-16px_rgb(0_0_0/0.35)] transition-[scale,translate] duration-150 ${
          closing ? "scale-[0.98] translate-y-1" : "animate-dialog-in"
        }`}
      >
        <h3 id="confirm-title" className="text-[0.9375rem] font-bold">
          {title}
        </h3>
        <div id="confirm-body" className="mt-2 text-sm leading-[1.75] text-foreground-secondary">
          {children}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="rounded-md border border-background-inverse/15 px-3.5 py-2 text-xs hover:bg-background-secondary cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-background-inverse px-3.5 py-2 text-xs text-background hover:opacity-85 cursor-pointer"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
