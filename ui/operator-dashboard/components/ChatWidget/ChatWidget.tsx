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
      className="fixed bottom-6 right-6 z-50"
      role="complementary"
      aria-label="Chat assistant"
    >
      {/* Floating Button (Collapsed State) - Origin Style */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative rounded-2xl shadow-2xl bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-500 dark:to-blue-500 hover:from-indigo-700 hover:to-blue-700 dark:hover:from-indigo-600 dark:hover:to-blue-600 text-white px-8 py-5 flex items-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-indigo-500/50 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-700 animate-fade-in"
          aria-label="Open financial Q&A chat assistant"
          aria-expanded="false"
        >
          <div className="relative">
            <MessageCircle
              className="h-6 w-6 animate-pulse"
              aria-hidden="true"
            />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-900" />
          </div>
          <div className="flex flex-col items-start">
            <span className="font-semibold text-lg">Ask Anything</span>
            <span className="text-xs text-indigo-100 dark:text-indigo-200">
              AI-powered financial advice
            </span>
          </div>
          <div className="absolute inset-0 rounded-2xl bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
        </button>
      )}

      {/* Chat Window (Expanded State) - Origin Style */}
      {isOpen && (
        <div
          className="bg-white dark:bg-card rounded-2xl shadow-2xl flex flex-col w-[420px] h-[650px] border border-gray-200 dark:border-gray-700 animate-slide-in-up overflow-hidden"
          role="dialog"
          aria-label="Financial Q&A chat window"
          aria-modal="true"
        >
          {/* Header - Gradient Style */}
          <div className="flex flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700 p-5 bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-500 dark:to-blue-500 text-white">
            <div>
              <h3 className="text-xl font-bold">Ask Anything</h3>
              <p className="text-sm text-indigo-100 dark:text-indigo-200 mt-1">
                Get instant financial insights
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded-xl p-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Close chat window"
              tabIndex={0}
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Messages Area */}
          <div
            className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50 dark:bg-background"
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
          >
            {/* Empty State - Origin Style */}
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-2xl w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <MessageCircle className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg mb-2">
                  Your AI Financial Advisor
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 px-4">
                  Get personalized insights about credit, savings, budgeting,
                  and more.
                </p>
                <div className="space-y-2.5">
                  {suggestedQuestions.slice(0, 3).map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestedQuestion(question)}
                      className="w-full text-left px-5 py-3.5 text-sm bg-white dark:bg-card border border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 shadow-sm hover:shadow-md text-gray-700 dark:text-gray-300"
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
                  className={`max-w-[85%] rounded-2xl px-5 py-3.5 ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-500 dark:to-blue-500 text-white shadow-lg"
                      : "bg-white dark:bg-card border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 shadow-md"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p
                    className={`text-xs mt-2 ${
                      message.role === "user"
                        ? "text-indigo-100 dark:text-indigo-200"
                        : "text-gray-500 dark:text-gray-400"
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

          {/* Input Footer - Origin Style */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-5 bg-white dark:bg-card rounded-b-2xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-3"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="flex-1 px-5 py-3.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
                maxLength={1000}
                aria-label="Type your financial question"
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={isLoading || !isValidMessage(input)}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-500 dark:to-blue-500 hover:from-indigo-700 hover:to-blue-700 dark:hover:from-indigo-600 dark:hover:to-blue-600 text-white px-5 py-3.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 focus:ring-offset-2 shadow-md hover:shadow-lg"
                aria-label="Send message"
              >
                <Send className="h-5 w-5" aria-hidden="true" />
              </button>
            </form>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
              {DISCLAIMER_TEXT}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
