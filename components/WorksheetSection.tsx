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
  const [showAnswer, setShowAnswer] = useState(false);
  const [userNotes, setUserNotes] = useState("");
  const [mobileTab, setMobileTab] = useState<"task" | "notes" | "example">("task");

  const showNextHint = () => {
    if (shownHints < data.hints.length) {
      setShownHints(shownHints + 1);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Mobile tab bar */}
      <div
        className="flex lg:hidden border-b-2 shrink-0"
        style={{ borderColor: "var(--color-border)" }}
      >
        {([["task", "📋 課題"], ["notes", "✏️ 回答"], ["example", "📖 解答例"]] as const).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className="flex-1 py-3 text-xs font-bold text-center transition-all min-h-[44px]"
            style={{
              color: mobileTab === tab ? "var(--color-green)" : "var(--color-text-muted)",
              borderBottom: mobileTab === tab ? "3px solid var(--color-green)" : "3px solid transparent",
              backgroundColor: mobileTab === tab ? "var(--color-card)" : "transparent",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Left: Instructions + Hints */}
        <div
          className={`overflow-y-auto border-b-2 lg:border-b-0 lg:border-r-2 p-5 sm:p-6 w-full lg:w-[40%] ${mobileTab === "task" ? "flex-1" : "hidden lg:block"}`}
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

        {/* Right: Notes (user input) + Answer preview */}
        <div className={`flex-1 flex flex-col min-w-0 ${mobileTab === "notes" ? "" : mobileTab === "example" ? "" : "hidden lg:flex"}`}>
          {/* Desktop toggle header */}
          <div
            className="hidden lg:flex px-4 py-2.5 border-b-2 items-center justify-between shrink-0"
            style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{showAnswer ? "📖" : "✏️"}</span>
              <span className="text-sm font-bold" style={{ color: "var(--color-text-secondary)" }}>
                {showAnswer ? "解答例" : "あなたの回答"}
              </span>
            </div>
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className="px-4 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105 min-h-[36px]"
              style={{
                backgroundColor: showAnswer ? "var(--color-orange-bg)" : "var(--color-border)",
                color: showAnswer ? "var(--color-orange)" : "var(--color-text-muted)",
                border: showAnswer ? "2px solid var(--color-orange)" : "2px solid transparent",
              }}
            >
              {showAnswer ? "✏️ 回答に戻る" : "📖 解答例を見る"}
            </button>
          </div>

          {/* Notes textarea (mobile: notes tab / desktop: default) */}
          <div className={`flex-1 flex flex-col ${mobileTab === "notes" || (!showAnswer && mobileTab !== "example") ? "" : "hidden lg:hidden"}`}>
            <textarea
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder="ここに回答を入力してください...&#10;&#10;例：&#10;・プロジェクト名: ECサイトリニューアル&#10;・計画立案 → 自分が担当&#10;・品質管理 → エンジニアリーダーに委任"
              className="flex-1 w-full p-5 text-sm leading-[1.9] outline-none resize-none"
              style={{
                backgroundColor: "var(--color-page)",
                color: "var(--color-text-heading)",
                fontFamily: "var(--font-sans)",
              }}
            />
            {userNotes.length > 0 && (
              <div
                className="px-5 py-2 border-t-2 text-xs font-semibold"
                style={{ borderColor: "var(--color-border)", color: "var(--color-text-disabled)" }}
              >
                {userNotes.length}文字入力済み
              </div>
            )}
          </div>

          {/* Answer preview (mobile: example tab / desktop: toggle) */}
          <div className={`flex-1 ${mobileTab === "example" || (showAnswer && mobileTab !== "notes") ? "" : "hidden lg:hidden"}`}>
            <iframe
              srcDoc={data.answer}
              sandbox="allow-scripts allow-forms"
              className="w-full h-full border-none"
              style={{ backgroundColor: "#ffffff" }}
              title="answer-preview"
            />
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div
        className="flex items-center gap-3 px-5 py-3 border-t-2 shrink-0"
        style={{ backgroundColor: "var(--color-page)", borderColor: "var(--color-border)" }}
      >
        <button
          onClick={onAIClick}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold transition-all hover:scale-105 min-h-[44px]"
          style={{ backgroundColor: "var(--color-purple-bg)", color: "var(--color-purple)", border: "2px solid var(--color-purple)" }}
        >
          🤖 AIに質問
        </button>
        <div className="ml-auto">
          <button
            onClick={onNext}
            className="btn-3d btn-3d-blue px-6 py-2 text-sm min-h-[44px]"
          >
            次へ →
          </button>
        </div>
      </div>
    </div>
  );
}
