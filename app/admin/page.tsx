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
    <main className="min-h-screen p-8" style={{ backgroundColor: "#0f172a" }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <Link href="/" className="text-slate-400 text-sm hover:text-white transition-colors mb-2 inline-block">
              &larr; ダッシュボードに戻る
            </Link>
            <h1 className="text-2xl font-bold text-white">チーム学習状況</h1>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="p-5 rounded-xl" style={{ backgroundColor: "#1e293b" }}>
            <p className="text-slate-400 text-sm mb-1">メンバー数</p>
            <p className="text-2xl font-bold text-white">{leaderboard.length}</p>
            <p className="text-xs text-slate-500 mt-1">直近7日アクティブ: {activeMembers}</p>
          </div>
          <div className="p-5 rounded-xl" style={{ backgroundColor: "#1e293b" }}>
            <p className="text-slate-400 text-sm mb-1">チーム合計XP</p>
            <p className="text-2xl font-bold" style={{ color: "#fbbf24" }}>{totalXP.toLocaleString()}</p>
          </div>
          <div className="p-5 rounded-xl" style={{ backgroundColor: "#1e293b" }}>
            <p className="text-slate-400 text-sm mb-1">合計完了モジュール</p>
            <p className="text-2xl font-bold" style={{ color: "#10b981" }}>{totalCompleted}</p>
          </div>
        </div>

        {/* Leaderboard table */}
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#1e293b" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#0f172a" }}>
                <th className="text-left text-slate-400 font-medium px-6 py-4">#</th>
                <th className="text-left text-slate-400 font-medium px-6 py-4">名前</th>
                <th className="text-left text-slate-400 font-medium px-6 py-4">メール</th>
                <th className="text-right text-slate-400 font-medium px-6 py-4">完了</th>
                <th className="text-right text-slate-400 font-medium px-6 py-4">XP</th>
                <th className="text-right text-slate-400 font-medium px-6 py-4">レベル</th>
                <th className="text-right text-slate-400 font-medium px-6 py-4">最終学習日</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-slate-500 py-12">
                    まだメンバーの学習データがありません
                  </td>
                </tr>
              ) : (
                leaderboard.map((entry, i) => (
                  <tr
                    key={entry.userId}
                    className="border-t"
                    style={{ borderColor: "#334155" }}
                  >
                    <td className="px-6 py-4 text-slate-500">{i + 1}</td>
                    <td className="px-6 py-4 text-white font-medium">{entry.name}</td>
                    <td className="px-6 py-4 text-slate-400">{entry.email}</td>
                    <td className="px-6 py-4 text-right text-white">{entry.completedCount}</td>
                    <td className="px-6 py-4 text-right font-medium" style={{ color: "#fbbf24" }}>
                      {entry.xp.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right" style={{ color: "#10b981" }}>
                      Lv.{entry.level}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-400">
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
