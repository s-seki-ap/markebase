"use client";

import { useState } from "react";

interface QuizQuestion {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface QuizSectionProps {
  data: {
    questions: QuizQuestion[];
  };
  onNext: () => void;
  categoryId?: string;
  moduleId?: string;
  onQuizComplete?: (xp: number) => void;
}

export default function QuizSection({ data, onNext, categoryId, moduleId, onQuizComplete }: QuizSectionProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);
  const [xpSaved, setXpSaved] = useState(false);

  const question = data.questions[currentQ];
  const isAnswered = selected !== null;
  const isCorrect = selected === question?.correct;

  const handleSelect = (index: number) => {
    if (isAnswered) return;
    setSelected(index);
  };

  const handleNext = () => {
    const newAnswers = [...answers, selected === question.correct];

    if (currentQ < data.questions.length - 1) {
      setAnswers(newAnswers);
      setCurrentQ(currentQ + 1);
      setSelected(null);
    } else {
      setAnswers(newAnswers);
      setFinished(true);
    }
  };

  if (finished) {
    const score = answers.filter(Boolean).length;
    const total = data.questions.length;
    const xp = score * 10;

    // Firestore にクイズXPを保存
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
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">{score === total ? "🎉" : score >= total / 2 ? "👏" : "💪"}</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {score}/{total} 正解
          </h2>
          <p className="text-slate-400 text-base mb-6 leading-relaxed">
            {score === total
              ? "パーフェクト！素晴らしい理解度です。"
              : score >= total / 2
              ? "よくできました！不正解の問題を復習しましょう。"
              : "もう一度テキストを読み直してみましょう。"}
          </p>
          <div
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl mb-8 text-lg font-bold"
            style={{ backgroundColor: "#fbbf2422", color: "#fbbf24" }}
          >
            ⭐ +{xp} XP 獲得！
          </div>
          <div>
            <button
              onClick={onNext}
              className="px-8 py-3 rounded-xl text-white font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#3b82f6" }}
            >
              次のセクションへ →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="w-full max-w-[600px]">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          {data.questions.map((_, i) => (
            <div
              key={i}
              className="h-1.5 flex-1 rounded-full transition-colors"
              style={{
                backgroundColor:
                  i < currentQ
                    ? "#10b981"
                    : i === currentQ
                    ? "#3b82f6"
                    : "#1e293b",
              }}
            />
          ))}
          <span className="text-slate-400 text-xs shrink-0">
            {currentQ + 1}/{data.questions.length}
          </span>
        </div>

        {/* Question */}
        <h2 className="text-xl lg:text-2xl font-bold text-white mb-8 leading-relaxed">
          {question.q}
        </h2>

        {/* Options */}
        <div className="space-y-3.5 mb-8">
          {question.options.map((option, i) => {
            let borderColor = "#334155";
            let bgColor = "#1e293b";
            let textColor = "#cbd5e1";

            if (isAnswered) {
              if (i === question.correct) {
                borderColor = "#10b981";
                bgColor = "#10b98122";
                textColor = "#10b981";
              } else if (i === selected) {
                borderColor = "#ef4444";
                bgColor = "#ef444422";
                textColor = "#ef4444";
              }
            } else if (selected === i) {
              borderColor = "#3b82f6";
              bgColor = "#3b82f622";
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                className="w-full text-left px-5 py-4 rounded-xl border transition-all text-[15px] leading-relaxed font-medium"
                style={{
                  backgroundColor: bgColor,
                  borderColor,
                  color: textColor,
                  cursor: isAnswered ? "default" : "pointer",
                }}
              >
                <span
                  className="inline-flex w-7 h-7 rounded-full items-center justify-center text-xs mr-3 shrink-0 font-bold"
                  style={{ backgroundColor: "#334155" }}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                {option}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {isAnswered && (
          <div
            className="p-5 rounded-xl mb-6"
            style={{
              backgroundColor: isCorrect ? "#10b98115" : "#ef444415",
              borderLeft: `4px solid ${isCorrect ? "#10b981" : "#ef4444"}`,
            }}
          >
            <p className="font-semibold mb-2 text-base" style={{ color: isCorrect ? "#10b981" : "#ef4444" }}>
              {isCorrect ? "✅ 正解！" : "❌ 不正解"}
            </p>
            <p className="text-slate-300 text-[15px] leading-[1.8]">{question.explanation}</p>
          </div>
        )}

        {/* Next button */}
        {isAnswered && (
          <button
            onClick={handleNext}
            className="w-full py-3 rounded-xl text-white font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#3b82f6" }}
          >
            {currentQ < data.questions.length - 1 ? "次の問題 →" : "結果を見る"}
          </button>
        )}
      </div>
    </div>
  );
}
