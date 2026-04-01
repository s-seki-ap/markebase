"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface LearningPath {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const ROLES = [
  { id: "consultant" as const, label: "コンサルタント", icon: "📊", desc: "クライアントへの提案・分析を担当" },
  { id: "designer" as const, label: "デザイナー", icon: "🎨", desc: "UI/UXデザイン・クリエイティブを担当" },
  { id: "engineer" as const, label: "エンジニア", icon: "💻", desc: "実装・タグ設計・データ基盤を担当" },
];

const EXPERIENCES = [
  { id: "beginner" as const, label: "初めて", desc: "マーケティングは未経験です" },
  { id: "some" as const, label: "少しある", desc: "GA4やタグマネージャーを触ったことがある" },
  { id: "advanced" as const, label: "詳しい", desc: "日常的にデータ分析・施策設計をしている" },
];

const LEARNING_PATHS: LearningPath[] = [
  {
    id: "marketing-basics",
    name: "マーケティング基礎",
    description: "Webの仕組みからGA4まで、マーケターに必要な基礎知識を体系的に学びます。",
    icon: "📊",
    color: "#10b981",
  },
  {
    id: "technical-basics",
    name: "テクニカル基礎",
    description: "HTML/JavaScript/Web技術の基礎を学び、タグ実装やデータレイヤー設計ができるようになります。",
    icon: "💻",
    color: "#3b82f6",
  },
  {
    id: "ga4-master",
    name: "GA4マスター",
    description: "GA4のデータモデルからBigQuery連携・アトリビューションまで、GA4を完全に使いこなす上級コースです。",
    icon: "🎯",
    color: "#8b5cf6",
  },
];

const ROLE_TO_PATH: Record<string, string> = {
  consultant: "marketing-basics",
  designer: "technical-basics",
  engineer: "technical-basics",
};

export default function OnboardingClient({ userName }: { userName: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<"consultant" | "designer" | "engineer" | null>(null);
  const [experience, setExperience] = useState<"beginner" | "some" | "advanced" | null>(null);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const recommendedPathId = role ? ROLE_TO_PATH[role] : null;

  const handleComplete = async () => {
    if (!role || !experience || !selectedPath) return;
    setSaving(true);
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, experience, learningPathId: selectedPath }),
      });
      router.push("/curriculum");
    } catch {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: "#0f172a" }}>
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4"
            style={{ backgroundColor: "#3b82f6" }}
          >
            M
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            ようこそ、{userName.split(" ")[0]}さん
          </h1>
          <p className="text-slate-400 text-sm">
            あなたに合った学習プランを作成します
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-10">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 rounded-full transition-all"
              style={{
                width: step === i ? "24px" : "8px",
                backgroundColor: step >= i ? "#3b82f6" : "#334155",
              }}
            />
          ))}
        </div>

        {/* Step 1: Role */}
        {step === 0 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-6 text-center">
              あなたの役割は？
            </h2>
            <div className="space-y-3">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { setRole(r.id); setStep(1); }}
                  className="w-full flex items-center gap-4 p-5 rounded-xl border transition-all text-left"
                  style={{
                    backgroundColor: role === r.id ? "#3b82f622" : "#1e293b",
                    borderColor: role === r.id ? "#3b82f6" : "#334155",
                  }}
                >
                  <span className="text-2xl">{r.icon}</span>
                  <div>
                    <p className="text-white font-medium">{r.label}</p>
                    <p className="text-slate-400 text-sm">{r.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Experience */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-6 text-center">
              マーケティングの経験は？
            </h2>
            <div className="space-y-3">
              {EXPERIENCES.map((e) => (
                <button
                  key={e.id}
                  onClick={() => {
                    setExperience(e.id);
                    setSelectedPath(recommendedPathId);
                    setStep(2);
                  }}
                  className="w-full flex items-start gap-4 p-5 rounded-xl border transition-all text-left"
                  style={{
                    backgroundColor: experience === e.id ? "#3b82f622" : "#1e293b",
                    borderColor: experience === e.id ? "#3b82f6" : "#334155",
                  }}
                >
                  <div>
                    <p className="text-white font-medium">{e.label}</p>
                    <p className="text-slate-400 text-sm">{e.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(0)}
              className="mt-4 text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              &larr; 戻る
            </button>
          </div>
        )}

        {/* Step 3: Recommended path */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-2 text-center">
              おすすめの学習パス
            </h2>
            <p className="text-slate-400 text-sm mb-6 text-center">
              あなたの役割と経験に基づいて選びました。変更もできます。
            </p>
            <div className="space-y-3">
              {LEARNING_PATHS.map((path) => {
                const isRecommended = path.id === recommendedPathId;
                const isSelected = path.id === selectedPath;
                return (
                  <button
                    key={path.id}
                    onClick={() => setSelectedPath(path.id)}
                    className="w-full flex items-start gap-4 p-5 rounded-xl border transition-all text-left relative"
                    style={{
                      backgroundColor: isSelected ? `${path.color}22` : "#1e293b",
                      borderColor: isSelected ? path.color : "#334155",
                    }}
                  >
                    {isRecommended && (
                      <span
                        className="absolute -top-2 right-3 text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: path.color, color: "white" }}
                      >
                        おすすめ
                      </span>
                    )}
                    <span className="text-2xl">{path.icon}</span>
                    <div>
                      <p className="text-white font-medium">{path.name}</p>
                      <p className="text-slate-400 text-sm">{path.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={handleComplete}
                disabled={!selectedPath || saving}
                className="w-full py-4 rounded-xl text-white font-semibold text-lg transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "#3b82f6" }}
              >
                {saving ? "保存中..." : "学習を始める"}
              </button>
              <button
                onClick={() => setStep(1)}
                className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
              >
                &larr; 戻る
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
