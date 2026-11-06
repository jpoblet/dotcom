"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, Info, RotateCcw } from "lucide-react";
import ChatMarkdown from "@/components/ChatMarkdown";
import ChatWidgets from "@/components/ChatWidgets";
import Logo from "@/components/Logo";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import type { Message } from "@/lib/chat-client";
import type { QuestionSource } from "@/lib/chat-log";
import type { HeroPrompt as HeroPromptItem, Project } from "@/lib/content";
import ConfirmDialog from "./ConfirmDialog";
import DotGrille from "./DotGrille";
import HeroPrompt from "./HeroPrompt";

interface Props {
  name: string;
  title: string;
  email: string;
  links: { label: string; href: string }[];
  tagline: string;
  heroPrompts: HeroPromptItem[];
  /** Case studies, shown as logos on the empty page. */
  work: Pick<Project, "slug" | "name" | "logoMark">[];
  onOpenProject: (slug: string) => void;
  messages: Message[];
  isLoading: boolean;
  send: (text: string, source?: QuestionSource) => void;
  reset: () => void;
  /** Buttons that open the Work and AI Notes panel. */
  panelButtons?: React.ReactNode;
}

/**
 * The chat column, in the spirit of an editor's assistant panel: plain
 * replies, the visitor's questions in quiet bordered blocks, and a compact
 * input at the bottom.
 */
