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
    color: "#58CC02",
  },
  {
    id: "technical-basics",
    name: "テクニカル基礎",
    description: "HTML/JavaScript/Web技術の基礎を学び、タグ実装やデータレイヤー設計ができるようになります。",
    icon: "💻",
    color: "#1CB0F6",
  },
  {
    id: "ga4-master",
    name: "GA4マスター",
    description: "GA4のデータモデルからBigQuery連携・アトリビューションまで、GA4を完全に使いこなす上級コースです。",
    icon: "🎯",
    color: "#CE82FF",
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
    <main className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: "var(--color-page)" }}>
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-extrabold mx-auto mb-4"
            style={{ backgroundColor: "var(--color-green)", color: "#ffffff", boxShadow: "0 4px 0 var(--color-green-shadow)" }}
          >
            M
          </div>
          <h1 className="text-2xl font-extrabold mb-2" style={{ color: "var(--color-text-heading)" }}>
            ようこそ、{userName.split(" ")[0]}さん！ 🎉
          </h1>
          <p className="text-sm font-semibold" style={{ color: "var(--color-text-muted)" }}>
            あなたに合った学習プランを作成します
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-10">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-3 rounded-full transition-all duration-300"
              style={{
                width: step === i ? "32px" : "12px",
                backgroundColor: step >= i ? "var(--color-green)" : "var(--color-border)",
              }}
            />
          ))}
        </div>

        {/* Step 1: Role */}
        {step === 0 && (
          <div>
            <h2 className="text-lg font-bold mb-6 text-center" style={{ color: "var(--color-text-heading)" }}>
              あなたの役割は？
            </h2>
            <div className="space-y-3">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { setRole(r.id); setStep(1); }}
                  className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-200 text-left hover:scale-[1.02]"
                  style={{
                    backgroundColor: role === r.id ? "var(--color-green-bg)" : "var(--color-card)",
                    borderColor: role === r.id ? "var(--color-green)" : "var(--color-border)",
                    boxShadow: "var(--color-card-shadow)",
                  }}
                >
                  <span className="text-3xl">{r.icon}</span>
                  <div>
                    <p className="font-bold" style={{ color: "var(--color-text-heading)" }}>{r.label}</p>
                    <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{r.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Experience */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-bold mb-6 text-center" style={{ color: "var(--color-text-heading)" }}>
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
                  className="w-full flex items-start gap-4 p-5 rounded-2xl border-2 transition-all duration-200 text-left hover:scale-[1.02]"
                  style={{
                    backgroundColor: experience === e.id ? "var(--color-blue-bg)" : "var(--color-card)",
                    borderColor: experience === e.id ? "var(--color-blue)" : "var(--color-border)",
                    boxShadow: "var(--color-card-shadow)",
                  }}
                >
                  <div>
                    <p className="font-bold" style={{ color: "var(--color-text-heading)" }}>{e.label}</p>
                    <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{e.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(0)}
              className="mt-4 text-sm font-bold transition-all hover:scale-105"
              style={{ color: "var(--color-text-disabled)" }}
            >
              &larr; 戻る
            </button>
          </div>
        )}

        {/* Step 3: Recommended path */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-bold mb-2 text-center" style={{ color: "var(--color-text-heading)" }}>
              おすすめの学習パス 🎯
            </h2>
            <p className="text-sm mb-6 text-center" style={{ color: "var(--color-text-muted)" }}>
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
                    className="w-full flex items-start gap-4 p-5 rounded-2xl border-2 transition-all duration-200 text-left relative hover:scale-[1.02]"
                    style={{
                      backgroundColor: isSelected ? `${path.color}22` : "var(--color-card)",
                      borderColor: isSelected ? path.color : "var(--color-border)",
                      boxShadow: "var(--color-card-shadow)",
                    }}
                  >
                    {isRecommended && (
                      <span
                        className="absolute -top-3 right-3 text-xs px-3 py-1 rounded-full font-bold"
                        style={{ backgroundColor: path.color, color: "#ffffff", boxShadow: `0 2px 0 ${path.color}88` }}
                      >
                        ⭐ おすすめ
                      </span>
                    )}
                    <span className="text-3xl">{path.icon}</span>
                    <div>
                      <p className="font-bold" style={{ color: "var(--color-text-heading)" }}>{path.name}</p>
                      <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{path.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={handleComplete}
                disabled={!selectedPath || saving}
                className="btn-3d btn-3d-green w-full py-4 text-lg disabled:opacity-50"
              >
                {saving ? "保存中..." : "🚀 学習を始める"}
              </button>
              <button
                onClick={() => setStep(1)}
                className="text-sm font-bold transition-all hover:scale-105"
                style={{ color: "var(--color-text-disabled)" }}
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
