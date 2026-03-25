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
    <main className="min-h-screen p-8" style={{ backgroundColor: "#0f172a" }}>
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-8">
          <Link href="/" className="hover:text-white transition-colors">ダッシュボード</Link>
          <span>/</span>
          <Link href="/curriculum" className="hover:text-white transition-colors">カリキュラム</Link>
          <span>/</span>
          <span className="text-white">{category.name}</span>
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
            <h1 className="text-2xl font-bold text-white">{category.name}</h1>
            <p className="text-slate-400 text-sm mt-1">{category.description}</p>
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
                className="flex items-center gap-4 p-4 rounded-xl border transition-all hover:border-slate-500"
                style={{ backgroundColor: "#1e293b", borderColor: "#334155" }}
              >
                <span className="text-slate-500 text-sm font-mono w-8 shrink-0">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{module.name}</p>
                  <p className="text-slate-500 text-xs mt-0.5 truncate">{module.description}</p>
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
                  <span className="text-slate-500 text-xs">{module.estimatedMinutes}分</span>
                  <span className="text-slate-400 text-sm">→</span>
                </div>
              </Link>
            ) : (
              <div
                key={module.id}
                className="flex items-center gap-4 p-4 rounded-xl border opacity-40 cursor-not-allowed"
                style={{ backgroundColor: "#1e293b", borderColor: "#334155" }}
              >
                <span className="text-slate-500 text-sm font-mono w-8 shrink-0">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-400 text-sm font-medium">{module.name}</p>
                  <p className="text-slate-600 text-xs mt-0.5 truncate">{module.description}</p>
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
                  <span className="text-slate-500 text-xs">{module.estimatedMinutes}分</span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "#334155", color: "#64748b" }}
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
