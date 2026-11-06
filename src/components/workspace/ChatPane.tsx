"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, Info } from "lucide-react";
import ChatMarkdown from "@/components/ChatMarkdown";
import ChatWidgets from "@/components/ChatWidgets";
import Logo from "@/components/Logo";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import type { Message } from "@/lib/chat-client";
import type { QuestionSource } from "@/lib/chat-log";

interface Props {
  name: string;
  title: string;
  email: string;
  links: { label: string; href: string }[];
  starterQuestions: string[];
  messages: Message[];
  isLoading: boolean;
  send: (text: string, source?: QuestionSource) => void;
  /** Work, AI Notes and "start over", at the header's right. */
  headerControls: React.ReactNode;
}


/** Where a new question lands: below the header and the pinned name. */
const QUESTION_TOP = 112;

/** Up to `count` random items (picked after mount, so hydration agrees). */
function useRandomPick(items: string[], count: number): string[] {
  const [picked, setPicked] = useState<string[]>([]);
  useEffect(() => {
    const timeout = setTimeout(() => {
      const pool = [...items];
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      setPicked(pool.slice(0, count));
    });
    return () => clearTimeout(timeout);
  }, [items, count]);
  return picked;
}

/**
 * The home page as a message thread that has already begun. On the left,
 * Jordi's card: who, what, now, and the time in Barcelona. On the right,
 * the agent says hello and offers a few work questions to tap; replies come
 * in as bubbles. The card folds away while the side panel is open, and on
 * phones it's the header.
 */
