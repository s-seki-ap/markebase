"use client";

import { useState } from "react";

// ---------- Types ----------

interface MultipleChoiceQuestion {
  type?: "multiple_choice";
  q?: string;
  question?: string; // legacy field name
  options: string[];
  correct: number;
  explanation: string;
}

interface FillInBlankQuestion {
  type: "fill_in_blank";
  q?: string;
  question?: string;
  blanks: string[];
  explanation: string;
}

interface SQLQuestion {
  type: "sql";
  q?: string;
  question?: string;
  sampleData: {
    tableName: string;
    columns: string[];
    rows: (string | number | null)[][];
  }[];
  expectedColumns: string[];
  expectedRows: (string | number | null)[][];
  explanation: string;
}

type QuizQuestion = MultipleChoiceQuestion | FillInBlankQuestion | SQLQuestion;

interface QuizSectionProps {
  data: {
    questions: QuizQuestion[];
  };
  onNext: () => void;
  categoryId?: string;
  moduleId?: string;
  onQuizComplete?: (xp: number) => void;
}

// ---------- Helpers ----------

function getQuestionType(q: QuizQuestion): "multiple_choice" | "fill_in_blank" | "sql" {
  if (q.type === "fill_in_blank") return "fill_in_blank";
  if (q.type === "sql") return "sql";
  return "multiple_choice";
}

function getQuestionText(q: QuizQuestion): string {
  return q.q || q.question || "";
}

