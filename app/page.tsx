import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getUser, getUserProgress, getWeeklyCompletedCount, getRecentModules, getLeaderboard } from "@/lib/progress";
import { getCategories, isModuleAvailable } from "@/lib/curriculum";
import SkillRadar from "@/components/SkillRadar";
import ThemeToggle from "@/components/ThemeToggle";

const isDevBypass = !process.env.GOOGLE_CLIENT_ID;
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
  const userEmail = session?.user?.email ?? null;
  const userImage = session?.user?.image ?? null;

  // Firestore からデータ取得（接続不可時はフォールバック）
  let user: Awaited<ReturnType<typeof getUser>> = null;
  let completedCount = 0;
  let weeklyCount = 0;
  let recentModules: Array<{ id: string; completedAt: FirebaseFirestore.Timestamp }> = [];
  let progress: Record<string, { completedAt: FirebaseFirestore.Timestamp; quizScore: number | null; xpEarned: number }> = {};

  try {
    user = userId ? await getUser(userId) : null;
  } catch {
    // Firestore未接続時はnull
  }

  // オンボーディング未完了 → リダイレクト（Firestore接続時のみ）
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
    } catch {
      // Firestore未接続時はデフォルト値
    }
  }

  const xp = user?.xp ?? 0;
  const level = user?.level ?? 1;
  const streak = user?.streak ?? 0;

  // チームリーダーボード（上位5名）
  let topMembers: Array<{ name: string; xp: number; level: number; completedCount: number }> = [];
  try {
    const lb = await getLeaderboard();
    topMembers = lb.slice(0, 5).map((e) => ({
      name: e.name,
      xp: e.xp,
      level: e.level,
      completedCount: e.completedCount,
    }));
  } catch {
    // Firestore未設定時は空
  }

  // モジュール名解決用のマップ
  const categories = getCategories();
  const categoryMap = new Map<string, Map<string, string>>();
  for (const cat of categories) {
    const modMap = new Map<string, string>();
    for (const mod of cat.modules) {
      modMap.set(mod.id, mod.name);
    }
    categoryMap.set(cat.id, modMap);
  }

  // カテゴリ別完了率（スキルレーダー用）
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

  // レベル進捗の計算
  const levelThresholds = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250];
  const currentThreshold = levelThresholds[level - 1] ?? 0;
  const nextThreshold = levelThresholds[level] ?? currentThreshold + 500;
  const levelProgress = nextThreshold > currentThreshold
    ? Math.min(((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100, 100)
    : 100;

  return (
    <main className="min-h-screen p-8" style={{ backgroundColor: "var(--color-page)" }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold"
              style={{ backgroundColor: "var(--color-blue)", color: "#ffffff" }}
            >
              M
            </div>
            <span className="text-xl font-bold" style={{ color: "var(--color-text-heading)" }}>MarkeBase</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {streak > 0 && (
              <span className="text-sm px-3 py-1 rounded-full" style={{ backgroundColor: "var(--color-orange-bg)", color: "var(--color-orange)" }}>
                {streak}日連続
              </span>
            )}
            <div className="text-right">
              <p className="text-sm font-medium" style={{ color: "var(--color-text-heading)" }}>{userName}</p>
              {userEmail && <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{userEmail}</p>}
            </div>
            {userImage ? (
              <Image
                src={userImage}
                alt="avatar"
                width={36}
                height={36}
                className="w-9 h-9 rounded-full"
              />
            ) : (
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: "var(--color-border-strong)", color: "#ffffff" }}
              >
                {userName[0]}
              </div>
            )}
          </div>
        </div>

        {/* Welcome + Streak celebration */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--color-text-heading)" }}>
            おかえりなさい、{userName.split(" ")[0]}さん
          </h1>
          {weeklyCount >= WEEKLY_GOAL ? (
            <p style={{ color: "var(--color-green)" }} className="font-medium">
              今週の目標達成！素晴らしい！次の目標に挑戦しましょう。
            </p>
          ) : (
            <p style={{ color: "var(--color-text-muted)" }}>
              学習を続けましょう。今日も1モジュール進めてみませんか？
            </p>
          )}
        </div>

        {/* Streak banner */}
        {streak >= 3 && (
          <div
            className="flex items-center gap-4 p-4 rounded-xl mb-6"
            style={{ backgroundColor: "var(--color-orange-bg)", border: "1px solid var(--color-orange)" }}
          >
            <span className="text-3xl">{streak >= 7 ? "\uD83D\uDD25" : "\u2B50"}</span>
            <div>
              <p className="font-semibold" style={{ color: "var(--color-text-heading)" }}>{streak}日連続学習中！</p>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                {streak >= 7
                  ? "1週間以上の連続記録。この調子で続けましょう！"
                  : `あと${7 - streak}日で1週間達成です。`}
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="p-5 rounded-xl" style={{ backgroundColor: "var(--color-card)", boxShadow: "var(--color-card-shadow)" }}>
            <p className="text-sm mb-1" style={{ color: "var(--color-text-muted)" }}>完了モジュール</p>
            <p className="text-2xl font-bold" style={{ color: "var(--color-text-heading)" }}>
              {completedCount} <span className="text-sm font-normal" style={{ color: "var(--color-text-disabled)" }}>/ {TOTAL_MODULES}</span>
            </p>
            <div className="mt-2 h-1.5 rounded-full" style={{ backgroundColor: "var(--color-border)" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  backgroundColor: "var(--color-green)",
                  width: `${Math.min((completedCount / TOTAL_MODULES) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
          <div className="p-5 rounded-xl" style={{ backgroundColor: "var(--color-card)", boxShadow: "var(--color-card-shadow)" }}>
            <p className="text-sm mb-1" style={{ color: "var(--color-text-muted)" }}>獲得XP</p>
            <p className="text-2xl font-bold" style={{ color: "var(--color-yellow)" }}>{xp} XP</p>
          </div>
          <div className="p-5 rounded-xl" style={{ backgroundColor: "var(--color-card)", boxShadow: "var(--color-card-shadow)" }}>
            <p className="text-sm mb-1" style={{ color: "var(--color-text-muted)" }}>レベル</p>
            <p className="text-2xl font-bold" style={{ color: "var(--color-green)" }}>Lv. {level}</p>
            <div className="mt-2 h-1.5 rounded-full" style={{ backgroundColor: "var(--color-border)" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ backgroundColor: "var(--color-green)", width: `${levelProgress}%` }}
              />
            </div>
          </div>
          <div className="p-5 rounded-xl" style={{ backgroundColor: "var(--color-card)", boxShadow: "var(--color-card-shadow)" }}>
            <p className="text-sm mb-1" style={{ color: "var(--color-text-muted)" }}>今週の目標</p>
            <p className="text-2xl font-bold" style={{ color: "var(--color-text-heading)" }}>
              {weeklyCount} <span className="text-sm font-normal" style={{ color: "var(--color-text-disabled)" }}>/ {WEEKLY_GOAL}</span>
            </p>
            <div className="mt-2 flex gap-1">
              {Array.from({ length: WEEKLY_GOAL }).map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 flex-1 rounded-full"
                  style={{ backgroundColor: i < weeklyCount ? "var(--color-green)" : "var(--color-border)" }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Skill radar */}
        {skillData.length > 0 && completedCount > 0 && (
          <div className="mb-10 p-6 rounded-xl" style={{ backgroundColor: "var(--color-card)", boxShadow: "var(--color-card-shadow)" }}>
            <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--color-text-heading)" }}>スキルマップ</h2>
            <p className="text-xs mb-4" style={{ color: "var(--color-text-muted)" }}>カテゴリ別の学習完了率</p>
            <SkillRadar data={skillData} />
          </div>
        )}

        {/* Recent modules */}
        {recentModules.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--color-text-heading)" }}>最近学習したモジュール</h2>
            <div className="space-y-2">
              {recentModules.map((mod) => {
                const [catId, modId] = mod.id.split("--");
                const moduleName = resolveModuleName(mod.id, categoryMap);
                return (
                  <Link
                    key={mod.id}
                    href={`/curriculum/${catId}/${modId}`}
                    className="flex items-center justify-between p-4 rounded-xl transition-colors hover:opacity-90"
                    style={{ backgroundColor: "var(--color-card)", boxShadow: "var(--color-card-shadow)" }}
                  >
                    <div className="flex items-center gap-3">
                      <span style={{ color: "var(--color-green)" }}>&#10003;</span>
                      <span className="text-sm" style={{ color: "var(--color-text-heading)" }}>{moduleName}</span>
                    </div>
                    <span className="text-xs" style={{ color: "var(--color-text-disabled)" }}>完了</span>
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
              <h2 className="text-lg font-semibold" style={{ color: "var(--color-text-heading)" }}>チームランキング</h2>
              <Link href="/admin" className="text-xs hover:opacity-80 transition-opacity" style={{ color: "var(--color-text-muted)" }}>
                全員を見る &rarr;
              </Link>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "var(--color-card)", boxShadow: "var(--color-card-shadow)" }}>
              {topMembers.map((member, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-5 py-3 border-b last:border-b-0"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center text-sm font-bold" style={{ color: i === 0 ? "var(--color-yellow)" : i === 1 ? "var(--color-text-muted)" : i === 2 ? "#b45309" : "var(--color-text-disabled)" }}>
                      {i + 1}
                    </span>
                    <span className="text-sm" style={{ color: "var(--color-text-heading)" }}>{member.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{member.completedCount} 完了</span>
                    <span className="text-xs" style={{ color: "var(--color-green)" }}>Lv.{member.level}</span>
                    <span className="text-sm font-medium" style={{ color: "var(--color-yellow)" }}>{member.xp.toLocaleString()} XP</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="flex gap-4">
          <Link
            href="/curriculum"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--color-blue)", color: "#ffffff" }}
          >
            カリキュラムマップを見る
            <span>&rarr;</span>
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-6 py-4 rounded-xl font-medium text-sm transition-opacity hover:opacity-80"
            style={{ backgroundColor: "var(--color-card)", color: "var(--color-text-muted)", boxShadow: "var(--color-card-shadow)" }}
          >
            チーム学習状況
          </Link>
        </div>
      </div>
    </main>
  );
}