export default function ChatPane({
  name,
  email,
  links,
  starterQuestions,
  messages,
  isLoading,
  send,
  title,
  headerControls,
}: Props) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastTurnRef = useRef<HTMLElement>(null);
  const [viewportHeight, setViewportHeight] = useState(0);
  const starters = useRandomPick(starterQuestions, 4);
  const firstName = name.split(" ")[0];
  // Whether the big name has scrolled up behind the header: the small one
  // then takes its place in the corner under the logo.
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroHidden, setHeroHidden] = useState(false);
  useEffect(() => {
    const hero = heroRef.current;
    const root = scrollRef.current;
    if (!hero || !root) return;
    const observer = new IntersectionObserver(([entry]) => setHeroHidden(!entry.isIntersecting), {
      root,
      rootMargin: "-48px 0px 0px 0px",
    });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  // The latest exchange is at least a screen tall, so its question can sit
  // at the top of the view even while the reply is still short.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setViewportHeight(el.clientHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // A new question glides to the top of the view; the reply then writes in
  // below it without moving the page (the visitor scrolls if it runs long).
  const lastQuestionId = messages.findLast((m) => m.isUser)?.id;
  const scrolledFor = useRef<string | undefined>(undefined);
  useEffect(() => {
    const container = scrollRef.current;
    const turn = lastTurnRef.current;
    if (!lastQuestionId || !container || !turn || scrolledFor.current === lastQuestionId) return;
    // Restored history jumps there; a question just sent glides.
    const behavior = scrolledFor.current === undefined ? "instant" : "smooth";
    scrolledFor.current = lastQuestionId;
    container.scrollTo({ top: turn.offsetTop - QUESTION_TOP, behavior });
  }, [lastQuestionId, viewportHeight]);

  const submit = useCallback(
    (text: string, source: QuestionSource = "typed") => {
      if (!text.trim() || isLoading) return;
      if (scrolledFor.current === undefined) scrolledFor.current = "";
      send(text, source);
      setInput("");
      if (inputRef.current) inputRef.current.style.height = "";
    },
    [isLoading, send],
  );

  const last = messages.at(-1);
  const followUps =
    !isLoading && last && !last.isUser && !last.isError ? (last.suggestions ?? []) : [];
  const empty = messages.length === 0;
  const waiting = isLoading && !last?.text;
  // Exchanges: each starts with a question and holds the reply after it.
  const turns: Message[][] = [];
  for (const message of messages) {
    if (message.isUser || turns.length === 0) turns.push([message]);
    else turns[turns.length - 1].push(message);
  }

  const footerLinks = (
    <>
      <a href={`mailto:${email}`} className="hover:text-foreground truncate">
        {email}
      </a>
      <div className="flex items-center gap-3">
        {links.map((link) => (
          <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
            {link.label}
          </a>
        ))}
        <ThemeSwitcher />
      </div>
    </>
  );

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      {/* Header: transparent, floating over the chat, which scrolls right up
          to the top edge behind it. The controls move into the panel's
          header while it's open (desktop). */}
      <div className="absolute inset-x-0 top-0 z-20 flex h-12 items-center justify-between gap-3 px-4">
        <Logo className="h-6 fill-current shrink-0" />
        <div className="flex items-center gap-1">{headerControls}</div>
      </div>

      {/* The name, small, in the corner under the logo, once the big one
          has scrolled away. It fades up in, and back out the same way. */}
      <div
        aria-hidden={!heroHidden}
        className={`pointer-events-none absolute top-12 left-4 z-20 transition-[opacity,translate] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          heroHidden ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        <p className="w-fit font-heading text-base font-bold leading-tight">{name}</p>
        {/* Two lines, broken after the "&". */}
        <p className="mt-0.5 w-fit text-xs leading-snug text-foreground-secondary">
          {title.includes("& ") ? (
            <>
              {title.slice(0, title.indexOf("& ") + 1)}
              <br />
              {title.slice(title.indexOf("& ") + 2)}
            </>
          ) : (
            title
          )}
        </p>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* The thread */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div
            ref={scrollRef}
className="relative min-h-0 flex-1 overflow-y-auto px-4 sm:px-8 pt-20 pb-8"
          >
            <div className="mx-auto max-w-[42rem]">
              {/* The name opens the page. */}
              <div ref={heroRef} className="mb-10">
                <h1
                  className="w-fit font-heading text-5xl sm:text-6xl font-bold leading-[1] tracking-[-0.03em]"
                >
                  {name}
                </h1>
                <p className="mt-3 w-fit text-base text-foreground-secondary">
                  {title}
                </p>
              </div>

              {/* The agent's hello opens the conversation and stays at the top. */}
              <div className="animate-suggestion-in space-y-2 text-sm leading-[1.75]">
                <p>Hi, I&apos;m an AI that answers as {firstName}, from his own notes, projects and CV.</p>
                <p className="text-foreground-secondary">
                  Most people start with his work. Pick one below, or ask anything.
                </p>
              </div>
              {empty && starters.length > 0 && (
                <div className="mt-6">
                  <SuggestionList questions={starters} onPick={(q) => submit(q, "starter")} arrow="→" />
                </div>
              )}

              {!empty && (
                <>
                  {/* Where the conversation begins: a small title, the wave running on from it. */}
                  <div className="mt-14 flex items-center gap-3" aria-hidden="true">
                    <p className="animate-suggestion-in shrink-0 font-label text-[0.6875rem] font-medium text-foreground-secondary">
                      Conversation started here
                    </p>
                    <div className="wiggle-rule h-[6px] min-w-0 flex-1 text-background-inverse/25" />
                  </div>
                  <div className="mt-12 space-y-16">
                    {turns.map((turn, index) => {
                      const isLast = index === turns.length - 1;
                      return (
                        <section
                          key={turn[0].id}
                          ref={isLast ? lastTurnRef : undefined}
                          style={isLast && viewportHeight ? { minHeight: viewportHeight - QUESTION_TOP - 24 } : undefined}
                          className="space-y-6"
                        >
                          {turn.map((message) =>
                            message.isUser ? (
                              <Question key={message.id} message={message} />
                            ) : !message.text && !message.widgets?.length ? null : (
                              <div key={message.id} className="space-y-4">
                                {message.text && (
                                  <div
                                    className={`chat-message text-sm leading-[1.75] ${message.isError ? "text-foreground-secondary" : ""}`}
                                  >
                                    <ChatMarkdown text={message.text} />
                                  </div>
                                )}
                                {/* Projects, timeline and contact wait for the whole
                                    reply, so nothing lands above them once shown. */}
                                {message.widgets?.length && !(isLast && isLoading) ? (
                                  <ChatWidgets widgets={message.widgets} />
                                ) : null}
                              </div>
                            ),
                          )}
                          {isLast && waiting && (
                            <p className="shimmer-text text-xs" aria-label="Thinking">
                              Thinking…
                            </p>
                          )}
                          {isLast && followUps.length > 0 && (
                            <div className="pt-2">
                              <SuggestionList
                                questions={followUps}
                                onPick={(q) => submit(q, "follow_up")}
                                arrow="↳"
                                small
                              />
                            </div>
                          )}
                        </section>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Composer */}
          <div className="shrink-0 px-4 sm:px-8 pb-4 pt-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit(input);
              }}
              onClick={() => inputRef.current?.focus()}
              className="mx-auto flex max-w-[42rem] items-end gap-2 rounded-2xl border border-background-inverse/20 bg-background py-2 pl-4 pr-2 transition-[border-color,box-shadow] duration-200 cursor-text focus-within:border-background-inverse/60 focus-within:shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-background-inverse)_7%,transparent)]"
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    submit(input);
                  }
                }}
                rows={1}
                aria-label={`Message ${firstName}`}
                placeholder={`Message ${firstName}…`}
                className="block min-h-10 flex-1 resize-none bg-transparent py-2 text-base leading-[1.5] placeholder:text-foreground-secondary focus:outline-none"
              />
              {/* Privacy note, on hover or focus (a tap on phones). */}
              <span className="group/info relative shrink-0">
                <button
                  type="button"
                  aria-label="About your questions"
                  aria-describedby="privacy-note"
                  className="flex size-10 items-center justify-center rounded-full text-foreground-secondary transition-colors hover:text-foreground focus-visible:text-foreground cursor-pointer"
                >
                  <Info size={16} />
                </button>
                <span
                  id="privacy-note"
                  role="tooltip"
                  className="pointer-events-none absolute right-0 bottom-full mb-2 w-72 translate-y-1 rounded-md bg-background-inverse px-3 py-2.5 text-xs leading-[1.6] text-background opacity-0 transition-[opacity,translate] duration-200 group-hover/info:translate-y-0 group-hover/info:opacity-100 group-focus-within/info:translate-y-0 group-focus-within/info:opacity-100"
                >
                  Questions and answers are saved so I can see what people ask and
                  improve the answers. Nothing that identifies you is kept: no name,
                  no IP address, only a rough location (country and city).
                </span>
              </span>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                aria-label="Send"
                title="Send"
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background-inverse text-background transition-opacity hover:opacity-90 cursor-pointer disabled:cursor-default disabled:opacity-30"
              >
                <ArrowUp size={17} strokeWidth={2.25} />
              </button>
            </form>
          </div>

          {/* Footer: email, profiles and the theme. */}
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 pb-3 text-xs text-foreground-secondary">
            {footerLinks}
          </div>
        </div>
      </div>
    </div>
  );
}

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" });

/**
 * The visitor's question, set as the headline of its exchange: a short
 * rule and the time, then the question in the heading face. Long questions
 * step down a size.
 */
function Question({ message }: { message: Message }) {
  const long = message.text.length > 120;
  return (
    <div className="animate-suggestion-in">
      <p className="flex items-center gap-2.5 text-xs text-foreground-secondary">
        <span aria-hidden="true" className="h-px w-5 bg-foreground" />
        <span className="sr-only">You asked at</span>
        <time dateTime={new Date(message.timestamp).toISOString()}>
          {timeFormat.format(new Date(message.timestamp))}
        </time>
      </p>
      <p
        className={`font-heading mt-3 font-bold tracking-tight whitespace-pre-wrap text-foreground ${
          long ? "text-lg leading-[1.45]" : "text-xl sm:text-2xl leading-[1.3]"
        }`}
      >
        {message.text}
      </p>
    </div>
  );
}

/** Suggested questions as a plain list of links, each with a small arrow. */
function SuggestionList({
  questions,
  onPick,
  arrow,
  small,
}: {
  questions: string[];
  onPick: (question: string) => void;
  arrow: string;
  small?: boolean;
}) {
  return (
    <ul className={small ? "space-y-0.5" : "space-y-1.5"} aria-label="Suggested questions">
      {questions.map((question, i) => (
        <li key={question} className="animate-suggestion-in" style={{ animationDelay: `${i * 60}ms` }}>
          <button
            type="button"
            onClick={() => onPick(question)}
            className={`group -mx-2 flex w-full items-center gap-2 rounded-md px-2 text-left text-foreground-secondary transition-colors hover:bg-background-inverse/5 hover:text-foreground cursor-pointer ${
              small ? "py-1 text-xs" : "py-1.5 text-sm"
            }`}
          >
            <span className="group-hover:text-foreground">{arrow}</span>
            {question}
          </button>
        </li>
      ))}
    </ul>
  );
}
