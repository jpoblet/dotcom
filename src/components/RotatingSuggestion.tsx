"use client";

import { useEffect, useRef, useState } from "react";

/** How often one of the chips is swapped for another question. */
const SWAP_EVERY_MS = 2000;
const LEAVE_MS = 300;

interface Props {
  questions: string[];
  onPick: (question: string) => void;
  disabled?: boolean;
  /** How many chips to show at once. */
  count?: number;
}

/** `count` distinct random indexes below `total`. */
function pickDistinct(total: number, count: number): number[] {
  const pool = Array.from({ length: total }, (_, i) => i);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

/**
 * A few suggested questions at once. Every couple of seconds one chip (in
 * turn) slides out and a different random question rises into its place,
 * never repeating one already on screen. Hovering or focusing the chips
 * pauses the rotation so nothing changes under the cursor.
 */
export default function RotatingSuggestion({
  questions,
  onPick,
  disabled,
  count = 3,
}: Props) {
  // Picked after mount, so the server render and hydration agree.
  const [shown, setShown] = useState<number[] | null>(null);
  const [leaving, setLeaving] = useState<number | null>(null);
  // The first chips rise in one after another; later swaps have no delay.
  const [hasSwapped, setHasSwapped] = useState(false);
  const paused = useRef(false);
  const total = questions.length;
  const slots = Math.min(count, total);

  useEffect(() => {
    if (total === 0) return;
    let slot = 0;
    let swap: ReturnType<typeof setTimeout> | undefined;
    const first = setTimeout(() => setShown(pickDistinct(total, slots)), 0);
    const interval = setInterval(() => {
      // Nothing to rotate in when every question is already on screen.
      if (paused.current || total <= slots) return;
      const current = slot;
      slot = (slot + 1) % slots;
      setLeaving(current);
      swap = setTimeout(() => {
        setShown((prev) => {
          if (!prev) return prev;
          const candidates = Array.from({ length: total }, (_, i) => i).filter(
            (i) => !prev.includes(i),
          );
          const next = [...prev];
          next[current] = candidates[Math.floor(Math.random() * candidates.length)];
          return next;
        });
        setLeaving(null);
        setHasSwapped(true);
      }, LEAVE_MS);
    }, SWAP_EVERY_MS);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
      clearTimeout(swap);
    };
  }, [total, slots]);

  if (!shown || total === 0) return null;

  return (
    <div
      className="flex flex-wrap gap-2"
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
      onFocus={() => (paused.current = true)}
      onBlur={() => (paused.current = false)}
    >
      {shown.map((index, slot) => {
        const question = questions[index % total];
        return (
          <button
            // A new key remounts the chip, which replays the rise-in animation.
            key={`${slot}-${question}`}
            onClick={() => onPick(question)}
            disabled={disabled}
            style={hasSwapped ? undefined : { animationDelay: `${slot * 80}ms` }}
            className={`px-4 py-2 text-xs bg-background-inverse/8 text-foreground rounded-full cursor-pointer hover:bg-background-inverse/15 disabled:opacity-50 disabled:cursor-not-allowed transition-[opacity,translate,background-color] duration-300 whitespace-nowrap flex-shrink-0 ${
              // The rise-in animation is dropped while leaving, or its end
              // state would override the fade-out.
              leaving === slot ? "opacity-0 -translate-y-2" : "animate-suggestion-in"
            }`}
          >
            {question}
          </button>
        );
      })}
    </div>
  );
}
