"use client";

import { useEffect, useRef, useState } from "react";

const SHOW_FOR_MS = 4000;
const LEAVE_MS = 300;

interface Props {
  questions: string[];
  onPick: (question: string) => void;
  disabled?: boolean;
}

/** A random index different from `previous` (when there's a choice). */
function pickIndex(count: number, previous: number | null): number {
  if (count <= 1) return 0;
  let next: number;
  do next = Math.floor(Math.random() * count);
  while (next === previous);
  return next;
}

/**
 * One suggested question at a time, swapped for another random one every
 * few seconds. It slides out, the next one rises in. Hovering or focusing
 * it pauses the rotation so it can't change under the cursor.
 */
export default function RotatingSuggestion({ questions, onPick, disabled }: Props) {
  // Picked after mount, so the server render and hydration agree.
  const [index, setIndex] = useState<number | null>(null);
  const [leaving, setLeaving] = useState(false);
  const paused = useRef(false);
  const count = questions.length;

  useEffect(() => {
    if (count === 0) return;
    let swap: ReturnType<typeof setTimeout> | undefined;
    const first = setTimeout(() => setIndex((i) => pickIndex(count, i)), 0);
    const interval = setInterval(() => {
      if (paused.current || count <= 1) return;
      setLeaving(true);
      swap = setTimeout(() => {
        setIndex((i) => pickIndex(count, i));
        setLeaving(false);
      }, LEAVE_MS);
    }, SHOW_FOR_MS);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
      clearTimeout(swap);
    };
  }, [count]);

  if (index === null || count === 0) return null;
  const question = questions[index % count];

  return (
    <button
      // A new key remounts the chip, which replays the rise-in animation.
      key={question}
      onClick={() => onPick(question)}
      disabled={disabled}
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
      onFocus={() => (paused.current = true)}
      onBlur={() => (paused.current = false)}
      className={`px-4 py-2 text-xs bg-background-inverse/8 text-foreground rounded-full cursor-pointer hover:bg-background-inverse/15 disabled:opacity-50 disabled:cursor-not-allowed transition-[opacity,translate,background-color] duration-300 whitespace-nowrap ${
        // The rise-in animation is dropped while leaving, or its end state
        // would override the fade-out.
        leaving ? "opacity-0 -translate-y-2" : "animate-suggestion-in"
      }`}
    >
      {question}
    </button>
  );
}
