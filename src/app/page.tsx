"use client";

import { TempoDevtools } from "tempo-devtools";
import { useEffect, useState } from "react";
import { Send, RotateCcw } from "lucide-react";
import cvData from "../data/cv.json";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInputActive, setIsInputActive] = useState(false);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  // Load chat history from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem("chat-history");
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages).map(
          (msg: Message & { timestamp: string }) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }),
        );
        setMessages(parsedMessages);
      } catch {
        console.error("Failed to parse saved messages");
        // If parsing fails, start with empty messages
        setMessages([]);
      }
    } else {
      // No saved history, start with empty messages
      setMessages([]);
    }

    // Scroll to bottom after messages are loaded and rendered
    setTimeout(() => {
      const messagesContainer = document.querySelector(".overflow-y-auto");
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 100);
  }, []);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chat-history", JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    const scrollToBottom = () => {
      const messagesContainer = document.querySelector(".overflow-y-auto");
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    };

    // Scroll after a short delay to ensure DOM has updated
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_TEMPO) {
      TempoDevtools.init();
    }
  }, []);

  // Typing animation effect for placeholder - only when no messages exist
  useEffect(() => {
    // Don't run typing animation if messages exist
    if (messages.length > 0) {
      setDisplayedText("");
      return;
    }

    const phrases = [
      "I fed my CV to this AI so it can answer for me...",
      "You can ask me anything...",
    ];
    const currentPhrase = phrases[currentPlaceholder];

    if (isTyping) {
      // Typing effect
      if (displayedText.length < currentPhrase.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(currentPhrase.slice(0, displayedText.length + 1));
        }, 50);
        return () => clearTimeout(timeout);
      } else {
        // Finished typing, wait then start erasing
        const timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
        return () => clearTimeout(timeout);
      }
    } else {
      // Erasing effect
      if (displayedText.length > 0) {
        const timeout = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, 25);
        return () => clearTimeout(timeout);
      } else {
        // Finished erasing, switch to next phrase
        const timeout = setTimeout(() => {
          setCurrentPlaceholder((prev) => (prev + 1) % phrases.length);
          setIsTyping(true);
        }, 500);
        return () => clearTimeout(timeout);
      }
    }
  }, [currentPlaceholder, displayedText, isTyping, messages.length]);

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: textToSend }),
      });

      const data = await response.json();

      if (response.ok) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getContextualQuestions = () => {
    const lastMessages = messages.slice(-3).map((m) => m.text.toLowerCase());
    const allText = lastMessages.join(" ");

    let questions: string[] = [];

    // Default questions for initial state
    if (messages.length === 0) {
      questions = [
        "Where have you worked?",
        "What tools do you use?",
        "How many languages do you speak?",
        "What's your design philosophy?",
      ];
    }
    // Adapt questions based on conversation context
    else if (
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
      // General follow-up questions
      questions = [
        "Can you elaborate on that?",
        "What's your proudest achievement?",
        "How do you handle challenges?",
        "What motivates you?",
      ];
    }

    // Ensure maximum 4 questions
    return questions.slice(0, 4);
  };

  const handleSampleQuestion = (question: string) => {
    setInputMessage(question);
    sendMessage(question);

    // Scroll to bottom after a short delay to ensure the message is rendered
    setTimeout(() => {
      const messagesContainer = document.querySelector(".overflow-y-auto");
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 100);
  };

  const resetChat = () => {
    setMessages([]);
    setInputMessage("");
    localStorage.setItem("chat-history", JSON.stringify([]));
  };

  return (
    <main className="w-full h-screen flex flex-col overflow-hidden relative">
      {/* Hero Section */}
      {messages.length === 0 && (
        <section className="absolute inset-0 flex items-center justify-center z-30 bg-background-secondary">
          <div className="text-center px-6">
            <div
              className="text-3xl leading-snug max-w-4xl mx-auto"
              dangerouslySetInnerHTML={{ __html: cvData.initialMessage }}
            />
          </div>
        </section>
      )}

      {/* AI Chat Section */}
      <section className="w-full flex-1 flex flex-col overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Messages - Scrollable Area with bottom padding for floating input */}
          <div className="flex-1 overflow-y-auto p-10 space-y-4 pb-80">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[60%] p-4 ${
                    message.isUser
                      ? "bg-background-inverse text-foreground-inverse rounded-t-2xl rounded-bl-2xl rounded-br-sm px-6"
                      : "text-foreground rounded-lg"
                  }`}
                >
                  <div
                    className={`text-sm leading-relaxed ${message.text.includes("<a ") || message.text.includes("</a>") ? "[&_div:has(img)]:bg-background [&_div:has(img)]:p-4 [&_div:has(img)]:rounded-lg [&_div:has(img)]:shadow-md [&_div:has(img)]:hover:shadow-lg [&_div:has(img)]:transition-shadow [&_div:has(img)]:duration-200" : ""}`}
                    dangerouslySetInnerHTML={{ __html: message.text }}
                  />
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
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
      </section>

      {/* Gradient Overlay */}
      <div className="fixed bottom-0 left-0 right-0 h-[400px] bg-gradient-to-t from-background from-40% to-transparent to-100% z-40 pointer-events-none"></div>

      {/* Floating Input Section */}
      <div className="fixed bottom-6 left-6 right-6 z-50">
        <div className="p-6">
          {/* Enhanced Input Section with Integrated Suggestions */}
          <div
            className={`bg-background rounded-3xl p-6 shadow-lg border transition-all duration-300 mx-auto ${
              isInputActive
                ? "border-background-inverse max-w-4xl"
                : "border-foreground/10 max-w-3xl"
            } ${isLoading ? "opacity-50" : "opacity-100"}`}
          >
            <div className="flex flex-col space-y-4">
              {/* Input Row */}
              <div className="flex space-x-3">
                <div className="flex-1 relative">
                  <div className="input-wrapper">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      onClick={() => setIsInputActive(true)}
                      onBlur={() =>
                        !inputMessage.trim() && setIsInputActive(false)
                      }
                      placeholder={
                        messages.length > 0
                          ? "Ask me anything..."
                          : displayedText
                      }
                      className={`w-full p-4 border-none rounded-2xl text-foreground focus:outline-none focus:ring-0 text-sm transition-all duration-300 bg-transparent ${
                        isLoading
                          ? "placeholder:text-foreground-secondary/50 cursor-not-allowed"
                          : "placeholder:text-foreground-secondary"
                      }`}
                      disabled={isLoading}
                    />
                    {messages.length === 0 &&
                      !isInputActive &&
                      displayedText && <div className="typing-cursor">|</div>}
                  </div>
                </div>
                <button
                  onClick={resetChat}
                  disabled={isLoading}
                  className="bg-background-secondary text-foreground px-4 py-4 rounded-full hover:bg-foreground/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                  title="Reset chat"
                >
                  <RotateCcw size={20} />
                </button>
                <button
                  onClick={() => sendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-background-inverse text-background px-6 py-4 rounded-full hover:opacity-90 disabled:cursor-not-allowed transition-all duration-200 flex items-center font-medium"
                  title="Send"
                >
                  <Send size={20} />
                </button>
              </div>

              {/* Integrated Suggestions */}
              {!inputMessage.trim() && (
                <div className="flex flex-col space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {getContextualQuestions().map((question, index) => (
                      <button
                        key={`${messages.length}-${index}`}
                        onClick={() => handleSampleQuestion(question)}
                        disabled={isLoading}
                        className="px-4 py-2 text-xs bg-background-inverse/8 text-foreground rounded-full hover:bg-background-inverse/15 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-background-inverse/0 hover:border-background-inverse/50"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
