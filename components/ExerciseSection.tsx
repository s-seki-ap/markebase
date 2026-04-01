"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div
      className="h-full flex items-center justify-center"
      style={{ backgroundColor: "#1e1e1e", color: "#666" }}
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

  // 部分一致: answerのキー要素がuserCodeに含まれているか
  const answerTags = normAnswer.match(/<[^>]+>/g) ?? [];
  if (answerTags.length === 0) return null;
  const matchCount = answerTags.filter((tag) => normUser.includes(tag)).length;
  const ratio = matchCount / answerTags.length;
  if (ratio >= 0.8) return "correct";
  if (ratio >= 0.4) return "partial";
  return "incorrect";
}

const JUDGE_MESSAGES: Record<string, { icon: string; text: string; color: string }> = {
  correct: { icon: "\u2705", text: "正解！よくできました。", color: "#10b981" },
  partial: { icon: "\uD83D\uDCA1", text: "惜しい！もう少しです。ヒントを確認してみましょう。", color: "#f59e0b" },
  incorrect: { icon: "\u274C", text: "もう一度試してみましょう。ヒントを見ると手がかりが得られます。", color: "#ef4444" },
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

  const handleRun = () => {
    setPreviewHtml(code);
    const result = judgeCode(code, data.answer);
    setJudgeResult(result);
  };

  const showNextHint = () => {
    if (shownHints < data.hints.length) {
      setShownHints(shownHints + 1);
    }
  };

  const contentLines = data.content.split("\n");

  return (
    <div className="h-full flex flex-col">
      {/* 3-pane layout */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden">
        {/* Left: Instructions */}
        <div
          className="shrink-0 overflow-y-auto border-b lg:border-b-0 lg:border-r p-5 w-full lg:w-[28%] max-h-[35vh] lg:max-h-none"
          style={{ backgroundColor: "#0f172a", borderColor: "#1e293b" }}
        >
          <div className="space-y-3 text-sm">
            {contentLines.map((line, i) => {
              if (line.startsWith("# ")) {
                return <h2 key={i} className="text-lg font-bold text-white">{line.slice(2)}</h2>;
              }
              if (line.startsWith("## ")) {
                return <h3 key={i} className="text-base font-semibold text-white mt-4">{line.slice(3)}</h3>;
              }
              if (line.startsWith("> ")) {
                return (
                  <p key={i} className="text-slate-400 text-xs italic border-l-2 pl-3" style={{ borderColor: "#8b5cf6" }}>
                    {line.slice(2)}
                  </p>
                );
              }
              if (line.match(/^\d+\./)) {
                return <p key={i} className="text-slate-300">{line}</p>;
              }
              if (line.trim() === "") return <div key={i} className="h-1" />;
              return <p key={i} className="text-slate-300 leading-relaxed">{line}</p>;
            })}
          </div>

          {/* Hints */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-xs font-medium">ヒント</p>
              <span className="text-slate-600 text-xs">{shownHints}/{data.hints.length}</span>
            </div>

            {data.hints.slice(0, shownHints).map((hint, i) => (
              <div
                key={i}
                className="mb-2 p-3 rounded-lg text-xs text-slate-300 leading-relaxed"
                style={{ backgroundColor: "#1e293b" }}
              >
                💡 {hint}
              </div>
            ))}

            {shownHints < data.hints.length && (
              <button
                onClick={showNextHint}
                className="w-full py-2 rounded-lg text-xs transition-colors"
                style={{ backgroundColor: "#1e293b", color: "#94a3b8" }}
              >
                ヒントを表示 →
              </button>
            )}
          </div>
        </div>

        {/* Center: Editor */}
        <div className="min-w-0 w-full lg:flex-1 h-[280px] lg:h-auto" style={{ backgroundColor: "#1e1e1e" }}>
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
          className="shrink-0 flex flex-col border-t lg:border-t-0 lg:border-l w-full lg:w-[35%] h-[220px] lg:h-auto"
          style={{ borderColor: "#1e293b" }}
        >
          <div
            className="px-3 py-2 border-b flex items-center gap-2"
            style={{ backgroundColor: "#1e293b", borderColor: "#334155" }}
          >
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#ef4444" }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#f59e0b" }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#10b981" }} />
            </div>
            <span className="text-slate-400 text-xs">プレビュー</span>
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
                className="h-full flex items-center justify-center text-sm"
                style={{ backgroundColor: "#f8fafc", color: "#94a3b8" }}
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
          className="flex items-center gap-3 px-5 py-2.5 border-t"
          style={{
            borderColor: "#1e293b",
            backgroundColor: `${JUDGE_MESSAGES[judgeResult].color}15`,
          }}
        >
          <span className="text-lg">{JUDGE_MESSAGES[judgeResult].icon}</span>
          <p className="text-sm font-medium" style={{ color: JUDGE_MESSAGES[judgeResult].color }}>
            {JUDGE_MESSAGES[judgeResult].text}
          </p>
        </div>
      )}

      {/* Action bar */}
      <div
        className="flex items-center gap-3 px-5 py-3 border-t shrink-0"
        style={{ backgroundColor: "#0f172a", borderColor: "#1e293b" }}
      >
        <button
          onClick={handleRun}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#10b981", color: "white" }}
        >
          ▶ 実行
        </button>
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
