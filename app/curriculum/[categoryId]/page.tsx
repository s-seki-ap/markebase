import { getCategories, isModuleAvailable } from "@/lib/curriculum";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserProgress } from "@/lib/progress";
import Link from "next/link";
import { notFound } from "next/navigation";

const isDevBypass = !process.env.GOOGLE_CLIENT_ID;

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: "入門",
  intermediate: "中級",
  advanced: "上級",
};

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner: "#58CC02",
  intermediate: "#FF9600",
  advanced: "#FF4B4B",
};

export default async function CategoryPage({
  params,
}: {
  params: { categoryId: string };
}) {
  const categories = getCategories();
  const category = categories.find((c) => c.id === params.categoryId);

  if (!category) notFound();

  // Fetch user progress for completed badges
  let completedModules = new Set<string>();
  try {
    const session = await getServerSession(authOptions);
    const userId = isDevBypass ? "dev-user" : session?.user?.email ?? null;
    if (userId) {
      const progress = await getUserProgress(userId);
      completedModules = new Set(Object.keys(progress));
    }
  } catch {
    // Firestore未接続時は空
  }

  return (
    <main className="min-h-screen p-6 lg:p-8" style={{ backgroundColor: "var(--color-page)" }}>
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8 font-semibold" style={{ color: "var(--color-text-muted)" }}>
          <Link href="/" className="hover:scale-105 transition-all">ダッシュボード</Link>
          <span>/</span>
          <Link href="/curriculum" className="hover:scale-105 transition-all">カリキュラム</Link>
          <span>/</span>
          <span style={{ color: "var(--color-text-heading)" }}>{category.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
            style={{ backgroundColor: `${category.color}25`, border: `2px solid ${category.color}` }}
          >
            {category.icon}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color: "var(--color-text-heading)" }}>{category.name}</h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>{category.description}</p>
          </div>
        </div>

        {/* Progress summary */}
        {(() => {
          const availableModules = category.modules.filter((m) => isModuleAvailable(category.id, m.id));
          const completedInCat = availableModules.filter((m) => completedModules.has(`${category.id}--${m.id}`)).length;
          return completedInCat > 0 || availableModules.length > 0 ? (
            <div className="mb-6 p-4 rounded-2xl flex items-center gap-4" style={{ backgroundColor: "var(--color-card)", boxShadow: "var(--color-card-shadow)" }}>
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: "var(--color-text-heading)" }}>
                  {completedInCat}/{availableModules.length} モジュール完了
                </p>
                <div className="mt-2 h-3 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-border)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      backgroundColor: "var(--color-green)",
                      width: availableModules.length > 0 ? `${(completedInCat / availableModules.length) * 100}%` : "0%",
                    }}
                  />
                </div>
              </div>
              {completedInCat === availableModules.length && availableModules.length > 0 && (
                <span className="text-2xl">🏆</span>
              )}
            </div>
          ) : null;
        })()}

        {/* Module list */}
        <div className="space-y-3">
          {category.modules.map((module, index) => {
            const available = isModuleAvailable(category.id, module.id);
            const isCompleted = completedModules.has(`${category.id}--${module.id}`);

            return available ? (
              <Link
                key={module.id}
                href={`/curriculum/${category.id}/${module.id}`}
                className="flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-200 hover:scale-[1.01]"
                style={{
                  backgroundColor: "var(--color-card)",
                  borderColor: isCompleted ? "var(--color-green)" : "var(--color-border)",
                  boxShadow: "var(--color-card-shadow)",
                }}
              >
                <span
                  className="text-sm font-mono w-8 h-8 rounded-full flex items-center justify-center font-extrabold shrink-0"
                  style={{
                    backgroundColor: isCompleted ? "var(--color-green)" : "var(--color-border)",
                    color: isCompleted ? "#ffffff" : "var(--color-text-secondary)",
                  }}
                >
                  {isCompleted ? "✓" : String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: "var(--color-text-heading)" }}>{module.name}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: "var(--color-text-muted)" }}>{module.description}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className="text-xs px-3 py-1 rounded-full font-bold"
                    style={{
                      backgroundColor: `${DIFFICULTY_COLOR[module.difficulty]}22`,
                      color: DIFFICULTY_COLOR[module.difficulty],
                      border: `2px solid ${DIFFICULTY_COLOR[module.difficulty]}`,
                    }}
                  >
                    {DIFFICULTY_LABEL[module.difficulty]}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: "var(--color-text-disabled)" }}>{module.estimatedMinutes}分</span>
                  {isCompleted ? (
                    <span
                      className="text-xs px-3 py-1 rounded-full font-bold"
                      style={{ backgroundColor: "var(--color-green-bg)", color: "var(--color-green)", border: "2px solid var(--color-green)" }}
                    >
                      完了
                    </span>
                  ) : (
                    <span className="text-lg font-bold" style={{ color: "var(--color-blue)" }}>→</span>
                  )}
                </div>
              </Link>
            ) : (
              <div
                key={module.id}
                className="flex items-center gap-4 p-5 rounded-2xl border-2 opacity-40 cursor-not-allowed"
                style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}
              >
                <span
                  className="text-sm font-mono w-8 h-8 rounded-full flex items-center justify-center font-extrabold shrink-0"
                  style={{ backgroundColor: "var(--color-border)", color: "var(--color-text-disabled)" }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: "var(--color-text-muted)" }}>{module.name}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: "var(--color-text-disabled)" }}>{module.description}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className="text-xs px-3 py-1 rounded-full font-bold"
                    style={{
                      backgroundColor: `${DIFFICULTY_COLOR[module.difficulty]}22`,
                      color: DIFFICULTY_COLOR[module.difficulty],
                    }}
                  >
                    {DIFFICULTY_LABEL[module.difficulty]}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: "var(--color-text-disabled)" }}>{module.estimatedMinutes}分</span>
                  <span
                    className="text-xs px-3 py-1 rounded-full font-bold"
                    style={{ backgroundColor: "var(--color-border)", color: "var(--color-text-disabled)" }}
                  >
                    🔒 準備中
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
