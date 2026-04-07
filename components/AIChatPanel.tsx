"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatPanelProps {
  onClose: () => void;
  lessonTitle?: string;
  lessonContent?: string;
}

export default function AIChatPanel({
  onClose,
  lessonTitle,
  lessonContent,
}: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const lessonContext = lessonTitle
    ? `タイトル: ${lessonTitle}${lessonContent ? `\n内容:\n${lessonContent}` : ""}`
    : undefined;

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: Message = { role: "user", content: text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setApiError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          lessonContext,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.error ?? "エラーが発生しました。");
      } else {
        setMessages([
          ...nextMessages,
          { role: "assistant", content: data.message },
        ]);
      }
    } catch {
      setApiError("ネットワークエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 md:hidden"
        style={{ backgroundColor: "var(--color-overlay)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 h-full z-50 flex flex-col w-full md:w-[400px]"
        style={{ backgroundColor: "var(--color-card)", borderLeft: "1px solid var(--color-border)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b shrink-0"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🤖</span>
            <div>
              <p className="font-medium text-sm" style={{ color: "var(--color-text-heading)" }}>AIアシスタント</p>
              {lessonTitle && (
                <p className="text-xs" style={{ color: "var(--color-purple)" }}>
                  {lessonTitle}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-lg leading-none transition-opacity hover:opacity-80"
            style={{ color: "var(--color-text-muted)" }}
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Welcome message */}
          {messages.length === 0 && !apiError && (
            <div
              className="p-4 rounded-xl text-sm border-l-4"
              style={{
                backgroundColor: "var(--color-page)",
                color: "var(--color-text-primary)",
                borderColor: "var(--color-purple)",
              }}
            >
              <p className="font-medium mb-2" style={{ color: "var(--color-purple)" }}>
                MarkeBase AI
              </p>
              <p className="leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                こんにちは！GA4・GTM・HTML・CSS・Webマーケティングについて何でも聞いてください。
              </p>
              {lessonTitle && (
                <p className="mt-2 text-xs" style={{ color: "var(--color-text-disabled)" }}>
                  現在のレッスン「{lessonTitle}」の内容を踏まえて回答します。
                </p>
              )}
            </div>
          )}

          {/* Chat messages */}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-4 py-2.5 rounded-xl text-sm leading-relaxed ${
                  msg.role === "assistant" ? "chat-markdown" : ""
                }`}
                style={
                  msg.role === "user"
                    ? {
                        backgroundColor: "var(--color-blue)",
                        color: "#ffffff",
                      }
                    : {
                        backgroundColor: "var(--color-page)",
                        color: "var(--color-text-primary)",
                        borderLeft: "3px solid var(--color-purple)",
                      }
                }
              >
                {msg.role === "assistant" ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => (
                        <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold" style={{ color: "var(--color-text-heading)" }}>{children}</strong>
                      ),
                      ul: ({ children }) => (
                        <ul className="mb-2 last:mb-0 ml-3 space-y-0.5" style={{ listStyleType: "disc" }}>{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="mb-2 last:mb-0 ml-3 space-y-0.5" style={{ listStyleType: "decimal" }}>{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li className="pl-1" style={{ color: "var(--color-text-secondary)" }}>{children}</li>
                      ),
                      code: ({ className, children }) => {
                        const isBlock = className?.includes("language-");
                        if (isBlock) {
                          return (
                            <code
                              className="block my-2 p-2.5 rounded-lg text-xs overflow-x-auto"
                              style={{
                                backgroundColor: "var(--color-card)",
                                color: "#a5f3fc",
                                fontFamily: "'JetBrains Mono', monospace",
                              }}
                            >
                              {children}
                            </code>
                          );
                        }
                        return (
                          <code
                            className="px-1 py-0.5 rounded text-xs"
                            style={{
                              backgroundColor: "var(--color-border)",
                              color: "#a5f3fc",
                              fontFamily: "'JetBrains Mono', monospace",
                            }}
                          >
                            {children}
                          </code>
                        );
                      },
                      pre: ({ children }) => <>{children}</>,
                      h1: ({ children }) => (
                        <p className="font-semibold mb-1.5 mt-2 first:mt-0" style={{ color: "var(--color-text-heading)" }}>{children}</p>
                      ),
                      h2: ({ children }) => (
                        <p className="font-semibold mb-1.5 mt-2 first:mt-0" style={{ color: "var(--color-text-heading)" }}>{children}</p>
                      ),
                      h3: ({ children }) => (
                        <p className="font-semibold mb-1 mt-1.5 first:mt-0" style={{ color: "var(--color-text-heading)" }}>{children}</p>
                      ),
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                          style={{ color: "#93c5fd" }}
                        >
                          {children}
                        </a>
                      ),
                      hr: () => (
                        <hr className="my-2" style={{ borderColor: "var(--color-border)" }} />
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-start">
              <div
                className="px-4 py-3 rounded-xl text-sm"
                style={{
                  backgroundColor: "var(--color-page)",
                  borderLeft: "3px solid var(--color-purple)",
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>考え中</span>
                  <span className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{
                          backgroundColor: "var(--color-purple)",
                          animationDelay: `${i * 0.15}s`,
                        }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {apiError && (
            <div
              className="p-3 rounded-xl text-sm"
              style={{
                backgroundColor: "#450a0a",
                color: "#fca5a5",
                border: "1px solid #7f1d1d",
              }}
            >
              {apiError}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div
          className="p-4 border-t shrink-0"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="質問を入力（Enterで送信）"
              disabled={loading}
              className="flex-1 px-3 py-2 rounded-lg text-sm outline-none disabled:opacity-50"
              style={{
                backgroundColor: "var(--color-page)",
                color: "var(--color-text-primary)",
                border: "1px solid var(--color-border)",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--color-purple)", color: "#ffffff" }}
            >
              送信
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
