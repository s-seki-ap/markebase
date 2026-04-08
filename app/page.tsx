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
    <main className="min-h-screen p-6 lg:p-8" style={{ backgroundColor: "var(--color-page)" }}>
      <div className="max-w-4xl mx-auto">
        {/* Header — minimal: logo + avatar + theme */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-extrabold"
              style={{ backgroundColor: "var(--color-green)", color: "#ffffff", boxShadow: "0 3px 0 var(--color-green-shadow)" }}
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

        {/* Welcome + streak inline */}
        <div className="mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold" style={{ color: "var(--color-text-heading)" }}>
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

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <Link
            href="/curriculum"
            className="btn-3d btn-3d-green inline-flex items-center gap-2 px-6 py-3 text-base"
          >
            学習をはじめる 🚀
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-200 hover:scale-[1.02]"
            style={{ backgroundColor: "var(--color-card)", color: "var(--color-text-muted)", boxShadow: "var(--color-card-shadow)" }}
          >
            📊 チーム状況
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="p-5 rounded-2xl" style={{ backgroundColor: "var(--color-card)", boxShadow: "var(--color-card-shadow)" }}>
            <p className="text-sm mb-1 font-semibold" style={{ color: "var(--color-text-muted)" }}>完了モジュール</p>
            <p className="text-3xl font-extrabold" style={{ color: "var(--color-text-heading)" }}>
              {completedCount} <span className="text-sm font-normal" style={{ color: "var(--color-text-disabled)" }}>/ {TOTAL_MODULES}</span>
            </p>
            <div className="mt-3 h-3 rounded-full" style={{ backgroundColor: "var(--color-border)" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  backgroundColor: "var(--color-green)",
                  width: `${Math.min((completedCount / TOTAL_MODULES) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
          <div className="p-5 rounded-2xl" style={{ backgroundColor: "var(--color-card)", boxShadow: "var(--color-card-shadow)" }}>
            <p className="text-sm mb-1 font-semibold" style={{ color: "var(--color-text-muted)" }}>獲得XP</p>
            <p className="text-3xl font-extrabold" style={{ color: "var(--color-yellow)" }}>
              <span className="text-lg mr-1">⭐</span>{xp}
            </p>
          </div>
          <div className="p-5 rounded-2xl" style={{ backgroundColor: "var(--color-card)", boxShadow: "var(--color-card-shadow)" }}>
            <p className="text-sm mb-1 font-semibold" style={{ color: "var(--color-text-muted)" }}>レベル</p>
            <p className="text-3xl font-extrabold" style={{ color: "var(--color-green)" }}>Lv. {level}</p>
            <div className="mt-3 h-3 rounded-full" style={{ backgroundColor: "var(--color-border)" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ backgroundColor: "var(--color-green)", width: `${levelProgress}%` }}
              />
            </div>
          </div>
          <div className="p-5 rounded-2xl" style={{ backgroundColor: "var(--color-card)", boxShadow: "var(--color-card-shadow)" }}>
            <p className="text-sm mb-1 font-semibold" style={{ color: "var(--color-text-muted)" }}>今週の目標</p>
            <p className="text-3xl font-extrabold" style={{ color: "var(--color-text-heading)" }}>
              {weeklyCount} <span className="text-sm font-normal" style={{ color: "var(--color-text-disabled)" }}>/ {WEEKLY_GOAL}</span>
            </p>
            <div className="mt-3 flex gap-1.5">
              {Array.from({ length: WEEKLY_GOAL }).map((_, i) => (
                <div
                  key={i}
                  className="h-3 flex-1 rounded-full transition-all duration-300"
                  style={{ backgroundColor: i < weeklyCount ? "var(--color-green)" : "var(--color-border)" }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Skill radar */}
        {skillData.length > 0 && (
          <div className="mb-10 p-6 rounded-2xl" style={{ backgroundColor: "var(--color-card)", boxShadow: "var(--color-card-shadow)" }}>
            <h2 className="text-lg font-bold mb-2" style={{ color: "var(--color-text-heading)" }}>🎯 スキルマップ</h2>
            <p className="text-xs mb-4" style={{ color: "var(--color-text-muted)" }}>カテゴリ別の学習完了率</p>
            <SkillRadar data={skillData} />
          </div>
        )}

        {/* Badges */}
        <div className="mb-10 p-6 rounded-2xl" style={{ backgroundColor: "var(--color-card)", boxShadow: "var(--color-card-shadow)" }}>
          <BadgeShowcase earnedBadgeIds={earnedBadgeIds} />
        </div>

        {/* Recent modules */}
        {recentModules.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-bold mb-4" style={{ color: "var(--color-text-heading)" }}>📚 最近学習したモジュール</h2>
            <div className="space-y-2">
              {recentModules.map((mod) => {
                const [catId, modId] = mod.id.split("--");
                const moduleName = resolveModuleName(mod.id, categoryMap);
                return (
                  <Link
                    key={mod.id}
                    href={`/curriculum/${catId}/${modId}`}
                    className="flex items-center justify-between p-4 rounded-2xl transition-all duration-200 hover:scale-[1.01]"
                    style={{ backgroundColor: "var(--color-card)", boxShadow: "var(--color-card-shadow)" }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                        style={{ backgroundColor: "var(--color-green-bg)", color: "var(--color-green)" }}
                      >
                        ✓
                      </span>
                      <span className="text-sm font-semibold" style={{ color: "var(--color-text-heading)" }}>{moduleName}</span>
                    </div>
                    <span
                      className="text-xs px-3 py-1 rounded-full font-bold"
                      style={{ backgroundColor: "var(--color-green-bg)", color: "var(--color-green)" }}
                    >
                      完了
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Team leaderboard */}
        {topMembers.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: "var(--color-text-heading)" }}>🏆 チームランキング</h2>
              <Link href="/admin" className="text-xs font-bold transition-opacity hover:opacity-80" style={{ color: "var(--color-blue)" }}>
                全員を見る &rarr;
              </Link>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--color-card)", boxShadow: "var(--color-card-shadow)" }}>
              {topMembers.map((member, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-5 py-4 border-b-2 last:border-b-0"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold"
                      style={{
                        backgroundColor: i === 0 ? "var(--color-yellow-bg)" : i === 1 ? "var(--color-blue-bg)" : i === 2 ? "var(--color-orange-bg)" : "var(--color-card)",
                        color: i === 0 ? "var(--color-yellow)" : i === 1 ? "var(--color-blue)" : i === 2 ? "var(--color-orange)" : "var(--color-text-disabled)",
                        border: i < 3 ? `2px solid ${i === 0 ? "var(--color-yellow)" : i === 1 ? "var(--color-blue)" : "var(--color-orange)"}` : "none",
                      }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm font-bold" style={{ color: "var(--color-text-heading)" }}>{member.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>{member.completedCount} 完了</span>
                    <span className="text-xs font-bold" style={{ color: "var(--color-green)" }}>Lv.{member.level}</span>
                    <span className="text-sm font-extrabold" style={{ color: "var(--color-yellow)" }}>⭐ {member.xp.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
