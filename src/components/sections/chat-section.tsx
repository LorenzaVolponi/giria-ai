"use client";

import { useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import {
  Bot,
  User,
  Send,
  RotateCcw,
  Sparkles,
  MessageSquare,
  Search,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Markdown from "react-markdown";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/slang-data";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ChatSectionProps {
  onSearchTerm: (term: string) => void;
}

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  data?: {
    slang?: string;
    meaning?: string;
    context?: string;
    example?: string;
    category?: string;
    synonyms?: string[];
  };
  isError?: boolean;
}

interface ChatApiResponse {
  response: string;
  slang?: string;
  meaning?: string;
  context?: string;
  example?: string;
  category?: string;
  synonyms?: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const SUGGESTED_PROMPTS = [
  { text: "O que significa 'delulu'?", icon: "🔍" },
  { text: "Traduza: 'mano, aquele fit tava crack, slayou demais'", icon: "💬" },
  { text: "Quais gírias de gaming eu deveria conhecer?", icon: "🎮" },
  { text: "O que 'farmar aura' quer dizer?", icon: "✨" },
];

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Category badge with emoji icon */
function CategoryBadge({ category }: { category: string }) {
  const cat = CATEGORIES.find((c) => c.name === category);
  if (!cat) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
        "border border-emerald-200 dark:border-emerald-800"
      )}
    >
      <span>{cat.icon}</span>
      <span>{cat.label}</span>
    </span>
  );
}

/** Clickable synonym chip */
function SynonymChip({
  synonym,
  onClick,
}: {
  synonym: string;
  onClick: (term: string) => void;
}) {
  return (
    <button
      onClick={() => onClick(synonym)}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
        "border border-violet-200 dark:border-violet-800",
        "hover:bg-violet-200 dark:hover:bg-violet-900/60",
        "transition-colors cursor-pointer"
      )}
    >
      <Search className="h-3 w-3" />
      <span>{synonym}</span>
    </button>
  );
}

/** Typing indicator with bouncing dots */
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 max-w-[85%] md:max-w-[70%]">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-violet-600 text-white text-xs">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "rounded-2xl rounded-bl-md px-4 py-3",
          "bg-gray-100 dark:bg-gray-800",
          "border border-gray-200 dark:border-gray-700"
        )}
      >
        <div className="flex items-center gap-1.5">
          <span className="sr-only">Digitando...</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">
            Digitando
          </span>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn(
                "inline-block h-2 w-2 rounded-full",
                "bg-gray-400 dark:bg-gray-500",
                "animate-bounce"
              )}
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Error message bubble with retry button */
function ErrorMessageBubble({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex items-end gap-2 max-w-[85%] md:max-w-[70%]">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-red-500 text-white text-xs">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "rounded-2xl rounded-bl-md px-4 py-3 space-y-2",
          "bg-red-50 dark:bg-red-950/30",
          "border border-red-200 dark:border-red-900"
        )}
      >
        <p className="text-sm text-red-700 dark:text-red-400">{message}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className={cn(
            "h-7 text-xs gap-1.5",
            "border-red-200 dark:border-red-800",
            "text-red-700 dark:text-red-400",
            "hover:bg-red-100 dark:hover:bg-red-950/50"
          )}
        >
          <RotateCcw className="h-3 w-3" />
          Tentar novamente
        </Button>
      </div>
    </div>
  );
}

