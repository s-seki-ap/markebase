"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface WorksheetSectionProps {
  data: {
    content: string;
    starterCode: string;
    hints: string[];
    answer: string;
  };
  onNext: () => void;
  onAIClick: () => void;
}

export default function WorksheetSection({
  data,
  onNext,
  onAIClick,
}: WorksheetSectionProps) {
  const [shownHints, setShownHints] = useState(0);
  const [userNotes, setUserNotes] = useState("");
  const [mobileTab, setMobileTab] = useState<"task" | "notes" | "review">("task");

  // AI review state
  const [reviewText, setReviewText] = useState<string | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [showModelAnswer, setShowModelAnswer] = useState(false);

  const showNextHint = () => {
    if (shownHints < data.hints.length) {
      setShownHints(shownHints + 1);
    }
  };

  const handleSubmitReview = async () => {
    if (userNotes.trim().length < 10) return;
    setReviewLoading(true);
    setReviewError(null);
    setReviewText(null);

    try {
      const res = await fetch("/api/worksheet-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: data.content,
          userAnswer: userNotes,
          modelAnswer: extractTextFromHtml(data.answer),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "評価エラー");
      setReviewText(json.review);
      setMobileTab("review");
    } catch (e) {
      setReviewError(e instanceof Error ? e.message : "AI評価エラー");
    } finally {
      setReviewLoading(false);
    }
  };

  // Extract readable text from HTML model answer for AI context
  function extractTextFromHtml(html: string): string {
    return html
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 2000);
  }

  const hasReview = reviewText !== null;

  return (
    <div className="h-full flex flex-col">
      {/* Mobile tab bar */}
      <div
        className="flex lg:hidden border-b-2 shrink-0"
        style={{ borderColor: "var(--color-border)" }}
      >
        {([
          ["task", "📋 課題"],
          ["notes", "✏️ 回答"],
          ["review", hasReview ? "🎯 添削結果" : "🎯 添削"],
        ] as const).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className="flex-1 py-3 text-xs font-bold text-center transition-all min-h-[44px] relative"
            style={{
              color: mobileTab === tab ? "var(--color-green)" : "var(--color-text-muted)",
              borderBottom: mobileTab === tab ? "3px solid var(--color-green)" : "3px solid transparent",
              backgroundColor: mobileTab === tab ? "var(--color-card)" : "transparent",
            }}
          >
            {label}
            {tab === "review" && hasReview && mobileTab !== "review" && (
              <span
                className="absolute top-1.5 right-2 w-2 h-2 rounded-full"
                style={{ backgroundColor: "var(--color-green)" }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Left: Instructions + Hints */}
        <div
          className={`overflow-y-auto border-b-2 lg:border-b-0 lg:border-r-2 p-5 sm:p-6 w-full lg:w-[36%] ${mobileTab === "task" ? "flex-1" : "hidden lg:block"}`}
          style={{ backgroundColor: "var(--color-page)", borderColor: "var(--color-border)" }}
        >
          <div className="prose-sm">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h2 className="text-lg font-extrabold mb-3" style={{ color: "var(--color-text-heading)" }}>{children}</h2>
                ),
                h2: ({ children }) => (
                  <h3 className="text-base font-bold mt-5 mb-2" style={{ color: "var(--color-text-heading)" }}>{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="text-sm leading-[1.8] mb-3" style={{ color: "var(--color-text-secondary)" }}>{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc ml-4 space-y-1.5 mb-3">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal ml-4 space-y-1.5 mb-3">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-sm leading-[1.7]" style={{ color: "var(--color-text-secondary)" }}>{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-bold" style={{ color: "var(--color-text-heading)" }}>{children}</strong>
                ),
                code: ({ children }) => (
                  <code
                    className="px-1.5 py-0.5 rounded-lg text-xs font-mono"
                    style={{ backgroundColor: "var(--color-card)", color: "#93c5fd" }}
                  >
                    {children}
                  </code>
                ),
                blockquote: ({ children }) => (
                  <blockquote
                    className="border-l-4 pl-4 py-2 my-3 rounded-r-xl text-sm"
                    style={{ borderColor: "var(--color-purple)", backgroundColor: "var(--color-purple-bg)", color: "var(--color-text-secondary)" }}
                  >
                    {children}
                  </blockquote>
                ),
              }}
            >
              {data.content}
            </ReactMarkdown>
          </div>

          {/* Hints */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold" style={{ color: "var(--color-text-muted)" }}>💡 ヒント</p>
              <span className="text-xs font-bold" style={{ color: "var(--color-text-disabled)" }}>
                {shownHints}/{data.hints.length}
              </span>
            </div>

            {data.hints.slice(0, shownHints).map((hint, i) => (
              <div
                key={i}
                className="mb-2.5 p-3.5 rounded-2xl text-sm leading-[1.7]"
                style={{ backgroundColor: "var(--color-card)", color: "var(--color-text-secondary)", boxShadow: "var(--color-card-shadow)" }}
              >
                💡 {hint}
              </div>
            ))}

            {shownHints < data.hints.length && (
              <button
                onClick={showNextHint}
                className="w-full py-2.5 rounded-2xl text-sm font-bold transition-all hover:scale-[1.02] min-h-[44px]"
                style={{ backgroundColor: "var(--color-card)", color: "var(--color-text-muted)", boxShadow: "var(--color-card-shadow)" }}
              >
                ヒントを表示 →
              </button>
            )}
          </div>
        </div>

        {/* Center: User notes */}
        <div className={`flex flex-col min-w-0 ${mobileTab === "notes" ? "flex-1" : "hidden lg:flex"} lg:flex-1`}>
          <div
            className="hidden lg:flex px-4 py-2 border-b-2 items-center gap-2 shrink-0"
            style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}
          >
            <span className="text-base">✏️</span>
            <span className="text-sm font-bold" style={{ color: "var(--color-text-secondary)" }}>あなたの回答</span>
          </div>
          <textarea
            value={userNotes}
            onChange={(e) => setUserNotes(e.target.value)}
            placeholder={"ここに回答を入力してください...\n\n課題の指示に沿って、自分の考えを書きましょう。\n書き終わったら「AI添削」ボタンで評価を受けられます。"}
            className="flex-1 w-full p-5 text-sm leading-[1.9] outline-none resize-none"
            style={{
              backgroundColor: "var(--color-page)",
              color: "var(--color-text-heading)",
              fontFamily: "var(--font-sans)",
            }}
          />
          {userNotes.length > 0 && (
            <div
              className="px-5 py-2 border-t-2 flex items-center justify-between"
              style={{ borderColor: "var(--color-border)" }}
            >
              <span className="text-xs font-semibold" style={{ color: "var(--color-text-disabled)" }}>
                {userNotes.length}文字
              </span>
              {userNotes.trim().length >= 10 && (
                <button
                  onClick={handleSubmitReview}
                  disabled={reviewLoading}
                  className="text-xs px-4 py-1.5 rounded-full font-bold transition-all hover:scale-105 min-h-[36px] lg:hidden"
                  style={{
                    backgroundColor: "var(--color-green-bg)",
                    color: "var(--color-green)",
                    border: "2px solid var(--color-green)",
                    opacity: reviewLoading ? 0.5 : 1,
                  }}
                >
                  {reviewLoading ? "評価中..." : "🎯 AI添削"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: AI Review + Model Answer */}
        <div
          className={`overflow-y-auto border-t-2 lg:border-t-0 lg:border-l-2 w-full lg:w-[34%] ${mobileTab === "review" ? "flex-1" : "hidden lg:block"}`}
          style={{ backgroundColor: "var(--color-page)", borderColor: "var(--color-border)" }}
        >
          <div
            className="hidden lg:flex px-4 py-2 border-b-2 items-center gap-2 shrink-0"
            style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}
          >
            <span className="text-base">🎯</span>
            <span className="text-sm font-bold" style={{ color: "var(--color-text-secondary)" }}>AI添削</span>
          </div>

          <div className="p-5">
            {/* Before submission */}
            {!hasReview && !reviewLoading && !reviewError && (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🎯</div>
                <p className="text-sm font-bold mb-2" style={{ color: "var(--color-text-heading)" }}>
                  回答を書いてAI添削を受けよう
                </p>
                <p className="text-xs mb-6" style={{ color: "var(--color-text-muted)" }}>
                  回答を入力後、「AI添削」ボタンを押すと<br />AIが評価・アドバイスしてくれます
                </p>
                {userNotes.trim().length >= 10 && (
                  <button
                    onClick={handleSubmitReview}
                    className="btn-3d btn-3d-green px-6 py-3 text-sm"
                  >
                    🎯 AI添削を受ける
                  </button>
                )}
              </div>
            )}

            {/* Loading */}
            {reviewLoading && (
              <div className="text-center py-8">
                <div className="text-4xl mb-4 animate-bounce-in">🤔</div>
                <p className="text-sm font-bold" style={{ color: "var(--color-text-heading)" }}>
                  回答を評価中...
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                  AIがあなたの回答を読んでいます
                </p>
              </div>
            )}

            {/* Error */}
            {reviewError && (
              <div
                className="p-4 rounded-2xl text-sm mb-4"
                style={{ backgroundColor: "var(--color-red-bg)", color: "var(--color-red)", border: "2px solid var(--color-red)" }}
              >
                ❌ {reviewError}
                <button
                  onClick={handleSubmitReview}
                  className="block mt-2 text-xs font-bold underline"
                >
                  再試行する
                </button>
              </div>
            )}

            {/* Review result */}
            {hasReview && (
              <div className="animate-bounce-in">
                <div
                  className="p-4 rounded-2xl mb-4"
                  style={{ backgroundColor: "var(--color-card)", boxShadow: "var(--color-card-shadow)" }}
                >
                  <div className="prose-sm">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => (
                          <p className="text-sm leading-[1.8] mb-3" style={{ color: "var(--color-text-secondary)" }}>{children}</p>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-bold" style={{ color: "var(--color-text-heading)" }}>{children}</strong>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc ml-4 space-y-1 mb-3">{children}</ul>
                        ),
                        li: ({ children }) => (
                          <li className="text-sm leading-[1.7]" style={{ color: "var(--color-text-secondary)" }}>{children}</li>
                        ),
                        code: ({ children }) => (
                          <code
                            className="px-1.5 py-0.5 rounded text-xs font-mono"
                            style={{ backgroundColor: "var(--color-border)", color: "var(--color-text-heading)" }}
                          >
                            {children}
                          </code>
                        ),
                      }}
                    >
                      {reviewText}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* Actions after review */}
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setReviewText(null);
                      setMobileTab("notes");
                    }}
                    className="w-full py-3 rounded-2xl text-sm font-bold transition-all hover:scale-[1.02] min-h-[44px]"
                    style={{ backgroundColor: "var(--color-blue-bg)", color: "var(--color-blue)", border: "2px solid var(--color-blue)" }}
                  >
                    ✏️ 回答を修正して再提出
                  </button>

                  <button
                    onClick={() => setShowModelAnswer(!showModelAnswer)}
                    className="w-full py-3 rounded-2xl text-sm font-bold transition-all hover:scale-[1.02] min-h-[44px]"
                    style={{
                      backgroundColor: showModelAnswer ? "var(--color-orange-bg)" : "var(--color-border)",
                      color: showModelAnswer ? "var(--color-orange)" : "var(--color-text-muted)",
                      border: showModelAnswer ? "2px solid var(--color-orange)" : "2px solid transparent",
                    }}
                  >
                    {showModelAnswer ? "📖 解答例を閉じる" : "📖 解答例を見る"}
                  </button>
                </div>

                {/* Model answer (collapsible) */}
                {showModelAnswer && (
                  <div className="mt-4 rounded-2xl overflow-hidden animate-bounce-in" style={{ border: "2px solid var(--color-border)" }}>
                    <iframe
                      srcDoc={data.answer}
                      sandbox="allow-scripts allow-forms"
                      className="w-full border-none"
                      style={{ backgroundColor: "#ffffff", height: "300px" }}
                      title="answer-preview"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div
        className="flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 border-t-2 shrink-0"
        style={{ backgroundColor: "var(--color-page)", borderColor: "var(--color-border)" }}
      >
        {/* AI Review button (desktop always visible, mobile hidden since inline) */}
        <button
          onClick={handleSubmitReview}
          disabled={reviewLoading || userNotes.trim().length < 10}
          className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold transition-all hover:scale-105 min-h-[44px] disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: "var(--color-green-bg)", color: "var(--color-green)", border: "2px solid var(--color-green)" }}
        >
          {reviewLoading ? "評価中..." : "🎯 AI添削"}
        </button>
        <button
          onClick={onAIClick}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-2xl text-sm font-bold transition-all hover:scale-105 min-h-[44px]"
          style={{ backgroundColor: "var(--color-purple-bg)", color: "var(--color-purple)", border: "2px solid var(--color-purple)" }}
        >
          🤖 <span className="hidden sm:inline">AIに質問</span><span className="sm:hidden">質問</span>
        </button>
        <div className="ml-auto">
          <button
            onClick={onNext}
            className="btn-3d btn-3d-blue px-5 sm:px-6 py-2 text-sm min-h-[44px]"
          >
            次へ →
          </button>
        </div>
      </div>
    </div>
  );
}