export default function ChatPane({
  name,
  title,
  email,
  links,
  tagline,
  heroPrompts,
  work,
  onOpenProject,
  messages,
  isLoading,
  send,
  reset,
  panelButtons,
}: Props) {
  const [input, setInput] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const introRef = useRef<HTMLDivElement>(null);
  const [introVisible, setIntroVisible] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastTurnRef = useRef<HTMLElement>(null);
  const [viewportHeight, setViewportHeight] = useState(0);

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
    container.scrollTo({ top: turn.offsetTop - 24, behavior });
  }, [lastQuestionId, viewportHeight]);

  // Watch the intro within the conversation's own scroll area.
  useEffect(() => {
    const intro = introRef.current;
    const root = scrollRef.current;
    if (!intro || !root) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIntroVisible(entry.isIntersecting),
      { root, threshold: 0.15 },
    );
    observer.observe(intro);
    return () => observer.disconnect();
  }, []);

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
  // Exchanges: each starts with a question and holds the reply after it.
  const turns: Message[][] = [];
  for (const message of messages) {
    if (message.isUser || turns.length === 0) turns.push([message]);
    else turns[turns.length - 1].push(message);
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-background-inverse/10 px-4">
        <div className="flex items-center gap-3 min-w-0">
          <Logo className="h-6 fill-current shrink-0" />
          {/* Shown once the intro (which says the same) scrolls out of view. */}
          <span
            aria-hidden={introVisible}
            className={`truncate text-xs text-foreground-secondary transition-[opacity,translate] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              introVisible ? "opacity-0 translate-y-1.5" : "opacity-100 translate-y-0"
            }`}
          >
            {/* Name set like the intro's "Hi, I'm Jordi.": heading face, medium, ink. */}
            <span className="font-heading font-bold text-foreground">{name}</span>
            {/* Same `title` as the tagline: both come from content/profile.yaml. */}
            <span className="hidden sm:inline"> · {title}</span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          {panelButtons}
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            disabled={messages.length === 0}
            title="Start over"
            aria-label="Start over"
            className="flex size-8 items-center justify-center rounded-md text-foreground-secondary hover:bg-background-inverse/6 hover:text-foreground cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-default disabled:hover:bg-transparent"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Conversation */}
      <div
        ref={scrollRef}
        className="relative min-h-0 flex-1 overflow-y-auto px-4 py-6"
      >
        {/* Braun-grille dots, anchored to the right edge of the chat area
            and fading in towards the text. Scrolls away with the intro. */}
        <DotGrille className="absolute top-0 right-0 h-[min(85vh,52rem)] w-[min(50%,40rem)] [mask-image:radial-gradient(ellipse_at_100%_40%,black_15%,transparent_72%)]" />
        <div className="w-full">
        {empty ? (
          /* The empty page is one sentence: "Ask me about ___". */
          <div
            ref={introRef}
            className="relative mx-auto flex min-h-full max-w-[60rem] flex-col pt-[4vh] lg:pt-[10vh] animate-suggestion-in"
          >
            <HeroPrompt
              name={name}
              tagline={tagline}
              prompts={heroPrompts}
              work={work}
              onAsk={(text, source) => submit(text, source)}
              onOpenProject={onOpenProject}
              disabled={isLoading}
            />
          </div>
        ) : (
          /* Once talking: who's answering, at the top of the history. */
          <div ref={introRef} className="relative mx-auto max-w-[60rem] pt-6">
            <p className="font-heading text-3xl sm:text-4xl font-bold tracking-[-0.02em]">{name}</p>
            <p className="mt-3 max-w-xl text-sm leading-[1.7] text-foreground-secondary">{tagline}</p>
          </div>
        )}
        {!empty && (
          <>
          {/* Where the conversation begins: a title and a gentle wavy rule
              as wide as the intro. */}
          <div className="mx-auto mt-16 max-w-[60rem]" aria-hidden="true">
            <p className="animate-suggestion-in font-label text-xs text-foreground-secondary">
              Conversation started here
            </p>
            <div className="wiggle-rule mt-3 h-1 text-background-inverse/20" />
          </div>
          <div className="mx-auto mt-12 max-w-[42rem] space-y-16">
            {turns.map((turn, index) => {
              const isLast = index === turns.length - 1;
              return (
                <section
                  key={turn[0].id}
                  ref={isLast ? lastTurnRef : undefined}
                  style={isLast && viewportHeight ? { minHeight: viewportHeight - 48 } : undefined}
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
                        {message.widgets?.length ? <ChatWidgets widgets={message.widgets} /> : null}
                      </div>
                    ),
                  )}
                  {isLast && isLoading && !last?.text && (
                    <p className="shimmer-text text-xs" aria-label="Thinking">
                      Thinking…
                    </p>
                  )}
                  {isLast && followUps.length > 0 && (
                    <ul className="space-y-0.5 pt-2">
                      {followUps.map((question, i) => (
                        <li key={question} className="animate-suggestion-in" style={{ animationDelay: `${i * 60}ms` }}>
                          <button
                            type="button"
                            onClick={() => submit(question, "follow_up")}
                            className="group flex w-full items-center gap-2 rounded-md px-2 py-1 -mx-2 text-left text-xs text-foreground-secondary hover:bg-background-inverse/5 hover:text-foreground cursor-pointer transition-colors"
                          >
                            <span className="text-foreground-secondary group-hover:text-foreground">↳</span>
                            {question}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
          </>
        )}
        </div>
      </div>

      {/* Input, once the conversation has started (the empty page asks in
          its own big field). */}
      {!empty && (
      <div className="relative z-10 mx-auto w-full max-w-[calc(60rem+2rem)] shrink-0 px-4 animate-suggestion-in">
        {/* One clean field: hairline border, the send button inline. */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
          onClick={() => inputRef.current?.focus()}
          className="flex items-end gap-3 rounded-xl border border-background-inverse/15 bg-background py-2.5 pl-4 pr-2.5 transition-[border-color,box-shadow] duration-200 cursor-text focus-within:border-background-inverse/45 focus-within:shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-background-inverse)_6%,transparent)]"
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
            aria-label="Ask me anything"
            placeholder="Ask me anything…"
            className="block min-h-8 flex-1 resize-none bg-transparent py-1 text-base sm:text-sm leading-[1.6] placeholder:text-foreground-secondary focus:outline-none"
          />
          {/* Privacy note, on hover or focus (a tap on phones). */}
          <span className="group/info relative shrink-0">
            <button
              type="button"
              aria-label="About your questions"
              aria-describedby="privacy-note"
              className="flex size-8 items-center justify-center rounded-full text-foreground-secondary transition-colors hover:text-foreground focus-visible:text-foreground cursor-pointer"
            >
              <Info size={15} />
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
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-background-inverse text-background transition-colors cursor-pointer disabled:cursor-default disabled:bg-background-inverse/10 disabled:text-foreground-secondary"
          >
            <ArrowUp size={16} strokeWidth={2.25} />
          </button>
        </form>
      </div>
      )}

      {/* Footer: the full width of the chat column. */}
      <div className="shrink-0 px-4 pt-3 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-xs text-foreground-secondary">
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
        </div>
      </div>
      <ConfirmDialog
        open={confirmReset}
        title="Start over?"
        confirmLabel="Start over"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          setConfirmReset(false);
          reset();
          inputRef.current?.focus();
        }}
      >
        This clears our whole conversation and your AI Notes, and there&apos;s no way to get
        them back. If you&apos;d like to keep them, write up the conversation in AI Notes first.
      </ConfirmDialog>
    </div>
  );
}

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" });

/**
 * The visitor's question, set as the headline of its exchange: a short
 * rule, "You" and the time, then the question in the heading face. Long
 * questions step down a size.
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
