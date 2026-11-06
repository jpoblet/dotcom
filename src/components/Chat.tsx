"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Send } from "lucide-react";
import dynamic from "next/dynamic";
import ChatMarkdown from "@/components/ChatMarkdown";
import ChatWidgets from "@/components/ChatWidgets";
import Logo from "@/components/Logo";
import RotatingSuggestion from "@/components/RotatingSuggestion";
import {
  type Message,
  loadMessages,
  saveMessages,
  startNewConversation,
  streamChat,
  toApiHistory,
} from "@/lib/chat-client";
import { track } from "@/lib/analytics";
import type { QuestionSource } from "@/lib/chat-log";
import { NOTICES } from "@/lib/notices";

const OrganicBlob = dynamic(() => import("@/components/OrganicBlob"), {
  ssr: false,
});

interface ChatProps {
  name: string;
  title: string;
  email: string;
  /** Questions suggested on the empty chat (from profile.yaml). */
  starterQuestions: string[];
}

const PLACEHOLDER_PHRASES = [
  "I fed my CV to this AI so it can answer for me.",
  "You can ask me anything...",
];
// The longest phrase decides the input's height while the placeholder types,
// so the box doesn't jump between phrases.
const LONGEST_PHRASE = PLACEHOLDER_PHRASES.reduce((a, b) =>
  b.length > a.length ? b : a,
);

/** Touch devices: don't auto-focus the input, it pops the keyboard open. */
const isTouchDevice = () => window.matchMedia("(pointer: coarse)").matches;


