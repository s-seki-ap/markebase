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
        <p className="text-sm" style={{ color: "var(--color-green)" }}>
          フィードバックありがとうございます！
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 p-6 rounded-xl" style={{ backgroundColor: "var(--color-card)", boxShadow: "var(--color-card-shadow)" }}>
      <p className="text-sm font-medium mb-3" style={{ color: "var(--color-text-heading)" }}>このモジュールはいかがでしたか？</p>

      {/* Star rating */}
      <div className="flex items-center gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            className="text-2xl transition-transform hover:scale-110"
            style={{ color: star <= rating ? "var(--color-yellow)" : "var(--color-border-strong)" }}
          >
            ★
          </button>
        ))}
        {rating > 0 && (
          <span className="text-xs ml-2" style={{ color: "var(--color-text-muted)" }}>{RATING_LABELS[rating]}</span>
        )}
      </div>

      {/* Comment */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="改善点やご感想があればお聞かせください（任意）"
        className="w-full mt-3 p-3 rounded-lg text-sm resize-none"
        style={{ backgroundColor: "var(--color-page)", border: "1px solid var(--color-border)", color: "var(--color-text-secondary)" }}
        rows={2}
      />

      <button
        onClick={handleSubmit}
        disabled={rating === 0 || submitting}
        className="mt-3 px-5 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
        style={{ backgroundColor: "var(--color-blue)", color: "#ffffff" }}
      >
        {submitting ? "送信中..." : "送信"}
      </button>
    </div>
  );
}