/** AI message bubble with rich content */
function AiMessageBubble({
  message,
  onSearchTerm,
}: {
  message: ChatMessage;
  onSearchTerm: (term: string) => void;
}) {
  return (
    <div className="flex items-end gap-2 max-w-[85%] md:max-w-[70%]">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-violet-600 text-white text-xs">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "rounded-2xl rounded-bl-md px-4 py-3 space-y-3 w-full",
          "bg-gray-100 dark:bg-gray-800",
          "border border-gray-200 dark:border-gray-700"
        )}
      >
        {/* Category badge */}
        {message.data?.category && (
          <div className="flex items-center gap-2 flex-wrap">
            <CategoryBadge category={message.data.category} />
            {message.data.slang && (
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                &ldquo;{message.data.slang}&rdquo;
              </span>
            )}
          </div>
        )}

        {/* Markdown content */}
        <div className="prose prose-sm prose-gray dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
          <Markdown
            components={{
              p: ({ children }: { children?: ReactNode }) => (
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-1.5 last:mb-0">
                  {children}
                </p>
              ),
              strong: ({ children }: { children?: ReactNode }) => (
                <strong className="font-semibold text-gray-900 dark:text-gray-100">
                  {children}
                </strong>
              ),
              ul: ({ children }: { children?: ReactNode }) => (
                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-0.5 my-1.5">
                  {children}
                </ul>
              ),
              ol: ({ children }: { children?: ReactNode }) => (
                <ol className="list-decimal list-inside text-sm text-gray-700 dark:text-gray-300 space-y-0.5 my-1.5">
                  {children}
                </ol>
              ),
              li: ({ children }: { children?: ReactNode }) => (
                <li className="text-sm">{children}</li>
              ),
              code: ({ children }: { children?: ReactNode }) => (
                <code className="rounded bg-gray-200 dark:bg-gray-700 px-1 py-0.5 text-xs font-mono text-emerald-700 dark:text-emerald-400">
                  {children}
                </code>
              ),
              blockquote: ({ children }: { children?: ReactNode }) => (
                <blockquote className="border-l-2 border-emerald-500 pl-3 my-2 text-sm text-gray-600 dark:text-gray-400 italic">
                  {children}
                </blockquote>
              ),
            }}
          >
            {message.content}
          </Markdown>
        </div>

        {/* Synonyms as clickable chips */}
        {message.data?.synonyms && message.data.synonyms.length > 0 && (
          <div className="pt-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Termos relacionados
            </p>
            <div className="flex flex-wrap gap-1.5">
              {message.data.synonyms.map((synonym) => (
                <SynonymChip
                  key={synonym}
                  synonym={synonym}
                  onClick={onSearchTerm}
                />
              ))}
            </div>
          </div>
        )}

        {/* Clickable slang term */}
        {message.data?.slang && (
          <div className="pt-1">
            <button
              onClick={() => onSearchTerm(message.data!.slang!)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
                "border border-emerald-200 dark:border-emerald-800",
                "hover:bg-emerald-200 dark:hover:bg-emerald-900/60",
                "transition-colors cursor-pointer"
              )}
            >
              <Search className="h-3 w-3" />
              Ver no dicionário: {message.data.slang}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** User message bubble */
function UserMessageBubble({ message }: { message: ChatMessage }) {
  return (
    <div className="flex items-end gap-2 max-w-[85%] md:max-w-[70%] ml-auto flex-row-reverse">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-emerald-600 text-white text-xs">
          <User className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "rounded-2xl rounded-br-md px-4 py-3",
          "bg-gradient-to-br from-emerald-500 to-teal-600",
          "text-white shadow-sm"
        )}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
      </div>
    </div>
  );
}

