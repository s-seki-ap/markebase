import { getCategories, isModuleAvailable } from "@/lib/curriculum";
import Link from "next/link";

export default function CurriculumPage() {
  const categories = getCategories();
  const totalModules = categories.reduce((s, c) => s + c.modules.length, 0);

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
        <p className="text-slate-400 mb-3">
          デジタルマーケターに必要なスキルを体系的に学べる{categories.length}カテゴリ・{totalModules}モジュール
        </p>
        <Link
          href="/why-learn"
          className="inline-flex items-center gap-1 text-sm mb-10 transition-colors hover:opacity-80"
          style={{ color: "#3b82f6" }}
        >
          なぜ体系的に学ぶ必要があるのか？ →
        </Link>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((category) => {
            const publishedCount = category.modules.filter((m) =>
              isModuleAvailable(category.id, m.id)
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
                  <span className="text-slate-500 text-xs">
                    公開 {publishedCount} / {category.modules.length}
                  </span>
                </div>

                {/* Color bar */}
                <div className="mt-4 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "#334155" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: category.color,
                      width: `${Math.max((publishedCount / category.modules.length) * 100, 0)}%`,
                      opacity: publishedCount > 0 ? 1 : 0,
                    }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
