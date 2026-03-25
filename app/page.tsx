import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

// 開発時: GOOGLE_CLIENT_IDが未設定なら認証スキップ

const isDevBypass =
  process.env.NODE_ENV !== "production" && !process.env.GOOGLE_CLIENT_ID;

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session && !isDevBypass) {
    redirect("/auth/signin");
  }

  const userName = session?.user?.name ?? "ゲスト";
  const userEmail = session?.user?.email ?? null;
  const userImage = session?.user?.image ?? null;

  return (
    <main className="min-h-screen p-8" style={{ backgroundColor: "#0f172a" }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xl font-bold"
              style={{ backgroundColor: "#3b82f6" }}
            >
              M
            </div>
            <span className="text-xl font-bold text-white">MarkeBase</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-white font-medium">{userName}</p>
              {userEmail && <p className="text-xs text-slate-400">{userEmail}</p>}
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
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: "#475569" }}
              >
                {userName[0]}
              </div>
            )}
          </div>
        </div>

        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            おかえりなさい、{userName.split(" ")[0]}さん 👋
          </h1>
          <p className="text-slate-400">学習を続けましょう。今日も1モジュール進めてみませんか？</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="p-5 rounded-xl" style={{ backgroundColor: "#1e293b" }}>
            <p className="text-slate-400 text-sm mb-1">完了モジュール</p>
            <p className="text-2xl font-bold text-white">0 <span className="text-sm text-slate-500 font-normal">/ 64</span></p>
          </div>
          <div className="p-5 rounded-xl" style={{ backgroundColor: "#1e293b" }}>
            <p className="text-slate-400 text-sm mb-1">獲得XP</p>
            <p className="text-2xl font-bold" style={{ color: "#fbbf24" }}>0 XP</p>
          </div>
          <div className="p-5 rounded-xl" style={{ backgroundColor: "#1e293b" }}>
            <p className="text-slate-400 text-sm mb-1">現在のレベル</p>
            <p className="text-2xl font-bold" style={{ color: "#10b981" }}>Lv. 1</p>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/curriculum"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-lg transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#3b82f6" }}
        >
          📚 カリキュラムマップを見る
          <span>→</span>
        </Link>
      </div>
    </main>
  );
}
