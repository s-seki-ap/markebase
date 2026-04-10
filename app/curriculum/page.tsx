import { getCategories, isModuleAvailable } from "@/lib/curriculum";
import Link from "next/link";
import CurriculumSearch from "@/components/CurriculumSearch";

export default function CurriculumPage() {
  const categories = getCategories();
  const totalModules = categories.reduce((s, c) => s + c.modules.length, 0);

  const searchableModules = categories.flatMap((cat) =>
    cat.modules.map((mod) => ({
      categoryId: cat.id,
      categoryName: cat.name,
      categoryIcon: cat.icon,
      categoryColor: cat.color,
      moduleId: mod.id,
      moduleName: mod.name,
      difficulty: mod.difficulty,
      estimatedMinutes: mod.estimatedMinutes,
      available: isModuleAvailable(cat.id, mod.id),
    }))
  );

  return (
    <main className="min-h-screen p-6 lg:p-8" style={{ backgroundColor: "var(--color-page)" }}>
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8 font-semibold" style={{ color: "var(--color-text-muted)" }}>
          <Link href="/" className="hover:scale-105 transition-all">ダッシュボード</Link>
          <span>/</span>
          <span style={{ color: "var(--color-text-heading)" }}>カリキュラム</span>
        </div>

        <h1 className="text-3xl lg:text-4xl font-extrabold mb-2" style={{ color: "var(--color-text-heading)" }}>
          📚 カリキュラムマップ
        </h1>
        <p className="mb-3 text-base" style={{ color: "var(--color-text-muted)" }}>
          {categories.length}カテゴリ・{totalModules}モジュールで体系的に学ぼう！
        </p>
        <Link
          href="/why-learn"
          className="inline-flex items-center gap-1 text-sm font-bold mb-6 transition-all hover:scale-105"
          style={{ color: "var(--color-blue)" }}
        >
          なぜ体系的に学ぶ必要があるのか？ &rarr;
        </Link>

        {/* Search */}
        <CurriculumSearch modules={searchableModules} />

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {categories.map((category) => {
            const publishedCount = category.modules.filter((m) =>
              isModuleAvailable(category.id, m.id)
            ).length;

            return (
              <Link
                key={category.id}
                href={`/curriculum/${category.id}`}
                className="group block p-5 clay-card transition-all duration-200 hover:scale-[1.03] hover:shadow-lg"
              >
                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  {category.icon}
                </div>

                {/* Name */}
                <h2 className="font-bold mb-1 text-sm leading-snug" style={{ color: "var(--color-text-heading)" }}>
                  {category.name}
                </h2>

                {/* Description */}
                <p className="text-xs mb-4 leading-relaxed line-clamp-2" style={{ color: "var(--color-text-muted)" }}>
                  {category.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs px-3 py-1 rounded-full font-bold"
                    style={{ backgroundColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
                  >
                    {category.modules.length} モジュール
                  </span>
                  <span className="text-xs font-bold" style={{ color: "var(--color-text-disabled)" }}>
                    公開 {publishedCount}
                  </span>
                </div>

                {/* Color bar */}
                <div className="mt-4 h-3 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-border)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
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
