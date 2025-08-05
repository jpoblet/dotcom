"use client";

import { TempoDevtools } from "tempo-devtools";
import { useEffect, useState } from "react";
import { Send, RotateCcw } from "lucide-react";

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
        // If parsing fails, start with default message
        setMessages([
          {
            id: "1",
            text: "Hi, I am <b>Jordi</b>, <b>Lead Product Designer</b> at <a href='https://veriff.com' target='_blank' style='color: inherit; text-decoration: none; border-bottom: 4px solid var(--color-accent); line-height: 0.75;'>Veriff</a>. I built this AI and fed it my CV. Ask it anything about my background, skills, projects, experience, hobbies...",
            isUser: false,
            timestamp: new Date(),
          },
        ]);
      }
    } else {
      // No saved history, start with default message
      setMessages([
        {
          id: "1",
          text: "Hi, I am <b>Jordi</b>, <b>Lead Product Designer</b> at <a href='https://veriff.com' target='_blank' style='color: inherit; text-decoration: none; border-bottom: 4px solid var(--color-accent); line-height: 0.75;'>Veriff</a>. I built this AI and fed it my CV. Ask it anything about my background, skills, projects, experience, hobbies...",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
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
    if (messages.length <= 1) {
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
    const initialMessage = {
      id: "1",
      text: "Hi, I am <b>Jordi</b>, <b>Lead Product Designer</b> at <a href='https://veriff.com' target='_blank' style='color: inherit; text-decoration: none; border-bottom: 4px solid var(--color-accent); line-height: 0.75;'>Veriff</a>. I built this AI and fed it my CV. Ask it anything about my background, skills, projects, experience, hobbies...",
      isUser: false,
      timestamp: new Date(),
    };
    setMessages([initialMessage]);
    setInputMessage("");
    localStorage.setItem("chat-history", JSON.stringify([initialMessage]));
  };

  return (
    <main className="w-full h-screen flex flex-col overflow-hidden relative">
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
                      ? "bg-accent text-foreground rounded-full px-6"
                      : "text-foreground rounded-lg"
                  }`}
                >
                  <div
                    className={`${
                      message.id === "1" && !message.isUser
                        ? "text-5xl leading-snug"
                        : "text-lg leading-relaxed"
                    } ${message.text.includes("<a ") || message.text.includes("</a>") ? "[&_div:has(img)]:bg-background [&_div:has(img)]:p-4 [&_div:has(img)]:rounded-lg [&_div:has(img)]:shadow-md [&_div:has(img)]:hover:shadow-lg [&_div:has(img)]:transition-shadow [&_div:has(img)]:duration-200" : ""}`}
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

      {/* Floating Input and Suggestions Section */}
      <div className="fixed bottom-6 left-6 right-6 z-50">
        <div className="p-6">
          {/* Input Section */}
          <div className="bg-background rounded-full p-4 mb-4 shadow-lg border border-foreground/10 max-w-4xl mx-auto">
            <div className="flex space-x-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 p-3 border-none rounded-full bg-background text-foreground placeholder-foreground-secondary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                disabled={isLoading}
              />
              <button
                onClick={resetChat}
                disabled={isLoading}
                className="bg-background-secondary text-foreground px-4 py-3 rounded-full hover:bg-foreground/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                title="Reset chat"
              >
                <RotateCcw size={18} />
              </button>
              <button
                onClick={() => sendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-background-inverse text-foreground-inverse px-4 py-3 rounded-full hover:opacity-90 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
                title="Send"
              >
                <Send size={18} />
              </button>
            </div>
          </div>

          {/* Sample Questions */}
          <div className="text-center">
            <div className="text-sm text-foreground-secondary mb-3">
              {messages.length === 1 ? "Try asking:" : "You might also ask:"}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {getContextualQuestions().map((question, index) => (
                <button
                  key={`${messages.length}-${index}`}
                  onClick={() => handleSampleQuestion(question)}
                  disabled={isLoading}
                  className="px-3 py-2 text-sm bg-accent/30 text-foreground rounded-full hover:bg-accent hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed text-center leading-tight whitespace-nowrap"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
