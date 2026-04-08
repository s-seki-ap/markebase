"use client";

import { useState } from "react";
import type { SampleTable, QueryResult } from "@/lib/duckdb-client";

interface SQLSandboxProps {
  sampleData: SampleTable[];
  initialSQL?: string;
  onNext?: () => void;
}

export default function SQLSandbox({ sampleData, initialSQL = "", onNext }: SQLSandboxProps) {
  const [sql, setSql] = useState(initialSQL);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleExecute = async () => {
    if (sql.trim() === "" || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { executeSQLWithSampleData } = await import("@/lib/duckdb-client");
      const res = await executeSQLWithSampleData(sampleData, sql);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "SQL実行エラー");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden">
        {/* Left: Sample data */}
        <div
          className="shrink-0 overflow-y-auto border-b-2 lg:border-b-0 lg:border-r-2 p-5 w-full lg:w-[30%] max-h-[35vh] lg:max-h-none"
          style={{ backgroundColor: "var(--color-page)", borderColor: "var(--color-border)" }}
        >
          <h3 className="text-sm font-extrabold mb-4" style={{ color: "var(--color-text-heading)" }}>
            🗃️ サンプルデータ
          </h3>
          {sampleData.map((table, ti) => (
            <div key={ti} className="mb-4">
              <p className="text-xs font-bold mb-2" style={{ color: "var(--color-purple)" }}>
                {table.tableName}
              </p>
              <div className="overflow-x-auto rounded-xl" style={{ border: "2px solid var(--color-border)" }}>
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ backgroundColor: "var(--color-card)" }}>
                      {table.columns.map((col, ci) => (
                        <th key={ci} className="px-2 py-1.5 text-left font-bold border-b-2" style={{ borderColor: "var(--color-border)", color: "var(--color-text-heading)" }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row, ri) => (
                      <tr key={ri}>
                        {row.map((val, ci) => (
                          <td key={ci} className="px-2 py-1 border-b" style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}>{val === null ? "NULL" : String(val)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Center: SQL editor */}
        <div className="min-w-0 w-full lg:flex-1 flex flex-col">
          <div className="px-3 py-2 border-b-2 flex items-center gap-2" style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}>
            <span className="text-xs font-bold" style={{ color: "var(--color-purple)" }}>SQL</span>
          </div>
          <textarea
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleExecute(); }}
            placeholder="SELECT * FROM ..."
            className="flex-1 w-full p-4 text-sm font-mono outline-none resize-none min-h-[200px]"
            style={{ backgroundColor: "var(--color-card-alt)", color: "var(--color-text-heading)" }}
          />
        </div>

        {/* Right: Result */}
        <div
          className="shrink-0 flex flex-col border-t-2 lg:border-t-0 lg:border-l-2 w-full lg:w-[35%] h-[220px] lg:h-auto"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="px-3 py-2 border-b-2 flex items-center gap-2" style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}>
            <span className="text-xs font-bold" style={{ color: "var(--color-text-muted)" }}>実行結果</span>
          </div>
          <div className="flex-1 overflow-auto p-3" style={{ backgroundColor: "var(--color-page)" }}>
            {loading && (
              <div className="flex items-center justify-center h-full text-sm" style={{ color: "var(--color-text-muted)" }}>
                実行中...
              </div>
            )}
            {error && (
              <div className="p-3 rounded-xl text-xs" style={{ backgroundColor: "var(--color-red-bg)", color: "var(--color-red)" }}>
                ❌ {error}
              </div>
            )}
            {result && (
              <div className="overflow-x-auto rounded-xl" style={{ border: "2px solid var(--color-border)" }}>
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ backgroundColor: "var(--color-card)" }}>
                      {result.columns.map((col, ci) => (
                        <th key={ci} className="px-2 py-1.5 text-left font-bold border-b-2" style={{ borderColor: "var(--color-border)", color: "var(--color-text-heading)" }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row, ri) => (
                      <tr key={ri}>
                        {row.map((val, ci) => (
                          <td key={ci} className="px-2 py-1 border-b" style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}>{val === null ? "NULL" : String(val)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!loading && !error && !result && (
              <div className="flex items-center justify-center h-full text-sm font-semibold" style={{ color: "var(--color-text-muted)" }}>
                [▶ 実行] または Ctrl+Enter で結果が表示されます
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div
        className="flex items-center gap-3 px-5 py-3 border-t-2 shrink-0"
        style={{ backgroundColor: "var(--color-page)", borderColor: "var(--color-border)" }}
      >
        <button
          onClick={handleExecute}
          disabled={loading || sql.trim() === ""}
          className="btn-3d btn-3d-purple px-5 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "実行中..." : "▶ SQL実行"}
        </button>
        <span className="text-xs" style={{ color: "var(--color-text-disabled)" }}>Ctrl+Enter</span>
        {onNext && (
          <div className="ml-auto">
            <button onClick={onNext} className="btn-3d btn-3d-blue px-6 py-2 text-sm">
              次へ →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