/** Welcome screen shown when chat is empty */
function WelcomeScreen({
  onSendPrompt,
}: {
  onSendPrompt: (prompt: string) => void;
}) {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card
        className={cn(
          "w-full max-w-md border-0 shadow-lg",
          "bg-gradient-to-br from-violet-50 via-white to-emerald-50",
          "dark:from-violet-950/30 dark:via-gray-900 dark:to-emerald-950/30"
        )}
      >
        <CardContent className="p-6 sm:p-8 flex flex-col items-center text-center space-y-5">
          {/* Bot icon */}
          <div
            className={cn(
              "h-16 w-16 rounded-2xl flex items-center justify-center",
              "bg-gradient-to-br from-violet-600 to-purple-600",
              "shadow-lg shadow-violet-500/20"
            )}
          >
            <Bot className="h-8 w-8 text-white" />
          </div>

          {/* Title & description */}
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center justify-center gap-2">
              <MessageSquare className="h-5 w-5 text-violet-500" />
              Chat com IA
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm">
              Faça perguntas sobre gírias, peça traduções ou descubra o
              significado de expressões que ouviu
            </p>
          </div>

          {/* Divider */}
          <div className="w-full flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
              Tente perguntar
            </span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Suggested prompts */}
          <div className="w-full space-y-2">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt.text}
                onClick={() => onSendPrompt(prompt.text)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl text-sm",
                  "bg-white dark:bg-gray-800/50",
                  "border border-gray-200 dark:border-gray-700",
                  "hover:border-violet-300 dark:hover:border-violet-700",
                  "hover:bg-violet-50 dark:hover:bg-violet-950/30",
                  "transition-all duration-200",
                  "group"
                )}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">{prompt.icon}</span>
                  <span className="text-gray-700 dark:text-gray-300 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors">
                    {prompt.text}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function ChatSection({ onSearchTerm }: ChatSectionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(
    null
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector(
        "[data-slot='scroll-area-viewport']"
      );
      if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
      }
    }
  }, [messages, isLoading]);

  // Focus input on mount
  useEffect(() => {
    if (messages.length > 0) {
      inputRef.current?.focus();
    }
  }, [messages.length]);

  /** Send a message to the chat API */
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      // Add user message
      const userMessage: ChatMessage = {
        id: generateId(),
        role: "user",
        content: trimmed,
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);
      setLastFailedMessage(null);

      // Build chat history for context
      const history = [...messages, userMessage]
        .filter((m) => !m.isError)
        .map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content,
        }));

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, history }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            (errorData as { error?: string }).error ||
              "Erro ao processar mensagem"
          );
        }

        const data: ChatApiResponse = await response.json();

        const aiMessage: ChatMessage = {
          id: generateId(),
          role: "ai",
          content: data.response,
          data: {
            slang: data.slang,
            meaning: data.meaning,
            context: data.context,
            example: data.example,
            category: data.category,
            synonyms: data.synonyms,
          },
        };

        setMessages((prev) => [...prev, aiMessage]);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido";

        setLastFailedMessage(trimmed);

        const errorChatMessage: ChatMessage = {
          id: generateId(),
          role: "ai",
          content: `Erro: ${errorMessage}`,
          isError: true,
        };

        setMessages((prev) => [...prev, errorChatMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages]
  );

  /** Handle form submission */
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      sendMessage(input);
    },
    [input, sendMessage]
  );

  /** Retry the last failed message */
  const handleRetry = useCallback(() => {
    if (lastFailedMessage) {
      // Remove the error message from chat
      setMessages((prev) => {
        const withoutError = prev.slice(0, -1);
        return withoutError;
      });
      // Re-send
      setTimeout(() => sendMessage(lastFailedMessage), 50);
    }
  }, [lastFailedMessage, sendMessage]);

  /** Handle clicking a suggested prompt */
  const handlePromptClick = useCallback(
    (prompt: string) => {
      sendMessage(prompt);
    },
    [sendMessage]
  );

  /** Handle clicking a synonym chip */
  const handleSynonymClick = useCallback(
    (term: string) => {
      onSearchTerm(term);
    },
    [onSearchTerm]
  );

  /** Handle key down in input */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage(input);
      }
    },
    [input, sendMessage]
  );

  return (
    <div className="flex flex-col h-full min-h-0">
      {messages.length === 0 ? (
        <WelcomeScreen onSendPrompt={handlePromptClick} />
      ) : (
        <div className="flex flex-col h-full min-h-0">
          <ScrollArea
            ref={scrollRef}
            className="flex-1 min-h-0 px-3 py-4 sm:px-4 sm:py-6"
          >
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((message) =>
                message.isError ? (
                  <ErrorMessageBubble
                    key={message.id}
                    message={message.content}
                    onRetry={handleRetry}
                  />
                ) : message.role === "user" ? (
                  <UserMessageBubble key={message.id} message={message} />
                ) : (
                  <AiMessageBubble
                    key={message.id}
                    message={message}
                    onSearchTerm={handleSynonymClick}
                  />
                )
              )}

              {isLoading && <TypingIndicator />}
            </div>
          </ScrollArea>

          <div
            className={cn(
              "shrink-0 border-t border-gray-200 dark:border-gray-700",
              "bg-white dark:bg-gray-900",
              "px-3 py-3 sm:px-4 sm:py-4",
              "pb-safe"
            )}
          >
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 max-w-3xl mx-auto"
            >
              <div className="relative flex-1">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Pergunte sobre uma gíria..."
                  disabled={isLoading}
                  className={cn(
                    "h-11 pr-4 rounded-xl",
                    "bg-gray-50 dark:bg-gray-800/50",
                    "border-gray-200 dark:border-gray-700",
                    "focus-visible:border-violet-400 dark:focus-visible:border-violet-600",
                    "focus-visible:ring-violet-500/20",
                    "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                    "text-sm"
                  )}
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                size="icon"
                className={cn(
                  "h-11 w-11 rounded-xl shrink-0",
                  "bg-gradient-to-br from-emerald-500 to-teal-600",
                  "hover:from-emerald-600 hover:to-teal-700",
                  "text-white shadow-sm",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-all duration-200"
                )}
              >
                {isLoading ? (
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {isLoading ? "Enviando..." : "Enviar mensagem"}
                </span>
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
