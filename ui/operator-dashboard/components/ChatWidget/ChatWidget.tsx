"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { sendChatMessage } from "@/lib/api";
import { Message } from "./types";
import {
  generateMessageId,
  getSuggestedQuestions,
  formatMessageTime,
  isValidMessage,
} from "./utils";
import { DISCLAIMER_TEXT } from "./constants";

interface ChatWidgetProps {
  userId: string;
  persona?: string;
  mode?: "user" | "operator";
}

export function ChatWidget({
  userId,
  persona,
  mode = "user",
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!isValidMessage(input)) return;

    const userMessage: Message = {
      id: generateMessageId(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendChatMessage(
        userId,
        userMessage.content,
        persona,
        mode
      );

      const assistantMessage: Message = {
        id: generateMessageId(),
        role: "assistant",
        content: response.response,
        timestamp: new Date(),
        sources: response.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      setError("Sorry, I couldn't process your message. Please try again.");

      // Add error message to chat
      const errorMessage: Message = {
        id: generateMessageId(),
        role: "assistant",
        content:
          "I'm having trouble responding right now. Please try asking your question again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const suggestedQuestions = getSuggestedQuestions(
    mode === "operator" ? "operator" : persona
  );

  return (
    <div
      className="fixed bottom-4 right-4 z-50"
      role="complementary"
      aria-label="Chat assistant"
    >
      {/* Floating Button (Collapsed State) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-full shadow-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-6 flex items-center gap-2 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300 animate-fade-in"
          aria-label="Open financial Q&A chat assistant"
          aria-expanded="false"
        >
          <MessageCircle className="h-6 w-6" aria-hidden="true" />
          <span className="font-medium">Ask a Question</span>
        </button>
      )}

      {/* Chat Window (Expanded State) */}
      {isOpen && (
        <div
          className="bg-white rounded-lg shadow-2xl flex flex-col w-96 h-[600px] border border-gray-200 animate-slide-in-up"
          role="dialog"
          aria-label="Financial Q&A chat window"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex flex-row items-center justify-between border-b border-gray-200 p-4 bg-linear-to-r from-indigo-600 to-indigo-700 text-white rounded-t-lg">
            <div>
              <h3 className="text-lg font-semibold">Financial Q&amp;A</h3>
              <p className="text-xs text-indigo-100 mt-0.5">
                Ask about your finances
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded-lg p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Close chat window"
              tabIndex={0}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Messages Area */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
          >
            {/* Empty State */}
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="bg-indigo-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-10 w-10 text-indigo-600" />
                </div>
                <p className="text-gray-700 font-medium mb-2">
                  Ask me anything about your finances!
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  I can help with credit, savings, budgeting, and more.
                </p>
                <div className="space-y-2">
                  {suggestedQuestions.slice(0, 3).map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestedQuestion(question)}
                      className="w-full text-left px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      aria-label={`Ask suggested question: ${question}`}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } animate-fade-in`}
                role="article"
                aria-label={`${message.role === "user" ? "Your message" : "Assistant response"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-3 ${
                    message.role === "user"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-white border border-gray-200 text-gray-800 shadow-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p
                    className={`text-xs mt-2 ${
                      message.role === "user"
                        ? "text-indigo-200"
                        : "text-gray-500"
                    }`}
                  >
                    {formatMessageTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div
                className="flex justify-start animate-fade-in"
                role="status"
                aria-label="Loading response"
              >
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-2">
                  <Loader2
                    className="h-5 w-5 animate-spin text-indigo-600"
                    aria-hidden="true"
                  />
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div
                className="flex justify-center animate-fade-in"
                role="alert"
                aria-live="assertive"
              >
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 max-w-[85%]">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                maxLength={1000}
                aria-label="Type your financial question"
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={isLoading || !isValidMessage(input)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                aria-label="Send message"
              >
                <Send className="h-5 w-5" aria-hidden="true" />
              </button>
            </form>
            <p className="text-xs text-gray-500 text-center mt-2">
              {DISCLAIMER_TEXT}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