function normalizeFillInBlank(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

// ---------- Component ----------

export default function QuizSection({ data, onNext, categoryId, moduleId, onQuizComplete }: QuizSectionProps) {
  const [currentQ, setCurrentQ] = useState(0);
  // Multiple choice state
  const [selected, setSelected] = useState<number | null>(null);
  // Fill-in-blank state
  const [fillAnswer, setFillAnswer] = useState("");
  const [fillSubmitted, setFillSubmitted] = useState(false);
  // SQL state
  const [sqlAnswer, setSqlAnswer] = useState("");
  const [sqlSubmitted, setSqlSubmitted] = useState(false);
  const [sqlResult, setSqlResult] = useState<{ columns: string[]; rows: (string | number | null)[][] } | null>(null);
  const [sqlError, setSqlError] = useState<string | null>(null);

  const [answers, setAnswers] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);
  const [xpSaved, setXpSaved] = useState(false);

  const question = data.questions[currentQ];
  const qType = question ? getQuestionType(question) : "multiple_choice";

  // --- Answer state per type ---
  const isAnswered =
    qType === "multiple_choice" ? selected !== null :
    qType === "fill_in_blank" ? fillSubmitted :
    qType === "sql" ? sqlSubmitted :
    false;

  const isCorrect =
    qType === "multiple_choice" ? selected === (question as MultipleChoiceQuestion).correct :
    qType === "fill_in_blank" ? (question as FillInBlankQuestion).blanks.some(
      (b) => normalizeFillInBlank(fillAnswer) === normalizeFillInBlank(b)
    ) :
    qType === "sql" ? checkSqlCorrect(question as SQLQuestion, sqlResult) :
    false;

  function checkSqlCorrect(
    q: SQLQuestion,
    result: { columns: string[]; rows: (string | number | null)[][] } | null
  ): boolean {
    if (!result) return false;
    const expCols = q.expectedColumns.map((c) => c.toLowerCase());
    const resCols = result.columns.map((c) => c.toLowerCase());
    if (expCols.length !== resCols.length || !expCols.every((c, i) => c === resCols[i])) return false;
    if (q.expectedRows.length !== result.rows.length) return false;
    return q.expectedRows.every((row, ri) =>
      row.every((val, ci) => String(val) === String(result.rows[ri]?.[ci] ?? ""))
    );
  }

  const handleSelect = (index: number) => {
    if (isAnswered) return;
    setSelected(index);
  };

  const handleFillSubmit = () => {
    if (fillAnswer.trim() === "") return;
    setFillSubmitted(true);
  };

  const handleSqlSubmit = async () => {
    if (sqlAnswer.trim() === "") return;
    const sq = question as SQLQuestion;
    try {
      // Dynamic import of DuckDB execution
      const { executeSQLWithSampleData } = await import("@/lib/duckdb-client");
      const result = await executeSQLWithSampleData(sq.sampleData, sqlAnswer);
      setSqlResult(result);
      setSqlError(null);
    } catch (e) {
      setSqlError(e instanceof Error ? e.message : "SQL実行エラー");
      setSqlResult(null);
    }
    setSqlSubmitted(true);
  };

  const handleNext = () => {
    const correct =
      qType === "multiple_choice" ? selected === (question as MultipleChoiceQuestion).correct :
      qType === "fill_in_blank" ? (question as FillInBlankQuestion).blanks.some(
        (b) => normalizeFillInBlank(fillAnswer) === normalizeFillInBlank(b)
      ) :
      qType === "sql" ? checkSqlCorrect(question as SQLQuestion, sqlResult) :
      false;

    const newAnswers = [...answers, correct];

    if (currentQ < data.questions.length - 1) {
      setAnswers(newAnswers);
      setCurrentQ(currentQ + 1);
      // Reset per-question state
      setSelected(null);
      setFillAnswer("");
      setFillSubmitted(false);
      setSqlAnswer("");
      setSqlSubmitted(false);
      setSqlResult(null);
      setSqlError(null);
    } else {
      setAnswers(newAnswers);
      setFinished(true);
    }
  };

  // ---------- Finished screen ----------
  if (finished) {
    const score = answers.filter(Boolean).length;
    const total = data.questions.length;
    const xp = score * 10;

    if (!xpSaved && categoryId && moduleId) {
      setXpSaved(true);
      fetch("/api/progress/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, moduleId, score, total }),
      })
        .then(() => onQuizComplete?.(xp))
        .catch(() => {});
    }

    return (
      <div className="h-full overflow-y-auto flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="text-7xl mb-6 animate-bounce-in">{score === total ? "🎉" : score >= total / 2 ? "👏" : "💪"}</div>
          <h2 className="text-3xl font-extrabold mb-2" style={{ color: "var(--color-text-heading)" }}>
            {score}/{total} 正解！
          </h2>
          <p className="text-base mb-6 leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            {score === total
              ? "パーフェクト！すごい！ 🏆"
              : score >= total / 2
              ? "よくできました！不正解の問題を復習しよう！"
              : "もう一度チャレンジしてみよう！"}
          </p>
          <div
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full mb-8 text-lg font-extrabold animate-bounce-in"
            style={{ backgroundColor: "var(--color-yellow-bg)", color: "var(--color-yellow)", border: "2px solid var(--color-yellow)" }}
          >
            ⭐ +{xp} XP 獲得！
          </div>
          <div>
            <button
              onClick={onNext}
              className="btn-3d btn-3d-green px-8 py-3 text-base"
            >
              次のセクションへ 🚀
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Question screen ----------
  return (
    <div className="h-full overflow-y-auto flex items-start justify-center p-8">
      <div className="w-full max-w-[600px] py-4">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          {data.questions.map((_, i) => (
            <div
              key={i}
              className="h-3 flex-1 rounded-full transition-all duration-300"
              style={{
                backgroundColor:
                  i < currentQ
                    ? "var(--color-green)"
                    : i === currentQ
                    ? "var(--color-blue)"
                    : "var(--color-border)",
              }}
            />
          ))}
          <span className="text-xs shrink-0 font-bold" style={{ color: "var(--color-text-muted)" }}>
            {currentQ + 1}/{data.questions.length}
          </span>
        </div>

        {/* Question type badge */}
        <div className="mb-4">
          <span
            className="text-xs px-3 py-1 rounded-full font-bold"
            style={{
              backgroundColor: qType === "sql" ? "var(--color-purple-bg)" : qType === "fill_in_blank" ? "var(--color-orange-bg)" : "var(--color-blue-bg)",
              color: qType === "sql" ? "var(--color-purple)" : qType === "fill_in_blank" ? "var(--color-orange)" : "var(--color-blue)",
              border: `2px solid ${qType === "sql" ? "var(--color-purple)" : qType === "fill_in_blank" ? "var(--color-orange)" : "var(--color-blue)"}`,
            }}
          >
            {qType === "sql" ? "🗃️ SQL問題" : qType === "fill_in_blank" ? "✏️ 穴埋め" : "📝 選択式"}
          </span>
        </div>

        {/* Question */}
        <h2 className="text-xl lg:text-2xl font-extrabold mb-8 leading-relaxed" style={{ color: "var(--color-text-heading)" }}>
          {getQuestionText(question)}
        </h2>

        {/* --- Multiple choice --- */}
        {qType === "multiple_choice" && (
          <MultipleChoiceUI
            question={question as MultipleChoiceQuestion}
            selected={selected}
            isAnswered={isAnswered}
            onSelect={handleSelect}
          />
        )}

        {/* --- Fill in blank --- */}
        {qType === "fill_in_blank" && (
          <FillInBlankUI
            question={question as FillInBlankQuestion}
            answer={fillAnswer}
            submitted={fillSubmitted}
            onAnswerChange={setFillAnswer}
            onSubmit={handleFillSubmit}
          />
        )}

        {/* --- SQL --- */}
        {qType === "sql" && (
          <SQLQuizUI
            question={question as SQLQuestion}
            answer={sqlAnswer}
            submitted={sqlSubmitted}
            result={sqlResult}
            error={sqlError}
            onAnswerChange={setSqlAnswer}
            onSubmit={handleSqlSubmit}
          />
        )}

        {/* Explanation */}
        {isAnswered && (
          <div
            className="p-5 rounded-2xl mb-6 animate-bounce-in"
            style={{
              backgroundColor: isCorrect ? "var(--color-green-bg)" : "var(--color-red-bg)",
              border: `2px solid ${isCorrect ? "var(--color-green)" : "var(--color-red)"}`,
            }}
          >
            <p className="font-extrabold mb-2 text-base" style={{ color: isCorrect ? "var(--color-green)" : "var(--color-red)" }}>
              {isCorrect ? "✅ 正解！すごい！" : "😅 おしい！"}
            </p>
            <p className="text-[15px] leading-[1.8]" style={{ color: "var(--color-text-secondary)" }}>{question.explanation}</p>
            {qType === "fill_in_blank" && !isCorrect && (
              <p className="text-sm mt-2 font-bold" style={{ color: "var(--color-text-muted)" }}>
                正解: {(question as FillInBlankQuestion).blanks[0]}
              </p>
            )}
          </div>
        )}

        {/* Next button */}
        {isAnswered && (
          <button
            onClick={handleNext}
            className="btn-3d btn-3d-green w-full py-3 text-base"
          >
            {currentQ < data.questions.length - 1 ? "次の問題 →" : "結果を見る 🎯"}
          </button>
        )}
      </div>
    </div>
  );
}

