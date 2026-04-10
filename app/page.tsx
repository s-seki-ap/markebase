import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getUser, getUserProgress, getWeeklyCompletedCount, getRecentModules, getLeaderboard, getTotalLearnerCount } from "@/lib/progress";
import { getUserBadges } from "@/lib/badges";
import { getCategories, isModuleAvailable } from "@/lib/curriculum";
import SkillRadar from "@/components/SkillRadar";
import BadgeShowcase from "@/components/BadgeShowcase";
import ThemeToggle from "@/components/ThemeToggle";

const isDevBypass =
  process.env.NODE_ENV !== "production" && !process.env.GOOGLE_CLIENT_ID;
const TOTAL_MODULES = 47;
const WEEKLY_GOAL = 3;

function getUserId(session: { user?: { email?: string | null } } | null): string | null {
  if (isDevBypass) return "dev-user";
  return session?.user?.email ?? null;
}

function resolveModuleName(
  moduleKey: string,
  categoryMap: Map<string, Map<string, string>>
): string {
  const [catId, modId] = moduleKey.split("--");
  return categoryMap.get(catId)?.get(modId) ?? moduleKey;
}

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session && !isDevBypass) {
    redirect("/auth/signin");
  }

  const userId = getUserId(session);
  const userName = session?.user?.name ?? "ゲスト";
  const userImage = session?.user?.image ?? null;

  let user: Awaited<ReturnType<typeof getUser>> = null;
  let completedCount = 0;
  let weeklyCount = 0;
  let recentModules: Array<{ id: string; completedAt: FirebaseFirestore.Timestamp }> = [];
  let progress: Record<string, { completedAt: FirebaseFirestore.Timestamp; quizScore: number | null; xpEarned: number }> = {};
  let earnedBadgeIds: string[] = [];

  try {
    user = userId ? await getUser(userId) : null;
  } catch {
    // Firestore未接続時はnull
  }

  if (userId && !user && !isDevBypass) {
    redirect("/onboarding");
  }

  if (userId && user) {
    try {
      const [prog, weekly, recent] = await Promise.all([
        getUserProgress(userId),
        getWeeklyCompletedCount(userId),
        getRecentModules(userId, 5),
      ]);
      progress = prog;
      completedCount = Object.keys(progress).length;
      weeklyCount = weekly;
      recentModules = recent;
      earnedBadgeIds = await getUserBadges(userId);
    } catch {
      // Firestore未接続時はデフォルト値
    }
  }

  const xp = user?.xp ?? 0;
  const level = user?.level ?? 1;
  const streak = user?.streak ?? 0;

  let topMembers: Array<{ name: string; xp: number; level: number; completedCount: number }> = [];
  let totalLearners = 0;
  try {
    const [lb, learnerCount] = await Promise.all([
      getLeaderboard(),
      getTotalLearnerCount(),
    ]);
    topMembers = lb.slice(0, 5).map((e) => ({
      name: e.name,
      xp: e.xp,
      level: e.level,
      completedCount: e.completedCount,
    }));
    totalLearners = learnerCount;
  } catch {
    // Firestore未設定時は空
  }

  const categories = getCategories();
  const categoryMap = new Map<string, Map<string, string>>();
  for (const cat of categories) {
    const modMap = new Map<string, string>();
    for (const mod of cat.modules) {
      modMap.set(mod.id, mod.name);
    }
    categoryMap.set(cat.id, modMap);
  }

  const skillData = categories
    .filter((cat) => cat.modules.some((m) => isModuleAvailable(cat.id, m.id)))
    .map((cat) => {
      const availableCount = cat.modules.filter((m) => isModuleAvailable(cat.id, m.id)).length;
      const completedInCat = Object.keys(progress).filter((key) => key.startsWith(`${cat.id}--`)).length;
      return {
        category: cat.name.replace(/[・&]/g, "\n").split("\n")[0],
        value: availableCount > 0 ? Math.round((completedInCat / availableCount) * 100) : 0,
        fullMark: 100,
      };
    });

  const levelThresholds = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250];
  const currentThreshold = levelThresholds[level - 1] ?? 0;
  const nextThreshold = levelThresholds[level] ?? currentThreshold + 500;
  const levelProgress = nextThreshold > currentThreshold
    ? Math.min(((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100, 100)
    : 100;

  return (
    <main className="min-h-screen p-6 lg:p-8 pb-24 lg:pb-8" style={{ backgroundColor: "var(--color-page)" }}>
      <div className="max-w-6xl mx-auto">
        {/* Mobile header (logo + avatar) — lg では sidebar が担うので非表示 */}
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-extrabold"
              style={{ background: "linear-gradient(145deg, #5fd97e, #42b860)", color: "#ffffff", boxShadow: "var(--clay-raised)" }}
            >
              M
            </div>
            <span className="text-lg font-extrabold" style={{ color: "var(--color-text-heading)" }}>MarkeBase</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {userImage ? (
              <Image
                src={userImage}
                alt="avatar"
                width={36}
                height={36}
                className="w-9 h-9 rounded-full"
                style={{ border: "2px solid var(--color-green)" }}
              />
            ) : (
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: "var(--color-green)", color: "#ffffff" }}
              >
                {userName[0]}
              </div>
            )}
          </div>
        </div>

        {/* Welcome row — lg では右にアバター、左にCTA含むタイトル */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl lg:text-3xl font-extrabold" style={{ color: "var(--color-text-heading)" }}>
                おかえり、{userName.split(" ")[0]}さん！
              </h1>
              {streak > 0 && (
                <span
                  className="text-xs px-3 py-1 rounded-full font-bold whitespace-nowrap"
                  style={{ backgroundColor: "var(--color-orange-bg)", color: "var(--color-orange)", border: "2px solid var(--color-orange)" }}
                >
                  {streak >= 7 ? "\uD83D\uDD25" : "\u2B50"} {streak}日連続
                </span>
              )}
            </div>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
              {weeklyCount >= WEEKLY_GOAL
                ? "🎉 今週の目標達成！次の目標にチャレンジしよう！"
                : totalLearners > 0
                  ? `👥 ${totalLearners}名が学習中 — 今日も1モジュール進めよう`
                  : "今日も1モジュール進めてみよう 💪"}
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/quest"
              className="btn-3d btn-3d-green inline-flex items-center gap-2 px-5 py-2.5 text-sm"
            >
              🗺️ クエストを進める
            </Link>
            {userImage ? (
              <Image
                src={userImage}
                alt="avatar"
                width={44}
                height={44}
                className="w-11 h-11 rounded-full"
                style={{ border: "2px solid var(--color-green)" }}
              />
            ) : (
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold"
                style={{ backgroundColor: "var(--color-green)", color: "#ffffff" }}
              >
                {userName[0]}
              </div>
            )}
          </div>
        </div>

        {/* Mobile CTA row (lg では上に統合済み) */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 lg:hidden">
          <Link
            href="/quest"
            className="btn-3d btn-3d-green inline-flex items-center gap-2 px-6 py-3 text-base"
          >
            🗺️ クエストを進める
          </Link>
          <Link
            href="/curriculum"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-200 hover:scale-[1.02]"
            style={{ backgroundColor: "var(--color-card)", color: "var(--color-text-muted)", boxShadow: "var(--color-card-shadow)" }}
          >
            📚 自由に学ぶ
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-200 hover:scale-[1.02]"
            style={{ backgroundColor: "var(--color-card)", color: "var(--color-text-muted)", boxShadow: "var(--color-card-shadow)" }}
          >
            📊 チーム状況
          </Link>
        </div>

        {/* Stats — コンパクトめ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4 lg:mb-5">
          <div className="p-4 clay-card">
            <p className="text-xs mb-1 font-semibold" style={{ color: "var(--color-text-muted)" }}>完了モジュール</p>
            <p className="text-2xl lg:text-3xl font-extrabold" style={{ color: "var(--color-text-heading)" }}>
              {completedCount} <span className="text-xs font-normal" style={{ color: "var(--color-text-disabled)" }}>/ {TOTAL_MODULES}</span>
            </p>
            <div className="mt-2 h-2 rounded-full" style={{ backgroundColor: "var(--color-border)" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  backgroundColor: "var(--color-green)",
                  width: `${Math.min((completedCount / TOTAL_MODULES) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
          <div className="p-4 clay-card">
            <p className="text-xs mb-1 font-semibold" style={{ color: "var(--color-text-muted)" }}>獲得XP</p>
            <p className="text-2xl lg:text-3xl font-extrabold" style={{ color: "var(--color-yellow)" }}>
              <span className="text-base mr-1">⭐</span>{xp}
            </p>
          </div>
          <div className="p-4 clay-card">
            <p className="text-xs mb-1 font-semibold" style={{ color: "var(--color-text-muted)" }}>レベル</p>
            <p className="text-2xl lg:text-3xl font-extrabold" style={{ color: "var(--color-green)" }}>Lv. {level}</p>
            <div className="mt-2 h-2 rounded-full" style={{ backgroundColor: "var(--color-border)" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ backgroundColor: "var(--color-green)", width: `${levelProgress}%` }}
              />
            </div>
          </div>
          <div className="p-4 clay-card">
            <p className="text-xs mb-1 font-semibold" style={{ color: "var(--color-text-muted)" }}>今週の目標</p>
            <p className="text-2xl lg:text-3xl font-extrabold" style={{ color: "var(--color-text-heading)" }}>
              {weeklyCount} <span className="text-xs font-normal" style={{ color: "var(--color-text-disabled)" }}>/ {WEEKLY_GOAL}</span>
            </p>
            <div className="mt-2 flex gap-1.5">
              {Array.from({ length: WEEKLY_GOAL }).map((_, i) => (
                <div
                  key={i}
                  className="h-2 flex-1 rounded-full transition-all duration-300"
                  style={{ backgroundColor: i < weeklyCount ? "var(--color-green)" : "var(--color-border)" }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Main dashboard grid — desktop 3列, モバイル縦積み */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 mb-4 lg:mb-5">
          {/* Skill radar */}
          {skillData.length > 0 && (
            <div className="p-5 clay-card lg:col-span-1">
              <h2 className="text-base font-bold mb-1" style={{ color: "var(--color-text-heading)" }}>🎯 スキルマップ</h2>
              <p className="text-xs mb-2" style={{ color: "var(--color-text-muted)" }}>カテゴリ別の完了率</p>
              <SkillRadar data={skillData} />
            </div>
          )}

          {/* Recent modules */}
          {recentModules.length > 0 && (
            <div className="p-5 clay-card lg:col-span-1">
              <h2 className="text-base font-bold mb-3" style={{ color: "var(--color-text-heading)" }}>📚 最近の学習</h2>
              <div className="space-y-2">
                {recentModules.slice(0, 5).map((mod) => {
                  const [catId, modId] = mod.id.split("--");
                  const moduleName = resolveModuleName(mod.id, categoryMap);
                  return (
                    <Link
                      key={mod.id}
                      href={`/curriculum/${catId}/${modId}`}
                      className="flex items-center gap-2 p-2 rounded-xl transition-all duration-200 hover:scale-[1.01]"
                      style={{ backgroundColor: "var(--color-card-alt)" }}
                    >
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0"
                        style={{ backgroundColor: "var(--color-green-bg)", color: "var(--color-green)" }}
                      >
                        ✓
                      </span>
                      <span className="text-xs font-semibold truncate" style={{ color: "var(--color-text-heading)" }}>{moduleName}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Team leaderboard */}
          {topMembers.length > 0 && (
            <div className="p-5 clay-card lg:col-span-1">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold" style={{ color: "var(--color-text-heading)" }}>🏆 ランキング</h2>
                <Link href="/admin" className="text-xs font-bold transition-opacity hover:opacity-80" style={{ color: "var(--color-blue)" }}>
                  全員 &rarr;
                </Link>
              </div>
              <div className="space-y-1.5">
                {topMembers.map((member, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-2 py-1.5 rounded-lg"
                    style={{ backgroundColor: "var(--color-card-alt)" }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0"
                        style={{
                          backgroundColor: i === 0 ? "var(--color-yellow-bg)" : i === 1 ? "var(--color-blue-bg)" : i === 2 ? "var(--color-orange-bg)" : "transparent",
                          color: i === 0 ? "var(--color-yellow)" : i === 1 ? "var(--color-blue)" : i === 2 ? "var(--color-orange)" : "var(--color-text-disabled)",
                          border: i < 3 ? `2px solid ${i === 0 ? "var(--color-yellow)" : i === 1 ? "var(--color-blue)" : "var(--color-orange)"}` : "none",
                        }}
                      >
                        {i + 1}
                      </span>
                      <span className="text-xs font-bold truncate" style={{ color: "var(--color-text-heading)" }}>{member.name}</span>
                    </div>
                    <span className="text-xs font-extrabold shrink-0 ml-2" style={{ color: "var(--color-yellow)" }}>⭐ {member.xp.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Badges (コンパクト) */}
        <div className="p-5 clay-card">
          <BadgeShowcase earnedBadgeIds={earnedBadgeIds} />
        </div>
      </div>
    </main>
  );
}
