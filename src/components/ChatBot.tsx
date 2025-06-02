"use client";

import { useState } from "react";
import { Send, MessageCircle, X, RotateCcw } from "lucide-react";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi, I am <b><a href='/' style='color: inherit; text-decoration: none; border-bottom: 4px solid var(--color-accent); line-height: 0.75;'>Jordi</a></b>, <b>Lead Product Designer</b> at <a href='https://veriff.com' target='_blank' style='color: inherit; text-decoration: none; border-bottom: 4px solid var(--color-accent); line-height: 0.75;'>Veriff</a>.<br>I built this AI and fed it my CV. Ask it anything about my background, skills, projects, experience, hobbies...",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
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
        body: JSON.stringify({ message: inputMessage }),
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

  const resetChat = () => {
    const initialMessage = {
      id: "1",
      text: "Hi, I am <b><a href='/' style='color: inherit; text-decoration: none; border-bottom: 4px solid var(--color-accent); line-height: 0.75;'>Jordi</a></b>, <b>Lead Product Designer</b> at <a href='https://veriff.com' target='_blank' style='color: inherit; text-decoration: none; border-bottom: 4px solid var(--color-accent); line-height: 0.75;'>Veriff</a>.<br>I built this AI and fed it my CV. Ask it anything about my background, skills, projects, experience, hobbies...",
      isUser: false,
      timestamp: new Date(),
    };
    setMessages([initialMessage]);
    setInputMessage("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-accent text-foreground-inverse p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-background border-2 border-accent rounded-lg shadow-2xl w-80 h-96 flex flex-col">
          {/* Header */}
          <div className="bg-accent text-foreground-inverse p-4 rounded-t-lg flex justify-between items-center border-b-2 border-accent/50">
            <div>
              <h3 className="font-bold text-xl">Chat with Jordi</h3>
              <p className="text-sm opacity-90">
                Ask me anything about my work
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-foreground-inverse/10 p-1 rounded"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.isUser
                      ? "bg-accent text-foreground-inverse"
                      : "bg-background-secondary text-foreground"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-background-secondary text-foreground p-3 rounded-lg">
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

          {/* Input */}
          <div className="p-4 border-t border-foreground/10">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about Jordi..."
                className="flex-1 p-2 border border-foreground/20 rounded-lg bg-background text-foreground placeholder-foreground-secondary focus:outline-none focus:border-accent"
                disabled={isLoading}
              />
              <button
                onClick={resetChat}
                disabled={isLoading}
                className="bg-background-secondary text-foreground p-2 rounded-lg hover:bg-foreground/10 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Reset chat"
              >
                <RotateCcw size={18} />
              </button>
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-inverse text-foreground-inverse p-2 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
