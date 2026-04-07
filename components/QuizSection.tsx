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

        {/* Question */}
        <h2 className="text-xl lg:text-2xl font-extrabold mb-8 leading-relaxed" style={{ color: "var(--color-text-heading)" }}>
          {question.q}
        </h2>

        {/* Options */}
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
                onClick={() => handleSelect(i)}
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
