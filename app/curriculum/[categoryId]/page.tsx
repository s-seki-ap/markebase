import { getCategories, isModuleAvailable } from "@/lib/curriculum";
import Link from "next/link";
import { notFound } from "next/navigation";

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: "入門",
  intermediate: "中級",
  advanced: "上級",
};

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner: "#10b981",
  intermediate: "#f59e0b",
  advanced: "#ef4444",
};

export default function CategoryPage({
  params,
}: {
  params: { categoryId: string };
}) {
  const categories = getCategories();
  const category = categories.find((c) => c.id === params.categoryId);

  if (!category) notFound();

  return (
    <main className="min-h-screen p-8" style={{ backgroundColor: "var(--color-page)" }}>
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>
          <Link href="/" className="hover:opacity-80 transition-opacity">ダッシュボード</Link>
          <span>/</span>
          <Link href="/curriculum" className="hover:opacity-80 transition-opacity">カリキュラム</Link>
          <span>/</span>
          <span style={{ color: "var(--color-text-heading)" }}>{category.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
            style={{ backgroundColor: `${category.color}22` }}
          >
            {category.icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-heading)" }}>{category.name}</h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>{category.description}</p>
          </div>
        </div>

        {/* Module list */}
        <div className="space-y-2">
          {category.modules.map((module, index) => {
            const available = isModuleAvailable(category.id, module.id);

            return available ? (
              <Link
                key={module.id}
                href={`/curriculum/${category.id}/${module.id}`}
                className="flex items-center gap-4 p-4 rounded-xl border transition-all hover:opacity-90"
                style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--color-card-shadow)" }}
              >
                <span className="text-sm font-mono w-8 shrink-0" style={{ color: "var(--color-text-disabled)" }}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: "var(--color-text-heading)" }}>{module.name}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: "var(--color-text-disabled)" }}>{module.description}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${DIFFICULTY_COLOR[module.difficulty]}22`,
                      color: DIFFICULTY_COLOR[module.difficulty],
                    }}
                  >
                    {DIFFICULTY_LABEL[module.difficulty]}
                  </span>
                  <span className="text-xs" style={{ color: "var(--color-text-disabled)" }}>{module.estimatedMinutes}分</span>
                  <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>→</span>
                </div>
              </Link>
            ) : (
              <div
                key={module.id}
                className="flex items-center gap-4 p-4 rounded-xl border opacity-40 cursor-not-allowed"
                style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}
              >
                <span className="text-sm font-mono w-8 shrink-0" style={{ color: "var(--color-text-disabled)" }}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>{module.name}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: "var(--color-text-disabled)" }}>{module.description}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${DIFFICULTY_COLOR[module.difficulty]}22`,
                      color: DIFFICULTY_COLOR[module.difficulty],
                    }}
                  >
                    {DIFFICULTY_LABEL[module.difficulty]}
                  </span>
                  <span className="text-xs" style={{ color: "var(--color-text-disabled)" }}>{module.estimatedMinutes}分</span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "var(--color-border)", color: "var(--color-text-disabled)" }}
                  >
                    準備中
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
