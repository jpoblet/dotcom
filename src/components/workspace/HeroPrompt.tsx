"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Info } from "lucide-react";
import LogoMark from "@/components/LogoMark";
import type { HeroPrompt as Prompt, Project } from "@/lib/content";
import type { QuestionSource } from "@/lib/chat-log";

const TYPE_MS = 42;
const ERASE_MS = 18;
const HOLD_MS = 2200;

interface Props {
  name: string;
  tagline: string;
  prompts: Prompt[];
  work: Pick<Project, "slug" | "name" | "logoMark">[];
  onAsk: (text: string, source: QuestionSource) => void;
  onOpenProject: (slug: string) => void;
  disabled?: boolean;
}

/**
 * Work prompts in random order, with a personal one dropped in every few
 * so the first ones a visitor sees are about work.
 */
function arrange(prompts: Prompt[]): Prompt[] {
  const shuffle = <T,>(items: T[]) => {
    const pool = [...items];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool;
  };
  const work = shuffle(prompts.filter((p) => !p.personal));
  const personal = shuffle(prompts.filter((p) => p.personal));
  const out: Prompt[] = [];
  work.forEach((p, i) => {
    out.push(p);
    if (i % 3 === 2 && personal.length) out.push(personal.shift()!);
  });
  return [...out, ...personal];
}

/**
 * The home page is one sentence: "Ask me about ___". The blank is the input,
 * set as large as the heading, and it types its way through things worth
 * asking. Enter asks the one showing; typing replaces it with your own.
 */
