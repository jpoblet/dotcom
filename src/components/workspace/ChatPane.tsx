"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, RotateCcw } from "lucide-react";
import ChatMarkdown from "@/components/ChatMarkdown";
import ChatWidgets from "@/components/ChatWidgets";
import Logo from "@/components/Logo";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import type { Message } from "@/lib/chat-client";
import type { QuestionSource } from "@/lib/chat-log";
import ConfirmDialog from "./ConfirmDialog";

interface Props {
  name: string;
  title: string;
  email: string;
  links: { label: string; href: string }[];
  starterQuestions: string[];
  messages: Message[];
  isLoading: boolean;
  send: (text: string, source?: QuestionSource) => void;
  reset: () => void;
  /** Buttons that open the Work and AI Notes panel. */
  panelButtons?: React.ReactNode;
}

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
 * The chat column, in the spirit of an editor's assistant panel: plain
 * replies, the visitor's questions in quiet bordered blocks, and a compact
 * input at the bottom.
 */
export default function ChatPane({
  name,
  title,
  email,
  links,
  starterQuestions,
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
  const stickToBottom = useRef(true);
  const starters = useRandomPick(starterQuestions, 4);

  // Follow new text while the visitor is at the bottom.
  useEffect(() => {
    if (!stickToBottom.current) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isLoading]);

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
      stickToBottom.current = true;
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

  return (
    <div className="flex h-full min-h-0 flex-col">
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
            {name}
            {/* Same `title` as the intro: both come from content/profile.yaml. */}
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
        onScroll={(e) => {
          const el = e.currentTarget;
          stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        }}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-6"
      >
        <div className="mx-auto w-full max-w-[42rem]">
        {/* The intro opens the conversation and stays at the top of it. */}
        <div ref={introRef} className={`animate-suggestion-in ${empty ? "pt-[8vh] lg:pt-[14vh]" : "pt-6"}`}>
            <h1 className="text-3xl sm:text-4xl font-medium tracking-tight leading-[1.15]">
              Hi, I&apos;m {name.split(" ")[0]}.
            </h1>
            <p className="mt-2 text-lg sm:text-xl tracking-tight text-foreground-secondary">{title}.</p>
            <p className="mt-8 max-w-md text-[0.8125rem] leading-[1.85] text-foreground-secondary">
              This is an AI that answers as me, from my own notes. Ask about my work, a project
              or my life. Projects open alongside as we talk.
            </p>
            {empty && (
            <ul className="mt-8 space-y-1">
              {starters.map((question, index) => (
                <li key={question} className="animate-suggestion-in" style={{ animationDelay: `${index * 60}ms` }}>
                  <button
                    type="button"
                    onClick={() => submit(question, "starter")}
                    className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 -mx-2 text-left text-xs text-foreground-secondary hover:bg-background-inverse/5 hover:text-foreground cursor-pointer transition-colors"
                  >
                    <span className="text-foreground-secondary group-hover:text-foreground">→</span>
                    {question}
                  </button>
                </li>
              ))}
            </ul>
            )}
        </div>
        {!empty && (
          <div className="mt-12 space-y-5 border-t border-background-inverse/10 pt-8">
            {messages.map((message) =>
              message.isUser ? (
                <div
                  key={message.id}
                  className="rounded-md border border-background-inverse/12 bg-background-inverse/[0.03] px-3 py-2 text-[0.8125rem] leading-[1.85] whitespace-pre-wrap"
                >
                  {message.text}
                </div>
              ) : !message.text && !message.widgets?.length ? null : (
                <div key={message.id} className="space-y-3">
                  {message.text && (
                    <div
                      className={`chat-message text-[0.8125rem] leading-[1.85] ${message.isError ? "text-foreground-secondary" : ""}`}
                    >
                      <ChatMarkdown text={message.text} />
                    </div>
                  )}
                  {message.widgets?.length ? <ChatWidgets widgets={message.widgets} /> : null}
                </div>
              ),
            )}
            {isLoading && !last?.text && (
              <p className="shimmer-text text-xs" aria-label="Thinking">
                Thinking…
              </p>
            )}
            {followUps.length > 0 && (
              <ul className="space-y-0.5 pt-1">
                {followUps.map((question, index) => (
                  <li key={question} className="animate-suggestion-in" style={{ animationDelay: `${index * 60}ms` }}>
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
          </div>
        )}
        </div>
      </div>

      {/* Input */}
      <div className="mx-auto w-full max-w-[calc(42rem+2rem)] shrink-0 px-4 pb-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
          className="rounded-lg border border-background-inverse/15 bg-background focus-within:border-background-inverse/40 transition-colors"
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
            rows={2}
            aria-label="Ask me anything"
            placeholder="Ask me anything…"
            className="block w-full resize-none bg-transparent px-3 pt-2.5 text-base sm:text-[0.8125rem] sm:leading-[1.7] placeholder:text-foreground-secondary focus:outline-none"
          />
          <div className="flex items-center justify-between gap-3 px-3 pb-2">
            <span className="text-[0.6875rem] text-foreground-secondary">
              Questions are stored anonymously.
            </span>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              aria-label="Send"
              className="flex size-7 items-center justify-center rounded-md bg-background-inverse text-background disabled:opacity-25 cursor-pointer disabled:cursor-not-allowed transition-opacity"
            >
              <ArrowUp size={14} />
            </button>
          </div>
        </form>

        <div className="mt-3 flex items-center justify-between gap-3 text-[0.6875rem] text-foreground-secondary">
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
