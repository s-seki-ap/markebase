"use client";

import { useState } from "react";

interface ModuleFeedbackProps {
  categoryId: string;
  moduleId: string;
}

const RATING_LABELS = ["", "難しすぎた", "やや難しい", "ちょうど良い", "簡単だった", "簡単すぎた"];

export default function ModuleFeedback({ categoryId, moduleId }: ModuleFeedbackProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, moduleId, rating, comment }),
      });
      setSubmitted(true);
    } catch {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-4">
        <p className="text-sm" style={{ color: "#10b981" }}>
          フィードバックありがとうございます！
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 p-6 rounded-xl" style={{ backgroundColor: "#1e293b" }}>
      <p className="text-white text-sm font-medium mb-3">このモジュールはいかがでしたか？</p>

      {/* Star rating */}
      <div className="flex items-center gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            className="text-2xl transition-transform hover:scale-110"
            style={{ color: star <= rating ? "#fbbf24" : "#475569" }}
          >
            ★
          </button>
        ))}
        {rating > 0 && (
          <span className="text-xs text-slate-400 ml-2">{RATING_LABELS[rating]}</span>
        )}
      </div>

      {/* Comment */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="改善点やご感想があればお聞かせください（任意）"
        className="w-full mt-3 p-3 rounded-lg text-sm text-slate-300 placeholder-slate-600 resize-none"
        style={{ backgroundColor: "#0f172a", border: "1px solid #334155" }}
        rows={2}
      />

      <button
        onClick={handleSubmit}
        disabled={rating === 0 || submitting}
        className="mt-3 px-5 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        style={{ backgroundColor: "#3b82f6" }}
      >
        {submitting ? "送信中..." : "送信"}
      </button>
    </div>
  );
}
