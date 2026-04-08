"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div
      className="h-full flex items-center justify-center"
      style={{ backgroundColor: "var(--color-card-alt)", color: "var(--color-text-disabled)" }}
    >
      エディタを読み込み中...
    </div>
  ),
});

interface ExerciseSectionProps {
  data: {
    content: string;
    starterCode: string;
    hints: string[];
    answer: string;
  };
  categoryId: string;
  onNext: () => void;
  onAIClick: () => void;
}

function normalizeHtml(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .replace(/>\s+</g, "><")
    .trim()
    .toLowerCase();
}

type JudgeResult = "correct" | "partial" | "incorrect" | null;

function judgeCode(userCode: string, answer: string): JudgeResult {
  if (!answer) return null;
  const normUser = normalizeHtml(userCode);
  const normAnswer = normalizeHtml(answer);
  if (normUser === normAnswer) return "correct";

  const answerTags = normAnswer.match(/<[^>]+>/g) ?? [];
  if (answerTags.length === 0) return null;
  const matchCount = answerTags.filter((tag) => normUser.includes(tag)).length;
  const ratio = matchCount / answerTags.length;
  if (ratio >= 0.8) return "correct";
  if (ratio >= 0.4) return "partial";
  return "incorrect";
}

const JUDGE_MESSAGES: Record<string, { icon: string; text: string; color: string }> = {
  correct: { icon: "🎉", text: "正解！すごい！", color: "var(--color-green)" },
  partial: { icon: "💡", text: "惜しい！もう少しだよ！ヒントを確認してみよう。", color: "var(--color-orange)" },
  incorrect: { icon: "💪", text: "もう一回チャレンジ！ヒントを見ると手がかりが得られるよ。", color: "var(--color-red)" },
};

