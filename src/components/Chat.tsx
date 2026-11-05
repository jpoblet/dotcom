"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Send, Sun, Moon, Monitor, ChevronDown } from "lucide-react";
import dynamic from "next/dynamic";
import ChatMarkdown from "@/components/ChatMarkdown";
import ChatWidgets from "@/components/ChatWidgets";
import Logo from "@/components/Logo";
import SiteFooter from "@/components/SiteFooter";
import {
  type Message,
  loadMessages,
  saveMessages,
  streamChat,
  toApiHistory,
} from "@/lib/chat-client";
import { NOTICES } from "@/lib/notices";

const OrganicBlob = dynamic(() => import("@/components/OrganicBlob"), {
  ssr: false,
});

type Theme = "light" | "dark" | "system";

interface ChatProps {
  name: string;
  title: string;
  email: string;
  links: { label: string; href: string }[];
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

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

/** Touch devices: don't auto-focus the input, it pops the keyboard open. */
const isTouchDevice = () => window.matchMedia("(pointer: coarse)").matches;


export default function Chat({ name, title, email, links }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [placeholderHeight, setPlaceholderHeight] = useState<number>();
  const [isBoxExpanded, setIsBoxExpanded] = useState(false);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);

  const messagesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const placeholderMeasureRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);
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

  // Restore chat history and theme from localStorage after hydration.
  // (Reading them during render would mismatch the server-rendered HTML.)
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMessages(loadMessages());

    const savedTheme = localStorage.getItem("theme");
    setTheme(
      savedTheme === "light" || savedTheme === "dark" ? savedTheme : "system",
    );

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

  // Collapse the floating box and theme menu on outside taps/clicks
  useEffect(() => {
    if (!isBoxExpanded && !isThemeMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (boxRef.current && !boxRef.current.contains(target)) {
        setIsBoxExpanded(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(target)) {
        setIsThemeMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isBoxExpanded, isThemeMenuOpen]);

  // Desktop: typing anywhere on the page goes into the input, without
  // trapping focus (Tab, text selection and links keep working).
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key.length !== 1) return;
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

  // Apply and persist the theme (the inline script in layout.tsx applies the
  // saved theme before first paint; this keeps it in sync afterwards).
  useEffect(() => {
    if (!theme) return;

    const applyTheme = () => {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      document.documentElement.classList.toggle(
        "dark",
        theme === "dark" || (theme === "system" && prefersDark),
      );
    };

    applyTheme();
    localStorage.setItem("theme", theme);

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", applyTheme);
      return () => mediaQuery.removeEventListener("change", applyTheme);
    }
  }, [theme]);

  const getThemeIcon = () => {
    if (theme === "light") return <Sun size={16} />;
    if (theme === "dark") return <Moon size={16} />;
    return <Monitor size={16} />;
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    setIsThemeMenuOpen(false);
  };

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

  const sendMessage = async (messageText?: string) => {
    const textToSend = (messageText ?? inputMessage).trim();
    if (!textToSend || isLoading) return;

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
      for await (const event of streamChat(history, controller.signal)) {
        if (event.type === "text") {
          updateReply((m) => ({ ...m, text: m.text + event.text }));
        } else if (event.type === "widget") {
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
      void sendMessage(ask.slice(0, 500));
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

  const getContextualQuestions = () => {
    const lastMessages = messages.slice(-3).map((m) => m.text.toLowerCase());
    const allText = lastMessages.join(" ");

    let questions: string[] = [];

    if (messages.length === 0) {
      questions = [
        "Where have you worked?",
        "What tools do you use?",
        "How many languages do you speak?",
        "What's your design philosophy?",
      ];
    } else if (
      allText.includes("work") ||
      allText.includes("job") ||
      allText.includes("company")
    ) {
      questions = [
        "What was your favorite project?",
        "Tell me about your leadership experience",
        "What challenges did you face?",
        "How do you collaborate with teams?",
      ];
    } else if (
      allText.includes("design") ||
      allText.includes("ui") ||
      allText.includes("ux")
    ) {
      questions = [
        "What's your design process?",
        "How do you approach user research?",
        "What design tools do you prefer?",
        "Tell me about your design philosophy",
      ];
    } else if (
      allText.includes("skill") ||
      allText.includes("tool") ||
      allText.includes("technology")
    ) {
      questions = [
        "What's your strongest skill?",
        "How do you stay updated with trends?",
        "What would you like to learn next?",
        "Tell me about your technical background",
      ];
    } else if (
      allText.includes("language") ||
      allText.includes("speak") ||
      allText.includes("communication")
    ) {
      questions = [
        "How do you handle international projects?",
        "Tell me about cross-cultural experiences",
        "What's your communication style?",
        "How do you present to stakeholders?",
      ];
    } else {
      questions = [
        "Can you elaborate on that?",
        "What's your proudest achievement?",
        "How do you handle challenges?",
        "What motivates you?",
      ];
    }

    return questions.slice(0, 4);
  };

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
  }, [messages.length, updateSuggestionShadows]);

  const resetChat = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsLoading(false);
    setMessages([]);
    setInputMessage("");
    setIsBoxExpanded(false);
    saveMessages([]);
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

          <div className="flex items-center gap-5">
            <Link
              href="/projects"
              className="text-xs underline underline-offset-2 hover:opacity-70 transition-opacity duration-200"
            >
              Projects
            </Link>

            {/* Theme Switcher */}
            <div className="relative" ref={themeMenuRef}>
              <button
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                aria-label="Change theme"
                aria-haspopup="menu"
                aria-expanded={isThemeMenuOpen}
                className={`flex items-center gap-2 px-4 py-2 bg-background hover:bg-background-inverse/10 rounded-full border transition-all duration-200 ${isThemeMenuOpen ? "border-background-inverse" : "border-background-inverse/10"}`}
              >
                {getThemeIcon()}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${isThemeMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isThemeMenuOpen && (
                <div
                  role="menu"
                  className="absolute top-full right-0 mt-2 bg-background border border-background-inverse/10 rounded-lg shadow-lg py-2 min-w-[140px] animate-fade-in"
                >
                  {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      role="menuitemradio"
                      aria-checked={theme === value}
                      disabled={theme === value}
                      onClick={() => handleThemeChange(value)}
                      className="w-full flex items-center gap-3 px-4 py-2 text-xs text-foreground hover:bg-background-secondary transition-colors disabled:text-foreground-secondary disabled:cursor-not-allowed"
                    >
                      <Icon size={16} />
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
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

      {/* Static Footer */}
      <SiteFooter
        email={email}
        links={links}
        className="fixed bottom-0 left-0 right-0 z-50 pt-5 sm:pt-10 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:pb-[calc(2.5rem+env(safe-area-inset-bottom))]"
      />

      {/* Floating Input Section */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="p-0 sm:p-6">
          <div
            ref={boxRef}
            data-floating-box
            onClick={() => setIsBoxExpanded(true)}
            className={`p-6 border mx-auto min-h-fit transition-all duration-200 sm:rounded-3xl sm:mb-[calc(7rem+env(safe-area-inset-bottom))] ${
              isBoxExpanded
                ? "max-w-4xl mb-[calc(3.75rem+env(safe-area-inset-bottom))] rounded-4xl border-background-inverse bg-background sm:shadow-xl"
                : "max-w-3xl mb-[calc(3rem+env(safe-area-inset-bottom))] rounded-t-4xl border-b-0 sm:border-b border-background-inverse/10 bg-background hover:bg-background-secondary sm:shadow-lg"
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
                    className="flex gap-2 overflow-x-auto scrollbar-hide"
                    onScroll={updateSuggestionShadows}
                  >
                    {getContextualQuestions().map((question, index) => (
                      <button
                        key={`${messages.length}-${index}`}
                        onClick={() => sendMessage(question)}
                        disabled={isLoading}
                        className="px-4 py-2 text-xs bg-background-inverse/8 text-foreground rounded-full cursor-pointer hover:bg-background-inverse/15 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-background-inverse/0 whitespace-nowrap flex-shrink-0"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
