import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getUser, getUserProgress } from "@/lib/progress";
import { getUserBadges } from "@/lib/badges";
import { getCategories, isModuleAvailable } from "@/lib/curriculum";
import LearningMap from "@/components/LearningMap";
import BadgeShowcase from "@/components/BadgeShowcase";

const isDevBypass =
  process.env.NODE_ENV !== "production" && !process.env.GOOGLE_CLIENT_ID;

function isAdmin(email: string | null | undefined): boolean {
  if (isDevBypass) return true;
  if (!email) return false;
  const adminEmails = process.env.ADMIN_EMAILS ?? "";
  const allowed = adminEmails.split(",").map((e) => e.trim()).filter(Boolean);
  return allowed.some((a) => {
    if (a.startsWith("@")) return email.endsWith(a);
    return email === a;
  });
}

function formatDate(ts: FirebaseFirestore.Timestamp | undefined): string {
  if (!ts) return "-";
  const d = ts.toDate();
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

export default async function MemberDetailPage({
  params,
}: {
  params: { userId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session && !isDevBypass) redirect("/auth/signin");
  if (!isAdmin(session?.user?.email)) redirect("/");

  const userId = decodeURIComponent(params.userId);

  const [user, progress, earnedBadgeIds] = await Promise.all([
    getUser(userId),
    getUserProgress(userId),
    getUserBadges(userId),
  ]);

  if (!user) notFound();

  const categories = getCategories();

  // Build progress info map
  const progressMap: Record<
    string,
    { completed: boolean; quizScore: number | null; completedAt?: Date }
  > = {};
  for (const [key, p] of Object.entries(progress)) {
    progressMap[key] = {
      completed: true,
      quizScore: p.quizScore,
      completedAt: p.completedAt?.toDate?.() ?? undefined,
    };
  }

  // Build availability map
  const availableMap: Record<string, boolean> = {};
  for (const cat of categories) {
    for (const mod of cat.modules) {
      availableMap[`${cat.id}--${mod.id}`] = isModuleAvailable(cat.id, mod.id);
    }
  }

  // History: sorted by completedAt desc
  const history = Object.entries(progress)
    .map(([key, p]) => {
      const [catId, modId] = key.split("--");
      const category = categories.find((c) => c.id === catId);
      const moduleDef = category?.modules.find((m) => m.id === modId);
      return {
        key,
        categoryId: catId,
        moduleId: modId,
        categoryName: category?.name ?? catId,
        categoryColor: category?.color ?? "#999",
        categoryIcon: category?.icon ?? "📚",
        moduleName: moduleDef?.name ?? modId,
        quizScore: p.quizScore,
        completedAt: p.completedAt,
      };
    })
    .sort((a, b) => {
      const ta = a.completedAt?.toDate?.().getTime() ?? 0;
      const tb = b.completedAt?.toDate?.().getTime() ?? 0;
      return tb - ta;
    });

  // Quiz stats
  const quizProgress = history.filter((h) => h.quizScore !== null);
  const avgQuizScore =
    quizProgress.length > 0
      ? Math.round(
          quizProgress.reduce((s, h) => s + (h.quizScore ?? 0), 0) /
            quizProgress.length
        )
      : null;
  const correctCount = quizProgress.filter((h) => (h.quizScore ?? 0) >= 80).length;

  return (
    <main className="min-h-screen p-6 lg:p-8 pb-24 lg:pb-8" style={{ backgroundColor: "var(--color-page)" }}>
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6 font-semibold" style={{ color: "var(--color-text-muted)" }}>
          <Link href="/admin" className="hover:scale-105 transition-all">
            &larr; チーム一覧
          </Link>
          <span>/</span>
          <span style={{ color: "var(--color-text-heading)" }}>{user.name}</span>
        </div>

        {/* Profile Header */}
        <div className="clay-card p-6 mb-6 flex flex-col lg:flex-row lg:items-center gap-6">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-extrabold shrink-0"
            style={{
              background: "linear-gradient(145deg, #5fd97e, #42b860)",
              color: "#ffffff",
              boxShadow: "var(--clay-raised)",
            }}
          >
            {user.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl lg:text-3xl font-extrabold" style={{ color: "var(--color-text-heading)" }}>
              {user.name}
            </h1>
            <p className="text-sm font-semibold mt-1 truncate" style={{ color: "var(--color-text-muted)" }}>
              {user.email}
              {user.department && ` · ${user.department}`}
            </p>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span
                className="text-xs px-3 py-1 rounded-full font-extrabold"
                style={{ backgroundColor: "var(--color-green-bg)", color: "var(--color-green)", border: "2px solid var(--color-green)" }}
              >
                Lv. {user.level}
              </span>
              <span
                className="text-xs px-3 py-1 rounded-full font-extrabold"
                style={{ backgroundColor: "var(--color-yellow-bg)", color: "var(--color-yellow)", border: "2px solid var(--color-yellow)" }}
              >
                ⭐ {user.xp.toLocaleString()} XP
              </span>
              {user.streak > 0 && (
                <span
                  className="text-xs px-3 py-1 rounded-full font-extrabold"
                  style={{ backgroundColor: "var(--color-orange-bg)", color: "var(--color-orange)", border: "2px solid var(--color-orange)" }}
                >
                  {user.streak >= 7 ? "🔥" : "⭐"} {user.streak}日連続
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
          <div className="p-4 clay-card">
            <p className="text-xs mb-1 font-semibold" style={{ color: "var(--color-text-muted)" }}>完了モジュール</p>
            <p className="text-2xl lg:text-3xl font-extrabold" style={{ color: "var(--color-text-heading)" }}>
              {user.completedCount ?? history.length}
            </p>
          </div>
          <div className="p-4 clay-card">
            <p className="text-xs mb-1 font-semibold" style={{ color: "var(--color-text-muted)" }}>クイズ平均</p>
            <p className="text-2xl lg:text-3xl font-extrabold" style={{ color: "var(--color-blue)" }}>
              {avgQuizScore !== null ? `${avgQuizScore}点` : "-"}
            </p>
          </div>
          <div className="p-4 clay-card">
            <p className="text-xs mb-1 font-semibold" style={{ color: "var(--color-text-muted)" }}>高得点数</p>
            <p className="text-2xl lg:text-3xl font-extrabold" style={{ color: "var(--color-green)" }}>
              {correctCount}
              <span className="text-xs font-normal ml-1" style={{ color: "var(--color-text-disabled)" }}>
                / {quizProgress.length}
              </span>
            </p>
          </div>
          <div className="p-4 clay-card">
            <p className="text-xs mb-1 font-semibold" style={{ color: "var(--color-text-muted)" }}>獲得バッジ</p>
            <p className="text-2xl lg:text-3xl font-extrabold" style={{ color: "var(--color-purple)" }}>
              {earnedBadgeIds.length}
            </p>
          </div>
        </div>

        {/* Learning map */}
        <div className="mb-6">
          <h2 className="text-lg font-extrabold mb-3" style={{ color: "var(--color-text-heading)" }}>
            🗺️ 学習マップ
          </h2>
          <p className="text-xs mb-4 font-semibold" style={{ color: "var(--color-text-muted)" }}>
            カテゴリごとのモジュール進捗。クリアしたノードにはクイズ結果を表示。
          </p>
          <LearningMap
            categories={categories}
            progressMap={progressMap}
            availableMap={availableMap}
          />
        </div>

        {/* Badges */}
        <div className="p-5 clay-card mb-6">
          <BadgeShowcase earnedBadgeIds={earnedBadgeIds} />
        </div>

        {/* History timeline */}
        {history.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-extrabold mb-3" style={{ color: "var(--color-text-heading)" }}>
              📜 学習履歴
            </h2>
            <div className="clay-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: "var(--color-page)" }}>
                    <th className="text-left font-bold px-4 py-3" style={{ color: "var(--color-text-muted)" }}>完了日</th>
                    <th className="text-left font-bold px-4 py-3" style={{ color: "var(--color-text-muted)" }}>カテゴリ</th>
                    <th className="text-left font-bold px-4 py-3" style={{ color: "var(--color-text-muted)" }}>モジュール</th>
                    <th className="text-right font-bold px-4 py-3" style={{ color: "var(--color-text-muted)" }}>クイズ</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => {
                    const score = h.quizScore;
                    const scoreColor =
                      score === null
                        ? "var(--color-text-disabled)"
                        : score >= 80
                          ? "var(--color-green)"
                          : score >= 60
                            ? "var(--color-yellow)"
                            : "var(--color-red)";
                    return (
                      <tr key={h.key} className="border-t-2" style={{ borderColor: "var(--color-border)" }}>
                        <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{ color: "var(--color-text-muted)" }}>
                          {formatDate(h.completedAt)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-bold"
                            style={{
                              backgroundColor: `${h.categoryColor}22`,
                              color: h.categoryColor,
                              border: `1px solid ${h.categoryColor}`,
                            }}
                          >
                            {h.categoryIcon} {h.categoryName}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold" style={{ color: "var(--color-text-heading)" }}>
                          {h.moduleName}
                        </td>
                        <td className="px-4 py-3 text-right font-extrabold" style={{ color: scoreColor }}>
                          {score !== null ? `${score}点` : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {history.length === 0 && (
          <div className="clay-card p-8 text-center">
            <p className="text-4xl mb-2">📚</p>
            <p className="text-sm font-bold" style={{ color: "var(--color-text-muted)" }}>
              まだモジュールを完了していません
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