// ---------- Sub-components ----------

function MultipleChoiceUI({
  question,
  selected,
  isAnswered,
  onSelect,
}: {
  question: MultipleChoiceQuestion;
  selected: number | null;
  isAnswered: boolean;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="space-y-3 mb-8">
      {question.options.map((option, i) => {
        let borderColor = "var(--color-border)";
        let bgColor = "var(--color-card)";
        let textColor = "var(--color-text-secondary)";

        if (isAnswered) {
          if (i === question.correct) {
            borderColor = "var(--color-green)";
            bgColor = "var(--color-green-bg)";
            textColor = "var(--color-green)";
          } else if (i === selected) {
            borderColor = "var(--color-red)";
            bgColor = "var(--color-red-bg)";
            textColor = "var(--color-red)";
          }
        } else if (selected === i) {
          borderColor = "var(--color-blue)";
          bgColor = "var(--color-blue-bg)";
        }

        return (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className="w-full text-left px-5 py-4 rounded-2xl border-2 transition-all duration-200 text-[15px] leading-relaxed font-bold hover:scale-[1.01]"
            style={{
              backgroundColor: bgColor,
              borderColor,
              color: textColor,
              cursor: isAnswered ? "default" : "pointer",
              boxShadow: isAnswered ? "none" : "var(--color-card-shadow)",
            }}
          >
            <span
              className="inline-flex w-8 h-8 rounded-full items-center justify-center text-xs mr-3 shrink-0 font-extrabold"
              style={{
                backgroundColor: isAnswered && i === question.correct ? "var(--color-green)" : isAnswered && i === selected ? "var(--color-red)" : "var(--color-border)",
                color: isAnswered && (i === question.correct || i === selected) ? "#ffffff" : "var(--color-text-secondary)",
              }}
            >
              {String.fromCharCode(65 + i)}
            </span>
            {option}
          </button>
        );
      })}
    </div>
  );
}

