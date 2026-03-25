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
      className="rounded-xl p-6"
      style={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
    >
      <p className="text-slate-400 text-xs font-medium mb-4 uppercase tracking-wide">
        図解: HTMLタグが動く仕組み
      </p>
      <div className="flex flex-col gap-4 items-center">
        {/* Step 0: Plain text */}
        <div
          className="w-full p-3 rounded-lg text-center transition-all"
          style={{
            backgroundColor: step >= 0 ? "#0f172a" : "transparent",
            opacity: step >= 0 ? 1 : 0,
            border: "1px solid #334155",
          }}
        >
          <span className="text-slate-300 text-sm">マーケティングポートフォリオ</span>
          <p className="text-slate-500 text-xs mt-1">① テキスト（意味なし）</p>
        </div>

        {step >= 1 && (
          <>
            <div className="text-slate-500 text-xl">↓</div>
            {/* Step 1: Tagged */}
            <div
              className="w-full p-3 rounded-lg text-center transition-all"
              style={{ backgroundColor: "#0f172a", border: "1px solid #3b82f6" }}
            >
              <code className="text-sm" style={{ color: "#93c5fd" }}>
                &lt;h1&gt;
                <span style={{ color: "#e2e8f0" }}>マーケティングポートフォリオ</span>
                &lt;/h1&gt;
              </code>
              <p className="text-slate-500 text-xs mt-1">② タグで囲む（意味が生まれる）</p>
            </div>
          </>
        )}

        {step >= 2 && (
          <>
            <div className="text-slate-500 text-xl">↓</div>
            {/* Step 2: Browser renders */}
            <div
              className="w-full p-3 rounded-lg"
              style={{ backgroundColor: "white", border: "1px solid #10b981" }}
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
            <div className="text-slate-500 text-xl">↓</div>
            <div
              className="w-full p-3 rounded-lg text-center"
              style={{ backgroundColor: "#10b98122", border: "1px solid #10b981" }}
            >
              <p className="text-sm" style={{ color: "#10b981" }}>
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
      className="rounded-xl p-6"
      style={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
    >
      <p className="text-slate-400 text-xs font-medium mb-4 uppercase tracking-wide">
        図解: セッションベース vs イベントベース
      </p>

      <div className="grid grid-cols-2 gap-4">
        {/* UA side */}
        <div>
          <p className="text-xs text-center mb-3 font-medium" style={{ color: "#ef4444" }}>
            UA（旧）: セッションベース
          </p>
          <div
            className="p-3 rounded-lg space-y-2"
            style={{ backgroundColor: "#0f172a", border: "1px solid #ef444444" }}
          >
            {["セッション開始", "ページビュー", "ページビュー", "セッション終了"].map((item, i) => (
              <div
                key={i}
                className="p-2 rounded text-xs text-center transition-all"
                style={{
                  backgroundColor: step >= i ? "#ef444422" : "transparent",
                  color: step >= i ? "#ef4444" : "#475569",
                  border: `1px solid ${step >= i ? "#ef44444a" : "#1e293b"}`,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* GA4 side */}
        <div>
          <p className="text-xs text-center mb-3 font-medium" style={{ color: "#10b981" }}>
            GA4（新）: イベントベース
          </p>
          <div
            className="p-3 rounded-lg space-y-2"
            style={{ backgroundColor: "#0f172a", border: "1px solid #10b98144" }}
          >
            {["page_view", "scroll", "click", "purchase"].map((item, i) => (
              <div
                key={i}
                className="p-2 rounded text-xs text-center transition-all"
                style={{
                  backgroundColor: step >= i ? "#10b98122" : "transparent",
                  color: step >= i ? "#10b981" : "#475569",
                  border: `1px solid ${step >= i ? "#10b9814a" : "#1e293b"}`,
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
          className="mt-4 p-3 rounded-lg text-center text-xs"
          style={{ backgroundColor: "#f9731622", color: "#f97316" }}
        >
          🔥 GA4ではすべての行動が「イベント」として統一管理される
        </div>
      )}
    </div>
  );
}
