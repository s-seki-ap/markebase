import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getLeaderboard, type LeaderboardEntry } from "@/lib/progress";
import AdminFilters from "./AdminFilters";

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

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session && !isDevBypass) {
    redirect("/auth/signin");
  }
  if (!isAdmin(session?.user?.email)) {
    redirect("/");
  }

  let leaderboard: LeaderboardEntry[] = [];
  try {
    leaderboard = await getLeaderboard();
  } catch {
    // Firestore未設定時は空
  }

  const totalXP = leaderboard.reduce((sum, e) => sum + e.xp, 0);
  const totalCompleted = leaderboard.reduce((sum, e) => sum + e.completedCount, 0);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const activeMembers = leaderboard.filter((e) => new Date(e.lastActiveDate) >= weekAgo).length;
  const inactiveMembers = leaderboard.filter((e) => new Date(e.lastActiveDate) < weekAgo);

  const departments = Array.from(new Set(leaderboard.map((e) => e.department).filter(Boolean))) as string[];

  return (
    <main className="min-h-screen p-6 lg:p-8" style={{ backgroundColor: "var(--color-page)" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <Link href="/" className="text-sm font-bold transition-all hover:scale-105 mb-2 inline-block" style={{ color: "var(--color-text-muted)" }}>
              &larr; ダッシュボードに戻る
            </Link>
            <h1 className="text-2xl font-extrabold" style={{ color: "var(--color-text-heading)" }}>
              管理者ダッシュボード
            </h1>
          </div>
          <a
            href="/api/admin/export"
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
            style={{ backgroundColor: "var(--color-green)", color: "#fff" }}
          >
            CSV出力
          </a>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl" style={{ backgroundColor: "var(--color-card)", boxShadow: "var(--color-card-shadow)" }}>
            <p className="text-sm mb-1 font-semibold" style={{ color: "var(--color-text-muted)" }}>メンバー数</p>
            <p className="text-3xl font-extrabold" style={{ color: "var(--color-text-heading)" }}>{leaderboard.length}</p>
            <p className="text-xs mt-1 font-semibold" style={{ color: "var(--color-text-disabled)" }}>直近7日アクティブ: {activeMembers}</p>
          </div>
          <div className="p-5 rounded-2xl" style={{ backgroundColor: "var(--color-card)", boxShadow: "var(--color-card-shadow)" }}>
            <p className="text-sm mb-1 font-semibold" style={{ color: "var(--color-text-muted)" }}>チーム合計XP</p>
            <p className="text-3xl font-extrabold" style={{ color: "var(--color-yellow)" }}>⭐ {totalXP.toLocaleString()}</p>
          </div>
          <div className="p-5 rounded-2xl" style={{ backgroundColor: "var(--color-card)", boxShadow: "var(--color-card-shadow)" }}>
            <p className="text-sm mb-1 font-semibold" style={{ color: "var(--color-text-muted)" }}>合計完了モジュール</p>
            <p className="text-3xl font-extrabold" style={{ color: "var(--color-green)" }}>{totalCompleted}</p>
          </div>
          <div className="p-5 rounded-2xl" style={{ backgroundColor: "var(--color-card)", boxShadow: "var(--color-card-shadow)" }}>
            <p className="text-sm mb-1 font-semibold" style={{ color: "var(--color-text-muted)" }}>平均完了数</p>
            <p className="text-3xl font-extrabold" style={{ color: "var(--color-blue)" }}>
              {leaderboard.length > 0 ? Math.round(totalCompleted / leaderboard.length) : 0}
            </p>
            <p className="text-xs mt-1 font-semibold" style={{ color: "var(--color-text-disabled)" }}>1人あたり</p>
          </div>
        </div>

        {/* Inactive alert */}
        {inactiveMembers.length > 0 && (
          <div className="p-4 rounded-2xl mb-8 border-2" style={{ backgroundColor: "rgba(251,191,36,0.08)", borderColor: "var(--color-yellow)" }}>
            <p className="font-bold mb-2" style={{ color: "var(--color-yellow)" }}>
              ⚠ 7日以上学習していないメンバー ({inactiveMembers.length}名)
            </p>
            <div className="flex flex-wrap gap-2">
              {inactiveMembers.map((m) => (
                <span key={m.userId} className="text-xs px-3 py-1 rounded-full font-semibold" style={{ backgroundColor: "rgba(251,191,36,0.15)", color: "var(--color-yellow)" }}>
                  {m.name} (最終: {formatDate(m.lastActiveDate)})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Department stats */}
        {departments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-extrabold mb-4" style={{ color: "var(--color-text-heading)" }}>部門別サマリー</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.map((dept) => {
                const members = leaderboard.filter((e) => e.department === dept);
                const deptCompleted = members.reduce((s, m) => s + m.completedCount, 0);
                const deptActive = members.filter((m) => new Date(m.lastActiveDate) >= weekAgo).length;
                return (
                  <div key={dept} className="p-4 rounded-2xl" style={{ backgroundColor: "var(--color-card)", boxShadow: "var(--color-card-shadow)" }}>
                    <p className="font-bold text-sm mb-2" style={{ color: "var(--color-text-heading)" }}>{dept}</p>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: "var(--color-text-muted)" }}>{members.length}名</span>
                      <span style={{ color: "var(--color-green)" }}>{deptCompleted}モジュール</span>
                      <span style={{ color: "var(--color-blue)" }}>アクティブ{deptActive}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Leaderboard with filters */}
        <AdminFilters leaderboard={leaderboard} departments={departments} />
      </div>
    </main>
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
