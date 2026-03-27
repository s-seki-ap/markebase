"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";

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
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 h-full z-50 flex flex-col w-full md:w-[400px]"
        style={{ backgroundColor: "#1e293b", borderLeft: "1px solid #334155" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b shrink-0"
          style={{ borderColor: "#334155" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🤖</span>
            <div>
              <p className="text-white font-medium text-sm">AIアシスタント</p>
              {lessonTitle && (
                <p className="text-xs" style={{ color: "#8b5cf6" }}>
                  {lessonTitle}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-lg leading-none"
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
                backgroundColor: "#0f172a",
                color: "#e2e8f0",
                borderColor: "#8b5cf6",
              }}
            >
              <p className="font-medium mb-2" style={{ color: "#8b5cf6" }}>
                MarkeBase AI
              </p>
              <p className="leading-relaxed text-slate-300">
                こんにちは！GA4・GTM・HTML・CSS・Webマーケティングについて何でも聞いてください。
              </p>
              {lessonTitle && (
                <p className="mt-2 text-xs text-slate-500">
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
                className="max-w-[80%] px-4 py-2.5 rounded-xl text-sm leading-relaxed"
                style={
                  msg.role === "user"
                    ? {
                        backgroundColor: "#3b82f6",
                        color: "white",
                      }
                    : {
                        backgroundColor: "#0f172a",
                        color: "#e2e8f0",
                        borderLeft: "3px solid #8b5cf6",
                      }
                }
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-start">
              <div
                className="px-4 py-3 rounded-xl text-sm"
                style={{
                  backgroundColor: "#0f172a",
                  borderLeft: "3px solid #8b5cf6",
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-xs">考え中</span>
                  <span className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{
                          backgroundColor: "#8b5cf6",
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
          style={{ borderColor: "#334155" }}
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
                backgroundColor: "#0f172a",
                color: "#e2e8f0",
                border: "1px solid #334155",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#8b5cf6", color: "white" }}
            >
              送信
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
