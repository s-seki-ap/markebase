"use client";

import { useState, useEffect } from "react";

interface DiagramSectionProps {
  type: string;
  categoryId: string;
}

export default function DiagramSection({ categoryId }: DiagramSectionProps) {
  if (categoryId === "html") {
    return <HtmlTagDiagram />;
  }
  if (categoryId === "ga4") {
    return <GA4ModelDiagram />;
  }
  return null;
}

function HtmlTagDiagram() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => (s < 3 ? s + 1 : s));
    }, 800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="rounded-2xl p-6"
      style={{ backgroundColor: "var(--color-card)", border: "2px solid var(--color-border)", boxShadow: "var(--color-card-shadow)" }}
    >
      <p className="text-xs font-bold mb-4 uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
        📐 図解: HTMLタグが動く仕組み
      </p>
      <div className="flex flex-col gap-4 items-center">
        {/* Step 0: Plain text */}
        <div
          className="w-full p-3 rounded-2xl text-center transition-all"
          style={{
            backgroundColor: step >= 0 ? "var(--color-page)" : "transparent",
            opacity: step >= 0 ? 1 : 0,
            border: "2px solid var(--color-border)",
          }}
        >
          <span className="text-sm font-semibold" style={{ color: "var(--color-text-secondary)" }}>マーケティングポートフォリオ</span>
          <p className="text-xs mt-1 font-bold" style={{ color: "var(--color-text-disabled)" }}>① テキスト（意味なし）</p>
        </div>

        {step >= 1 && (
          <>
            <div className="text-xl font-bold" style={{ color: "var(--color-blue)" }}>↓</div>
            {/* Step 1: Tagged */}
            <div
              className="w-full p-3 rounded-2xl text-center transition-all animate-bounce-in"
              style={{ backgroundColor: "var(--color-page)", border: "2px solid var(--color-blue)" }}
            >
              <code className="text-sm" style={{ color: "#93c5fd" }}>
                &lt;h1&gt;
                <span style={{ color: "var(--color-text-primary)" }}>マーケティングポートフォリオ</span>
                &lt;/h1&gt;
              </code>
              <p className="text-xs mt-1 font-bold" style={{ color: "var(--color-text-disabled)" }}>② タグで囲む（意味が生まれる）</p>
            </div>
          </>
        )}

        {step >= 2 && (
          <>
            <div className="text-xl font-bold" style={{ color: "var(--color-green)" }}>↓</div>
            {/* Step 2: Browser renders */}
            <div
              className="w-full p-3 rounded-2xl animate-bounce-in"
              style={{ backgroundColor: "white", border: "2px solid var(--color-green)" }}
            >
              <h1 style={{ fontSize: "20px", fontWeight: "bold", color: "#111" }}>
                マーケティングポートフォリオ
              </h1>
              <p className="text-xs mt-1" style={{ color: "#6b7280" }}>
                ③ ブラウザが見出しとして表示
              </p>
            </div>
          </>
        )}

        {step >= 3 && (
          <>
            <div className="text-xl font-bold" style={{ color: "var(--color-green)" }}>↓</div>
            <div
              className="w-full p-3 rounded-2xl text-center animate-bounce-in"
              style={{ backgroundColor: "var(--color-green-bg)", border: "2px solid var(--color-green)" }}
            >
              <p className="text-sm font-bold" style={{ color: "var(--color-green)" }}>
                🔍 検索エンジンも「これはページの主見出し」と認識してSEO評価！
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function GA4ModelDiagram() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => (s < 3 ? s + 1 : s));
    }, 900);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="rounded-2xl p-6"
      style={{ backgroundColor: "var(--color-card)", border: "2px solid var(--color-border)", boxShadow: "var(--color-card-shadow)" }}
    >
      <p className="text-xs font-bold mb-4 uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
        📐 図解: セッションベース vs イベントベース
      </p>

      <div className="grid grid-cols-2 gap-4">
        {/* UA side */}
        <div>
          <p className="text-xs text-center mb-3 font-bold" style={{ color: "var(--color-red)" }}>
            UA（旧）: セッションベース
          </p>
          <div
            className="p-3 rounded-2xl space-y-2"
            style={{ backgroundColor: "var(--color-page)", border: "2px solid var(--color-red-bg)" }}
          >
            {["セッション開始", "ページビュー", "ページビュー", "セッション終了"].map((item, i) => (
              <div
                key={i}
                className={`p-2 rounded-xl text-xs text-center font-bold transition-all ${step >= i ? "animate-bounce-in" : ""}`}
                style={{
                  backgroundColor: step >= i ? "var(--color-red-bg)" : "transparent",
                  color: step >= i ? "var(--color-red)" : "var(--color-border-strong)",
                  border: `2px solid ${step >= i ? "var(--color-red)" : "var(--color-border)"}`,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* GA4 side */}
        <div>
          <p className="text-xs text-center mb-3 font-bold" style={{ color: "var(--color-green)" }}>
            GA4（新）: イベントベース
          </p>
          <div
            className="p-3 rounded-2xl space-y-2"
            style={{ backgroundColor: "var(--color-page)", border: "2px solid var(--color-green-bg)" }}
          >
            {["page_view", "scroll", "click", "purchase"].map((item, i) => (
              <div
                key={i}
                className={`p-2 rounded-xl text-xs text-center font-bold transition-all ${step >= i ? "animate-bounce-in" : ""}`}
                style={{
                  backgroundColor: step >= i ? "var(--color-green-bg)" : "transparent",
                  color: step >= i ? "var(--color-green)" : "var(--color-border-strong)",
                  border: `2px solid ${step >= i ? "var(--color-green)" : "var(--color-border)"}`,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {step >= 3 && (
        <div
          className="mt-4 p-3 rounded-2xl text-center text-xs font-bold animate-bounce-in"
          style={{ backgroundColor: "var(--color-orange-bg)", color: "var(--color-orange)", border: "2px solid var(--color-orange)" }}
        >
          🔥 GA4ではすべての行動が「イベント」として統一管理される
        </div>
      )}
    </div>
  );
}
