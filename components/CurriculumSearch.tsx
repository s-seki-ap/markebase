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
        placeholder="🔍 モジュール名やカテゴリで検索..."
        className="w-full px-5 py-4 rounded-2xl text-sm font-semibold"
        style={{ backgroundColor: "var(--color-card)", border: "2px solid var(--color-border)", color: "var(--color-text-heading)" }}
      />

      {results.length > 0 && (
        <div
          className="absolute z-10 top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden max-h-[400px] overflow-y-auto"
          style={{ backgroundColor: "var(--color-card)", border: "2px solid var(--color-border)", boxShadow: "var(--color-card-shadow)" }}
        >
          {results.map((m) => (
            <Link
              key={`${m.categoryId}--${m.moduleId}`}
              href={m.available ? `/curriculum/${m.categoryId}/${m.moduleId}` : `/curriculum/${m.categoryId}`}
              className="flex items-center justify-between px-5 py-3 border-b-2 last:border-b-0 transition-all hover:scale-[1.01]"
              style={{ borderColor: "var(--color-border)" }}
              onClick={() => setQuery("")}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-lg">{m.categoryIcon}</span>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: "var(--color-text-heading)" }}>{m.moduleName}</p>
                  <p className="text-xs font-semibold" style={{ color: "var(--color-text-disabled)" }}>{m.categoryName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold" style={{ color: "var(--color-text-disabled)" }}>{m.estimatedMinutes}分</span>
                {!m.available && (
                  <span className="text-xs px-3 py-1 rounded-full font-bold" style={{ backgroundColor: "var(--color-border)", color: "var(--color-text-disabled)" }}>
                    🔒 未公開
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {query.trim() && results.length === 0 && (
        <div
          className="absolute z-10 top-full left-0 right-0 mt-2 px-5 py-4 rounded-2xl text-sm text-center font-semibold"
          style={{ backgroundColor: "var(--color-card)", border: "2px solid var(--color-border)", color: "var(--color-text-disabled)" }}
        >
          「{query}」に一致するモジュールが見つかりません
        </div>
      )}
    </div>
  );
}
