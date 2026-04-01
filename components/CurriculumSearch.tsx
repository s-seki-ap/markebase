"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface SearchableModule {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  moduleId: string;
  moduleName: string;
  difficulty: string;
  estimatedMinutes: number;
  available: boolean;
}

interface CurriculumSearchProps {
  modules: SearchableModule[];
}

export default function CurriculumSearch({ modules }: CurriculumSearchProps) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return modules.filter(
      (m) =>
        m.moduleName.toLowerCase().includes(q) ||
        m.categoryName.toLowerCase().includes(q)
    ).slice(0, 20);
  }, [query, modules]);

  return (
    <div className="relative mb-8">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="モジュール名やカテゴリで検索..."
        className="w-full px-5 py-3 rounded-xl text-sm text-white placeholder-slate-500"
        style={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
      />

      {results.length > 0 && (
        <div
          className="absolute z-10 top-full left-0 right-0 mt-2 rounded-xl overflow-hidden shadow-xl max-h-[400px] overflow-y-auto"
          style={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
        >
          {results.map((m) => (
            <Link
              key={`${m.categoryId}--${m.moduleId}`}
              href={m.available ? `/curriculum/${m.categoryId}/${m.moduleId}` : `/curriculum/${m.categoryId}`}
              className="flex items-center justify-between px-5 py-3 border-b last:border-b-0 transition-colors hover:bg-slate-700/30"
              style={{ borderColor: "#334155" }}
              onClick={() => setQuery("")}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span>{m.categoryIcon}</span>
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">{m.moduleName}</p>
                  <p className="text-xs text-slate-500">{m.categoryName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-slate-500">{m.estimatedMinutes}分</span>
                {!m.available && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#334155", color: "#64748b" }}>
                    未公開
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {query.trim() && results.length === 0 && (
        <div
          className="absolute z-10 top-full left-0 right-0 mt-2 px-5 py-4 rounded-xl text-sm text-slate-500 text-center"
          style={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
        >
          「{query}」に一致するモジュールが見つかりません
        </div>
      )}
    </div>
  );
}
