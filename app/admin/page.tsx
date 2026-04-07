import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getLeaderboard, type LeaderboardEntry } from "@/lib/progress";

const isDevBypass = !process.env.GOOGLE_CLIENT_ID;

function isAdmin(email: string | null | undefined): boolean {
  if (isDevBypass) return true;
  if (!email) return false;

  const adminEmails = process.env.ADMIN_EMAILS ?? "";
  const allowed = adminEmails.split(",").map((e) => e.trim()).filter(Boolean);

  // メールアドレスの完全一致、またはドメイン一致
  return allowed.some((a) => {
    if (a.startsWith("@")) return email.endsWith(a);
    return email === a;
  });
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
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
  const activeMembers = leaderboard.filter((e) => {
    const last = new Date(e.lastActiveDate);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return last >= weekAgo;
  }).length;

  return (
    <main className="min-h-screen p-8" style={{ backgroundColor: "var(--color-page)" }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <Link href="/" className="text-sm transition-opacity hover:opacity-80 mb-2 inline-block" style={{ color: "var(--color-text-muted)" }}>
              &larr; ダッシュボードに戻る
            </Link>
            <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-heading)" }}>チーム学習状況</h1>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="p-5 rounded-xl" style={{ backgroundColor: "var(--color-card)", boxShadow: "var(--color-card-shadow)" }}>
            <p className="text-sm mb-1" style={{ color: "var(--color-text-muted)" }}>メンバー数</p>
            <p className="text-2xl font-bold" style={{ color: "var(--color-text-heading)" }}>{leaderboard.length}</p>
            <p className="text-xs mt-1" style={{ color: "var(--color-text-disabled)" }}>直近7日アクティブ: {activeMembers}</p>
          </div>
          <div className="p-5 rounded-xl" style={{ backgroundColor: "var(--color-card)", boxShadow: "var(--color-card-shadow)" }}>
            <p className="text-sm mb-1" style={{ color: "var(--color-text-muted)" }}>チーム合計XP</p>
            <p className="text-2xl font-bold" style={{ color: "var(--color-yellow)" }}>{totalXP.toLocaleString()}</p>
          </div>
          <div className="p-5 rounded-xl" style={{ backgroundColor: "var(--color-card)", boxShadow: "var(--color-card-shadow)" }}>
            <p className="text-sm mb-1" style={{ color: "var(--color-text-muted)" }}>合計完了モジュール</p>
            <p className="text-2xl font-bold" style={{ color: "var(--color-green)" }}>{totalCompleted}</p>
          </div>
        </div>

        {/* Leaderboard table */}
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "var(--color-card)", boxShadow: "var(--color-card-shadow)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "var(--color-page)" }}>
                <th className="text-left font-medium px-6 py-4" style={{ color: "var(--color-text-muted)" }}>#</th>
                <th className="text-left font-medium px-6 py-4" style={{ color: "var(--color-text-muted)" }}>名前</th>
                <th className="text-left font-medium px-6 py-4" style={{ color: "var(--color-text-muted)" }}>メール</th>
                <th className="text-right font-medium px-6 py-4" style={{ color: "var(--color-text-muted)" }}>完了</th>
                <th className="text-right font-medium px-6 py-4" style={{ color: "var(--color-text-muted)" }}>XP</th>
                <th className="text-right font-medium px-6 py-4" style={{ color: "var(--color-text-muted)" }}>レベル</th>
                <th className="text-right font-medium px-6 py-4" style={{ color: "var(--color-text-muted)" }}>最終学習日</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12" style={{ color: "var(--color-text-disabled)" }}>
                    まだメンバーの学習データがありません
                  </td>
                </tr>
              ) : (
                leaderboard.map((entry, i) => (
                  <tr
                    key={entry.userId}
                    className="border-t"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <td className="px-6 py-4" style={{ color: "var(--color-text-disabled)" }}>{i + 1}</td>
                    <td className="px-6 py-4 font-medium" style={{ color: "var(--color-text-heading)" }}>{entry.name}</td>
                    <td className="px-6 py-4" style={{ color: "var(--color-text-muted)" }}>{entry.email}</td>
                    <td className="px-6 py-4 text-right" style={{ color: "var(--color-text-heading)" }}>{entry.completedCount}</td>
                    <td className="px-6 py-4 text-right font-medium" style={{ color: "var(--color-yellow)" }}>
                      {entry.xp.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right" style={{ color: "var(--color-green)" }}>
                      Lv.{entry.level}
                    </td>
                    <td className="px-6 py-4 text-right" style={{ color: "var(--color-text-muted)" }}>
                      {formatDate(entry.lastActiveDate)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
