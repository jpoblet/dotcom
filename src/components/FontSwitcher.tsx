"use client";

import { useEffect, useRef, useState } from "react";
import { Type } from "lucide-react";
import {
  DEFAULT_PAIRING,
  FONT_PAIRINGS,
  FONT_STORAGE_KEY,
  type FontPairingId,
} from "@/lib/font-pairings";

/**
 * A small menu to try the font pairings on the live page. The choice is
 * kept in localStorage and applied before paint by the script in layout.
 * Temporary: remove once a pairing is chosen.
 */
export default function FontSwitcher() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<FontPairingId>(DEFAULT_PAIRING);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() =>
      setCurrent((document.documentElement.dataset.fonts as FontPairingId) ?? DEFAULT_PAIRING),
    );
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (id: FontPairingId) => {
    document.documentElement.setAttribute("data-fonts", id);
    localStorage.setItem(FONT_STORAGE_KEY, id);
    setCurrent(id);
  };

  return (
    <div ref={ref} className="fixed right-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-[70]">
      {open && (
        <div
          role="menu"
          className="animate-suggestion-in absolute bottom-full right-0 mb-2 w-[20rem] max-h-[min(70vh,40rem)] overflow-y-auto rounded-lg border border-background-inverse/15 bg-background p-1.5 shadow-[0_20px_50px_-12px_rgb(0_0_0/0.25)]"
        >
          <p className="px-2.5 pt-1.5 pb-2 text-[0.6875rem] text-foreground-secondary">
            Font pairing (only you see this)
          </p>
          {FONT_PAIRINGS.map((pairing, index) => (
            <div key={pairing.id}>
            {(index === 5 || pairing.id === "original") && (
              <p className="mx-2.5 mt-2 border-t border-background-inverse/10 pt-3 pb-1 text-[0.6875rem] text-foreground-secondary">
                {pairing.id === "original" ? "Baseline" : "Second round"}
              </p>
            )}
            <button
              type="button"
              role="menuitemradio"
              aria-checked={current === pairing.id}
              onClick={() => choose(pairing.id)}
              data-fonts-preview={pairing.id}
              className={`block w-full rounded-md px-2.5 py-2 text-left cursor-pointer transition-colors ${
                current === pairing.id ? "bg-background-inverse/8" : "hover:bg-background-inverse/5"
              }`}
            >
              <span className="flex items-baseline justify-between gap-2">
                <span className="text-[0.8125rem] font-medium">{pairing.name}</span>
                <span className="text-[0.6875rem] text-foreground-secondary">{pairing.faces}</span>
              </span>
              <span className="mt-0.5 block text-[0.6875rem] leading-[1.6] text-foreground-secondary">
                {pairing.note}
              </span>
            </button>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Change font pairing"
        aria-expanded={open}
        title="Font pairing"
        className="flex size-9 items-center justify-center rounded-full border border-background-inverse/15 bg-background text-foreground shadow-sm hover:bg-background-secondary cursor-pointer"
      >
        <Type size={15} />
      </button>
    </div>
  );
}