function FillInBlankUI({
  question,
  answer,
  submitted,
  onAnswerChange,
  onSubmit,
}: {
  question: FillInBlankQuestion;
  answer: string;
  submitted: boolean;
  onAnswerChange: (v: string) => void;
  onSubmit: () => void;
}) {
  const isCorrect = question.blanks.some(
    (b) => normalizeFillInBlank(answer) === normalizeFillInBlank(b)
  );

  return (
    <div className="mb-8">
      <div className="flex gap-3">
        <input
          type="text"
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !submitted) onSubmit(); }}
          disabled={submitted}
          placeholder="回答を入力..."
          className="flex-1 px-5 py-4 rounded-2xl border-2 text-[15px] font-bold outline-none transition-all"
          style={{
            backgroundColor: "var(--color-card)",
            borderColor: submitted
              ? isCorrect ? "var(--color-green)" : "var(--color-red)"
              : "var(--color-border)",
            color: "var(--color-text-heading)",
          }}
        />
        {!submitted && (
          <button
            onClick={onSubmit}
            disabled={answer.trim() === ""}
            className="btn-3d btn-3d-blue px-6 py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            回答する
          </button>
        )}
      </div>
    </div>
  );
}

function SQLQuizUI({
  question,
  answer,
  submitted,
  result,
  error,
  onAnswerChange,
  onSubmit,
}: {
  question: SQLQuestion;
  answer: string;
  submitted: boolean;
  result: { columns: string[]; rows: (string | number | null)[][] } | null;
  error: string | null;
  onAnswerChange: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="mb-8 space-y-4">
      {/* Sample data preview */}
      {question.sampleData.map((table, ti) => (
        <div key={ti}>
          <p className="text-sm font-bold mb-2" style={{ color: "var(--color-text-muted)" }}>
            📋 テーブル: <code className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: "var(--color-card)", color: "var(--color-purple)" }}>{table.tableName}</code>
          </p>
          <div className="overflow-x-auto rounded-xl" style={{ border: "2px solid var(--color-border)" }}>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ backgroundColor: "var(--color-card)" }}>
                  {table.columns.map((col, ci) => (
                    <th key={ci} className="px-3 py-2 text-left font-bold border-b-2" style={{ borderColor: "var(--color-border)", color: "var(--color-text-heading)" }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.slice(0, 5).map((row, ri) => (
                  <tr key={ri}>
                    {row.map((val, ci) => (
                      <td key={ci} className="px-3 py-1.5 border-b" style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}>{val === null ? "NULL" : String(val)}</td>
                    ))}
                  </tr>
                ))}
                {table.rows.length > 5 && (
                  <tr>
                    <td colSpan={table.columns.length} className="px-3 py-1.5 text-center" style={{ color: "var(--color-text-disabled)" }}>...他{table.rows.length - 5}行</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* SQL input */}
      <textarea
        value={answer}
        onChange={(e) => onAnswerChange(e.target.value)}
        disabled={submitted}
        placeholder="SELECT ..."
        rows={4}
        className="w-full px-4 py-3 rounded-2xl border-2 text-sm font-mono outline-none transition-all resize-none"
        style={{
          backgroundColor: "var(--color-card)",
          borderColor: submitted
            ? result && !error ? "var(--color-green)" : "var(--color-red)"
            : "var(--color-border)",
          color: "var(--color-text-heading)",
        }}
      />

      {!submitted && (
        <button
          onClick={onSubmit}
          disabled={answer.trim() === ""}
          className="btn-3d btn-3d-purple px-6 py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ▶ SQL実行して回答
        </button>
      )}

      {/* SQL error */}
      {error && (
        <div className="p-4 rounded-xl text-sm" style={{ backgroundColor: "var(--color-red-bg)", color: "var(--color-red)", border: "2px solid var(--color-red)" }}>
          ❌ {error}
        </div>
      )}

      {/* SQL result table */}
      {result && (
        <div>
          <p className="text-sm font-bold mb-2" style={{ color: "var(--color-text-muted)" }}>実行結果:</p>
          <div className="overflow-x-auto rounded-xl" style={{ border: "2px solid var(--color-border)" }}>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ backgroundColor: "var(--color-card)" }}>
                  {result.columns.map((col, ci) => (
                    <th key={ci} className="px-3 py-2 text-left font-bold border-b-2" style={{ borderColor: "var(--color-border)", color: "var(--color-text-heading)" }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((val, ci) => (
                      <td key={ci} className="px-3 py-1.5 border-b" style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}>{val === null ? "NULL" : String(val)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
