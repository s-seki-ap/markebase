"use client";

interface AIChatPanelProps {
  onClose: () => void;
}

export default function AIChatPanel({ onClose }: AIChatPanelProps) {
  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 h-full w-80 z-50 flex flex-col"
        style={{ backgroundColor: "#1e293b", borderLeft: "1px solid #334155" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: "#334155" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🤖</span>
            <span className="text-white font-medium text-sm">AIアシスタント</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div
            className="p-4 rounded-xl text-sm"
            style={{ backgroundColor: "#0f172a", color: "#94a3b8" }}
          >
            <p className="font-medium mb-2" style={{ color: "#8b5cf6" }}>
              🤖 MarkeBase AI
            </p>
            <p className="leading-relaxed">
              AI機能は近日公開予定です。
            </p>
            <p className="mt-3 leading-relaxed text-xs text-slate-500">
              現在、GA4・GTM・HTML・CSS に関する質問に答えられるAIアシスタントを開発中です。
              お楽しみに！
            </p>
          </div>
        </div>

        {/* Input area */}
        <div className="p-4 border-t" style={{ borderColor: "#334155" }}>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="質問を入力（近日公開）"
              disabled
              className="flex-1 px-3 py-2 rounded-lg text-sm outline-none cursor-not-allowed"
              style={{
                backgroundColor: "#0f172a",
                color: "#475569",
                border: "1px solid #334155",
              }}
            />
            <button
              disabled
              className="px-3 py-2 rounded-lg text-sm cursor-not-allowed opacity-40"
              style={{ backgroundColor: "#8b5cf6", color: "white" }}
            >
              送信
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
