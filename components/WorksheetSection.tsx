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

  const showNextHint = () => {
    if (shownHints < data.hints.length) {
      setShownHints(shownHints + 1);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* 2-pane layout: instructions | worksheet */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden">
        {/* Left: Instructions + Hints */}
        <div
          className="shrink-0 overflow-y-auto border-b lg:border-b-0 lg:border-r p-6 w-full lg:w-[36%] max-h-[40vh] lg:max-h-none"
          style={{ backgroundColor: "#0f172a", borderColor: "#1e293b" }}
        >
          <div className="prose-sm">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h2 className="text-lg font-bold text-white mb-3">{children}</h2>
                ),
                h2: ({ children }) => (
                  <h3 className="text-base font-semibold text-white mt-5 mb-2">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="text-slate-300 text-sm leading-[1.8] mb-3">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc ml-4 space-y-1.5 mb-3">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal ml-4 space-y-1.5 mb-3">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-slate-300 text-sm leading-[1.7]">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="text-white font-semibold">{children}</strong>
                ),
                code: ({ children }) => (
                  <code
                    className="px-1.5 py-0.5 rounded text-xs font-mono"
                    style={{ backgroundColor: "#1e293b", color: "#93c5fd" }}
                  >
                    {children}
                  </code>
                ),
                blockquote: ({ children }) => (
                  <blockquote
                    className="border-l-3 pl-4 py-2 my-3 rounded-r text-sm"
                    style={{ borderColor: "#8b5cf6", backgroundColor: "#8b5cf610", color: "#cbd5e1" }}
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
              <p className="text-slate-400 text-sm font-medium">ヒント</p>
              <span className="text-slate-500 text-xs">
                {shownHints}/{data.hints.length}
              </span>
            </div>

            {data.hints.slice(0, shownHints).map((hint, i) => (
              <div
                key={i}
                className="mb-2.5 p-3.5 rounded-lg text-sm text-slate-300 leading-[1.7]"
                style={{ backgroundColor: "#1e293b" }}
              >
                💡 {hint}
              </div>
            ))}

            {shownHints < data.hints.length && (
              <button
                onClick={showNextHint}
                className="w-full py-2.5 rounded-lg text-sm transition-colors hover:opacity-80"
                style={{ backgroundColor: "#1e293b", color: "#94a3b8" }}
              >
                ヒントを表示 →
              </button>
            )}
          </div>
        </div>

        {/* Right: Interactive Worksheet */}
        <div className="flex-1 flex flex-col min-w-0 h-[400px] lg:h-auto">
          {/* Worksheet header */}
          <div
            className="px-4 py-2.5 border-b flex items-center justify-between shrink-0"
            style={{ backgroundColor: "#1e293b", borderColor: "#334155" }}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">📝</span>
              <span className="text-slate-300 text-sm font-medium">ワークシート</span>
            </div>
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className="px-3 py-1 rounded text-xs transition-colors"
              style={{
                backgroundColor: showAnswer ? "#f59e0b22" : "#33415566",
                color: showAnswer ? "#fbbf24" : "#94a3b8",
              }}
            >
              {showAnswer ? "📖 解答を隠す" : "📖 解答例を見る"}
            </button>
          </div>

          {/* Worksheet content */}
          <div className="flex-1 relative">
            <iframe
              srcDoc={showAnswer ? data.answer : data.starterCode}
              sandbox="allow-scripts allow-forms"
              className="w-full h-full border-none"
              style={{ backgroundColor: "#ffffff" }}
              title="worksheet"
            />
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div
        className="flex items-center gap-3 px-5 py-3 border-t shrink-0"
        style={{ backgroundColor: "#0f172a", borderColor: "#1e293b" }}
      >
        <button
          onClick={onAIClick}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors"
          style={{ backgroundColor: "#8b5cf622", color: "#8b5cf6" }}
        >
          🤖 AIに質問
        </button>
        <div className="ml-auto">
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#3b82f6", color: "white" }}
          >
            次へ →
          </button>
        </div>
      </div>
    </div>
  );
}
