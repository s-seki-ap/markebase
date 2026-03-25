import { getCategories } from "@/lib/curriculum";
import Link from "next/link";

const AVAILABLE_LESSONS = ["html--1-1", "ga4--5-1"];

export default function CurriculumPage() {
  const categories = getCategories();

  return (
    <main className="min-h-screen p-8" style={{ backgroundColor: "#0f172a" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            ← ダッシュボード
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">カリキュラムマップ</h1>
        <p className="text-slate-400 mb-10">
          デジタルマーケターに必要なスキルを体系的に学べる8つのカテゴリ
        </p>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((category) => {
            const availableCount = category.modules.filter((m) =>
              AVAILABLE_LESSONS.includes(`${category.id}--${m.id}`)
            ).length;

            return (
              <Link
                key={category.id}
                href={`/curriculum/${category.id}`}
                className="group block p-5 rounded-xl border transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: "#1e293b",
                  borderColor: "#334155",
                }}
              >
                {/* Icon */}
                <div className="text-3xl mb-3">{category.icon}</div>

                {/* Name */}
                <h2 className="text-white font-semibold mb-1 text-sm leading-snug">
                  {category.name}
                </h2>

                {/* Description */}
                <p className="text-slate-400 text-xs mb-4 leading-relaxed line-clamp-2">
                  {category.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs">
                    {category.modules.length} モジュール
                  </span>
                  {availableCount > 0 && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: "#10b98133", color: "#10b981" }}
                    >
                      教材あり
                    </span>
                  )}
                </div>

                {/* Color bar */}
                <div
                  className="mt-4 h-1 rounded-full opacity-60"
                  style={{ backgroundColor: category.color }}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
