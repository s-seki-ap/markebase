"use client";

import { useState } from "react";

interface InteractiveSectionProps {
  data: {
    content: string;
    htmlContent: string;
    checkpoints: string[];
  };
  onNext: () => void;
  onAIClick: () => void;
}

export default function InteractiveSection({
  data,
  onNext,
  onAIClick,
}: InteractiveSectionProps) {
  const [checked, setChecked] = useState<boolean[]>(
    new Array(data.checkpoints.length).fill(false)
  );

  const allChecked = checked.every(Boolean);

  const toggle = (index: number) => {
    setChecked((prev) => prev.map((v, i) => (i === index ? !v : v)));
  };

  return (
    <div className="h-full flex flex-col">
      {/* 2-pane layout */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden">
        {/* Left: description + checkpoints (30%) */}
        <div
          className="shrink-0 overflow-y-auto border-b lg:border-b-0 lg:border-r p-5 w-full lg:w-[30%] max-h-[45vh] lg:max-h-none"
          style={{ backgroundColor: "#0f172a", borderColor: "#1e293b" }}
        >
          <div className="text-sm">
            <InteractiveMarkdown content={data.content} />
          </div>

          {/* Checkpoints */}
          {data.checkpoints.length > 0 && (
            <div className="mt-6">
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-3">
                チェックポイント
              </p>
              <div className="space-y-2">
                {data.checkpoints.map((cp, i) => (
                  <label
                    key={i}
                    className="flex items-start gap-3 cursor-pointer group"
                  >
                    <span
                      className="mt-0.5 shrink-0 w-4 h-4 rounded flex items-center justify-center border transition-colors"
                      style={{
                        backgroundColor: checked[i] ? "#10b981" : "transparent",
                        borderColor: checked[i] ? "#10b981" : "#475569",
                      }}
                      onClick={() => toggle(i)}
                    >
                      {checked[i] && (
                        <svg
                          className="w-2.5 h-2.5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </span>
                    <span
                      className="text-xs leading-relaxed transition-colors"
                      style={{ color: checked[i] ? "#94a3b8" : "#e2e8f0" }}
                      onClick={() => toggle(i)}
                    >
                      {cp}
                    </span>
                  </label>
                ))}
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ backgroundColor: "#1e293b" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: allChecked ? "#10b981" : "#3b82f6",
                      width: `${(checked.filter(Boolean).length / data.checkpoints.length) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-slate-500 text-xs mt-1 text-right">
                  {checked.filter(Boolean).length}/{data.checkpoints.length} 完了
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: interactive iframe (70%) */}
        <div className="flex-1 min-w-0 flex flex-col min-h-[50vh] lg:min-h-0">
          {/* iframe header bar */}
          <div
            className="px-3 py-2 border-b flex items-center gap-2 shrink-0"
            style={{ backgroundColor: "#1e293b", borderColor: "#334155" }}
          >
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#ef4444" }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#f59e0b" }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#10b981" }} />
            </div>
            <span className="text-slate-400 text-xs">インタラクティブ体験</span>
          </div>
          <div className="flex-1 bg-white">
            <iframe
              srcDoc={data.htmlContent}
              sandbox="allow-scripts"
              className="w-full h-full border-none"
              title="interactive-content"
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
          AIに質問
        </button>
        <div className="ml-auto flex items-center gap-2">
          {!allChecked && (
            <span className="text-slate-500 text-xs hidden sm:block">
              チェックポイントをすべて確認すると次へ進めます
            </span>
          )}
          <button
            onClick={onNext}
            disabled={!allChecked}
            className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#3b82f6", color: "white" }}
          >
            次へ →
          </button>
        </div>
      </div>
    </div>
  );
}

// Lightweight markdown renderer used inside InteractiveSection
function InteractiveMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        if (line.startsWith("# ")) {
          return (
            <h2 key={i} className="text-lg font-bold text-white mb-3">
              {line.slice(2)}
            </h2>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h3 key={i} className="text-base font-semibold text-white mt-5 mb-2">
              {line.slice(3)}
            </h3>
          );
        }
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <li key={i} className="text-slate-300 ml-4 list-disc leading-relaxed">
              {line.slice(2)}
            </li>
          );
        }
        if (line.startsWith("> ")) {
          return (
            <blockquote
              key={i}
              className="border-l-4 pl-3 py-1 text-slate-400 text-xs italic"
              style={{ borderColor: "#8b5cf6" }}
            >
              {line.slice(2)}
            </blockquote>
          );
        }
        if (line.trim() === "") {
          return <div key={i} className="h-1" />;
        }
        return (
          <p key={i} className="text-slate-300 leading-relaxed">
            {line}
          </p>
        );
      })}
    </div>
  );
}