export default function HeroPrompt({
  name,
  tagline,
  prompts,
  work,
  onAsk,
  onOpenProject,
  disabled,
}: Props) {
  const [order, setOrder] = useState(prompts);
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(prompts[0]?.about ?? "");
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const current = order[index % order.length];

  // Desktop: the field is ready to type into, caret blinking. Not on
  // touch screens, where focusing would throw up the keyboard.
  useEffect(() => {
    if (window.matchMedia("(pointer: fine) and (min-width: 640px)").matches) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, []);

  // Shuffle after mount, so the server and the first client render agree.
  useEffect(() => {
    const timeout = setTimeout(() => {
      const next = arrange(prompts);
      setOrder(next);
      setShown(next[0]?.about ?? "");
    });
    return () => clearTimeout(timeout);
  }, [prompts]);

  // Type it, hold it, erase it, next. Still while the visitor types their own.
  const [phase, setPhase] = useState<"typing" | "holding" | "erasing">("holding");
  useEffect(() => {
    if (input || !current) return;
    const target = current.about;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const next = () => {
      setIndex((i) => i + 1);
      const following = order[(index + 1) % order.length].about;
      setShown(reduce ? following : "");
      setPhase(reduce ? "holding" : "typing");
    };
    let timeout: ReturnType<typeof setTimeout>;
    if (phase === "typing") {
      timeout =
        shown.length < target.length
          ? setTimeout(() => setShown(target.slice(0, shown.length + 1)), TYPE_MS)
          : setTimeout(() => setPhase("holding"));
    } else if (phase === "holding") {
      timeout = setTimeout(() => (reduce ? next() : setPhase("erasing")), HOLD_MS);
    } else {
      timeout =
        shown.length > 0
          ? setTimeout(() => setShown(shown.slice(0, -1)), ERASE_MS)
          : setTimeout(next, 240);
    }
    return () => clearTimeout(timeout);
  }, [phase, shown, current, input, index, order]);

  const ask = () => {
    if (disabled) return;
    if (input.trim()) onAsk(input.trim(), "typed");
    else if (current) onAsk(current.question, "starter");
  };

  return (
    <div className="flex min-h-full flex-col">
      <p className="font-label text-xs text-foreground-secondary">{name}</p>

      <form
        className="mt-6"
        onSubmit={(e) => {
          e.preventDefault();
          ask();
        }}
      >
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-[-0.03em] leading-[1.05]">
          <label htmlFor="hero-input">Ask me about</label>
        </h1>

        {/* A plain, obvious text field. The suggestion types itself in as
            placeholder text; anything typed replaces it. */}
        <div
          onClick={() => inputRef.current?.focus()}
          className="group/field mt-8 flex cursor-text items-center gap-3 rounded-2xl border border-background-inverse/20 bg-background py-2.5 pl-5 pr-2.5 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)] transition-[border-color,box-shadow] duration-200 focus-within:border-background-inverse/60 focus-within:shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-background-inverse)_7%,transparent)]"
        >
          <div className="grid min-h-[3.1em] flex-1 items-center text-lg sm:min-h-0 sm:text-2xl leading-[1.4]">
            {!input && (
              <p
                aria-hidden="true"
                className="pointer-events-none col-start-1 row-start-1 text-foreground-secondary"
              >
                {shown}
                {/* A fake caret while the field isn't focused; focused, the
                    real one blinks at the start. */}
                <span className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[0.2em] bg-foreground-secondary animate-[cursor-blink_1s_steps(1)_infinite] group-focus-within/field:hidden" />
              </p>
            )}
            <textarea
              id="hero-input"
              ref={inputRef}
              value={input}
              rows={1}
              disabled={disabled}
              onChange={(e) => setInput(e.target.value)}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = `${el.scrollHeight}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  ask();
                }
              }}
              aria-describedby="hero-hint"
              className="col-start-1 row-start-1 block w-full resize-none overflow-hidden bg-transparent py-1.5 text-foreground caret-foreground focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={disabled}
            className="group/ask flex h-12 shrink-0 items-center gap-2 rounded-xl bg-background-inverse px-5 text-base font-bold text-background transition-opacity hover:opacity-90 cursor-pointer disabled:opacity-40"
          >
            Ask
            <ArrowRight size={18} className="transition-transform duration-300 group-hover/ask:translate-x-0.5" />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between gap-4 pl-1">
          <p id="hero-hint" className="text-sm text-foreground-secondary">
            {input ? (
              <>
                <span className="hidden sm:inline">Press Enter to ask.</span>
                <span className="sm:hidden">Tap Ask to send it.</span>
              </>
            ) : (
              <>
                Type any question, or{" "}
                <span className="hidden sm:inline">press Enter to ask this one.</span>
                <span className="sm:hidden">tap Ask for this one.</span>
              </>
            )}
          </p>
          {/* Privacy note, on hover or focus (a tap on phones). */}
          <span className="group/info relative">
            <button
              type="button"
              aria-label="About your questions"
              aria-describedby="hero-privacy"
              className="flex items-center gap-1.5 text-xs text-foreground-secondary transition-colors hover:text-foreground cursor-pointer"
            >
              <Info size={14} />
              <span className="hidden sm:inline">Privacy</span>
            </button>
            <span
              id="hero-privacy"
              role="tooltip"
              className="pointer-events-none absolute right-0 top-full z-10 mt-2 w-72 -translate-y-1 rounded-md bg-background-inverse px-3 py-2.5 text-xs leading-[1.6] text-background opacity-0 transition-[opacity,translate] duration-200 group-hover/info:translate-y-0 group-hover/info:opacity-100 group-focus-within/info:translate-y-0 group-focus-within/info:opacity-100"
            >
              Questions and answers are saved so I can see what people ask and
              improve the answers. Nothing that identifies you is kept: no name,
              no IP address, only a rough location (country and city).
            </span>
          </span>
        </div>
      </form>

      {/* Who's answering, and proof: the work, one click from a case study. */}
      <div className="mt-auto pt-16">
        <p className="max-w-xl text-sm leading-[1.7] text-foreground-secondary">{tagline}</p>
        {work.length > 0 && (
          <ul className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-5 sm:gap-x-10 border-t border-background-inverse/10 pt-6">
            <li className="w-full font-label text-xs text-foreground-secondary sm:w-auto sm:pr-2">Selected work</li>
            {work.map((project) => (
              <li key={project.slug}>
                <button
                  type="button"
                  onClick={() => onOpenProject(project.slug)}
                  title={project.name}
                  className="block cursor-pointer text-foreground/60 transition-colors duration-300 hover:text-foreground"
                >
                  <LogoMark logo={project.logoMark} name={project.name} align="center" className="h-7 w-16 sm:w-20" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