export default function ExerciseSection({
  data,
  onNext,
  onAIClick,
}: ExerciseSectionProps) {
  const [code, setCode] = useState(data.starterCode);
  const [previewHtml, setPreviewHtml] = useState("");
  const [shownHints, setShownHints] = useState(0);
  const [judgeResult, setJudgeResult] = useState<JudgeResult>(null);
  const [mobileTab, setMobileTab] = useState<"instructions" | "editor" | "preview">("instructions");

  const handleRun = () => {
    setPreviewHtml(code);
    const result = judgeCode(code, data.answer);
    setJudgeResult(result);
    setMobileTab("preview");
  };

  const showNextHint = () => {
    if (shownHints < data.hints.length) {
      setShownHints(shownHints + 1);
    }
  };

  const contentLines = data.content.split("\n");

  return (
    <div className="h-full flex flex-col">
      {/* Mobile tab bar */}
      <div
        className="flex lg:hidden border-b-2 shrink-0"
        style={{ borderColor: "var(--color-border)" }}
      >
        {([["instructions", "📖 課題"], ["editor", "✏️ コード"], ["preview", "👁️ 結果"]] as const).map(([tab, label]) => (
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

      {/* 3-pane layout */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden">
        {/* Left: Instructions */}
        <div
          className={`shrink-0 overflow-y-auto border-b-2 lg:border-b-0 lg:border-r-2 p-5 w-full lg:w-[28%] lg:max-h-none ${mobileTab === "instructions" ? "flex-1" : "hidden lg:block"}`}
          style={{ backgroundColor: "var(--color-page)", borderColor: "var(--color-border)" }}
        >
          <div className="space-y-3">
            {contentLines.map((line, i) => {
              if (line.startsWith("# ")) {
                return <h2 key={i} className="text-lg font-extrabold mb-1" style={{ color: "var(--color-text-heading)" }}>{line.slice(2)}</h2>;
              }
              if (line.startsWith("## ")) {
                return <h3 key={i} className="text-base font-bold mt-5 mb-1" style={{ color: "var(--color-text-heading)" }}>{line.slice(3)}</h3>;
              }
              if (line.startsWith("> ")) {
                return (
                  <p key={i} className="text-sm italic border-l-4 pl-3 py-1 rounded-r" style={{ color: "var(--color-text-muted)", borderColor: "var(--color-purple)", backgroundColor: "var(--color-purple-bg)" }}>
                    {line.slice(2)}
                  </p>
                );
              }
              if (line.match(/^\d+\./)) {
                return <p key={i} className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{line}</p>;
              }
              if (line.trim() === "") return <div key={i} className="h-2" />;
              return <p key={i} className="text-sm leading-[1.8]" style={{ color: "var(--color-text-secondary)" }}>{line}</p>;
            })}
          </div>

          {/* Hints */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold" style={{ color: "var(--color-text-muted)" }}>💡 ヒント</p>
              <span className="text-xs font-bold" style={{ color: "var(--color-text-disabled)" }}>{shownHints}/{data.hints.length}</span>
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
                className="w-full py-2.5 rounded-2xl text-sm font-bold transition-all hover:scale-[1.02]"
                style={{ backgroundColor: "var(--color-card)", color: "var(--color-text-muted)", boxShadow: "var(--color-card-shadow)" }}
              >
                ヒントを表示 →
              </button>
            )}
          </div>
        </div>

        {/* Center: Editor */}
        <div className={`min-w-0 w-full lg:flex-1 lg:h-auto ${mobileTab === "editor" ? "flex-1" : "hidden lg:block"}`} style={{ backgroundColor: "var(--color-card-alt)" }}>
          <MonacoEditor
            height="100%"
            defaultLanguage="html"
            value={code}
            onChange={(val) => setCode(val ?? "")}
            theme="vs-dark"
            options={{
              fontSize: 13,
              lineNumbers: "on",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: "on",
              padding: { top: 16 },
            }}
          />
        </div>

        {/* Right: Preview */}
        <div
          className={`shrink-0 flex flex-col border-t-2 lg:border-t-0 lg:border-l-2 w-full lg:w-[35%] lg:h-auto ${mobileTab === "preview" ? "flex-1" : "hidden lg:flex"}`}
          style={{ borderColor: "var(--color-border)" }}
        >
          <div
            className="px-3 py-2 border-b-2 flex items-center gap-2"
            style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}
          >
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#ef4444" }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#f59e0b" }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#10b981" }} />
            </div>
            <span className="text-xs font-bold" style={{ color: "var(--color-text-muted)" }}>プレビュー</span>
          </div>
          <div className="flex-1 bg-white">
            {previewHtml ? (
              <iframe
                srcDoc={previewHtml}
                sandbox="allow-scripts"
                className="w-full h-full border-none"
                title="preview"
              />
            ) : (
              <div
                className="h-full flex items-center justify-center text-sm font-semibold"
                style={{ backgroundColor: "#f8fafc", color: "var(--color-text-muted)" }}
              >
                [▶ 実行] を押すとここに表示されます
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Judge result */}
      {judgeResult && JUDGE_MESSAGES[judgeResult] && (
        <div
          className="flex items-center gap-3 px-5 py-3 border-t-2 animate-bounce-in"
          style={{
            borderColor: "var(--color-border)",
            backgroundColor: `color-mix(in srgb, ${JUDGE_MESSAGES[judgeResult].color} 8%, transparent)`,
          }}
        >
          <span className="text-2xl">{JUDGE_MESSAGES[judgeResult].icon}</span>
          <p className="text-sm font-bold" style={{ color: JUDGE_MESSAGES[judgeResult].color }}>
            {JUDGE_MESSAGES[judgeResult].text}
          </p>
        </div>
      )}

      {/* Action bar */}
      <div
        className="flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 border-t-2 shrink-0"
        style={{ backgroundColor: "var(--color-page)", borderColor: "var(--color-border)" }}
      >
        <button
          onClick={handleRun}
          className="btn-3d btn-3d-green px-4 sm:px-5 py-2 text-sm min-h-[44px]"
        >
          ▶ 実行
        </button>
        <button
          onClick={onAIClick}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-2xl text-sm font-bold transition-all hover:scale-105 min-h-[44px]"
          style={{ backgroundColor: "var(--color-purple-bg)", color: "var(--color-purple)", border: "2px solid var(--color-purple)" }}
        >
          🤖 <span className="hidden sm:inline">AIに質問</span><span className="sm:hidden">AI</span>
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