export default function Chat({
  name,
  title,
  email,
  starterQuestions,
}: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [placeholderHeight, setPlaceholderHeight] = useState<number>();
  const [isBoxExpanded, setIsBoxExpanded] = useState(false);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);

  const messagesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const placeholderMeasureRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  /** Follow new text only while the visitor is at the bottom of the chat. */
  const stickToBottomRef = useRef(true);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  /** Desktop: keep the input ready to type. Touch: close the keyboard. */
  const settleInputFocus = useCallback(() => {
    const input = textareaRef.current;
    if (!input) return;
    if (isTouchDevice()) input.blur();
    else input.focus();
  }, []);

  const resetInputHeight = () => {
    if (textareaRef.current) textareaRef.current.style.height = "";
  };

  // Restore chat history from localStorage after hydration.
  // (Reading them during render would mismatch the server-rendered HTML.)
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMessages(loadMessages());

    if (!isTouchDevice()) textareaRef.current?.focus();
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Save chat history once a reply has finished streaming
  useEffect(() => {
    if (messages.length > 0 && !isLoading) saveMessages(messages);
  }, [messages, isLoading]);

  // Keep the newest text in view while it streams in, unless the visitor
  // has scrolled up to read something.
  useEffect(() => {
    if (!stickToBottomRef.current) return;
    const frame = requestAnimationFrame(scrollToBottom);
    return () => cancelAnimationFrame(frame);
  }, [messages, isLoading, scrollToBottom]);

  const handleMessagesScroll = () => {
    const el = messagesRef.current;
    if (!el) return;
    stickToBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  };

  // Stop any in-flight reply if the page unmounts
  useEffect(() => () => abortRef.current?.abort(), []);

  // Collapse the floating box on outside taps/clicks
  useEffect(() => {
    if (!isBoxExpanded) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (boxRef.current && !boxRef.current.contains(target)) {
        setIsBoxExpanded(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isBoxExpanded]);

  // Desktop: typing anywhere on the page goes into the input, without
  // trapping focus (Tab, text selection and links keep working).
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key.length !== 1) return;
      // A project modal is open on top of the chat.
      if (document.body.dataset.modal === "open") return;
      const active = document.activeElement;
      if (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        (active instanceof HTMLElement && active.isContentEditable)
      ) {
        return;
      }
      textareaRef.current?.focus();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Typing animation effect for placeholder - only when no messages exist
  useEffect(() => {
    // The placeholder animation only shows on the empty chat
    if (messages.length > 0) return;

    const currentPhrase = PLACEHOLDER_PHRASES[currentPlaceholder];

    if (isTyping) {
      if (displayedText.length < currentPhrase.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(currentPhrase.slice(0, displayedText.length + 1));
        }, 50);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => setIsTyping(false), 2000);
        return () => clearTimeout(timeout);
      }
    } else {
      if (displayedText.length > 0) {
        const timeout = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, 25);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setCurrentPlaceholder(
            (prev) => (prev + 1) % PLACEHOLDER_PHRASES.length,
          );
          setIsTyping(true);
        }, 500);
        return () => clearTimeout(timeout);
      }
    }
  }, [currentPlaceholder, displayedText, isTyping, messages.length]);

  // Measure how tall the input must be to show the longest placeholder
  // phrase without clipping (2-3 lines on phones, 1 line on desktop).
  useEffect(() => {
    const el = placeholderMeasureRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() =>
      setPlaceholderHeight(el.offsetHeight),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [messages.length]);

  const sendMessage = async (
    messageText?: string,
    source: QuestionSource = "typed",
  ) => {
    const textToSend = (messageText ?? inputMessage).trim();
    if (!textToSend || isLoading) return;
    track("Chat question", { source });

    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: textToSend,
      isUser: true,
      timestamp: new Date(),
    };
    const replyId = crypto.randomUUID();
    const history = toApiHistory([...messages, userMessage]);

    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: replyId, text: "", isUser: false, timestamp: new Date() },
    ]);
    setInputMessage("");
    resetInputHeight();
    setIsLoading(true);
    stickToBottomRef.current = true;
    settleInputFocus();

    const updateReply = (update: (reply: Message) => Message) =>
      setMessages((prev) =>
        prev.map((m) => (m.id === replyId ? update(m) : m)),
      );
    const failReply = (text: string) =>
      updateReply((m) => ({ ...m, text, isError: true }));

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      for await (const event of streamChat(history, controller.signal, source)) {
        if (event.type === "text") {
          updateReply((m) => ({ ...m, text: m.text + event.text }));
        } else if (event.type === "suggestions") {
          updateReply((m) => ({ ...m, suggestions: event.questions }));
        } else if (event.type === "widget") {
          if (event.widget.kind === "project") {
            track("Project card shown", { project: event.widget.project.slug });
          }
          updateReply((m) => ({
            ...m,
            widgets: [...(m.widgets ?? []), event.widget],
          }));
        } else if (event.type === "refusal") {
          failReply(event.message);
        } else if (event.type === "error") {
          failReply(event.message);
        }
      }
    } catch {
      if (!controller.signal.aborted) {
        failReply(
          NOTICES.connectionError(email),
        );
      }
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setIsLoading(false);
        // The textarea was disabled while loading; refocus once it's enabled.
        setTimeout(() => {
          if (!isTouchDevice()) textareaRef.current?.focus();
        }, 0);
      }
    }
  };

  // Arriving from a project page ("Ask me about this project") with ?ask=...
  // sends that question straight away.
  useEffect(() => {
    const ask = new URLSearchParams(window.location.search).get("ask");
    if (!ask) return;
    // Next tick, after the saved history has been restored.
    const timeout = setTimeout(() => {
      window.history.replaceState(null, "", window.location.pathname);
      void sendMessage(ask.slice(0, 500), "project_page");
    }, 0);
    return () => clearTimeout(timeout);
    // Runs once on arrival; sendMessage is intentionally not a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // isComposing: don't send while an IME (e.g. Japanese input) is active
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Starter questions the visitor hasn't asked yet.
  const unaskedStarters = useMemo(() => {
    const asked = new Set(
      messages.filter((m) => m.isUser).map((m) => m.text.trim().toLowerCase()),
    );
    const fresh = starterQuestions.filter((q) => !asked.has(q.toLowerCase()));
    return fresh.length > 0 ? fresh : starterQuestions;
  }, [messages, starterQuestions]);

  // The AI's follow-ups for its latest reply, once it has finished.
  const lastMessage = messages.at(-1);
  const followUps =
    !isLoading && lastMessage && !lastMessage.isUser && !lastMessage.isError
      ? (lastMessage.suggestions ?? [])
      : [];

  const updateSuggestionShadows = useCallback(() => {
    const el = suggestionsRef.current;
    if (!el) return;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setShowLeftShadow(el.scrollLeft > 0);
    setShowRightShadow(el.scrollLeft < maxScrollLeft - 1);
  }, []);

  // Recompute the edge fades when suggestions change or the window resizes
  useEffect(() => {
    const el = suggestionsRef.current;
    if (!el) return;
    el.scrollLeft = 0;
    updateSuggestionShadows();
    const observer = new ResizeObserver(updateSuggestionShadows);
    observer.observe(el);
    return () => observer.disconnect();
  }, [messages.length, followUps.length, updateSuggestionShadows]);

  const resetChat = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsLoading(false);
    setMessages([]);
    setInputMessage("");
    setIsBoxExpanded(false);
    saveMessages([]);
    startNewConversation();
    textareaRef.current?.blur();
    resetInputHeight();
  };

  const isEmpty = messages.length === 0;

  return (
    <main className="w-full h-dvh flex flex-col overflow-hidden relative">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-background lg:bg-transparent pt-[env(safe-area-inset-top)] z-50 after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-6 after:bg-gradient-to-b after:from-background after:to-transparent lg:after:hidden">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Brand */}
          <button
            onClick={resetChat}
            className="flex cursor-pointer items-center justify-center text-foreground hover:opacity-70 transition-opacity duration-200"
            title="Reset chat"
            aria-label="Reset chat"
          >
            <Logo className="h-9 fill-current" />
          </button>

          <Link
            href="/projects"
            className="text-xs underline underline-offset-2 hover:opacity-70 transition-opacity duration-200"
          >
            Projects
          </Link>
        </div>
      </header>

      {/* Blob Section */}
      {isEmpty && (
        <section className="w-full h-[70%] fixed flex items-center justify-center">
          <OrganicBlob color={0x00bfff} speed={0.008} noiseStrength={0.15} />
        </section>
      )}

      {/* Hero Section */}
      {isEmpty && (
        <section className="absolute h-[70%] inset-0 flex items-center justify-center z-30">
          <div className="text-center px-6 md:max-w-[1200px] relative z-10">
            <h1 className="text-2xl sm:text-3xl leading-snug max-w-4xl mx-auto">
              Hi, <strong className="font-medium">{name}</strong> here,
              <br />
              {title}.
            </h1>
          </div>
        </section>
      )}

      {/* AI Chat Section */}
      <section className="w-full flex-1 flex flex-col overflow-hidden self-center">
        <div className="flex flex-col h-full">
          {/* Messages - Scrollable Area with bottom padding for floating input */}
          <div
            ref={messagesRef}
            onScroll={handleMessagesScroll}
            className="flex flex-1 flex-col items-center overflow-y-auto space-y-4 px-8 lg:px-32 mt-0 pb-96"
          >
            <div className="flex flex-col md:max-w-[1200px] container">
              {messages.map((message) =>
                // The empty reply placeholder is shown as the typing dots
                !message.isUser && !message.text && !message.widgets?.length ? null : (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? "justify-end pt-18 pb-8" : "justify-start"}`}
                  >
                    <div
                      className={`sm:max-w-[80%] md:max-w-[70%] lg:max-w-[60%] ${
                        message.isUser
                          ? "max-w-[85%] bg-background-inverse text-foreground-inverse rounded-t-2xl rounded-bl-2xl rounded-br-sm px-6 py-3"
                          : "text-foreground"
                      }`}
                    >
                      {message.isUser ? (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.text}
                        </p>
                      ) : (
                        <>
                          {message.text && (
                            <div
                              className={`chat-message text-sm leading-relaxed ${message.isError ? "text-foreground-secondary" : ""}`}
                            >
                              <ChatMarkdown text={message.text} />
                            </div>
                          )}
                          {message.widgets?.length ? (
                            <ChatWidgets widgets={message.widgets} />
                          ) : null}
                        </>
                      )}
                    </div>
                  </div>
                ),
              )}
              {isLoading && !messages.at(-1)?.text && (
                <div className="flex justify-start" aria-label="Thinking">
                  <div className="text-foreground p-4">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-foreground-secondary rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-foreground-secondary rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-foreground-secondary rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Gradient Overlay */}
      <div className="fixed bottom-0 left-0 right-0 h-[400px] bg-gradient-to-t from-background from-40% to-transparent to-100% z-40 pointer-events-none"></div>

      {/* Floating Input Section */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="p-0 sm:p-6">
          <div
            ref={boxRef}
            data-floating-box
            onClick={() => setIsBoxExpanded(true)}
            className={`p-6 border mx-auto min-h-fit transition-all duration-200 sm:rounded-3xl sm:mb-[calc(3.25rem+env(safe-area-inset-bottom))] ${
              isBoxExpanded
                ? "max-w-4xl mb-[calc(4.25rem+env(safe-area-inset-bottom))] rounded-4xl border-background-inverse bg-background"
                : "max-w-3xl mb-[calc(3.5rem+env(safe-area-inset-bottom))] rounded-t-4xl border-b-0 sm:border-b border-background-inverse/15 bg-background hover:bg-background-secondary"
            } ${isLoading ? "opacity-80" : "opacity-100"}`}
          >
            <div className="flex flex-col space-y-4 min-h-fit">
              {/* Input Row */}
              <div className="flex mb-9 space-x-3 items-start">
                <div className="flex-1 relative">
                  {/* Invisible copy of the longest placeholder phrase, used to
                      size the input so the typed placeholder never clips. */}
                  {isEmpty && (
                    <div
                      ref={placeholderMeasureRef}
                      aria-hidden="true"
                      className="invisible pointer-events-none absolute inset-x-0 top-0 px-4 py-3 text-base sm:text-sm whitespace-pre-wrap break-words"
                    >
                      {LONGEST_PHRASE}
                    </div>
                  )}
                  <textarea
                    ref={textareaRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    aria-label="Ask me anything"
                    placeholder={isEmpty ? displayedText : "Ask me anything..."}
                    className={`w-full px-4 py-3 border-none rounded-2xl text-foreground focus:outline-none focus:ring-0 text-base sm:text-sm transition-all duration-300 bg-transparent resize-none min-h-10 max-h-32 overflow-y-auto ${
                      isLoading
                        ? "placeholder:text-foreground-secondary/50 cursor-not-allowed"
                        : "placeholder:text-foreground-secondary"
                    }`}
                    style={
                      isEmpty && placeholderHeight
                        ? { minHeight: placeholderHeight }
                        : undefined
                    }
                    disabled={isLoading}
                    rows={1}
                    onInput={(e) => {
                      const target = e.currentTarget;
                      target.style.height = "auto";
                      target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
                    }}
                  />
                </div>
                <button
                  onClick={() => sendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-background-inverse text-background px-5 py-3 rounded-full hover:opacity-70 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
                  title="Send"
                  aria-label="Send"
                >
                  <Send size={16} />
                </button>
              </div>

              {/* Integrated Suggestions */}
              <div className="flex flex-col space-y-3">
                <div
                  className={`relative ${showLeftShadow ? "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-8 before:bg-gradient-to-r before:from-background before:via-background/80 before:to-transparent before:pointer-events-none before:z-10" : ""} ${showRightShadow ? "after:absolute after:right-0 after:top-0 after:bottom-0 after:w-8 after:bg-gradient-to-l after:from-background after:via-background/80 after:to-transparent after:pointer-events-none after:z-10" : ""}`}
                >
                  <div
                    ref={suggestionsRef}
                    className="flex gap-2 min-h-[2.125rem] overflow-x-auto overflow-y-hidden scrollbar-hide"
                    onScroll={updateSuggestionShadows}
                  >
                    {followUps.length > 0 ? (
                      followUps.map((question, index) => (
                        <button
                          key={`${lastMessage?.id}-${index}`}
                          onClick={() => sendMessage(question, "follow_up")}
                          disabled={isLoading}
                          style={{ animationDelay: `${index * 80}ms` }}
                          className="animate-suggestion-in px-4 py-2 text-xs bg-background-inverse/8 text-foreground rounded-full cursor-pointer hover:bg-background-inverse/15 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 whitespace-nowrap flex-shrink-0"
                        >
                          {question}
                        </button>
                      ))
                    ) : !isLoading ? (
                      <RotatingSuggestion
                        questions={unaskedStarters}
                        onPick={(question) => sendMessage(question, "starter")}
                        disabled={isLoading}
                      />
                    ) : null}
                  </div>
                </div>
                <p className="px-1 text-xs leading-none text-foreground-secondary">
                  Questions are stored anonymously.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
